# Summary

Corpus 163 tasks · thresholds low=-15 high=20 (doc defaults)

## Verdicts

| | babysitter | borderline | vanilla | n | net_live mean | sd | min | max |
|---|---|---|---|---|---|---|---|---|
| **all** | 59 | 61 | 43 | 163 | 9.4 | 32.9 | -91.4 | 74.7 |
| tb2.1 | 19 | 36 | 34 | 89 | -3 | 30.4 | -91.4 | 64.9 |
| tb3 | 40 | 25 | 9 | 74 | 24.2 | 29.5 | -38.9 | 74.7 |

## Does the rubric discriminate?

Per-dimension score distribution across the corpus. **A dimension with near-zero sd is dead weight and should be cut from the rubric** — it is not distinguishing tasks, only adding a constant.

| dim | mean | sd | min | max | #0 | #1 | #2 | #3 |
|---|---|---|---|---|---|---|---|---|
| B1 | 1.7 | 0.9 | 0 | 3 | 14 | 49 | 67 | 33 |
| B3 | 1.6 | 0.9 | 0 | 3 | 18 | 50 | 71 | 24 |
| B5 | 1 | 1 | 0 | 3 | 73 | 38 | 34 | 18 |
| B6 | 0.4 | 0.6 | 0 | 2 | 97 | 60 | 6 | 0 |
| B8 | 1.1 | 0.6 | 0 | 3 | 23 | 105 | 34 | 1 |
| C2 | 1 | 1.1 | 0 | 3 | 71 | 33 | 40 | 19 |
| C4 | 1 | 1 | 0 | 3 | 73 | 38 | 36 | 16 |

All live dimensions show real spread (sd ≥ 0.35).

Spearman correlation between `net_live` and expert time estimate: **0.6** (n=162). The rubric weights horizon heavily, so a low value means B3 is being scored inconsistently with the metadata.

## Panel reliability

95 tasks went to a 3-judge panel. 55 unanimous (57.9%), 40 split 2/3. Mean net_live spread across judges: 15.7.

## Counterfactual quality

0/163 judgments could not name a concrete vanilla failure mode. On this corpus that clause is the main brake on ceremony bias, so a high number here means the verdicts lean optimistic.

## By category

| category | n | babysitter | share | median net_live |
|---|---|---|---|---|
| optimization | 1 | 1 | 100% | 25.5 |
| data-querying | 1 | 1 | 100% | 21.7 |
| Media | 4 | 3 | 75% | 26.2 |
| Operations | 10 | 7 | 70% | 46.4 |
| Science | 15 | 9 | 60% | 28.9 |
| Hardware | 5 | 3 | 60% | 22.6 |
| Software | 20 | 11 | 55% | 41.6 |
| ML | 13 | 7 | 53.8% | 14.6 |
| data-science | 8 | 3 | 37.5% | 2.1 |
| scientific-computing | 8 | 3 | 37.5% | 13.6 |
| machine-learning | 3 | 1 | 33.3% | 15.3 |
| software-engineering | 26 | 8 | 30.8% | 3.1 |
| system-administration | 9 | 2 | 22.2% | 2.1 |
| security | 8 | 0 | 0% | -20.3 |
| Security | 7 | 0 | 0% | -15.1 |
| file-operations | 5 | 0 | 0% | -22.2 |
| debugging | 5 | 0 | 0% | -37.9 |
| mathematics | 4 | 0 | 0% | 15.9 |
| data-processing | 4 | 0 | 0% | 6.7 |
| model-training | 4 | 0 | 0% | 2.1 |
| video-processing | 1 | 0 | 0% | -5.5 |
| games | 1 | 0 | 0% | -12.3 |
| personal-assistant | 1 | 0 | 0% | -22.4 |

## Strongest babysitter candidates

1. **fp8-rmsnorm-gemm** (tb3, 12h, net_live 74.7) — The decisive benefit is the twelve-hour estimated horizon combined with ordered numeric derivation and explicit correctness and performance feedback, which supports a resumable, gated implementation-and-tuning loop. The main offset is that no directly matching supplied process governs this highly specialized H100 fp8 fused-kernel work, so encoding the useful workflow itself is costly. The task's output contract is unusually precise and confined to one source file, keeping shape uncertainty and broad scope drift relatively low despite its technical difficulty.
2. **distributed-dedup** (tb3, 10h, net_live 69) — The decisive benefit is the task's 600-minute estimated horizon combined with a strict dependency chain from normalized shingles through exact similarity edges and connected components. Deterministic correctness and resource-budget feedback support iterative convergence, but the work remains one tightly specified, indivisible implementation rather than a fan-out. Its exact contract keeps drift risk low despite the technical difficulty. The principal orchestration cost is that no named library process directly fits this constrained Spark algorithm and performance-profile task.
3. **vf2-speedup-networkx** (tb3, 4h, net_live 67.8) — The decisive benefit is the explicit, high-headroom 1000x performance target, which enables deterministic iterative optimization rather than a one-shot implementation. The task also has a multi-hour horizon and a real dependency between graph compatibility and VF2++ behavior. Its deliverables are unusually well specified, so work shape is not materially uncertain and the main Babysitter cost is authoring a custom process rather than runtime ceremony. A generic methodology alone would not directly encode both NetworkX-semantic parity and the hidden performance objective.
4. **exam-pdf-eval** (tb3, 14h, net_live 65.3) — The decisive benefit is the long horizon: the 840-expert-minute task joins several dependent artifacts with costly local-model execution and a held-out robustness requirement. Its ordered extraction-to-protocol-to-inference pipeline creates concrete ways for an unstructured run to pass visible checks while failing the re-invocation. Deterministic verifier signals and fixed output schemas support iterative validation, while the explicit specification keeps shape uncertainty relatively low. A general spec-driven process can structure the work without requiring a bespoke orchestration design.
5. **sam-cell-seg** (tb2.1, 10h, net_live 64.9) — The decisive benefit is the long expected horizon: the task is estimated at 600 expert minutes and combines model integration, mask post-processing, and hidden-test-compatible serialization. A concrete vanilla failure exists because independently plausible per-cell masks can still violate the required global non-overlap and single-component invariants. The deliverable shape is unusually explicit, so process discovery is not a major cost, while no catalogued process directly covers this specialized MobileSAM geometry pipeline. General TDD or plan-and-execute methodology could be incorporated, but the domain-specific stages and gates would need custom composition.
6. **freight-dispatch-shift** (tb3, 4h, net_live 64.9) — The decisive benefit is the strict stateful ordering between ingesting cutoff-visible events, planning, committing, and later preserving or superseding committed work. This is a multi-hour, deterministically verified CLI implementation with several coupled policy inputs, so explicit lifecycle gates can prevent plausible but temporally incorrect behavior. The deliverables and normative schema make the work shape highly knowable, while an existing specification-driven methodology substantially limits process-authoring cost. The exact output contract constrains solution latitude, but the broad state and policy surface still creates moderate drift risk.
7. **production-planning** (tb3, 4h, net_live 64.9) — The decisive benefit is the strict dependency order: a single feasible plan must drive consistent scheduling, reservations, dispatches, SQL artifacts, and gateway application. The task has a multi-hour horizon and measurable constraint-satisfaction and demand-fulfillment targets, making deterministic verification useful for correction cycles. However, its deliverables and phases are specified precisely, so the work shape is not exploratory and drift latitude is limited. The main Babysitter cost is that no listed process directly fits this specialized multi-database production-planning workflow, requiring a custom process.
8. **wal-recovery-ordering** (tb3, 6h, net_live 64.9) — The decisive benefit is the strict WAL sequencing contract: durability, acknowledgment, global-prefix visibility, and recovery replay must occur in an order whose violation can produce plausible but incorrect state. The task is long enough for structured phases to help, and its explicit contracts make that structure encodeable. A generic TDD process is available, although its recovery, concurrency, structural, and performance gates must be tailored to this task. Orchestration overhead is low relative to the six-hour expert estimate.
9. **bn-fit-modify** (tb2.1, 8h, net_live 63.2) — The decisive benefit is the multi-hour, artifact-dependent pipeline: each later statistical result relies on the recovered DAG and fitted network being correct. The task provides deterministic benchmark verification and tightly specified output files, limiting drift despite the statistical complexity. A generic plan-and-execute process fits the known sequence with little relative overhead, while no Bayesian-network-specific library process is identified in the supplied catalog.
10. **wdm-design** (tb3, 4h, net_live 62.1) — The decisive benefit is the strong convergence loop: this task defines a numerical objective with four hard broadband routing thresholds and deterministic DRC feedback. It also has a multi-hour horizon, and correctness depends on maintaining the verifier's exact ODD_Z, same-run normalization during repeated evaluations. The artifact contract is highly explicit, so work shape uncertainty and drift risk are limited despite the difficult physics. An existing evolutionary methodology fits the candidate-score-iterate structure without requiring a bespoke process.
