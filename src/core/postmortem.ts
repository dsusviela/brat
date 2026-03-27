import { mkdir, writeFile } from 'fs/promises';
import { resolve, basename } from 'path';
import consola from 'consola';
import { Page } from 'playwright';
import { RunnerError, ScenarioMetadata } from './types';

const POSTMORTEMS_DIR = resolve(process.cwd(), 'postmortems');

async function captureAllyTree(page: Page): Promise<string> {
  return page.locator('body').ariaSnapshot();
}

async function captureClickables(page: Page): Promise<object[]> {
  return page.evaluate(`(() => {
    const results = [];
    const sel = 'button, a[href], input, select, textarea, [role="button"], [role="link"]';
    document.querySelectorAll(sel).forEach(el => {
      if (el.offsetParent === null) return;
      results.push({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().slice(0, 120),
        role: el.getAttribute('role') || undefined,
        id: el.id || undefined,
        href: el.href || undefined,
        type: el.type || undefined,
        disabled: el.disabled || undefined,
        ariaLabel: el.getAttribute('aria-label') || undefined,
      });
    });
    return results;
  })()`);
}

function buildSummary(
  error: RunnerError,
  scenario: ScenarioMetadata,
  scenarioName: string
): string {
  const lines: string[] = [
    `# Postmortem: ${scenarioName}`,
    '',
    `**Date:** ${new Date().toISOString()}`,
    `**Intent:** ${scenario.intent ?? '_not specified_'}`,
    `**Failed Block:** ${error.failedBlockName}`,
    '',
    '## Completed Steps',
  ];

  if (error.completedSteps.length > 0) {
    error.completedSteps.forEach(s => lines.push(`- ${s}`));
  } else {
    lines.push('_none_');
  }

  lines.push('', '## Error', '```', error.originalError.message);
  if (error.originalError.stack) {
    lines.push('', error.originalError.stack);
  }
  lines.push('```');

  if (error.knowledge) {
    lines.push('', '## Block Knowledge', '', error.knowledge);
  }

  return lines.join('\n');
}

export async function writePostmortem(
  error: RunnerError,
  scenario: ScenarioMetadata,
  scenarioPath: string
): Promise<void> {
  const scenarioName = basename(scenarioPath, '.md');
  const folderPath = resolve(POSTMORTEMS_DIR, `${scenarioName}-${Date.now()}`);

  await mkdir(folderPath, { recursive: true });

  await writeFile(
    resolve(folderPath, 'summary.md'),
    buildSummary(error, scenario, scenarioName),
    'utf-8'
  );

  const page = error.context?.page;
  if (page) {
    try {
      const tree = await captureAllyTree(page);
      await writeFile(resolve(folderPath, 'ally-tree.yaml'), tree, 'utf-8');
    } catch {
      consola.warn('Postmortem: could not capture accessibility tree');
    }

    try {
      const clickables = await captureClickables(page);
      await writeFile(resolve(folderPath, 'clickables.json'), JSON.stringify(clickables, null, 2), 'utf-8');
    } catch {
      consola.warn('Postmortem: could not capture clickables');
    }
  }

  consola.info(`Postmortem written to ${folderPath}`);
}
