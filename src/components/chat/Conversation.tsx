import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import Composer from './Composer';
import MaskEditor from '../canvas/MaskEditor';
import { CopyIcon, ImageIcon } from '../common/Icons';
import { copyText } from '../../utils/clipboard';

export default function Conversation() {
  const messages = useStore((s) => s.messages);
  const isGenerating = useStore((s) => s.isGenerating);
  const addReferenceImage = useStore((s) => s.addReferenceImage);
  const [maskImg, setMaskImg] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isGenerating) {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const t = window.setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => window.clearInterval(t);
  }, [isGenerating]);

  const download = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image.png';
    a.click();
  };

  const copyMessageText = async (id: string, text?: string) => {
    if (!text?.trim()) return;
    await copyText(text);
    setCopiedMessageId(id);
    window.setTimeout(() => setCopiedMessageId((current) => (current === id ? null : current)), 1200);
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA]">
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-6">
        <div className="mx-auto w-full max-w-3xl flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="mt-[12vh] flex flex-col items-center gap-3 text-center">
              <ImageIcon className="w-12 h-12 text-[#D1D5DB]" />
              <h2 className="text-lg font-medium text-[#3F3F46]">开始创作</h2>
              <p className="text-sm text-[#A1A1AA] max-w-sm">在下方输入提示词生成图片，继续输入即可在上一张结果上迭代修改；也可从右侧「提示词库」挑选模板填入。</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'user' ? (
                  <div className="group flex max-w-[80%] items-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => void copyMessageText(m.id, m.text)}
                      className="mb-1 h-7 px-2 rounded-full border border-[#E5E7EB] bg-white text-[11px] text-[#71717A] shadow-sm opacity-0 transition-opacity hover:text-[#18181B] hover:border-[#D1D5DB] group-hover:opacity-100 focus:opacity-100 inline-flex items-center gap-1"
                      title="复制这条提示词"
                    >
                      <CopyIcon className="w-3 h-3" />
                      {copiedMessageId === m.id ? '已复制' : '复制'}
                    </button>
                    <div className="rounded-2xl rounded-br-sm bg-[#5e6ad2] text-white px-3.5 py-2 text-sm whitespace-pre-wrap">{m.text}</div>
                  </div>
                ) : m.pending ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-white border border-[#E5E7EB] px-4 py-3 text-sm text-[#71717A]">
                    <span className="w-4 h-4 border-2 border-[#5e6ad2] border-t-transparent rounded-full animate-spin" />生成中… {elapsed}s
                  </div>
                ) : m.image ? (
                  <div className="group relative max-w-[80%] rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white">
                    <button type="button" onClick={() => setPreview(m.image!)} className="block" title="点击放大">
                      <img src={m.image} alt="" className="block max-h-[60vh] w-auto" />
                    </button>
                    <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => addReferenceImage(m.image!)} className="h-7 px-2.5 rounded-full bg-black/60 text-white text-[11px] hover:bg-black/75">转参考图</button>
                      <button onClick={() => setMaskImg(m.image!)} className="h-7 px-2.5 rounded-full bg-black/60 text-white text-[11px] hover:bg-black/75">局部重绘</button>
                      <button onClick={() => download(m.image!)} className="h-7 px-2.5 rounded-full bg-black/60 text-white text-[11px] hover:bg-black/75">下载</button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[80%] rounded-2xl bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 text-sm">{m.text}</div>
                )}
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="px-4 pb-4 pt-1">
        <Composer />
      </div>

      <MaskEditor open={!!maskImg} imageUrl={maskImg} onClose={() => setMaskImg(null)} />

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <img src={preview} alt="" className="max-h-full max-w-full object-contain rounded-lg" />
        </div>
      )}
    </main>
  );
}
