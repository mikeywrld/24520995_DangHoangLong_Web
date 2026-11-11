import { useEffect, useRef, useState } from 'react';
import styles from './PubgMatchTelemetry.module.css';
import { fetchKraftonPubgTelemetry } from '../lib/mockTelemetryApi.js';

/**
 * Sprint 3 – ViewState<T> (IDLE | LOADING | SUCCESS | ERROR) + AbortController.
 * - Switching squads aborts the in-flight request; AbortError never flashes an error banner.
 * - Optional auto-polling (`pollMs`) with a Pause toggle. The interval effect depends on
 *   [pollMs, isPaused] and always clears itself; each poll re-runs the abortable fetch effect
 *   (stale-while-revalidate: no skeleton flicker on silent refreshes).
 */
export function PubgMatchTelemetry({
  squadId = 'te',
  fetchTelemetry = fetchKraftonPubgTelemetry,
  packetLoss = 0.35,
  pollMs = 0,
}) {
  const [view, setView] = useState({ status: 'IDLE', data: null, error: null });
  const [retryTick, setRetryTick] = useState(0);
  const [pollTick, setPollTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const lastKeyRef = useRef('');

  useEffect(() => {
    const controller = new AbortController();
    const key = `${squadId}:${retryTick}`;
    const silent = pollTick > 0 && lastKeyRef.current === key; // poll refresh of the SAME squad
    lastKeyRef.current = key;
    if (!silent) setView({ status: 'LOADING', data: null, error: null });
    fetchTelemetry(squadId, { signal: controller.signal, packetLoss })
      .then((data) => {
        if (controller.signal.aborted) return; // stale response from a cancelled request must never win
        setView({ status: 'SUCCESS', data, error: null });
      })
      .catch((err) => {
        if (err.name === 'AbortError' || controller.signal.aborted) return; // intentional cancel => not an error
        setView((prev) => (silent && prev.status === 'SUCCESS'
          ? prev // keep last good data on a failed silent poll
          : { status: 'ERROR', data: null, error: err.message }));
      });
    return () => controller.abort();
  }, [squadId, retryTick, pollTick, fetchTelemetry, packetLoss]);

  useEffect(() => {
    if (!pollMs || isPaused) return undefined;
    const id = window.setInterval(() => setPollTick((t) => t + 1), pollMs);
    return () => window.clearInterval(id);
  }, [pollMs, isPaused]);

  if (view.status === 'LOADING' || view.status === 'IDLE') {
    return (
      <section className={styles.skeleton} aria-busy="true" aria-label="Loading telemetry">
        <p>Syncing KRAFTON radar…</p>
      </section>
    );
  }
  if (view.status === 'ERROR') {
    return (
      <section className={styles.error} role="alert">
        <p>Blue-Zone link lost: {view.error}</p>
        <button type="button" className="btn btn--primary" onClick={() => setRetryTick((t) => t + 1)}>
          Reconnect Satellite (Retry)
        </button>
      </section>
    );
  }
  const d = view.data;
  return (
    <article className={styles.card} aria-live="polite" aria-labelledby="telemetry-title">
      <h3 id="telemetry-title">{d.name}</h3>
      <dl className={styles.stats}>
        <dt>Map</dt><dd>{d.map}</dd>
        <dt>Phase</dt><dd>{d.phase}</dd>
        <dt>Alive</dt><dd>{d.alive}</dd>
        <dt>Kills</dt><dd>{d.kills}</dd>
        <dt>WWCD prob.</dt><dd>{d.wwcdProb}</dd>
        <dt>Status</dt><dd>{d.status}</dd>
      </dl>
      <p className="muted">Mock telemetry – not real match data.</p>
      {pollMs > 0 && (
        <button type="button" className="btn" aria-pressed={isPaused} onClick={() => setIsPaused((p) => !p)}>
          {isPaused ? 'Resume radar' : 'Pause radar'}
        </button>
      )}
    </article>
  );
}
