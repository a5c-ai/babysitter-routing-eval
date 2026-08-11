# Summary

Corpus 163 tasks · thresholds low=-25 high=10 (CLI override)

## Verdicts

| | babysitter | borderline | vanilla | n | net_live mean | sd | min | max |
|---|---|---|---|---|---|---|---|---|
| **all** | 59 | 63 | 41 | 163 | -0.6 | 33.1 | -77 | 73.6 |
| tb2.1 | 22 | 32 | 35 | 89 | -11.9 | 31.3 | -77 | 73.6 |
| tb3 | 37 | 31 | 6 | 74 | 13.1 | 29.9 | -45 | 72.2 |

## Does the rubric discriminate?

Per-dimension score distribution across the corpus. **A dimension with near-zero sd is dead weight and should be cut from the rubric** — it is not distinguishing tasks, only adding a constant.

| dim | mean | sd | min | max | #0 | #1 | #2 | #3 |
|---|---|---|---|---|---|---|---|---|
| B1 | 2.5 | 0.7 | 0 | 3 | 3 | 6 | 59 | 95 |
| B3 | 1.6 | 1 | 0 | 3 | 26 | 46 | 63 | 28 |
| B5 | 1.8 | 0.9 | 0 | 3 | 12 | 57 | 50 | 44 |
| B6 | 0.6 | 0.9 | 0 | 3 | 105 | 36 | 10 | 12 |
| B8 | 1 | 0.9 | 0 | 3 | 59 | 58 | 38 | 8 |
| C2 | 1.5 | 0.9 | 0 | 3 | 26 | 51 | 59 | 27 |
| C4 | 1.7 | 1 | 0 | 3 | 24 | 35 | 71 | 33 |

All live dimensions show real spread (sd ≥ 0.35).

Spearman correlation between `net_live` and expert time estimate: **0.7** (n=162). The rubric weights horizon heavily, so a low value means B3 is being scored inconsistently with the metadata.

## Panel reliability

63 tasks are borderline in this one-judge payload; no panel results are present.

## Counterfactual quality

1/163 judgments could not name a concrete vanilla failure mode. On this corpus that clause is the main brake on ceremony bias, so a high number here means the verdicts lean optimistic.

## By category

| category | n | babysitter | share | median net_live |
|---|---|---|---|---|
| optimization | 1 | 1 | 100% | 13.6 |
| data-querying | 1 | 1 | 100% | 11.7 |
| Science | 15 | 12 | 80% | 29.9 |
| Operations | 10 | 7 | 70% | 25.7 |
| ML | 13 | 6 | 46.2% | 8.4 |
| Software | 20 | 9 | 45% | 6.5 |
| Hardware | 5 | 2 | 40% | 0.8 |
| software-engineering | 26 | 10 | 38.5% | -2.1 |
| scientific-computing | 8 | 3 | 37.5% | 7.5 |
| machine-learning | 3 | 1 | 33.3% | -4.6 |
| data-science | 8 | 2 | 25% | -8.8 |
| mathematics | 4 | 1 | 25% | 7.3 |
| data-processing | 4 | 1 | 25% | -1.1 |
| system-administration | 9 | 2 | 22.2% | -10.7 |
| Security | 7 | 1 | 14.3% | -7.9 |
| security | 8 | 0 | 0% | -47.9 |
| debugging | 5 | 0 | 0% | -44.1 |
| file-operations | 5 | 0 | 0% | -33.5 |
| Media | 4 | 0 | 0% | -0.6 |
| model-training | 4 | 0 | 0% | -32.6 |
| video-processing | 1 | 0 | 0% | 5.6 |
| games | 1 | 0 | 0% | -4.6 |
| personal-assistant | 1 | 0 | 0% | -44.1 |

## Strongest babysitter candidates

1. **regex-chess** (tb2.1, 24h, net_live 73.6) — The decisive factor is the task's massive horizon (24 expert-hours), which makes context loss and premature completion a near-certainty in a vanilla session (B3=3, C2=0). This is a complex, generative task requiring a long and strictly ordered sequence of steps to correctly implement chess logic (B1=3), where a mistake would silently corrupt the result. Babysitter is necessary to manage the long-running process, enforce iterative development against the provided checker (`check.py`), and prevent the agent from getting lost or stopping early.
2. **live-database-cutover** (tb3, 8h, net_live 72.2) — The decision is dominated by the task's high benefit scores. This is a complex, multi-phase (B3=3) live database migration with strict ordering constraints (B1=3) to prevent data corruption. The risk of a plausible but incorrect implementation causing catastrophic data loss is extremely high (B8=3), and there are clear convergence targets for data consistency and performance (B5=3). The costs are low because the task is long (C2=0) and the procedure is conceptually known (C4=1). Orchestration is necessary to enforce the critical sequence of steps and verification gates.
3. **fp8-rmsnorm-gemm** (tb3, 12h, net_live 69) — The decision is driven by the task's long horizon (B3=3 from 720 expert minutes) and the presence of a complex, strict ordering of operations (B1=3). This is a multi-session task where losing context would be fatal. The existence of a clear, iterative performance target (B5=3) further supports using an enforced process to guide the agent toward the required speedup. Costs are minimal as the overhead is low for such a large task (C2=0) and the implementation path is precisely defined (C4=0).
4. **fin-saccr-rwa** (tb3, 8h, net_live 66.7) — The decisive factor is the strict, multi-step ordering required for the SA-CCR financial calculation (B1=3), where a deviation produces a silently incorrect result. This, combined with the long time horizon (B3=3) making resumption critical, strongly favors an orchestrated approach. The costs are minimal, as the task's shape is known (C4=0) and the work is large enough to absorb any overhead (C2=0).
5. **distributed-dedup** (tb3, 10h, net_live 66.5) — This task is a strong candidate for orchestration due to its high complexity, long time horizon, and stringent, measurable quality criteria. The 10-hour expert time estimate (B3=3) and the multi-stage, order-dependent algorithm (B1=3) make it a poor fit for a single vanilla session. The explicit performance and correctness budgets (B5=3) provide clear, machine-checkable gates that a structured process can use to iterate towards a valid solution, which a vanilla agent might fail to satisfy. Costs are low, as the task's long duration minimizes orchestration overhead (C2=0) and the algorithmic pattern is standard for the domain (C4=1).
6. **jax-speedrun-gpu** (tb3, 10h, net_live 61.9) — The task is a strong candidate for orchestration, primarily due to its long horizon and the nature of its success condition. The 10-hour expert time estimate (B3=3) makes it a multi-session project where state management and resumption are critical. Furthermore, the task is a convergence problem with a specific performance target (B5=3), which is well-suited to a structured, iterative process with gates. An un-orchestrated agent is likely to drift or fail to meet the strict performance criteria. Costs are minimal due to the long duration of the task (C2=0) and the relatively well-defined problem shape (C4=1).
7. **ks-solver-cpp** (tb3, 10h, net_live 61.9) — The decision is driven by the task's exceptionally long time horizon and complexity. The 10-hour expert estimate (B3=3, C2=0) makes context loss in a vanilla session almost inevitable. The required sequence of implementation for the numerical solver (B1=3) and the high risk of producing a plausible-but-wrong solution (B8=2) strongly argue for an enforced, structured process to ensure correctness over the long duration.
8. **retro-console-soc** (tb3, 10h, net_live 59.6) — The decision is driven by the sheer scale and complexity of the task. With a 10-hour expert estimate (B3=3, C2=0), the project will span multiple sessions, making Babysitter's ability to resume from a journal essential. The task also involves implementing tightly-coupled subsystems (B1=3) with clear, measurable convergence targets like pixel-perfect rendering and FMax (B5=3), making it a perfect fit for a structured, iterative process with quality gates. A vanilla agent would likely fail due to context loss over the long duration.
9. **exam-pdf-eval** (tb3, 14h, net_live 57.1) — The dominant factor is the task's massive horizon (B3) and complexity, requiring a multi-phase, ordered pipeline (B1) with a high risk of building a plausible-but-brittle solution (B8). An agent needs a structured process to manage the distinct stages (extraction, evaluation, aggregation) and ensure the final harness is robust enough for the hidden verification cases. The shape uncertainty (C4) is a cost, but it's outweighed by the benefits of process enforcement on a task this large.
10. **gpt2-codegolf** (tb3, 40h, net_live 56.1) — The decisive factor is the extreme length and complexity of the task, estimated at 40 expert-hours (B3=3). A single vanilla session is completely inappropriate for a task of this magnitude. Babysitter's journaling and resumption are essential. Additionally, the task has clear, machine-measurable convergence targets (program size, execution speed) that are perfect for iterative development within an enforced process (B5=3), while the costs of orchestration are minimal (C2=0).
