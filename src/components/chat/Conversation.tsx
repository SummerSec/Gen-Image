import { useState } from 'react';
import { useStore } from '../../store/useStore';
import Composer from './Composer';
import MessageList from './MessageList';
import HistoryPanel from '../layout/HistoryPanel';

export default function Conversation() {
  const messages = useStore((s) => s.messages);
  const isGenerating = useStore((s) => s.isGenerating);
  const history = useStore((s) => s.history);
  const addReferenceImage = useStore((s) => s.addReferenceImage);
  const removeHistory = useStore((s) => s.removeHistory);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const [preview, setPreview] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'chat' | 'history'>('chat');

  const download = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image.png';
    a.click();
  };

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-l border-white/8 bg-[#161719] lg:w-[360px] xl:w-[400px]">
      <div className="border-b border-white/8 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D6A85D]">03 · Conversation</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white">生成与迭代</h2>
            <p className="mt-1 text-xs leading-5 text-[#A7A29A]">输入指令，查看发送记录和历史结果。</p>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-white/6 p-0.5">
            <button onClick={() => setActivePanel('chat')} className={`h-8 rounded-lg px-3 text-xs font-medium transition-colors ${activePanel === 'chat' ? 'bg-[#D6A85D] text-[#16110A]' : 'text-[#A7A29A] hover:text-white'}`}>对话</button>
            <button onClick={() => setActivePanel('history')} className={`h-8 rounded-lg px-3 text-xs font-medium transition-colors ${activePanel === 'history' ? 'bg-[#D6A85D] text-[#16110A]' : 'text-[#A7A29A] hover:text-white'}`}>历史 {history.length > 0 && `(${history.length})`}</button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        {activePanel === 'history' ? (
          <HistoryPanel history={history} onAddReference={addReferenceImage} onRemove={removeHistory} onToggleFavorite={toggleFavorite} />
        ) : (
          <MessageList messages={messages} isGenerating={isGenerating} onAddReference={addReferenceImage} onMaskEdit={addReferenceImage} onPreview={setPreview} onDownload={download} compact />
        )}
      </div>

      <div className="border-t border-white/8 p-4">
        <Composer variant="chat" />
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" onClick={() => setPreview(null)}>
          <img src={preview} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      )}
    </aside>
  );
}
