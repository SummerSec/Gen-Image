import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../store/useStore';
import { CopyIcon } from '../common/Icons';
import { copyText } from '../../utils/clipboard';

interface Props {
  messages: ChatMessage[];
  isGenerating: boolean;
  onAddReference: (url: string) => void;
  onMaskEdit: (url: string) => void;
  onPreview: (url: string) => void;
  onDownload: (url: string) => void;
  compact?: boolean;
}

export default function MessageList({ messages, isGenerating, onAddReference, onMaskEdit, onPreview, onDownload, compact = false }: Props) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isGenerating) return;
    const start = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  const copyMessageText = async (id: string, text?: string) => {
    if (!text?.trim()) return;
    await copyText(text);
    setCopiedMessageId(id);
    window.setTimeout(() => setCopiedMessageId((current) => (current === id ? null : current)), 1200);
  };

  return (
    <div className={`${compact ? 'w-full gap-3' : 'mx-auto w-full max-w-5xl gap-5'} flex flex-col`}>
      {messages.length === 0 ? (
        <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4 text-sm leading-7 text-[#A7A29A]">
          <p className="font-medium text-white">还没有对话</p>
          <p className="mt-1">在下方输入提示词开始生成，生成记录会留在这里。</p>
        </div>
      ) : (
        messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'user' ? (
              <div className="group flex max-w-[88%] flex-col items-end gap-1.5 sm:max-w-[76%]">
                <div className="rounded-2xl rounded-br-md bg-[#A66B2F] text-white px-4 py-3 text-sm leading-7 whitespace-pre-wrap shadow-sm">{m.text}</div>
                <button
                  type="button"
                  onClick={() => void copyMessageText(m.id, m.text)}
                  className="inline-flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.06] px-2 text-[11px] leading-none text-[#A7A29A] transition-all hover:border-white/20 hover:bg-white/[0.1] hover:text-white sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                  title="复制这条提示词"
                >
                  <CopyIcon className="w-3 h-3 shrink-0" />
                  {copiedMessageId === m.id ? '已复制' : '复制'}
                </button>
              </div>
            ) : m.pending ? (
              <div className="flex items-center gap-2 rounded-2xl bg-white border border-[#DFE3EA] px-4 py-3 text-sm text-[#71717A] studio-float-shadow">
                <span className="w-4 h-4 border-2 border-[#A66B2F] border-t-transparent rounded-full animate-spin" />生成中… {elapsed}s
              </div>
            ) : m.image ? (
              <div className="group relative max-w-[88%] overflow-hidden rounded-2xl border border-white bg-white studio-surface-shadow sm:max-w-[76%]">
                <button type="button" onClick={() => onPreview(m.image!)} className="block" title="点击放大">
                  <img src={m.image} alt="" className="block max-h-[60vh] w-auto" />
                </button>
                <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <button onClick={() => onAddReference(m.image!)} className="h-7 px-2.5 rounded-md bg-black/65 text-white text-[11px] backdrop-blur hover:bg-black/80">转参考图</button>
                  <button onClick={() => onMaskEdit(m.image!)} className="h-7 px-2.5 rounded-md bg-black/65 text-white text-[11px] backdrop-blur hover:bg-black/80">局部重绘</button>
                  <button onClick={() => onDownload(m.image!)} className="h-7 px-2.5 rounded-md bg-black/65 text-white text-[11px] backdrop-blur hover:bg-black/80">下载</button>
                </div>
              </div>
            ) : (
              <div className="max-w-[88%] rounded-2xl bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 text-sm sm:max-w-[76%]">{m.text}</div>
            )}
          </div>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
}
