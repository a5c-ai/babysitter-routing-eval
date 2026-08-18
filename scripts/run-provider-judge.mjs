#!/usr/bin/env node

import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildProviderRequest, loadProviderConfig, selectModels } from './provider-client.mjs';

const execFileP = promisify(execFile);
const args = process.argv.slice(2);
const configPath = args[0];
const modelId = args[1];
if (!configPath || !modelId) {
  throw new Error('usage: node scripts/run-provider-judge.mjs <config.json> <model-id> [--concurrency N] [--run-id ID] [--out-dir DIR]');
}
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : fallback;
};
const workspaceDir = process.cwd();
const config = await loadProviderConfig(configPath);
const model = selectModels(config, [modelId])[0];
const concurrency = Number(flag('concurrency', model.concurrency ?? 4));
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 32) {
  throw new Error('concurrency must be an integer from 1 to 32');
}
const runId = flag('run-id', `provider-${model.id}-${Date.now()}`);
if (!/^[A-Za-z0-9._-]+$/.test(runId)) throw new Error('run-id contains unsupported characters');
const outputDir = path.resolve(flag('out-dir', path.join('out', 'provider-judges', model.id)));
const runsDir = path.join(outputDir, 'runs');
const manifestPath = path.join(workspaceDir, 'out', 'manifest.json');
const inputsPath = path.join(outputDir, 'judge-inputs.json');
await mkdir(runsDir, { recursive: true });

// Resolve only the selected model's URL and credential environment before creating a run.
// The returned request is intentionally discarded so no secret-bearing headers are logged.
buildProviderRequest({
  config,
  model,
  prompt: 'configuration check',
  schema: { type: 'object', properties: {}, required: [] },
});

await writeFile(
  inputsPath,
  JSON.stringify({
    workspaceDir,
    manifestPath,
    chunkSize: concurrency,
    model: model.model,
    modelId: model.id,
  }, null, 2),
);

function parseJsonOutput(stdout) {
  const start = stdout.indexOf('{');
  if (start < 0) throw new Error(`expected JSON output, received: ${stdout.slice(-500)}`);
  return JSON.parse(stdout.slice(start));
}

function run(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { cwd: workspaceDir, stdio: 'inherit', env: process.env });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with status ${code}`));
    });
  });
}

const create = await execFileP(
  'npx',
  [
    'babysitter',
    'run:create',
    '--runs-dir', runsDir,
    '--process-id', 'tb/judge-corpus',
    '--entry', `${workspaceDir}/.a5c/processes/tb-judge-corpus.js#process`,
    '--inputs', inputsPath,
    '--run-id', runId,
    '--harness', 'provider-api',
    '--non-interactive',
    '--json',
  ],
  { cwd: workspaceDir, maxBuffer: 16 * 1024 * 1024 },
);
const created = parseJsonOutput(create.stdout);
const runDir = path.resolve(created.runDir ?? path.join(runsDir, runId));
process.stderr.write(`created ${model.id} judge run at ${runDir}\n`);

await run(process.execPath, [
  path.join(workspaceDir, 'scripts', 'drive-run.mjs'),
  runDir,
  '--concurrency', String(concurrency),
  '--provider-config', path.resolve(configPath),
  '--model-id', model.id,
]);

const statusResult = await execFileP(
  'npx',
  ['babysitter', 'run:status', runDir, '--json'],
  { cwd: workspaceDir, maxBuffer: 16 * 1024 * 1024 },
);
const status = parseJsonOutput(statusResult.stdout);
const finalState = status.status ?? status.state;
if (finalState !== 'completed') throw new Error(`judge run ended with status ${finalState}`);

const payloadPath = path.join(outputDir, 'payload.json');
await run(process.execPath, [
  path.join(workspaceDir, 'scripts', 'recompute-payload.mjs'),
  runDir,
  payloadPath,
  manifestPath,
  '--low', String(config.thresholds.low),
  '--high', String(config.thresholds.high),
]);
await run(process.execPath, [path.join(workspaceDir, 'scripts', 'build-report.mjs'), payloadPath, outputDir]);
await run(process.execPath, [
  path.join(workspaceDir, 'scripts', 'build-html-report.mjs'),
  payloadPath,
  path.join(outputDir, 'report.html'),
  manifestPath,
]);

const payload = JSON.parse(await readFile(payloadPath, 'utf8'));
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (payload.rows.length !== manifest.tasks.length) {
  throw new Error(`incomplete model vote: expected ${manifest.tasks.length} rows, got ${payload.rows.length}`);
}
const summary = {
  modelId: model.id,
  provider: model.provider,
  model: model.model,
  adapter: config.providers[model.provider].adapter,
  runId,
  judged: payload.rows.length,
  thresholds: config.thresholds,
};
await writeFile(path.join(outputDir, 'judge-run.json'), JSON.stringify(summary, null, 2));
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
