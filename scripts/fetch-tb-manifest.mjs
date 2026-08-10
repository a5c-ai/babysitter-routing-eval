#!/usr/bin/env node
/**
 * Fetch the Terminal-Bench 2.1 and 3 task manifest.
 *
 * Deterministic, no agent involvement. For each task we take:
 *   - instruction.md   (the task statement the judge routes on)
 *   - task.toml        (difficulty, category, time estimates, timeouts)
 *   - the tests/ file listing (evidence for gate-ability, from the git tree)
 *
 * solution/ is excluded by construction. The judge must never see it.
 *
 * Writes out/manifest.json, including the resolved commit SHA per repo so the
 * run is reproducible against repos that are still moving.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const BENCHES = [
  { bench: 'tb2.1', repo: 'harbor-framework/terminal-bench-2-1', expected: 89 },
  { bench: 'tb3', repo: 'harbor-framework/terminal-bench-3', expected: 74 },
];

const OUT = path.resolve(process.argv[2] ?? 'out/manifest.json');
const CONCURRENCY = 12;

async function getJson(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'tb-routing-eval', Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function getText(url, attempt = 0) {
  const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'tb-routing-eval' } });
  if (res.status >= 500 && attempt < 3) {
    await new Promise((r) => setTimeout(r, 400 * 2 ** attempt));
    return getText(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.text();
}

/** Minimal TOML reader for the flat scalar keys we care about. */
function parseTaskToml(toml) {
  const scalar = (key) => {
    const m = toml.match(new RegExp(`^\\s*${key}\\s*=\\s*"?([^"\\n#]+)"?`, 'm'));
    return m ? m[1].trim() : null;
  };
  const sectionScalar = (section, key) => {
    const sec = toml.split(new RegExp(`^\\[${section}\\]\\s*$`, 'm'))[1];
    if (!sec) return null;
    const body = sec.split(/^\[/m)[0];
    const m = body.match(new RegExp(`^\\s*${key}\\s*=\\s*"?([^"\\n#]+)"?`, 'm'));
    return m ? m[1].trim() : null;
  };

  const hours = scalar('expert_time_estimate_hours');
  const mins = scalar('expert_time_estimate_min');
  const expertMinutes = hours ? Number(hours) * 60 : mins ? Number(mins) : null;

  return {
    difficulty: scalar('difficulty'),
    category: scalar('category'),
    subcategory: scalar('subcategory'),
    tags: (toml.match(/^tags\s*=\s*\[(.*)\]/m)?.[1] ?? '')
      .split(',')
      .map((s) => s.trim().replace(/^"|"$/g, ''))
      .filter(Boolean),
    expertMinutes: Number.isFinite(expertMinutes) ? expertMinutes : null,
    agentTimeoutSec: Number(sectionScalar('agent', 'timeout_sec')) || null,
    verifierTimeoutSec: Number(sectionScalar('verifier', 'timeout_sec')) || null,
    allowInternet: sectionScalar('environment', 'allow_internet'),
  };
}

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

async function collectBench({ bench, repo, expected }) {
  const head = await getJson(`https://api.github.com/repos/${repo}/commits/main`);
  const sha = head.sha;
  const tree = await getJson(`https://api.github.com/repos/${repo}/git/trees/${sha}?recursive=1`);
  if (tree.truncated) throw new Error(`${repo}: git tree truncated, cannot trust listing`);

  const paths = tree.tree.map((t) => t.path);
  const names = [
    ...new Set(
      paths
        .filter((p) => p.startsWith('tasks/') && p.split('/').length > 2)
        .map((p) => p.split('/')[1]),
    ),
  ].sort();

  if (names.length !== expected) {
    throw new Error(`${repo}: expected ${expected} tasks, found ${names.length}`);
  }

  const testsByTask = new Map();
  for (const p of paths) {
    const parts = p.split('/');
    if (parts[0] === 'tasks' && parts[2] === 'tests' && parts.length > 3) {
      if (!testsByTask.has(parts[1])) testsByTask.set(parts[1], []);
      testsByTask.get(parts[1]).push(parts.slice(3).join('/'));
    }
  }

  const raw = (name, file) =>
    `https://raw.githubusercontent.com/${repo}/${sha}/tasks/${encodeURIComponent(name)}/${file}`;

  const tasks = await mapLimit(names, CONCURRENCY, async (name) => {
    const [instruction, toml] = await Promise.all([
      getText(raw(name, 'instruction.md')),
      getText(raw(name, 'task.toml')),
    ]);
    return {
      id: `${bench}__${name}`,
      bench,
      name,
      repo,
      instruction: instruction.replace(/<!--\s*harbor-canary[^>]*-->\s*/g, '').trim(),
      instructionChars: instruction.length,
      meta: parseTaskToml(toml),
      testFiles: (testsByTask.get(name) ?? []).sort(),
    };
  });

  console.error(`${bench}: ${tasks.length} tasks @ ${sha.slice(0, 8)}`);
  return { bench, repo, sha, tasks };
}

const benches = [];
for (const b of BENCHES) benches.push(await collectBench(b));

const tasks = benches.flatMap((b) => b.tasks);

// Guards. A silently-short manifest is the failure mode that would poison everything
// downstream, so fail loudly here rather than judge 160 of 163.
const missing = tasks.filter((t) => !t.instruction || t.instruction.length < 20);
if (missing.length) throw new Error(`tasks with empty instruction: ${missing.map((t) => t.id).join(', ')}`);
// Leakage guard. Scoped to structured repo paths, not free text: a task instruction may
// legitimately tell the agent to write to e.g. /app/solution/output.json, which is task
// content, not the repo's oracle solution/ directory.
const leaked = tasks.flatMap((t) => [
  ...t.testFiles.filter((f) => f.startsWith('solution/')).map((f) => `${t.id}:testFiles:${f}`),
  ...(JSON.stringify(t).match(/tasks\/[^"/]+\/solution\//g) ?? []).map((m) => `${t.id}:${m}`),
]);
if (leaked.length) throw new Error(`manifest references oracle solution paths: ${leaked.join(', ')}`);
const noTests = tasks.filter((t) => t.testFiles.length === 0);

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(
  OUT,
  JSON.stringify(
    {
      generatedFrom: BENCHES.map((b) => b.repo),
      commits: Object.fromEntries(benches.map((b) => [b.bench, b.sha])),
      counts: Object.fromEntries(benches.map((b) => [b.bench, b.tasks.length])),
      total: tasks.length,
      tasksWithoutTests: noTests.map((t) => t.id),
      tasks,
    },
    null,
    2,
  ),
);

console.error(`wrote ${OUT}: ${tasks.length} tasks`);
if (noTests.length) console.error(`note: ${noTests.length} task(s) have no tests/ files: ${noTests.map((t) => t.id).join(', ')}`);
