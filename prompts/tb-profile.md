# Terminal-Bench Profile — delta on `babysitter-vs-vanilla-eval.md`

This is a **corpus profile**, not a replacement rubric. Apply it on top of the base
evaluation prompt (§1–§9 of `babysitter-vs-vanilla-eval.md`). Where this file and the base
prompt conflict, this file wins; everything it does not mention is unchanged.

## Why a profile exists

Every task in this corpus is a Terminal-Bench task: a single containerized terminal
environment, a written instruction, and a verifier that runs a test suite. That makes six
of the thirteen rubric dimensions **constant across all 163 tasks**. Scoring them per-task
would be theater — the judge would be re-deriving the same value 163 times, and the
constant offset would drag every `Net` below the base prompt's thresholds, routing
everything to vanilla for a reason that has nothing to do with the individual task.

So they are pinned here, once, with evidence, and the judge scores only what varies.

## Pinned dimensions — do NOT score these

Use these values verbatim. The evidence is corpus-wide and already verified.

| Dim | Pin | Evidence |
|---|---|---|
| **B2** gate-ability | **3** | All 163 tasks ship a `tests/` directory and a `[verifier]` block with a timeout. Pass/fail is a container exit code, not a judgment. |
| **B4** irreversibility | **0** | Work happens in a disposable container. Nothing is pushed, deployed, published, or spent. Discarding the container is a complete undo. |
| **B7** repeatability / audit | **1** | The benchmark is re-run across models and agents, so not zero — but no individual task carries an audit or compliance duty. |
| **C3** human availability | **3** | Benchmark execution is headless by construction. No human can answer a breakpoint mid-task. |
| **C5** setup friction | **0** | Harbor provisions the image and environment. Nothing is installed for the task's sake. |
| **C6** latency sensitivity | **0** | Batch evaluation. No one is waiting on any individual task's turnaround. |

## Dimensions you DO score

Benefit: **B1** (ordering), **B3** (horizon), **B5** (convergence), **B6**
(decomposability), **B8** (drift risk).

Cost: **C2** (overhead ratio), **C4** (shape uncertainty).

There is no process-authoring dimension. Whether the Babysitter library happens to contain
a process for CAD, or genomics, or FPGA work is a fact about the library, not about the
task — see the base prompt's note under §5. Still name a `process_recommendation` (or
`custom`); it feeds the library backlog and costs the task nothing.

Score each 0–3 with evidence, exactly as the base prompt specifies.

### Reading the inputs

You are given, per task:

- `instruction.md` — the full task statement handed to the agent. This is your primary
  evidence for every dimension.
- `task.toml` metadata — `difficulty`, `category`, `expert_time_estimate` (in minutes),
  `[agent] timeout_sec`, `[verifier] timeout_sec`.
- the `tests/` file listing — filenames only.

You are **not** given the reference solution, and must not speculate about it.

### Calibration notes for the live dimensions

**B3 (horizon)** — `expert_time_estimate` is the strongest available signal, but it is a
*human expert's* time, not an agent's. Calibrate against the corpus, not against a
workday: the median task in this corpus is 120 expert-minutes.

- 0 → under ~30 expert-minutes; a focused single sitting
- 1 → ~30–120 minutes
- 2 → ~2–8 hours, or an `[agent] timeout_sec` at/above 7200
- 3 → over ~8 hours, or an instruction with distinct phases that each produce an artifact
  the next phase consumes

**B1 (ordering)** — score on whether the instruction imposes a sequence whose violation
silently corrupts the result, *not* on whether the instruction is long or has many bullet
points. A list of independent requirements is not an ordering constraint. Judge from
artifact flow: does any step consume something an earlier step produces?

- 0 → the stated requirements can be satisfied in any order; no step consumes another
  step's output
- 1 → a natural reading order (inspect the inputs, then write the output) but nothing
  downstream breaks if you deviate
- 2 → the instruction names one intermediate artifact that a later step consumes, so
  producing them out of order gives a wrong result
- 3 → two or more chained artifact dependencies, or an explicit first-X-then-Y-then-Z
  whose violation silently yields a plausible-but-wrong answer

**B5 (convergence)** — does the instruction hand the agent a number to steer by? B2 is
pinned for "a verifier exists", so the hidden tests are not evidence here. **The `tests/`
file listing is not evidence for B5** — the agent cannot read the verifier while working.
Score only what the instruction text itself states.

- 0 → no number to steer by; the agent cannot tell how close it is until the verifier runs
- 1 → the instruction names a command, script or worked example the agent can run itself to
  check its work, but states no number
- 2 → the instruction states a numeric bound to satisfy — a tolerance, accuracy, timeout or
  threshold — that the agent can measure itself against
- 3 → the instruction states a numeric target to beat or minimise, so additional effort
  keeps paying (at least N× faster, minimise the error, exceed a stated baseline)


**B6 (decomposability)** — count the deliverables the instruction *names*, not the
requirements it lists. Several requirements about one artifact are one unit. The test is
whether a piece could be handed to a second person and verified without waiting for the
first.

- 0 → one output artifact
- 1 → one output artifact whose parts are separable in principle but ship and verify
  together
- 2 → two or three separately named outputs, each meaningful on its own
- 3 → four or more named outputs, or an explicitly enumerated set (per-file, per-case,
  per-target), each verifiable alone


**B8 (drift risk)** — weigh two things: how much latitude the instruction leaves (an
under-specified goal invites over-building), and how much surface the work touches. A task
with an exact output schema and one output file constrains the agent tightly — that is low
drift risk even if the work is hard. Difficulty is not drift risk.

**C2 (overhead ratio)** — orchestration cost relative to the work. Anchor on
`expert_time_estimate`; this is the mirror of B3 and should be scored consistently with it.

- 0 → over ~8 hours; mandatory stops are a rounding error against the work
- 1 → ~2–8 hours; orchestration is material but does not dominate
- 2 → ~30–120 minutes; the ceremony is a noticeable fraction of the task
- 3 → under ~30 minutes; per-step stops cost more than the work itself

**C4 (shape uncertainty)** — score what the instruction *shows*, not how hard the work
feels. Terminal-Bench instructions are unusually explicit about deliverables, so most of
this corpus is low. Unreadable inputs (a schematic, a binary, a video) make the content
unknown but usually leave the shape knowable — score the shape.

- 0 → the instruction enumerates the steps, or names every output artifact and the
  transformation between them
- 1 → the outputs are named but the method is not; the approach is standard for the stated
  domain and only the tooling choice is open
- 2 → the approach cannot be chosen until a supplied input has been inspected (a file,
  dataset, image or log named in the instruction)
- 3 → the instruction states a symptom or a goal rather than a deliverable, so the first
  real step is diagnosis


## Scoring math

Compute both. The base prompt's formula, with the pins substituted, gives `net_raw` and is
kept only for comparability with non-Terminal-Bench evaluations:

```
Benefit_raw = Σ (w · s / 3) over all 8 benefit dims   (B2/B4/B7 using their pins)
Cost_raw    = Σ (w · s / 3) over all 5 cost dims      (C3/C5/C6 using their pins)
net_raw     = Benefit_raw − Cost_raw
```

`net_live` is the number that actually ranks tasks in this corpus. It renormalizes over the
live dimensions so the 0–100-per-side scale — and therefore the base prompt's thresholds —
stay meaningful:

```
Benefit_live = [ Σ (w · s / 3) over {B1:15, B3:15, B5:10, B6:8, B8:10} ] × 100 / 58
Cost_live    = [ Σ (w · s / 3) over {C2:27, C4:34} ]                    × 100 / 61
net_live     = Benefit_live − Cost_live        # −100 .. +100
```

### Thresholds

The base prompt's `+20 / −15` were pre-registered against an earlier, prose-only revision of
this profile. Giving B1, B5, C2 and C4 anchor ladders cut inter-judge disagreement by 28%
but also moved the scale: the middles of the C2 and C4 ranges had been undefined and judges
defaulted low, so cost is now scored about 16 points higher.

Thresholds are therefore **translated by that measured shift, and by nothing else** —
a paired per-task comparison over all 163 tasks gives a median shift of −15.8
(95% CI [−18.6, −14.0]), rounded to −16:

```
babysitter ≥ +4      vanilla ≤ −31
```

This is a re-registration against a changed rubric, not a fit to a desired split. The
translation is mechanical; the resulting babysitter count (59) happens to match the previous
revision's exactly, which is a consequence rather than a target.

Report both, rounded to one decimal. **Do not assign a verdict.** Thresholds for this
corpus are calibrated from the distribution of all 163 `net_live` values after judging, so
a per-task verdict here would be guesswork. Emit scores, evidence, and the counterfactual;
the verdict is assigned downstream.

## What still applies from the base prompt

- **§4's mandatory counterfactual is the most important clause on this corpus.** Every
  task here is verifiable, sandboxed, and self-contained, so it is easy to talk yourself
  into orchestration on difficulty alone. Write `vanilla_failure_mode` as a concrete
  failure: the step that gets skipped, the artifact that gets silently wrong, the point
  where the agent stops early and declares success. "It's a hard task" is not a failure
  mode. If you cannot name one, set `counterfactual_empty: true` — the downstream
  calibration applies the base prompt's cap.
- **Evidence or zero.** No score above 0 without a cited span from the instruction or
  metadata.
- **Do not inflate scores to reach a conclusion.** You are not assigning a verdict here,
  so there is nothing to steer toward.

## Hard routes

The base prompt's hard routes are **suspended** for this corpus. BS2/BS3/BS4 and V1/V2/V4
depend on audit duties, irreversible actions, recurrence, and conversational context that
are all constant or absent here. V3 (no deterministic verification) can never fire, since
B2 is pinned at 3. Applying them would only re-encode the constants.

Record `hard_route: null` and let `net_live` decide.
