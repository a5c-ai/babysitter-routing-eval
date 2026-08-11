# Summary

Corpus 163 tasks · thresholds low=-25 high=10 (re-registered: translated by the measured +6 scale shift from the C4/B1/B8/B5 repairs)

## Verdicts

| | babysitter | borderline | vanilla | n | net_live mean | sd | min | max |
|---|---|---|---|---|---|---|---|---|
| **all** | 50 | 82 | 31 | 163 | -2.7 | 26.1 | -71.3 | 60.7 |
| tb2.1 | 18 | 46 | 25 | 89 | -10.4 | 25.5 | -71.3 | 49.2 |
| tb3 | 32 | 36 | 6 | 74 | 6.5 | 23.6 | -43.3 | 60.7 |

## Does the rubric discriminate?

Per-dimension score distribution across the corpus. **A dimension with near-zero sd is dead weight and should be cut from the rubric** — it is not distinguishing tasks, only adding a constant.

| dim | mean | sd | min | max | #0 | #1 | #2 | #3 |
|---|---|---|---|---|---|---|---|---|
| B1 | 2.6 | 0.6 | 0 | 3 | 1 | 10 | 42 | 110 |
| B3 | 1.6 | 0.9 | 0 | 3 | 18 | 53 | 67 | 25 |
| B5 | 1.6 | 1 | 0 | 3 | 18 | 71 | 31 | 43 |
| B6 | 0.5 | 0.6 | 0 | 3 | 98 | 54 | 10 | 1 |
| B8 | 1.1 | 0.5 | 0 | 3 | 10 | 123 | 28 | 2 |
| C2 | 1.5 | 0.9 | 0 | 3 | 23 | 53 | 69 | 18 |
| C4 | 1.9 | 0.7 | 0 | 3 | 8 | 32 | 96 | 27 |

All live dimensions show real spread (sd ≥ 0.35).

Spearman correlation between `net_live` and expert time estimate: **0.7** (n=162). The rubric weights horizon heavily, so a low value means B3 is being scored inconsistently with the metadata.

## Panel reliability

163 tasks went to a 3-judge panel. 121 unanimous (74.2%), 42 split 2/3. Mean net_live spread across judges: 9.4.

## Counterfactual quality

0/163 judgments could not name a concrete vanilla failure mode. On this corpus that clause is the main brake on ceremony bias, so a high number here means the verdicts lean optimistic.

## By category

| category | n | babysitter | share | median net_live |
|---|---|---|---|---|
| data-querying | 1 | 1 | 100% | 17.4 |
| Science | 15 | 9 | 60% | 11.7 |
| ML | 13 | 7 | 53.8% | 11.9 |
| Operations | 10 | 5 | 50% | 7.3 |
| mathematics | 4 | 2 | 50% | 14.2 |
| Software | 20 | 8 | 40% | 4.8 |
| Hardware | 5 | 2 | 40% | 3.6 |
| machine-learning | 3 | 1 | 33.3% | 0.8 |
| software-engineering | 26 | 8 | 30.8% | -1.7 |
| data-science | 8 | 2 | 25% | -3.4 |
| scientific-computing | 8 | 2 | 25% | -4.6 |
| system-administration | 9 | 2 | 22.2% | -2.3 |
| Security | 7 | 1 | 14.3% | -6.3 |
| security | 8 | 0 | 0% | -29.3 |
| file-operations | 5 | 0 | 0% | -35.1 |
| debugging | 5 | 0 | 0% | -23.6 |
| Media | 4 | 0 | 0% | -4.6 |
| data-processing | 4 | 0 | 0% | -6.9 |
| model-training | 4 | 0 | 0% | -26.4 |
| video-processing | 1 | 0 | 0% | -5.9 |
| optimization | 1 | 0 | 0% | -17.8 |
| games | 1 | 0 | 0% | -26.4 |
| personal-assistant | 1 | 0 | 0% | -33.7 |

## Strongest babysitter candidates

1. **retro-console-soc** (tb3, 10h, net_live 60.7) — The decisive benefit is the long, multi-phase RTL implementation horizon with explicit dependencies from cartridge mapping through CPU execution and PPU rendering. The task also has unusually strong self-measurable convergence targets: synthesis, FPGA fit, FMax, and pixel-exact simulation. Although the final artifact is tightly specified and subsystem work is only modestly parallelizable, its stated 600-minute scope makes orchestration overhead negligible. A custom hardware/RTL process is appropriate because no shown catalog path specifically covers full retro-console FPGA implementation.
2. **gsea-proteomics** (tb3, 4h, net_live 57.7) — The decisive benefit is the strict multi-stage dependency chain: the differential-expression set must be computed under fixed criteria before it can serve as the GSEA gene set, and the resulting runs feed two additional derived deliverables. The task also has a long, multi-phase horizon and eight genuinely parallel experiment comparisons. Its method is unusually specified rather than exploratory, while the estimated four-hour workload makes orchestration overhead material but not dominant. The output contract is tight, so drift risk is limited to scientifically incorrect but syntactically valid derived results.
3. **fp8-rmsnorm-gemm** (tb3, 12h, net_live 56.1) — The decisive benefit is the long, performance-convergence-heavy kernel effort: the task has a 12-hour expert estimate and an explicit measurable speed target against a provided reference. Its computation has a strict multi-stage dependency chain, so preserving and validating RMSNorm, per-row scaling, FP8 conversion, and dequantized GEMM together matters. The deliverable is nevertheless a single coupled CUDA artifact with tightly specified behavior, not a parallel fan-out task. Shape uncertainty is limited to conventional kernel-implementation choices, and orchestration overhead is small relative to the stated duration.
4. **distributed-dedup** (tb3, 10h, net_live 50.4) — The decisive benefit is the long, chained distributed-data implementation horizon: correct output requires several dependent transformations and iterative validation against explicit performance ceilings. The task has strong measurable convergence signals because both semantic and resource outcomes can be profiled and improved. Its artifact is nevertheless tightly specified, limiting scope drift, while the implementation method is conventional enough that shape uncertainty is only modest. The principal orchestration cost is not ceremony relative to task duration, but choosing and encoding the Spark-specific execution approach.
5. **regex-chess** (tb2.1, 24h, net_live 49.2) — The decisive benefit is the explicitly 24-hour-scale task combined with an ordered transformation pipeline whose stages must preserve chess legality. The provided checker and example allow iterative validation, though the stated feedback is principally pass/fail rather than a scored optimization loop. The deliverable is tightly specified, limiting scope drift, and the orchestration overhead is negligible at this estimated horizon. A custom process would fit because the task’s regex-pipeline move-generation mechanism is unusually specialized.
6. **jax-speedrun-gpu** (tb3, 10h, net_live 47.9) — The decisive benefits are the stated >8-hour horizon and the explicit loss-and-throughput targets that support measured convergence. Correct execution has a chained dependency from trainer construction through compiled optimization, serialization, and reloadable causal inference. The work is large enough that orchestration overhead is negligible, while the method remains materially uncertain until the supplied data and verifier constraints are inspected. The limited independent split between training and loading does not remove their architectural coupling.
7. **wdm-design** (tb3, 4h, net_live 43.1) — The dominant benefit is the strict chained validation procedure: the same binary device must be optimized through DRC and two specified broadband, self-normalized `ODD_Z` simulations, where a plausible but mismatched validation setup silently produces the wrong result. The task has a strong measurable convergence loop with explicit optical thresholds and a multi-hour expected horizon. It has limited parallel decomposition because both bands constrain one common pattern. Its method is largely specified, though the actual inverse-design implementation remains a conventional tooling choice.
8. **circuit-fibsqrt** (tb2.1, 16h, net_live 42.2) — The decisive benefit is the explicitly estimated 960-minute horizon, making preserved state and enforced validation materially useful rather than ceremonial. The task also has a strict dependency chain and a measurable iteration target: functional correctness under the simulator and fewer than 32,000 gate lines. Its method is not fully pre-scripted because the simulator implementation must be inspected before selecting a circuit strategy. Despite the technical difficulty, drift risk is limited because the required artifact and function are exact.
9. **gpt2-codegolf** (tb2.1, 40h, net_live 42.2) — The decisive benefit is the explicitly estimated 2400-minute horizon, combined with a strict chained inference pipeline that must remain correct while meeting a measurable code-size cap. This is not merely technically difficult: parsing, tokenization, sequential transformer inference, and autoregressive generation each consume the prior step's result. The principal counterweight is that the exact compact implementation strategy cannot be fixed until the supplied checkpoint and BPE formats are inspected. The pinned deterministic verifier can make repeated compile-and-behavior gates substantive rather than self-asserted.
10. **sam-cell-seg** (tb2.1, 10h, net_live 42.2) — The decisive benefit is the long, chained implementation: per-mask prompting, global conflict resolution, contour conversion, and CSV serialization must remain coordinated while CPU MobileSAM behavior is made robust for hidden inputs. The task also admits measurable convergence through overlap-pixel and connected-component counts. Its method remains materially input-dependent because image and existing-mask geometry determine prompt and post-processing choices. The large expert-time estimate makes orchestration overhead negligible, while the headless benchmark constraint prevents relying on approval breakpoints.
