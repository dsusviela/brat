import { Block, Context, Environment } from '../core/types';

export const alwaysFails: Block = {
  name: 'Always Fails',
  knowledge: 'This block always throws. It exists to demonstrate the postmortem system — run it intentionally to verify that summary.md is written correctly.',

  async run(_context: Context, _env: Environment): Promise<Context> {
    throw new Error('This block is designed to fail — check postmortems/ for the report');
  },

  async assert(_context: Context, _env: Environment): Promise<void> {
    // Never reached — run() always throws before assert is called
  },
};
