# Model judge results

Each directory contains the same 163-task routing table produced from one model's primary
judgments. All model comparisons use the rubric's shared `net_live` thresholds:

- `net_live >= 20` → `babysitter`
- `net_live <= -15` → `vanilla`
- otherwise → `borderline` (undecided)

`opus-5/` preserves the existing Opus payload and report. Its stored published verdicts
include a three-judge panel for initially borderline tasks; the cross-model comparison uses
the primary Opus score so its protocol matches the one-pass GPT-5.6-sol judge.

`gpt-5.6-sol/` comes from completed Babysitter run
`01KZPJA5TSSS71GRFR1WSFRVHT`: 163 unique tasks, one judgment each, effort `high`.

`comparison/` is generated from `inputs/model-comparison.json`. Add a third model by
generating its payload, adding its metadata to that configuration, and running
`npm run compare:models`.
