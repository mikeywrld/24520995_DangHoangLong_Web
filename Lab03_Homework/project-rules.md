# UIT S3T – LAB 3 AI GOVERNANCE RULES (.cursorrules)

Feed this file to any AI assistant BEFORE generating code (Stage 3 of the 4-stage loop).

1. STACK: React 19 + Vite + ES2024 (builds on Lab 2 mini-react concepts).
2. NO LEGACY APIS: ban `class extends React.Component`, `ReactDOM.render`,
   `defaultProps`, `keyCode`, `window.alert`, `import * as React`, `http://` URLs.
3. ZERO DIV-SOUP: use `<main> <section> <article> <header> <hgroup> <dl> <dt> <dd>
   <figure> <output> <ul>/<li> <form role="search">`. The only `<div>` allowed is `#root` in index.html.
4. A11Y FORMS: pair every `<input>/<select>` with `<label htmlFor={id}>` using React 19 `useId()`.
5. STATE HYGIENE: immutable updates only (`[...prev, x]`, `.filter`, `.toSorted`).
   NEVER sync derived filter/sort state inside `useEffect` – compute it during render.
6. EFFECT CLEANUP: every timer, listener, AudioNode or fetch in `useEffect`
   MUST return a cleanup (`clearTimeout`, `removeEventListener`, `controller.abort()`, `node.disconnect()`).
7. KEYBOARD: use `e.code` (never `keyCode`), guard `e.repeat`, ignore shortcuts while typing in INPUT/TEXTAREA/SELECT.
8. TIME: countdowns derive from a monotonic target epoch (`target - Date.now()`) and re-sync on `visibilitychange`.
   Never `setSeconds(s => s - 1)`.
9. ASYNC: model remote data as `IDLE | LOADING | SUCCESS | ERROR`; ignore `AbortError`.
10. PERF: wrap list items in `React.memo`, pass only primitives + stable (`useCallback`) handlers.
11. CSS: CSS Modules + custom properties, 375px → 1440px, zero horizontal scroll of the page body,
    contrast >= 4.5:1 (text) / 3:1 (UI), respect `prefers-reduced-motion`.
12. SECURITY: no `dangerouslySetInnerHTML`, no `eval`, HTTPS-only media.
13. WORKFLOW: one vertical slice per prompt (see TASK_DECOMPOSITION.md). One-shot prompting a whole homework is banned.
14. DATA: any domain data (squad standings, kill feed, prices) is MOCK and must be labelled as such in the UI.
