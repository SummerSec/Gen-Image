import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getPromptLibrary, hasMorePrompts, loadMorePrompts } from '../data/prompts';
import { useStore } from '../store/useStore';

const PAGE_SIZE = 48;

export function usePromptLibrary() {
  const [isSourceLoading, setIsSourceLoading] = useState(false);
  const [visibleCountByKey, setVisibleCountByKey] = useState<Record<string, number>>({});
  const [tick, setTick] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const activeTab = useStore((s) => s.activeTab);
  const searchQuery = useStore((s) => s.searchQuery);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const paginationKey = normalizedQuery ? `${activeTab}::${normalizedQuery}` : activeTab;

  const filteredAllPrompts = useMemo(() => {
    void tick;
    let list = getPromptLibrary();
    if (activeTab !== 'all') {
      list = list.filter((p) => p.category === activeTab);
    }
    if (normalizedQuery) {
      list = list.filter(
        (p) => p.title.toLowerCase().includes(normalizedQuery) || p.prompt.toLowerCase().includes(normalizedQuery),
      );
    }
    return list;
  }, [activeTab, normalizedQuery, tick]);

  const visibleLimit = visibleCountByKey[paginationKey] ?? PAGE_SIZE;
  const prompts = useMemo(
    () => filteredAllPrompts.slice(0, visibleLimit),
    [filteredAllPrompts, visibleLimit],
  );
  const hasMoreCurrent = prompts.length < filteredAllPrompts.length;

  const loadSource = useCallback(async () => {
    if (!hasMorePrompts() || isSourceLoading) return;
    setIsSourceLoading(true);
    await loadMorePrompts();
    setTick((t) => t + 1);
    setIsSourceLoading(false);
  }, [isSourceLoading]);

  const loadMore = useCallback(() => {
    if (!hasMoreCurrent || isSourceLoading) return;
    setVisibleCountByKey((prev) => ({
      ...prev,
      [paginationKey]: (prev[paginationKey] ?? PAGE_SIZE) + PAGE_SIZE,
    }));
  }, [hasMoreCurrent, isSourceLoading, paginationKey]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSource();
    });
  }, [loadSource]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMoreCurrent) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMoreCurrent, prompts.length]);

  return {
    prompts,
    totalCount: filteredAllPrompts.length,
    hasMoreCurrent,
    isSourceLoading,
    sentinelRef,
  };
}
