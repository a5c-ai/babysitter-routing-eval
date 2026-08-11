# Summary

Corpus 163 tasks · thresholds low=-25 high=10 (CLI override)

## Verdicts

| | babysitter | borderline | vanilla | n | net_live mean | sd | min | max |
|---|---|---|---|---|---|---|---|---|
| **all** | 64 | 78 | 21 | 163 | 3.9 | 26.3 | -65.5 | 71.1 |
| tb2.1 | 23 | 48 | 18 | 89 | -3.8 | 27.4 | -65.5 | 65.3 |
| tb3 | 41 | 30 | 3 | 74 | 13.1 | 21.6 | -37.5 | 71.1 |

## Does the rubric discriminate?

Per-dimension score distribution across the corpus. **A dimension with near-zero sd is dead weight and should be cut from the rubric** — it is not distinguishing tasks, only adding a constant.

| dim | mean | sd | min | max | #0 | #1 | #2 | #3 |
|---|---|---|---|---|---|---|---|---|
| B1 | 2.7 | 0.5 | 1 | 3 | 0 | 3 | 38 | 122 |
| B3 | 1.7 | 0.9 | 0 | 3 | 17 | 50 | 66 | 30 |
| B5 | 1.8 | 1 | 0 | 3 | 15 | 59 | 25 | 64 |
| B6 | 0.8 | 0.8 | 0 | 3 | 70 | 64 | 21 | 8 |
| B8 | 1.3 | 0.6 | 0 | 3 | 9 | 102 | 50 | 2 |
| C2 | 1.4 | 0.9 | 0 | 3 | 23 | 62 | 60 | 18 |
| C4 | 1.8 | 0.9 | 0 | 3 | 17 | 23 | 91 | 32 |

All live dimensions show real spread (sd ≥ 0.35).

Spearman correlation between `net_live` and expert time estimate: **0.7** (n=162). The rubric weights horizon heavily, so a low value means B3 is being scored inconsistently with the metadata.

## Panel reliability

78 tasks are borderline in this one-judge payload; no panel results are present.

## Counterfactual quality

0/163 judgments could not name a concrete vanilla failure mode. On this corpus that clause is the main brake on ceremony bias, so a high number here means the verdicts lean optimistic.

## By category

| category | n | babysitter | share | median net_live |
|---|---|---|---|---|
| data-querying | 1 | 1 | 100% | 22 |
| Science | 15 | 11 | 73.3% | 17.4 |
| Operations | 10 | 6 | 60% | 13 |
| Hardware | 5 | 3 | 60% | 11.1 |
| Software | 20 | 11 | 55% | 16.3 |
| ML | 13 | 7 | 53.8% | 17.6 |
| data-processing | 4 | 2 | 50% | 19.9 |
| software-engineering | 26 | 11 | 42.3% | 6.5 |
| scientific-computing | 8 | 3 | 37.5% | 0 |
| machine-learning | 3 | 1 | 33.3% | 0.8 |
| Security | 7 | 2 | 28.6% | 0.2 |
| data-science | 8 | 2 | 25% | -6.9 |
| mathematics | 4 | 1 | 25% | 5.6 |
| Media | 4 | 1 | 25% | 5.2 |
| system-administration | 9 | 2 | 22.2% | -5 |
| security | 8 | 0 | 0% | -39.3 |
| debugging | 5 | 0 | 0% | -28.9 |
| file-operations | 5 | 0 | 0% | -26.4 |
| model-training | 4 | 0 | 0% | -10.7 |
| video-processing | 1 | 0 | 0% | 2.7 |
| optimization | 1 | 0 | 0% | -9.2 |
| games | 1 | 0 | 0% | -14.9 |
| personal-assistant | 1 | 0 | 0% | -33.7 |

## Strongest babysitter candidates

1. **retro-console-soc** (tb3, 10h, net_live 71.1) — B3 is the strongest benefit driver because the 600-minute expert estimate puts this well beyond a single sitting, where resumable state protects a large integrated implementation. B1 and B5 are also strong: CPU execution, PPU state, mapper behavior, and final pixels form a dependency chain, while timing, device fit, and reference-frame matching provide concrete convergence targets. B6 is substantial but not maximal because the major RTL blocks can fan out only before tightly coupled integration. The main discouraging factor is C4, though only mildly: the detailed implementation must be designed, but the overall RTL development and verification method is conventional.
2. **regex-chess** (tb2.1, 24h, net_live 65.3) — B1 is the strongest task-specific benefit: this is inherently a chained transformation pipeline in which ordering mistakes can silently corrupt generated positions. The 24-hour expert estimate also makes resumption valuable and leaves orchestration overhead negligible. Explicit pair-count and byte-size ceilings support measurable convergence, while the separate chess-rule families provide meaningful but not fully independent decomposition. The output contract is precise and the broad method is prescribed, so drift and shape uncertainty remain limited despite the task's technical difficulty.
3. **gpt2-codegolf** (tb3, 40h, net_live 60.7) — B3 is the strongest benefit driver because the 2400-minute expert estimate makes context loss or premature completion plausible, while B1 and B5 provide enforceable sequencing and optimization loops. A process can preserve progress while repeatedly gating exact inference, byte count, and runtime, rather than accepting the first functionally plausible implementation. The main cost is modest C4 method uncertainty from choosing checkpoint parsing and extreme code-golf techniques, but the task is not open-ended diagnosis.
4. **freecad-spring-clip** (tb3, 2h, net_live 55.9) — B1 is the strongest benefit because this model has multiple chained dependencies from parameters through tangent profile construction to padding and saved parametric Bodies. B5 is also substantial: exact equations, inequalities, closure, and tangency provide measurable residuals for convergence rather than relying solely on the hidden verifier. The 120-minute estimate and 9000-second timeout support a multi-hour horizon, while the tightly prescribed CAD procedure keeps shape uncertainty at zero. The main cost is C2 because mandatory orchestration stops remain noticeable for work near the two-hour boundary.
5. **atrx-vep-crispr** (tb3, 7h, net_live 53.1) — B1 is the strongest benefit because this is a long, tightly chained computational pipeline in which each selected or derived value controls later results. B3 is also high: the 420-minute estimate and multiple dependent scientific phases create meaningful interruption and premature-completion risk. The exact schema and explicit biological rules keep drift risk low, while the absence of a scored optimization target limits convergence value. The method is already specified, and the task's size makes orchestration overhead proportionally modest.
6. **sam-cell-seg** (tb2.1, 10h, net_live 52.5) — B3 is a leading benefit driver because the 600-minute expert estimate places this beyond an eight-hour task, while the chained segmentation-to-cleanup-to-contour workflow also creates strong ordering value. The explicit zero-overlap and one-component constraints support deterministic convergence checks during development. Per-cell processing offers meaningful fan-out, although global overlap resolution couples the units. The main cost is C4: important algorithmic choices depend on inspecting the supplied image and CSV, but that uncertainty does not erase the long horizon or measurable quality targets.
7. **exam-pdf-eval** (tb3, 14h, net_live 51.3) — B3 is the strongest driver because the 840-minute expert estimate and distinct extraction, inference, and reproducibility phases put the task well beyond one sitting. B1 is also strong: extraction and gold parsing feed protocol formatting, which feeds inference and result aggregation, so an early silent error contaminates every downstream artifact. The explicit dev predictions, deterministic-rerun requirement, counts, and runtime ceiling support meaningful convergence loops, while the 50-problem/two-model matrix offers real fan-out. The main counterweight is C4 because robust extraction strategy depends on inspecting heterogeneous PDFs and available OCR tooling, but orchestration overhead is negligible at this task size.
8. **mcmc-sampling-stan** (tb2.1, 3h, net_live 50.2) — B1 is the dominant benefit because model/data preparation, sampling, posterior extraction, and result persistence form a strict multi-step dependency chain. The 180-minute estimate gives meaningful horizon and leaves room for iterative checks of MCMC diagnostics, while the narrowly specified contract keeps drift risk low. C2 is the only material cost: orchestration is noticeable for a three-hour task, but C4 is zero because the method is explicitly prescribed. A plan-and-execute process could enforce completion of the long sampling stage before validating and publishing the derived means.
9. **torch-tensor-parallelism** (tb2.1, 4h, net_live 50.2) — B1 is decisive because correct behavior depends on a strict shard–local-compute–collective sequence, with bias placement coupled to the reduction order. The four-hour estimate gives meaningful horizon, and serial `torch.nn.Linear` behavior provides a measurable numerical reference for iterative checks. The specification tightly constrains the artifact, so drift and decomposition benefits remain modest. Orchestration overhead is proportionate rather than dominant, while the prescribed method leaves essentially no shape uncertainty.
10. **write-compressor** (tb2.1, 24h, net_live 47.9) — B3 is the strongest benefit signal because the 1440-minute expert estimate places this far beyond one sitting. The task also has a strict reverse-engineer→encode→measure dependency chain and an explicit, locally measurable 2500-byte convergence target. C4 remains substantial because the method is unknowable before inspecting the supplied decoder and data, while orchestration overhead is negligible at this horizon. The exact decoded-output requirement constrains drift, but "any way you want" still permits materially different valid compressed artifacts.
