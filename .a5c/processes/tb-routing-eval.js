/**
 * @process tb/routing-eval
 * @description Route every Terminal-Bench 2.1 and 3 task through the babysitter-vs-vanilla
 *   rubric. Single judging pass, corpus-calibrated thresholds, majority panel on the
 *   borderline band, then a results table.
 * @inputs { workspaceDir: string, manifestPath?: string, outDir?: string, chunkSize?: number,
 *           smokeTaskIds?: string[], provisionalBand?: { low: number, high: number } }
 * @outputs { total: number, verdicts: object, thresholds: object, reportPaths: string[] }
 */

import { readFileSync } from 'node:fs';
import { defineTask } from '@a5c-ai/babysitter-sdk';

// ---------------------------------------------------------------------------
// Rubric weights. Mirrors prompts/tb-profile.md — the process recomputes every
// score itself rather than trusting the judge's arithmetic.
// ---------------------------------------------------------------------------

export const BENEFIT_W = { B1: 15, B2: 18, B3: 15, B4: 12, B5: 10, B6: 8, B7: 12, B8: 10 };
// C1 (process-authoring cost) was removed: it measured library coverage, not the task.
export const COST_W = { C2: 27, C3: 13, C4: 34, C5: 13, C6: 13 };
export const PINS = { B2: 3, B4: 0, B7: 1, C3: 3, C5: 0, C6: 0 };
export const LIVE_BENEFIT = ['B1', 'B3', 'B5', 'B6', 'B8'];
export const LIVE_COST = ['C2', 'C4'];

const round1 = (n) => Math.round(n * 10) / 10;

/**
 * Recompute net_raw and net_live from the per-dimension scores.
 * The judge reports its own arithmetic; we never use it. Arithmetic is exactly what an
 * LLM should not be trusted with, and every downstream number depends on this.
 */
export function computeScores(scores) {
  const s = { ...PINS, ...scores };
  const sum = (weights, keys) =>
    keys.reduce((acc, k) => acc + (weights[k] * Math.max(0, Math.min(3, s[k] ?? 0))) / 3, 0);

  const benefitRaw = sum(BENEFIT_W, Object.keys(BENEFIT_W));
  const costRaw = sum(COST_W, Object.keys(COST_W));
  const benefitLive = (sum(BENEFIT_W, LIVE_BENEFIT) * 100) / 58;
  const costLive = (sum(COST_W, LIVE_COST) * 100) / 61;

  return {
    benefitRaw: round1(benefitRaw),
    costRaw: round1(costRaw),
    netRaw: round1(benefitRaw - costRaw),
    benefitLive: round1(benefitLive),
    costLive: round1(costLive),
    netLive: round1(benefitLive - costLive),
  };
}

const quantile = (sorted, q) => {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return round1(sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo));
};

function histogram(values, width = 46) {
  if (!values.length) return '(no values)';
  const lo = Math.floor(Math.min(...values) / 10) * 10;
  const hi = Math.ceil(Math.max(...values) / 10) * 10;
  const bins = [];
  for (let edge = lo; edge < hi; edge += 10) {
    const n = values.filter((v) => v >= edge && v < edge + 10).length;
    bins.push([edge, n]);
  }
  const max = Math.max(...bins.map(([, n]) => n), 1);
  return bins
    .map(([edge, n]) => `  ${String(edge).padStart(4)}..${String(edge + 10).padEnd(4)} | ${'#'.repeat(Math.round((n / max) * width)).padEnd(width)} ${n}`)
    .join('\n');
}

// ---------------------------------------------------------------------------
// Judgment schema — enforced by the SDK. A malformed judgment is rejected at
// task:post and never reaches result.json, so it cannot become a silently-bad row.
// ---------------------------------------------------------------------------

const dimension = {
  type: 'object',
  required: ['score', 'evidence'],
  properties: {
    score: { type: 'integer', minimum: 0, maximum: 3 },
    evidence: { type: 'string' },
  },
};

const JUDGMENT_SCHEMA = {
  type: 'object',
  required: ['taskId', 'benefit', 'cost', 'vanilla_failure_mode', 'counterfactual_empty', 'rationale'],
  properties: {
    taskId: { type: 'string' },
    benefit: {
      type: 'object',
      required: LIVE_BENEFIT,
      properties: Object.fromEntries(LIVE_BENEFIT.map((k) => [k, dimension])),
    },
    cost: {
      type: 'object',
      required: LIVE_COST,
      properties: Object.fromEntries(LIVE_COST.map((k) => [k, dimension])),
    },
    vanilla_failure_mode: { type: 'string' },
    counterfactual_empty: { type: 'boolean' },
    top_benefit_driver: { type: 'string' },
    top_cost_driver: { type: 'string' },
    process_recommendation: { type: 'string' },
    rationale: { type: 'string' },
    missing_information: { type: 'array', items: { type: 'string' } },
  },
};

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export const fetchManifestTask = defineTask('tb.fetch-manifest', (args) => ({
  kind: 'shell',
  title: 'Fetch Terminal-Bench 2.1 + 3 manifest',
  description: 'Deterministic fetch of instruction.md, task.toml and tests/ listings. Excludes solution/.',
  shell: {
    command: `node ${args.workspaceDir}/scripts/fetch-tb-manifest.mjs ${args.manifestPath}`,
    cwd: args.workspaceDir,
    expectedExitCode: 0,
  },
  labels: ['tb', 'fetch', 'deterministic'],
}));

/**
 * One judgment. The rubric and profile are hoisted to the front of the prompt, identical
 * across all 163 calls, so the prefix caches.
 */
export const judgeTask = defineTask('tb.judge', (args, taskCtx) => ({
  kind: 'agent',
  title: `Judge ${args.task.id}${args.judgeIndex > 0 ? ` (panel judge ${args.judgeIndex + 1})` : ''}`,
  description: 'Score one Terminal-Bench task against the babysitter-vs-vanilla rubric',

  agent: {
    name: 'routing-judge',
    prompt: {
      role: 'routing judge applying a fixed rubric',
      task: [
        'Score ONE Terminal-Bench task on the live rubric dimensions.',
        'Apply the base rubric as amended by the Terminal-Bench profile.',
        'Do NOT assign a verdict — thresholds are calibrated downstream from the full corpus.',
        'Do NOT compute net_raw or net_live — the orchestrator computes those from your scores.',
      ].join(' '),
      context: {
        rubric: args.rubric,
        terminalBenchProfile: args.profile,
        taskUnderEvaluation: {
          id: args.task.id,
          benchmark: args.task.bench,
          name: args.task.name,
          instruction: args.task.instruction,
          metadata: args.task.meta,
          testFiles: args.task.testFiles,
        },
      },
      instructions: [
        'Read the rubric and the Terminal-Bench profile first. The profile pins six dimensions; do not score those.',
        `Score only: ${[...LIVE_BENEFIT, ...LIVE_COST].join(', ')}. Each 0-3, each with cited evidence from the instruction or metadata.`,
        'No score above 0 without a specific citation. Absent evidence means 0.',
        'Write vanilla_failure_mode as a concrete failure: the step skipped, the artifact silently wrong, the premature "done". "It is a hard task" is not a failure mode.',
        'If you cannot name a concrete failure, set counterfactual_empty to true and say so in the rationale.',
        'Difficulty is not drift risk. An exactly-specified output constrains the agent tightly even when the work is hard.',
        'top_benefit_driver and top_cost_driver: name the single dimension id that dominates, e.g. "B3" / "C2".',
        'process_recommendation: a babysitter library path that would fit, or "custom". This does not affect the scores — it feeds the library backlog.',
        'Return ONLY the JSON object. No prose outside it.',
      ],
      outputFormat: 'A single JSON object conforming to the output schema',
    },
    outputSchema: JUDGMENT_SCHEMA,
  },

  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`,
  },

  labels: ['tb', 'judge', args.task.bench, `judge-${args.judgeIndex ?? 0}`],
}));

/**
 * Report generation. The judgments payload is large, so it travels via a file the
 * executor materialises from `metadata.writeInputTo` before running the command,
 * rather than through argv.
 */
export const buildReportTask = defineTask('tb.build-report', (args) => ({
  kind: 'shell',
  title: 'Build results table',
  description: 'Deterministic report generation from the collected judgments',
  metadata: { writeInputTo: { path: args.payloadPath, json: args.json } },
  shell: {
    command: `node ${args.workspaceDir}/scripts/build-report.mjs ${args.payloadPath} ${args.outDir}`,
    cwd: args.workspaceDir,
    expectedExitCode: 0,
  },
  labels: ['tb', 'report', 'deterministic'],
}));

// ---------------------------------------------------------------------------
// Process
// ---------------------------------------------------------------------------

export async function process(inputs, ctx) {
  const workspaceDir = inputs.workspaceDir;
  const outDir = inputs.outDir ?? `${workspaceDir}/out`;
  const manifestPath = inputs.manifestPath ?? `${outDir}/manifest.json`;
  const chunkSize = inputs.chunkSize ?? 8;
  const provisionalBand = inputs.provisionalBand ?? { low: -15, high: 20 };

  const rubric = readFileSync(`${workspaceDir}/babysitter-vs-vanilla-eval.md`, 'utf8');
  const profile = readFileSync(`${workspaceDir}/prompts/tb-profile.md`, 'utf8');

  // -- Phase 1: manifest ----------------------------------------------------
  ctx.log('info', 'Phase 1: fetching Terminal-Bench manifest');
  await ctx.task(fetchManifestTask, { workspaceDir, manifestPath });

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const allTasks = manifest.tasks;
  ctx.log('info', `Manifest: ${manifest.total} tasks (${JSON.stringify(manifest.counts)}) @ ${JSON.stringify(manifest.commits)}`);

  const judgeArgs = (task, judgeIndex = 0) => ({ task, rubric, profile, judgeIndex });

  // -- Phase 2: smoke test --------------------------------------------------
  // Three tasks spanning the horizon range. If the harness cannot run headless agent
  // tasks, or the prompt yields malformed JSON, this costs 3 calls instead of 163.
  ctx.log('info', 'Phase 2: smoke test on 3 tasks');
  const smokeIds =
    inputs.smokeTaskIds ?? [
      allTasks.find((t) => t.bench === 'tb2.1' && (t.meta.expertMinutes ?? 0) <= 30)?.id,
      allTasks.find((t) => t.bench === 'tb2.1' && (t.meta.expertMinutes ?? 0) >= 120)?.id,
      allTasks.find((t) => t.bench === 'tb3' && (t.meta.expertMinutes ?? 0) >= 480)?.id,
    ].filter(Boolean);

  const smokeTasks = smokeIds.map((id) => allTasks.find((t) => t.id === id)).filter(Boolean);
  const smokeResults = await ctx.parallel.map(smokeTasks, (task) =>
    ctx.task(judgeTask, judgeArgs(task), { label: `smoke:${task.id}` }),
  );

  const smokeScored = smokeTasks.map((task, i) => ({
    id: task.id,
    expertMinutes: task.meta.expertMinutes,
    scores: computeScores({
      ...Object.fromEntries(LIVE_BENEFIT.map((k) => [k, smokeResults[i]?.benefit?.[k]?.score])),
      ...Object.fromEntries(LIVE_COST.map((k) => [k, smokeResults[i]?.cost?.[k]?.score])),
    }),
    counterfactual: smokeResults[i]?.vanilla_failure_mode,
    empty: smokeResults[i]?.counterfactual_empty,
  }));

  const smokeApproval = await ctx.breakpoint({
    question: [
      'Smoke test complete. Three judgments below — check that the counterfactuals are concrete',
      'and that net_live tracks task horizon in the direction you expect.',
      'Approve to judge all ' + allTasks.length + ' tasks.',
      '',
      ...smokeScored.map(
        (s) =>
          `  ${s.id}\n    expert=${s.expertMinutes}min  net_live=${s.scores.netLive}  benefit=${s.scores.benefitLive} cost=${s.scores.costLive}\n    counterfactual${s.empty ? ' (EMPTY)' : ''}: ${String(s.counterfactual).slice(0, 220)}`,
      ),
    ].join('\n'),
    title: 'Smoke test review',
    options: ['Approve', 'Reject'],
    context: { runId: ctx.runId, smoke: smokeScored },
  });

  if (smokeApproval && smokeApproval.approved === false) {
    return {
      ok: false,
      stoppedAt: 'smoke',
      reason: 'Smoke test rejected',
      feedback: smokeApproval.response ?? smokeApproval.feedback ?? null,
      smoke: smokeScored,
    };
  }

  // -- Phase 3: judge the corpus -------------------------------------------
  ctx.log('info', `Phase 3: judging ${allTasks.length} tasks in chunks of ${chunkSize}`);
  const judgments = [];
  for (let i = 0; i < allTasks.length; i += chunkSize) {
    const chunk = allTasks.slice(i, i + chunkSize);
    const results = await ctx.parallel.map(chunk, (task) =>
      ctx.task(judgeTask, judgeArgs(task), { label: `judge:${task.id}` }),
    );
    chunk.forEach((task, j) => {
      const r = results[j];
      const scores = computeScores({
        ...Object.fromEntries(LIVE_BENEFIT.map((k) => [k, r?.benefit?.[k]?.score])),
        ...Object.fromEntries(LIVE_COST.map((k) => [k, r?.cost?.[k]?.score])),
      });
      judgments.push({ task, judgments: [r], scores, panel: false });
    });
    ctx.log('info', `judged ${Math.min(i + chunkSize, allTasks.length)}/${allTasks.length}`);
  }

  // -- Phase 4: calibrate ---------------------------------------------------
  ctx.log('info', 'Phase 4: calibrating thresholds from the corpus distribution');
  const nets = judgments.map((j) => j.scores.netLive).sort((a, b) => a - b);
  const dist = {
    n: nets.length,
    min: nets[0],
    q1: quantile(nets, 0.25),
    median: quantile(nets, 0.5),
    q3: quantile(nets, 0.75),
    p90: quantile(nets, 0.9),
    max: nets.at(-1),
  };

  const byBench = Object.fromEntries(
    ['tb2.1', 'tb3'].map((b) => {
      const v = judgments.filter((j) => j.task.bench === b).map((j) => j.scores.netLive).sort((a, b2) => a - b2);
      return [b, { n: v.length, median: quantile(v, 0.5), q3: quantile(v, 0.75), max: v.at(-1) }];
    }),
  );

  const candidates = [
    { name: 'doc defaults', low: -15, high: 20 },
    { name: 'corpus q3/median', low: dist.median, high: dist.q3 },
    { name: 'corpus p90', low: dist.q3, high: dist.p90 },
  ].map((c) => ({
    ...c,
    split: {
      babysitter: judgments.filter((j) => j.scores.netLive >= c.high).length,
      borderline: judgments.filter((j) => j.scores.netLive < c.high && j.scores.netLive > c.low).length,
      vanilla: judgments.filter((j) => j.scores.netLive <= c.low).length,
    },
  }));

  const emptyCf = judgments.filter((j) => j.judgments[0]?.counterfactual_empty).length;

  const calibration = await ctx.breakpoint({
    question: [
      `All ${judgments.length} tasks judged. Choose the threshold pair for this corpus.`,
      '',
      `net_live distribution:  min=${dist.min}  q1=${dist.q1}  median=${dist.median}  q3=${dist.q3}  p90=${dist.p90}  max=${dist.max}`,
      `by benchmark: tb2.1 median=${byBench['tb2.1'].median} (n=${byBench['tb2.1'].n}) | tb3 median=${byBench['tb3'].median} (n=${byBench['tb3'].n})`,
      `empty counterfactuals: ${emptyCf}/${judgments.length}`,
      '',
      histogram(nets),
      '',
      'Candidate thresholds (babysitter / borderline / vanilla):',
      ...candidates.map(
        (c) => `  ${c.name.padEnd(18)} low=${String(c.low).padStart(6)} high=${String(c.high).padStart(6)}  ->  ${c.split.babysitter} / ${c.split.borderline} / ${c.split.vanilla}`,
      ),
      '',
      'Approve to use the doc defaults, or reply with "low=<n> high=<n>" to override.',
    ].join('\n'),
    title: 'Threshold calibration',
    options: ['Approve', 'Reject'],
    context: { runId: ctx.runId, distribution: dist, byBench, candidates },
  });

  const override = String(calibration?.response ?? calibration?.feedback ?? '').match(
    /low\s*=\s*(-?[\d.]+).*?high\s*=\s*(-?[\d.]+)/is,
  );
  const thresholds = override
    ? { low: Number(override[1]), high: Number(override[2]), source: 'human override' }
    : { low: provisionalBand.low, high: provisionalBand.high, source: 'doc defaults' };

  ctx.log('info', `thresholds: low=${thresholds.low} high=${thresholds.high} (${thresholds.source})`);

  const verdictFor = (netLive) =>
    netLive >= thresholds.high ? 'babysitter' : netLive <= thresholds.low ? 'vanilla' : 'borderline';

  for (const j of judgments) j.verdict = verdictFor(j.scores.netLive);

  // -- Phase 5: borderline panel -------------------------------------------
  const borderline = judgments.filter((j) => j.verdict === 'borderline');
  ctx.log('info', `Phase 5: panel on ${borderline.length} borderline tasks (2 extra judges each)`);

  for (let i = 0; i < borderline.length; i += chunkSize) {
    const chunk = borderline.slice(i, i + chunkSize);
    const extra = await ctx.parallel.all(
      chunk.flatMap((j) => [
        () => ctx.task(judgeTask, judgeArgs(j.task, 1), { label: `panel1:${j.task.id}` }),
        () => ctx.task(judgeTask, judgeArgs(j.task, 2), { label: `panel2:${j.task.id}` }),
      ]),
    );

    chunk.forEach((j, k) => {
      const extras = [extra[k * 2], extra[k * 2 + 1]];
      j.judgments.push(...extras);
      j.panel = true;

      const allScores = j.judgments.map((r) =>
        computeScores({
          ...Object.fromEntries(LIVE_BENEFIT.map((key) => [key, r?.benefit?.[key]?.score])),
          ...Object.fromEntries(LIVE_COST.map((key) => [key, r?.cost?.[key]?.score])),
        }),
      );
      const verdicts = allScores.map((s) => verdictFor(s.netLive));
      const tally = verdicts.reduce((m, v) => ({ ...m, [v]: (m[v] ?? 0) + 1 }), {});
      const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];

      j.panelScores = allScores;
      j.panelVerdicts = verdicts;
      j.verdict = winner[1] >= 2 ? winner[0] : 'borderline';
      j.agreement = `${winner[1]}/3`;
      j.scores = {
        ...j.scores,
        netLiveMean: round1(allScores.reduce((a, s) => a + s.netLive, 0) / allScores.length),
        netLiveSpread: round1(Math.max(...allScores.map((s) => s.netLive)) - Math.min(...allScores.map((s) => s.netLive))),
      };
    });
    ctx.log('info', `panel ${Math.min(i + chunkSize, borderline.length)}/${borderline.length}`);
  }

  // -- Phase 6: report ------------------------------------------------------
  ctx.log('info', 'Phase 6: building report');

  const payload = {
    generatedAt: ctx.now().toISOString(),
    runId: ctx.runId,
    manifest: { commits: manifest.commits, counts: manifest.counts, total: manifest.total },
    thresholds,
    distribution: dist,
    byBench,
    weights: { BENEFIT_W, COST_W, PINS, LIVE_BENEFIT, LIVE_COST },
    rows: judgments.map((j) => ({
      id: j.task.id,
      bench: j.task.bench,
      name: j.task.name,
      category: j.task.meta.category,
      difficulty: j.task.meta.difficulty,
      expertMinutes: j.task.meta.expertMinutes,
      agentTimeoutSec: j.task.meta.agentTimeoutSec,
      verdict: j.verdict,
      scores: j.scores,
      panel: j.panel,
      agreement: j.agreement ?? null,
      panelVerdicts: j.panelVerdicts ?? null,
      dimensions: {
        ...Object.fromEntries(LIVE_BENEFIT.map((k) => [k, j.judgments[0]?.benefit?.[k]?.score ?? null])),
        ...Object.fromEntries(LIVE_COST.map((k) => [k, j.judgments[0]?.cost?.[k]?.score ?? null])),
      },
      evidence: {
        ...Object.fromEntries(LIVE_BENEFIT.map((k) => [k, j.judgments[0]?.benefit?.[k]?.evidence ?? null])),
        ...Object.fromEntries(LIVE_COST.map((k) => [k, j.judgments[0]?.cost?.[k]?.evidence ?? null])),
      },
      topBenefitDriver: j.judgments[0]?.top_benefit_driver ?? null,
      topCostDriver: j.judgments[0]?.top_cost_driver ?? null,
      processRecommendation: j.judgments[0]?.process_recommendation ?? null,
      vanillaFailureMode: j.judgments[0]?.vanilla_failure_mode ?? null,
      counterfactualEmpty: j.judgments[0]?.counterfactual_empty ?? null,
      rationale: j.judgments[0]?.rationale ?? null,
    })),
  };

  const payloadPath = `${outDir}/payload.json`;
  await ctx.task(buildReportTask, {
    workspaceDir,
    payloadPath,
    outDir,
    json: JSON.stringify(payload, null, 2),
  });

  const counts = payload.rows.reduce((m, r) => ({ ...m, [r.verdict]: (m[r.verdict] ?? 0) + 1 }), {});
  ctx.log('info', `done: ${JSON.stringify(counts)}`);

  return {
    ok: true,
    total: payload.rows.length,
    verdicts: counts,
    thresholds,
    distribution: dist,
    byBench,
    panelled: borderline.length,
    reportPaths: [`${outDir}/results.md`, `${outDir}/results.csv`, `${outDir}/summary.md`],
  };
}
