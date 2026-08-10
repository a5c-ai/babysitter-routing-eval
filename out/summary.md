# Summary

Corpus 163 tasks · thresholds low=-31 high=4 (re-registered: doc defaults translated by the measured -16 location shift of the anchored rubric)

## Verdicts

| | babysitter | borderline | vanilla | n | net_live mean | sd | min | max |
|---|---|---|---|---|---|---|---|---|
| **all** | 59 | 69 | 35 | 163 | -6.5 | 28.6 | -77 | 74.7 |
| tb2.1 | 19 | 46 | 24 | 89 | -15.5 | 25.8 | -77 | 50.2 |
| tb3 | 40 | 23 | 11 | 74 | 4.4 | 28.1 | -53.6 | 74.7 |

## Does the rubric discriminate?

Per-dimension score distribution across the corpus. **A dimension with near-zero sd is dead weight and should be cut from the rubric** — it is not distinguishing tasks, only adding a constant.

| dim | mean | sd | min | max | #0 | #1 | #2 | #3 |
|---|---|---|---|---|---|---|---|---|
| B1 | 1.9 | 0.9 | 0 | 3 | 5 | 62 | 41 | 55 |
| B3 | 1.6 | 0.9 | 0 | 3 | 18 | 50 | 72 | 23 |
| B5 | 0.9 | 1.1 | 0 | 3 | 87 | 28 | 25 | 23 |
| B6 | 0.4 | 0.7 | 0 | 3 | 103 | 49 | 9 | 2 |
| B8 | 1.1 | 0.6 | 0 | 2 | 16 | 111 | 36 | 0 |
| C2 | 1.5 | 0.9 | 0 | 3 | 23 | 52 | 70 | 18 |
| C4 | 1.5 | 0.8 | 0 | 3 | 25 | 42 | 83 | 13 |

All live dimensions show real spread (sd ≥ 0.35).

Spearman correlation between `net_live` and expert time estimate: **0.7** (n=162). The rubric weights horizon heavily, so a low value means B3 is being scored inconsistently with the metadata.

## Panel reliability

163 tasks went to a 3-judge panel. 111 unanimous (68.1%), 52 split 2/3. Mean net_live spread across judges: 13.3.

## Counterfactual quality

0/163 judgments could not name a concrete vanilla failure mode. On this corpus that clause is the main brake on ceremony bias, so a high number here means the verdicts lean optimistic.

## By category

| category | n | babysitter | share | median net_live |
|---|---|---|---|---|
| optimization | 1 | 1 | 100% | 10.7 |
| Software | 20 | 13 | 65% | 19.9 |
| Science | 15 | 9 | 60% | 7.3 |
| Operations | 10 | 6 | 60% | 8.6 |
| ML | 13 | 7 | 53.8% | 13 |
| Media | 4 | 2 | 50% | 1.5 |
| Hardware | 5 | 2 | 40% | -16.5 |
| software-engineering | 26 | 9 | 34.6% | -7.1 |
| machine-learning | 3 | 1 | 33.3% | -19.4 |
| data-science | 8 | 2 | 25% | -17.8 |
| scientific-computing | 8 | 2 | 25% | -10.3 |
| data-processing | 4 | 1 | 25% | 1.3 |
| mathematics | 4 | 1 | 25% | 6.9 |
| system-administration | 9 | 2 | 22.2% | -10.9 |
| Security | 7 | 1 | 14.3% | -28 |
| security | 8 | 0 | 0% | -25.1 |
| debugging | 5 | 0 | 0% | -35.1 |
| file-operations | 5 | 0 | 0% | -30.8 |
| model-training | 4 | 0 | 0% | -22.2 |
| data-querying | 1 | 0 | 0% | 3.1 |
| video-processing | 1 | 0 | 0% | -20.3 |
| games | 1 | 0 | 0% | -49.4 |
| personal-assistant | 1 | 0 | 0% | -58.4 |

## Strongest babysitter candidates

1. **fp8-rmsnorm-gemm** (tb3, 12h, net_live 74.7) — The decisive benefit is the long optimization horizon: the 720-expert-minute estimate and explicit performance target support a sustained, measurable convergence loop. The mathematical stages impose strict dependencies, while the performance objective requires preserving correctness, restrictions, and results across five batch sizes. This is not meaningfully parallelizable because the task has one coupled CUDA source artifact. Orchestration overhead and shape uncertainty are both low because the task is lengthy and unusually explicit.
2. **distributed-dedup** (tb3, 10h, net_live 56.1) — The decisive live benefit is the long, multi-stage implementation horizon, reinforced by chained dependencies between shingling, pair construction, clustering, and canonicalization. The task also has explicit quantitative resource targets that support iterative measurement and optimization rather than a single binary implementation pass. Its output contract and allowed edit scope are unusually precise, limiting shape uncertainty and drift despite the technical difficulty. There is no meaningful orchestration-overhead penalty relative to the stated 600-minute expert estimate.
3. **rs-archive-clone** (tb3, 16h, net_live 53.8) — The decisive benefit is the task horizon: the 960-expert-minute estimate and multi-phase compatibility reconstruction exceed a single focused session. The work also has strict artifact dependencies, because black-box behavioral discoveries and package/archive format reconstruction feed later implementation and recovery behavior. Its exact single-script compatibility target limits open-ended drift, but the wide command, transform, corruption, and error surface still creates a concrete risk of premature happy-path completion. Process overhead is comparatively negligible at this stated duration, while the task shape is known despite needing behavioral discovery.
4. **exam-pdf-eval** (tb3, 14h, net_live 51.3) — The decisive benefit is the long, explicitly chained evaluation pipeline, with an 840-minute expert estimate and a 14,400-second agent allowance. It has strong deterministic verification and a concrete vanilla failure mode: overfitting PDF extraction or failing to prove rerun determinism before completion. The deliverables are specified, but selecting robust PDF/OCR handling still depends on inspecting variable-layout inputs, so shape uncertainty remains material. The task is substantially larger than orchestration overhead, while its broad implementation surface raises premature-completion risk despite tightly specified output schemas.
5. **git-multibranch** (tb2.1, 3h, net_live 50.2) — The decisive benefit is the strict deployment chain from authenticated Git pushes through a branch-aware post-receive hook to distinct HTTPS-served artifacts. The 180-minute estimate supports a multi-phase horizon, and the three-second deployment requirement provides a measurable target for iteration. Although the work spans multiple services, its explicit endpoints and test sequence constrain the shape strongly, while the components are only modestly parallelizable because correctness depends on their integration.
6. **regex-chess** (tb2.1, 24h, net_live 49.2) — The decisive benefit is the stated 1,440-expert-minute horizon, alongside an inherently ordered rewrite pipeline whose intermediate FEN states are consumed by subsequent substitutions. `check.py` gives a concrete feedback mechanism, but correctness remains binary rather than an optimization loop. Although the deliverable is tightly specified and limits drift, a complete regex-based implementation of chess legality has enough interacting edge cases that a premature example-only completion is plausible. Orchestration overhead is negligible at the stated task duration; the principal cost is choosing the non-prescribed implementation strategy.
7. **retro-console-soc** (tb3, 10h, net_live 49.2) — The decisive factor is the over-eight-hour horizon: the task combines interdependent RTL subsystems with synthesis, timing, and pixel-perfect ROM simulation. It also has strong measurable convergence targets because FPGA fit and FMax can be checked and improved iteratively. The deliverable shape is unusually explicit for a hardware task, limiting shape-uncertainty cost, while the broad subsystem surface retains moderate drift risk. The concrete vanilla failure is premature completion after compile or synthesis success without full behavioral and timing validation.
8. **wal-recovery-ordering** (tb3, 6h, net_live 44.4) — The decisive benefit is the strict ordering chain between durable WAL prefixes, externally visible committed state, and deterministic recovery. The task is long enough for enforced checkpoints to be meaningful, while its precise artifact contract keeps process shape uncertainty low. It offers no stated measurable convergence target beyond binary correctness and hidden verification, and its recovery and engine portions are only partly parallelizable because they share the same durability semantics. Mandatory stops create some overhead, but the stated six-hour expert estimate makes that overhead proportionate to the work.
9. **gsea-proteomics** (tb3, 4h, net_live 43.3) — The decisive benefit is the strict artifact chain from TAR-versus-CTRL differential expression to the TAR_UP gene set, per-treatment GSEA outputs, and derived result files; a wrong early artifact propagates plausibly through later outputs. The task also has a multi-hour expected horizon and eight partially independent treatment comparisons. Its detailed methods, parameters, and output schemas make the work shape known and limit scope drift. Orchestration overhead is material but relatively small against the stated four-hour expert estimate.
10. **jax-speedrun-gpu** (tb3, 10h, net_live 39.3) — The decisive benefit is the explicitly long, 600-minute optimization task, which also has measurable loss and throughput targets that support iterative convergence. The task has a real checkpoint-to-loader dependency, but its components are mostly coupled rather than broadly parallelizable. Its output contract constrains some drift, while model and systems-level optimization choices remain materially open. Orchestration overhead is minor relative to the stated duration, though the exact recipe cannot be settled until the staged data and execution environment are inspected.

