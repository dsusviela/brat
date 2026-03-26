import { Page } from 'playwright';
import consola from 'consola';
import { Block, Context, Environment } from '../core/types';

export const clickLink: Block = {
  name: 'Click Link',
  knowledge: 'Clicks the first visible link whose text matches context.GLOBAL_LINK_TEXT. Waits up to 10s for the page to settle after the click.',

  async run(context: Context, _env: Environment): Promise<Context> {
    const page: Page = context.page;
    if (!page) throw new Error('No page in context — run "Open Page" first');

    const text: string = context.GLOBAL_LINK_TEXT;
    if (!text) throw new Error('GLOBAL_LINK_TEXT is required — set it via the scenario variables section');

    consola.info(`Clicking link: "${text}"`);
    await page.getByRole('link', { name: text, exact: false }).first().click({ timeout: 10_000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 15_000 });
    consola.success(`Navigated via link: "${text}"`);

    return context;
  },

  async assert(context: Context, _env: Environment): Promise<void> {
    const page: Page = context.page;
    if (!page) throw new Error('page not found in context');
    const url = page.url();
    if (!url || url === 'about:blank') throw new Error('URL is blank after Click Link — navigation did not occur');
  },
};
