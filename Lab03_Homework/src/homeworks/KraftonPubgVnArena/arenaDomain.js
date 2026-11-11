/** @typedef {import('./contracts.ts').DropPhase} DropPhase */

export const LIVE_WINDOW_MS = 10 * 60 * 1000; // airdrop stays claimable for 10 minutes

/**
 * Pure phase derivation (no state, no effect).
 * @returns {DropPhase}
 */
export function getDropPhase({ nowMs, dropEpochMs, remainingStock, windowMs = LIVE_WINDOW_MS }) {
  if (nowMs < dropEpochMs) return 'WARMUP';
  if (remainingStock <= 0) return 'LOOTED_OUT';
  if (nowMs >= dropEpochMs + windowMs) return 'EXPIRED';
  return 'AIRDROP_LIVE';
}

/**
 * Claim state: stock per crate, claimed ids, in-flight lock (idempotent), last message.
 * Optimistic deduction on CLAIM_START, rollback (+ server reconcile) on 409.
 */
export const initialClaimState = (drops) => ({
  stock: Object.fromEntries(drops.map((d) => [d.id, d.remainingStock])),
  inFlight: {},      // crateId -> true while request pending (duplicate-click lock)
  claimed: {},       // crateId -> number claimed by this player
  notice: null,      // { kind: 'success' | 'conflict' | 'error', text }
});

export function claimReducer(state, action) {
  switch (action.type) {
    case 'CLAIM_START': {
      const { id } = action;
      if (state.inFlight[id] || (state.stock[id] ?? 0) <= 0) return state; // idempotent lock
      return {
        ...state,
        stock: { ...state.stock, [id]: state.stock[id] - 1 },     // optimistic deduction
        inFlight: { ...state.inFlight, [id]: true },
        notice: null,
      };
    }
    case 'CLAIM_SUCCESS': {
      const { id, remainingStock } = action;
      return {
        ...state,
        stock: { ...state.stock, [id]: remainingStock ?? state.stock[id] },
        inFlight: { ...state.inFlight, [id]: false },
        claimed: { ...state.claimed, [id]: (state.claimed[id] ?? 0) + 1 },
        notice: { kind: 'success', text: action.text ?? 'Claim confirmed.' },
      };
    }
    case 'CLAIM_CONFLICT': { // HTTP 409 => rollback the optimistic -1, then trust the server's number
      const { id, remainingStock } = action;
      return {
        ...state,
        stock: { ...state.stock, [id]: remainingStock ?? Math.max(0, state.stock[id] + 1) },
        inFlight: { ...state.inFlight, [id]: false },
        notice: { kind: 'conflict', text: action.text ?? '409 Conflict – crate looted out. Stock rolled back.' },
      };
    }
    case 'CLAIM_ERROR': { // network failure => rollback only
      const { id } = action;
      return {
        ...state,
        stock: { ...state.stock, [id]: state.stock[id] + 1 },
        inFlight: { ...state.inFlight, [id]: false },
        notice: { kind: 'error', text: action.text ?? 'Network error – stock rolled back.' },
      };
    }
    default:
      return state;
  }
}

/** Squad standings (MOCK data). */
export const SQUAD_STANDINGS = [
  { squadId: 'te', squadName: 'The Expendables', wwcdCount: 3, placementPts: 96, killPts: 112 },
  { squadId: 'ces', squadName: 'Cerberus Esports', wwcdCount: 2, placementPts: 88, killPts: 97 },
  { squadId: 'roy', squadName: 'Roy Esports', wwcdCount: 1, placementPts: 71, killPts: 84 },
  { squadId: 'agg', squadName: 'AGG', wwcdCount: 1, placementPts: 64, killPts: 79 },
];

export const totalPoints = (s) => s.placementPts + s.killPts;

export const STANDING_SORTERS = {
  total: (a, b) => totalPoints(b) - totalPoints(a),
  wwcd: (a, b) => b.wwcdCount - a.wwcdCount,
  placement: (a, b) => b.placementPts - a.placementPts,
  kills: (a, b) => b.killPts - a.killPts,
};

/** Derived leaderboard – pure, immutable (.toSorted). */
export function selectStandings(standings, { query = '', minWwcd = 0, sortBy = 'total', ascending = false }) {
  const needle = query.trim().toLowerCase();
  const sorted = standings
    .filter((s) => s.squadName.toLowerCase().includes(needle) && s.wwcdCount >= minWwcd)
    .toSorted(STANDING_SORTERS[sortBy]);
  return ascending ? sorted.toReversed() : sorted;
}

/** Scripted (MOCK) kill feed – looped to simulate a live stream. */
export const KILL_FEED_SCRIPT = [
  { squadId: 'te', text: 'The Expendables eliminated a rival squad member with an M416' },
  { squadId: 'ces', text: 'Cerberus Esports knocked a player in Pochinki' },
  { squadId: 'roy', text: 'Roy Esports secured a finishing shot with a Kar98k' },
  { squadId: 'agg', text: 'AGG cleared a compound near the blue zone' },
  { squadId: 'te', text: 'The Expendables grabbed a squad wipe on the bridge' },
  { squadId: 'ces', text: 'Cerberus Esports eliminated a flanker with an AKM' },
];

export function selectKillFeed(events, squadFilter) {
  return squadFilter === 'all' ? events : events.filter((e) => e.squadId === squadFilter);
}
