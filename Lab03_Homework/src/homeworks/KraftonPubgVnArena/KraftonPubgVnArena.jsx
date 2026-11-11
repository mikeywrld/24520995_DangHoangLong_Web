import { useEffect, useId, useReducer, useRef, useState } from 'react';
import styles from './KraftonPubgVnArena.module.css';
import { formatCountdown, formatVnd } from '../../lib/format.js';
import { createArenaServer } from '../../lib/mockArenaApi.js';
import {
  KILL_FEED_SCRIPT, SQUAD_STANDINGS, claimReducer, getDropPhase, initialClaimState,
  selectKillFeed, selectStandings, totalPoints,
} from './arenaDomain.js';
import { usePubgAirdropTimer } from './usePubgAirdropTimer.js';

/** MOCK catalogue, built relative to "now" so the demo always starts with something to watch. */
export function buildDrops(nowMs = Date.now()) {
  return [
    { id: 'vip', title: 'PVS Finals VIP Pass + 5,000 G-Coin', priceVnd: 1_500_000, remainingStock: 5, dropEpochMs: nowMs + 15_000 },
    { id: 'gcoin', title: 'G-Coin Contraband Crate', priceVnd: 99_000, remainingStock: 3, dropEpochMs: nowMs - 1_000 },
    { id: 'skin', title: 'Squad Skin Crate (1 left!)', priceVnd: 249_000, remainingStock: 1, dropEpochMs: nowMs - 1_000 },
  ];
}

const PHASE_TEXT = {
  WARMUP: 'Warm-up',
  AIRDROP_LIVE: 'Airdrop live',
  LOOTED_OUT: 'Looted out',
  EXPIRED: 'Expired',
};

function CrateCard({ drop, stock, inFlight, claimed, serverOffsetMs, onClaim, onCompetitor }) {
  const { remainingMs, nowMs } = usePubgAirdropTimer(drop.dropEpochMs, serverOffsetMs);
  const phase = getDropPhase({ nowMs, dropEpochMs: drop.dropEpochMs, remainingStock: stock });
  const canClaim = phase === 'AIRDROP_LIVE' && !inFlight;
  return (
    <li className={styles.crate}>
      <article aria-labelledby={`crate-${drop.id}`}>
        <h4 id={`crate-${drop.id}`}>{drop.title}</h4>
        <dl className={styles.kv}>
          <dt>Price</dt><dd>{formatVnd(drop.priceVnd)}</dd>
          <dt>Stock</dt><dd>{stock}</dd>
          <dt>Phase</dt><dd>{PHASE_TEXT[phase]}</dd>
          <dt>{phase === 'WARMUP' ? 'Drops in' : 'Claimed by you'}</dt>
          <dd>{phase === 'WARMUP' ? formatCountdown(remainingMs) : claimed}</dd>
        </dl>
        <p className={styles.actions}>
          <button type="button" className="btn btn--primary" disabled={!canClaim} aria-busy={inFlight} onClick={() => onClaim(drop.id)}>
            {inFlight ? 'Claiming…' : 'Claim'}<span className="visually-hidden"> {drop.title}</span>
          </button>
        </p>
        <details className={styles.demo}>
          <summary>Demo controls</summary>
          <button type="button" className="btn" onClick={() => onCompetitor(drop.id)}>
            Simulate competing buyer<span className="visually-hidden"> for {drop.title}</span>
          </button>
        </details>
      </article>
    </li>
  );
}

/** HW3 – KRAFTON x PUBG Vietnam Championship & Airdrop Arena. */
export function KraftonPubgVnArena({ createServer = createArenaServer }) {
  const [drops] = useState(() => buildDrops());
  const [server] = useState(() => createServer(drops));
  const [claim, dispatch] = useReducer(claimReducer, drops, initialClaimState);
  const lockRef = useRef(new Set());
  const abortRef = useRef(null);

  // controller created INSIDE the effect => safe under StrictMode's setup/cleanup/setup
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    return () => controller.abort();
  }, []);

  const handleClaim = async (id) => {
    if (lockRef.current.has(id) || (claim.stock[id] ?? 0) <= 0) return; // idempotent in-flight lock
    lockRef.current.add(id);
    dispatch({ type: 'CLAIM_START', id });
    try {
      const res = await server.claimCrate(id, { signal: abortRef.current?.signal });
      dispatch({ type: 'CLAIM_SUCCESS', id, remainingStock: res.remainingStock });
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (err.status === 409) dispatch({ type: 'CLAIM_CONFLICT', id, remainingStock: err.remainingStock });
      else dispatch({ type: 'CLAIM_ERROR', id });
    } finally {
      lockRef.current.delete(id);
    }
  };

  // ---- Leaderboard: raw inputs only, rest derived ----
  const qId = useId();
  const wwcdId = useId();
  const sortId = useId();
  const dirId = useId();
  const feedFilterId = useId();
  const [query, setQuery] = useState('');
  const [minWwcd, setMinWwcd] = useState(0);
  const [sortBy, setSortBy] = useState('total');
  const [ascending, setAscending] = useState(false);
  const standings = selectStandings(SQUAD_STANDINGS, { query, minWwcd, sortBy, ascending });

  // ---- Kill feed (scripted MOCK stream, pausable per WCAG 2.2.2) ----
  const seqRef = useRef(3);
  const [feed, setFeed] = useState(() =>
    KILL_FEED_SCRIPT.slice(0, 3).map((e, i) => ({ id: `kf-${i}`, ...e, atMs: Date.now() - (3 - i) * 3000 })).toReversed());
  const [paused, setPaused] = useState(false);
  const [squadFilter, setSquadFilter] = useState('all');
  useEffect(() => {
    if (paused) return undefined;
    const id = window.setInterval(() => {
      const i = seqRef.current;
      seqRef.current += 1;
      const e = KILL_FEED_SCRIPT[i % KILL_FEED_SCRIPT.length];
      setFeed((prev) => [{ id: `kf-${i}`, ...e, atMs: Date.now() }, ...prev].slice(0, 20));
    }, 3000);
    return () => window.clearInterval(id);
  }, [paused]);
  const visibleFeed = selectKillFeed(feed, squadFilter);

  const notice = claim.notice;

  return (
    <section className={styles.arena} aria-labelledby="arena-title">
      <header>
        <h2 id="arena-title">KRAFTON × PUBG Vietnam Arena</h2>
        <p className="muted">PVS Finals tickets &amp; G-Coin crates. All data is mock; prices in VND.</p>
      </header>

      <section aria-labelledby="crates-title" className={styles.block}>
        <h3 id="crates-title">Airdrop &amp; ticket crates</h3>
        <ul className={styles.crates} aria-label="Crates">
          {drops.map((d) => (
            <CrateCard
              key={d.id}
              drop={d}
              stock={claim.stock[d.id]}
              inFlight={Boolean(claim.inFlight[d.id])}
              claimed={claim.claimed[d.id] ?? 0}
              serverOffsetMs={server.serverOffsetMs}
              onClaim={handleClaim}
              onCompetitor={server.competitorBuys}
            />
          ))}
        </ul>
        {notice?.kind === 'success' && <output role="status" aria-live="polite" className={styles.ok}>{notice.text}</output>}
        {notice && notice.kind !== 'success' && <p role="alert" className={styles.err}>{notice.text}</p>}
      </section>

      <section aria-labelledby="board-title" className={styles.block}>
        <h3 id="board-title">Live leaderboard</h3>
        <form role="search" className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <p className="field">
            <label htmlFor={qId}>Squad name</label>
            <input id={qId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
          </p>
          <p className="field">
            <label htmlFor={wwcdId}>Min WWCD</label>
            <input id={wwcdId} type="number" min="0" value={minWwcd}
              onChange={(e) => setMinWwcd(Number.isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber)} />
          </p>
          <p className="field">
            <label htmlFor={sortId}>Sort by</label>
            <select id={sortId} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="total">Total points</option>
              <option value="wwcd">WWCD</option>
              <option value="placement">Placement points</option>
              <option value="kills">Kill points</option>
            </select>
          </p>
          <p className={styles.check}>
            <input id={dirId} type="checkbox" checked={ascending} onChange={(e) => setAscending(e.target.checked)} />
            <label htmlFor={dirId}>Ascending</label>
          </p>
        </form>
        <output role="status" aria-live="polite" className="muted">{standings.length} squad{standings.length === 1 ? '' : 's'} shown</output>
        <section className={styles.tableWrap} aria-label="Leaderboard table (scrollable)" tabIndex={0}>
          <table className={styles.table}>
            <caption className="visually-hidden">PVS squad standings (mock data)</caption>
            <thead>
              <tr><th scope="col">Squad</th><th scope="col">WWCD</th><th scope="col">Placement</th><th scope="col">Kills</th><th scope="col">Total</th></tr>
            </thead>
            <tbody>
              {standings.map((s) => (
                <tr key={s.squadId}>
                  <th scope="row">{s.squadName}</th>
                  <td>{s.wwcdCount}</td><td>{s.placementPts}</td><td>{s.killPts}</td><td>{totalPoints(s)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>

      <section aria-labelledby="feed-title" className={styles.block}>
        <h3 id="feed-title">Kill feed</h3>
        <p className={styles.form}>
          <span className="field">
            <label htmlFor={feedFilterId}>Squad filter</label>
            <select id={feedFilterId} value={squadFilter} onChange={(e) => setSquadFilter(e.target.value)}>
              <option value="all">All squads</option>
              {SQUAD_STANDINGS.map((s) => <option key={s.squadId} value={s.squadId}>{s.squadName}</option>)}
            </select>
          </span>
          <button type="button" className="btn" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
            {paused ? 'Resume feed' : 'Pause feed'}
          </button>
        </p>
        <ol className={styles.feed} aria-label="Kill feed events">
          {visibleFeed.map((e) => (
            <li key={e.id}>
              <time dateTime={new Date(e.atMs).toISOString()}>{new Date(e.atMs).toLocaleTimeString('vi-VN')}</time> — {e.text}
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
