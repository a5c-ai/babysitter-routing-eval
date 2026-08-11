#!/usr/bin/env node
/**
 * Minimal Babysitter executor.
 *
 * The process code remains the authority: it decides what runs next, enforces ordering,
 * opens breakpoints and journals every effect. This script only does the part a harness
 * adapter normally does — take dispatched tasks, run them, post results back.
 *
 * Exists because `genty resume` routes its own resume-discovery step through agent-core,
 * which needs API credentials this machine does not have.
 *
 * Loop:  run:iterate -> execute pending effects -> task:post -> repeat
 *
 * Usage:
 *   node scripts/drive-run.mjs <runDir> [--concurrency 8] [--max-iterations 400]
 *                                       [--harness claude|codex]
 *                                       [--model <model-id>] [--effort high]
 *                                       [--auto-approve] [--stop-at-breakpoint]
 */

import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const execFileP = promisify(execFile);

const args = process.argv.slice(2);
const runDir = path.resolve(args[0]);
const flag = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
const has = (name) => args.includes(`--${name}`);

const CONCURRENCY = Number(flag('concurrency', 8));
const MAX_ITER = Number(flag('max-iterations', 400));
const AUTO_APPROVE = has('auto-approve');
const STOP_AT_BREAKPOINT = has('stop-at-breakpoint');
const MODEL = flag('model', null);
const EFFORT = flag('effort', null);
const HARNESS = flag('harness', 'claude');
const BABYSITTER = 'npx';
const BABY_ARGS = ['babysitter'];

const log = (...m) => console.error(`[drive ${new Date().toISOString().slice(11, 19)}]`, ...m);

async function babysitter(argv, opts = {}) {
  const { stdout } = await execFileP(BABYSITTER, [...BABY_ARGS, ...argv], {
    maxBuffer: 64 * 1024 * 1024,
    cwd: opts.cwd ?? process.cwd(),
  });
  return stdout;
}

function execCodex(argv) {
  return new Promise((resolve, reject) => {
    const child = spawn('codex', argv, { cwd: process.cwd() });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill('SIGTERM'), 900000);
    child.stdout.on('data', (data) => (stdout += data));
    child.stderr.on('data', (data) => (stderr += data));
    child.on('error', reject);
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`Codex CLI exited ${code}: ${(stderr + '\n' + stdout).slice(-4000)}`));
    });
    // codex exec probes stdin even when a prompt argument is present. An execFile-created
    // pipe stays open until explicitly ended, which otherwise blocks before model dispatch.
    child.stdin.end();
  });
}

async function iterate() {
  const out = await babysitter(['run:iterate', runDir, '--json']);
  const start = out.indexOf('{');
  return JSON.parse(out.slice(start));
}

async function post(effectId, status, value, extra = {}) {
  const argv = ['task:post', runDir, effectId, '--status', status, '--json'];
  if (status === 'ok') {
    const tmp = path.join('/tmp', `post-${effectId}.json`);
    await writeFile(tmp, JSON.stringify(value ?? {}));
    argv.push('--value', tmp);
  } else {
    const tmp = path.join('/tmp', `err-${effectId}.json`);
    await writeFile(tmp, JSON.stringify({ message: String(extra.error ?? 'failed') }));
    argv.push('--error', tmp);
  }
  if (extra.metadata) {
    const tmp = path.join('/tmp', `metadata-${effectId}.json`);
    await writeFile(tmp, JSON.stringify(extra.metadata));
    argv.push('--metadata', tmp);
  }
  await babysitter(argv);
}

// --- shell effects -------------------------------------------------------------------

async function runShell(action) {
  const def = action.taskDef;
  const wi = def.metadata?.writeInputTo;
  if (wi?.path) {
    await mkdir(path.dirname(wi.path), { recursive: true });
    await writeFile(wi.path, wi.json);
    log(`  wrote ${wi.path} (${wi.json.length} bytes)`);
  }

  const { command, cwd, expectedExitCode = 0 } = def.shell;
  return new Promise((resolve) => {
    const child = spawn('bash', ['-lc', command], { cwd: cwd ?? process.cwd() });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (code) => {
      resolve({
        ok: code === expectedExitCode,
        exitCode: code,
        stdout: stdout.slice(-20000),
        stderr: stderr.slice(-20000),
      });
    });
  });
}

// --- agent effects -------------------------------------------------------------------

function renderPrompt(def) {
  const p = def.agent?.prompt ?? {};
  const parts = [];
  if (p.role) parts.push(`You are a ${p.role}.`);
  if (p.task) parts.push(`## Task\n${p.task}`);
  if (p.context) {
    for (const [k, v] of Object.entries(p.context)) {
      parts.push(`## ${k}\n${typeof v === 'string' ? v : JSON.stringify(v, null, 2)}`);
    }
  }
  if (p.instructions?.length) {
    parts.push(`## Instructions\n${p.instructions.map((i) => `- ${i}`).join('\n')}`);
  }
  if (def.agent?.outputSchema) {
    parts.push(`## Output schema (JSON Schema — your output MUST validate)\n${JSON.stringify(def.agent.outputSchema, null, 2)}`);
  }
  parts.push(
    'Respond with ONLY a single JSON object. No markdown fences, no commentary before or after.',
  );
  return parts.join('\n\n');
}

/** Pull the first balanced JSON object out of a model response. */
function extractJson(text) {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence ? fence[1] : text;
  const start = body.indexOf('{');
  if (start < 0) throw new Error('no JSON object in response');
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < body.length; i++) {
    const c = body[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return JSON.parse(body.slice(start, i + 1));
  }
  throw new Error('unbalanced JSON in response');
}

/** Minimal JSON-Schema check for the subset the process uses. */
function validate(value, schema, pathStr = '$') {
  const errs = [];
  if (schema.type === 'object') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return [`${pathStr}: expected object`];
    }
    for (const req of schema.required ?? []) {
      if (!(req in value)) errs.push(`${pathStr}.${req}: missing`);
    }
    for (const [k, sub] of Object.entries(schema.properties ?? {})) {
      if (k in value) errs.push(...validate(value[k], sub, `${pathStr}.${k}`));
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(value)) return [`${pathStr}: expected array`];
    if (schema.items) value.forEach((v, i) => errs.push(...validate(v, schema.items, `${pathStr}[${i}]`)));
  } else if (schema.type === 'integer') {
    if (!Number.isInteger(value)) errs.push(`${pathStr}: expected integer, got ${JSON.stringify(value)}`);
    else if (schema.minimum != null && value < schema.minimum) errs.push(`${pathStr}: below minimum`);
    else if (schema.maximum != null && value > schema.maximum) errs.push(`${pathStr}: above maximum`);
  } else if (schema.type === 'string') {
    if (typeof value !== 'string') errs.push(`${pathStr}: expected string`);
  } else if (schema.type === 'boolean') {
    if (typeof value !== 'boolean') errs.push(`${pathStr}: expected boolean`);
  }
  return errs;
}

function strictOutputSchema(schema) {
  if (!schema || typeof schema !== 'object') return schema;
  if (schema.type === 'object') {
    const properties = Object.fromEntries(
      Object.entries(schema.properties ?? {}).map(([key, value]) => [key, strictOutputSchema(value)]),
    );
    return {
      ...schema,
      properties,
      required: Object.keys(properties),
      additionalProperties: false,
    };
  }
  if (schema.type === 'array') return { ...schema, items: strictOutputSchema(schema.items) };
  return schema;
}

async function runAgent(action, attempt = 0) {
  const def = action.taskDef;
  const prompt = renderPrompt(def);
  const model = def.execution?.model ?? MODEL;
  const effort = def.execution?.effort ?? EFFORT;

  try {
    if (HARNESS === 'codex') {
      const schemaPath = path.join('/tmp', `schema-${action.effectId}.json`);
      const outputPath = path.join('/tmp', `output-${action.effectId}.json`);
      const schema = def.agent?.outputSchema;
      if (schema) await writeFile(schemaPath, JSON.stringify(strictOutputSchema(schema)));

      const codexArgs = [
        'exec',
        '--ephemeral',
        '--ignore-user-config',
        '--ignore-rules',
        '--sandbox', 'read-only',
        '--json',
        '--output-last-message', outputPath,
      ];
      if (model) codexArgs.push('--model', model);
      if (schema) codexArgs.push('--output-schema', schemaPath);
      if (effort) codexArgs.push('-c', `model_reasoning_effort="${effort}"`);
      codexArgs.push(prompt);

      const { stdout } = await execCodex(codexArgs);
      const value = extractJson(await readFile(outputPath, 'utf8'));
      const events = stdout.trim().split('\n').flatMap((line) => {
        try { return [JSON.parse(line)]; } catch { return []; }
      });
      const usage = events.findLast((event) => event.type === 'turn.completed')?.usage ?? null;
      if (schema) {
        const errs = validate(value, schema);
        if (errs.length) {
          if (attempt < 2) {
            log(`  schema errors on ${action.effectId}, retry ${attempt + 1}: ${errs.slice(0, 3).join('; ')}`);
            return runAgent(action, attempt + 1);
          }
          return { __error: `schema validation failed: ${errs.slice(0, 5).join('; ')}` };
        }
      }
      log(`  model ${action.effectId}: ${model}`);
      return {
        __value: value,
        __metadata: {
          harness: 'codex',
          requestedModel: model,
          requestedEffort: effort,
          actualModels: model ? [model] : [],
          usage,
        },
      };
    }

    if (HARNESS !== 'claude') throw new Error(`unsupported harness: ${HARNESS}`);
    const claudeArgs = [
      '-p',
      '--output-format', 'json',
      '--no-session-persistence',
      '--tools', '',
      '--prompt-suggestions', 'false',
    ];
    if (model) claudeArgs.push('--model', model);
    if (effort) claudeArgs.push('--effort', effort);
    const schema = def.agent?.outputSchema;
    if (schema) claudeArgs.push('--json-schema', JSON.stringify(schema));
    claudeArgs.push(prompt);
    const { stdout } = await execFileP('claude', claudeArgs, {
      maxBuffer: 32 * 1024 * 1024,
      timeout: 900000,
    });
    const response = JSON.parse(stdout);
    if (response.is_error) throw new Error(response.result ?? 'Claude CLI returned an error');
    const value = response.structured_output ?? extractJson(response.result);
    if (schema) {
      const errs = validate(value, schema);
      if (errs.length) {
        if (attempt < 2) {
          log(`  schema errors on ${action.effectId}, retry ${attempt + 1}: ${errs.slice(0, 3).join('; ')}`);
          return runAgent(action, attempt + 1);
        }
        return { __error: `schema validation failed: ${errs.slice(0, 5).join('; ')}` };
      }
    }
    const actualModels = Object.keys(response.modelUsage ?? {});
    log(`  model ${action.effectId}: ${actualModels.join(', ') || 'unknown'}`);
    return {
      __value: value,
      __metadata: {
        requestedModel: model,
        requestedEffort: effort,
        harness: 'claude',
        actualModels,
        modelUsage: response.modelUsage ?? null,
        totalCostUsd: response.total_cost_usd ?? null,
      },
    };
  } catch (e) {
    if (attempt < 2) {
      log(`  agent error on ${action.effectId}, retry ${attempt + 1}: ${String(e.message).slice(0, 160)}`);
      const retryDelay = HARNESS === 'codex' ? 10000 : 2000;
      await new Promise((r) => setTimeout(r, retryDelay * (attempt + 1)));
      return runAgent(action, attempt + 1);
    }
    return { __error: String(e.message).slice(0, 500) };
  }
}

// --- breakpoints ---------------------------------------------------------------------

async function handleBreakpoint(action) {
  const def = action.taskDef;
  const q =
    def.metadata?.payload?.question ??
    def.breakpoint?.question ??
    def.question ??
    def.inputs?.question ??
    def.description ??
    '(no question)';
  console.error('\n' + '='.repeat(78));
  console.error(`BREAKPOINT: ${def.title ?? action.taskId}`);
  console.error('='.repeat(78));
  console.error(q);
  console.error('='.repeat(78) + '\n');

  await writeFile(
    path.join(runDir, 'PENDING_BREAKPOINT.txt'),
    `effectId: ${action.effectId}\ntitle: ${def.title ?? ''}\n\n${q}\n`,
  );

  if (STOP_AT_BREAKPOINT) {
    log(`stopping at breakpoint ${action.effectId}; approve with:`);
    log(`  npx babysitter task:post ${runDir} ${action.effectId} --status ok --value-inline '{"approved":true}'`);
    return 'stop';
  }
  await post(action.effectId, 'ok', { approved: true, response: 'auto-approved by driver' });
  return 'continue';
}

// --- main loop -----------------------------------------------------------------------

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return out;
}

let iterations = 0;
let done = false;
let exitStatus = 0;

while (!done && iterations < MAX_ITER) {
  iterations++;
  const state = await iterate();

  if (state.status === 'completed' || state.status === 'failed') {
    log(`run ${state.status}`);
    if (state.output) console.error(JSON.stringify(state.output, null, 2));
    if (state.error) console.error(JSON.stringify(state.error, null, 2));
    if (state.status === 'failed') exitStatus = 1;
    done = true;
    break;
  }

  const actions = state.nextActions ?? [];
  if (!actions.length) {
    log(`no pending actions, status=${state.status} reason=${state.reason ?? ''}`);
    if (state.status === 'waiting' && state.reason?.includes('pending')) {
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }
    done = true;
    break;
  }

  const kinds = actions.reduce((m, a) => ({ ...m, [a.kind]: (m[a.kind] ?? 0) + 1 }), {});
  log(`iteration ${iterations}: ${actions.length} pending ${JSON.stringify(kinds)}`);

  const breakpoints = actions.filter((a) => a.kind === 'breakpoint' || a.taskDef?.kind === 'breakpoint');
  if (breakpoints.length) {
    for (const bp of breakpoints) {
      if ((await handleBreakpoint(bp)) === 'stop') {
        done = true;
        break;
      }
    }
    if (done) break;
    continue;
  }

  const shells = actions.filter((a) => a.kind === 'shell');
  const agents = actions.filter((a) => a.kind === 'agent');
  const others = actions.filter((a) => a.kind !== 'shell' && a.kind !== 'agent');

  for (const a of shells) {
    log(`  shell: ${a.taskDef.title}`);
    const res = await runShell(a);
    if (!res.ok) {
      log(`  shell FAILED exit=${res.exitCode}: ${res.stderr.slice(-1500)}`);
      await post(a.effectId, 'error', null, { error: `exit ${res.exitCode}: ${res.stderr.slice(-2000)}` });
    } else {
      log(`  shell ok: ${(res.stderr || res.stdout).trim().split('\n').slice(-1)[0]?.slice(0, 140) ?? ''}`);
      await post(a.effectId, 'ok', res);
    }
  }

  if (agents.length) {
    log(`  dispatching ${agents.length} agent task(s), concurrency ${CONCURRENCY}`);
    let completed = 0;
    let agentFailure = false;
    await mapLimit(agents, CONCURRENCY, async (a) => {
      const value = await runAgent(a);
      completed++;
      if (value?.__error) {
        log(`  [${completed}/${agents.length}] FAILED ${a.taskDef.title}: ${value.__error.slice(0, 160)}`);
        agentFailure = true;
      } else {
        log(`  [${completed}/${agents.length}] ok ${a.taskDef.title}`);
        await post(a.effectId, 'ok', value.__value, { metadata: value.__metadata });
      }
    });
    if (agentFailure) {
      log('stopping with failed agent effects still pending; rerun the driver to retry them');
      exitStatus = 1;
      done = true;
      break;
    }
  }

  for (const a of others) {
    log(`  unsupported kind '${a.kind}' (${a.taskDef?.title ?? a.taskId}) — auto-resolving`);
    await post(a.effectId, 'ok', { approved: true, note: `auto-resolved kind=${a.kind}` });
  }
}

if (!done && iterations >= MAX_ITER) {
  log(`stopped: hit max-iterations ${MAX_ITER}`);
  exitStatus = 1;
}
log(`driver finished after ${iterations} iteration(s)`);
process.exitCode = exitStatus;
