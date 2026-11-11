// Tiny dev/test probe used to PROVE React.memo isolation (same fact the React DevTools Profiler shows).
// It is a no-op unless a test (or you, in the console) enables it.
const counts = new Map();
let enabled = false;

export const renderProbe = {
  enable() { enabled = true; counts.clear(); },
  disable() { enabled = false; },
  hit(id) { if (enabled) counts.set(id, (counts.get(id) ?? 0) + 1); },
  reset() { counts.clear(); },
  get(id) { return counts.get(id) ?? 0; },
  total() { let t = 0; counts.forEach((v) => { t += v; }); return t; },
  snapshot() { return new Map(counts); },
};
