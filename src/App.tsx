import { useEffect } from 'react';
import WorkspaceShell from './components/layout/WorkspaceShell';
import SettingsModal from './components/settings/SettingsModal';
import { useStore } from './store/useStore';
import { useWorkspaceLayout } from './hooks/useWorkspaceLayout';

export default function App() {
  const hydrateHistory = useStore((s) => s.hydrateHistory);
  const workspace = useWorkspaceLayout();

  useEffect(() => {
    void hydrateHistory();
  }, [hydrateHistory]);

  return (
    <div className="h-screen flex flex-col bg-[#101113] overflow-hidden">
      <WorkspaceShell
        libraryOpen={workspace.libraryOpen}
        onSettings={workspace.openSettings}
        onNewSession={workspace.newSession}
        onToggleLibrary={workspace.toggleLibrary}
        onCloseLibrary={workspace.closeLibrary}
      />

      <SettingsModal open={workspace.settingsOpen} onClose={workspace.closeSettings} />
    </div>
  );
}
