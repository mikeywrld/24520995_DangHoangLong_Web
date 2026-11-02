# AI Failure Mode Audit
This audit uses three intentionally faulty AI-style candidate snippets, created for controlled verification and kept outside production components. It does not claim they were previously shipped or found through a recorded DevTools session. Run `npm run audit:failures`. Actual output: `evidence/failure-audit.txt`.

## 01 - Mutating sort damages source order
**Candidate request:** Sort the pioneers by age.

```js
people.sort((a, b) => a.age - b.age);
```

**Reproduction:** The audit copies the six-item source, sorts it and asserts that its ID order changed. This demonstrates the mutation directly. In React, mutating an existing state array also prevents reliable reference-based update checks.

**Fix:** `selectPeople` filters then calls `toSorted`, leaving source state intact. The audit asserts unchanged input order. The directory keeps visible rows as derived values with no filtering/sorting effect.

**Files:** `src/data/people.js`, `tests/failure-audit.mjs`, `tests/models.test.mjs`.

## 02 - Late response overwrites the selected squad
**Candidate request:** Load telemetry when the selected squad changes.

```js
fetchTelemetry(squadId).then(setView); // no cancellation
```

**Reproduction:** A slow CES request starts before a fast GE request. Without cancellation, CES resolves last and overwrites GE. The audit asserts this incorrect final ID.

**Fix:** Create AbortController per effect; pass its signal, abort in cleanup, ignore AbortError and guard success against an aborted signal. Repeat the slow/fast ordering with abort and assert GE remains current. The browser test also switches squads before completion.

**Files:** `src/data/telemetry.js`, `src/components/PubgMatchTelemetry.jsx`.

## 03 - Pending ghosting timeout overwrites a mutual reply
**Candidate request:** Exit if a message receives no reply for five seconds.

```js
setTimeout(() => setPhase('SELF_RESPECT_EXIT'), 5000); // no cleanup
```

**Reproduction:** The controlled audit uses a shortened 10ms timeout, changes phase to COMMITTED, then proves the uncanceled timer changes it to exit. The browser test uses the actual five-second production timeout.

**Fix:** `waitForReply` accepts AbortSignal; the component aborts on pending-message changes and unmount. The reducer also verifies the message ID before accepting TIMEOUT. The repaired audit preserves COMMITTED. Browser evidence confirms COMMITTED survives beyond five seconds and unanswered messages exit.

**Files:** `src/data/relationship.js`, `src/components/SituationshipAnalyzer.jsx`.

## DevTools reproduction for live defense
The automated evidence above is not a DevTools recording. To inspect manually: use Sources breakpoints on the faulty snippets in the isolated audit, React DevTools to observe state, and the Profiler to confirm no effect-driven filtering cascade. The telemetry service is a local timer simulation, so use Sources/React state rather than claiming canceled HTTP rows in Network.

## Fix-to-commit mapping
- Candidate 01 fix: `feat(ex2): normalize smartPeople schema with stable IDs` and `feat(ex2): add search, IQ filter and toSorted`.
- Candidate 02 fix: `feat(ex3): implement PUBG VN four-state telemetry and AbortController`.
- Candidate 03 fix: `feat(bonus): add relationship FSM and abortable ghosting timer`.
- Executable reproduction evidence: `test(lab3): add verification evidence and English report`.
