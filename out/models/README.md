# Model judge results

Each directory contains the same 163-task routing table produced by one model. All model
comparisons use the rubric's shared `net_live` thresholds:

- `net_live >= 4` → `babysitter`
- `net_live <= -31` → `vanilla`
- otherwise → `borderline` (undecided)

`gpt-5.6-terra/` preserves the published payload and report. Its recommendation is the
stored majority from three judgments per task under the anchored profile.

> **Renamed from `opus-5/`.** These judgments were originally attributed to Opus 5. The
> local `claude` CLI routes to `gpt-5.6-terra`, and the CLI's own `modelUsage` field reports
> that model for every judgment. Both columns of the comparison are therefore GPT-family
> models, so the two judges are less independent than a cross-vendor pair would be — read
> the agreement figure with that in mind.

`gpt-5.6-sol/` is one judgment per task under that same profile and comes from completed run
`01KZPPBKFHC25P3TQCSRP282XG`: 163 unique tasks, one judgment each, effort `high`.

`comparison/` is generated from `inputs/model-comparison.json`. Add a third model by
generating its payload, adding its metadata to that configuration, and running
`npm run compare:models`.
