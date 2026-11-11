# Lab 03 – Production React 19 (HW1 · HW2 · HW3)

React 19 + Vite 6. Drum Kit (HW1), 88-key Polyphonic Piano (HW2), KRAFTON × PUBG VN Arena (HW3), plus Sprint 1–3 components.

```bash
npm install
npm run dev       # http://localhost:5173  (tabs: HW1 / HW2 / HW3 / Ex1 / Ex2 / Ex3)
npm run verify    # audit:legacy + audit:contrast + 82 tests + production build
```

| Deliverable | Path |
|---|---|
| AI rules / WBS / failure audit | `project-rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md` |
| HW1 / HW2 / HW3 | `src/homeworks/{DrumMachine,GrandPiano88,KraftonPubgVnArena}` |
| Sprint 1–3 | `src/components/{DeveloperCard,ScientistDirectory,PubgMatchTelemetry}.jsx` |
| Evidence | `tests/`, `audit/`, `scripts/` |

Notes
- All PUBG/PVS numbers, prices and the kill feed are **mock data** (labelled in the UI).
- Not verifiable offline here: Lighthouse score, real-device audio, DevTools screenshots – run them yourself before the defense.
- Git author is a placeholder (`Mikey <mikey@users.noreply.local>`); set your own identity before submitting.
