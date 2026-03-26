# BRAT
### Block Runner for Agentic Testing

A chain-of-command integration test runner where scenarios are Markdown files and blocks are composable TypeScript units. Designed to be read and written by humans and LLMs alike.

## How it works

A **scenario** is a Markdown file that lists named **blocks** in order. Each block is a self-contained unit of work — a browser action, an API call, a database query, or anything else. Blocks pass state to each other through a shared **context** object.

```
scenario.md  →  [Block A]  →  [Block B]  →  [Block C]
                   run()         run()         run()
                   assert()      assert()      assert()
```

Every block implements two methods:

- **`run(context, env) → context`** — performs the operation and returns updated context
- **`assert(context, env)`** — validates the operation completed correctly; this is the unit test

This split means assertions can be holistic: a block can click a button in the UI and its `assert` can verify the database reflects the new state.

Blocks carry a **`knowledge`** field — a plain-text description of business context, quirks, and edge cases relevant to that unit of work. When a scenario fails, the knowledge of the failing block is included in the postmortem.

## Postmortems

When a block fails, the runner writes a postmortem folder under `postmortems/<scenario>-<timestamp>/`:

| File | Always | Browser only |
|------|--------|--------------|
| `summary.md` | ✓ | |
| `ally-tree.yaml` | | ✓ |
| `clickables.json` | | ✓ |

`summary.md` contains the scenario intent, completed steps, failed block, error + stack, and block knowledge. Browser files capture the live page state at the moment of failure. These files are structured to be fed directly to an LLM for failure analysis.

## Prerequisites

- Node.js 23+
- npm

## Quick start

```bash
npm install
npx playwright install chromium
npm run build

# Run the hello-world example
npm run dev -- run scenarios/examples/hello-world.md

# Run the browser passing example
npm run dev -- run scenarios/examples/browser-passing.md

# Run a failing scenario to see a postmortem
npm run dev -- run scenarios/examples/browser-failure.md
```

## Writing a scenario

```markdown
---
intent: "User navigates to the login page and signs in successfully"
env: staging
---

# Login Flow

## Variables

- url=https://staging.example.com
- username=testuser

## Steps

- Open Page
- Fill Login Form
- Assert Dashboard Visible
```

- `intent` — describes what the scenario is trying to achieve; included in the postmortem
- `env` — loads `envs/<name>.env` for all blocks; can be overridden per-step with `[env-name]`
- `## Variables` — key=value pairs injected into context as `GLOBAL_<KEY>`
- `## Steps` — required; each name must match a registered block (case-insensitive)

## Writing a block

```typescript
import { Block, Context, Environment } from '../core/types';

/**
 * Reads from context:
 *   context.page          (Page)    — required, set by "Open Page"
 *   context.GLOBAL_URL    (string)  — target URL
 *
 * Writes to context:
 *   context.responseStatus  (number)  — HTTP status of the navigation
 */
export const myBlock: Block = {
  name: 'My Block',
  knowledge: 'Describe any business quirks, timing issues, or edge cases here. This text is included in postmortems when this block fails.',

  async run(context: Context, env: Environment): Promise<Context> {
    // perform the operation
    return { ...context, responseStatus: 200 };
  },

  async assert(context: Context, env: Environment): Promise<void> {
    if (context.responseStatus !== 200) {
      throw new Error(`Expected status 200, got ${context.responseStatus}`);
    }
  },
};
```

Register it in `src/blocks/index.ts`:

```typescript
import { myBlock } from './myBlock';

export const blocks: Block[] = [
  // ...existing blocks
  myBlock,
];
```

## Environment files

Create `.env` files in `envs/` — one per environment:

```
envs/
  staging.env
  production.env
  local.env
```

Format: `KEY=value` or `KEY="value"`. Use `{{variable-name}}` placeholders to substitute scenario variables:

```env
API_URL=https://{{url}}-api.example.com
```

## Project structure

```
src/
  blocks/     — block implementations
  core/       — runner, parser, loader, env-loader, postmortem
scenarios/
  examples/   — reference scenarios; copy and adapt these
  verification/ — scenario-specific checks tied to a feature or PR
postmortems/  — written on failure, gitignored
envs/         — environment files, gitignored
```

## Contributing

1. Fork the repo and create a branch
2. Add blocks under `src/blocks/` — each block must implement both `run` and `assert`
3. Add or update a scenario under `scenarios/examples/` that exercises the block
4. Run `npm run build` to confirm no type errors
5. Open a pull request

## License

ISC
