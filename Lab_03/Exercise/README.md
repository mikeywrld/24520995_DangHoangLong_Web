# Lab 03 - Production React 19 Exercises
**Student:** Dang Hoang Long - **Student ID:** 24520995

Implements slides 13-23 (Exercises 1-3) and slides 31-32 (bonus FSM) of the supplied 35-slide Lab 03 deck. Homework 1-3 are separate assignments and are outside this submission.

## Publication status
Ten local commits are prepared. Publishing is blocked: the GitHub connection returns 403 for writes and direct Git has no authenticated push credential. The companion delivery archive contains a binary-capable patch preserving all ten commits. Follow PUSH_INSTRUCTIONS.md from that archive to publish.

## Run
Requires Node 22.12+ or a supported newer Node release and npm. Tested with Node 24.22.1.

```sh
cd Lab_03/Exercise
npm ci
npm run dev
```

Open the local URL printed by Vite. Select an exercise using the navigation buttons.

```sh
npm run build
npm test
npm run audit:failures
npx playwright install chromium
npm run preview -- --host 127.0.0.1 --port 5173
# In a second terminal:
npm run test:browser
```

The browser test expects http://127.0.0.1:5173 and optionally accepts CHROMIUM_PATH. It deliberately blocks the HTTPS avatar to verify initials fallback, records screenshots, runs axe on each view, and checks layout at 375px. Vite dev HMR is unnecessary for these production tests.

## Exercise map
- `src/components/DeveloperCard.jsx`: semantic profile, reusable SkillBadge, CSS Module, HTTPS avatar and initials fallback.
- `src/components/ScientistDirectory.jsx`: controlled search/minimum IQ/sort, immutable deletion and reset, live count and focus restoration.
- `src/components/PubgMatchTelemetry.jsx`: four-state view, abortable service, retry and equal-size loading/error/success panels.
- `src/components/SituationshipAnalyzer.jsx`: bonus reducer, immutable effort logs, derived scores, five-second reply wait with abort cleanup.
- `src/data/`: immutable fixtures and pure helpers; IQ values and squad telemetry are classroom examples.
- `evidence/`: actual automated run logs, screenshots and accessibility scan results.
- `report/`: English PDF report and reproducible ReportLab source.

## Telemetry controls
Random mode fails when a random sample is below 0.35. Always fail/succeed modes allow repeatable testing. This is a local asynchronous simulation using timers and AbortSignal. It does not call KRAFTON APIs, require credentials, or represent live match results. Aborted simulated work will not appear as canceled HTTP requests in the Network panel.

## Bonus interpretation
The prose and code sample on slide 31 use different phase names. This implementation follows the prose: STRANGERS, DATING_NO_LOVE, COMMITTED, SELF_RESPECT_EXIT. The timer starts only after Send message. Reply, stop, reset, recipient change and component unmount cancel pending work. Cleanup releases references but cannot force browser garbage collection.

## Evidence limits
Automated checks supplement manual review. React DevTools Profiler traces, manual screen-reader review and the instructor's live defense must still be performed by the student. The failure audit contains explicitly isolated faulty candidates and executable reproductions, not a fabricated history of DevTools findings.
