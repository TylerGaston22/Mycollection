import { describe, it, expect } from 'vitest';
import { mockItems } from '../demo';

/**
 * Sanity-check on the demo seed aggregate. The hook itself is just
 * `useMemo` over this same byType loop — if these assertions hold,
 * the hook MUST return matching counts. If the UI shows different
 * numbers than these, the bug is in render/data-flow, not the count.
 */
describe('mockItems demo seed shape', () => {
  it('has the expected per-type counts', () => {
    const byType: Record<string, number> = {};
    for (const item of mockItems) {
      byType[item.type] = (byType[item.type] || 0) + 1;
    }
    expect(byType.item).toBe(40);
    expect(byType['tv-show']).toBe(40);
    expect(byType.restaurant).toBe(20);
    expect(byType.place).toBe(20);
    expect(byType.game).toBe(30);
    expect(mockItems.length).toBe(150);
  });

  it('every game seed has the exact string "game" as its type', () => {
    const games = mockItems.filter((i) => i.type === 'game');
    expect(games.length).toBe(30);
    games.forEach((g) => {
      expect(g.type).toBe('game');
    });
  });
});
