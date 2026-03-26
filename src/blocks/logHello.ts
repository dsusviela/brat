import consola from 'consola';
import { Block, Context, Environment } from '../core/types';

/**
 * Reads from context:
 *   context.GLOBAL_NAME  (string, optional)  — who to greet; defaults to "World"
 *
 * Writes to context:
 *   context.greeted  (boolean)  — set to true after the greeting is logged
 */
export const logHello: Block = {
  name: 'Log Hello',
  knowledge: 'A minimal example block. Reads an optional "name" value from context and logs a greeting. Use this as a starting point when adding new blocks.',

  async run(context: Context, _env: Environment): Promise<Context> {
    const name: string = context.GLOBAL_NAME ?? 'World';
    consola.success(`Hello, ${name}!`);
    return { ...context, greeted: true };
  },

  async assert(context: Context, _env: Environment): Promise<void> {
    if (!context.greeted) {
      throw new Error('Expected greeted to be true after Log Hello ran');
    }
  },
};
