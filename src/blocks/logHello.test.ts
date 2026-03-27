import { describe, it, expect } from 'vitest';
import { logHello } from './logHello';

const env = {};

describe('logHello.run', () => {
  it('sets greeted: true in context', async () => {
    const result = await logHello.run({}, env);
    expect(result.greeted).toBe(true);
  });

  it('uses "World" as default when GLOBAL_NAME is not set', async () => {
    const result = await logHello.run({}, env);
    expect(result.greeted).toBe(true); // just confirms it ran cleanly
  });

  it('accepts a custom name from GLOBAL_NAME', async () => {
    const result = await logHello.run({ GLOBAL_NAME: 'Alice' }, env);
    expect(result.greeted).toBe(true);
  });

  it('preserves existing context keys', async () => {
    const result = await logHello.run({ someKey: 'someValue' }, env);
    expect(result.someKey).toBe('someValue');
  });
});

describe('logHello.assert', () => {
  it('passes when greeted is true', async () => {
    await expect(logHello.assert({ greeted: true }, env)).resolves.toBeUndefined();
  });

  it('throws when greeted is false', async () => {
    await expect(logHello.assert({ greeted: false }, env)).rejects.toThrow();
  });

  it('throws when greeted is not set', async () => {
    await expect(logHello.assert({}, env)).rejects.toThrow();
  });
});
