# Homework 1 - Accessible Data Grid
Dang Hoang Long | 24520995 | Lab 02 | 29 October 2026

## Run
Use Node.js 22.12+ (tested with Node.js 24.22.1).
```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```
Open the localhost URL printed by Vite. Do not open index.html with file://.
Source is in src/. The ZIP includes a production build in dist/ and actual evidence in evidence/.

## Scope and assumptions
The supplied breakdown is the requirements baseline. It does not resolve official React versus the earlier Mini-React runtime. This implementation uses official React + TypeScript + Vite; instructor confirmation is still needed if Mini-React is mandatory. No backend, authentication or CRUD is required. The 60 records are synthetic. No GitHub push or commit history is claimed.

## Component contract
ColumnDef<T>: header, accessorKey: keyof T, sortable?: boolean.
DataGridProps<T>: data, columns, ariaLabel, onRowSelect?, plus required getRowId.
getRowId is the documented extension for stable identity. IDs must be unique, stable, and must not equal the reserved header ID @header. Supply at least one column. Scalar values are displayed as text; nested objects require preprocessing.

## Behavior
- Filter all displayed fields, including GPA, with trim and case-insensitive matching. No accent folding.
- Pipeline: filter -> stable sort -> paginate. Sort is ascending then descending; null/undefined values remain last; numeric values are compared numerically.
- Search, sort and page-size changes reset to page 1. Page sizes: 10/20/50. Empty results display Page 1 of 1 and 0 records with disabled pagination.
- Single selection is stored by ID. Enter selects; Space toggles; clicking a cell selects and focuses it. onRowSelect receives the selected object only, never null on deselection.
- Selection survives filtering and pagination. The status may name an off-page selection. Rows removed from the data are not announced as selected.
- One tab stop spans the header and body. Arrows include the header row and stop at edges. Sortable header buttons use native Enter/Space activation. Tab and Shift+Tab leave the grid.
- Search retains focus. Pagination retains control focus unless the clicked button becomes disabled; then the pagination navigation region receives focus. A missing active row falls back to the header, only moving real focus when it was inside the grid.
- JSX escapes text; no HTML injection, inline string handlers, or mutation of incoming data.

## Verification status
Production build PASS; 17 automated tests PASS. Chrome UI inspected: initial display, keyboard selection and movement, empty state and descending GPA sort. See evidence/test-results.txt and screenshots.
Lighthouse was attempted but could not run: the executor has no Chrome executable configured (CHROME_PATH). No score is claimed. Remote Chrome UI access is separate from the local Lighthouse runtime.
NVDA/VoiceOver speech, 200%/400% zoom, mobile behavior and full WCAG 2.2 AA conformance are not certified. These remain acceptance checks. See MANUAL_ACCEPTANCE.md.
The AI audit records three actual build/integration defects and agent-applied corrections. It does not claim student-performed manual fixes.

## Reproduce Lighthouse on a computer with Chrome installed
First run npm run build and npm run preview. Use the URL printed by preview:
```sh
npx lighthouse http://localhost:4173 --only-categories=accessibility,best-practices --output=html --output=json --output-path=evidence/lighthouse
```
If the port differs, replace 4173. Set CHROME_PATH to your installed Chrome executable if required. Archive the real JSON/HTML, target 100 in both categories, fix failures and rerun. Do not substitute a target for a measured score.
