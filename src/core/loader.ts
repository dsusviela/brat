import { Block } from './types';
import { blocks } from '../blocks/index';

function normalizeBlockName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function loadBlocks(): Map<string, Block> {
  const registry = new Map<string, Block>();

  for (const block of blocks) {
    const normalizedName = normalizeBlockName(block.name);
    registry.set(normalizedName, block);
  }

  return registry;
}
