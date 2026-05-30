import { useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { generateImage } from '../../services/api';
import { applyWatermark } from '../../services/watermark';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Msg {
  role: 'user' | 'assistant';
  text?: string;
  image?: string;
}

// Minimal conversational mode: keeps context and iterates on the last result.
export default function AgentChat({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const lastImage = useRef<string | null>(null);
  const history = useRef<string[]>([]);

  if (!open) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const { model, apiKey, baseUrl, aspectRatio, resolution, style, cfgScale, watermarkEnabled, setGeneratedImage, addHistory } =
      useStore.getState();
    if (!apiKey.trim()) {
      setMessages((m) => [...m, { role: 'assistant', text: '请先在设置中配置 API Key' }]);
      return;
    }
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setBusy(true);
    history.current.push(text);
    // Context memory: concatenate prior turns; iterate on last result as reference.
    const prompt = history.current.join('\n');
    try {
      let url = await generateImage({
        prompt,
        model,
        resolution,
        aspectRatio,
        style,
        cfgScale,
        referenceImages: lastImage.current ? [lastImage.current] : [],
        apiKey,
        baseUrl,
      });
      if (watermarkEnabled) url = await applyWatermark(url);
      lastImage.current = url;
      setMessages((m) => [...m, { role: 'assistant', image: url }]);
      setGeneratedImage(url);
      addHistory({ id: `${Date.now()}-agent`, url, prompt: text, model, timestamp: Date.now() });
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: err instanceof Error ? err.message : '生成失败' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex flex-col p-4 lg:p-6">
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <h2 className="text-base font-semibold text-[#18181B]">Agent 对话模式</h2>
            <p className="mt-0.5 text-xs text-[#71717A]">多轮对话，自动记忆上下文并在上一张结果上继续修改</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full border border-[#E5E7EB] text-[#71717A] hover:text-[#18181B]">×</button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <p className="text-sm text-[#71717A] text-center mt-8">输入第一条指令开始，例如「画一只戴帽子的柴犬」</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-[#5e6ad2] text-white' : 'bg-[#F1F2F5] text-[#18181B]'}`}>
                {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                {m.image && <img src={m.image} alt="" className="rounded-lg max-h-72" />}
              </div>
            </div>
          ))}
          {busy && <p className="text-xs text-[#71717A]">生成中...</p>}
        </div>

        <div className="flex items-end gap-2 border-t border-[#E5E7EB] p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="输入指令，Enter 发送 / Shift+Enter 换行"
            className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#5e6ad2]"
          />
          <button
            onClick={send}
            disabled={busy || !input.trim()}
            className="h-11 rounded-xl bg-[#5e6ad2] px-5 text-sm font-medium text-white hover:bg-[#4F58C9] disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
