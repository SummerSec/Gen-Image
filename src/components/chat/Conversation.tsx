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
    <main className="flex-1 flex flex-col min-w-0 bg-[#F4F5F7]">
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="mt-[12vh] flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#E6E8EE] bg-white studio-float-shadow">
                <ImageIcon className="w-7 h-7 text-[#5e6ad2]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#18181B]">开始创作</h2>
                <p className="mt-2 text-sm leading-6 text-[#71717A] max-w-md">输入提示词生成图片，继续输入可基于上一张结果迭代；右侧词库可快速填入模板和参考图。</p>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'user' ? (
                  <div className="group flex max-w-[86%] items-end gap-2 sm:max-w-[80%]">
                    <button
                      type="button"
                      onClick={() => void copyMessageText(m.id, m.text)}
                      className="mb-1 h-7 px-2 rounded-md border border-[#E6E8EE] bg-white text-[11px] text-[#71717A] shadow-sm opacity-100 transition-all hover:text-[#18181B] hover:border-[#BFC4CF] hover:bg-[#F7F8FA] sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 inline-flex items-center gap-1"
                      title="复制这条提示词"
                    >
                      <CopyIcon className="w-3 h-3" />
                      {copiedMessageId === m.id ? '已复制' : '复制'}
                    </button>
                    <div className="rounded-xl rounded-br-sm bg-[#5e6ad2] text-white px-3.5 py-2.5 text-sm leading-6 whitespace-pre-wrap shadow-sm">{m.text}</div>
                  </div>
                ) : m.pending ? (
                  <div className="flex items-center gap-2 rounded-xl bg-white border border-[#E6E8EE] px-4 py-3 text-sm text-[#71717A] studio-float-shadow">
                    <span className="w-4 h-4 border-2 border-[#5e6ad2] border-t-transparent rounded-full animate-spin" />生成中… {elapsed}s
                  </div>
                ) : m.image ? (
                  <div className="group relative max-w-[86%] overflow-hidden rounded-xl border border-[#E6E8EE] bg-white studio-surface-shadow sm:max-w-[80%]">
                    <button type="button" onClick={() => setPreview(m.image!)} className="block" title="点击放大">
                      <img src={m.image} alt="" className="block max-h-[60vh] w-auto" />
                    </button>
                    <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      <button onClick={() => addReferenceImage(m.image!)} className="h-7 px-2.5 rounded-md bg-black/65 text-white text-[11px] backdrop-blur hover:bg-black/80">转参考图</button>
                      <button onClick={() => setMaskImg(m.image!)} className="h-7 px-2.5 rounded-md bg-black/65 text-white text-[11px] backdrop-blur hover:bg-black/80">局部重绘</button>
                      <button onClick={() => download(m.image!)} className="h-7 px-2.5 rounded-md bg-black/65 text-white text-[11px] backdrop-blur hover:bg-black/80">下载</button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[86%] rounded-xl bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 text-sm sm:max-w-[80%]">{m.text}</div>
                )}
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 lg:px-8">
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
