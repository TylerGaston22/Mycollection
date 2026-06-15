/**
 * Tests for src/auth/username.ts — validation + synthetic-email
 * mapping. Pure functions, no Supabase / DOM.
 */

import { describe, expect, it } from 'vitest';
import {
  validateUsername,
  usernameToSyntheticEmail,
  isSyntheticEmail,
  resolveSignInEmail,
  isValidEmailFormat,
  SYNTHETIC_EMAIL_DOMAIN,
} from './username';

describe('validateUsername', () => {
  it('accepts a normal lowercase username', () => {
    expect(validateUsername('alice')).toEqual({ ok: true });
  });

  it('accepts numbers, dashes, and underscores', () => {
    expect(validateUsername('alice_42-x')).toEqual({ ok: true });
  });

  it('rejects empty input', () => {
    expect(validateUsername('')).toMatchObject({ ok: false });
    expect(validateUsername('   ')).toMatchObject({ ok: false });
  });

  it('rejects too short (< 3 chars after trim/lowercase)', () => {
    expect(validateUsername('ab')).toMatchObject({ ok: false, error: /at least 3/i });
  });

  it('rejects too long (> 30 chars)', () => {
    expect(validateUsername('a'.repeat(31))).toMatchObject({
      ok: false,
      error: /at most 30/i,
    });
  });

  it('accepts exactly 3 and exactly 30 chars (boundary)', () => {
    expect(validateUsername('abc')).toEqual({ ok: true });
    expect(validateUsername('a'.repeat(30))).toEqual({ ok: true });
  });

  it('rejects uppercase by treating it as lowercase first', () => {
    // The validator lowercases input — so "Alice" effectively becomes
    // "alice" which is fine. Test that uppercase doesn't error.
    expect(validateUsername('Alice')).toEqual({ ok: true });
  });

  it('rejects whitespace inside the username', () => {
    expect(validateUsername('a b c')).toMatchObject({
      ok: false,
      error: /lowercase letters, numbers/i,
    });
  });

  it('rejects special characters (dot, slash, etc.)', () => {
    expect(validateUsername('alice.cool')).toMatchObject({ ok: false });
    expect(validateUsername('alice/bob')).toMatchObject({ ok: false });
    expect(validateUsername('alice@bob')).toMatchObject({ ok: false });
  });

  it.each(['admin', 'root', 'system', 'support', 'demo'])(
    'rejects reserved username (%s)',
    (name) => {
      expect(validateUsername(name)).toMatchObject({ ok: false, error: /reserved/i });
    },
  );

  it('rejects reserved usernames case-insensitively', () => {
    expect(validateUsername('ADMIN')).toMatchObject({ ok: false, error: /reserved/i });
  });
});

describe('usernameToSyntheticEmail', () => {
  it('builds <username>@no-email.mycollection.local', () => {
    expect(usernameToSyntheticEmail('alice')).toBe(`alice@${SYNTHETIC_EMAIL_DOMAIN}`);
  });

  it('lowercases the username', () => {
    expect(usernameToSyntheticEmail('Alice')).toBe(`alice@${SYNTHETIC_EMAIL_DOMAIN}`);
  });

  it('trims whitespace', () => {
    expect(usernameToSyntheticEmail('  alice  ')).toBe(`alice@${SYNTHETIC_EMAIL_DOMAIN}`);
  });
});

describe('isSyntheticEmail', () => {
  it('returns true for our synthetic domain', () => {
    expect(isSyntheticEmail(`alice@${SYNTHETIC_EMAIL_DOMAIN}`)).toBe(true);
  });

  it('returns true regardless of email case', () => {
    expect(isSyntheticEmail(`Alice@${SYNTHETIC_EMAIL_DOMAIN.toUpperCase()}`)).toBe(true);
  });

  it('returns false for real emails', () => {
    expect(isSyntheticEmail('alice@example.com')).toBe(false);
  });

  it('returns false for null / undefined / empty', () => {
    expect(isSyntheticEmail(null)).toBe(false);
    expect(isSyntheticEmail(undefined)).toBe(false);
    expect(isSyntheticEmail('')).toBe(false);
  });
});

describe('resolveSignInEmail', () => {
  it('passes a real email through unchanged', () => {
    expect(resolveSignInEmail('alice@example.com')).toBe('alice@example.com');
  });

  it('trims whitespace on a real email', () => {
    expect(resolveSignInEmail('  alice@example.com  ')).toBe('alice@example.com');
  });

  it('converts a bare username to its synthetic email', () => {
    expect(resolveSignInEmail('alice')).toBe(`alice@${SYNTHETIC_EMAIL_DOMAIN}`);
  });

  it('lowercases the username when converting', () => {
    expect(resolveSignInEmail('Alice')).toBe(`alice@${SYNTHETIC_EMAIL_DOMAIN}`);
  });
});

describe('isValidEmailFormat', () => {
  it('accepts standard emails', () => {
    expect(isValidEmailFormat('alice@example.com')).toBe(true);
    expect(isValidEmailFormat('alice.bob+x@sub.example.co.uk')).toBe(true);
  });

  it('rejects missing @ symbol', () => {
    expect(isValidEmailFormat('alice.example.com')).toBe(false);
  });

  it('rejects emails missing a TLD dot', () => {
    expect(isValidEmailFormat('alice@example')).toBe(false);
  });

  it('rejects emails with whitespace anywhere', () => {
    expect(isValidEmailFormat('alice @example.com')).toBe(false);
    expect(isValidEmailFormat('alice@exa mple.com')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidEmailFormat('')).toBe(false);
  });

  it('trims surrounding whitespace before checking', () => {
    expect(isValidEmailFormat('  alice@example.com  ')).toBe(true);
  });
});
