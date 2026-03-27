import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs/promises');

import { readFile } from 'fs/promises';
import { parseScenario } from './parser';

const mockReadFile = vi.mocked(readFile);

function mockContent(content: string) {
  mockReadFile.mockResolvedValue(content as any);
}

describe('parseScenario', () => {
  beforeEach(() => {
    mockReadFile.mockReset();
  });

  it('parses intent from frontmatter', async () => {
    mockContent(`---
intent: "Verify login flow works end to end"
---

## Steps

- Log Hello
`);
    const result = await parseScenario('test.md');
    expect(result.intent).toBe('Verify login flow works end to end');
  });

  it('parses globalEnv from frontmatter', async () => {
    mockContent(`---
env: production
---

## Steps

- Log Hello
`);
    const result = await parseScenario('test.md');
    expect(result.globalEnv).toBe('production');
  });

  it('returns null intent and globalEnv when frontmatter is absent', async () => {
    mockContent(`## Steps

- Log Hello
`);
    const result = await parseScenario('test.md');
    expect(result.globalEnv).toBeNull();
    expect(result.intent).toBeNull();
  });

  it('parses variables from ## Variables section', async () => {
    mockContent(`---
intent: "Test"
---

## Variables

- url=https://example.com
- name=Alice

## Steps

- Log Hello
`);
    const result = await parseScenario('test.md');
    expect(result.variables).toEqual([
      { key: 'url', value: 'https://example.com' },
      { key: 'name', value: 'Alice' },
    ]);
  });

  it('returns empty variables when section is absent', async () => {
    mockContent(`## Steps

- Log Hello
`);
    const result = await parseScenario('test.md');
    expect(result.variables).toEqual([]);
  });

  it('parses multiple steps', async () => {
    mockContent(`## Steps

- Log Hello
- Always Fails
`);
    const result = await parseScenario('test.md');
    expect(result.steps).toEqual([
      { name: 'Log Hello', envOverride: null },
      { name: 'Always Fails', envOverride: null },
    ]);
  });

  it('parses a step with an env override', async () => {
    mockContent(`## Steps

- [staging] Click Link
`);
    const result = await parseScenario('test.md');
    expect(result.steps[0]).toEqual({ name: 'Click Link', envOverride: 'staging' });
  });

  it('throws when ## Steps section is missing', async () => {
    mockContent(`---
intent: "No steps here"
---

## Variables

- url=https://example.com
`);
    await expect(parseScenario('test.md')).rejects.toThrow('## Steps');
  });

  it('re-throws file read errors', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT: no such file'));
    await expect(parseScenario('missing.md')).rejects.toThrow('ENOENT');
  });
});
