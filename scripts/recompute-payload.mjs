#!/usr/bin/env node
/**
 * Rebuild payload.json from the run journal under the *current* rubric weights.
 *
 * Every individual judgment — including all panel judges — is stored in the run's
 * tasks/<effectId>/result.json, and each dimension was scored independently with its own
 * evidence. So a weight change (e.g. dropping C1) is a pure recompute: no re-judging.
 *
 * Scoring comes from the process itself (computeScores / weights are imported), so the
 * report and the orchestration can never disagree about the arithmetic.
 *
 * Usage: node scripts/recompute-payload.mjs <runDir> [outPayload] [manifest] [--low N --high N]
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  computeScores, BENEFIT_W, COST_W, PINS, LIVE_BENEFIT, LIVE_COST,
} from '../.a5c/processes/tb-routing-eval.js';

const argv = process.argv.slice(2);
// accepts several run dirs (comma-separated): the original run plus any panel top-ups
const runDirs = argv[0].split(',').map((d) => path.resolve(d.trim()));
const outPath = path.resolve(argv[1] ?? 'out/payload.json');
const manifestPath = path.resolve(argv[2] ?? 'out/manifest.json');
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? Number(argv[i + 1]) : d; };
const THRESH = { low: flag('low', -15), high: flag('high', 20), source: 'doc defaults' };

const r1 = (n) => Math.round(n * 10) / 10;
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const byId = Object.fromEntries(manifest.tasks.map((t) => [t.id, t]));

// ---- collect every judgment, in chronological (ULID) order -------------------------
const judgments = {};
for (const runDir of runDirs)
for (const eff of readdirSync(path.join(runDir, 'tasks')).sort()) {
  const dir = path.join(runDir, 'tasks', eff);
  const tj = path.join(dir, 'task.json');
  const rj = path.join(dir, 'result.json');
  if (!existsSync(tj) || !existsSync(rj)) continue;
  const t = JSON.parse(readFileSync(tj, 'utf8'));
  if (t.kind !== 'agent') continue;
  const raw = JSON.parse(readFileSync(rj, 'utf8'));
  const v = raw.value ?? raw;
  if (!v?.taskId || !v.benefit) continue;
  const idx = (t.labels ?? []).find((l) => /^judge-\d+$/.test(l)) ?? 'judge-0';
  (judgments[v.taskId] ??= []).push({ judgeIndex: Number(idx.split('-')[1]), effectId: eff, v });
}

const dims = (v) => ({
  ...Object.fromEntries(LIVE_BENEFIT.map((k) => [k, v.benefit?.[k]?.score])),
  ...Object.fromEntries(LIVE_COST.map((k) => [k, v.cost?.[k]?.score])),
});
const verdictFor = (n) => (n >= THRESH.high ? 'babysitter' : n <= THRESH.low ? 'vanilla' : 'borderline');

let noPanelInBand = 0;
const rows = [];

for (const [id, all] of Object.entries(judgments)) {
  const task = byId[id];
  if (!task) throw new Error(`judgment for unknown task ${id}`);

  // judge-0 may appear twice for the three smoke tasks (Phase 2 and again in Phase 3);
  // take the later, which is what the original run carried forward.
  const primaries = all.filter((j) => j.judgeIndex === 0);
  const primary = primaries[primaries.length - 1];
  const panelists = all.filter((j) => j.judgeIndex > 0);

  const scores = computeScores(dims(primary.v));
  const panel = panelists.length >= 2;

  let verdict = verdictFor(scores.netLive);
  let agreement = null;
  let panelVerdicts = null;
  let extra = {};

  if (panel) {
    const set = [primary, ...panelists].slice(0, 3);
    const allScores = set.map((j) => computeScores(dims(j.v)));
    panelVerdicts = allScores.map((s) => verdictFor(s.netLive));
    const tally = panelVerdicts.reduce((m, v) => ({ ...m, [v]: (m[v] ?? 0) + 1 }), {});
    const [win, n] = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
    verdict = n >= 2 ? win : 'borderline';
    agreement = `${n}/${panelVerdicts.length}`;
    const nets = allScores.map((s) => s.netLive);
    extra = {
      netLiveMean: r1(nets.reduce((a, b) => a + b, 0) / nets.length),
      netLiveSpread: r1(Math.max(...nets) - Math.min(...nets)),
    };
  } else if (verdictFor(scores.netLive) === 'borderline') {
    noPanelInBand++;
  }

  const v = primary.v;
  rows.push({
    id, bench: task.bench, name: task.name,
    category: task.meta.category, difficulty: task.meta.difficulty,
    expertMinutes: task.meta.expertMinutes, agentTimeoutSec: task.meta.agentTimeoutSec,
    verdict,
    scores: { ...scores, ...extra },
    panel, agreement, panelVerdicts,
    dimensions: dims(v),
    evidence: {
      ...Object.fromEntries(LIVE_BENEFIT.map((k) => [k, v.benefit?.[k]?.evidence ?? null])),
      ...Object.fromEntries(LIVE_COST.map((k) => [k, v.cost?.[k]?.evidence ?? null])),
    },
    topBenefitDriver: v.top_benefit_driver ?? null,
    topCostDriver: v.top_cost_driver ?? null,
    processRecommendation: v.process_recommendation ?? null,
    vanillaFailureMode: v.vanilla_failure_mode ?? null,
    counterfactualEmpty: v.counterfactual_empty ?? null,
    rationale: v.rationale ?? null,
  });
}

rows.sort((a, b) => a.id.localeCompare(b.id));
const nets = rows.map((r) => r.scores.netLive).sort((a, b) => a - b);
const q = (p2) => {
  const pos = (nets.length - 1) * p2, lo = Math.floor(pos), hi = Math.ceil(pos);
  return r1(nets[lo] + (nets[hi] - nets[lo]) * (pos - lo));
};

const payload = {
  generatedAt: new Date().toISOString(),
  runId: runDirs.map((d) => path.basename(d)).join(' + '),
  recomputedFrom: 'run journal',
  rubricNote: 'C1 (process-authoring cost) removed — it measured library coverage, not the task',
  manifest: { commits: manifest.commits, counts: manifest.counts, total: manifest.total },
  thresholds: THRESH,
  distribution: { n: nets.length, min: nets[0], q1: q(0.25), median: q(0.5), q3: q(0.75), p90: q(0.9), max: nets.at(-1) },
  byBench: Object.fromEntries(['tb2.1', 'tb3'].map((b) => {
    const v = rows.filter((r) => r.bench === b).map((r) => r.scores.netLive).sort((x, y) => x - y);
    return [b, { n: v.length, median: v.length ? v[Math.floor(v.length / 2)] : null, max: v.at(-1) ?? null }];
  })),
  weights: { BENEFIT_W, COST_W, PINS, LIVE_BENEFIT, LIVE_COST },
  rows,
};

writeFileSync(outPath, JSON.stringify(payload, null, 2));

const counts = rows.reduce((m, r) => ({ ...m, [r.verdict]: (m[r.verdict] ?? 0) + 1 }), {});
console.error(`recomputed ${rows.length} rows -> ${outPath}`);
console.error(`verdicts: ${JSON.stringify(counts)}`);
console.error(`net_live: min ${payload.distribution.min} q1 ${payload.distribution.q1} median ${payload.distribution.median} q3 ${payload.distribution.q3} max ${payload.distribution.max}`);
if (noPanelInBand) {
  console.error(`NOTE: ${noPanelInBand} task(s) now land in the borderline band with only one judgment — the panel ran against the previous scoring.`);
}
