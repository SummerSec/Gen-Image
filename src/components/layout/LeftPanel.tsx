import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { STYLE_OPTIONS, RATIO_OPTIONS, MODEL_OPTIONS, RESOLUTION_OPTIONS } from '../../data/options';
import { PlusIcon } from '../common/Icons';

export default function LeftPanel() {
  const prompt = useStore((s) => s.prompt);
  const setPrompt = useStore((s) => s.setPrompt);
  const negativePrompt = useStore((s) => s.negativePrompt);
  const setNegativePrompt = useStore((s) => s.setNegativePrompt);
  const model = useStore((s) => s.model);
  const setModel = useStore((s) => s.setModel);
  const resolution = useStore((s) => s.resolution);
  const setResolution = useStore((s) => s.setResolution);
  const aspectRatio = useStore((s) => s.aspectRatio);
  const setAspectRatio = useStore((s) => s.setAspectRatio);
  const style = useStore((s) => s.style);
  const setStyle = useStore((s) => s.setStyle);
  const cfgScale = useStore((s) => s.cfgScale);
  const setCfgScale = useStore((s) => s.setCfgScale);
  const generateCount = useStore((s) => s.generateCount);
  const setGenerateCount = useStore((s) => s.setGenerateCount);
  const referenceImages = useStore((s) => s.referenceImages);
  const addReferenceImage = useStore((s) => s.addReferenceImage);
  const removeReferenceImage = useStore((s) => s.removeReferenceImage);
  const [promptEditorOpen, setPromptEditorOpen] = useState(false);

  const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${prompt.slice(0, start)}  ${prompt.slice(end)}`;
    setPrompt(next);

    requestAnimationFrame(() => {
      textarea.selectionStart = start + 2;
      textarea.selectionEnd = start + 2;
    });
  };

  const handleRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      addReferenceImage(URL.createObjectURL(file));
    });
    // Allow selecting the same file(s) again if needed
    e.target.value = '';
  };

  return (
    <aside className="w-full lg:w-[280px] bg-white border-r border-[#E5E7EB] flex flex-col flex-shrink-0 overflow-y-auto scrollbar-hide">
      <div className="p-4 pb-0">
        <h2 className="text-sm font-medium text-[#737373] mb-3">提示词</h2>
      </div>

      <div className="px-4 flex flex-col gap-3">
        {/* Prompt Card */}
        <div className="border border-[#E5E7EB] rounded-xl bg-white shadow-sm overflow-hidden">
          {/* Reference Images */}
          {referenceImages.length > 0 && (
            <div className="flex gap-2 p-3 pb-0 overflow-x-auto scrollbar-hide">
              {referenceImages.map((url, i) => (
                <div key={i} className="relative w-12 h-12 rounded-lg border border-[#E5E7EB] flex-shrink-0 overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeReferenceImage(i)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="w-12 h-12 rounded-lg border border-dashed border-[#D1D5DB] flex items-center justify-center flex-shrink-0 cursor-pointer hover:border-[#9CA3AF] transition-colors">
                <PlusIcon className="w-4 h-4 text-[#9CA3AF]" />
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleRefUpload} />
              </label>
            </div>
          )}

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handlePromptKeyDown}
            placeholder="描述你想要生成的图像...（右侧点选模板会自动追加到这里）"
            className="w-full min-h-[180px] resize-none bg-transparent border-none outline-none p-3 text-sm text-[#404040] placeholder-[#D1D5DB] leading-relaxed"
          />

          <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-[#F3F4F6]">
            {/* Left: 添加参考图 */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[11px] leading-none text-[#9CA3AF] cursor-pointer hover:text-[#737373] transition-colors">
                <PlusIcon className="w-3 h-3" />
                添加参考图
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleRefUpload} />
              </label>
              <button
                type="button"
                onClick={() => setPromptEditorOpen(true)}
                className="text-[11px] leading-none text-[#9CA3AF] hover:text-[#737373] transition-colors"
              >
                放大编辑
              </button>
            </div>

            {/* Right: 分辨率 + 数量 + 生成 */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="h-5 rounded-md border border-[#ECECEC] bg-white px-1.5 text-[8px] leading-none text-[#404040] outline-none cursor-pointer font-normal"
              >
                {RESOLUTION_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
              <select
                value={generateCount}
                onChange={(e) => setGenerateCount(parseInt(e.target.value, 10))}
                className="h-5 rounded-md border border-[#ECECEC] bg-white px-1.5 text-[8px] leading-none text-[#404040] outline-none cursor-pointer font-normal"
                title="生成数量"
              >
                <option value={1}>1 张</option>
                <option value={2}>2 张</option>
                <option value={3}>3 张</option>
                <option value={4}>4 张</option>
              </select>
              <button
                onClick={() => {
                  document.dispatchEvent(new CustomEvent('trigger-generate'));
                }}
                className="h-5 px-2.5 rounded-md bg-[#171717] text-white text-[8px] font-normal leading-none hover:bg-[#404040] transition-colors"
              >
                生成
              </button>
            </div>
          </div>
        </div>

        {/* Negative Prompt */}
        <div>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="负面提示词（不想要的元素）..."
            className="w-full h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#404040] placeholder-[#D1D5DB] outline-none focus:border-[#D1D5DB]"
          />
        </div>

        {/* Model Select */}
        <div>
          <label className="text-xs font-medium text-[#737373] mb-1.5 block">模型</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#171717] outline-none cursor-pointer"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Type Grid */}
        <div>
          <label className="text-xs font-medium text-[#737373] mb-1.5 block">类型</label>
          <div className="grid grid-cols-4 gap-1.5">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setStyle(style === opt.id ? '' : opt.id)}
                className={`h-14 rounded-lg border text-xs font-medium flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  style === opt.id
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-white text-[#404040] border-[#E5E7EB] hover:border-[#D1D5DB]'
                }`}
              >
                <span className="text-sm">{opt.icon}</span>
                <span className="text-[10px] leading-none">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="text-xs font-medium text-[#737373] mb-1.5 block">画幅比例</label>
          <div className="grid grid-cols-5 gap-1.5">
            {RATIO_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAspectRatio(opt.id)}
                className={`h-12 rounded-lg border text-xs font-medium transition-colors ${
                  aspectRatio === opt.id
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-white text-[#525252] border-[#E5E7EB] hover:border-[#D1D5DB]'
                }`}
              >
                <span className="flex flex-col items-center leading-tight">
                  <span className="text-[11px]">{opt.label}</span>
                  <span className="text-[9px] opacity-60">{opt.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Intensity Slider */}
        <div className="pb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-[#737373]">细节强度</label>
            <span className="text-xs text-[#9CA3AF]">{cfgScale}</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={cfgScale}
            onChange={(e) => setCfgScale(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-0.5">
            <span>柔和</span>
            <span>锐利</span>
          </div>
        </div>
      </div>

      {promptEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 lg:p-6">
          <div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[#171717]">提示词放大编辑</h2>
                <p className="mt-0.5 text-xs text-[#9CA3AF]">
                  内容会实时同步到左侧提示词输入框
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPromptEditorOpen(false)}
                className="h-9 rounded-full border border-[#E5E7EB] px-4 text-sm text-[#737373] hover:border-[#D1D5DB] hover:text-[#171717]"
              >
                完成
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handlePromptKeyDown}
              autoFocus
              placeholder="在这里编辑较长的提示词..."
              className="min-h-0 flex-1 resize-none border-none bg-[#FCFCFC] p-5 text-base leading-8 text-[#262626] outline-none placeholder-[#C7CDD5]"
            />

            <div className="flex items-center justify-between border-t border-[#E5E7EB] px-5 py-3 text-xs text-[#9CA3AF]">
              <span>{prompt.length} 字符</span>
              <span>Tab 可插入缩进</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
