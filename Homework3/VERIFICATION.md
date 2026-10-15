# Verification — Homework 3

Executed: 2026-10-15. Headless Chromium 133, HTTP localhost:5500.

| Check | Result |
|---|---|
| HW3 375px no overflow | PASS |
| HW3 semantic structure | PASS |
| HW3 skip-link keyboard focus | PASS |
| HW3 drift-free delayed tick | PASS |
| HW3 explicit UTC target | PASS |
| HW3 one request for double submit | PASS |
| HW3 success state | PASS |
| HW3 error state and retry enabled | PASS |
| HW3 XSS displayed literally | PASS |
| HW3 whitespace rejected | PASS |
| No JS/CSP runtime errors | PASS |

Negative controls: countdown drift, duplicate requests and DOM injection all reproduced; corrected comparisons passed.

Limits: no Lighthouse score claimed, no manual screen-reader test, no real network registration. Audio playback promises/voice overlap were tested; physical speaker output was not listened to. Keyboard checks cover skip-link focus and drum key events; a complete manual Tab/Enter walkthrough remains a student review step.

Screenshots in the PDF are actual browser captures. GitHub has not been updated.
