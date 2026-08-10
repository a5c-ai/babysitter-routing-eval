#!/usr/bin/env node
/**
 * Emit a self-contained HTML report from out/payload.json.
 *
 * Palettes are the dataviz reference instance, validated with the skill's
 * validate_palette.js before use:
 *   verdict (diverging blue/gray/red) — real gates pass both modes
 *   ordinal ramp (blue 4 steps)       — ALL PASS both modes
 *   scatter series (blue/orange)      — ALL PASS both modes, --pairs all
 *
 * Usage: node scripts/build-html-report.mjs out/payload.json out/report.html
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const payloadPath = path.resolve(process.argv[2] ?? 'out/payload.json');
const outPath = path.resolve(process.argv[3] ?? 'out/report.html');
const manifestPath = path.resolve(process.argv[4] ?? 'out/manifest.json');
const p = JSON.parse(readFileSync(payloadPath, 'utf8'));

// The instruction is the judge's entire evidence base, so the report shows it verbatim
// beside the scores. Sourced from the manifest rather than the payload, which omits it.
let instructions = {};
let testFiles = {};
try {
  const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const t of m.tasks) {
    instructions[t.id] = t.instruction;
    testFiles[t.id] = t.testFiles;
  }
} catch (e) {
  console.error(`warn: no manifest at ${manifestPath} — instructions omitted (${e.message})`);
}

const rows = p.rows.map((r) => ({
  instruction: instructions[r.id] ?? null,
  tests: testFiles[r.id] ?? null,
  id: r.id,
  bench: r.bench,
  name: r.name,
  category: r.category ?? 'uncategorised',
  difficulty: r.difficulty ?? null,
  em: r.expertMinutes,
  verdict: r.verdict,
  net: r.scores.netLive,
  ben: r.scores.benefitLive,
  cost: r.scores.costLive,
  netRaw: r.scores.netRaw,
  spread: r.scores.netLiveSpread ?? null,
  dims: r.dimensions,
  ev: r.evidence,
  tb: r.topBenefitDriver,
  tc: r.topCostDriver,
  rec: r.processRecommendation,
  cf: r.vanillaFailureMode,
  rationale: r.rationale,
  panel: !!r.panel,
  agree: r.agreement,
  pv: r.panelVerdicts,
}));

const meta = {
  generatedAt: p.generatedAt,
  runId: p.runId,
  manifest: p.manifest,
  thresholds: p.thresholds,
  weights: p.weights,
  pins: p.weights.PINS,
};

const html = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Terminal-Bench → Babysitter routing report</title>
<style>
:root {
  color-scheme: light;
  --page:#f9f9f7; --surface:#fcfcfb;
  --ink:#0b0b0b; --ink-2:#52514e; --muted:#898781;
  --grid:#e1e0d9; --axis:#c3c2b7; --ring:rgba(11,11,11,0.10);
  --v-bab:#2a78d6; --v-bor:#898781; --v-van:#e34948;
  --o1:#86b6ef; --o2:#3987e5; --o3:#1c5cab; --o4:#0d366b;
  --s1:#2a78d6; --s2:#eb6834;
  --good:#0ca30c; --warning:#fab219; --critical:#d03b3b;
}
@media (prefers-color-scheme: dark) {
  :root:where(:not([data-theme="light"])) {
    color-scheme: dark;
    --page:#0d0d0d; --surface:#1a1a19;
    --ink:#ffffff; --ink-2:#c3c2b7; --muted:#898781;
    --grid:#2c2c2a; --axis:#383835; --ring:rgba(255,255,255,0.10);
    --v-bab:#3987e5; --v-bor:#b5b4a8; --v-van:#e66767;
    --o1:#b7d3f6; --o2:#6da7ec; --o3:#2a78d6; --o4:#184f95;
    --s1:#3987e5; --s2:#d95926;
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --page:#0d0d0d; --surface:#1a1a19;
  --ink:#ffffff; --ink-2:#c3c2b7; --muted:#898781;
  --grid:#2c2c2a; --axis:#383835; --ring:rgba(255,255,255,0.10);
  --v-bab:#3987e5; --v-bor:#b5b4a8; --v-van:#e66767;
  --o1:#b7d3f6; --o2:#6da7ec; --o3:#2a78d6; --o4:#184f95;
  --s1:#3987e5; --s2:#d95926;
}

* { box-sizing:border-box; }
body {
  margin:0; background:var(--page); color:var(--ink);
  font:15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;
}
.wrap { max-width:1240px; margin:0 auto; padding:32px 24px 80px; }
header.top { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; flex-wrap:wrap; margin-bottom:8px; }
h1 { font-size:26px; line-height:1.25; margin:0 0 6px; font-weight:650; letter-spacing:-0.01em; }
.sub { color:var(--ink-2); font-size:13.5px; margin:0; }
.sub code { background:color-mix(in srgb, var(--ink) 7%, transparent); padding:1px 5px; border-radius:4px; font-size:12.5px; }
h2 { font-size:18px; margin:44px 0 4px; font-weight:640; letter-spacing:-0.005em; }
h2:first-of-type { margin-top:32px; }
.lede { color:var(--ink-2); font-size:13.5px; margin:0 0 16px; max-width:76ch; }

button, select, input { font:inherit; color:inherit; }
.tbtn {
  background:var(--surface); border:1px solid var(--ring); color:var(--ink-2);
  border-radius:8px; padding:7px 12px; cursor:pointer; font-size:13px;
}
.tbtn:hover { background:color-mix(in srgb, var(--ink) 5%, var(--surface)); }

/* ---------- KPI row ---------- */
.kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(178px,1fr)); gap:12px; margin:22px 0 8px; }
.tile { background:var(--surface); border:1px solid var(--ring); border-radius:12px; padding:14px 16px; }
.tile .lab { font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:0.045em; font-weight:600; }
.tile .val { font-size:32px; font-weight:660; line-height:1.15; margin-top:6px; letter-spacing:-0.02em; }
.tile .note { font-size:12.5px; color:var(--ink-2); margin-top:3px; }
.tile .val .swatch { display:inline-block; width:11px; height:11px; border-radius:3px; vertical-align:middle; margin-right:7px; }

/* ---------- filters ---------- */
.filters {
  display:flex; gap:10px; flex-wrap:wrap; align-items:center;
  background:var(--surface); border:1px solid var(--ring); border-radius:12px;
  padding:12px 14px; margin:20px 0 4px; position:sticky; top:0; z-index:20;
}
.filters label { font-size:12px; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:0.04em; }
.filters select, .filters input {
  background:var(--page); border:1px solid var(--ring); border-radius:8px; padding:6px 10px; font-size:13px;
}
.filters input { min-width:230px; }
.fcount { margin-left:auto; font-size:13px; color:var(--ink-2); }

/* ---------- chart cards ---------- */
.grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
@media (max-width:900px){ .grid2 { grid-template-columns:1fr; } }
.card { background:var(--surface); border:1px solid var(--ring); border-radius:12px; padding:18px 18px 14px; margin-top:12px; }
.card h3 { font-size:14.5px; margin:0 0 2px; font-weight:640; }
.card .cap { font-size:12.5px; color:var(--ink-2); margin:0 0 14px; }
.legend { display:flex; gap:16px; flex-wrap:wrap; font-size:12.5px; color:var(--ink-2); margin:10px 0 0; align-items:center; }
.legend .k { display:inline-flex; align-items:center; gap:6px; }
.legend .sw { width:11px; height:11px; border-radius:3px; display:inline-block; }
svg { display:block; width:100%; overflow:visible; }
.gridline { stroke:var(--grid); stroke-width:1; }
.axisline { stroke:var(--axis); stroke-width:1; }
.tick { fill:var(--muted); font-size:11px; font-variant-numeric:tabular-nums; }
.axlab { fill:var(--ink-2); font-size:11.5px; }
/* labels sit over their mark; without this they swallow the hover and the tooltip never fires */
.dlabel { fill:var(--ink); font-size:11.5px; font-weight:600; font-variant-numeric:tabular-nums; pointer-events:none; }
.dlabel.on-mark { fill:#fff; }
.tick, .axlab { pointer-events:none; }

.datatoggle { margin-top:12px; }
.datatoggle summary { cursor:pointer; font-size:12.5px; color:var(--ink-2); }
.datatoggle table { margin-top:10px; }

/* ---------- tables ---------- */
table { border-collapse:collapse; width:100%; font-size:13px; }
th, td { text-align:left; padding:7px 10px; border-bottom:1px solid var(--grid); vertical-align:top; }
th { font-size:11.5px; text-transform:uppercase; letter-spacing:0.04em; color:var(--muted); font-weight:650; white-space:nowrap; }
td.num, th.num { text-align:right; font-variant-numeric:tabular-nums; }
tbody tr:hover { background:color-mix(in srgb, var(--ink) 4%, transparent); }
th.sortable { cursor:pointer; user-select:none; }
th.sortable:hover { color:var(--ink); }
th .arrow { opacity:0.45; }

.pill { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:600; white-space:nowrap; }
.pill .sw { width:9px; height:9px; border-radius:3px; }

.rowbtn { background:none; border:none; padding:0; cursor:pointer; text-align:left; font-weight:600; color:var(--ink); text-decoration:underline; text-decoration-color:var(--ring); text-underline-offset:3px; }
.detail td { background:color-mix(in srgb, var(--ink) 3%, transparent); }
.detail h4 { margin:2px 0 6px; font-size:12px; text-transform:uppercase; letter-spacing:0.04em; color:var(--muted); }
.detail p { margin:0 0 12px; font-size:13px; max-width:96ch; color:var(--ink-2); }
.dimgrid { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:8px 18px; margin-bottom:12px; }
.dimgrid .d { font-size:12.5px; color:var(--ink-2); }
.dimgrid .d b { color:var(--ink); font-variant-numeric:tabular-nums; }
.crit { display:grid; grid-template-columns:1fr 1fr; gap:22px 30px; }
@media (max-width:900px){ .crit { grid-template-columns:1fr; } }
.crit h5 { margin:0 0 8px; font-size:11.5px; text-transform:uppercase; letter-spacing:0.04em; color:var(--muted); font-weight:650; }
.crit dl { margin:0; display:grid; grid-template-columns:auto 1fr; gap:5px 12px; align-items:baseline; }
.crit dt { font-size:12.5px; font-weight:650; white-space:nowrap; }
.crit dt .w { color:var(--muted); font-weight:500; font-variant-numeric:tabular-nums; font-size:11.5px; margin-left:5px; }
.crit dd { margin:0; font-size:12.5px; color:var(--ink-2); }
.crit dt.pinned { color:var(--muted); }
.crit .pin { display:inline-block; min-width:16px; text-align:center; font-variant-numeric:tabular-nums;
  background:color-mix(in srgb, var(--ink) 8%, transparent); border-radius:4px; padding:0 4px; margin-left:5px; font-size:11.5px; }
.crit .foot { grid-column:1/-1; font-size:12px; color:var(--muted); margin-top:2px; }
pre.instr {
  margin:0 0 14px; padding:12px 14px; max-height:280px; overflow:auto;
  background:var(--page); border:1px solid var(--ring); border-radius:8px;
  font:12.5px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;
  white-space:pre-wrap; word-break:break-word; color:var(--ink-2); max-width:110ch;
}
.detail h4 code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px; text-transform:none; letter-spacing:0; }
.dots { display:inline-flex; gap:2px; vertical-align:middle; margin:0 6px; }
.dots i { width:7px; height:7px; border-radius:2px; background:var(--grid); display:block; }
.dots i.on { background:var(--o3); }

.callout { border-left:3px solid var(--warning); background:color-mix(in srgb, var(--warning) 9%, transparent); padding:12px 16px; border-radius:0 8px 8px 0; margin:14px 0; font-size:13.5px; }
.callout b { font-weight:650; }
.tip {
  position:fixed; pointer-events:none; z-index:60; opacity:0; transition:opacity .1s;
  background:var(--surface); border:1px solid var(--ring); border-radius:8px;
  padding:8px 11px; font-size:12.5px; box-shadow:0 4px 16px rgba(0,0,0,.14); max-width:300px;
}
.tip .t-title { font-weight:650; margin-bottom:3px; }
.tip .t-row { color:var(--ink-2); font-variant-numeric:tabular-nums; }
footer { margin-top:56px; padding-top:20px; border-top:1px solid var(--grid); font-size:12.5px; color:var(--muted); }

@media (forced-colors: active) {
  .tile, .card, .filters { border:1px solid CanvasText; }
  rect, circle { forced-color-adjust:none; }
}
</style>
</head>
<body>
<div class="wrap">

<header class="top">
  <div>
    <h1>Which Terminal-Bench tasks benefit from Babysitter?</h1>
    <p class="sub">
      163 tasks scored against the babysitter-vs-vanilla rubric ·
      tb2.1 <code>__TB21SHA__</code> · tb3 <code>__TB3SHA__</code> ·
      run <code>__RUNID__</code> · __GENAT__
    </p>
  </div>
  <button class="tbtn" id="theme">◐ Theme</button>
</header>

<div class="kpis" id="kpis"></div>

<div class="callout" id="callout"></div>

<div class="filters">
  <label for="f-bench">Benchmark</label>
  <select id="f-bench"><option value="">All</option><option value="tb2.1">tb2.1</option><option value="tb3">tb3</option></select>
  <label for="f-verdict">Verdict</label>
  <select id="f-verdict"><option value="">All</option><option value="babysitter">babysitter</option><option value="borderline">borderline</option><option value="vanilla">vanilla</option></select>
  <label for="f-cat">Category</label>
  <select id="f-cat"><option value="">All</option></select>
  <label for="f-q" class="sr">Search</label>
  <input id="f-q" type="search" placeholder="Search task, instruction, evidence…">
  <button class="tbtn" id="f-reset">Reset</button>
  <span class="fcount" id="fcount"></span>
</div>

<h2>Summary</h2>
<p class="lede">
  Every task is verifiable, sandboxed and headless, so <span id="nPinned"></span> of the
  <span id="nDims"></span> rubric dimensions are constant across this corpus and are pinned rather than
  scored. <code>net_live</code> renormalizes over the <span id="nLive"></span> that vary, preserving the
  base rubric's scale so its pre-registered thresholds (babysitter ≥ __HIGH__, vanilla ≤ __LOW__) still
  apply.
</p>

<div class="card" id="legend-card">
  <h3>What the criteria mean</h3>
  <p class="cap">Each dimension is scored 0&ndash;3 with cited evidence. Benefit dimensions push toward
    <b>babysitter</b>, cost dimensions push toward <b>vanilla</b>; the weight is that dimension's share of its
    side of the scale.</p>
  <div id="criteria"></div>
</div>

<div class="grid2">
  <div class="card">
    <h3>Verdict split by benchmark</h3>
    <p class="cap">Diverging stacked bar, centred on the neutral “borderline” band.</p>
    <div id="c-verdict"></div>
    <div class="legend" id="l-verdict"></div>
    <details class="datatoggle"><summary>Show data table</summary><div id="t-verdict"></div></details>
  </div>
  <div class="card">
    <h3>Distribution of net_live</h3>
    <p class="cap">Each bar is a 10-point bin, stacked by the verdict its tasks received. Bins holding more
      than one colour are the panel at work: <code>net_live</code> here is the first judge's score, while the
      verdict is the majority of three — so a panelled task can land on the other side of its own bin.</p>
    <div id="c-hist"></div>
    <div class="legend" id="l-hist"></div>
    <details class="datatoggle"><summary>Show data table</summary><div id="t-hist"></div></details>
  </div>
</div>

<div class="card">
  <h3>Does net_live just re-measure task length?</h3>
  <p class="cap">net_live against the task's expert time estimate (log scale). Spearman ρ = <b id="rho"></b>. If this were ≈1.0 the rubric would be an expensive proxy for a number already in <code>task.toml</code>.</p>
  <div id="c-scatter"></div>
  <div class="legend" id="l-scatter"></div>
</div>

<div class="grid2">
  <div class="card">
    <h3>Which dimensions actually discriminate?</h3>
    <p class="cap">Score distribution per live dimension. A dimension whose mass sits in one bucket adds a constant, not information.</p>
    <div id="c-dims"></div>
    <div class="legend" id="l-dims"></div>
    <details class="datatoggle"><summary>Show data table</summary><div id="t-dims"></div></details>
  </div>
  <div class="card">
    <h3>Babysitter share by category</h3>
    <p class="cap">Share of each category's tasks routed to babysitter. Categories with n &lt; 3 are grouped
      as “Other”. The two benchmarks ship different category vocabularies (<code>security</code> vs
      <code>Security</code>, <code>machine-learning</code> vs <code>ML</code>); they are left unmerged rather
      than mapped by guesswork.</p>
    <div id="c-cat"></div>
    <details class="datatoggle"><summary>Show data table</summary><div id="t-cat"></div></details>
  </div>
</div>

<h2>Details</h2>
<p class="lede">All __N__ judgments. Click a task to see the verbatim instruction the judge scored from, its
per-dimension scores with the evidence cited for each, the counterfactual failure mode, and the panel votes
where a panel ran. Search covers instruction text as well as evidence.</p>
<div class="card" style="padding:6px 4px 4px;"><div id="tablewrap"></div></div>

<footer>
  Scores: <code>net_live = Benefit_live − Cost_live</code>, each renormalized to 0–100 over the live
  dimensions (benefit B1·15 B3·15 B5·10 B6·8 B8·10 ÷58; cost C2·27 C4·34 ÷61).
  Pinned constants: B2=3, B4=0, B7=1, C3=3, C5=0, C6=0. C1 (process-authoring cost) was removed from the rubric: it measured Babysitter's library coverage rather than the task.
  Palettes validated with the dataviz skill's <code>validate_palette.js</code> in both modes.
  Generated from <code>out/payload.json</code>; regenerate with
  <code>node scripts/build-html-report.mjs</code>.
</footer>
</div>

<div class="tip" id="tip"></div>

<script>
const DATA = __DATA__;
const META = __META__;
const VERDICTS = ['babysitter','borderline','vanilla'];
const VC = { babysitter:'var(--v-bab)', borderline:'var(--v-bor)', vanilla:'var(--v-van)' };
const LIVE_B = META.weights.LIVE_BENEFIT, LIVE_C = META.weights.LIVE_COST;
const DIMS = [...LIVE_B, ...LIVE_C];
const DIM_LABEL = {
  B1:'B1 ordering', B3:'B3 horizon', B5:'B5 convergence', B6:'B6 decomposability', B8:'B8 drift risk',
  C2:'C2 overhead', C4:'C4 uncertainty'
};
// One line per criterion. A score of 3 always means "most of this quality" — for a cost
// dimension that is the most discouraging value.
const DIM_DEF = {
  B1:'Is there a required order whose violation silently corrupts the result?',
  B2:'Do deterministic pass/fail checks exist and actually run?',
  B3:'Will the work outlast one context window or one sitting?',
  B4:'Are there irreversible, outward-facing actions needing sign-off?',
  B5:'Can quality be reached by scored iterate-until-target loops?',
  B6:'Are there independent units that could fan out in parallel?',
  B7:'Will this run again for other inputs, or need an audit trail?',
  B8:'How likely is the agent to wander scope or call it done too early?',
  C2:'How big is the orchestration overhead next to the actual work?',
  C3:'Can a human actually answer a breakpoint mid-run?',
  C4:'Is the shape of the work unknown until you start investigating?',
  C5:'Must anything be installed or configured just for this task?',
  C6:'Is someone waiting on the result right now?',
};
const PIN_WHY = {
  B2:'every task ships tests/ and a verifier',
  B4:'disposable container; nothing pushed, deployed or spent',
  B7:'benchmark re-runs across models, but no per-task audit duty',
  C3:'headless by construction',
  C5:'Harbor provisions the environment',
  C6:'batch evaluation; nobody waiting on one task',
};
const SURFACE = () => getComputedStyle(document.body).getPropertyValue('--surface').trim() || '#fcfcfb';

const fmtMin = m => m == null ? '—' : (m >= 60 ? (Math.round(m/60*10)/10) + 'h' : m + 'm');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const r1 = n => n == null ? '' : Math.round(n*10)/10;

/* ---------------- state ---------------- */
const state = { bench:'', verdict:'', cat:'', q:'', sort:'net', dir:-1, open:new Set() };
function filtered() {
  const q = state.q.toLowerCase();
  return DATA.filter(r =>
    (!state.bench || r.bench === state.bench) &&
    (!state.verdict || r.verdict === state.verdict) &&
    (!state.cat || r.category === state.cat) &&
    (!q || (r.name + ' ' + r.category + ' ' + (r.rationale||'') + ' ' + (r.cf||'') + ' ' + (r.instruction||'') + ' ' + Object.values(r.ev||{}).join(' ')).toLowerCase().includes(q))
  );
}

/* ---------------- tooltip ---------------- */
const tip = document.getElementById('tip');
function showTip(e, title, lines) {
  tip.innerHTML = '<div class="t-title">' + esc(title) + '</div>' +
    lines.map(l => '<div class="t-row">' + esc(l) + '</div>').join('');
  tip.style.opacity = 1;
  const r = tip.getBoundingClientRect();
  let x = e.clientX + 14, y = e.clientY + 14;
  if (x + r.width > innerWidth - 8) x = e.clientX - r.width - 14;
  if (y + r.height > innerHeight - 8) y = e.clientY - r.height - 14;
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
const hideTip = () => (tip.style.opacity = 0);
function hoverable(el, title, lines) {
  el.style.cursor = 'default';
  el.addEventListener('mousemove', e => showTip(e, title, lines));
  el.addEventListener('mouseleave', hideTip);
  el.setAttribute('tabindex', '0');
  el.addEventListener('focus', e => {
    const b = el.getBoundingClientRect();
    showTip({ clientX: b.left + b.width/2, clientY: b.top }, title, lines);
  });
  el.addEventListener('blur', hideTip);
}
const SVGNS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs) {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k,v] of Object.entries(attrs||{})) e.setAttribute(k, v);
  return e;
}
function mkSvg(host, w, h) {
  host.innerHTML = '';
  const s = svgEl('svg', { viewBox: '0 0 ' + w + ' ' + h, role:'img' });
  host.appendChild(s);
  return s;
}
function legend(host, items) {
  host.innerHTML = items.map(i =>
    '<span class="k"><span class="sw" style="background:' + i.c + '"></span>' + esc(i.l) + '</span>'
  ).join('');
}
function dataTable(host, cols, rowsIn) {
  host.innerHTML = '<table><thead><tr>' +
    cols.map((c,i) => '<th' + (i ? ' class="num"' : '') + '>' + esc(c) + '</th>').join('') +
    '</tr></thead><tbody>' +
    rowsIn.map(r => '<tr>' + r.map((c,i) => '<td' + (i ? ' class="num"' : '') + '>' + esc(c) + '</td>').join('') + '</tr>').join('') +
    '</tbody></table>';
}

/* ---------------- callout + counts (derived, never hardcoded) ---------------- */
const NUMWORD = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen'];
function renderCallout() {
  const panel = DATA.filter(r => r.panel);
  const unan = panel.filter(r => r.agree === '3/3').length;
  const spread = panel.length
    ? Math.round(panel.reduce((a, r) => a + (r.spread ?? 0), 0) / panel.length * 10) / 10 : null;
  document.getElementById('callout').innerHTML = panel.length
    ? '<b>Read the individual verdicts with care.</b> Of the ' + panel.length +
      ' tasks decided by a 3-judge panel, <b>' + unan + ' (' + Math.round(unan / panel.length * 100) +
      '%)</b> were unanimous, and the mean <code>net_live</code> spread across judges was <b>' + spread +
      ' points</b> on a −100…+100 scale. The aggregate skew between benchmarks is solid; a single ' +
      "task's verdict near the threshold is not."
    : '<b>No panel data.</b> Every verdict here rests on a single judgment.';

  const nLive = LIVE_B.length + LIVE_C.length;
  const nPin = Object.keys(META.pins).length;
  document.getElementById('nLive').textContent = NUMWORD[nLive] ?? nLive;
  document.getElementById('nPinned').textContent = NUMWORD[nPin] ?? nPin;
  document.getElementById('nDims').textContent = NUMWORD[nLive + nPin] ?? (nLive + nPin);
}

/* ---------------- criteria legend (static; independent of filters) ---------------- */
function renderCriteria() {
  const BW = META.weights.BENEFIT_W, CW = META.weights.COST_W, PIN = META.pins;
  const live = (ids, W) => '<dl>' + ids.map(id =>
    '<dt>' + esc(DIM_LABEL[id] || id) + '<span class="w">' + W[id] + '</span></dt>' +
    '<dd>' + esc(DIM_DEF[id]) + '</dd>').join('') + '</dl>';
  const pinned = Object.keys(PIN).map(id =>
    '<dt class="pinned">' + id + '<span class="pin">' + PIN[id] + '</span></dt>' +
    '<dd>' + esc(DIM_DEF[id]) + ' <em>&mdash; ' + esc(PIN_WHY[id] || '') + '</em></dd>').join('');
  document.getElementById('criteria').innerHTML =
    '<div class="crit">' +
      '<div><h5>Scored per task &mdash; benefit (pushes toward babysitter)</h5>' + live(LIVE_B, BW) +
        '<h5 style="margin-top:16px">Scored per task &mdash; cost (pushes toward vanilla)</h5>' + live(LIVE_C, CW) + '</div>' +
      '<div><h5>Pinned constant across all 163 tasks &mdash; not scored</h5><dl>' + pinned + '</dl>' +
        '<p class="foot">A former <b>C1 &ldquo;does a library process already fit?&rdquo;</b> was removed: it measured ' +
        'Babysitter&rsquo;s library coverage rather than the task, and was the noisiest dimension in the panel.</p></div>' +
    '</div>';
}

/* ---------------- KPIs ---------------- */
function renderKpis(rows) {
  const c = Object.fromEntries(VERDICTS.map(v => [v, rows.filter(r => r.verdict===v).length]));
  const panel = rows.filter(r => r.panel);
  const unan = panel.filter(r => r.agree === '3/3').length;
  const el = document.getElementById('kpis');
  const tile = (lab, val, note) => '<div class="tile"><div class="lab">' + lab + '</div><div class="val">' + val + '</div><div class="note">' + note + '</div></div>';
  const sw = v => '<span class="swatch" style="background:' + VC[v] + '"></span>';
  el.innerHTML =
    tile('Tasks judged', rows.length, rows.length === DATA.length ? 'tb2.1 ' + META.manifest.counts['tb2.1'] + ' · tb3 ' + META.manifest.counts['tb3'] : 'of ' + DATA.length + ' total') +
    tile('Babysitter', sw('babysitter') + c.babysitter, pct(c.babysitter, rows.length) + ' of selection') +
    tile('Borderline', sw('borderline') + c.borderline, 'still split after 3 judges') +
    tile('Vanilla', sw('vanilla') + c.vanilla, pct(c.vanilla, rows.length) + ' of selection') +
    tile('Panel unanimity', panel.length ? Math.round(unan/panel.length*100) + '%' : '—', panel.length ? unan + ' of ' + panel.length + ' tasks 3/3' : 'no panel in selection');
}
const pct = (a,b) => b ? Math.round(a/b*100) + '%' : '0%';

/* ---------------- chart: verdict by bench (diverging stacked) ---------------- */
function renderVerdict(rows) {
  const benches = ['tb2.1','tb3'].filter(b => rows.some(r => r.bench===b));
  const groups = [{ key:'all', label:'All tasks', rows }, ...benches.map(b => ({ key:b, label:b, rows: rows.filter(r => r.bench===b) }))];
  const W = 560, rowH = 46, padT = 18, padB = 34, padL = 96, padR = 16;
  const H = padT + groups.length*rowH + padB;
  const plotW = W - padL - padR;
  const s = mkSvg(document.getElementById('c-verdict'), W, H);
  s.setAttribute('aria-label', 'Verdict split by benchmark');
  // Centre the neutral band on the midline. Scale from the widest *arm*, not the row
  // total — otherwise the longest left arm overruns padL and collides with the label.
  const mid = padL + plotW/2;
  const arms = groups.map(g => {
    const c = v => g.rows.filter(r => r.verdict===v).length;
    return { l: c('vanilla') + c('borderline')/2, r: c('babysitter') + c('borderline')/2 };
  });
  const halfW = plotW/2 * 0.95;
  const scale = Math.min(
    halfW / Math.max(...arms.map(a => a.l), 1),
    halfW / Math.max(...arms.map(a => a.r), 1),
  );

  groups.forEach((g, i) => {
    const y = padT + i*rowH + 8;
    const bh = 22;
    const n = g.rows.length || 1;
    const cnt = Object.fromEntries(VERDICTS.map(v => [v, g.rows.filter(r => r.verdict===v).length]));
    const left = cnt.vanilla*scale, neu = cnt.borderline*scale, right = cnt.babysitter*scale;
    let x = mid - left - neu/2;
    const segs = [
      { v:'vanilla', w:left }, { v:'borderline', w:neu }, { v:'babysitter', w:right },
    ];
    s.appendChild(svgEl('text', { x: padL-12, y: y+bh/2+4, 'text-anchor':'end', class:'axlab' })).textContent = g.label;
    segs.forEach(seg => {
      if (seg.w <= 0) return;
      const w = Math.max(seg.w - 2, 1); // 2px surface gap between fills
      const rect = svgEl('rect', { x, y, width:w, height:bh, rx:4, fill:VC[seg.v] });
      hoverable(rect, g.label, [seg.v + ': ' + cnt[seg.v] + ' tasks', pct(cnt[seg.v], n) + ' of ' + n]);
      s.appendChild(rect);
      if (w > 30) {
        const t = svgEl('text', { x: x + w/2, y: y+bh/2+4, 'text-anchor':'middle', class:'dlabel on-mark' });
        t.textContent = cnt[seg.v];
        s.appendChild(t);
      }
      x += seg.w;
    });
  });
  s.appendChild(svgEl('line', { x1:mid, y1:padT, x2:mid, y2:padT+groups.length*rowH, class:'axisline' }));
  const cap = svgEl('text', { x:mid, y:H-12, 'text-anchor':'middle', class:'tick' });
  cap.textContent = '← vanilla    |    babysitter →';
  s.appendChild(cap);

  legend(document.getElementById('l-verdict'), VERDICTS.map(v => ({ l:v, c:VC[v] })));
  dataTable(document.getElementById('t-verdict'), ['Group','babysitter','borderline','vanilla','n'],
    groups.map(g => [g.label, ...VERDICTS.map(v => g.rows.filter(r=>r.verdict===v).length), g.rows.length]));
}

/* ---------------- chart: histogram ---------------- */
function renderHist(rows) {
  const lo = -80, hi = 70, step = 10;
  const bins = [];
  for (let e = lo; e < hi; e += step) {
    const inBin = rows.filter(r => r.net >= e && r.net < e+step);
    bins.push({ e, n: inBin.length, by: Object.fromEntries(VERDICTS.map(v => [v, inBin.filter(r=>r.verdict===v).length])) });
  }
  const W = 560, H = 250, padL = 34, padR = 10, padT = 10, padB = 40;
  const plotW = W-padL-padR, plotH = H-padT-padB;
  const maxN = Math.max(...bins.map(b => b.n), 1);
  const bw = plotW / bins.length;
  const s = mkSvg(document.getElementById('c-hist'), W, H);
  s.setAttribute('aria-label','Distribution of net_live');

  for (let g = 0; g <= 4; g++) {
    const y = padT + plotH - (g/4)*plotH;
    s.appendChild(svgEl('line', { x1:padL, y1:y, x2:W-padR, y2:y, class:'gridline' }));
    const t = svgEl('text', { x:padL-8, y:y+4, 'text-anchor':'end', class:'tick' });
    t.textContent = Math.round(maxN*g/4);
    s.appendChild(t);
  }
  bins.forEach((b, i) => {
    if (!b.n) return;
    let yTop = padT + plotH;
    const x = padL + i*bw;
    VERDICTS.forEach(v => {
      const c = b.by[v];
      if (!c) return;
      const h = (c/maxN)*plotH;
      yTop -= h;
      const rect = svgEl('rect', { x:x+1, y:yTop, width:Math.max(bw-3,1), height:Math.max(h-2,1), rx:3, fill:VC[v] });
      hoverable(rect, 'net_live ' + b.e + ' to ' + (b.e+step), [v + ': ' + c + ' task' + (c===1?'':'s'), 'bin total: ' + b.n]);
      s.appendChild(rect);
    });
  });
  s.appendChild(svgEl('line', { x1:padL, y1:padT+plotH, x2:W-padR, y2:padT+plotH, class:'axisline' }));
  bins.forEach((b, i) => {
    if (b.e % 20) return;
    const t = svgEl('text', { x: padL + i*bw + bw/2, y: padT+plotH+16, 'text-anchor':'middle', class:'tick' });
    t.textContent = b.e;
    s.appendChild(t);
  });
  const xl = svgEl('text', { x: padL+plotW/2, y: H-6, 'text-anchor':'middle', class:'axlab' });
  xl.textContent = 'net_live';
  s.appendChild(xl);
  legend(document.getElementById('l-hist'), VERDICTS.map(v => ({ l:v, c:VC[v] })));
  dataTable(document.getElementById('t-hist'), ['Bin','babysitter','borderline','vanilla','n'],
    bins.filter(b=>b.n).map(b => [b.e + '…' + (b.e+step), b.by.babysitter, b.by.borderline, b.by.vanilla, b.n]));
}

/* ---------------- chart: scatter ---------------- */
function renderScatter(rows) {
  const pts = rows.filter(r => r.em != null && r.em > 0);
  const W = 1100, H = 320, padL = 46, padR = 16, padT = 12, padB = 46;
  const plotW = W-padL-padR, plotH = H-padT-padB;
  const s = mkSvg(document.getElementById('c-scatter'), W, H);
  s.setAttribute('aria-label','net_live against expert time estimate');
  const xs = [5,15,60,240,960,3600];
  const lx = v => Math.log10(v);
  const x0 = lx(4), x1 = lx(4000);
  const X = v => padL + (lx(v)-x0)/(x1-x0)*plotW;
  const Y = v => padT + (1 - (v+100)/200)*plotH;

  [-100,-50,0,50,100].forEach(v => {
    const y = Y(v);
    s.appendChild(svgEl('line', { x1:padL, y1:y, x2:W-padR, y2:y, class: v===0 ? 'axisline' : 'gridline' }));
    const t = svgEl('text', { x:padL-8, y:y+4, 'text-anchor':'end', class:'tick' });
    t.textContent = v;
    s.appendChild(t);
  });
  xs.forEach(v => {
    const t = svgEl('text', { x:X(v), y:padT+plotH+16, 'text-anchor':'middle', class:'tick' });
    t.textContent = fmtMin(v);
    s.appendChild(t);
  });
  // threshold guides
  [[META.thresholds.high,'babysitter ≥ '+META.thresholds.high],[META.thresholds.low,'vanilla ≤ '+META.thresholds.low]].forEach(([v,lab]) => {
    const y = Y(v);
    s.appendChild(svgEl('line', { x1:padL, y1:y, x2:W-padR, y2:y, class:'gridline' }));
    const t = svgEl('text', { x:W-padR, y:y-5, 'text-anchor':'end', class:'tick' });
    t.textContent = lab;
    s.appendChild(t);
  });
  const SER = { 'tb2.1':'var(--s1)', 'tb3':'var(--s2)' };
  pts.forEach(r => {
    const cx = X(r.em), cy = Y(r.net);
    const g = svgEl('g', {});
    g.appendChild(svgEl('circle', { cx, cy, r:5, fill:SER[r.bench], stroke:SURFACE(), 'stroke-width':2 }));
    const hit = svgEl('circle', { cx, cy, r:12, fill:'transparent' });
    g.appendChild(hit);
    hoverable(g, r.name, [r.bench + ' · ' + r.category, 'expert ' + fmtMin(r.em), 'net_live ' + r1(r.net) + ' → ' + r.verdict]);
    s.appendChild(g);
  });
  const xl = svgEl('text', { x:padL+plotW/2, y:H-8, 'text-anchor':'middle', class:'axlab' });
  xl.textContent = 'expert time estimate (log scale)';
  s.appendChild(xl);
  const yl = svgEl('text', { x:14, y:padT+plotH/2, class:'axlab', transform:'rotate(-90 14 ' + (padT+plotH/2) + ')', 'text-anchor':'middle' });
  yl.textContent = 'net_live';
  s.appendChild(yl);
  legend(document.getElementById('l-scatter'), [{l:'tb2.1',c:'var(--s1)'},{l:'tb3',c:'var(--s2)'}]);
  document.getElementById('rho').textContent = spearman(pts.map(r=>r.em), pts.map(r=>r.net));
}
function spearman(a, b) {
  if (a.length < 3) return '—';
  const rank = v => { const idx = v.map((x,i)=>[x,i]).sort((p,q)=>p[0]-q[0]); const o = new Array(v.length); idx.forEach(([,i],r)=>o[i]=r); return o; };
  const x = rank(a), y = rank(b), n = a.length;
  const d2 = x.reduce((s,xi,i)=>s+(xi-y[i])**2, 0);
  return (Math.round((1 - 6*d2/(n*(n*n-1)))*100)/100).toFixed(2);
}

/* ---------------- chart: dimensions ---------------- */
function renderDims(rows) {
  const OR = ['var(--o1)','var(--o2)','var(--o3)','var(--o4)'];
  const W = 560, rowH = 34, padT = 8, padB = 26, padL = 128, padR = 44;
  const H = padT + DIMS.length*rowH + padB;
  const plotW = W-padL-padR;
  const s = mkSvg(document.getElementById('c-dims'), W, H);
  s.setAttribute('aria-label','Score distribution per live dimension');
  const stats = DIMS.map(d => {
    const vals = rows.map(r => r.dims[d]).filter(v => v != null);
    const mean = vals.reduce((a,b)=>a+b,0)/(vals.length||1);
    const sd = Math.sqrt(vals.reduce((a,b)=>a+(b-mean)**2,0)/(vals.length||1));
    const hist = [0,1,2,3].map(v => vals.filter(x=>x===v).length);
    const n = vals.length || 1;
    const top2 = [...hist].sort((a,b)=>b-a).slice(0,2).reduce((a,b)=>a+b,0) / n;
    // Weak = barely varies, OR never reaches the top of its range while 95% sits in two buckets.
    // sd alone misses the second case: B6 has sd 0.57 but never scores 3.
    const weak = sd < 0.35 || (Math.max(...vals) < 3 && top2 >= 0.95);
    return { d, vals, sd, hist, weak };
  });
  stats.forEach((st, i) => {
    const y = padT + i*rowH + 5, bh = 20, n = st.vals.length || 1;
    const lab = svgEl('text', { x:padL-10, y:y+bh/2+4, 'text-anchor':'end', class:'axlab' });
    lab.textContent = DIM_LABEL[st.d];
    if (st.weak) lab.setAttribute('fill', 'var(--critical)');
    s.appendChild(lab);
    let x = padL;
    st.hist.forEach((c, v) => {
      if (!c) return;
      const w = c/n*plotW;
      const rect = svgEl('rect', { x, y, width:Math.max(w-2,1), height:bh, rx:3, fill:OR[v] });
      hoverable(rect, DIM_LABEL[st.d], ['score ' + v + ': ' + c + ' task' + (c===1?'':'s'), pct(c,n) + ' of ' + n]);
      s.appendChild(rect);
      if (w > 26) {
        const t = svgEl('text', { x:x+w/2, y:y+bh/2+4, 'text-anchor':'middle', class:'dlabel' + (v>=2?' on-mark':'') });
        t.textContent = c;
        s.appendChild(t);
      }
      x += w;
    });
    const sd = svgEl('text', { x:W-padR+8, y:y+bh/2+4, class:'tick' });
    sd.textContent = 'sd ' + (Math.round(st.sd*100)/100).toFixed(2);
    if (st.weak) sd.setAttribute('fill','var(--critical)');
    s.appendChild(sd);
  });
  const weak = stats.filter(s2 => s2.weak).map(s2 => DIM_LABEL[s2.d]);
  const ldims = document.getElementById('l-dims');
  legend(ldims, [0,1,2,3].map(v => ({ l:'score ' + v, c:OR[v] })));
  if (weak.length) ldims.insertAdjacentHTML('beforeend',
    '<span style="color:var(--critical);font-weight:600">' + esc(weak.join(', ')) +
    ' — carries little information here</span>');
  dataTable(document.getElementById('t-dims'), ['Dimension','#0','#1','#2','#3','sd'],
    stats.map(st => [DIM_LABEL[st.d], ...st.hist, (Math.round(st.sd*100)/100).toFixed(2)]));
}

/* ---------------- chart: by category ---------------- */
function renderCat(rows) {
  const map = {};
  rows.forEach(r => (map[r.category] ??= []).push(r));
  let cats = Object.entries(map).map(([c, rs]) => ({ c, n:rs.length, b:rs.filter(r=>r.verdict==='babysitter').length }));
  const small = cats.filter(x => x.n < 3);
  cats = cats.filter(x => x.n >= 3);
  if (small.length) cats.push({ c:'Other (n<3)', n:small.reduce((a,x)=>a+x.n,0), b:small.reduce((a,x)=>a+x.b,0) });
  cats.sort((a,b) => (b.b/b.n) - (a.b/a.n) || b.n - a.n);
  const W = 560, rowH = 25, padT = 6, padB = 26, padL = 168, padR = 46;
  const H = padT + cats.length*rowH + padB;
  const plotW = W-padL-padR;
  const s = mkSvg(document.getElementById('c-cat'), W, H);
  s.setAttribute('aria-label','Babysitter share by category');
  [0,0.25,0.5,0.75,1].forEach(g => {
    const x = padL + g*plotW;
    s.appendChild(svgEl('line', { x1:x, y1:padT, x2:x, y2:padT+cats.length*rowH, class: g===0 ? 'axisline' : 'gridline' }));
    const t = svgEl('text', { x, y:H-10, 'text-anchor':'middle', class:'tick' });
    t.textContent = Math.round(g*100) + '%';
    s.appendChild(t);
  });
  cats.forEach((c, i) => {
    const y = padT + i*rowH + 4, bh = 15, share = c.b/c.n;
    const lab = svgEl('text', { x:padL-10, y:y+bh/2+4, 'text-anchor':'end', class:'axlab' });
    lab.textContent = c.c.length > 24 ? c.c.slice(0,23) + '…' : c.c;
    s.appendChild(lab);
    const rect = svgEl('rect', { x:padL, y, width:Math.max(share*plotW,1), height:bh, rx:3, fill:'var(--s1)' });
    hoverable(rect, c.c, [c.b + ' of ' + c.n + ' routed to babysitter', pct(c.b,c.n)]);
    s.appendChild(rect);
    const t = svgEl('text', { x:padL + share*plotW + 8, y:y+bh/2+4, class:'tick' });
    t.textContent = c.b + '/' + c.n;
    s.appendChild(t);
  });
  dataTable(document.getElementById('t-cat'), ['Category','babysitter','n','share'],
    cats.map(c => [c.c, c.b, c.n, pct(c.b,c.n)]));
}

/* ---------------- details table ---------------- */
const COLS = [
  { k:'name', l:'Task', num:false },
  { k:'bench', l:'Bench', num:false },
  { k:'category', l:'Category', num:false },
  { k:'em', l:'Expert', num:true },
  { k:'verdict', l:'Verdict', num:false },
  { k:'net', l:'net_live', num:true },
  { k:'ben', l:'Benefit', num:true },
  { k:'cost', l:'Cost', num:true },
  { k:'tb', l:'Top B', num:false },
  { k:'tc', l:'Top C', num:false },
  { k:'agree', l:'Panel', num:false },
];
function renderTable(rows) {
  const sorted = [...rows].sort((a,b) => {
    const k = state.sort;
    let va = a[k], vb = b[k];
    if (k === 'verdict') { const o = { babysitter:0, borderline:1, vanilla:2 }; va = o[va]; vb = o[vb]; }
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'string') return state.dir * va.localeCompare(vb);
    return state.dir * (va - vb);
  });
  const head = '<tr>' + COLS.map(c =>
    '<th class="sortable' + (c.num ? ' num' : '') + '" data-k="' + c.k + '">' + esc(c.l) +
    (state.sort === c.k ? ' <span class="arrow">' + (state.dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>').join('') + '</tr>';
  const body = sorted.map(r => {
    const open = state.open.has(r.id);
    const main = '<tr data-id="' + esc(r.id) + '">' +
      '<td><button class="rowbtn" data-t="' + esc(r.id) + '">' + esc(r.name) + '</button></td>' +
      '<td>' + r.bench + '</td>' +
      '<td>' + esc(r.category) + '</td>' +
      '<td class="num">' + fmtMin(r.em) + '</td>' +
      '<td><span class="pill"><span class="sw" style="background:' + VC[r.verdict] + '"></span>' + r.verdict + '</span></td>' +
      '<td class="num"><b>' + r1(r.net) + '</b></td>' +
      '<td class="num">' + r1(r.ben) + '</td>' +
      '<td class="num">' + r1(r.cost) + '</td>' +
      '<td>' + esc(r.tb ?? '') + '</td>' +
      '<td>' + esc(r.tc ?? '') + '</td>' +
      '<td>' + (r.agree ?? '') + '</td>' +
      '</tr>';
    if (!open) return main;
    // three pips, filled count == score, so 0 reads as empty
    const dots = v => '<span class="dots">' + [1,2,3].map(i => '<i class="' + (i <= v ? 'on' : '') + '"></i>').join('') + '</span>';
    const dimHtml = DIMS.map(d =>
      '<div class="d" title="' + esc(DIM_DEF[d] ?? '') + '"><b>' + DIM_LABEL[d] + '</b>' + dots(r.dims[d]) +
      '<b>' + r.dims[d] + '</b><br><span style="color:var(--muted)">' + esc(DIM_DEF[d] ?? '') + '</span><br>' +
      esc(r.ev?.[d] ?? '') + '</div>').join('');
    const instr = r.instruction
      ? '<h4>Task instruction — the judge\'s entire evidence base' +
        (r.tests ? ' · tests: <code>' + esc(r.tests.join(', ')) + '</code>' : '') + '</h4>' +
        '<pre class="instr">' + esc(r.instruction) + '</pre>'
      : '';
    const detail = '<tr class="detail"><td colspan="' + COLS.length + '">' +
      instr +
      '<h4>If this ran vanilla</h4><p>' + esc(r.cf) + '</p>' +
      '<h4>Rationale</h4><p>' + esc(r.rationale) + '</p>' +
      '<h4>Scored dimensions</h4><div class="dimgrid">' + dimHtml + '</div>' +
      '<h4>Recommendation</h4><p>' + esc(r.rec ?? '—') +
      (r.panel ? ' · panel votes: ' + esc((r.pv||[]).join(', ')) + ' (' + esc(r.agree) + ', spread ' + r1(r.spread) + ')' : '') +
      ' · net_raw ' + r1(r.netRaw) + '</p></td></tr>';
    return main + detail;
  }).join('');
  document.getElementById('tablewrap').innerHTML = '<table><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';

  document.querySelectorAll('th.sortable').forEach(th => th.addEventListener('click', () => {
    const k = th.dataset.k;
    if (state.sort === k) state.dir *= -1; else { state.sort = k; state.dir = (k==='name'||k==='category'||k==='bench') ? 1 : -1; }
    renderTable(filtered());
  }));
  document.querySelectorAll('button.rowbtn').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.t;
    state.open.has(id) ? state.open.delete(id) : state.open.add(id);
    renderTable(filtered());
  }));
}

/* ---------------- wire up ---------------- */
function renderAll() {
  const rows = filtered();
  document.getElementById('fcount').textContent = rows.length + ' of ' + DATA.length + ' tasks';
  renderKpis(rows); renderVerdict(rows); renderHist(rows); renderScatter(rows); renderDims(rows); renderCat(rows); renderTable(rows);
}
const cats = [...new Set(DATA.map(r => r.category))].sort();
document.getElementById('f-cat').innerHTML = '<option value="">All</option>' + cats.map(c => '<option>' + esc(c) + '</option>').join('');
document.getElementById('f-bench').addEventListener('change', e => { state.bench = e.target.value; renderAll(); });
document.getElementById('f-verdict').addEventListener('change', e => { state.verdict = e.target.value; renderAll(); });
document.getElementById('f-cat').addEventListener('change', e => { state.cat = e.target.value; renderAll(); });
let qt; document.getElementById('f-q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { state.q = e.target.value; renderAll(); }, 160); });
document.getElementById('f-reset').addEventListener('click', () => {
  state.bench = state.verdict = state.cat = state.q = '';
  document.getElementById('f-bench').value = ''; document.getElementById('f-verdict').value = '';
  document.getElementById('f-cat').value = ''; document.getElementById('f-q').value = '';
  renderAll();
});
document.getElementById('theme').addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : cur === 'light' ? 'dark' : (matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', next);
  renderAll();
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', renderAll);
renderCallout();
renderCriteria();
renderAll();
</script>
</body>
</html>`
  .replace('__DATA__', JSON.stringify(rows))
  .replace('__META__', JSON.stringify(meta))
  .replace('__TB21SHA__', String(meta.manifest.commits['tb2.1']).slice(0, 8))
  .replace('__TB3SHA__', String(meta.manifest.commits['tb3']).slice(0, 8))
  .replace('__RUNID__', meta.runId)
  .replace('__GENAT__', new Date(meta.generatedAt).toISOString().replace('T', ' ').slice(0, 16) + ' UTC')
  .replace('__HIGH__', meta.thresholds.high)
  .replace('__LOW__', meta.thresholds.low)
  .replace('__N__', rows.length);

writeFileSync(outPath, html);
console.error(`wrote ${outPath} (${(html.length / 1024).toFixed(0)} KB, ${rows.length} rows)`);
