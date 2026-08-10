# Summary

Corpus 163 tasks · thresholds low=-31 high=4 (CLI override)

## Verdicts

| | babysitter | borderline | vanilla | n | net_live mean | sd | min | max |
|---|---|---|---|---|---|---|---|---|
| **all** | 66 | 75 | 22 | 163 | -0.3 | 30.7 | -77 | 75.7 |
| tb2.1 | 25 | 44 | 20 | 89 | -10.2 | 28.5 | -77 | 60.7 |
| tb3 | 41 | 31 | 2 | 74 | 11.6 | 28.9 | -53.6 | 75.7 |

## Does the rubric discriminate?

Per-dimension score distribution across the corpus. **A dimension with near-zero sd is dead weight and should be cut from the rubric** — it is not distinguishing tasks, only adding a constant.

| dim | mean | sd | min | max | #0 | #1 | #2 | #3 |
|---|---|---|---|---|---|---|---|---|
| B1 | 2 | 0.9 | 0 | 3 | 6 | 46 | 55 | 56 |
| B3 | 1.6 | 0.9 | 0 | 3 | 18 | 49 | 69 | 27 |
| B5 | 1.2 | 1.2 | 0 | 3 | 64 | 41 | 25 | 33 |
| B6 | 0.7 | 0.8 | 0 | 3 | 76 | 62 | 20 | 5 |
| B8 | 1.2 | 0.6 | 0 | 3 | 11 | 114 | 35 | 3 |
| C2 | 1.4 | 0.9 | 0 | 3 | 23 | 64 | 58 | 18 |
| C4 | 1.5 | 0.9 | 0 | 3 | 31 | 40 | 77 | 15 |

All live dimensions show real spread (sd ≥ 0.35).

Spearman correlation between `net_live` and expert time estimate: **0.6** (n=162). The rubric weights horizon heavily, so a low value means B3 is being scored inconsistently with the metadata.

## Panel reliability

75 tasks are borderline in this one-judge payload; no panel results are present.

## Counterfactual quality

0/163 judgments could not name a concrete vanilla failure mode. On this corpus that clause is the main brake on ceremony bias, so a high number here means the verdicts lean optimistic.

## By category

| category | n | babysitter | share | median net_live |
|---|---|---|---|---|
| optimization | 1 | 1 | 100% | 23.9 |
| Science | 15 | 12 | 80% | 17.4 |
| Operations | 10 | 6 | 60% | 21.8 |
| Hardware | 5 | 3 | 60% | 38.7 |
| Software | 20 | 11 | 55% | 24.5 |
| ML | 13 | 7 | 53.8% | 4.4 |
| software-engineering | 26 | 13 | 50% | 4.6 |
| data-processing | 4 | 2 | 50% | 15.3 |
| machine-learning | 3 | 1 | 33.3% | -10.7 |
| data-science | 8 | 2 | 25% | -3.1 |
| scientific-computing | 8 | 2 | 25% | -1.9 |
| mathematics | 4 | 1 | 25% | -0.2 |
| Media | 4 | 1 | 25% | 2.9 |
| system-administration | 9 | 2 | 22.2% | -10.7 |
| debugging | 5 | 1 | 20% | -35.1 |
| Security | 7 | 1 | 14.3% | -14.9 |
| security | 8 | 0 | 0% | -33.7 |
| file-operations | 5 | 0 | 0% | -25.1 |
| model-training | 4 | 0 | 0% | -16.5 |
| data-querying | 1 | 0 | 0% | 3.1 |
| video-processing | 1 | 0 | 0% | -20.3 |
| games | 1 | 0 | 0% | -43.7 |
| personal-assistant | 1 | 0 | 0% | -43.9 |

## Strongest babysitter candidates

1. **exam-pdf-eval** (tb3, 14h, net_live 75.7) — B3 is decisive because the 840-minute estimate and multiple artifact-producing phases put the task well beyond a single sitting. Strict artifact dependencies, measurable runtime and determinism targets, and 100 independent model/problem evaluations also create strong value for ordering, convergence loops, and fan-out. Drift risk is moderated by exact schemas but remains material because success on visible PDFs can mask failure on the held-out scanned layout. Costs are low: orchestration is negligible against fourteen hours of expert work, and the instruction specifies the workflow shape closely.
2. **jax-speedrun-gpu** (tb3, 10h, net_live 66.5) — B3 dominates because the 600-minute expert estimate places this beyond an ordinary single sitting. B5 is also strong: success requires iterative optimization against explicit loss and runtime thresholds, not merely passing an API check. The chained warmup, training, saving, loading, and prediction artifacts create strict ordering, while the exact interfaces constrain—but do not eliminate—drift. Cost is limited because the work is large and its overall shape is known, though the winning optimization method must be discovered experimentally.
3. **intrastat-meldung** (tb3, 3h, net_live 63.4) — B1 dominates because corrections, independent approval, submission, acceptance, and archival form a strict dependency chain where reordering can produce plausible but incorrect compliance records. B3 is also high because the three-hour estimate and multi-service artifact flow create a substantial, resumable execution horizon. The task offers modest decomposition across two filings and their lines, while schema validation and portal acceptance provide checks without an optimization target. Its shape is explicit, and orchestration overhead is proportionate to the work.
4. **retro-console-soc** (tb3, 10h, net_live 62.5) — B3 dominates because the 600-minute estimate places this well beyond a single sitting. The task also has substantial drift risk: an agent can produce compiling RTL while leaving CPU instructions, PPU timing, UNROM banking, or timing closure incomplete. Concrete performance and image targets enable iterative correction, and the CPU and PPU provide meaningful decomposition. The main cost is only modest shape uncertainty because the required artifacts and acceptance criteria are explicit.
5. **gpt2-codegolf** (tb2.1, 40h, net_live 60.7) — B3 is decisive because the 2400-minute expert estimate places this far beyond one sitting. B1 and B5 are also strong: autoregressive token generation has chained dependencies, while the sub-5000-byte limit creates a concrete optimize-and-retest loop. The task remains tightly scoped to one file and exact behavior, keeping drift and decomposition modest. Shape uncertainty is limited because the deliverable and interface are explicit even though the compact implementation strategy is open.
6. **regex-chess** (tb2.1, 24h, net_live 60.7) — B3 dominates because the 24-hour expert estimate puts this far beyond a normal single sitting. Strictly ordered substitutions also create a strong artifact dependency, while measurable file limits and `check.py` support iterative correction. The specification tightly constrains the artifact, but the large hidden behavioral surface still creates meaningful premature-completion risk. Orchestration overhead is negligible at this duration; the main cost is modest uncertainty about the regex-based implementation method.
7. **distributed-dedup** (tb3, 10h, net_live 60.7) — B3 is the strongest driver because the 600-minute expert estimate places the task beyond one long sitting. B1 and B5 are also strong: the artifacts form a strict dependency chain, and four numeric performance ceilings support repeated measurement and optimization. Costs are low because the task is long and its deliverable is explicit, although the efficient Spark algorithm remains somewhat open.
8. **fp8-rmsnorm-gemm** (tb3, 12h, net_live 60.7) — The dominant benefit is the 12-hour expert horizon, reinforced by a strong numeric convergence target requiring repeated correctness and performance cycles. The computation also contains a strict chain from RMSNorm through row scaling and fp8 quantization into GEMM. Parallel fan-out and drift risk remain limited because the submission is one tightly specified CUDA file. Orchestration overhead is negligible, while implementation-shape uncertainty is modest because the deliverable and equations are explicit.
9. **cli-2ph-simplex** (tb3, 2h, net_live 55.9) — B1 dominates because multiple ordered tableau transformations feed the final reports, and changing or skipping that sequence can yield plausible but incorrect artifacts. B5 is also unusually strong: minimum pivot count is a genuine optimization target rather than merely hidden test compliance. The two-hour expert estimate makes the task substantial enough that orchestration overhead is not dominant, while the exhaustive specification keeps shape uncertainty and drift comparatively low. The main vanilla risk is premature completion with a correct-looking solver that does not find a globally shortest valid pivot path.
10. **gsea-proteomics** (tb3, 4h, net_live 53.6) — The dominant benefit is enforcing the chained analysis order from differential-expression gene-set construction through GSEA and then significance-dependent aggregation. The eight EXP comparisons also provide genuine fan-out, while the four-hour estimate makes orchestration overhead proportionally modest. Convergence value is limited because the numerical thresholds classify biological results rather than define a quality target to optimize. Drift risk remains low because the methods, parameters, file paths, and output schemas are unusually explicit.
