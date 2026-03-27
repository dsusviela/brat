import { Block, Context, Environment } from '../core/types';
import { requirePage } from '../core/context';

export const clickNonExistentButton: Block = {
  name: 'Click Non Existent Button',
  knowledge: 'Tries to click a button labeled "Launch Rocket" which does not exist on any known page. Always fails — used to verify that the postmortem system captures live browser state (ally tree, clickables) correctly.',

  async run(context: Context, _env: Environment): Promise<Context> {
    const page = requirePage(context);

    await page.locator('button:has-text("Launch Rocket")').click({ timeout: 4_000 });
    return context;
  },

  async assert(_context: Context, _env: Environment): Promise<void> {
    // Never reached — run() always times out before assert is called
  },
};
