# Homework 3 — Resilient Event Hub

Student: Dang Hoang Long · 24520995

## Run

From the parent submission directory run `python -m http.server 5500`, then open
`http://localhost:5500/Homework3/`. Alternatively open this homework folder in
VS Code and use Live Server. Do not use file:///.

Stack: vanilla HTML5, CSS and ES6+ JavaScript. No runtime package install or CDN.
The optional regression harness uses Playwright as a development-only tool.

## Deliverables

- TASK_DECOMPOSITION.md: contracts defined before code.
- project-rules.md: persistent architectural constraints.
- Source files and local assets.
- VERIFICATION.md: actual checks and limitations.
- GIT_LOG.txt and a Git bundle alongside the source folder: real local history.

The GitHub URL in the PDF is copied from the Homework 1 sample as the intended
repository. No remote contents have been read or changed and no push was performed.
Do not describe that URL as containing these homeworks until you upload them.

## Event and form contracts

The sample event is 20 December 2026 at 02:00 UTC / 09:00 ICT. Change only
#countdown data-deadline and the visible time element together. The countdown
uses wall-clock time, clamps at zero and clears timers on page exit.

The registration endpoint is deliberately a LOCAL MOCK. It performs no actual
booking, network request or persistent personal-data storage. Toggle the error
checkbox to demonstrate an error, then uncheck it and retry. State changes follow
idle -> submitting -> success/error. Busy locking occurs before await. User input
is normalized, validated and rendered via textContent.

AI_FAILURE_AUDIT.md explicitly labels its negative controls as reproduced examples,
not historical defects. Review them before the live defense. For a real deployment,
replace submitRegistration with an API and add server validation and idempotency.
