import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs/promises');

import { readFile } from 'fs/promises';
import { parseEnvLine, loadEnvFile, loadEnvironment } from './env-loader';

const mockReadFile = vi.mocked(readFile);

describe('parseEnvLine', () => {
  it('returns null for empty string', () => {
    expect(parseEnvLine('')).toBeNull();
  });

  it('returns null for whitespace-only line', () => {
    expect(parseEnvLine('   ')).toBeNull();
  });

  it('returns null for comment line', () => {
    expect(parseEnvLine('# this is a comment')).toBeNull();
  });

  it('returns null for line without equals sign', () => {
    expect(parseEnvLine('MISSING_EQUALS')).toBeNull();
  });

  it('parses plain key=value', () => {
    expect(parseEnvLine('KEY=value')).toEqual(['KEY', 'value']);
  });

  it('parses double-quoted value', () => {
    expect(parseEnvLine('KEY="hello world"')).toEqual(['KEY', 'hello world']);
  });

  it('parses single-quoted value', () => {
    expect(parseEnvLine("KEY='hello world'")).toEqual(['KEY', 'hello world']);
  });

  it('handles value containing equals sign', () => {
    expect(parseEnvLine('URL=https://example.com?foo=bar')).toEqual([
      'URL',
      'https://example.com?foo=bar',
    ]);
  });

  it('trims whitespace around key and value', () => {
    expect(parseEnvLine('  KEY  =  value  ')).toEqual(['KEY', 'value']);
  });
});

describe('loadEnvFile', () => {
  beforeEach(() => {
    mockReadFile.mockReset();
  });

  it('parses env file into key/value object', async () => {
    mockReadFile.mockResolvedValue('KEY=value\nOTHER=hello\n' as any);
    const env = await loadEnvFile('test');
    expect(env).toEqual({ KEY: 'value', OTHER: 'hello' });
  });

  it('skips comment lines and empty lines', async () => {
    mockReadFile.mockResolvedValue('# comment\n\nKEY=value\n' as any);
    const env = await loadEnvFile('test');
    expect(Object.keys(env)).toEqual(['KEY']);
  });

  it('substitutes {{variable}} placeholders', async () => {
    mockReadFile.mockResolvedValue('URL=https://{{env}}.example.com\n' as any);
    const env = await loadEnvFile('test', [{ key: 'env', value: 'staging' }]);
    expect(env.URL).toBe('https://staging.example.com');
  });

  it('substitutes multiple placeholders in the same value', async () => {
    mockReadFile.mockResolvedValue('URL=https://{{host}}/{{path}}\n' as any);
    const env = await loadEnvFile('test', [
      { key: 'host', value: 'api.example.com' },
      { key: 'path', value: 'v2' },
    ]);
    expect(env.URL).toBe('https://api.example.com/v2');
  });

  it('throws "Environment file not found" for ENOENT', async () => {
    const err = Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
    mockReadFile.mockRejectedValue(err);
    await expect(loadEnvFile('missing')).rejects.toThrow('Environment file not found');
  });

  it('wraps other read errors with context', async () => {
    mockReadFile.mockRejectedValue(new Error('permission denied'));
    await expect(loadEnvFile('bad')).rejects.toThrow('Failed to parse environment file');
  });
});

describe('loadEnvironment', () => {
  beforeEach(() => {
    mockReadFile.mockReset();
  });

  it('returns empty object when envName is null', async () => {
    const env = await loadEnvironment(null, []);
    expect(env).toEqual({});
    expect(mockReadFile).not.toHaveBeenCalled();
  });

  it('delegates to loadEnvFile when envName is provided', async () => {
    mockReadFile.mockResolvedValue('X=1\n' as any);
    const env = await loadEnvironment('prod', []);
    expect(env).toEqual({ X: '1' });
  });
});
