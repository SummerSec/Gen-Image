import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { getPromptLibrary, hasMorePrompts, loadMorePrompts } from '../../data/prompts';
import { TABS } from '../../data/options';
import { MagnifyingGlassIcon } from '../common/Icons';

const PAGE_SIZE = 48;

export default function RightPanel({ onClose }: { onClose?: () => void }) {
  const [isSourceLoading, setIsSourceLoading] = useState(false);
  const [visibleCountByKey, setVisibleCountByKey] = useState<Record<string, number>>({});
  const [tick, setTick] = useState(0);
  const [panelTab, setPanelTab] = useState<'library' | 'history'>('library');
  const sentinelRef = useRef<HTMLDivElement>(null);

  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const setPrompt = useStore((s) => s.setPrompt);
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const history = useStore((s) => s.history);
  const addReferenceImage = useStore((s) => s.addReferenceImage);
  const removeHistory = useStore((s) => s.removeHistory);
  const toggleFavorite = useStore((s) => s.toggleFavorite);

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
    <aside className="w-full h-full bg-[#FFFFFF] border-l border-[#E5E7EB] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 rounded-full bg-[#F1F2F5] p-0.5">
            <button onClick={() => setPanelTab('library')} className={`h-7 px-3 rounded-full text-xs font-medium transition-colors ${panelTab === 'library' ? 'bg-white text-[#18181B] shadow-sm' : 'text-[#71717A]'}`}>提示词库</button>
            <button onClick={() => setPanelTab('history')} className={`h-7 px-3 rounded-full text-xs font-medium transition-colors ${panelTab === 'history' ? 'bg-white text-[#18181B] shadow-sm' : 'text-[#71717A]'}`}>历史 {history.length > 0 && `(${history.length})`}</button>
          </div>
          {onClose && (
            <button onClick={onClose} className="w-7 h-7 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#71717A] hover:text-[#18181B] hover:border-[#D1D5DB]" title="收起">×</button>
          )}
        </div>

        {panelTab === 'library' && (
          <>
            {/* Search */}
            <div className="flex items-center bg-[#F1F2F5] rounded-full h-10 px-3 gap-2 mb-3">
              <MagnifyingGlassIcon className="w-4 h-4 text-[#71717A] flex-shrink-0" />
              <input
                type="text"
                placeholder="搜索提示词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-[#18181B] placeholder-[#71717A] w-full min-w-0"
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
                        ? 'bg-[#5e6ad2] text-white'
                        : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F1F2F5]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent" />
            </div>
          </>
        )}
      </div>

      {panelTab === 'history' ? (
        <div className="flex-1 overflow-y-auto px-5 pb-6 scrollbar-hide">
          {history.length === 0 ? (
            <p className="text-sm text-[#71717A] mt-4">暂无历史记录</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {history.map((item) => (
                <div key={item.id} className="group relative rounded-xl border border-[#E5E7EB] overflow-hidden">
                  <button onClick={() => addReferenceImage(item.url)} className="block w-full" title="点击转为参考图">
                    <img src={item.url} alt="" className="w-full aspect-square object-cover" loading="lazy" />
                  </button>
                  <button onClick={() => toggleFavorite(item.id)} className={`absolute top-1 left-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${item.favorite ? 'bg-amber-400 text-white' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'}`}>★</button>
                  <button onClick={() => removeHistory(item.id)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-[11px] flex items-center justify-center opacity-0 group-hover:opacity-100">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
      /* Grid */
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
              const gradient = gradients[card.category] || 'from-[#F1F2F5] to-[#E8EAEF]';
              return (
                <button
                  key={card.id}
                  onClick={() => {
                    setPrompt(card.prompt);
                    if (card.thumbnail) addReferenceImage(card.thumbnail);
                  }}
                  className="text-left rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                  title={`点击：填入提示词 + 添加示例图为参考 · 来源：${card.source}`}
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
                    <p className="text-xs font-medium text-[#18181B] truncate">{card.title}</p>
                    <p className="text-[10px] text-[#71717A] mt-0.5 truncate">
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
              <div className="col-span-2 flex items-center justify-center gap-2 py-4 text-xs text-[#71717A]">
                <div className="w-3 h-3 border border-[#71717A] border-t-transparent rounded-full animate-spin" />
                加载更多...
              </div>
            )}

            {/* All loaded */}
            {!isSourceLoading && !hasMoreCurrent && (
              <p className="col-span-2 sticky bottom-0 text-center text-[10px] text-[#A1A1AA] py-2 bg-[#FFFFFF]/95">
                已加载全部 {totalCount} 条提示词
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#71717A] mt-4">没有匹配的提示词</p>
        )}
      </div>
      )}
    </aside>
  );
}
