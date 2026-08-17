import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted so the fns exist before vi.mock's factory runs.
const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  setSession: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    functions: { invoke: mocks.invoke },
    auth: { setSession: mocks.setSession },
  },
}));

import { signInWithUsername } from './signInWithUsername';

const VALID_SESSION = {
  session: { access_token: 'access-123', refresh_token: 'refresh-456' },
};

describe('signInWithUsername', () => {
  beforeEach(() => {
    mocks.invoke.mockReset();
    mocks.setSession.mockReset();
    mocks.setSession.mockResolvedValue({ error: null });
  });

  it('installs the session and reports success', async () => {
    mocks.invoke.mockResolvedValue({ data: VALID_SESSION, error: null });

    await expect(signInWithUsername('stiluser', 'pw')).resolves.toBe(true);
    expect(mocks.setSession).toHaveBeenCalledWith({
      access_token: 'access-123',
      refresh_token: 'refresh-456',
    });
  });

  it('trims the identifier before sending it', async () => {
    mocks.invoke.mockResolvedValue({ data: VALID_SESSION, error: null });

    await signInWithUsername('  stiluser  ', 'pw');

    expect(mocks.invoke).toHaveBeenCalledWith('signin', {
      body: { identifier: 'stiluser', password: 'pw' },
    });
  });

  it('rejects blank input without calling the function', async () => {
    await expect(signInWithUsername('   ', 'pw')).resolves.toBe(false);
    await expect(signInWithUsername('stiluser', '')).resolves.toBe(false);
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it('returns false when the function reports an error', async () => {
    mocks.invoke.mockResolvedValue({ data: null, error: { message: 'Invalid login credentials' } });

    await expect(signInWithUsername('stiluser', 'pw')).resolves.toBe(false);
    expect(mocks.setSession).not.toHaveBeenCalled();
  });

  // Not deployed / offline / CORS. Must degrade to a plain false, never
  // throw into the caller's sign-in handler.
  it('returns false when invoke throws', async () => {
    mocks.invoke.mockRejectedValue(new Error('Failed to fetch'));

    await expect(signInWithUsername('stiluser', 'pw')).resolves.toBe(false);
  });

  it('returns false when the response has no usable session', async () => {
    mocks.invoke.mockResolvedValue({ data: {}, error: null });
    await expect(signInWithUsername('stiluser', 'pw')).resolves.toBe(false);

    mocks.invoke.mockResolvedValue({ data: { session: { access_token: 'a' } }, error: null });
    await expect(signInWithUsername('stiluser', 'pw')).resolves.toBe(false);

    expect(mocks.setSession).not.toHaveBeenCalled();
  });

  it('returns false when the session cannot be installed', async () => {
    mocks.invoke.mockResolvedValue({ data: VALID_SESSION, error: null });
    mocks.setSession.mockResolvedValue({ error: { message: 'bad token' } });

    await expect(signInWithUsername('stiluser', 'pw')).resolves.toBe(false);
  });

  // The whole point of the Edge Function: the client must never be able to
  // tell "no such user" from "wrong password", so the helper's contract is
  // a bare boolean with no reason attached.
  it('never returns a reason the caller could use to enumerate users', async () => {
    mocks.invoke.mockResolvedValue({
      data: null,
      error: { message: 'user stiluser@example.com not found' },
    });

    const result = await signInWithUsername('stiluser', 'pw');

    expect(result).toBe(false);
    expect(typeof result).toBe('boolean');
  });
});
