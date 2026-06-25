import type { HistoryItem } from '../../store/useStore';

interface Props {
  history: HistoryItem[];
  onAddReference: (url: string) => void;
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function HistoryPanel({ history, onAddReference, onRemove, onToggleFavorite }: Props) {
  if (history.length === 0) {
    return <p className="text-sm text-[#A7A29A]">暂无历史记录</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {history.map((item) => (
        <div key={item.id} className="group relative overflow-hidden rounded-[18px] bg-[#202124] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
          <button onClick={() => onAddReference(item.url)} className="block w-full" title="点击转为参考图">
            <img src={item.url} alt="" className="w-full aspect-square object-cover" loading="lazy" />
          </button>
          <button onClick={() => onToggleFavorite(item.id)} className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-md text-[10px] flex items-center justify-center backdrop-blur ${item.favorite ? 'bg-[#D6A85D] text-[#16110A]' : 'bg-black/45 text-white opacity-0 group-hover:opacity-100'}`}>★</button>
          <button onClick={() => onRemove(item.id)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-black/55 text-white text-[11px] flex items-center justify-center opacity-0 backdrop-blur group-hover:opacity-100">×</button>
        </div>
      ))}
    </div>
  );
}
