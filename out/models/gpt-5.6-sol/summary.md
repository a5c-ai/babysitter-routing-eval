# Summary

Corpus 163 tasks · thresholds low=-15 high=20 (doc defaults)

## Verdicts

| | babysitter | borderline | vanilla | n | net_live mean | sd | min | max |
|---|---|---|---|---|---|---|---|---|
| **all** | 62 | 61 | 40 | 163 | 11.3 | 31.7 | -85.6 | 73.6 |
| tb2.1 | 21 | 36 | 32 | 89 | -0.6 | 30 | -85.6 | 71.1 |
| tb3 | 41 | 25 | 8 | 74 | 25.5 | 27.6 | -38.9 | 73.6 |

## Does the rubric discriminate?

Per-dimension score distribution across the corpus. **A dimension with near-zero sd is dead weight and should be cut from the rubric** — it is not distinguishing tasks, only adding a constant.

| dim | mean | sd | min | max | #0 | #1 | #2 | #3 |
|---|---|---|---|---|---|---|---|---|
| B1 | 1.9 | 0.9 | 0 | 3 | 16 | 30 | 77 | 40 |
| B3 | 1.7 | 0.9 | 0 | 3 | 18 | 48 | 70 | 27 |
| B5 | 1.6 | 1.1 | 0 | 3 | 34 | 41 | 44 | 44 |
| B6 | 0.7 | 0.8 | 0 | 3 | 75 | 63 | 23 | 2 |
| B8 | 1.3 | 0.5 | 0 | 3 | 6 | 113 | 41 | 3 |
| C2 | 1.1 | 1.1 | 0 | 3 | 68 | 35 | 42 | 18 |
| C4 | 1.2 | 1 | 0 | 3 | 49 | 52 | 36 | 26 |

All live dimensions show real spread (sd ≥ 0.35).

Spearman correlation between `net_live` and expert time estimate: **0.6** (n=162). The rubric weights horizon heavily, so a low value means B3 is being scored inconsistently with the metadata.

## Panel reliability

No tasks landed in the borderline band; no panel ran.

## Counterfactual quality

0/163 judgments could not name a concrete vanilla failure mode. On this corpus that clause is the main brake on ceremony bias, so a high number here means the verdicts lean optimistic.

## By category

| category | n | babysitter | share | median net_live |
|---|---|---|---|---|
| optimization | 1 | 1 | 100% | 38.7 |
| Operations | 10 | 8 | 80% | 50.6 |
| Software | 20 | 12 | 60% | 35.3 |
| Science | 15 | 9 | 60% | 27.8 |
| Hardware | 5 | 3 | 60% | 41.6 |
| ML | 13 | 7 | 53.8% | 33.5 |
| Media | 4 | 2 | 50% | 33.3 |
| scientific-computing | 8 | 3 | 37.5% | 18.6 |
| data-science | 8 | 3 | 37.5% | 12.4 |
| software-engineering | 26 | 9 | 34.6% | 4.6 |
| machine-learning | 3 | 1 | 33.3% | 6.9 |
| mathematics | 4 | 1 | 25% | 14.6 |
| system-administration | 9 | 2 | 22.2% | 2.1 |
| file-operations | 5 | 1 | 20% | -20.7 |
| security | 8 | 0 | 0% | -18.8 |
| Security | 7 | 0 | 0% | -13 |
| debugging | 5 | 0 | 0% | -28 |
| data-processing | 4 | 0 | 0% | 12.4 |
| model-training | 4 | 0 | 0% | -6.5 |
| data-querying | 1 | 0 | 0% | 18.8 |
| games | 1 | 0 | 0% | -6.5 |
| video-processing | 1 | 0 | 0% | -8.4 |
| personal-assistant | 1 | 0 | 0% | -16.7 |

## Strongest babysitter candidates

1. **data-anonymization** (tb3, 24h, net_live 73.6) — B3 dominates because the 1440-minute expert estimate places this well beyond a single sitting. Strict dependency ordering and numerous deterministic invariants make enforced test-and-fix cycles useful, especially for preventing superficially valid but inconsistent anonymization. The exact CLI and output contract keep drift and shape uncertainty low despite the task's technical difficulty. Orchestration overhead is negligible relative to the estimated workload.
2. **regex-chess** (tb2.1, 24h, net_live 71.1) — B3 dominates because the 1440-minute expert estimate places this far beyond a single sitting. Strictly ordered substitutions and a supplied checker make staged, test-backed iteration particularly valuable. The exact artifact contract keeps shape uncertainty low, while the breadth of chess legality creates a concrete premature-success risk despite the tightly constrained output format.
3. **freight-dispatch-shift** (tb3, 4h, net_live 70.7) — B1 dominates because correctness depends on enforcing a chronological state-machine lifecycle across repeated verifier invocations. The four-hour estimate and two-hour agent timeout also make interruption and premature completion plausible, supporting B3 and B8. The normative schema keeps the work shape well-defined, so C4 is zero, while the task's duration makes orchestration overhead negligible. The strongest process value is repeated gating of state transitions and cutoff-specific outputs rather than parallel fan-out.
4. **atrx-vep-crispr** (tb3, 7h, net_live 67.8) — B1 dominates because this is a long, strictly dependent bioinformatics pipeline where an early transcript or coordinate error contaminates every later field. B3 is also high: the 420-minute estimate and multiple artifact-consuming phases create meaningful interruption and premature-completion risk. The exact schema limits open-ended scope, but the many coupled biological and coordinate transformations still produce substantial drift risk. Orchestration costs are comparatively low because the task is lengthy and its execution shape is explicitly specified.
5. **gsea-proteomics** (tb3, 4h, net_live 66.7) — The strongest benefit is enforced ordering because the TAR differential-expression result becomes the gene set consumed by every later GSEA comparison and summary. The 240-minute estimate and multiple dependent artifacts also create a substantial execution horizon, while eight EXP comparisons provide moderate fan-out. The task is tightly specified, so uncertainty and drift are limited, and its size makes orchestration overhead comparatively negligible. The concrete vanilla risk is premature completion or silent corruption of the shared upstream gene set and therefore all downstream files.
6. **exam-pdf-eval** (tb3, 14h, net_live 65.3) — B3 dominates because the 840-minute estimate and multi-artifact pipeline clearly exceed one sitting. Strict stage dependencies and the requirement to run the completed harness twice make enforced ordering valuable. The task also offers several quantitative convergence signals, while exact schemas constrain—but do not eliminate—drift across PDF extraction, inference, and hidden-layout robustness. Cost is low overall; only limited implementation-shape uncertainty remains around OCR and the container's available parsing capabilities.
7. **torch-pipeline-parallelism** (tb2.1, 4h, net_live 64.9) — B1 dominates because all-forward-then-all-backward ordering is the defining correctness requirement, not merely a suggested implementation detail. The four-hour expert estimate also gives the task a meaningful horizon, while reference activation and gradient comparisons support iterative correction. Drift remains low because the deliverable and interfaces are unusually precise, and the work is tightly coupled rather than highly parallelizable. Both live cost dimensions are minimal because the task is substantial and its implementation shape is known up front.
8. **react-lead-form** (tb3, 5h, net_live 64.9) — B1 dominates because ledger derivation, timestamp preservation, shared-pipeline use, and atomic commits impose real sequencing dependencies whose violation can produce plausible but inconsistent artifacts. B3 is also material given the five-hour expert estimate and 7200-second timeout. The detailed local contracts keep shape uncertainty low, while the breadth and coupling justify moderate drift risk rather than treating difficulty alone as drift. Convergence value is limited because verification is deterministic but binary rather than score-driven.
9. **math-eval-grader** (tb3, 6h, net_live 61.3) — The strongest benefit is enforcing the dependency order from answer extraction and grader validation through deterministic model evaluation and final aggregation. The six-hour expert estimate creates a substantial horizon, while the 168-case development suite supports meaningful convergence loops. Forty-eight problem-level units also provide genuine fan-out opportunities. The exact schemas, pinned revision, and canonical protocol keep drift and work-shape uncertainty relatively low.
10. **gpt2-codegolf** (tb2.1, 40h, net_live 60.7) — B3 dominates because the 2400-minute expert estimate makes this far longer than a normal single sitting. Strictly ordered decoding and inference stages, plus exact correctness and byte-size targets, also make enforced iterative convergence valuable. Decomposability and drift risk remain low because the result is one tightly constrained C file. The only material process cost is modest uncertainty around the undocumented checkpoint and BPE layouts.
