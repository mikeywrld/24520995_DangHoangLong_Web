// Executable evidence for AI_FAILURE_AUDIT.md: each test shows the BUG (AI pattern) and the FIX (our code).
import { Profiler } from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BuggyPoller } from './buggy/BuggyPoller.jsx';
import { BuggyDirectory } from './buggy/BuggyDirectory.jsx';
import { BuggyTelemetry } from './buggy/BuggyTelemetry.jsx';
import { BuggyCountdown } from './buggy/BuggyCountdown.jsx';
import { PubgMatchTelemetry } from '../src/components/PubgMatchTelemetry.jsx';
import { ScientistDirectory } from '../src/components/ScientistDirectory.jsx';
import { usePubgAirdropTimer } from '../src/homeworks/KraftonPubgVnArena/usePubgAirdropTimer.js';
import { SMART_PEOPLE } from '../src/data/pubgVnSquads.js';

afterEach(() => vi.useRealTimers());
const squad = (id) => ({ id, name: `Squad ${id}`, map: 'Erangel', phase: 'P1', alive: 4, kills: 0, wwcdProb: '1%', status: 'ok' });

describe('Failure #01 – stale closure + leaked interval in auto-polling', () => {
  it('BUG: [] deps keep polling the FIRST squad forever and leak the interval after unmount', async () => {
    vi.useFakeTimers();
    const fetchSquad = vi.fn(async (id) => squad(id));
    const { rerender, unmount } = render(<BuggyPoller squadId="ces" fetchSquad={fetchSquad} />);
    rerender(<BuggyPoller squadId="te" fetchSquad={fetchSquad} />); // user switches to The Expendables
    await act(async () => { await vi.advanceTimersByTimeAsync(9000); });
    const polled = new Set(fetchSquad.mock.calls.map(([id]) => id));
    expect(polled.has('ces')).toBe(true);
    expect(polled.has('te')).toBe(false); // 'te' is NEVER requested
    unmount();
    expect(vi.getTimerCount()).toBeGreaterThan(0); // interval survives unmount => memory leak
  });
  it('FIX: [squadId, isPaused] deps + clearInterval => follows the current squad, 0 timers after unmount', async () => {
    vi.useFakeTimers();
    const fetchTelemetry = vi.fn(async (id) => squad(id));
    const { rerender, unmount } = render(<PubgMatchTelemetry squadId="ces" fetchTelemetry={fetchTelemetry} pollMs={3000} />);
    rerender(<PubgMatchTelemetry squadId="te" fetchTelemetry={fetchTelemetry} pollMs={3000} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(9000); });
    const after = fetchTelemetry.mock.calls.map(([id]) => id).slice(2);
    expect(after.length).toBeGreaterThan(0);
    expect(after.every((id) => id === 'te')).toBe(true);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('Failure #02 – redundant useEffect for derived state doubles the render passes', () => {
  const commitsForOneKeystroke = (ui, label) => {
    const onRender = vi.fn();
    render(<Profiler id="p" onRender={onRender}>{ui}</Profiler>);
    onRender.mockClear();
    fireEvent.change(screen.getByLabelText(label), { target: { value: 'e' } });
    return onRender.mock.calls.length;
  };
  it('BUG: 2 commits per keystroke (render with stale list -> effect -> setFiltered -> render again)', () => {
    expect(commitsForOneKeystroke(<BuggyDirectory people={SMART_PEOPLE} />, /Name/)).toBe(2);
  });
  it('FIX: derive during render => exactly 1 commit per keystroke', () => {
    expect(commitsForOneKeystroke(<ScientistDirectory />, 'Name')).toBe(1);
  });
});

describe('Failure #03 – missing AbortController => out-of-order responses win', () => {
  function raceHarness(Component, extraProps = {}) {
    const calls = [];
    const fetcher = vi.fn((id, opts) => new Promise((resolve) => calls.push({ id, resolve, signal: opts?.signal })));
    const view = render(<Component squadId="ces" {...{ [extraProps.prop ?? 'fetchSquad']: fetcher }} />);
    view.rerender(<Component squadId="te" {...{ [extraProps.prop ?? 'fetchSquad']: fetcher }} />);
    return { calls };
  }
  it('BUG: the slow response for the OLD squad arrives last and overwrites the new squad', async () => {
    const { calls } = raceHarness(BuggyTelemetry);
    await act(async () => { calls[1].resolve(squad('te')); });
    await act(async () => { calls[0].resolve(squad('ces')); }); // stale, arrives later
    expect(screen.getByText('Squad ces')).toBeInTheDocument();   // UI shows the WRONG squad
    expect(calls[0].signal).toBeUndefined();                      // request was never cancellable
  });
  it('FIX: effect cleanup aborts the stale request, UI always shows the selected squad', async () => {
    const { calls } = raceHarness(PubgMatchTelemetry, { prop: 'fetchTelemetry' });
    expect(calls[0].signal.aborted).toBe(true);
    await act(async () => { calls[1].resolve(squad('te')); });
    await act(async () => { calls[0].resolve(squad('ces')); }); // late stale resolve
    expect(screen.getByRole('heading', { name: 'Squad te' })).toBeInTheDocument();
  });
});

describe('Failure #04 – decrement-per-tick countdown drifts in background tabs', () => {
  it('BUG: after 31 s of wall-clock with throttled timers the naive clock is 30 s behind', () => {
    vi.useFakeTimers();
    render(<BuggyCountdown seconds={60} />);
    vi.setSystemTime(Date.now() + 30_000);        // tab was throttled for 30 s
    act(() => { vi.advanceTimersByTime(1000); });  // ...then ONE tick fires
    expect(screen.getByRole('status')).toHaveTextContent('59'); // truth would be 29
  });
  it('FIX: target-epoch derivation reports the true 29 s', () => {
    vi.useFakeTimers();
    const target = Date.now() + 60_000;
    const { result } = renderHook(() => usePubgAirdropTimer(target));
    vi.setSystemTime(Date.now() + 30_000);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.remainingMs).toBe(29_000);
  });
});
