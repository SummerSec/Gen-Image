import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { generateImage } from '../../services/api';
import { RATIO_OPTIONS, RESOLUTION_OPTIONS } from '../../data/options';
import {
  ImageIcon,
  DownloadIcon,
  TrashIcon,
  ShareIcon,
  BookmarkIcon,
  ArrowUpIcon,
} from '../common/Icons';

export default function CanvasArea() {
  const generatedImage = useStore((s) => s.generatedImage);
  const isGenerating = useStore((s) => s.isGenerating);
  const prompt = useStore((s) => s.prompt);
  const model = useStore((s) => s.model);
  const apiKey = useStore((s) => s.apiKey);
  const setGeneratedImage = useStore((s) => s.setGeneratedImage);
  const history = useStore((s) => s.history);
  const historyIndex = useStore((s) => s.historyIndex);
  const setHistoryIndex = useStore((s) => s.setHistoryIndex);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const clampZoom = (value: number) => Math.min(4, Math.max(0.25, value));

  useEffect(() => {
    setZoom(1);
  }, [generatedImage]);

  useEffect(() => {
    if (!isGenerating) {
      setElapsedSeconds(0);
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isGenerating]);

  const handleGenerate = useCallback(async () => {
    const state = useStore.getState();
    const {
      prompt: currentPrompt,
      isGenerating: currentlyGenerating,
      apiKey: currentApiKey,
      generateCount: currentGenerateCount,
      aspectRatio: currentAspectRatio,
      resolution: currentResolution,
      style: currentStyle,
      negativePrompt: currentNegativePrompt,
      model: currentModel,
      cfgScale: currentCfgScale,
      referenceImages: currentReferenceImages,
      baseUrl: currentBaseUrl,
      setIsGenerating: setGenerating,
      setGeneratedImage: setImage,
      addHistory: addHistoryItem,
    } = state;

    if (!currentPrompt.trim() || currentlyGenerating) return;

    if (!currentApiKey.trim()) {
      setErrorMsg('请先配置 API Key（点击顶部 ⚙ 设置按钮）');
      return;
    }

    setErrorMsg(null);
    setGenerating(true);
    setGenerationProgress({ current: 0, total: currentGenerateCount });

    try {
      const ratioOption = RATIO_OPTIONS.find((r) => r.id === currentAspectRatio);
      const resLabel = RESOLUTION_OPTIONS.find((r) => r.id === currentResolution)?.label;
      const ratioLabel = ratioOption
        ? `${ratioOption.label}比例${ratioOption.desc.replace(':', '：')}`
        : undefined;
      const sizeParts = [resLabel, ratioLabel].filter(Boolean);
      const sizePrefix = sizeParts.length > 0 ? `请生成${sizeParts.join('、')}的图片。` : '';

      const fullPrompt = currentStyle
        ? `[风格: ${currentStyle}] ${currentNegativePrompt ? `避免: ${currentNegativePrompt}. ` : ''}${sizePrefix}${currentPrompt}`
        : currentNegativePrompt
          ? `${sizePrefix}避免: ${currentNegativePrompt}. ${currentPrompt}`
          : `${sizePrefix}${currentPrompt}`;

      for (let i = 0; i < currentGenerateCount; i += 1) {
        setGenerationProgress({ current: i, total: currentGenerateCount });
        const imageUrl = await generateImage({
          prompt: fullPrompt,
          negativePrompt: currentNegativePrompt,
          model: currentModel,
          resolution: currentResolution,
          aspectRatio: currentAspectRatio,
          style: currentStyle,
          cfgScale: currentCfgScale,
          referenceImages: currentReferenceImages,
          apiKey: currentApiKey,
          baseUrl: currentBaseUrl,
        });

        setGenerationProgress({ current: i + 1, total: currentGenerateCount });
        setImage(imageUrl);
        addHistoryItem({
          id: `${Date.now()}-${i}`,
          url: imageUrl,
          prompt: currentPrompt,
          model: currentModel,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : '生成失败，请检查 API Key 和网络连接';
      setErrorMsg(msg);
      console.error('生成失败:', err);
    } finally {
      setGenerating(false);
      setGenerationProgress(null);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleGenerate]);

  useEffect(() => {
    const onTrigger = () => handleGenerate();
    document.addEventListener('trigger-generate', onTrigger);
    return () => document.removeEventListener('trigger-generate', onTrigger);
  }, [handleGenerate]);

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = 'generated-image.png';
    a.click();
  };

  const handleUndo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setGeneratedImage(history[newIndex].url);
    }
  };

  const handleRedo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setGeneratedImage(history[newIndex].url);
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA]">
      {/* Image Stage */}
      <div className="flex-1 flex items-center justify-center p-6 min-h-0">
        {errorMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm max-w-md text-center shadow-lg">
            {errorMsg}
            <button onClick={() => setErrorMsg(null)} className="ml-3 text-red-400 hover:text-red-600 font-bold">
              ×
            </button>
          </div>
        )}

        {generatedImage ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-lg overflow-hidden w-full h-full max-w-full max-h-full min-w-0 flex flex-col">
            <div className="flex items-center justify-end gap-1.5 px-3 py-2 border-b border-[#F3F4F6] bg-white">
              <button
                onClick={() => setZoom((z) => clampZoom(z - 0.1))}
                className="w-7 h-7 rounded-full border border-[#E5E7EB] text-[#737373] hover:text-[#171717] hover:border-[#D1D5DB] text-sm leading-none"
                title="缩小"
              >
                -
              </button>
              <button
                onClick={() => setZoom(1)}
                className="min-w-[56px] h-7 px-2 rounded-full border border-[#E5E7EB] text-[11px] text-[#737373] hover:text-[#171717] hover:border-[#D1D5DB]"
                title="重置缩放"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() => setZoom((z) => clampZoom(z + 0.1))}
                className="w-7 h-7 rounded-full border border-[#E5E7EB] text-[#737373] hover:text-[#171717] hover:border-[#D1D5DB] text-sm leading-none"
                title="放大"
              >
                +
              </button>
            </div>

            <div className="p-3 bg-[#FCFCFC] overflow-auto flex-1 min-h-0 flex items-center justify-center">
              <img
                src={generatedImage}
                alt="生成的图片"
                className="block max-w-full max-h-full object-contain"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              />
            </div>
          </div>
        ) : isGenerating ? (
          <div className="w-[377px] aspect-square max-w-[calc(100%-64px)] max-h-[60vh] rounded-2xl border border-[#E5E7EB] bg-[#F5F5F5] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#171717] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#737373]">
              {generationProgress ? `正在生成 ${generationProgress.current}/${generationProgress.total}` : '正在生成中...'}
            </p>
            <p className="text-xs font-medium text-[#9CA3AF]">
              已等待 {elapsedSeconds}s
            </p>
            <p className="text-xs text-[#9CA3AF] max-w-[280px] text-center">
              正在调用 {model} 请求生成图片，请稍候
            </p>
          </div>
        ) : (
          <div className="w-[377px] aspect-square max-w-[calc(100%-64px)] max-h-[60vh] rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-transparent flex flex-col items-center justify-center gap-3">
            <ImageIcon className="w-10 h-10 text-[#D1D5DB]" />
            <p className="text-lg font-medium text-[#9CA3AF]">生成预览</p>
            <p className="text-xs text-[#D1D5DB]">
              {apiKey ? '输入提示词并点击生成按钮' : '请先设置 API Key（点击 ⚙ 按钮）'}
            </p>
          </div>
        )}
      </div>

      {/* Generate Button + Action Icons */}
      <div className="flex items-center justify-center gap-3 px-6 py-3 border-t border-[#E5E7EB] bg-white">
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="flex items-center gap-2 h-10 px-8 rounded-full bg-[#171717] text-white text-sm font-medium hover:bg-[#404040] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {generationProgress
                ? `生成中 ${generationProgress.current}/${generationProgress.total} · ${elapsedSeconds}s`
                : `生成中 ${elapsedSeconds}s`}
            </>
          ) : (
            <>
              <ArrowUpIcon className="w-4 h-4" />
              生成
            </>
          )}
        </button>

        <div className="w-px h-5 bg-[#E5E7EB] mx-1" />

        <button
          onClick={handleUndo}
          disabled={historyIndex >= history.length - 1}
          className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#737373] hover:text-[#171717] hover:border-[#D1D5DB] disabled:opacity-40 transition-colors"
          title="撤销"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 10h10a5 5 0 0 1 5 5v2" />
            <path d="M7 6l-4 4 4 4" />
          </svg>
        </button>
        <button
          onClick={handleRedo}
          disabled={historyIndex <= 0}
          className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#737373] hover:text-[#171717] hover:border-[#D1D5DB] disabled:opacity-40 transition-colors"
          title="重做"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M21 10H11a5 5 0 0 0-5 5v2" />
            <path d="M17 6l4 4-4 4" />
          </svg>
        </button>

        <div className="w-px h-5 bg-[#E5E7EB] mx-1" />

        <button
          onClick={handleDownload}
          disabled={!generatedImage}
          className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#737373] hover:text-[#171717] hover:border-[#D1D5DB] disabled:opacity-40 transition-colors"
          title="下载"
        >
          <DownloadIcon className="w-4 h-4" />
        </button>

        <button
          disabled={!generatedImage}
          className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#737373] hover:text-[#171717] hover:border-[#D1D5DB] disabled:opacity-40 transition-colors"
          title="保存"
        >
          <BookmarkIcon className="w-4 h-4" />
        </button>

        <button
          disabled={!generatedImage}
          className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#737373] hover:text-[#171717] hover:border-[#D1D5DB] disabled:opacity-40 transition-colors"
          title="分享"
        >
          <ShareIcon className="w-4 h-4" />
        </button>

        <button
          disabled={!generatedImage}
          className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#737373] hover:text-[#171717] hover:border-[#D1D5DB] disabled:opacity-40 transition-colors"
          title="删除"
          onClick={() => setGeneratedImage(null)}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* History Thumbnails */}
      {history.length > 0 && (
        <div className="flex items-center gap-2 px-6 py-3 border-t border-[#E5E7EB] bg-white/60 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-[#9CA3AF] flex-shrink-0">历史</span>
          {history.map((item, i) => (
            <button
              key={item.id}
              onClick={() => {
                setHistoryIndex(i);
                setGeneratedImage(item.url);
              }}
              className={`w-14 h-14 rounded-xl border-2 flex-shrink-0 overflow-hidden p-0.5 transition-colors ${
                i === historyIndex ? 'border-[#171717]' : 'border-transparent'
              }`}
            >
              <img src={item.url} alt="" className="w-full h-full object-cover rounded-[10px]" />
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
