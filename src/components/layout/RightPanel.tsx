import { useStore } from '../../store/useStore';
import { TABS } from '../../data/options';
import { MagnifyingGlassIcon } from '../common/Icons';
import { usePromptLibrary } from '../../hooks/usePromptLibrary';
import PromptLibraryPanel from './PromptLibraryPanel';

export default function RightPanel({ onClose }: { onClose?: () => void }) {
  const { prompts, totalCount, hasMoreCurrent, isSourceLoading, sentinelRef } = usePromptLibrary();
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);

  return (
    <aside className="w-full h-full bg-[#161719] border-l border-white/8 flex flex-col overflow-hidden">
      <div className="border-b border-white/8 bg-[#161719]/95 px-5 pt-4 pb-0 backdrop-blur">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D6A85D]">01 · Prompt</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-white">选择提示词</h2>
            <p className="mt-1 text-xs leading-5 text-[#A7A29A]">点选模板后会填入右侧会话输入框。</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-[#A7A29A] hover:text-white hover:border-white/20" title="收起">×</button>
          )}
        </div>

        <div className="flex items-center bg-white/6 border border-white/10 rounded-xl h-10 px-3 gap-2 mb-3 transition-colors focus-within:border-[#D6A85D]/45 focus-within:bg-white/8">
          <MagnifyingGlassIcon className="w-4 h-4 text-[#A7A29A] flex-shrink-0" />
          <input
            type="text"
            placeholder="搜索提示词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-white placeholder-[#77716A] w-full min-w-0"
          />
        </div>

        <div className="relative pb-3">
          <div className="flex gap-1 overflow-x-auto horizontal-scrollbar pr-8 pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-7 px-3 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === tab.id ? 'bg-white text-[#161719]' : 'text-[#A7A29A] hover:text-white hover:bg-white/7'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#161719] to-transparent" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        <PromptLibraryPanel prompts={prompts} totalCount={totalCount} hasMoreCurrent={hasMoreCurrent} isSourceLoading={isSourceLoading} sentinelRef={sentinelRef} />
      </div>
    </aside>
  );
}
