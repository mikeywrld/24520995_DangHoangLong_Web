# AI_FAILURE_AUDIT.md — Lab 03 (React 19)

> **Deliverable:** ≥ 3 AI failure modes, each with *prompt → AI code → bug → proof → fix (commit)*.
> This file documents **6** failures. All proofs are **executable**: `npm test` (or `npx vitest run audit`).

## Provenance (read this first — honest labelling)

| # | Origin | Where the buggy code lives |
|---|--------|----------------------------|
| 01–04 | The four failure modes listed on **slide 25 / 30**. The buggy code is the *typical LLM output* for that prompt, **reproduced by hand** so it can be tested side-by-side with the fix. | `audit/buggy/*.jsx` |
| 05–06 | **Genuinely occurred in this lab**: bugs in AI-generated code that my own test-suite caught before commit. Real failing assertions are quoted below. | git history (`00c9957`, `0e3bcf4`) |

Before the live defense, re-run each DevTools proof yourself (steps are listed per failure) so you can explain it with your own screenshots.

## Summary

| # | Failure mode | Symptom | Proof (test) | Fix commit |
|---|--------------|---------|--------------|-----------|
| 01 | Stale closure + leaked `setInterval` (`[]` deps, no cleanup) | Polls the first squad forever; interval survives unmount | `audit/failure-audit.test.jsx › Failure #01` | `0e3bcf4` |
| 02 | Redundant `useEffect` for derived state | **2 commits per keystroke** instead of 1 | `… › Failure #02` | `1215b4a` |
| 03 | No `AbortController` / ignore-flag | Slow response for the *old* squad overwrites the *new* one | `… › Failure #03` | `3c99d86` (+ `0e3bcf4`) |
| 04 | Decrement-per-tick countdown | 30 s drift after a throttled background tab | `… › Failure #04` | `994178d` |
| 05 | Inline default prop `now = () => performance.now()` | Pressing 1 key re-rendered **all 88** `React.memo` keys | `tests/piano-ui.test.jsx › render isolation` | `00c9957` |
| 06 | Trusting the fetcher to honour `AbortSignal` | An aborted request that still *resolves* wins the race | `audit … › Failure #03 FIX` | `0e3bcf4` |

Latest run (`npx vitest run audit --reporter=verbose`): **8 / 8 passed** (BUG tests prove the defect exists, FIX tests prove it is gone).

---

## Failure #01 — Stale closure in PUBG live auto-polling
- **Prompt:** `Add 3s auto-refresh to PubgMatchTelemetry`
- **AI code (`audit/buggy/BuggyPoller.jsx`):**
  ```jsx
  useEffect(() => {
    setInterval(() => { fetchSquad(squadId).then(setData); }, 3000);
  }, []);               // ← empty deps, no cleanup
  ```
- **Bug:** `[]` freezes the first `squadId` (`'ces'`) inside the closure, and the interval id is never cleared (leaks on every mount).
- **Proof (test output):** after switching `ces → te` and advancing 9 s: `polled.has('te') === false`; after `unmount()` → `vi.getTimerCount() > 0`.
- **DevTools proof to reproduce:** Network tab → switch squad in Ex3 → requests for the *old* squad id keep firing every 3 s; Performance Monitor → "JS event listeners/timers" count grows after navigating between tabs.
- **Engineering fix (`0e3bcf4`):** polling effect depends on `[pollMs, isPaused]`, bumps `pollTick`; the fetch effect depends on `[squadId, retryTick, pollTick, …]` and returns `controller.abort()`; interval always `clearInterval`-ed. Test: all polls after the switch target `'te'`, `getTimerCount() === 0` after unmount.

## Failure #02 — Redundant `useEffect` for derived state
- **Prompt:** `Filter this list by name`
- **AI code (`audit/buggy/BuggyDirectory.jsx`):**
  ```jsx
  const [filtered, setFiltered] = useState(people);
  useEffect(() => { setFiltered(people.filter(/* … */)); }, [people, query]);
  ```
- **Bug:** every keystroke = render #1 (new `query`, **stale** `filtered`) → effect → `setFiltered` → render #2.
- **Proof:** `<Profiler>` `onRender` count for one keystroke → **BUG = 2, FIX = 1**.
- **DevTools proof to reproduce:** React DevTools → Profiler → record 1 keystroke → buggy version shows 2 commits.
- **Engineering fix (`1215b4a`):** only raw inputs (`people, query, minIq, sortBy`) are state; `visible = people.filter(…).toSorted(…)` is computed during render.

## Failure #03 — Missing AbortController (race condition)
- **Prompt:** `Fetch telemetry when the squad changes`
- **AI code (`audit/buggy/BuggyTelemetry.jsx`):** `useEffect(() => { fetchSquad(squadId).then(setData); }, [squadId]);`
- **Bug:** responses can arrive out of order → UI shows the squad you *left*.
- **Proof:** `ces` is slow, `te` is fast; `te` resolves first, `ces` resolves last → UI text = `Squad ces` (wrong), `signal === undefined` (request not cancellable).
- **DevTools proof to reproduce:** Network → throttle *Slow 3G* → click CES → TE quickly; buggy build ends on CES, fixed build shows *(canceled)* for the first request.
- **Engineering fix (`3c99d86`):** `const controller = new AbortController()` inside the effect, `{ signal }` to the fetcher, `return () => controller.abort()`, and `if (err.name === 'AbortError') return`.

## Failure #04 — Naive countdown drift
- **Prompt:** `Write a countdown for the PUBG airdrop`
- **AI code (`audit/buggy/BuggyCountdown.jsx`):** `setInterval(() => setLeft(s => s - 1), 1000)`
- **Bug:** background tabs are throttled (≈ 1 tick/min). The clock lags real time.
- **Proof:** 30 s pass while timers are frozen, then one tick fires → buggy shows **59** (truth **29**); `usePubgAirdropTimer` reports **29 000 ms**.
- **DevTools proof to reproduce:** open two tabs, leave the countdown tab in the background for 1 min, come back: the naive timer is off by tens of seconds.
- **Engineering fix (`994178d`):** derive `remaining = max(0, target − (Date.now() + serverOffset))`, tick every 200 ms, **and** re-sync on `visibilitychange`.

## Failure #05 — Inline default prop destroys `React.memo` (found during this lab)
- **Prompt:** `Make the piano generate 88 memoized keys` (AI wrote `now = () => performance.now()` as a default parameter of `GrandPiano88`).
- **Bug:** a default-parameter arrow is a **new function on every render** → `noteOn/noteOff` (`useCallback` with `now` in deps) change identity → all 88 `PianoKey`s re-render. The same instability also re-subscribed the keyboard hook and **lost the held-keys `Set`** (a `keyup` could not find its `keydown` → stuck note).
- **Proof (real failing assertions before the fix):**
  `AssertionError: expected 88 to be 1` (render isolation) and `expected "spy" to be called with arguments: [ 60 ]` (no `noteOff`).
  After the fix: pressing one key = **1** render; release = **1** render; no-op release = **0**.
- **DevTools proof to reproduce:** React DevTools Profiler → press one piano key → *"Why did this render?"* lists 87 keys with "props changed: onNoteOn".
- **Engineering fix (`00c9957`):** hoist `defaultNow` to module scope; keep held keys in `useRef`.

## Failure #06 — Trusting the fetcher to honour the AbortSignal (found during this lab)
- **AI code:** `.then((data) => setView({ status: 'SUCCESS', data }))` after calling `controller.abort()` in cleanup.
- **Bug:** a fetcher/mocked API that ignores `signal` still *resolves* later and overwrites the newer squad. Real `fetch` rejects, but custom clients don't always.
- **Proof (real failing assertion before the fix):** `Unable to find an accessible element with the role "heading" and name "Squad te"` — UI showed `Squad ces`.
- **Engineering fix (`0e3bcf4`):** `if (controller.signal.aborted) return;` in both `.then` and `.catch`.

---

### How to re-run the evidence
```bash
npm install
npm test                    # 82 tests (unit + UI + axe + audit)
npx vitest run audit        # only this audit (8 tests)
npm run verify              # legacy audit + contrast + tests + production build
```
