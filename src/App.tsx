import { useEffect, useState } from 'react';
import Topbar from './components/layout/Topbar';
import Conversation from './components/chat/Conversation';
import RightPanel from './components/layout/RightPanel';
import SettingsModal from './components/settings/SettingsModal';
import { useStore } from './store/useStore';

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [libOpen, setLibOpen] = useState(true);
  const hydrateHistory = useStore((s) => s.hydrateHistory);
  const newSession = useStore((s) => s.newSession);

  useEffect(() => {
    void hydrateHistory();
  }, [hydrateHistory]);

  return (
    <div className="h-screen flex flex-col bg-[#F7F8FA] overflow-hidden">
      <Topbar
        onSettings={() => setSettingsOpen(true)}
        onNewSession={newSession}
        onToggleLib={() => setLibOpen((o) => !o)}
        libOpen={libOpen}
      />

      <div className="flex-1 flex min-h-0 relative">
        <Conversation />
        {libOpen && (
          <div className="absolute inset-0 z-30 lg:static lg:z-auto lg:w-[340px] xl:w-[380px] lg:flex-shrink-0">
            <RightPanel onClose={() => setLibOpen(false)} />
          </div>
        )}
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
