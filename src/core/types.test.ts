import { describe, it, expect } from 'vitest';
import { RunnerError } from './types';

describe('RunnerError', () => {
  it('sets all fields correctly', () => {
    const original = new Error('original message');
    const context = { someKey: 'someValue' };
    const err = new RunnerError('My Block', 'block knowledge', original, context, ['Step A', 'Step B']);

    expect(err.failedBlockName).toBe('My Block');
    expect(err.knowledge).toBe('block knowledge');
    expect(err.originalError).toBe(original);
    expect(err.context).toBe(context);
    expect(err.completedSteps).toEqual(['Step A', 'Step B']);
  });

  it('is an instance of Error with name RunnerError', () => {
    const err = new RunnerError('Block', undefined, new Error('x'), {}, []);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('RunnerError');
  });

  it('includes block name and original message in .message', () => {
    const err = new RunnerError('My Block', undefined, new Error('something broke'), {}, []);
    expect(err.message).toContain('My Block');
    expect(err.message).toContain('something broke');
  });

  it('accepts undefined knowledge', () => {
    const err = new RunnerError('Block', undefined, new Error('x'), {}, []);
    expect(err.knowledge).toBeUndefined();
  });
});
