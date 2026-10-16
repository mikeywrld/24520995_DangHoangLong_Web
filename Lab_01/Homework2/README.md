# Homework 2 — Drum Kit Engine

Student: Dang Hoang Long · 24520995

## Run

From the parent submission directory run `python -m http.server 5500`, then open
`http://localhost:5500/Homework2/`. Alternatively open this homework folder in
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

## Controls and contracts

A/S/D/F/J/K or pad clicks trigger individual Audio instances. Space stops active
voices and cancels pending replay. Enter activates focused buttons. Start recording
clears the previous queue; Stop preserves it; Replay schedules in FIFO order by
performance.now() offsets. The queue is capped at 512 hits. Replay does not record
itself. Failed media playback displays a status message.

The WAV files are synthesized locally for this coursework, with no third-party
sound licensing dependency. Change a binding by editing a pad's data-key and its
visible kbd label; the JavaScript builds its map from the DOM. data-sound is the
path contract; audio.js is independent of the page.

Browser timers are not sample-accurate sequencers, especially in background tabs.
