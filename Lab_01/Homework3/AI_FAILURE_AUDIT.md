# AI Failure Mode Audit — Homework 3

Student ID: 24520995  
Scope: countdown.js and form.js; Lab 1, slide 25.

## Evidence boundary

The three cases below are **AI-generated negative-control examples** created for this submission and reproduced in a local browser review. They are deliberately faulty comparison snippets, not claims that a student discovered these bugs in an earlier project or that the final implementation once shipped them. The production code contains the corrected patterns. `tests/regression.cjs` reproduces each defect and verifies its corrected counterpart. Review this report and explain the fixes before submission.

## 1. Timer drift after a delayed callback

**Defect description.** The faulty snippet decrements a counter by 1,000 ms per callback. If the browser delays one callback for 8 seconds, it still removes only 1 second. A 10-second countdown incorrectly shows 9 seconds instead of 2 seconds remaining.

**Diagnostic method.** Controlled clock values in a browser evaluation: start = 0 ms, deadline = 10,000 ms, delayed callback = 8,000 ms. Compare the decrement-based result (9,000) against absolute elapsed time (2,000). Inspect countdown.js to ensure it never uses a remaining-seconds decrement as its source of truth.

**Refactored solution.** `Countdown.remaining(target, now)` returns `Math.max(0, target - now)`. The UI recomputes from Date.now() on each tick and visibility change. The ISO target ends in Z, so host timezone does not change the deadline. pagehide clears the interval; persisted pageshow restarts it.

**Verification.** Negative control reproduces drift; corrected function returns 2,000 ms. After the deadline it returns zero. This removes accumulated callback drift, but relies on the device clock and does not claim network clock synchronization.

## 2. Double submission while awaiting a response

**Defect description.** The faulty handler awaits the mock service without acquiring a busy lock. Two synchronous submit events start two requests before either promise completes.

**Diagnostic method.** Instrument a mock service with a request counter. Call the faulty handler twice before resolving promises: counter = 2. In the real page call form.requestSubmit() twice in the same browser task and inspect the instrumented service count and form data-state.

**Refactored solution.** Guard `state === 'submitting'` at entry. Set the submitting state synchronously before the first await. Disable the submit button and set aria-busy. Both success and error release the lock; errors keep entered values for retry.

**Verification.** The real form invokes the service once for two submit events, reaches success, exposes an error state when requested, and permits retry. This is a client-side duplicate guard, not a substitute for server-side idempotency in a deployed service.

## 3. User input interpreted as HTML

**Defect description.** The faulty snippet assigns a greeting with user input to innerHTML. A string such as `<img src=x onerror=alert(1)>` becomes a DOM element instead of visible text, creating an XSS injection surface.

**Diagnostic method.** Use a detached element with the inert probe `<img data-probe="audit">`. The unsafe renderer creates an img element. No active attack payload is executed by this negative control. In the actual form, submit an HTML-shaped name and inspect #form-status: it must contain literal text and zero img elements.

**Refactored solution.** Normalize the name (NFKC), remove control characters, trim/collapse whitespace, enforce length and native email validity, and render all messages via textContent. Input normalization is not HTML escaping; safe output APIs provide the injection defense. CSP is defense in depth, not the primary fix.

**Verification.** The negative control creates an element; the safe comparison and actual form create none. A whitespace-only name fails validation. No innerHTML sinks exist in the production scripts.

## Review record

The accompanying verification file records checks actually run in headless Chromium over HTTP, including mobile overflow, keyboard entry, state transitions, duplicate locking and literal XSS rendering. No Lighthouse score, manual screen-reader audit, external server integration, or remote GitHub upload is claimed.
