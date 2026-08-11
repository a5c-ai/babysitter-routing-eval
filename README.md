# babysitter-routing-eval

A rubric — and a Babysitter process that applies it at scale — for deciding whether a task
is better run as a [Babysitter](https://github.com/a5c-ai/babysitter) orchestration or as a
plain ("vanilla") agent session.

First corpus: every task in **Terminal-Bench 2.1 (89)** and **Terminal-Bench 3 (74)**.

**59 babysitter · 69 borderline · 35 vanilla** — with tb3 routing to babysitter at 54%
against tb2.1's 21%, which is what you'd expect from a benchmark whose median task is 4×
longer. Open [`out/report.html`](out/report.html) for the interactive version: summary
charts plus all 163 tasks with the verbatim instruction each was judged from, the evidence
cited for every dimension, and the panel votes.

## Multi-model comparison

The current table uses three **GPT-5.6-terra** judgments per task. The same judge prompt and
scoring code have now been run once per task with **GPT-5.6-sol** under the same anchored
profile. `borderline` is the rubric's undecided band.

| model recommendation | babysitter | borderline | vanilla | mean primary `net_live` |
|---|---:|---:|---:|---:|
| GPT-5.6-terra majority (3 judgments/task) | 59 | 69 | 35 | -6.5 |
| GPT-5.6-sol (1 judgment/task) | 66 | 75 | 22 | -0.3 |

The two model recommendations agree on **129/163 tasks (79.1%)**. The remaining **34**
are marked `needs-third-judge`, ready for a third model to break the tie. See the complete
[multi-model table](out/models/comparison/comparison.md), its
[CSV](out/models/comparison/comparison.csv), the [GPT-5.6-terra report](out/models/gpt-5.6-terra/report.html),
and the [GPT-5.6-sol report](out/models/gpt-5.6-sol/report.html).

The terra column uses its stored three-judge majority; the sol column uses its primary
`net_live` score and the shared thresholds. The score shown beside each recommendation in
the detailed table is the primary score, so it can differ from a panel majority. The
published report at [`out/report.html`](out/report.html) remains unchanged.

> **Correction.** These judgments were first published as "Opus 5". The local `claude` CLI
> routes to `gpt-5.6-terra` — its own `modelUsage` field reports that model on every one of
> the 489 judgments. Both columns are therefore GPT-family models. The measured difference
> between them is real, but they are not the independent cross-vendor judges the original
> labels implied, and same-family models share bias, so true independent-judge disagreement
> is likely worse than the 79.1% shown.

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

**Renormalize over what varies.** `net_live` re-scales over the 7 live dimensions so both
sides stay 0–100. Corpus-relative quantiles were rejected for the thresholds: they make the
verdict an artifact of corpus composition. When a rubric revision shifts the scale, the
thresholds are translated by the *measured* shift and nothing else — see
`prompts/tb-profile.md`.

**Three judges on everything.** Every task is scored by three independent judges and
resolved by majority, so inter-judge disagreement is measurable across the whole corpus
rather than only in the band where it is worst. That baseline is what makes claims about
rubric reliability checkable.

## What we learned about the rubric

- **Panel unanimity is 68%**, with a mean `net_live` spread of 13.3 points across judges,
  measured over all 163 tasks rather than the borderline band alone. The aggregate skew
  between benchmarks is solid; an individual verdict near a threshold is not, and the
  report says so up front.
- **Scoring anchors beat prose, but only when they point at something checkable.** Replacing
  a dimension's prose guidance with an explicit 0/1/2/3 ladder cut inter-judge disagreement
  28% overall — but only for ladders anchored to observable text or metadata. C2, whose
  ladder is a lookup on `expert_time_estimate`, fell to 0.007. Ladders written around
  abstract judgements ("could two people work in parallel?") made agreement *worse* than
  the prose they replaced, so B6 and B8 were reverted. C4 is the clean test: prose 0.309,
  abstract ladder 0.400, observable-feature ladder 0.246.
- **Anchoring the rubric moved the scale, not just the noise.** Cost scores rose ~16 points
  once the undefined middles of C2 and C4 were filled in, so thresholds were re-registered
  by that measured offset. Reliability and calibration are separate problems; fixing one
  does not fix the other.
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
  tb-judge-corpus.js            primary-judge-only pass for model comparisons
  tb-panel-topup.js             adds panel judges after a rubric change
  tb-anchor-experiment.js       re-judges a fixed set N times to A/B a rubric revision
scripts/
  fetch-tb-manifest.mjs         instructions + metadata from both TB repos (excludes solutions)
  drive-run.mjs                 minimal executor: run:iterate → execute → task:post
  recompute-payload.mjs         rebuild results from run journals under current weights
  build-report.mjs              results.md / results.csv / summary.md
  build-html-report.mjs         the interactive report
  build-model-comparison.mjs    N-model recommendation/consensus table
out/                            published report, per-model reports, and comparison
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

### Running another model judge

The judge-only process uses the exact same rubric, profile, schema, and deterministic
scoring as the original process, without the smoke duplicate or panel phase:

```bash
npx babysitter run:create \
  --process-id tb/judge-corpus \
  --entry "$PWD/.a5c/processes/tb-judge-corpus.js#process" \
  --inputs inputs/tb-judge-gpt56sol-inputs.json \
  --harness codex --non-interactive --json

node scripts/drive-run.mjs ~/.a5c/runs/<runId> \
  --concurrency 4 --harness codex --model gpt-5.6-sol --effort high

node scripts/recompute-payload.mjs ~/.a5c/runs/<runId> \
  out/models/gpt-5.6-sol/payload.json out/manifest.json --low -31 --high 4
node scripts/build-report.mjs \
  out/models/gpt-5.6-sol/payload.json out/models/gpt-5.6-sol
node scripts/build-html-report.mjs \
  out/models/gpt-5.6-sol/payload.json \
  out/models/gpt-5.6-sol/report.html out/manifest.json
```

To add a third judge, generate its payload under `out/models/<model-id>/`, append one entry
to [`inputs/model-comparison.json`](inputs/model-comparison.json), and run:

```bash
npm run compare:models
```

The comparison generator accepts any number of models. With two disagreeing judges it
emits `needs-third-judge`; with three or more it emits a verdict only when one has a strict
majority, otherwise `undecided`.

## Known limitations

- **26 of 163 tasks reference an asset the judge never saw** (a PNG schematic, a video, a
  binary). They skew vanilla, which is what you'd expect from a judge working with less
  evidence. `cad-model` is the clearest case: 318 characters pointing at an image.
- Thresholds (`+4` / `−31`) are the base rubric's `+20 / −15` translated by the measured
  −16 scale shift the anchor ladders introduced. That is a mechanical re-registration, not
  a fit — but neither set has been validated against hand labels. The rubric's own Mode B
  exists for that and has not been run.
- **B6 and B8 remain prose.** Anchor ladders were written for both and made agreement
  worse, so they were reverted. They are the two dimensions most in need of a better
  observable anchor.
- The published baseline measures one model's self-consistency. This comparison adds
  a second model, but still lacks hand labels and the planned third independent model.
