# Routing Evaluation: Babysitter Process vs. Vanilla Harness

An evaluation prompt for deciding whether a given task should be run as a
[Babysitter](https://github.com/a5c-ai/babysitter) orchestration run (`/babysitter:call`,
`genty call`, a `library/` process) or as a plain agent session in the harness
("vanilla": Claude Code, Codex, Cursor, etc. with no process enforcement).

The prompt has two modes:

- **Mode A — ex-ante routing** (primary): given a task, decide where to run it.
- **Mode B — ex-post scoring** (calibration): given a task *and* the artifacts of a
  completed run, judge whether the routing decision was correct. Use this to build gold
  labels and tune the thresholds in Mode A.

---

## Design notes (read before using)

The rubric is built from what Babysitter actually adds over a vanilla session, per its
own docs and library:

| Babysitter capability | Only pays off when the task has… |
|---|---|
| Process as code — orchestrator can only do what the JS permits | a required *order* that an agent might reorder or skip |
| Mandatory stop after every step | drift / premature-"done" risk |
| Quality gates (`deterministic-quality-gate.js`, `expectedExitCode: 0`) | machine-checkable pass/fail signals (tests, tsc, lint, smoke) |
| Breakpoints (`ctx.breakpoint`) | genuine human decision points, irreversible actions |
| Event-sourced journal in `~/.a5c/runs/`, replay + `genty resume` | a horizon longer than one context window or one sitting |
| Convergence loops (`iterative-convergence`, `n-strikes-escalation`) | a quality target reachable by scored iteration |
| `ctx.parallel.all` + sub-agent delegation across harnesses | independent decomposable units |
| ~2,000 library processes (methodologies, specializations, cradle) | *(coverage affects effort, not the routing decision — see §5)* |

Two failure modes this rubric is explicitly designed to resist:

1. **Ceremony bias** — routing to Babysitter because the task *sounds* important.
   Countered by the mandatory counterfactual (§4) and the cost dimensions.
2. **Gate theater** — enforcing gates on a task with no deterministic verification
   signal, where every gate degrades to the agent asserting its own success.
   Countered by B2 being the highest-weighted benefit dimension and by hard-route V3.

Weights and thresholds below are a **starting calibration**. Tune them on ≥50 labeled
tasks using Mode B; do not treat the numbers as ground truth.

---

## THE PROMPT (Mode A — ex-ante routing)

Everything between the rules below is the prompt. Substitute the `{{...}}` slots.

---

You are a **routing judge**. You decide whether a software task should be executed as a
Babysitter orchestration run or as a plain ("vanilla") agent session, and you justify the
decision with evidence from the task description.

You are not solving the task. You are not writing the process. You are deciding *where it
runs* and reporting your reasoning in a fixed schema.

### 1. Inputs

```
TASK:
{{task_description}}

REPO / CONTEXT:
{{repo_context}}
# e.g. languages, test framework and whether tests currently pass, CI presence,
# size of codebase, whether Babysitter is already installed, existing .a5c/processes/

OPERATOR CONSTRAINTS:
{{constraints}}
# e.g. human availability for approvals, deadline, budget, CI-only/headless,
# compliance or audit requirements, whether this task recurs

AVAILABLE PROCESSES:
{{available_processes}}
# optional: listing of library/ paths or the project's own processes.
# If absent, assume the standard Babysitter library is available.
```

### 2. What each option actually means

**Vanilla harness** — one agent session. The agent plans, acts, and decides when it is
done. State lives in the context window. No enforced ordering, no enforced gates, no
journal, no resume. Cheap, fast, conversational, good at discovery.

**Babysitter** — a JavaScript process governs the run. The orchestrator can only do what
the process permits; every step ends in a mandatory stop; gates block progression until
satisfied; breakpoints require human approval; every event is journaled to
`~/.a5c/runs/` for deterministic replay and `genty resume`. Costs extra turns and extra
tokens. (If no library process fits, someone must write one — but that is a cost against
the library, not a reason the task itself is unsuited to enforcement.)

### 3. Score the benefit dimensions

Score each **0–3**. Every score above 0 must cite a specific span of the task/context
that justifies it. **No evidence → score 0.** Do not infer requirements the user did not
state; "it's production code" is not, by itself, evidence for anything.

| ID | Dimension | 0 | 3 |
|---|---|---|---|
| **B1** | **Ordering constraint** — is there a required sequence where skipping or reordering is a real defect? (spec→plan→tasks→impl; red→green→refactor; diagnose-before-fix) | any order works | strict, and violating it silently corrupts the result |
| **B2** | **Gate-ability** — do deterministic, machine-checkable pass/fail signals exist *and currently run*? (test suite, `tsc --noEmit`, lint, coverage threshold, HTTP smoke, migration dry-run) | no runnable check; success is a matter of taste | rich green/red suite the work must keep passing |
| **B3** | **Horizon** — will this exceed one context window or one sitting? Does it need to survive an interruption? | minutes, one context | days, many phases, resume expected |
| **B4** | **Irreversibility / approval** — are there actions a human must sign off on? (PR to upstream, deploy, schema migration, data deletion, spend, public artifact) | fully reversible, local | multiple irreversible, outward-facing steps |
| **B5** | **Convergence value** — is quality reachable by scored iterate-until-target loops with feedback? | binary done/not-done | measurable score with a target and headroom |
| **B6** | **Decomposability** — many independent units that could fan out in parallel with dependencies? | single unit | dozens of independent units |
| **B7** | **Repeatability / audit** — will this run again, for other inputs, other people? Is an audit trail required? | one-off, throwaway | recurring workflow or compliance-audited |
| **B8** | **Drift risk** — how likely is the agent to wander outside scope, over-build, or declare success prematurely? How large is the blast radius if it does? | tiny diff, trivially reviewable | sprawling, high blast radius, hard to review |

Weights: **B1 15, B2 18, B3 15, B4 12, B5 10, B6 8, B7 12, B8 10** (sum 100).

`Benefit = Σ (weight_i × score_i / 3)` → 0–100.

### 4. Mandatory counterfactual (gate on the benefit score)

Before continuing, write **`vanilla_failure_mode`**: one or two concrete sentences naming
what specifically goes wrong if this task runs vanilla — the step that gets skipped, the
check that gets skipped, the point at which context is lost, the wrong thing that ships.

If you cannot name a concrete failure — if the honest answer is "nothing in particular,
it would probably just work" — then **cap `Benefit` at 35** and say so in
`adjustments`. Vague unease is not a failure mode.

### 5. Score the cost dimensions

Score each **0–3** (3 = most costly / most discouraging for Babysitter).

| ID | Dimension | 0 | 3 |
|---|---|---|---|
| **C2** | **Overhead ratio** — orchestration turns and tokens relative to the size of the actual work | work is large; overhead is noise | work is a few minutes; the ceremony dominates it |
| **C3** | **Human availability** — are breakpoints answerable? | human on hand, or `yolo`/auto-approve is genuinely safe here | headless *and* the task has decisions a human should own |
| **C4** | **Shape uncertainty** — is the *shape* of the work known enough to encode? | phases are known up front | genuinely exploratory; the plan is discovered by doing, and any fixed process would be wrong |
| **C5** | **Setup friction** — install, project config, harness plugin, environment | already installed and configured | not installed; would be set up solely for this task |
| **C6** | **Latency sensitivity** | none | someone is waiting; interactive turnaround required |

Weights: **C2 27, C3 13, C4 34, C5 13, C6 13** (sum 100).

> **Why there is no process-authoring dimension.** Earlier revisions scored a **C1 —
> "does an existing library process fit?"** at weight 25. It was removed: it measures the
> *library's* coverage, not the task. Writing a process for a domain would move a task's
> score without a single word of the task changing, so C1 answered "do we have a process
> for this yet?" when the rubric's question is "would enforcement help here?" Keep the two
> separate — if you want to track authoring effort, track it as a backlog item against the
> library, not as evidence about the work.

`Cost = Σ (weight_j × score_j / 3)` → 0–100.

`Net = Benefit − Cost` → −100..+100.

### 6. Hard routes (override the arithmetic)

Check these before applying thresholds. If one fires, record it in `hard_route` and use
its verdict regardless of `Net`.

**Route to Babysitter:**
- **BS1** — Work provably exceeds one context window (e.g. explicit multi-phase product
  build, whole-codebase migration, large batch across many files) *and* B2 ≥ 2.
- **BS2** — An audit trail or reproducible replay is a stated requirement (compliance,
  regulated change, "we need to show what happened").
- **BS3** — The task contains ≥ 2 irreversible outward-facing actions (push, PR to a
  repo you don't own, deploy, migrate, publish, spend) *and* a human must approve them.
- **BS4** — The task is explicitly a **recurring** workflow to be run again on new inputs.

**Route to vanilla:**
- **V1** — Single-file or trivial change, one obvious correct answer, minutes of work.
- **V2** — Primarily a question, investigation, explanation, or read-only review with no
  artifact to gate.
- **V3** — **No deterministic verification exists** (B2 = 0) *and* B3 ≤ 1. Gates would be
  the agent grading itself; the journal buys nothing.
- **V4** — Requirements are unsettled and the user is still deciding what they want; the
  next useful move is conversation, not enforcement.
- **V5** — C4 = 3 and B1 ≤ 1: the shape is unknown and no ordering matters, so any
  encoded process is a guess.

If a Babysitter hard route and a vanilla hard route both fire, prefer **Babysitter** only
when the vanilla route is V1 or V2 and the Babysitter route is BS2 or BS3; otherwise
resolve to `borderline` and explain the conflict.

### 7. Verdict

| Condition | Verdict |
|---|---|
| `Net ≥ +20`, or a Babysitter hard route fired | `babysitter` |
| `Net ≤ −15`, or a vanilla hard route fired | `vanilla` |
| otherwise | `borderline` |

For `borderline`, apply tie-breakers in order and record which decided it:
1. If B3 ≥ 2 (won't fit in one session) → `babysitter`. Resumption alone justifies it.
2. If B2 = 3 and B8 ≥ 2 (real gates exist and the agent is likely to drift) → `babysitter`.
3. If C6 = 3 (someone is waiting) → `vanilla`.
4. Otherwise → **`vanilla`**. Vanilla is the default. Orchestration must earn its place.

Also emit **`hybrid_note`** when applicable: many tasks split cleanly into a vanilla
scouting phase (explore, decide the shape) followed by a Babysitter execution phase, or a
Babysitter run whose leaf tasks are ordinary agent work. Say so explicitly when the split
is the better answer than either pure route.

### 8. If the verdict is `babysitter`, specify the run

- **`process_recommendation`** — a concrete path or `custom`. Draw from:
  - `library/methodologies/` — `tdd.js`, `spec-driven-development.js`, `devin.js`,
    `plan-and-execute.js`, `agile.js`, `top-down.js`, `bottom-up.js`, `evolutionary.js`,
    `ralph.js`, `graph-of-thoughts.js`, `adversarial-spec-debates.js`,
    `consensus-and-voting-mechanisms.js`, `state-machine-orchestration.js`,
    `self-assessment.js`, `build-realtime-remediation.js`, `spec-kit-brownfield.js`,
    plus directory methodologies (`gsd/`, `bmad-method/`, `automaker/`, `atdd-tdd/`,
    `shape-up/`, `scrum/`, `kanban/`, `domain-driven-design/`, `extreme-programming/`, …)
  - `library/specializations/<domain>/` — ~40 domains (web-development, backend-development,
    devops-sre-platform, data-engineering-analytics, security-compliance, mobile-development,
    qa-testing-automation, performance-optimization, code-migration-modernization, …),
    each with task-level processes such as `jwt-authentication.js`,
    `e2e-testing-playwright.js`, `bundle-size-optimization.js`.
  - `library/cradle/` — contribution/install flows (`bugfix.js`, `feature-request.js`,
    `project-install.js`, `library-contribution.js`).
  - `library/processes/shared/` — composable parts: `deterministic-quality-gate.js`,
    `n-strikes-escalation.js`, `completeness-gate.js`, `tdd-triplet.js`, `ts-check.js`,
    `playwright-visual-smoke.js`, `forbidden-markers-scanner.js`, `prior-attempts-scanner.js`.

  Match on the actual work, not on vocabulary. If nothing fits, say `custom`. This does not
  count against the verdict — it is a note for the library backlog, not evidence about the
  task (see “Why there is no process-authoring dimension”).
- **`mode`** — `call` (interactive, pauses at breakpoints) · `yolo` (autonomous, no
  breakpoints) · `plan` (stop after planning) · `forever` (continuous/monitoring) ·
  `internal` (headless harness for CI/scripts).
- **`gates`** — the concrete shell commands that should back the quality gates, taken
  from the repo context (e.g. `npx tsc --noEmit`, `npx vitest run`, `npx eslint src/`).
  If you cannot name any, revisit B2 — you probably over-scored it.
- **`breakpoints`** — the specific decision points a human should own. Keep this list
  short; too many breakpoints is a listed anti-pattern.

### 9. Output

Return **only** this JSON.

```json
{
  "verdict": "babysitter | vanilla | borderline",
  "confidence": "high | medium | low",
  "benefit": {
    "B1_ordering":        {"score": 0, "evidence": ""},
    "B2_gateability":     {"score": 0, "evidence": ""},
    "B3_horizon":         {"score": 0, "evidence": ""},
    "B4_irreversibility": {"score": 0, "evidence": ""},
    "B5_convergence":     {"score": 0, "evidence": ""},
    "B6_decomposability": {"score": 0, "evidence": ""},
    "B7_repeatability":   {"score": 0, "evidence": ""},
    "B8_drift_risk":      {"score": 0, "evidence": ""},
    "total": 0
  },
  "cost": {
    "C2_overhead":    {"score": 0, "evidence": ""},
    "C3_human":       {"score": 0, "evidence": ""},
    "C4_uncertainty": {"score": 0, "evidence": ""},
    "C5_setup":       {"score": 0, "evidence": ""},
    "C6_latency":     {"score": 0, "evidence": ""},
    "total": 0
  },
  "net": 0,
  "vanilla_failure_mode": "",
  "adjustments": [],
  "hard_route": null,
  "tiebreaker": null,
  "hybrid_note": null,
  "process_recommendation": null,
  "mode": null,
  "gates": [],
  "breakpoints": [],
  "rationale": "3-5 sentences. Lead with the decisive factor.",
  "missing_information": []
}
```

Rules for the output:
- `missing_information` lists facts that would change the verdict if known (most often:
  does a test suite exist and pass? is a human available? does this recur?). If it is
  non-empty and `net` is within ±20 of a threshold, set `confidence` to `low`.
- Never invent a `process_recommendation` path you were not shown and cannot name from
  the catalog above. `custom` is a valid and often correct answer.
- Do not adjust scores to reach a verdict you prefer. Score first, then read off the
  table.

### 10. Calibration examples

**"Fix the typo in the error message in `src/auth/login.ts`."**
→ `vanilla`, high. V1. B-scores near zero; `vanilla_failure_mode` is empty, so Benefit
caps at 35 anyway.

**"Investigate why our p99 latency doubled last Tuesday."**
→ `vanilla`, high. V2/V4 — diagnosis with an unknown shape. `hybrid_note`: once the cause
is known, the remediation may warrant a process.

**"Migrate all 340 API route handlers from Express 4 to Fastify, keeping the integration
suite green."**
→ `babysitter`, high. BS1. B2=3 (integration suite), B3=3, B6=3, B8=3; C4=0 (shape is
known and repetitive). Process: `specializations/code-migration-modernization/` +
`processes/shared/deterministic-quality-gate.js`. Mode: `yolo` with a gate on the suite.

**"Add a `--verbose` flag to the CLI."**
→ `vanilla`, medium. Small diff, one session, one file plus a test. Even with a green
suite, C2=3 sinks it. Note in `missing_information` that a docs/changelog requirement
would change this.

**"Implement SSO for the customer portal. It touches auth, session storage, and the
admin UI; security review is required before merge; we ship it Thursday."**
→ `babysitter`, high. BS3 (irreversible merge + security sign-off), B1=3, B4=3, B8=3.
Process: `methodologies/spec-driven-development.js` or `spec-kit-brownfield.js` (existing
system). Mode: `call`. Breakpoints: spec approval, pre-merge security review.

**"Set up a nightly job that triages new CI failures and files issues."**
→ `babysitter`, high. BS4 (recurring) + BS2. Mode: `internal` (headless CI). Process:
`processes/shared/ci/build-failure-triage.js`.

**"Rewrite the onboarding docs to be friendlier."**
→ `vanilla`, high. V3 — no deterministic verification, quality is editorial judgment.
Gates here would be the agent grading its own prose.

**"Build the whole reporting dashboard: schema, API, UI, tests, deploy to staging."**
→ `babysitter`, high. BS1 + BS3. Process: `methodologies/gsd/` (complete product) or
`bmad-method/`. Mode: `call`.

---

## Mode B — ex-post scoring (for calibration)

Same rubric, different question. Supply the task, the routing decision that was made, and
the run artifacts (journal/`~/.a5c/runs/<id>`, diff, test results, wall-clock, token
spend, human interventions, whether the run was resumed, whether it was abandoned).

Ask:

```
Given the completed run, was the routing decision correct?

Report:
- outcome: "correct | should_have_been_babysitter | should_have_been_vanilla"
- observed_signals: which B/C dimensions the run's artifacts actually confirmed or
  contradicted (e.g. "B3 scored 1 but the run was resumed twice — B3 was ≥2")
- realized_overhead: orchestration turns / total turns; wall-clock vs. an estimate for
  the counterfactual route
- gate_efficacy: how many gate failures caught a real defect vs. were noise or were
  satisfied by agent assertion rather than a shell exit code
- breakpoint_efficacy: how many breakpoints changed the outcome vs. were rubber-stamped
- rescore: the B/C scores you would assign with hindsight, and the resulting verdict
- rubric_delta: any weight or threshold change this case argues for
```

Aggregate `rescore` across a labeled set to fit the weights, and `rubric_delta` to catch
dimensions that are systematically mis-weighted. Useful headline metrics: agreement with
gold labels, and separately the **regret** of each error direction — a wrongly-vanilla
long task usually costs far more than a wrongly-babysitter short one, so an asymmetric
threshold (lower the `+20` bar) may be correct once you have data.

---

## Using it as a batch eval

1. Collect 50–100 real task descriptions with the repo context you would actually have
   at routing time. Deliberately over-sample the middle: medium-sized features, refactors
   with partial test coverage, one-off scripts that might recur.
2. Label each by hand (`babysitter` / `vanilla` / `either`), independently of the rubric.
3. Run Mode A. Report accuracy, the confusion matrix, and accuracy restricted to
   `confidence: high`. A rubric that is 90% accurate only on the easy cases is not
   useful — the `borderline` band is where it earns its keep.
4. Where the judge disagrees with the label, read `rationale` and `adjustments` rather
   than the score. Most disagreements trace to one dimension.
5. Adjust weights and the ±20/−15 thresholds. Re-run. Freeze the version alongside the
   labeled set so later changes are comparable.

Two ablations worth running, because they tell you whether the structure is doing work or
just decorating a vibe: (a) drop §4's counterfactual and see if Babysitter routing
inflates; (b) replace the whole rubric with "decide, one paragraph" and compare accuracy.
If the bare version matches, the rubric is ceremony — keep the counterfactual and the
hard routes, drop the arithmetic.
