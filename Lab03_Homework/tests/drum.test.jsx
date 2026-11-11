import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DrumMachine } from '../src/homeworks/DrumMachine/DrumMachine.jsx';
import { PAD_MAP, PADS } from '../src/homeworks/DrumMachine/pads.js';
import { createDrumEngine } from '../src/audio/drumSynth.js';
import { makeAudioMock } from './helpers/audioMock.js';

const makeEngine = () => ({ play: vi.fn(), dispose: vi.fn() });
const setup = () => {
  const engine = makeEngine();
  const utils = render(<DrumMachine createEngine={() => engine} />);
  return { engine, ...utils };
};
afterEach(() => vi.useRealTimers());

describe('HW1 – keyboard contract', () => {
  it('maps W A S D J K L via e.code', () => {
    expect([...PAD_MAP.keys()]).toEqual(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyJ', 'KeyK', 'KeyL']);
    expect(PADS).toHaveLength(7);
  });
  it('plays a pad on keydown (e.code) and logs it', () => {
    const { engine } = setup();
    fireEvent.keyDown(window, { code: 'KeyA' });
    expect(engine.play).toHaveBeenCalledWith('kick');
    expect(screen.getByText(/Last hit: Kick \(A\)/)).toBeInTheDocument();
  });
  it('ignores deprecated keyCode-only events (proves e.code is used)', () => {
    const { engine } = setup();
    fireEvent.keyDown(window, { keyCode: 65 });
    expect(engine.play).not.toHaveBeenCalled();
  });
  it('blocks OS key-hold spam (e.repeat)', () => {
    const { engine } = setup();
    fireEvent.keyDown(window, { code: 'KeyS' });
    fireEvent.keyDown(window, { code: 'KeyS', repeat: true });
    fireEvent.keyDown(window, { code: 'KeyS', repeat: true });
    expect(engine.play).toHaveBeenCalledTimes(1);
  });
  it('is isolated from text inputs (typing the session name does not play drums)', () => {
    const { engine } = setup();
    const input = screen.getByLabelText('Session name');
    input.focus();
    fireEvent.keyDown(input, { code: 'KeyA' });
    expect(engine.play).not.toHaveBeenCalled();
  });
  it('does not hijack browser shortcuts (Ctrl/Cmd/Alt + key)', () => {
    const { engine } = setup();
    fireEvent.keyDown(window, { code: 'KeyA', ctrlKey: true });
    fireEvent.keyDown(window, { code: 'KeyA', metaKey: true });
    expect(engine.play).not.toHaveBeenCalled();
  });
  it('aria-pressed follows keydown/keyup', () => {
    setup();
    const kick = screen.getByRole('button', { name: /Kick/ });
    expect(kick).toHaveAttribute('aria-pressed', 'false');
    fireEvent.keyDown(window, { code: 'KeyA' });
    expect(kick).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyUp(window, { code: 'KeyA' });
    expect(kick).toHaveAttribute('aria-pressed', 'false');
  });
  it('pointer press plays; keyboard activation (Enter/Space => click detail 0) plays exactly once', () => {
    vi.useFakeTimers();
    const { engine } = setup();
    const snare = screen.getByRole('button', { name: /Snare/ });
    fireEvent.pointerDown(snare);
    fireEvent.pointerUp(snare);
    fireEvent.click(snare, { detail: 1 }); // the click that follows a mouse press must NOT double-trigger
    expect(engine.play).toHaveBeenCalledTimes(1);
    fireEvent.click(snare, { detail: 0 }); // keyboard-initiated click
    expect(engine.play).toHaveBeenCalledTimes(2);
  });
  it('Sound off = visual only (no audio) but the hit is still logged', () => {
    const { engine } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Sound on/ }));
    fireEvent.keyDown(window, { code: 'KeyD' });
    expect(engine.play).not.toHaveBeenCalled();
    expect(screen.getByText(/Last hit: Hi-Hat/)).toBeInTheDocument();
  });
});

describe('HW1 – lifecycle hygiene', () => {
  it('removes global listeners and disposes audio on unmount', () => {
    const { engine, unmount } = setup();
    fireEvent.keyDown(window, { code: 'KeyA' });
    unmount();
    fireEvent.keyDown(window, { code: 'KeyA' });
    expect(engine.play).toHaveBeenCalledTimes(1);
    expect(engine.dispose).toHaveBeenCalledTimes(1);
  });
  it('level meter decays to 0 and leaves no interval behind', async () => {
    vi.useFakeTimers();
    const { unmount } = setup();
    fireEvent.keyDown(window, { code: 'KeyA' });
    const meter = () => Number(document.querySelector('meter').value);
    expect(meter()).toBe(100);
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(meter()).toBe(0);
    expect(vi.getTimerCount()).toBe(0); // interval stopped itself
    unmount();
  });
  it('synth engine is lazy (no AudioContext before the first gesture) and disposes nodes', () => {
    const { AudioCtor, created } = makeAudioMock();
    const engine = createDrumEngine(AudioCtor);
    expect(created.contexts).toHaveLength(0);
    expect(engine.play('kick')).toBe(true);
    expect(engine.play('snare')).toBe(true);
    expect(engine.play('nope')).toBe(false);
    expect(created.contexts).toHaveLength(1);
    engine.dispose();
    expect(created.contexts[0].closed).toBe(true);
  });
});
