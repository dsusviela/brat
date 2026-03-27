import { describe, it, expect } from 'vitest';
import { alwaysFails } from './alwaysFails';

const env = {};

describe('alwaysFails.run', () => {
  it('always throws', async () => {
    await expect(alwaysFails.run({}, env)).rejects.toThrow();
  });

  it('throws with descriptive message', async () => {
    await expect(alwaysFails.run({}, env)).rejects.toThrow('designed to fail');
  });
});

describe('alwaysFails.assert', () => {
  it('resolves without throwing (never reached in practice)', async () => {
    await expect(alwaysFails.assert({}, env)).resolves.toBeUndefined();
  });
});
