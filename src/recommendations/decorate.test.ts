/**
 * Tests for src/recommendations/decorate.ts — pure data-shaping
 * helpers extracted from useRecommendations (todo K2).
 */

import { describe, expect, it } from 'vitest';
import {
  otherPartyUserId,
  collectOtherPartyIds,
  decorateRecommendation,
} from './decorate';
import type { RecommendationRow } from './client';
import type { UserMatch } from '../friends/client';

/** Minimal row factory — only the fields the helpers actually inspect. */
function buildRow(overrides: Partial<RecommendationRow>): RecommendationRow {
  return {
    id: 'rec-1',
    from_user_id: 'alice',
    to_user_id: 'bob',
    item_snapshot: { title: 'A', type: 'item' },
    note: null,
    status: 'pending',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('otherPartyUserId', () => {
  it('returns the recipient when the current user IS the sender (outgoing)', () => {
    const row = buildRow({ from_user_id: 'alice', to_user_id: 'bob' });
    expect(otherPartyUserId(row, 'alice')).toBe('bob');
  });

  it('returns the sender when the current user IS the recipient (incoming)', () => {
    const row = buildRow({ from_user_id: 'alice', to_user_id: 'bob' });
    expect(otherPartyUserId(row, 'bob')).toBe('alice');
  });

  it('returns the recipient when neither party matches (defensive fallback)', () => {
    // The function is a simple ternary — if neither matches it returns
    // `from_user_id`. Documenting that contract.
    const row = buildRow({ from_user_id: 'alice', to_user_id: 'bob' });
    expect(otherPartyUserId(row, 'charlie')).toBe('alice');
  });
});

describe('collectOtherPartyIds', () => {
  it('returns the set of other-party ids across many rows', () => {
    const rows: RecommendationRow[] = [
      buildRow({ id: '1', from_user_id: 'alice', to_user_id: 'bob' }),
      buildRow({ id: '2', from_user_id: 'charlie', to_user_id: 'alice' }),
      buildRow({ id: '3', from_user_id: 'alice', to_user_id: 'dave' }),
    ];
    expect(collectOtherPartyIds(rows, 'alice')).toEqual(['bob', 'charlie', 'dave']);
  });

  it('deduplicates ids that appear in multiple rows', () => {
    const rows: RecommendationRow[] = [
      buildRow({ id: '1', from_user_id: 'alice', to_user_id: 'bob' }),
      buildRow({ id: '2', from_user_id: 'bob', to_user_id: 'alice' }),
      buildRow({ id: '3', from_user_id: 'alice', to_user_id: 'bob' }),
    ];
    expect(collectOtherPartyIds(rows, 'alice')).toEqual(['bob']);
  });

  it('preserves insertion order from the input rows', () => {
    // Set.prototype guarantees insertion order in modern JS engines.
    const rows: RecommendationRow[] = [
      buildRow({ id: '1', from_user_id: 'alice', to_user_id: 'zed' }),
      buildRow({ id: '2', from_user_id: 'alice', to_user_id: 'amy' }),
    ];
    expect(collectOtherPartyIds(rows, 'alice')).toEqual(['zed', 'amy']);
  });

  it('returns an empty array for no rows', () => {
    expect(collectOtherPartyIds([], 'alice')).toEqual([]);
  });
});

describe('decorateRecommendation', () => {
  const aliceProfile: UserMatch = { id: 'alice', name: 'Alice', username: 'alice' };
  const bobProfile: UserMatch = { id: 'bob', name: 'Bob', username: 'bob' };
  const profiles = new Map<string, UserMatch>([
    ['alice', aliceProfile],
    ['bob', bobProfile],
  ]);

  it('attaches the recipient profile for outgoing rows', () => {
    const row = buildRow({ from_user_id: 'alice', to_user_id: 'bob' });
    expect(decorateRecommendation(row, 'alice', profiles).otherParty).toEqual(bobProfile);
  });

  it('attaches the sender profile for incoming rows', () => {
    const row = buildRow({ from_user_id: 'alice', to_user_id: 'bob' });
    expect(decorateRecommendation(row, 'bob', profiles).otherParty).toEqual(aliceProfile);
  });

  it('attaches null when the other-party profile is missing from the map', () => {
    // Profile of unknown user not in the map → decorate hands back null
    // (the UI then renders "Unknown sender / recipient" via a fallback).
    const row = buildRow({ from_user_id: 'alice', to_user_id: 'mystery' });
    expect(decorateRecommendation(row, 'alice', profiles).otherParty).toBeNull();
  });

  it('preserves every original row field on the decorated output', () => {
    const row = buildRow({
      id: 'rec-42',
      note: 'You should see this',
      status: 'added',
      item_snapshot: { title: 'Inception', type: 'item', year: '2010' },
    });
    const decorated = decorateRecommendation(row, 'alice', profiles);
    expect(decorated).toMatchObject({
      id: 'rec-42',
      note: 'You should see this',
      status: 'added',
      item_snapshot: { title: 'Inception', type: 'item', year: '2010' },
    });
  });
});
