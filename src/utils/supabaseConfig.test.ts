import { describe, it, expect } from 'vitest';
import { findMissingEnvVars, REQUIRED_SUPABASE_ENV_VARS } from './supabaseConfig';

const CONFIGURED = {
  VITE_SUPABASE_URL: 'https://nhwvqzffkeaiuvivukqg.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'sb_publishable_abc123',
};

describe('findMissingEnvVars', () => {
  it('returns an empty array when both vars are set', () => {
    expect(findMissingEnvVars(CONFIGURED)).toEqual([]);
  });

  it('reports every required var when the env is empty', () => {
    expect(findMissingEnvVars({})).toEqual([...REQUIRED_SUPABASE_ENV_VARS]);
  });

  it('reports only the var that is missing', () => {
    expect(findMissingEnvVars({ ...CONFIGURED, VITE_SUPABASE_URL: undefined }))
      .toEqual(['VITE_SUPABASE_URL']);
    expect(findMissingEnvVars({ ...CONFIGURED, VITE_SUPABASE_ANON_KEY: undefined }))
      .toEqual(['VITE_SUPABASE_ANON_KEY']);
  });

  // The .env.example → .env copy path: keys present, values never filled in.
  it('treats an empty string as missing', () => {
    expect(findMissingEnvVars({ ...CONFIGURED, VITE_SUPABASE_URL: '' }))
      .toEqual(['VITE_SUPABASE_URL']);
  });

  it('treats a whitespace-only value as missing', () => {
    expect(findMissingEnvVars({ ...CONFIGURED, VITE_SUPABASE_ANON_KEY: '   ' }))
      .toEqual(['VITE_SUPABASE_ANON_KEY']);
  });

  it('ignores unrelated env vars', () => {
    expect(findMissingEnvVars({ ...CONFIGURED, VITE_TMDB_TOKEN: '' })).toEqual([]);
  });
});
