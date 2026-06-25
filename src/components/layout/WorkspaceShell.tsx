import Topbar from './Topbar';
import Conversation from '../chat/Conversation';
import RightPanel from './RightPanel';
import CanvasStage from '../canvas/CanvasStage';

interface Props {
  libraryOpen: boolean;
  onSettings: () => void;
  onNewSession: () => void;
  onToggleLibrary: () => void;
  onCloseLibrary: () => void;
}

export default function WorkspaceShell({ libraryOpen, onSettings, onNewSession, onToggleLibrary, onCloseLibrary }: Props) {
  return (
    <>
      <Topbar
        onSettings={onSettings}
        onNewSession={onNewSession}
        onToggleLib={onToggleLibrary}
        libOpen={libraryOpen}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden bg-[#101113]">
        <div className="hidden h-full w-[328px] flex-shrink-0 border-r border-white/8 bg-[#161719] lg:block xl:w-[372px]">
          <RightPanel />
        </div>
        <div className="hidden min-w-0 flex-1 lg:flex">
          <CanvasStage />
        </div>
        <Conversation />
        {libraryOpen && (
          <div className="absolute inset-y-0 left-0 z-30 w-full max-w-[430px] animate-[panel-slide_220ms_ease-out] border-r border-white/10 bg-[#161719]/96 shadow-[40px_0_120px_rgba(0,0,0,0.46)] backdrop-blur-xl lg:hidden">
            <RightPanel onClose={onCloseLibrary} />
          </div>
        )}
      </div>
    </>
  );
}
