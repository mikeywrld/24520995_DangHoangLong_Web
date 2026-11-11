# TASK_DECOMPOSITION.md – Work Breakdown Structure (Lab 03)

Loop per task: **(1) Vertical slice → (2) Props/State contract → (3) Atomic AI generation (project-rules.md) → (4) Verify + atomic commit.**

| # | Task (vertical slice) | Contract written first | Verification | Commit |
|---|-----------------------|------------------------|--------------|--------|
| T0 | Init Vite + React 19, rules, WBS | `project-rules.md` | `npm run build` | `chore: init react19 vite & rules` |
| T1 | Ex1 `<DeveloperCard/>` + `<SkillBadge/>` (zero `<div>`) | props w/ ES6 defaults | `npm run audit:legacy`, axe test | `feat(ex1): implement semantic DeveloperCard and SkillBadge` |
| T2 | Ex2 `<ScientistDirectory/>` derived state | `{people, query, minIq, sortBy}` only | Profiler-style test: 1 commit / keystroke | `feat(ex2): derived-state directory with delete/reset & live status` |
| T3 | Ex3 `<PubgMatchTelemetry/>` 4-state FSM + abort | `ViewState<T>` | race-condition test | `feat(ex3): PUBG VN 4-state telemetry & AbortController` |
| T4 | HW1 drum synth + `useDrumKeyboard` | `padMap: Map<code,pad>` | keyboard tests (repeat/input/e.code) | `feat(hw1): WCAG drum kit` |
| T5 | HW2 engine: 88-key math, `PolyphonicSynth`, FIFO queue, abortable replay | `PianoKeyModel`, `RecordedNote` | unit tests (52/36, 440 Hz, steal oldest) | `feat(hw2): piano engine` |
| T6 | HW2 UI: memo `PianoKey`, roving focus, recorder UI | `PianoKey` primitive props | render-isolation test (1 key = 1 render) | `feat(hw2): memoized piano UI` |
| T7 | HW3 domain: contracts, phase fn, reducer, `usePubgAirdropTimer` | `PubgCrateDrop`, `DropPhase` | reducer + fake-timer tests | `feat(hw3): arena domain & anti-drift hook` |
| T8 | HW3 UI: crate claim (optimistic/409), leaderboard, kill feed | `PubgVnSquadStanding` | claim-lock + derived-state tests | `feat(hw3): arena UI` |
| T9 | Test suite + a11y (axe) + contrast + legacy-API audit | – | `npm run verify` | `test: suite + audits` |
| T10 | `AI_FAILURE_AUDIT.md` with executable repros | – | `audit/*.test.jsx` | `docs: AI failure audit` |
| T11 | Slide report PDF | – | visual check of every page | `docs: slide report` |

## Definition of done (per task)
- [ ] No legacy API (`npm run audit:legacy` = 0 findings)
- [ ] Every effect has cleanup
- [ ] Every input has `<label htmlFor>`
- [ ] 375px: no horizontal page scroll
- [ ] Test added/updated and green
