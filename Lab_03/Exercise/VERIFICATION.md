# Verification Results - 02 November 2026

Environment: Node 24.22.1, React/React DOM 19.3.1, Vite 8.3.5. Browser tests used Chromium 153 through Playwright. Test browser was installed from the @sparticuz/chromium npm distribution because the standard Playwright CDN download returned an invalid archive in this environment.

- `npm run build`: passed. Actual output: evidence/build-results.txt.
- `npm test`: 11 passed / 0 failed. Actual output: evidence/test-results.txt.
- `npm run audit:failures`: all three faulty/repair reproductions passed. Actual output: evidence/failure-audit.txt.
- `npm run test:browser`: passed on the production build. Actual output: evidence/browser-results.txt.
- axe-core: zero violations for WCAG 2 A/AA, 2.1 AA and 2.2 AA tags on each view. Individual JSON files retain counts and violations.
- Lighthouse 13.6.0: initial Exercise 1 page scored 100/100 Accessibility. Full JSON and HTML reports included. No Lighthouse score is claimed for other views or other categories.
- Four 375px viewport checks: no document horizontal overflow; all input/select controls associated with labels.
- Actual desktop/mobile screenshots are included. The PDF was rendered and visually inspected as eight A4 pages.

The automated browser run blocks avatar requests deliberately to test accessible initials fallback. Resource failures from that test are excluded from the console check; unexpected JavaScript errors and warnings remain failures.

The fixed telemetry panel prevents its height changing between loading/success/error. A whole-app CLS score is not claimed. Simulated requests are timers with AbortSignal rather than HTTP requests, so cancellation is verified by service tests and final UI state, not invented Network screenshots.

Manual React DevTools Profiler tracing, screen-reader review and the instructor live defense remain in MANUAL_ACCEPTANCE.md.

Publishing: blocked by GitHub integration write 403. Direct Git push authentication is absent. Ten real commits are available locally and in the companion binary-capable patch; no successful remote push is claimed.
