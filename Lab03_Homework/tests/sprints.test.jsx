import { Profiler } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DeveloperCard } from '../src/components/DeveloperCard.jsx';
import { ScientistDirectory } from '../src/components/ScientistDirectory.jsx';
import { PubgMatchTelemetry } from '../src/components/PubgMatchTelemetry.jsx';

afterEach(() => vi.useRealTimers());

describe('Sprint 1 – DeveloperCard (zero div-soup)', () => {
  it('uses article > header + dl + ul and contains no <div>', () => {
    const { container } = render(<DeveloperCard />);
    const article = container.querySelector('article');
    expect(article).toHaveAttribute('aria-labelledby', 'dev-heading');
    expect(article.querySelector('div')).toBeNull();
    expect(article.querySelector('header')).not.toBeNull();
    expect(article.querySelector('dl')).not.toBeNull();
    expect(article.querySelectorAll('ul > li').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 2, name: 'Mikey' })).toBeInTheDocument();
  });
  it('renders key/value metadata as dt/dd pairs (not three <h1>)', () => {
    const { container } = render(<DeveloperCard metrics={{ commits: 7, a11yScore: 100 }} />);
    expect(container.querySelectorAll('dt')).toHaveLength(2);
    expect(container.querySelectorAll('h1')).toHaveLength(0);
  });
  it('accepts HTTPS avatars only, with explicit width/height; falls back to initials on error', () => {
    const { container, rerender } = render(<DeveloperCard avatarUrl="http://insecure.test/a.png" />);
    expect(container.querySelector('img')).toBeNull();
    rerender(<DeveloperCard avatarUrl="https://secure.test/a.png" />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('width', '64');
    expect(img).toHaveAttribute('height', '64');
    fireEvent.error(img);
    expect(container.querySelector('img')).toBeNull();
    expect(container).toHaveTextContent('M');
  });
});

describe('Sprint 2 – ScientistDirectory (derived state)', () => {
  const found = () => screen.getByRole('status').textContent;
  it('starts with the 6 pioneers at IQ >= 160 and is label-bound', () => {
    render(<ScientistDirectory />);
    expect(found()).toBe('Found 6 pioneers');
    ['Name', 'Min IQ', 'Sort by'].forEach((l) => expect(screen.getByLabelText(l)).toBeInTheDocument());
  });
  it('typing 1 character causes EXACTLY 1 commit (no useEffect double render)', () => {
    const onRender = vi.fn();
    render(<Profiler id="dir" onRender={onRender}><ScientistDirectory /></Profiler>);
    onRender.mockClear();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'e' } });
    expect(onRender).toHaveBeenCalledTimes(1);
    onRender.mockClear();
    fireEvent.change(screen.getByLabelText('Min IQ'), { target: { value: '195' } });
    expect(onRender).toHaveBeenCalledTimes(1);
  });
  it('filters case-insensitively, numerically (valueAsNumber) and sorts with toSorted', () => {
    render(<ScientistDirectory />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'EIN' } });
    expect(found()).toBe('Found 1 pioneer');
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Min IQ'), { target: { value: '195' } });
    expect(found()).toBe('Found 3 pioneers'); // 210, 205, 200
    fireEvent.change(screen.getByLabelText('Min IQ'), { target: { value: '' } });
    expect(found()).toBe('Found 6 pioneers'); // NaN -> 0
    fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'age-asc' } });
    const first = within(screen.getByRole('list', { name: 'Pioneers' })).getAllByRole('listitem')[0];
    expect(first).toHaveTextContent('William Sidis'); // youngest (46)
  });
  it('delete is immutable & keeps remaining rows; reset restores everything', () => {
    render(<ScientistDirectory />);
    fireEvent.click(screen.getByRole('button', { name: /Delete Albert Einstein/ }));
    expect(found()).toBe('Found 5 pioneers');
    expect(screen.queryByRole('button', { name: /Delete Albert Einstein/ })).toBeNull();
    expect(screen.getByRole('button', { name: /Delete Isaac Newton/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(found()).toBe('Found 6 pioneers');
  });
});

function deferredFetcher() {
  const calls = [];
  const fetcher = vi.fn((squadId, { signal }) => new Promise((resolve, reject) => {
    calls.push({ squadId, signal, resolve, reject });
  }));
  return { fetcher, calls };
}
const squad = (id, name) => ({ id, name, map: 'Erangel', phase: 'Phase 1', alive: 4, kills: 1, wwcdProb: '50%', status: 'ok' });

describe('Sprint 3 – PubgMatchTelemetry (4-state machine + AbortController)', () => {
  it('shows a busy skeleton while loading, then data', async () => {
    const { fetcher, calls } = deferredFetcher();
    render(<PubgMatchTelemetry squadId="te" fetchTelemetry={fetcher} />);
    expect(screen.getByLabelText('Loading telemetry')).toHaveAttribute('aria-busy', 'true');
    await act(async () => { calls[0].resolve(squad('te', 'The Expendables')); });
    expect(screen.getByRole('heading', { name: 'The Expendables' })).toBeInTheDocument();
  });
  it('rapid squad switching aborts the stale request; a late stale response can never win', async () => {
    const { fetcher, calls } = deferredFetcher();
    const { rerender } = render(<PubgMatchTelemetry squadId="ces" fetchTelemetry={fetcher} />);
    rerender(<PubgMatchTelemetry squadId="te" fetchTelemetry={fetcher} />);
    expect(calls[0].signal.aborted).toBe(true);
    expect(calls[1].signal.aborted).toBe(false);
    await act(async () => { calls[1].resolve(squad('te', 'The Expendables')); });
    await act(async () => { calls[0].reject(new DOMException('aborted', 'AbortError')); });
    expect(screen.queryByRole('alert')).toBeNull(); // AbortError is not an error banner
    expect(screen.getByRole('heading', { name: 'The Expendables' })).toBeInTheDocument();
  });
  it('error -> role="alert" with Retry (no window.alert) -> success', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { fetcher, calls } = deferredFetcher();
    render(<PubgMatchTelemetry squadId="te" fetchTelemetry={fetcher} />);
    await act(async () => { calls[0].reject(new Error('Packet timeout')); });
    expect(screen.getByRole('alert')).toHaveTextContent('Packet timeout');
    fireEvent.click(screen.getByRole('button', { name: /Reconnect Satellite/ }));
    expect(calls).toHaveLength(2);
    await act(async () => { calls[1].resolve(squad('te', 'The Expendables')); });
    expect(screen.getByRole('heading', { name: 'The Expendables' })).toBeInTheDocument();
    expect(alertSpy).not.toHaveBeenCalled();
  });
  it('aborts the in-flight request on unmount', () => {
    const { fetcher, calls } = deferredFetcher();
    const { unmount } = render(<PubgMatchTelemetry squadId="te" fetchTelemetry={fetcher} />);
    unmount();
    expect(calls[0].signal.aborted).toBe(true);
  });

  describe('auto-polling + Pause (live-defense Challenge B)', () => {
    const instantFetcher = () => vi.fn(async (squadId) => squad(squadId, `Squad ${squadId}`));
    it('polls every N ms, follows the CURRENT squad, pauses, and leaves 0 timers', async () => {
      vi.useFakeTimers();
      const fetcher = instantFetcher();
      const { rerender, unmount } = render(<PubgMatchTelemetry squadId="ces" fetchTelemetry={fetcher} pollMs={3000} />);
      await act(async () => { await vi.advanceTimersByTimeAsync(0); });
      expect(fetcher).toHaveBeenCalledTimes(1);
      await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(screen.queryByLabelText('Loading telemetry')).toBeNull(); // silent refresh, no skeleton flicker

      rerender(<PubgMatchTelemetry squadId="te" fetchTelemetry={fetcher} pollMs={3000} />);
      await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
      const squadsPolledAfterSwitch = fetcher.mock.calls.slice(2).map(([id]) => id);
      expect(squadsPolledAfterSwitch.every((id) => id === 'te')).toBe(true); // no stale-closure polling of 'ces'

      fireEvent.click(screen.getByRole('button', { name: 'Pause radar' }));
      const before = fetcher.mock.calls.length;
      await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
      expect(fetcher.mock.calls.length).toBe(before);
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
