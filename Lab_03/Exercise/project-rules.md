# Project Rules
1. Use React 19 function components, createRoot and StrictMode with Vite's automatic JSX runtime.
2. No class components, ReactDOM.render, defaultProps, deprecated keyCode, blocking alerts or raw HTML injection.
3. No div elements inside DeveloperCard. Use semantic landmarks, description lists and stable Fragment keys.
4. Keep styling in CSS Modules for DeveloperCard and shared stylesheets for layout. Verify 375px and desktop widths.
5. Media URLs must use HTTPS. Reserve avatar dimensions and provide accessible initials on failure.
6. Store independent state only. Derive filtered/sorted results and effort scores during render. Never mutate React state.
7. Bind all form controls with useId and visible labels. Provide live statuses and useful focus restoration.
8. Clean up every resource-owning effect. Abort old requests and timers; intentional cancellation is not an error.
9. Simulated data and deliberately faulty audit candidates must be labelled. Never invent evidence, commits or scores.
10. Divide implementation into focused commits and keep runnable tests, screenshots and an English report.
