import consola from 'consola';
import { Block, Context, Environment } from '../core/types';

/**
 * Asserts that a context key contains an expected substring.
 *
 * Reads from context:
 *   context.GLOBAL_CONTEXT_KEY      (string)  — the context key to inspect
 *   context.GLOBAL_EXPECTED_VALUE   (string)  — the substring the value must contain
 *   context[GLOBAL_CONTEXT_KEY]     (any)     — the actual value being checked
 *
 * Writes to context:
 *   (none — read-only assertion block)
 */
export const assertContextValue: Block = {
  name: 'Assert Context Value',
  knowledge: 'Reads GLOBAL_CONTEXT_KEY and GLOBAL_EXPECTED_VALUE from context, then asserts that context[key] contains the expected substring. Use this to verify that a previous block wrote the right value.',

  async run(context: Context, _env: Environment): Promise<Context> {
    const key: string = context.GLOBAL_CONTEXT_KEY;
    const expected: string = context.GLOBAL_EXPECTED_VALUE;

    if (!key) throw new Error('GLOBAL_CONTEXT_KEY is required');
    if (!expected) throw new Error('GLOBAL_EXPECTED_VALUE is required');

    const actual = context[key];
    if (actual === undefined) {
      throw new Error(`context.${key} is not set — did the block that writes it run first?`);
    }

    const actualStr = String(actual);
    if (!actualStr.includes(expected)) {
      throw new Error(`context.${key} = "${actualStr}" does not contain "${expected}"`);
    }

    consola.success(`context.${key} = "${actualStr}" ✓ contains "${expected}"`);
    return context;
  },

  async assert(context: Context, _env: Environment): Promise<void> {
    const key: string = context.GLOBAL_CONTEXT_KEY;
    const expected: string = context.GLOBAL_EXPECTED_VALUE;
    const actual = context[key];
    if (actual === undefined || !String(actual).includes(expected)) {
      throw new Error(`Assert Context Value — context.${key} = "${actual}" does not contain "${expected}"`);
    }
  },
};
