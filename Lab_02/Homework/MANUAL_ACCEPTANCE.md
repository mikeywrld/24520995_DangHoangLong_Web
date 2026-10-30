# Final human acceptance checklist
These items are pending unless marked as observed. Record browser/version, operating system, screen reader/version, date and actual result before submission.

## Recorded in this session
- Chrome showed all ten initial rows and 60 results.
- Enter on SV001 selected SV001; ArrowRight moved actual focus to the name cell.
- Nonmatching search showed 0 results and disabled both page buttons; the search field retained focus.
- Two activations of GPA showed descending data beginning 3.99, 3.96, 3.93.
- Automated tests additionally cover all arrows, boundary clamping, Tab/Shift+Tab, header activation, text safety, callbacks, filtering and page sizes.

## Pending checks
1. Run Lighthouse on the production preview. Save HTML and JSON, including version, URL and date. Target: Accessibility=100; Best Practices=100. Fix and retest any failures.
2. NVDA + Chrome on Windows (or VoiceOver + Safari): read grid name, column names, sort order, selected row and live result status; navigate all columns and pagination without a mouse. Confirm announcements are useful and not duplicated.
3. Test zoom at 200% and 400%, a narrow viewport and horizontal table scrolling. Confirm controls wrap and focus stays visible.
4. Check keyboard-only use from page entry through grid and pagination, including the last-page disabled button fallback.
5. Evaluate WCAG 2.2 AA criteria manually; automated tests and a perfect Lighthouse score cannot certify complete compliance.
6. Confirm whether official React is accepted or the lecturer requires Mini-React.
7. If required, personally review/fix code and record genuine manual changes; do not describe assistant edits as your own manual repair.

## Defense notes
- Filter before pagination to search the complete dataset.
- Sort a copied array to avoid mutating parent props.
- Stable IDs preserve selection when row positions change.
- Focus is the active keyboard target; selection is an independent row state.
- role=grid only supplies semantics; key handlers and real focus changes implement interaction.
- One tab stop reduces repetitive Tab presses; arrows navigate the internal grid.
- aria-sort belongs on the currently sorted column header.
- React escapes string values, so HTML-like data remains text.
