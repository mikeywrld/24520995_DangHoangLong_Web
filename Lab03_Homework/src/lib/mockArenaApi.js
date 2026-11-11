import { abortError, sleep } from './sleep.js';

export class ConflictError extends Error {
  constructor(remainingStock) {
    super('409 Conflict – looted out');
    this.name = 'ConflictError';
    this.status = 409;
    this.remainingStock = remainingStock;
  }
}

/** In-memory "server": authoritative stock, latency, abortable, 409 when stock is gone. */
export function createArenaServer(drops, { latencyMs = 600, offsetMs = 250 } = {}) {
  const stock = new Map(drops.map((d) => [d.id, d.remainingStock]));
  return {
    serverOffsetMs: offsetMs, // server clock - client clock
    getStock: (id) => stock.get(id) ?? 0,
    /** Another player buys behind our back => our optimistic UI becomes stale => 409. */
    competitorBuys(id, n = 1) { stock.set(id, Math.max(0, (stock.get(id) ?? 0) - n)); },
    async claimCrate(id, { signal } = {}) {
      if (signal?.aborted) throw abortError();
      await sleep(latencyMs, signal);
      const left = stock.get(id) ?? 0;
      if (left <= 0) throw new ConflictError(0);
      stock.set(id, left - 1);
      return { remainingStock: left - 1 };
    },
  };
}
