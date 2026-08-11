#!/usr/bin/env node
/**
 * Build the deliverable from the collected judgments.
 *
 * Deterministic and re-runnable: `node scripts/build-report.mjs out/payload.json out`
 * regenerates every report without re-judging anything.
 *
 * Emits out/results.md, out/results.csv, out/summary.md.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const payloadPath = path.resolve(process.argv[2]);
const outDir = path.resolve(process.argv[3] ?? 'out');
const p = JSON.parse(readFileSync(payloadPath, 'utf8'));
mkdirSync(outDir, { recursive: true });

const r1 = (n) => (n == null ? '' : Math.round(n * 10) / 10);
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();
const mins = (m) => (m == null ? '—' : m >= 60 ? `${Math.round((m / 60) * 10) / 10}h` : `${m}m`);
const VERDICT_MARK = { babysitter: '**babysitter**', vanilla: 'vanilla', borderline: '_borderline_' };

// --- Consistency check: recompute net_live from the stored dimension scores ----------
// The process already recomputes from judge scores; this is an independent second pass
// so a silent arithmetic drift between process and report cannot go unnoticed.
const { BENEFIT_W, COST_W, LIVE_BENEFIT, LIVE_COST } = p.weights;
// Divisors are derived from the live weight sets, never hardcoded — otherwise a rubric
// change silently invalidates this check instead of being caught by it.
const BSUM = LIVE_BENEFIT.reduce((a, k) => a + BENEFIT_W[k], 0);
const CSUM = LIVE_COST.reduce((a, k) => a + COST_W[k], 0);
const mismatches = [];
for (const row of p.rows) {
  const sum = (w, keys) =>
    keys.reduce((a, k) => a + (w[k] * Math.max(0, Math.min(3, row.dimensions[k] ?? 0))) / 3, 0);
  const expected =
    Math.round(((sum(BENEFIT_W, LIVE_BENEFIT) * 100) / BSUM - (sum(COST_W, LIVE_COST) * 100) / CSUM) * 10) / 10;
  if (Math.abs(expected - row.scores.netLive) > 0.15) {
    mismatches.push(`${row.id}: stored ${row.scores.netLive} vs recomputed ${expected}`);
  }
}

// --- results.md ----------------------------------------------------------------------
const order = { babysitter: 0, borderline: 1, vanilla: 2 };
const rows = [...p.rows].sort(
  (a, b) => order[a.verdict] - order[b.verdict] || b.scores.netLive - a.scores.netLive,
);

const table = [
  '| task | bench | category | expert est | verdict | net_live | benefit | cost | top B | top C | process rec | agree |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|',
  ...rows.map((row) =>
    [
      esc(row.name),
      row.bench,
      esc(row.category),
      mins(row.expertMinutes),
      VERDICT_MARK[row.verdict] ?? row.verdict,
      r1(row.scores.netLive),
      r1(row.scores.benefitLive),
      r1(row.scores.costLive),
      row.topBenefitDriver ?? '',
      row.topCostDriver ?? '',
      esc(row.processRecommendation),
      row.agreement ?? '',
    ].join(' | '),
  ).map((l) => `| ${l} |`),
].join('\n');

const counts = rows.reduce((m, x) => ({ ...m, [x.verdict]: (m[x.verdict] ?? 0) + 1 }), {});

writeFileSync(
  path.join(outDir, 'results.md'),
  [
    '# Terminal-Bench 2.1 + 3 — Babysitter vs Vanilla routing',
    '',
    `Generated ${p.generatedAt} · run \`${p.runId}\``,
    `Corpus: ${p.manifest.total} tasks (tb2.1 ${p.manifest.counts['tb2.1']} @ \`${String(p.manifest.commits['tb2.1']).slice(0, 8)}\`, tb3 ${p.manifest.counts['tb3']} @ \`${String(p.manifest.commits['tb3']).slice(0, 8)}\`)`,
    `Thresholds: babysitter ≥ ${p.thresholds.high}, vanilla ≤ ${p.thresholds.low} (${p.thresholds.source})`,
    '',
    `**${counts.babysitter ?? 0} babysitter · ${counts.borderline ?? 0} borderline · ${counts.vanilla ?? 0} vanilla**`,
    '',
    mismatches.length ? `> ⚠️ ${mismatches.length} arithmetic mismatch(es); see summary.md\n` : '',
    table,
    '',
    `\`net_live\` renormalizes the rubric over the ${LIVE_BENEFIT.length + LIVE_COST.length} dimensions that vary across this corpus; ${Object.keys(p.weights.PINS).length} are pinned constant (see \`prompts/tb-profile.md\`). Panel column shows majority agreement where a 3-judge panel ran.`,
  ].join('\n'),
);

// --- results.csv ---------------------------------------------------------------------
const cols = [
  'id', 'bench', 'name', 'category', 'difficulty', 'expert_minutes', 'agent_timeout_sec',
  'verdict', 'net_live', 'benefit_live', 'cost_live', 'net_raw',
  ...LIVE_BENEFIT, ...LIVE_COST,
  'top_benefit_driver', 'top_cost_driver', 'process_recommendation',
  'counterfactual_empty', 'panel', 'agreement', 'vanilla_failure_mode',
];
const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
writeFileSync(
  path.join(outDir, 'results.csv'),
  [
    cols.join(','),
    ...rows.map((row) =>
      [
        row.id, row.bench, row.name, row.category, row.difficulty, row.expertMinutes, row.agentTimeoutSec,
        row.verdict, row.scores.netLive, row.scores.benefitLive, row.scores.costLive, row.scores.netRaw,
        ...LIVE_BENEFIT.map((k) => row.dimensions[k]), ...LIVE_COST.map((k) => row.dimensions[k]),
        row.topBenefitDriver, row.topCostDriver, row.processRecommendation,
        row.counterfactualEmpty, row.panel, row.agreement, row.vanillaFailureMode,
      ].map(csvCell).join(','),
    ),
  ].join('\n'),
);

// --- summary.md ----------------------------------------------------------------------
const stats = (vals) => {
  if (!vals.length) return { n: 0 };
  const s = [...vals].sort((a, b) => a - b);
  const mean = s.reduce((a, b) => a + b, 0) / s.length;
  const variance = s.reduce((a, b) => a + (b - mean) ** 2, 0) / s.length;
  return { n: s.length, min: s[0], max: s.at(-1), mean: r1(mean), sd: r1(Math.sqrt(variance)) };
};

const dimVariance = [...LIVE_BENEFIT, ...LIVE_COST].map((k) => {
  const vals = rows.map((row) => row.dimensions[k]).filter((v) => v != null);
  const st = stats(vals);
  const hist = [0, 1, 2, 3].map((v) => vals.filter((x) => x === v).length);
  return { dim: k, ...st, hist };
});

const byBenchVerdict = ['tb2.1', 'tb3'].map((b) => {
  const sub = rows.filter((row) => row.bench === b);
  const c = sub.reduce((m, x) => ({ ...m, [x.verdict]: (m[x.verdict] ?? 0) + 1 }), {});
  const nets = sub.map((x) => x.scores.netLive);
  return { bench: b, n: sub.length, ...c, ...stats(nets) };
});

const byCategory = Object.entries(
  rows.reduce((m, row) => {
    const k = row.category ?? 'uncategorised';
    (m[k] ??= []).push(row);
    return m;
  }, {}),
)
  .map(([cat, sub]) => ({
    cat,
    n: sub.length,
    babysitter: sub.filter((x) => x.verdict === 'babysitter').length,
    medianNet: r1([...sub.map((x) => x.scores.netLive)].sort((a, b) => a - b)[Math.floor(sub.length / 2)]),
  }))
  .sort((a, b) => b.babysitter / b.n - a.babysitter / a.n || b.n - a.n);

const panelled = rows.filter((row) => row.panel);
const unanimous = panelled.filter((row) => row.agreement === '3/3').length;
const unpanelledBorderline = rows.filter((row) => row.verdict === 'borderline' && !row.panel);

// Does net_live track horizon? Spearman against expert time estimate.
const withEst = rows.filter((row) => row.expertMinutes != null);
const rank = (vals) => {
  const idx = vals.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  const out = new Array(vals.length);
  idx.forEach(([, i], r) => (out[i] = r));
  return out;
};
let spearman = null;
if (withEst.length > 2) {
  const x = rank(withEst.map((row) => row.expertMinutes));
  const y = rank(withEst.map((row) => row.scores.netLive));
  const n = x.length;
  const d2 = x.reduce((a, xi, i) => a + (xi - y[i]) ** 2, 0);
  spearman = r1(1 - (6 * d2) / (n * (n * n - 1)));
}

const summaryLines = [
    '# Summary',
    '',
    `Corpus ${p.manifest.total} tasks · thresholds low=${p.thresholds.low} high=${p.thresholds.high} (${p.thresholds.source})`,
    '',
    '## Verdicts',
    '',
    `| | babysitter | borderline | vanilla | n | net_live mean | sd | min | max |`,
    `|---|---|---|---|---|---|---|---|---|`,
    `| **all** | ${counts.babysitter ?? 0} | ${counts.borderline ?? 0} | ${counts.vanilla ?? 0} | ${rows.length} | ${stats(rows.map((x) => x.scores.netLive)).mean} | ${stats(rows.map((x) => x.scores.netLive)).sd} | ${stats(rows.map((x) => x.scores.netLive)).min} | ${stats(rows.map((x) => x.scores.netLive)).max} |`,
    ...byBenchVerdict.map(
      (b) => `| ${b.bench} | ${b.babysitter ?? 0} | ${b.borderline ?? 0} | ${b.vanilla ?? 0} | ${b.n} | ${b.mean} | ${b.sd} | ${b.min} | ${b.max} |`,
    ),
    '',
    '## Does the rubric discriminate?',
    '',
    'Per-dimension score distribution across the corpus. **A dimension with near-zero sd is dead weight and should be cut from the rubric** — it is not distinguishing tasks, only adding a constant.',
    '',
    '| dim | mean | sd | min | max | #0 | #1 | #2 | #3 |',
    '|---|---|---|---|---|---|---|---|---|',
    ...dimVariance.map(
      (d) => `| ${d.dim} | ${d.mean} | ${d.sd} | ${d.min} | ${d.max} | ${d.hist[0]} | ${d.hist[1]} | ${d.hist[2]} | ${d.hist[3]} |`,
    ),
    '',
    dimVariance.filter((d) => d.sd < 0.35).length
      ? `**Low-variance dimensions (sd < 0.35): ${dimVariance.filter((d) => d.sd < 0.35).map((d) => d.dim).join(', ')}.** These are not doing work on this corpus.`
      : 'All live dimensions show real spread (sd ≥ 0.35).',
    '',
    `Spearman correlation between \`net_live\` and expert time estimate: **${spearman ?? 'n/a'}** (n=${withEst.length}). The rubric weights horizon heavily, so a low value means B3 is being scored inconsistently with the metadata.`,
    '',
    '## Panel reliability',
    '',
    panelled.length
      ? `${panelled.length} tasks went to a 3-judge panel. ${unanimous} unanimous (${r1((unanimous / panelled.length) * 100)}%), ${panelled.length - unanimous} split 2/3. Mean net_live spread across judges: ${stats(panelled.map((x) => x.scores.netLiveSpread ?? 0)).mean}.` +
        (unpanelledBorderline.length ? ` ${unpanelledBorderline.length} additional borderline task(s) have no panel results.` : '')
      : unpanelledBorderline.length
        ? `${unpanelledBorderline.length} tasks are borderline in this one-judge payload; no panel results are present.`
        : 'No tasks landed in the borderline band; no panel ran.',
    '',
    '## Counterfactual quality',
    '',
    `${rows.filter((x) => x.counterfactualEmpty).length}/${rows.length} judgments could not name a concrete vanilla failure mode. On this corpus that clause is the main brake on ceremony bias, so a high number here means the verdicts lean optimistic.`,
    '',
    '## By category',
    '',
    '| category | n | babysitter | share | median net_live |',
    '|---|---|---|---|---|',
    ...byCategory.map((c) => `| ${c.cat} | ${c.n} | ${c.babysitter} | ${r1((c.babysitter / c.n) * 100)}% | ${c.medianNet} |`),
    '',
    '## Strongest babysitter candidates',
    '',
    ...rows
      .filter((x) => x.verdict === 'babysitter')
      .slice(0, 10)
      .map((x, i) => `${i + 1}. **${x.name}** (${x.bench}, ${mins(x.expertMinutes)}, net_live ${r1(x.scores.netLive)}) — ${esc(x.rationale)}`),
    '',
    mismatches.length ? ['## ⚠️ Arithmetic mismatches', '', ...mismatches.map((m) => `- ${m}`)].join('\n') : '',
  ];
while (summaryLines.at(-1) === '') summaryLines.pop();
writeFileSync(path.join(outDir, 'summary.md'), summaryLines.join('\n') + '\n');

console.error(`wrote results.md, results.csv, summary.md to ${outDir}`);
if (mismatches.length) {
  console.error(`WARNING: ${mismatches.length} arithmetic mismatch(es)`);
  process.exitCode = 0; // reported, not fatal — the table is still valid
}
