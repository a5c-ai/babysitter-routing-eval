# babysitter-routing-eval

A rubric — and a Babysitter process that applies it at scale — for deciding whether a task
is better run as a [Babysitter](https://github.com/a5c-ai/babysitter) orchestration or as a
plain ("vanilla") agent session.

First corpus: every task in **Terminal-Bench 2.1 (89)** and **Terminal-Bench 3 (74)**.

**59 babysitter · 61 borderline · 43 vanilla** — with tb3 routing to babysitter at 54%
against tb2.1's 21%, which is what you'd expect from a benchmark whose median task is 4×
longer. Open [`out/report.html`](out/report.html) for the interactive version: summary
charts plus all 163 tasks with the verbatim instruction each was judged from, the evidence
cited for every dimension, and the panel votes.

## How it works

The rubric ([`babysitter-vs-vanilla-eval.md`](babysitter-vs-vanilla-eval.md)) scores a task
on 13 dimensions — 8 benefit (ordering, gate-ability, horizon, irreversibility,
convergence, decomposability, repeatability, drift risk) and 5 cost (overhead, human
availability, shape uncertainty, setup, latency) — and requires a cited span of evidence
for every non-zero score. A mandatory counterfactual gates the benefit total: if the judge
can't name what concretely goes wrong under vanilla, the benefit is capped.

Three ideas do most of the work:

**Pin the constants.** Every Terminal-Bench task is verifiable, sandboxed and headless, so
6 of the 13 dimensions never vary. Scoring them per-task is theatre, and the constant
offset drags every verdict one direction. [`prompts/tb-profile.md`](prompts/tb-profile.md)
pins them once, with evidence, as a *delta* on the base rubric rather than a fork.

**Renormalize, don't re-threshold.** `net_live` re-scales over the 7 live dimensions so the
0–100-per-side scale — and therefore the rubric's pre-registered thresholds — stay valid.
Corpus-relative quantiles were rejected: they make the verdict an artifact of corpus
composition.

**Panel the middle.** One judge scores everything; anything landing in the borderline band
is re-judged by two more and resolved by majority. Inter-judge disagreement on that band is
the most honest reliability signal available without hand labels.

## What we learned about the rubric

- **Panel unanimity is 58%**, with a mean `net_live` spread of 15.7 points across judges.
  The aggregate skew between benchmarks is solid; an individual verdict near a threshold is
  not, and the report says so up front.
- **A dimension measuring the tool rather than the task is worse than useless.** The rubric
  originally scored *"does a library process already fit?"* at weight 25. It was removed —
  it tracked domain popularity (software-engineering 1.65, Hardware 2.20, model-training
  3.00) rather than anything about the work, so it would have promoted mainstream tasks for
  reasons unrelated to whether enforcement helps. It was also the noisiest dimension by 2×;
  dropping it took unanimity from 32% to 58%.
- **B6 (decomposability) still carries almost no information here** — 97 zeros, never above
  2. Terminal-Bench tasks are single indivisible artifacts. It's a candidate for the same
  treatment.
- `net_live` correlates with expert time estimate at ρ ≈ 0.65 — it tracks horizon without
  being a proxy for it.

## Layout

```
babysitter-vs-vanilla-eval.md   the rubric (corpus-independent)
prompts/tb-profile.md           Terminal-Bench delta: pins, calibration, renormalization
.a5c/processes/
  tb-routing-eval.js            the process: fetch → smoke → judge → calibrate → panel → report
  tb-panel-topup.js             adds panel judges after a rubric change
scripts/
  fetch-tb-manifest.mjs         instructions + metadata from both TB repos (excludes solutions)
  drive-run.mjs                 minimal executor: run:iterate → execute → task:post
  recompute-payload.mjs         rebuild results from run journals under current weights
  build-report.mjs              results.md / results.csv / summary.md
  build-html-report.mjs         the interactive report
out/                            manifest, judgments, and all generated reports
```

## Reproducing

```bash
npm install
node scripts/fetch-tb-manifest.mjs out/manifest.json

npx babysitter run:create \
  --process-id tb/routing-eval \
  --entry "$PWD/.a5c/processes/tb-routing-eval.js#process" \
  --inputs inputs/tb-eval-inputs.json --harness claude-code --json

node scripts/drive-run.mjs ~/.a5c/runs/<runId> --concurrency 8 --stop-at-breakpoint
```

The process stops at two breakpoints — a 3-task smoke test before spending the full
corpus, and threshold calibration after judging. Approve with
`npx babysitter task:post <runDir> <effectId> --status ok --value-inline '{"approved":true}'`.

`drive-run.mjs` exists because `genty resume` routes its own resume-discovery step through
agent-core, which needs API credentials separate from the harness. The process keeps full
authority either way — it dispatches every task, enforces phase order, opens the
breakpoints and journals everything; the driver only executes what it's handed.

### Changing the rubric without re-judging

Every judgment, including all panel judges, is journaled per-dimension with its own
evidence. A weight change is a pure recompute:

```bash
node scripts/recompute-payload.mjs <runDir>[,<runDir2>] out/payload.json out/manifest.json
node scripts/build-report.mjs out/payload.json out
node scripts/build-html-report.mjs out/payload.json out/report.html out/manifest.json
```

That is how the C1 removal was done. Verify any such change by recomputing the *old*
formula from the journal and diffing against the previous payload — it should reproduce it
exactly.

## Known limitations

- **26 of 163 tasks reference an asset the judge never saw** (a PNG schematic, a video, a
  binary). They skew vanilla, which is what you'd expect from a judge working with less
  evidence. `cad-model` is the clearest case: 318 characters pointing at an image.
- **Some rationale prose still argues from process-authoring cost**, written while that
  dimension was scored. The scores are clean; only the narrative is stale.
- Thresholds (`+20` / `−15`) are pre-registered, not fitted. They have not been validated
  against hand labels — the rubric's own Mode B exists for that and hasn't been run.
