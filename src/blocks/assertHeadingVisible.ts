import consola from 'consola';
import { Block, Context, Environment } from '../core/types';
import { requirePage } from '../core/context';

export const assertHeadingVisible: Block = {
  name: 'Assert Heading Visible',
  knowledge: 'Asserts that a heading (h1–h6) whose text contains context.GLOBAL_HEADING_TEXT is visible on the current page. Fails if no matching heading appears within 10s.',

  async run(context: Context, _env: Environment): Promise<Context> {
    const page = requirePage(context);

    const text: string = context.GLOBAL_HEADING_TEXT;
    if (!text) throw new Error('GLOBAL_HEADING_TEXT is required — set it via the scenario variables section');

    consola.info(`Asserting heading visible: "${text}"`);
    await page.getByRole('heading', { name: text, exact: false }).first().waitFor({ state: 'visible', timeout: 10_000 });
    consola.success(`Heading visible: "${text}"`);

    return context;
  },

  async assert(context: Context, _env: Environment): Promise<void> {
    const page = requirePage(context);
    const text: string = context.GLOBAL_HEADING_TEXT;
    const visible = await page.getByRole('heading', { name: text, exact: false }).first().isVisible();
    if (!visible) throw new Error(`Heading "${text}" is no longer visible after Assert Heading Visible`);
  },
};
