import consola from 'consola';
import { parseScenario } from './parser';
import { loadBlocks } from './loader';
import { loadEnvironment } from './env-loader';
import { Context, Environment, ParsedVariable, ScenarioMetadata, RunnerError } from './types';

function normalizeStepName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createInitialContext(variables: ParsedVariable[]): Context {
  const context: Context = {};

  for (const variable of variables) {
    const transformedKey = `GLOBAL_${variable.key
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')}`;

    context[transformedKey] = variable.value;
  }

  return context;
}

export async function runScenario(scenarioOrPath: ScenarioMetadata | string): Promise<ScenarioMetadata> {
  const scenario = typeof scenarioOrPath === 'string'
    ? await parseScenario(scenarioOrPath)
    : scenarioOrPath;

  consola.info(`Found ${scenario.steps.length} step(s) in scenario`);

  const blockRegistry = loadBlocks();
  consola.info(`Loaded ${blockRegistry.size} block(s)`);

  let context: Context = createInitialContext(scenario.variables);
  if (scenario.variables.length > 0) {
    consola.info(`Initialized context with ${scenario.variables.length} global variable(s)`);
  }

  const globalEnv: Environment = await loadEnvironment(
    scenario.globalEnv,
    scenario.variables
  );

  const completedSteps: string[] = [];

  for (const step of scenario.steps) {
    const normalizedStepName = normalizeStepName(step.name);
    const block = blockRegistry.get(normalizedStepName);

    if (!block) {
      throw new Error(`Block not found for step: "${step.name}" (normalized: "${normalizedStepName}")`);
    }

    let blockEnv: Environment = globalEnv;

    if (step.envOverride) {
      try {
        blockEnv = await loadEnvironment(step.envOverride, scenario.variables);
        consola.info(`Using env override "${step.envOverride}" for ${block.name}`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Failed to load env "${step.envOverride}" for "${step.name}": ${message}`
        );
      }
    }

    consola.start(`Running ${block.name}...`);

    try {
      context = await block.run(context, blockEnv);
      await block.assert(context, blockEnv);
      completedSteps.push(block.name);
      consola.success(`Completed ${block.name}`);
    } catch (error) {
      consola.error(`Block "${block.name}" failed:`, error);
      throw new RunnerError(block.name, block.knowledge, error as Error, context, completedSteps);
    }
  }

  if (context.browser) {
    await context.browser.close();
    consola.info('Browser closed');
  }

  consola.success('Scenario completed successfully');
  return scenario;
}
