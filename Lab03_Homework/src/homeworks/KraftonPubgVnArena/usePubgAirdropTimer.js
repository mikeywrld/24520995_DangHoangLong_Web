import { useEffect, useState } from 'react';

/**
 * Zero-drift countdown (evolved from Lab 2 `createAntiDriftTimer`).
 * The only state is a snapshot of "server now"; remaining time is ALWAYS derived from the
 * monotonic target epoch:  remaining = max(0, target - (Date.now() + serverOffset)).
 * A throttled / backgrounded tab therefore never lags, and `visibilitychange` re-syncs instantly on wake.
 */
export function usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0, tickMs = 200) {
  const [nowMs, setNowMs] = useState(() => Date.now() + serverOffsetMs);

  useEffect(() => {
    const sync = () => setNowMs(Date.now() + serverOffsetMs);
    sync();
    const timerId = window.setInterval(sync, tickMs);
    const onWake = () => { if (document.visibilityState === 'visible') sync(); };
    document.addEventListener('visibilitychange', onWake);
    return () => {
      window.clearInterval(timerId);
      document.removeEventListener('visibilitychange', onWake);
    };
  }, [serverOffsetMs, tickMs]);

  const remainingMs = Math.max(0, targetEpochMs - nowMs);
  return { remainingMs, isLive: remainingMs === 0, nowMs };
}
