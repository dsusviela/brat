import { describe, it, expect } from 'vitest';
import { loadBlocks } from './loader';

describe('loadBlocks', () => {
  it('returns a Map', () => {
    expect(loadBlocks()).toBeInstanceOf(Map);
  });

  it('registers all expected blocks by normalized name', () => {
    const registry = loadBlocks();
    const expected = [
      'log-hello',
      'always-fails',
      'open-page',
      'click-link',
      'assert-heading-visible',
      'read-page-title',
      'assert-context-value',
      'click-non-existent-button',
    ];
    for (const key of expected) {
      expect(registry.has(key), `block "${key}" should be registered`).toBe(true);
    }
  });

  it('each block has name, run, and assert', () => {
    for (const [, block] of loadBlocks()) {
      expect(typeof block.name).toBe('string');
      expect(typeof block.run).toBe('function');
      expect(typeof block.assert).toBe('function');
    }
  });
});
