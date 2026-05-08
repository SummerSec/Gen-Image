import type { PromptCard } from './prompts.generated';
import { PROMPT_LIBRARY_MANUAL } from './prompts.manual';

export type { PromptCard };

let allPrompts: PromptCard[] = PROMPT_LIBRARY_MANUAL;
let sourceLoaded = false;
let isLoading = false;

export function getPromptLibrary(): PromptCard[] {
  return allPrompts;
}

export function hasMorePrompts(): boolean {
  return !sourceLoaded;
}

export async function loadMorePrompts(): Promise<PromptCard[]> {
  if (sourceLoaded) return allPrompts;
  if (isLoading) return allPrompts;

  isLoading = true;
  try {
    const mod = await import('./prompts.generated');
    allPrompts = mod.PROMPT_LIBRARY_GENERATED.length > 0
      ? mod.PROMPT_LIBRARY_GENERATED
      : PROMPT_LIBRARY_MANUAL;
    sourceLoaded = true;
    return allPrompts;
  } catch {
    allPrompts = PROMPT_LIBRARY_MANUAL;
    sourceLoaded = true;
    return allPrompts;
  } finally {
    isLoading = false;
  }
}
