import type { PromptCard } from './prompts.generated';
import { PROMPT_LIBRARY_MANUAL } from './prompts.manual';

export type { PromptCard };

let cachedGenerated: PromptCard[] | null = null;
let isLoading = false;

export function getPromptLibrary(): PromptCard[] {
  return cachedGenerated ?? PROMPT_LIBRARY_MANUAL;
}

export function hasMorePrompts(): boolean {
  return cachedGenerated === null;
}

export async function loadMorePrompts(): Promise<PromptCard[]> {
  if (cachedGenerated) return cachedGenerated;
  if (isLoading) return PROMPT_LIBRARY_MANUAL;

  isLoading = true;
  try {
    const mod = await import('./prompts.generated');
    cachedGenerated = mod.PROMPT_LIBRARY_GENERATED.length > 0
      ? mod.PROMPT_LIBRARY_GENERATED
      : PROMPT_LIBRARY_MANUAL;
    return cachedGenerated;
  } catch {
    cachedGenerated = PROMPT_LIBRARY_MANUAL;
    return cachedGenerated;
  } finally {
    isLoading = false;
  }
}
