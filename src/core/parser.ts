import { readFile } from 'fs/promises';
import consola from 'consola';
import { ScenarioMetadata, ParsedStep, ParsedVariable } from './types';

interface FrontMatter {
  env: string | null;
  intent: string | null;
}

/**
 * Parse Markdown front-matter to extract global environment and intent.
 * Expects format:
 * ---
 * env: production
 * intent: "User successfully registers and reaches their dashboard"
 * ---
 */
function parseFrontMatter(content: string): FrontMatter {
  const result: FrontMatter = { env: null, intent: null };
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    return result;
  }

  const frontMatter = match[1];

  const envMatch = frontMatter.match(/^env:\s*(.+)$/m);
  if (envMatch) {
    result.env = envMatch[1].trim();
  }

  const intentMatch = frontMatter.match(/^intent:\s*["']?(.+?)["']?\s*$/m);
  if (intentMatch) {
    result.intent = intentMatch[1].trim();
  }

  return result;
}

/**
 * Parse a step line to extract block name and optional environment override.
 * Formats:
 * - "- Generate API Bearer Token" -> { name: "Generate API Bearer Token", envOverride: null }
 * - "- [staging] Create Item API" -> { name: "Create Item API", envOverride: "staging" }
 */
function parseStepLine(line: string): ParsedStep | null {
  const trimmed = line.trim();

  if (!trimmed.startsWith('- ')) {
    return null;
  }

  let stepContent = trimmed.substring(2).trim();
  let envOverride: string | null = null;

  // Check for [env-override] prefix
  const envOverrideRegex = /^\[([^\]]+)\]\s+(.+)$/;
  const match = stepContent.match(envOverrideRegex);

  if (match) {
    envOverride = match[1].trim();
    stepContent = match[2].trim();
  }

  return {
    name: stepContent,
    envOverride,
  };
}

/**
 * Parse a variable line: key=value, key="value", or key='value'
 * Returns [key, value] or null if malformed
 */
function parseVariableLine(line: string): [string, string] | null {
  const equalsIndex = line.indexOf('=');
  if (equalsIndex === -1) {
    return null;
  }

  const key = line.substring(0, equalsIndex).trim();
  let value = line.substring(equalsIndex + 1).trim();

  // Remove quotes if present
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    value = value.substring(1, value.length - 1);
  }

  return [key, value];
}

/**
 * Parse the ## Variables section and extract key=value pairs.
 * Uses similar parsing logic to env-loader for consistency.
 */
function parseVariablesSection(content: string): ParsedVariable[] {
  // Extract content between ## Variables and next ## heading
  // Try to match until next ## heading at start of line
  let match = content.match(/^## Variables[^\n]*\n([\s\S]*?)(?=^## )/m);

  // If no match (might be at end of file), try matching to end of string
  if (!match) {
    match = content.match(/^## Variables[^\n]*\n([\s\S]*)$/m);
  }

  if (!match) {
    return [];
  }

  const variablesContent = match[1];
  const lines = variablesContent.split('\n');
  const variables: ParsedVariable[] = [];
  const seenKeys = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Must start with "- "
    if (!trimmed.startsWith('- ')) {
      continue;
    }

    const content = trimmed.substring(2).trim();

    // Parse key=value (support quotes like env-loader)
    const parsed = parseVariableLine(content);
    if (!parsed) {
      consola.warn(`Malformed variable line (skipping): ${line}`);
      continue;
    }

    const [key, value] = parsed;

    // Check for duplicates
    if (seenKeys.has(key)) {
      consola.warn(`Duplicate variable "${key}" (using first value)`);
      continue;
    }

    seenKeys.add(key);
    variables.push({ key, value });
  }

  return variables;
}

/**
 * Parse the ## Steps section and extract step lines.
 * REQUIRED: Throws error if ## Steps section not found.
 */
function parseStepsSection(content: string): ParsedStep[] {
  // Check if ## Steps heading exists
  const stepsHeadingRegex = /^## Steps\s*$/m;
  if (!stepsHeadingRegex.test(content)) {
    throw new Error('Scenario file must contain a "## Steps" section');
  }

  // Extract content from ## Steps to end of file or next ## heading
  // Try to match until next ## heading at start of line
  let match = content.match(/^## Steps[^\n]*\n([\s\S]*?)(?=^## )/m);

  // If no match (might be at end of file), try matching to end of string
  if (!match) {
    match = content.match(/^## Steps[^\n]*\n([\s\S]*)$/m);
  }

  if (!match) {
    throw new Error('Failed to parse ## Steps section');
  }

  const stepsContent = match[1];
  const lines = stepsContent.split('\n');

  return lines
    .map(parseStepLine)
    .filter((step): step is ParsedStep => step !== null);
}

export async function parseScenario(filePath: string): Promise<ScenarioMetadata> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const { env: globalEnv, intent } = parseFrontMatter(content);

    if (globalEnv) {
      consola.info(`Global environment: ${globalEnv}`);
    }
    if (intent) {
      consola.info(`Scenario intent: ${intent}`);
    } else {
      consola.warn('Scenario has no intent defined — consider adding one for documentation purposes');
    }

    // Parse variables section (optional)
    const variables = parseVariablesSection(content);
    if (variables.length > 0) {
      consola.info(`Found ${variables.length} global variable(s)`);
    }

    // Parse steps section (required)
    const steps = parseStepsSection(content);
    if (steps.length === 0) {
      consola.warn(`No steps found in ## Steps section: ${filePath}`);
    }

    return {
      globalEnv,
      variables,
      steps,
      intent,
    };
  } catch (error) {
    consola.error(`Failed to read scenario file: ${filePath}`, error);
    throw error;
  }
}
