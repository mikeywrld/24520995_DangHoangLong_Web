import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { KraftonPubgVnArena } from '../src/homeworks/KraftonPubgVnArena/KraftonPubgVnArena.jsx';
import { usePubgAirdropTimer } from '../src/homeworks/KraftonPubgVnArena/usePubgAirdropTimer.js';
import {
  SQUAD_STANDINGS, claimReducer, getDropPhase, initialClaimState, selectKillFeed, selectStandings,
} from '../src/homeworks/KraftonPubgVnArena/arenaDomain.js';
import { formatCountdown, formatVnd } from '../src/lib/format.js';
import { createArenaServer } from '../src/lib/mockArenaApi.js';

afterEach(() => vi.useRealTimers());

describe('HW3 – formatting', () => {
  it('formats VND with vi-VN grouping and the ₫ sign', () => {
    expect(formatVnd(1500000)).toBe('1.500.000 ₫');
    expect(formatVnd(99000)).toBe('99.000 ₫');
  });
  it('formats countdowns and never goes negative', () => {
    expect(formatCountdown(125000)).toBe('02:05');
    expect(formatCountdown(3_725_000)).toBe('1:02:05');
    expect(formatCountdown(-5)).toBe('00:00');
  });
});

describe('HW3 – DropPhase (pure)', () => {
  const base = { dropEpochMs: 1000, remainingStock: 3 };
  it.each([
    [{ nowMs: 500 }, 'WARMUP'],
    [{ nowMs: 1000 }, 'AIRDROP_LIVE'],
    [{ nowMs: 1000, remainingStock: 0 }, 'LOOTED_OUT'],
    [{ nowMs: 1000 + 10 * 60 * 1000 }, 'EXPIRED'],
    [{ nowMs: 500, remainingStock: 0 }, 'WARMUP'],
  ])('%j -> %s', (patch, expected) => {
    expect(getDropPhase({ ...base, ...patch })).toBe(expected);
  });
});

describe('HW3 – claim reducer: optimistic stock, idempotent lock, 409 rollback', () => {
  const drops = [{ id: 'a', remainingStock: 3 }];
  const s0 = initialClaimState(drops);

  it('deducts optimistically and locks the crate in flight', () => {
    const s1 = claimReducer(s0, { type: 'CLAIM_START', id: 'a' });
    expect(s1.stock.a).toBe(2);
    expect(s1.inFlight.a).toBe(true);
    expect(s0.stock.a).toBe(3); // immutable
  });
  it('ignores duplicate START while in flight (double-click safe)', () => {
    const s1 = claimReducer(s0, { type: 'CLAIM_START', id: 'a' });
    expect(claimReducer(s1, { type: 'CLAIM_START', id: 'a' })).toBe(s1);
  });
  it('409 rolls back the optimistic -1 and trusts the server stock', () => {
    const s1 = claimReducer(s0, { type: 'CLAIM_START', id: 'a' });
    const s2 = claimReducer(s1, { type: 'CLAIM_CONFLICT', id: 'a', remainingStock: 0 });
    expect(s2.stock.a).toBe(0);
    expect(s2.inFlight.a).toBe(false);
    expect(s2.claimed.a).toBeUndefined();
    expect(s2.notice.kind).toBe('conflict');
  });
  it('network error rolls back exactly the optimistic -1', () => {
    const s1 = claimReducer(s0, { type: 'CLAIM_START', id: 'a' });
    expect(claimReducer(s1, { type: 'CLAIM_ERROR', id: 'a' }).stock.a).toBe(3);
  });
  it('success counts the claim and syncs stock', () => {
    const s1 = claimReducer(s0, { type: 'CLAIM_START', id: 'a' });
    const s2 = claimReducer(s1, { type: 'CLAIM_SUCCESS', id: 'a', remainingStock: 2 });
    expect(s2.claimed.a).toBe(1);
    expect(s2.stock.a).toBe(2);
  });
  it('cannot claim when stock is 0', () => {
    const empty = initialClaimState([{ id: 'a', remainingStock: 0 }]);
    expect(claimReducer(empty, { type: 'CLAIM_START', id: 'a' })).toBe(empty);
  });
});

describe('HW3 – usePubgAirdropTimer (zero drift)', () => {
  it('counts down from a target epoch and cleans up its interval + listener', () => {
    vi.useFakeTimers();
    const target = Date.now() + 10_000;
    const { result, unmount } = renderHook(() => usePubgAirdropTimer(target));
    expect(result.current.remainingMs).toBe(10_000);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.remainingMs).toBe(7000);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('a BACKGROUNDED tab (timers frozen) re-syncs instantly on visibilitychange', () => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    const target = Date.now() + 60_000;
    const { result } = renderHook(() => usePubgAirdropTimer(target));
    expect(result.current.remainingMs).toBe(60_000);
    vi.setSystemTime(Date.now() + 45_000); // 45 s pass, but Chrome never fired our interval
    expect(result.current.remainingMs).toBe(60_000); // stale until something wakes us
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(result.current.remainingMs).toBe(15_000);
  });
  it('applies the server clock offset and reports isLive at 0', () => {
    vi.useFakeTimers();
    const target = Date.now() + 1000;
    const { result } = renderHook(() => usePubgAirdropTimer(target, 1000)); // server is 1 s ahead
    expect(result.current.remainingMs).toBe(0);
    expect(result.current.isLive).toBe(true);
  });
});

describe('HW3 – derived leaderboard & kill feed', () => {
  it('sorts with .toSorted (no mutation) and supports filter + ascending', () => {
    const snapshot = JSON.stringify(SQUAD_STANDINGS);
    expect(selectStandings(SQUAD_STANDINGS, { sortBy: 'kills' }).map((s) => s.squadId)).toEqual(['te', 'ces', 'roy', 'agg']);
    expect(selectStandings(SQUAD_STANDINGS, { sortBy: 'kills', ascending: true })[0].squadId).toBe('agg');
    expect(selectStandings(SQUAD_STANDINGS, { query: 'EXP' }).map((s) => s.squadId)).toEqual(['te']);
    expect(selectStandings(SQUAD_STANDINGS, { minWwcd: 2 })).toHaveLength(2);
    expect(JSON.stringify(SQUAD_STANDINGS)).toBe(snapshot);
  });
  it('filters the kill feed by squad', () => {
    const ev = [{ squadId: 'te' }, { squadId: 'ces' }, { squadId: 'te' }];
    expect(selectKillFeed(ev, 'te')).toHaveLength(2);
    expect(selectKillFeed(ev, 'all')).toBe(ev);
  });
});

describe('HW3 – Arena UI', () => {
  const server = (drops) => createArenaServer(drops, { latencyMs: 100 });
  const crate = (name) => screen.getByRole('article', { name });
  const stockOf = (name) => within(crate(name)).getByText('Stock').nextElementSibling.textContent;

  it('optimistic claim: stock drops immediately, double-click sends ONE request, success confirms', async () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    render(<KraftonPubgVnArena createServer={(d) => { const s = server(d); const orig = s.claimCrate; s.claimCrate = (...a) => { spy(); return orig(...a); }; return s; }} />);
    const btn = within(crate('G-Coin Contraband Crate')).getByRole('button', { name: /Claim/ });
    fireEvent.click(btn);
    expect(stockOf('G-Coin Contraband Crate')).toBe('2'); // optimistic
    expect(btn).toBeDisabled();
    fireEvent.click(btn); fireEvent.click(btn);
    expect(spy).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(150); });
    expect(screen.getByText('Claim confirmed.')).toBeInTheDocument();
    expect(stockOf('G-Coin Contraband Crate')).toBe('2');
    expect(within(crate('G-Coin Contraband Crate')).getByText('Claimed by you').nextElementSibling.textContent).toBe('1');
  });

  it('409 Conflict: optimistic stock is rolled back & reconciled, announced via role="alert" (no window.alert)', async () => {
    vi.useFakeTimers();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<KraftonPubgVnArena createServer={server} />);
    const name = 'G-Coin Contraband Crate';
    fireEvent.click(within(crate(name)).getByText(/Demo controls/));
    const competitor = within(crate(name)).getByRole('button', { name: /Simulate competing buyer/ });
    fireEvent.click(competitor); fireEvent.click(competitor); fireEvent.click(competitor); // server stock 3 -> 0
    expect(stockOf(name)).toBe('3'); // client is stale
    fireEvent.click(within(crate(name)).getByRole('button', { name: /Claim/ }));
    expect(stockOf(name)).toBe('2'); // optimistic
    await act(async () => { await vi.advanceTimersByTimeAsync(150); });
    expect(stockOf(name)).toBe('0'); // rolled back to the authoritative number
    expect(screen.getByRole('alert')).toHaveTextContent(/409/);
    expect(within(crate(name)).getByText('Phase').nextElementSibling).toHaveTextContent('Looted out');
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('warm-up crate shows a countdown and a disabled claim button, then goes live without a reload', async () => {
    vi.useFakeTimers();
    render(<KraftonPubgVnArena createServer={server} />);
    const name = 'PVS Finals VIP Pass + 5,000 G-Coin';
    expect(within(crate(name)).getByText('Phase').nextElementSibling).toHaveTextContent('Warm-up');
    expect(within(crate(name)).getByRole('button', { name: /Claim/ })).toBeDisabled();
    expect(within(crate(name)).getByText('Drops in').nextElementSibling.textContent).toMatch(/^00:\d\d$/);
    expect(within(crate(name)).getByText('Price').nextElementSibling.textContent).toBe('1.500.000 ₫');
    await act(async () => { await vi.advanceTimersByTimeAsync(16_000); });
    expect(within(crate(name)).getByText('Phase').nextElementSibling).toHaveTextContent('Airdrop live');
    expect(within(crate(name)).getByRole('button', { name: /Claim/ })).toBeEnabled();
  });

  it('leaderboard: every control has a label; filter/sort are derived instantly', () => {
    render(<KraftonPubgVnArena createServer={server} />);
    const rows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1).map((r) => r.querySelector('th').textContent);
    expect(rows()[0]).toBe('The Expendables');
    fireEvent.change(screen.getByLabelText('Squad name'), { target: { value: 'cer' } });
    expect(rows()).toEqual(['Cerberus Esports']);
    fireEvent.change(screen.getByLabelText('Squad name'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Min WWCD'), { target: { value: '2' } });
    expect(rows()).toEqual(['The Expendables', 'Cerberus Esports']);
    fireEvent.change(screen.getByLabelText('Min WWCD'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'kills' } });
    fireEvent.click(screen.getByLabelText('Ascending'));
    expect(rows()[0]).toBe('AGG');
  });

  it('kill feed: filter by squad, pausable, interval cleaned on unmount', async () => {
    vi.useFakeTimers();
    const { unmount } = render(<KraftonPubgVnArena createServer={server} />);
    const items = () => within(screen.getByRole('list', { name: 'Kill feed events' })).getAllByRole('listitem');
    const n0 = items().length;
    await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
    expect(items().length).toBe(n0 + 1);
    fireEvent.click(screen.getByRole('button', { name: 'Pause feed' }));
    await act(async () => { await vi.advanceTimersByTimeAsync(9000); });
    expect(items().length).toBe(n0 + 1); // paused => frozen
    fireEvent.change(screen.getByLabelText('Squad filter'), { target: { value: 'ces' } });
    items().forEach((li) => expect(li).toHaveTextContent(/Cerberus/));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
