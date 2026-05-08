import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { getPromptLibrary, hasMorePrompts, loadMorePrompts } from '../../data/prompts';
import { TABS } from '../../data/options';
import { MagnifyingGlassIcon } from '../common/Icons';

const PAGE_SIZE = 48;

export default function RightPanel() {
  const [isSourceLoading, setIsSourceLoading] = useState(false);
  const [visibleCountByKey, setVisibleCountByKey] = useState<Record<string, number>>({});
  const [tick, setTick] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const setPrompt = useStore((s) => s.setPrompt);
  const setGeneratedImage = useStore((s) => s.setGeneratedImage);
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const paginationKey = normalizedQuery ? `${activeTab}::${normalizedQuery}` : activeTab;

  const filteredAllPrompts = useMemo(() => {
    let list = getPromptLibrary();
    if (activeTab !== 'all') {
      list = list.filter((p) => p.category === activeTab);
    }
    if (normalizedQuery) {
      list = list.filter(
        (p) => p.title.toLowerCase().includes(normalizedQuery) || p.prompt.toLowerCase().includes(normalizedQuery)
      );
    }
    return list;
  }, [activeTab, normalizedQuery, tick]);

  const visibleLimit = visibleCountByKey[paginationKey] ?? PAGE_SIZE;

  const filteredPrompts = useMemo(
    () => filteredAllPrompts.slice(0, visibleLimit),
    [filteredAllPrompts, visibleLimit],
  );

  const hasMoreCurrent = filteredPrompts.length < filteredAllPrompts.length;

  const doLoadSource = useCallback(async () => {
    if (!hasMorePrompts() || isSourceLoading) return;
    setIsSourceLoading(true);
    await loadMorePrompts();
    setTick((t) => t + 1);
    setIsSourceLoading(false);
  }, [isSourceLoading]);

  const doLoadMore = useCallback(() => {
    if (!hasMoreCurrent || isSourceLoading) return;
    setVisibleCountByKey((prev) => ({
      ...prev,
      [paginationKey]: (prev[paginationKey] ?? PAGE_SIZE) + PAGE_SIZE,
    }));
  }, [hasMoreCurrent, isSourceLoading, paginationKey]);

  useEffect(() => {
    void doLoadSource();
  }, [doLoadSource]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMoreCurrent) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) doLoadMore(); },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [doLoadMore, hasMoreCurrent, filteredPrompts.length]);

  const totalCount = filteredAllPrompts.length;

  return (
    <aside className="w-full lg:w-[320px] xl:w-[360px] bg-white border-l border-[#E5E7EB] flex flex-col flex-shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-[#737373]">提示词库</h2>
          <span className="text-[10px] text-[#9CA3AF]">{totalCount} 条</span>
        </div>

        {/* Search */}
        <div className="flex items-center bg-[#F3F4F6] rounded-full h-10 px-3 gap-2 mb-3">
          <MagnifyingGlassIcon className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
          <input
            type="text"
            placeholder="搜索提示词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[#171717] placeholder-[#9CA3AF] w-full min-w-0"
          />
        </div>

        {/* Tabs */}
        <div className="relative pb-3">
          <div className="flex gap-1 overflow-x-auto horizontal-scrollbar pr-8 pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-7 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#171717] text-white'
                    : 'text-[#737373] hover:text-[#171717] hover:bg-[#F3F4F6]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 scrollbar-hide">
        {filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredPrompts.map((card) => {
              const gradients: Record<string, string> = {
                ui: 'from-blue-400 to-indigo-500',
                ue: 'from-fuchsia-400 to-violet-600',
                'illustration-standing': 'from-purple-400 to-pink-500',
                '3d': 'from-amber-400 to-orange-500',
                anime: 'from-rose-400 to-pink-500',
                realistic: 'from-emerald-400 to-teal-600',
                vfx: 'from-cyan-400 to-blue-600',
                scene: 'from-slate-400 to-zinc-600',
              };
              const categoryLabelMap: Record<string, string> = {
                ui: 'UI',
                ue: '界面工程',
                'illustration-standing': '角色立绘',
                '3d': '3D',
                anime: '二次元',
                realistic: '写实',
                vfx: '特效',
                scene: '场景',
              };
              const gradient = gradients[card.category] || 'from-[#F5F5F5] to-[#EEEEEE]';
              return (
                <button
                  key={card.id}
                  onClick={() => {
                    setPrompt(card.prompt);
                    if (card.thumbnail) {
                      setGeneratedImage(card.thumbnail);
                    }
                  }}
                  className="text-left rounded-xl border border-[#E5E7EB] bg-white overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                  title={`来源：${card.source}`}
                >
                  <div className={`aspect-[1/1.16] bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                    {card.thumbnail ? (
                      <img src={card.thumbnail} alt={card.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <svg className="w-8 h-8 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l1.7 4.7L18 9.4l-4.3 1.7L12 16l-1.7-4.9L6 9.4l4.3-1.7L12 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-[#171717] truncate">{card.title}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5 truncate">
                      {categoryLabelMap[card.category] || card.category} · {card.source}
                    </p>
                  </div>
                </button>
              );
            })}
            {/* Sentinel for infinite scroll */}
            {hasMoreCurrent && <div ref={sentinelRef} className="h-4 col-span-2" />}

            {/* Loading indicator */}
            {isSourceLoading && (
              <div className="col-span-2 flex items-center justify-center gap-2 py-4 text-xs text-[#9CA3AF]">
                <div className="w-3 h-3 border border-[#9CA3AF] border-t-transparent rounded-full animate-spin" />
                加载更多...
              </div>
            )}

            {/* All loaded */}
            {!isSourceLoading && !hasMoreCurrent && (
              <p className="col-span-2 sticky bottom-0 text-center text-[10px] text-[#D1D5DB] py-2 bg-white/95">
                已加载全部 {totalCount} 条提示词
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#9CA3AF] mt-4">没有匹配的提示词</p>
        )}
      </div>
    </aside>
  );
}
