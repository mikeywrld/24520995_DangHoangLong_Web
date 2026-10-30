# AI failure audit - observed build and integration defects
Date: 29 October 2026. These are three actual defects/assumptions in the AI-authored project, observed during this session. Corrections were applied by the assistant, not claimed as manual student work. If the instructor requires three application-logic errors or student-performed repairs, this audit does not establish that narrower requirement.

The user request was to implement Homework 1 from the supplied breakdown and produce an English PDF. The bounded generation stages were contracts/model, grid/data/styles, then test harness. Stage descriptions below are summaries of the actual workflow, not invented verbatim user prompts.

## 1. Missing Vite client declarations
- Stage: create TypeScript/Vite entry point and strict compiler configuration.
- Defective configuration: main.tsx imported './style.css', but no Vite ambient declaration file was included.
- Reproduce before fix: npm run build.
- Observed output: src/main.tsx(7,8): error TS2882: Cannot find module or type declarations for side-effect import of './style.css'.
- Cause: strict TypeScript lacked asset import declarations.
- Correction: src/vite-env.d.ts now contains: /// <reference types="vite/client" />
- Retest: npm run build completed successfully. See evidence/build-results.txt.

## 2. Preview host not accepted
- Stage: serve the generated app for browser verification.
- Defective configuration: default Vite configuration had no terminal.local allowlist entry.
- Reproduce before fix: open the preview URL provided by the managed preview service.
- Observed browser text: Blocked request. This host ("terminal.local") is not allowed. To allow this host, add "terminal.local" to server.allowedHosts in vite.config.js.
- Cause: generated project did not account for the preview service's hostname.
- Correction: vite.config.ts sets server.allowedHosts to ['terminal.local']; restart the preview service. This is a specific host allowance, not allowedHosts: true.
- Retest: the browser displayed the student directory and 60 results. See evidence/hw1-overview.jpg.

## 3. Test runner unnecessarily required an IPC listener
- Stage: add the automated regression-test command.
- Defective script: "test": "tsx --test tests/*.test.ts tests/*.test.tsx".
- Reproduce before fix: npm test in the restricted executor.
- Observed output: Error: listen EPERM: operation not permitted /tmp/tsx-0/88.pipe.
- Cause: the tsx CLI attempted to create an IPC server before executing tests; the executor denied that listener. This is a harness compatibility issue, not a failure in grid behavior.
- Correction: use "node --import tsx --test tests/*.test.ts tests/*.test.tsx". The Node test runner loads the transformer directly without the CLI IPC server.
- Retest: 17 tests passed, 0 failed. See evidence/test-results.txt.

## Additional unresolved verification limit
Lighthouse failed to start because CHROME_PATH was not configured and no local Chrome executable was found. See evidence/lighthouse-attempt.txt. This is not counted as a repaired defect or a successful audit. No 100/100 result is asserted.
