/**
 * Tests for src/utils/pluralize.ts — tiny helper, but easy to assert
 * the edge cases (zero, irregulars, negative counts).
 */

import { describe, expect, it } from 'vitest';
import { pluralize } from './pluralize';

describe('pluralize', () => {
  it('returns the singular form for exactly 1', () => {
    expect(pluralize(1, 'movie')).toBe('movie');
  });

  it('returns the regular `${singular}s` plural by default', () => {
    expect(pluralize(2, 'movie')).toBe('movies');
    expect(pluralize(0, 'movie')).toBe('movies');
  });

  it('uses the explicit plural form when provided (irregulars)', () => {
    expect(pluralize(3, 'child', 'children')).toBe('children');
    expect(pluralize(1, 'child', 'children')).toBe('child');
  });

  it('treats zero as plural (e.g. "0 movies")', () => {
    expect(pluralize(0, 'movie')).toBe('movies');
  });

  it('treats negative counts as plural too', () => {
    expect(pluralize(-1, 'movie')).toBe('movies');
  });

  it('does not normalise the input singular (caller responsibility)', () => {
    // We don't trim / lowercase — whatever you pass through is what you get.
    expect(pluralize(1, 'MOVIE')).toBe('MOVIE');
    expect(pluralize(2, 'MOVIE')).toBe('MOVIEs');
  });
});
