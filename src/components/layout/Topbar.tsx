import { useStore } from '../../store/useStore';

export default function Topbar({ onSettings, onNewSession, onToggleLib, libOpen }: { onSettings?: () => void; onNewSession?: () => void; onToggleLib?: () => void; libOpen?: boolean }) {
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);

  return (
    <header className="h-16 bg-[#101113] text-white flex items-center justify-between px-3 lg:px-5 gap-2 flex-shrink-0 border-b border-white/8">
      <div className="flex items-center gap-2 lg:gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#D6A85D] flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg className="w-4 h-4 text-[#16110A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.7 4.7L18 9.4l-4.3 1.7L12 16l-1.7-4.9L6 9.4l4.3-1.7L12 3z" />
            <path d="M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14z" />
            <path d="M19 14l.6 1.7 1.4.5-1.4.5L19 18l-.6-1.3-1.4-.5 1.4-.5L19 14z" />
          </svg>
        </div>
        <div className="hidden sm:flex flex-col leading-none">
          <span className="font-semibold text-[15px] text-white whitespace-nowrap">Image Studio</span>
          <span className="mt-1 text-[10px] text-[#D6A85D]/75 whitespace-nowrap">AI 图像工作台</span>
        </div>
        <div className="hidden md:flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-[#D6A85D]" title={`当前版本：v${__APP_VERSION__}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#D6A85D]" />
          <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>v{__APP_VERSION__}</span>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-1 lg:mx-5">
        <div className="flex items-center bg-white/6 border border-white/10 rounded-xl h-10 px-3 gap-2 transition-colors focus-within:border-[#D6A85D]/45 focus-within:bg-white/9">
          <svg className="w-4 h-4 text-[#D6A85D]/60 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" placeholder="搜索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm text-white placeholder-white/35 w-full min-w-0" />
        </div>
      </div>

      <div className="flex items-center gap-1 lg:gap-3">
        <a href="https://github.com/SummerSec/Gen-Image" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 hover:bg-white/10 transition-colors" title="GitHub">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" /></svg>
        </a>
        <button onClick={onSettings} className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 hover:bg-white/10 transition-colors" title="API 设置">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
        </button>
        <button onClick={onNewSession} className="h-9 px-3 rounded-xl border border-white/10 bg-white/5 text-white/75 text-sm font-medium flex items-center gap-1.5 hover:border-white/20 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap" title="清空当前对话，开始新会话">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          <span className="hidden sm:inline">新建会话</span>
        </button>
        <button onClick={onToggleLib} className={`h-9 px-3 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${libOpen ? 'bg-[#D6A85D] text-[#16110A] hover:bg-[#E7BF7A] shadow-sm' : 'border border-white/10 bg-white/5 text-white/75 hover:border-white/20 hover:bg-white/10 hover:text-white'}`} title="提示词库 / 历史">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          <span className="hidden sm:inline">素材栏</span>
        </button>
      </div>
    </header>
  );
}
