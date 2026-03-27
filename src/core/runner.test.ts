import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Block, ScenarioMetadata } from './types';
import { RunnerError } from './types';

vi.mock('./loader');

import { runScenario } from './runner';
import { loadBlocks } from './loader';

function makeScenario(stepNames: string[], variables: { key: string; value: string }[] = []): ScenarioMetadata {
  return {
    globalEnv: null,
    variables,
    steps: stepNames.map(name => ({ name, envOverride: null })),
    intent: null,
  };
}

function makeBlock(name: string, overrides: Partial<Block> = {}): Block {
  return {
    name,
    run: vi.fn().mockResolvedValue({}),
    assert: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('runScenario', () => {
  let block: Block;

  beforeEach(() => {
    block = makeBlock('Test Block');
    vi.mocked(loadBlocks).mockReturnValue(new Map([['test-block', block]]));
  });

  it('runs block.run then block.assert for each step', async () => {
    await runScenario(makeScenario(['Test Block']));
    expect(block.run).toHaveBeenCalledOnce();
    expect(block.assert).toHaveBeenCalledOnce();
  });

  it('returns the scenario after completion', async () => {
    const scenario = makeScenario(['Test Block']);
    const result = await runScenario(scenario);
    expect(result).toBe(scenario);
  });

  it('initializes context with GLOBAL_ variables from scenario', async () => {
    const scenario = makeScenario(['Test Block'], [{ key: 'url', value: 'https://example.com' }]);
    await runScenario(scenario);
    expect(block.run).toHaveBeenCalledWith(
      expect.objectContaining({ GLOBAL_URL: 'https://example.com' }),
      expect.any(Object)
    );
  });

  it('passes context returned from run() into assert()', async () => {
    const enrichedContext = { GLOBAL_URL: 'https://x.com', extra: 'data' };
    vi.mocked(block.run).mockResolvedValue(enrichedContext);
    await runScenario(makeScenario(['Test Block']));
    expect(block.assert).toHaveBeenCalledWith(enrichedContext, expect.any(Object));
  });

  it('throws RunnerError when block.run() fails', async () => {
    vi.mocked(block.run).mockRejectedValue(new Error('block exploded'));
    await expect(runScenario(makeScenario(['Test Block']))).rejects.toBeInstanceOf(RunnerError);
  });

  it('throws RunnerError when block.assert() fails', async () => {
    vi.mocked(block.assert).mockRejectedValue(new Error('assertion failed'));
    await expect(runScenario(makeScenario(['Test Block']))).rejects.toBeInstanceOf(RunnerError);
  });

  it('populates completedSteps with blocks that ran before the failure', async () => {
    const pass = makeBlock('Pass Block');
    const fail = makeBlock('Fail Block', {
      run: vi.fn().mockRejectedValue(new Error('boom')),
    });
    vi.mocked(loadBlocks).mockReturnValue(new Map([
      ['pass-block', pass],
      ['fail-block', fail],
    ]));

    await expect(runScenario(makeScenario(['Pass Block', 'Fail Block']))).rejects.toSatisfy(
      (err: RunnerError) => {
        return err.completedSteps[0] === 'Pass Block' && err.failedBlockName === 'Fail Block';
      }
    );
  });

  it('throws when block is not found in registry', async () => {
    await expect(runScenario(makeScenario(['Unknown Block']))).rejects.toThrow('Block not found');
  });

  it('closes browser when present in context after a successful run', async () => {
    const mockClose = vi.fn().mockResolvedValue(undefined);
    vi.mocked(block.run).mockResolvedValue({ browser: { close: mockClose } });
    await runScenario(makeScenario(['Test Block']));
    expect(mockClose).toHaveBeenCalledOnce();
  });
});
