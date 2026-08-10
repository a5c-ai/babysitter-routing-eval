# Model judge results

Each directory contains the same 163-task routing table produced by one model. All model
comparisons use the rubric's shared `net_live` thresholds:

- `net_live >= 4` → `babysitter`
- `net_live <= -31` → `vanilla`
- otherwise → `borderline` (undecided)

`opus-5/` preserves the current Opus payload and report. Its recommendation is the stored
majority from three Opus judgments per task under the anchored profile.

`gpt-5.6-sol/` is one judgment per task under that same profile and comes from completed run
`01KZPPBKFHC25P3TQCSRP282XG`: 163 unique tasks, one judgment each, effort `high`.

`comparison/` is generated from `inputs/model-comparison.json`. Add a third model by
generating its payload, adding its metadata to that configuration, and running
`npm run compare:models`.
