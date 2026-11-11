import axe from 'axe-core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../src/App.jsx';

// jsdom has no layout engine => color-contrast is excluded here and verified by `npm run audit:contrast`.
HTMLCanvasElement.prototype.getContext = () => null; // axe probes canvas; jsdom has none
const AXE_OPTS = { rules: { 'color-contrast': { enabled: false } } };

async function violationsOf(node) {
  const { violations } = await axe.run(node, AXE_OPTS);
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
}

describe('axe-core WCAG 2.x A/AA scan of every view (jsdom)', () => {
  const views = ['HW1 Drum Kit', 'HW2 Piano 88', 'HW3 PUBG VN Arena', 'Ex1 Card', 'Ex2 Directory', 'Ex3 Telemetry'];
  it.each(views)('%s has 0 violations', async (label) => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'], shouldAdvanceTime: true });
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(await violationsOf(container)).toEqual([]);
    vi.useRealTimers();
  });
  it('exposes landmarks: skip link, header, nav, one main, one h1', () => {
    const { container } = render(<App />);
    expect(container.querySelector('a.skip-link[href="#main"]')).not.toBeNull();
    expect(container.querySelectorAll('main')).toHaveLength(1);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(screen.getByRole('navigation', { name: 'Lab sections' })).toBeInTheDocument();
  });
  it('no <div> anywhere inside the app tree (only #root in index.html)', () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll('div')).toHaveLength(0);
    ['HW2 Piano 88', 'HW3 PUBG VN Arena', 'Ex1 Card', 'Ex2 Directory'].forEach((l) => {
      fireEvent.click(screen.getByRole('button', { name: l }));
      expect(container.querySelectorAll('div')).toHaveLength(0);
    });
  });
});
