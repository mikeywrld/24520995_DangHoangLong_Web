# Homework 3 — Work Breakdown Structure

Defined before implementation. Each row is an isolated implementation step.

| Task | Contract / milestone | Commit message |
|---|---|---|
| T-01 | Semantic event and form contract | `feat(html): define event hub contracts` |
| T-02 | Tokens and reset | `feat(css): define design tokens and reset` |
| T-03 | Responsive event layout | `feat(css): build responsive event layout` |
| T-04 | UTC countdown from absolute time | `feat(timer): implement drift-free UTC countdown` |
| T-05 | Idle/submitting/success/error form | `feat(form): implement explicit state machine` |
| T-06 | Duplicate lock and safe text rendering | `fix(form): prevent duplicates and sanitize input` |
| T-07 | Reproducible AI failure risk audit | `docs(audit): document three verified regression cases` |

Countdown contract: UTC ISO timestamp ending Z; remaining = max(0, target - Date.now()), recomputed on every tick and visibility restore. Form contract: idle -> submitting -> success/error; success/error -> submitting on valid retry. Submission is a clearly labelled local mock, no server or real registration. Busy state must lock synchronously before await; render user data with textContent.

Verification: serve HTTP; check 375px first, then desktop; one h1, zero divs, Tab/Enter, visible focus, no runtime/CSP errors. No external libraries.
