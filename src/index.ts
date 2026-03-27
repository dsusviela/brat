#!/usr/bin/env node

import { Command } from 'commander';
import consola from 'consola';
import { parseScenario } from './core/parser';
import { runScenario } from './core/runner';
import { writePostmortem } from './core/postmortem';
import { RunnerError, ScenarioMetadata } from './core/types';

const program = new Command();

program
  .name('brat')
  .description('Modular QA testing workflow engine')
  .version('1.0.0');

program
  .command('run <scenario>')
  .description('Run a test scenario from a Markdown file')
  .action(async (scenarioPath: string) => {
    let scenario: ScenarioMetadata | null = null;

    try {
      scenario = await parseScenario(scenarioPath);
      await runScenario(scenario);
    } catch (error) {
      if (error instanceof RunnerError && scenario) {
        await writePostmortem(error, scenario, scenarioPath).catch(() => {});
        await error.context?.browser?.close().catch(() => {});
      }
      consola.error('Scenario failed:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse(process.argv);
