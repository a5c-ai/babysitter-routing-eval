import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const execFileP = promisify(execFile);
const workspaceDir = path.resolve(import.meta.dirname, '..');

function jsonFrom(stdout) {
  const start = stdout.indexOf('{');
  if (start < 0) throw new Error(`expected JSON output: ${stdout.slice(-500)}`);
  return JSON.parse(stdout.slice(start));
}

async function allFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? allFiles(target) : [target];
  }));
  return nested.flat();
}

test('provider driver journals one judge-only task through an HTTP adapter', { timeout: 60_000 }, async () => {
  const manifestPath = path.join(workspaceDir, 'out', 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const taskId = manifest.tasks[0].id;
  let calls = 0;
  let requestBody;

  const server = createServer(async (request, response) => {
    calls++;
    assert.equal(request.method, 'POST');
    assert.equal(request.headers.authorization, 'Bearer integration-secret');
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    requestBody = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    const judgment = {
      taskId,
      benefit: Object.fromEntries(['B1', 'B3', 'B5', 'B6', 'B8'].map((key) => [key, { score: 0, evidence: 'none' }])),
      cost: Object.fromEntries(['C2', 'C4'].map((key) => [key, { score: 0, evidence: 'none' }])),
      vanilla_failure_mode: 'none identified',
      counterfactual_empty: true,
      top_benefit_driver: 'B1',
      top_cost_driver: 'C2',
      process_recommendation: 'custom',
      rationale: 'mock integration judgment',
      missing_information: [],
    };
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({
      id: 'mock-request', model: 'mock-model',
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(judgment) } }],
      usage: { total_tokens: 1 },
    }));
  });

  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'provider-driver-'));
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const { port } = server.address();
    const configPath = path.join(tempDir, 'providers.json');
    const inputsPath = path.join(tempDir, 'inputs.json');
    const runsDir = path.join(tempDir, 'runs');
    await writeFile(configPath, JSON.stringify({
      maxRetries: 0,
      timeoutMs: 10_000,
      providers: {
        mock: {
          adapter: 'openai-chat',
          baseUrl: `http://127.0.0.1:${port}`,
          endpoint: 'chat/completions',
          apiKeyEnv: 'MOCK_API_KEY',
        },
      },
      models: [{ id: 'mock-judge', provider: 'mock', model: 'mock-model', concurrency: 1 }],
    }));
    await writeFile(inputsPath, JSON.stringify({
      workspaceDir, manifestPath, modelId: 'mock-judge', taskIds: [taskId], chunkSize: 1,
    }));

    const createdResult = await execFileP('npx', [
      'babysitter', 'run:create', '--runs-dir', runsDir,
      '--process-id', 'tb/judge-corpus',
      '--entry', `${workspaceDir}/.a5c/processes/tb-judge-corpus.js#process`,
      '--inputs', inputsPath,
      '--run-id', 'integration-test',
      '--harness', 'provider-api', '--non-interactive', '--json',
    ], { cwd: workspaceDir, maxBuffer: 16 * 1024 * 1024 });
    const runDir = jsonFrom(createdResult.stdout).runDir;

    await execFileP(process.execPath, [
      path.join(workspaceDir, 'scripts', 'drive-run.mjs'), runDir,
      '--concurrency', '1', '--max-iterations', '20',
      '--provider-config', configPath, '--model-id', 'mock-judge',
    ], {
      cwd: workspaceDir,
      env: { ...process.env, MOCK_API_KEY: 'integration-secret' },
      maxBuffer: 32 * 1024 * 1024,
    });

    const statusResult = await execFileP(
      'npx', ['babysitter', 'run:status', runDir, '--json'],
      { cwd: workspaceDir, maxBuffer: 16 * 1024 * 1024 },
    );
    assert.equal(jsonFrom(statusResult.stdout).state, 'completed');
    assert.equal(calls, 1);
    assert.equal(requestBody.model, 'mock-model');
    assert.equal(requestBody.response_format.type, 'json_schema');

    const taskDirs = await readdir(path.join(runDir, 'tasks'));
    const results = [];
    for (const taskDir of taskDirs) {
      try {
        results.push(JSON.parse(await readFile(path.join(runDir, 'tasks', taskDir, 'result.json'), 'utf8')));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    const judgment = results.map((result) => result.value ?? result).find((value) => value.taskId === taskId);
    assert.equal(judgment.rationale, 'mock integration judgment');
    const journalText = (await Promise.all(
      (await allFiles(runDir)).map((file) => readFile(file, 'utf8').catch(() => '')),
    )).join('\n');
    assert.equal(journalText.includes('integration-secret'), false);
    assert.match(journalText, /"provider"\s*:\s*"mock"/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(tempDir, { recursive: true });
  }
});
