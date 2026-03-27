import consola from 'consola';
import { Block, Context, Environment } from '../core/types';
import { requirePage } from '../core/context';

export const clickLink: Block = {
  name: 'Click Link',
  knowledge: 'Clicks the first visible link whose text matches context.GLOBAL_LINK_TEXT. Waits up to 10s for the page to settle after the click.',

  async run(context: Context, _env: Environment): Promise<Context> {
    const page = requirePage(context);

    const text: string = context.GLOBAL_LINK_TEXT;
    if (!text) throw new Error('GLOBAL_LINK_TEXT is required — set it via the scenario variables section');

    consola.info(`Clicking link: "${text}"`);
    await page.getByRole('link', { name: text, exact: false }).first().click({ timeout: 10_000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 15_000 });
    consola.success(`Navigated via link: "${text}"`);

    return context;
  },

  async assert(context: Context, _env: Environment): Promise<void> {
    const page = requirePage(context);
    const url = page.url();
    if (!url || url === 'about:blank') throw new Error('URL is blank after Click Link — navigation did not occur');
  },
};
