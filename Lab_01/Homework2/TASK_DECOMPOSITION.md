# Homework 2 — Work Breakdown Structure

Defined before implementation. Each row is an isolated implementation step.

| Task | Contract / milestone | Commit message |
|---|---|---|
| T-01 | HTML data-sound contract | `feat(html): define drum pad data-sound contract` |
| T-02 | Tokens and reset | `feat(css): define design tokens and reset` |
| T-03 | Responsive layout | `feat(css): build responsive drum grid` |
| T-04 | Independent polyphonic engine | `feat(audio): implement polyphonic playback` |
| T-05 | Keyboard repeat guard | `feat(input): bind keys with repeat throttling` |
| T-06 | Timestamped FIFO recorder | `feat(recorder): record and replay FIFO beats` |

Pad contract: native button, data-key (lowercase), data-sound (local WAV path). Audio engine exposes play(src), stopAll(); no DOM dependency. Recorder uses performance.now() offsets, insertion-order queue, bounded to 512 events; playback never records itself.

Verification: serve HTTP; check 375px first, then desktop; one h1, zero divs, Tab/Enter, visible focus, no runtime/CSP errors. No external libraries.
