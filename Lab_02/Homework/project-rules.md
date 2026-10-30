# Project rules
1. Use official React, TypeScript strict mode and Vite. Runtime choice is an assumption requiring instructor confirmation if Mini-React is expected.
2. Define generic contracts before UI; no any escape hatch or student-specific property access inside DataGrid.
3. Require unique stable getRowId values; reserve @header for the header row.
4. Keep data transformations pure and never sort props in place.
5. Use semantic table/thead/tbody/th scope=col and native buttons, with consistent ARIA state.
6. Keep one roving tab stop across the complete grid, including headers. Move actual DOM focus; do not emulate focus with styling.
7. Enter selects; Space toggles. Header controls must not select data rows.
8. Keep focus and selection independent. Reset pages after filter/sort/page-size changes.
9. Use React text rendering, not innerHTML or string event attributes.
10. Build modules in bounded steps: contracts/model, component/data/style, tests, repairs, evidence, report.
11. Check build and functional tests before packaging. Report actual evidence, failures and limits; do not fabricate Lighthouse scores, student manual edits or commit history.
12. Complete human screen-reader and WCAG acceptance checks before asserting full compliance.
