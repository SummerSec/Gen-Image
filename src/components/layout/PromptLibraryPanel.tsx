import type { RefObject } from 'react';
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { PromptCard } from '../../data/prompts';
import { copyText } from '../../utils/clipboard';

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

const gradients: Record<string, string> = {
  ui: 'from-zinc-500 to-stone-700',
  ue: 'from-stone-500 to-neutral-800',
  'illustration-standing': 'from-amber-700 to-stone-900',
  '3d': 'from-amber-500 to-orange-700',
  anime: 'from-neutral-500 to-zinc-800',
  realistic: 'from-stone-400 to-zinc-700',
  vfx: 'from-yellow-700 to-neutral-900',
  scene: 'from-slate-500 to-zinc-800',
};

interface Props {
  prompts: PromptCard[];
  totalCount: number;
  hasMoreCurrent: boolean;
  isSourceLoading: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
}

export default function PromptLibraryPanel({ prompts, totalCount, hasMoreCurrent, isSourceLoading, sentinelRef }: Props) {
  const [copiedPromptId, setCopiedPromptId] = useState<string | number | null>(null);
  const setPrompt = useStore((s) => s.setPrompt);
  const setReferenceImages = useStore((s) => s.setReferenceImages);

  const copyPrompt = async (prompt: string, id: string | number) => {
    await copyText(prompt);
    setCopiedPromptId(id);
    window.setTimeout(() => setCopiedPromptId((current) => (current === id ? null : current)), 1200);
  };

  if (prompts.length === 0) {
    return <p className="text-sm text-[#A7A29A] mt-4">没有匹配的提示词</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {prompts.map((card) => {
        const gradient = gradients[card.category] || 'from-[#2A2B2E] to-[#161719]';
        return (
          <button
            key={card.id}
            onClick={() => {
              setPrompt(card.prompt);
              setReferenceImages(card.thumbnail ? [card.thumbnail] : []);
            }}
            className="group relative overflow-hidden rounded-[18px] bg-[#202124] text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)]"
            title={`点击：填入提示词 + 添加示例图为参考 · 来源：${card.source}`}
          >
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                void copyPrompt(card.prompt, card.id);
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                e.stopPropagation();
                void copyPrompt(card.prompt, card.id);
              }}
              className="absolute right-2 top-2 z-10 h-7 rounded-lg bg-black/55 px-2 text-[10px] leading-7 text-white opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-black/75 group-hover:opacity-100 focus:opacity-100"
              title="复制提示词"
            >
              {copiedPromptId === card.id ? '已复制' : '复制'}
            </span>
            <div className={`aspect-[0.82] bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
              {card.thumbnail ? (
                <img src={card.thumbnail} alt={card.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
              ) : (
                <svg className="w-8 h-8 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.7 4.7L18 9.4l-4.3 1.7L12 16l-1.7-4.9L6 9.4l4.3-1.7L12 3z" />
                </svg>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/82 via-black/52 to-transparent p-3 pt-8">
              <p className="text-xs font-semibold text-white truncate">{card.title}</p>
              <p className="mt-1 truncate text-[10px] text-white/68">
                {categoryLabelMap[card.category] || card.category} · {card.source}
              </p>
            </div>
          </button>
        );
      })}

      {hasMoreCurrent && <div ref={sentinelRef} className="h-4 col-span-2" />}

      {isSourceLoading && (
        <div className="col-span-2 flex items-center justify-center gap-2 py-4 text-xs text-[#A7A29A]">
          <div className="w-3 h-3 border border-[#A7A29A] border-t-transparent rounded-full animate-spin" />
          加载更多...
        </div>
      )}

      {!isSourceLoading && !hasMoreCurrent && (
        <p className="col-span-2 sticky bottom-0 text-center text-[10px] text-[#77716A] py-2 bg-[#161719]/95">
          已加载全部 {totalCount} 条提示词
        </p>
      )}
    </div>
  );
}
