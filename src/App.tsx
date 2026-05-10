import { useState } from 'react';
import Topbar from './components/layout/Topbar';
import LeftPanel from './components/layout/LeftPanel';
import CanvasArea from './components/layout/CanvasArea';
import RightPanel from './components/layout/RightPanel';
import SettingsModal from './components/settings/SettingsModal';

export default function App() {
  const [mobilePanel, setMobilePanel] = useState<'none' | 'left' | 'right'>('none');
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#F8F9FA] overflow-hidden">
      <Topbar
        onSettings={() => setSettingsOpen(true)}
      />

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-1 min-h-0">
        <LeftPanel />
        <CanvasArea />
        <RightPanel />
      </div>

      {/* Mobile Layout */}
      <div className="flex lg:hidden flex-col flex-1 min-h-0">
        {mobilePanel === 'left' ? (
          <LeftPanel />
        ) : mobilePanel === 'right' ? (
          <RightPanel />
        ) : (
          <CanvasArea />
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden flex items-center justify-around h-14 bg-white border-t border-[#E5E7EB] flex-shrink-0">
        <button
          onClick={() => setMobilePanel(mobilePanel === 'left' ? 'none' : 'left')}
          className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
            mobilePanel === 'left' ? 'text-[#171717]' : 'text-[#9CA3AF]'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          提示词
        </button>
        <button
          onClick={() => setMobilePanel('none')}
          className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
            mobilePanel === 'none' ? 'text-[#171717]' : 'text-[#9CA3AF]'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          画布
        </button>
        <button
          onClick={() => setMobilePanel(mobilePanel === 'right' ? 'none' : 'right')}
          className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
            mobilePanel === 'right' ? 'text-[#171717]' : 'text-[#9CA3AF]'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          图库
        </button>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
