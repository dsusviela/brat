import { readFile } from 'fs/promises';
import { resolve } from 'path';
import consola from 'consola';
import { Environment, ParsedVariable } from './types';

/**
 * Parse a single line from an env file.
 * Supports formats: key=value, key='value', key="value"
 * Returns [key, value] tuple or null if line should be skipped
 */
export function parseEnvLine(line: string): [string, string] | null {
  const trimmed = line.trim();

  // Skip empty lines and comments
  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }

  // Find the first equals sign
  const equalsIndex = trimmed.indexOf('=');
  if (equalsIndex === -1) {
    return null; // Malformed line, skip silently
  }

  const key = trimmed.substring(0, equalsIndex).trim();
  let value = trimmed.substring(equalsIndex + 1).trim();

  // Remove surrounding quotes if present
  if ((value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))) {
    value = value.substring(1, value.length - 1);
  }

  return [key, value];
}

/**
 * Substitute {{variable-name}} placeholders with variable values.
 * Example: "https://{{review-env}}-web.com" with review-env=abc → "https://abc-web.com"
 */
function substituteVariables(value: string, variables: ParsedVariable[]): string {
  let result = value;

  // Replace all {{key}} with corresponding variable value
  for (const variable of variables) {
    const placeholder = `{{${variable.key}}}`;
    result = result.split(placeholder).join(variable.value);
  }

  return result;
}

/**
 * Load environment file and perform variable substitution.
 * Substitutes {{variable-name}} placeholders with variable values.
 *
 * @param envName - Name of environment file (e.g., "local")
 * @param variables - Variables for substitution
 * @returns Environment object with substituted values
 */
export async function loadEnvFile(
  envName: string,
  variables: ParsedVariable[] = []
): Promise<Environment> {
  const envPath = resolve(process.cwd(), 'envs', `${envName}.env`);

  try {
    const content = await readFile(envPath, 'utf-8');
    const lines = content.split('\n');
    const env: Environment = {};
    const seenKeys = new Set<string>();

    for (const line of lines) {
      const parsed = parseEnvLine(line);
      if (parsed === null) {
        continue;
      }

      const [key, value] = parsed;

      // Warn on duplicate keys
      if (seenKeys.has(key)) {
        consola.warn(`Duplicate key "${key}" in ${envPath}, using latest value`);
      }

      seenKeys.add(key);

      // Perform variable substitution
      const substitutedValue = substituteVariables(value, variables);
      env[key] = substitutedValue;
    }

    consola.info(`Loaded environment "${envName}" with ${Object.keys(env).length} variable(s)`);
    return env;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`Environment file not found: ${envPath}`);
    }
    throw new Error(`Failed to parse environment file ${envPath}: ${error.message}`);
  }
}

/**
 * Load environment file if envName is provided, otherwise return empty object.
 * Performs variable substitution using provided variables.
 */
export async function loadEnvironment(
  envName: string | null,
  variables: ParsedVariable[] = []
): Promise<Environment> {
  if (envName === null) {
    return {};
  }

  return loadEnvFile(envName, variables);
}
