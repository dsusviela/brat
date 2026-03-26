export type Context = Record<string, any>;

export type Environment = Record<string, string>;

export interface ParsedVariable {
  key: string;    // "review-env"
  value: string;  // "real-server-1234"
}

export interface ScenarioMetadata {
  globalEnv: string | null;  // e.g., "production" or null
  variables: ParsedVariable[];
  steps: ParsedStep[];
  intent: string | null;
}

export interface ParsedStep {
  name: string;              // "Generate API Bearer Token"
  envOverride: string | null; // "staging" or null
}

export interface Block {
  name: string;
  knowledge?: string;
  run(context: Context, env: Environment): Promise<Context>;
  assert(context: Context, env: Environment): Promise<void>;
}

export class RunnerError extends Error {
  public readonly failedBlockName: string;
  public readonly knowledge: string | undefined;
  public readonly context: Context;
  public readonly completedSteps: string[];
  public readonly originalError: Error;

  constructor(
    failedBlockName: string,
    knowledge: string | undefined,
    originalError: Error,
    context: Context,
    completedSteps: string[]
  ) {
    super(`Block "${failedBlockName}" failed: ${originalError.message}`);
    this.name = 'RunnerError';
    this.failedBlockName = failedBlockName;
    this.knowledge = knowledge;
    this.originalError = originalError;
    this.context = context;
    this.completedSteps = completedSteps;
  }
}
