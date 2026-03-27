import { describe, it, expect } from 'vitest';
import { requirePage } from './context';

describe('requirePage', () => {
  it('returns the page when present in context', () => {
    const fakePage = { url: () => 'https://example.com' } as any;
    expect(requirePage({ page: fakePage })).toBe(fakePage);
  });

  it('throws when page is undefined', () => {
    expect(() => requirePage({})).toThrow('No page in context — run "Open Page" first');
  });

  it('throws when page is null', () => {
    expect(() => requirePage({ page: null })).toThrow('No page in context — run "Open Page" first');
  });
});
