import { useState } from 'react';
import { useStore } from '../store/useStore';

export function useWorkspaceLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const newSession = useStore((s) => s.newSession);

  return {
    settingsOpen,
    libraryOpen,
    openSettings: () => setSettingsOpen(true),
    closeSettings: () => setSettingsOpen(false),
    toggleLibrary: () => setLibraryOpen((open) => !open),
    closeLibrary: () => setLibraryOpen(false),
    newSession,
  };
}
