import { describe, it, expect } from 'vitest';
import { buildMainContent } from './useMainContent';
import { Item, CustomTab } from '../types';

/**
 * Covers the derivation that DesktopMainContent and MobileMainContent
 * used to duplicate. The hook itself is a pass-through to
 * `buildMainContent`, so testing the builder tests both call sites.
 */

function makeItem(overrides: Partial<Item> & { id: string }): Item {
  return {
    title: `Item ${overrides.id}`,
    type: 'item',
    status: 'watched',
    favorite: false,
    ...overrides,
  };
}

function build(items: Item[], activeSection: string, customTabs: CustomTab[] = []) {
  return buildMainContent({
    contentType: 'item',
    activeSection,
    customTabs,
    customSections: [],
    getSectionContent: () => items,
  });
}

describe('buildMainContent', () => {
  it('names the type from the registry and capitalises the add-button label', () => {
    const model = build([], 'all');
    expect(model.singularTypeName).toBe('movie');
    expect(model.pluralTypeName).toBe('movies');
    expect(model.addButtonLabel).toBe('Movie');
  });

  it('resolves a custom tab name instead of the fallback', () => {
    const tabs: CustomTab[] = [{ id: 'vinyl', name: 'Vinyl', icon: 'Disc' }];
    const model = buildMainContent({
      contentType: 'vinyl',
      activeSection: 'all',
      customTabs: tabs,
      customSections: [],
      getSectionContent: () => [],
    });
    expect(model.categoryHeadingTitle).toBe('Vinyl');
    expect(model.addButtonLabel).toBe('Vinyl');
  });

  it('uses a different empty-state sentence for "all" vs a subcategory', () => {
    expect(build([], 'all').emptyStateMessageText).toContain('Add your first');
    expect(build([], 'favorites').emptyStateMessageText).toBe(
      'No movies in this section yet.',
    );
  });

  it('reports isEmpty from the resolved section, not the raw list', () => {
    expect(build([], 'all').isEmpty).toBe(true);
    expect(build([makeItem({ id: '1' })], 'all').isEmpty).toBe(false);
  });

  describe('statusSections', () => {
    const items = [
      makeItem({ id: '1', status: 'watched' }),
      makeItem({ id: '2', status: 'want-to-see' }),
      makeItem({ id: '3', status: 'watched', favorite: true }),
    ];

    it('groups the all-items view into shelves', () => {
      const { statusSections } = build(items, 'all');
      expect(statusSections.map((s) => s.id)).toEqual(['watched', 'want-to-see', 'favorites']);
      expect(statusSections[0].items).toHaveLength(2);
      expect(statusSections[2].items.map((i) => i.id)).toEqual(['3']);
    });

    it('drops shelves that would be empty', () => {
      const { statusSections } = build([makeItem({ id: '1', status: 'watched' })], 'all');
      expect(statusSections.map((s) => s.id)).toEqual(['watched']);
    });

    it('is empty outside the all-items view, so callers fall back to a flat list', () => {
      expect(build(items, 'favorites').statusSections).toEqual([]);
      expect(build(items, 'some-custom-section').statusSections).toEqual([]);
    });

    it('is empty when the section is empty, so nothing renders a headerless void', () => {
      expect(build([], 'all').statusSections).toEqual([]);
    });
  });

  it('formats singular and plural item counts', () => {
    const { formatItemCount } = build([], 'all');
    expect(formatItemCount(1)).toBe('1 movie');
    expect(formatItemCount(3)).toBe('3 movies');
    expect(formatItemCount(0)).toBe('0 movies');
  });
});
