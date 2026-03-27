import { Page } from 'playwright';
import { Context } from './types';

export function requirePage(context: Context): Page {
  const page: Page = context.page;
  if (!page) throw new Error('No page in context — run "Open Page" first');
  return page;
}
