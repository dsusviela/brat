import { Page } from 'playwright';
import consola from 'consola';
import { Block, Context, Environment } from '../core/types';

/**
 * Reads the current page <title> and URL, writes both into context.
 *
 * Reads from context:
 *   context.page  (Page)  — required, set by "Open Page"
 *
 * Writes to context:
 *   context.pageTitle  (string)  — the document title at the time of this block
 *   context.pageUrl    (string)  — the current page URL at the time of this block
 */
export const readPageTitle: Block = {
  name: 'Read Page Title',
  knowledge: 'Captures the current document.title and URL, storing them as context.pageTitle and context.pageUrl. Useful for asserting navigation landed on the right page.',

  async run(context: Context, _env: Environment): Promise<Context> {
    const page: Page = context.page;
    if (!page) throw new Error('No page in context — run "Open Page" first');

    const title = await page.title();
    const url = page.url();
    consola.info(`Page title: "${title}" — URL: ${url}`);

    return { ...context, pageTitle: title, pageUrl: url };
  },

  async assert(context: Context, _env: Environment): Promise<void> {
    if (!context.pageTitle && context.pageTitle !== '') throw new Error('pageTitle not set in context after Read Page Title');
    if (!context.pageUrl) throw new Error('pageUrl not set in context after Read Page Title');
  },
};
