import { describe, it, expect } from 'vitest';
import { assertContextValue } from './assertContextValue';

const env = {};

describe('assertContextValue.run', () => {
  it('passes when context value contains the expected substring', async () => {
    const ctx = {
      GLOBAL_CONTEXT_KEY: 'pageTitle',
      GLOBAL_EXPECTED_VALUE: 'Dashboard',
      pageTitle: 'User Dashboard',
    };
    const result = await assertContextValue.run(ctx, env);
    expect(result).toBe(ctx);
  });

  it('throws when GLOBAL_CONTEXT_KEY is missing', async () => {
    await expect(
      assertContextValue.run({ GLOBAL_EXPECTED_VALUE: 'x' }, env)
    ).rejects.toThrow('GLOBAL_CONTEXT_KEY is required');
  });

  it('throws when GLOBAL_EXPECTED_VALUE is missing', async () => {
    await expect(
      assertContextValue.run({ GLOBAL_CONTEXT_KEY: 'pageTitle' }, env)
    ).rejects.toThrow('GLOBAL_EXPECTED_VALUE is required');
  });

  it('throws when the target context key is not set', async () => {
    await expect(
      assertContextValue.run(
        { GLOBAL_CONTEXT_KEY: 'pageTitle', GLOBAL_EXPECTED_VALUE: 'Dashboard' },
        env
      )
    ).rejects.toThrow('is not set');
  });

  it('throws when the value does not contain the expected substring', async () => {
    await expect(
      assertContextValue.run(
        { GLOBAL_CONTEXT_KEY: 'pageTitle', GLOBAL_EXPECTED_VALUE: 'Settings', pageTitle: 'User Dashboard' },
        env
      )
    ).rejects.toThrow('does not contain');
  });

  it('coerces numeric context values to string for comparison', async () => {
    const ctx = { GLOBAL_CONTEXT_KEY: 'count', GLOBAL_EXPECTED_VALUE: '42', count: 42 };
    await expect(assertContextValue.run(ctx, env)).resolves.toBeDefined();
  });
});

describe('assertContextValue.assert', () => {
  it('passes when value contains expected substring', async () => {
    const ctx = { GLOBAL_CONTEXT_KEY: 'pageTitle', GLOBAL_EXPECTED_VALUE: 'Dashboard', pageTitle: 'User Dashboard' };
    await expect(assertContextValue.assert(ctx, env)).resolves.toBeUndefined();
  });

  it('throws when value does not match', async () => {
    const ctx = { GLOBAL_CONTEXT_KEY: 'pageTitle', GLOBAL_EXPECTED_VALUE: 'Settings', pageTitle: 'User Dashboard' };
    await expect(assertContextValue.assert(ctx, env)).rejects.toThrow();
  });

  it('throws when target key is undefined', async () => {
    const ctx = { GLOBAL_CONTEXT_KEY: 'missing', GLOBAL_EXPECTED_VALUE: 'x' };
    await expect(assertContextValue.assert(ctx, env)).rejects.toThrow();
  });
});
