import { useEffect, useState } from 'react';

// AI FAILURE #04 – "Write a countdown for the PUBG airdrop"
// Typical LLM output: decrement-per-tick. Background tabs are throttled => the clock lags behind reality.
export function BuggyCountdown({ seconds }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <output>{left}</output>;
}
