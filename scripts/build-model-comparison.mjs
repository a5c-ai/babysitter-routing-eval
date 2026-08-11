#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const configPath = path.resolve(process.argv[2] ?? 'inputs/model-comparison.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const outDir = path.resolve(config.outDir ?? 'out/models/comparison');
const verdicts = ['babysitter', 'borderline', 'vanilla'];
const r1 = (n) => Math.round(n * 10) / 10;
const csv = (value) => {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

if (!Array.isArray(config.models) || config.models.length < 2) {
  throw new Error('comparison config must contain at least two models');
}

const modelIds = config.models.map((model) => model.id);
if (modelIds.some((id) => typeof id !== 'string' || !id)) {
  throw new Error('every comparison model must have a non-empty id');
}
if (new Set(modelIds).size !== modelIds.length) {
  throw new Error('comparison model ids must be unique');
}

const models = config.models.map((model) => {
  const payloadPath = path.resolve(model.payload);
  const payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
  if (!Array.isArray(payload.rows) || payload.rows.length === 0) {
    throw new Error(`${model.id} payload must contain a non-empty rows array`);
  }
  const rowIds = payload.rows.map((row) => row.id);
  if (rowIds.some((id) => typeof id !== 'string' || !id)) {
    throw new Error(`${model.id} contains a row without a valid task id`);
  }
  if (new Set(rowIds).size !== rowIds.length) {
    throw new Error(`${model.id} contains duplicate task ids`);
  }
  return {
    ...model,
    payloadPath,
    payload,
    byId: new Map(payload.rows.map((row) => [row.id, row])),
  };
});

const thresholds = config.thresholds ?? models[0].payload.thresholds;
if (
  !Number.isFinite(thresholds?.low) ||
  !Number.isFinite(thresholds?.high) ||
  thresholds.low >= thresholds.high
) {
  throw new Error('comparison thresholds must be finite numbers with low < high');
}

// A model may be missing tasks it declined to score: content-policy boundaries differ by
// vendor, and that asymmetry is data worth keeping rather than a reason to abort. The union
// must still cover the manifest exactly; per-model gaps are reported as `refused`.
const taskIds = [...new Set(models.flatMap((m) => [...m.byId.keys()]))].sort();
for (const model of models) {
  const missing = taskIds.filter((id) => !model.byId.has(id));
  if (missing.length) {
    console.error(`note: ${model.id} has no judgment for ${missing.length} task(s): ${missing.join(', ')}`);
  }
}
if (config.manifest) {
  const manifest = JSON.parse(readFileSync(path.resolve(config.manifest), 'utf8'));
  const manifestIds = (manifest.tasks ?? []).map((task) => task.id).sort();
  if (
    manifestIds.length !== taskIds.length ||
    manifestIds.some((id, index) => id !== taskIds[index])
  ) {
    throw new Error('model payloads do not contain the exact manifest task set');
  }
}

function recommendation(model, row) {
  if ((model.verdictMode ?? 'stored') === 'stored') {
    if (!verdicts.includes(row.verdict)) {
      throw new Error(`${model.id} has invalid stored verdict for ${row.id}: ${row.verdict}`);
    }
    return row.verdict;
  }
  if (model.verdictMode === 'primary-score') {
    const netLive = row.scores?.netLive;
    if (!Number.isFinite(netLive)) {
      throw new Error(`${model.id} has invalid net_live for ${row.id}`);
    }
    return netLive >= thresholds.high
      ? 'babysitter'
      : netLive <= thresholds.low ? 'vanilla' : 'borderline';
  }
  throw new Error(`unsupported verdictMode for ${model.id}: ${model.verdictMode}`);
}

const rows = taskIds.map((id) => {
  const source = models[0].byId.get(id);
  const recommendations = Object.fromEntries(models.map((model) => {
    const row = model.byId.get(id);
    if (!row) return [model.id, { verdict: 'refused', netLive: null }];
    return [model.id, {
      verdict: recommendation(model, row),
      netLive: row.scores.netLive,
    }];
  }));
  const voted = Object.values(recommendations).filter((item) => item.verdict !== 'refused');
  const tally = voted.reduce(
    (counts, item) => ({ ...counts, [item.verdict]: (counts[item.verdict] ?? 0) + 1 }),
    {},
  );
  const maxVotes = voted.length ? Math.max(...Object.values(tally)) : 0;
  const winners = Object.entries(tally).filter(([, count]) => count === maxVotes).map(([name]) => name);
  // Majority is taken over models that actually answered, so a refusal abstains rather
  // than dragging a task toward `undecided`.
  const consensus = !voted.length
    ? 'no-judgment'
    : winners.length === 1 && maxVotes > voted.length / 2
      ? winners[0]
      : voted.length < 3 ? 'needs-third-judge' : 'undecided';
  return {
    id,
    bench: source.bench,
    name: source.name,
    recommendations,
    consensus,
    agreement: `${maxVotes}/${models.length}`,
    unanimous: maxVotes === models.length,
  };
});

const modelSummaries = Object.fromEntries(models.map((model) => [model.id, {
  ...Object.fromEntries(verdicts.map((verdict) => [
    verdict,
    rows.filter((row) => row.recommendations[model.id].verdict === verdict).length,
  ])),
  meanNetLive: r1(rows.reduce(
    (sum, row) => sum + row.recommendations[model.id].netLive,
    0,
  ) / rows.length),
}]));

const pairwise = Object.fromEntries(models.map((left) => [left.id, Object.fromEntries(
  models.map((right) => [right.id, rows.filter(
    (row) => row.recommendations[left.id].verdict === row.recommendations[right.id].verdict,
  ).length]),
)]));
const unanimous = rows.filter((row) => row.unanimous).length;
const needsThirdJudge = rows.filter((row) => row.consensus === 'needs-third-judge').length;

const report = {
  generatedAt:
    models
      .map((model) => model.payload.generatedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null,
  taskCount: rows.length,
  thresholds,
  models: models.map((model) => ({
    id: model.id,
    label: model.label,
    payload: path.relative(process.cwd(), model.payloadPath),
    runId: model.payload.runId,
    verdictMode: model.verdictMode ?? 'stored',
    notes: model.notes ?? null,
  })),
  summary: { unanimous, needsThirdJudge, modelSummaries, pairwise },
  rows,
};

const markdown = [
  '# Multi-model routing comparison',
  '',
  `Corpus: ${rows.length} tasks · models: ${models.length} · unanimous: ${unanimous}/${rows.length} (${r1((unanimous / rows.length) * 100)}%)` +
    (needsThirdJudge ? ` · awaiting a third judge: ${needsThirdJudge}` : ''),
  '',
  '## Judge protocol',
  '',
  '| model | source | verdict mode | notes |',
  '|---|---|---|---|',
  ...models.map((model) => `| ${model.label} | \`${path.relative(process.cwd(), model.payloadPath)}\` | ${model.verdictMode ?? 'stored'} | ${model.notes ?? ''} |`),
  '',
  'Recommendations use each model\'s configured verdict mode and the shared thresholds where `primary-score` is selected. The score in parentheses is the payload\'s primary `net_live`; a stored verdict may reflect a panel.',
  '',
  '## Recommendation counts',
  '',
  '| model | babysitter | borderline | vanilla | mean net_live |',
  '|---|---:|---:|---:|---:|',
  ...models.map((model) => {
    const summary = modelSummaries[model.id];
    return `| ${model.label} | ${summary.babysitter} | ${summary.borderline} | ${summary.vanilla} | ${summary.meanNetLive} |`;
  }),
  '',
  '## Pairwise verdict agreement',
  '',
  `| | ${models.map((model) => model.label).join(' | ')} |`,
  `|---|${models.map(() => '---:').join('|')}|`,
  ...models.map((left) => `| ${left.label} | ${models.map((right) => {
    const count = pairwise[left.id][right.id];
    return `${count}/${rows.length} (${r1((count / rows.length) * 100)}%)`;
  }).join(' | ')} |`),
  '',
  '## Tasks',
  '',
  `| task | ${models.map((model) => model.label).join(' | ')} | consensus | agreement |`,
  `|---|${models.map(() => '---').join('|')}|---|---:|`,
  ...rows.map((row) => `| ${row.id} | ${models.map((model) => {
    const result = row.recommendations[model.id];
    return `${result.verdict} (${result.netLive})`;
  }).join(' | ')} | ${row.consensus} | ${row.agreement} |`),
  '',
];

const csvHeader = [
  'id', 'bench', 'name',
  ...models.flatMap((model) => [`${model.id}_verdict`, `${model.id}_net_live`]),
  'consensus', 'agreement',
];
const csvRows = rows.map((row) => [
  row.id, row.bench, row.name,
  ...models.flatMap((model) => [
    row.recommendations[model.id].verdict,
    row.recommendations[model.id].netLive,
  ]),
  row.consensus, row.agreement,
]);

mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'comparison.json'), JSON.stringify(report, null, 2));
writeFileSync(path.join(outDir, 'comparison.md'), markdown.join('\n'));
writeFileSync(
  path.join(outDir, 'comparison.csv'),
  [csvHeader, ...csvRows].map((row) => row.map(csv).join(',')).join('\n') + '\n',
);

console.error(`compared ${rows.length} tasks across ${models.length} models -> ${outDir}`);
console.error(`unanimous ${unanimous}/${rows.length}; needs third judge ${needsThirdJudge}`);
