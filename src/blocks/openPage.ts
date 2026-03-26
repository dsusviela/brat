import { chromium } from 'playwright';
import consola from 'consola';
import { Block, Context, Environment } from '../core/types';

export const openPage: Block = {
  name: 'Open Page',
  knowledge: 'Launches a Chromium browser and navigates to the URL in context.GLOBAL_URL. Stores browser and page in context for subsequent blocks.',

  async run(context: Context, _env: Environment): Promise<Context> {
    const url: string = context.GLOBAL_URL;
    if (!url) throw new Error('GLOBAL_URL is required — set it via the scenario variables section');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    consola.success(`Opened ${url}`);
    return { ...context, browser, page };
  },

  async assert(context: Context, _env: Environment): Promise<void> {
    if (!context.browser) throw new Error('browser not found in context after Open Page');
    if (!context.page) throw new Error('page not found in context after Open Page');
    const url: string = await context.page.url();
    if (!url || url === 'about:blank') throw new Error(`page URL is blank after Open Page — navigation may have failed`);
  },
};
