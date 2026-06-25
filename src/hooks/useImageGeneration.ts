import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { RATIO_OPTIONS, RESOLUTION_OPTIONS } from '../data/options';
import { generateImage } from '../services/api';
import { applyWatermark } from '../services/watermark';

export function useImageGeneration() {
  const prompt = useStore((s) => s.prompt);
  const setPrompt = useStore((s) => s.setPrompt);
  const isGenerating = useStore((s) => s.isGenerating);

  const send = useCallback(async () => {
    const text = useStore.getState().prompt.trim();
    const st = useStore.getState();
    if (!text || st.isGenerating) return;

    if (!st.apiKey.trim()) {
      st.addMessage({ id: `${Date.now()}-e`, role: 'assistant', text: '请先在设置中配置 API Key（点击顶部 ⚙ 按钮）' });
      return;
    }

    st.addMessage({ id: `${Date.now()}-u`, role: 'user', text });
    st.setPrompt('');
    st.setIsGenerating(true);

    const ratio = RATIO_OPTIONS.find((r) => r.id === st.aspectRatio);
    const resLabel = RESOLUTION_OPTIONS.find((r) => r.id === st.resolution)?.label;
    const parts = [resLabel, ratio ? `${ratio.label}比例${ratio.desc}` : undefined].filter(Boolean);
    const fullPrompt = (parts.length ? `请生成${parts.join('、')}的图片。` : '') + text;
    const lastImg = [...st.messages].reverse().find((m) => m.role === 'assistant' && m.image)?.image;
    const refs = st.referenceImages.length ? st.referenceImages : lastImg ? [lastImg] : [];
    st.setReferenceImages([]);

    try {
      await Promise.all(
        Array.from({ length: st.generateCount }, async (_, i) => {
          const id = `${Date.now()}-a${i}`;
          st.addMessage({ id, role: 'assistant', pending: true });
          try {
            let url = await generateImage({
              prompt: fullPrompt,
              model: st.model,
              resolution: st.resolution,
              aspectRatio: st.aspectRatio,
              style: st.style,
              cfgScale: st.cfgScale,
              referenceImages: refs,
              apiKey: st.apiKey,
              baseUrl: st.baseUrl,
            });
            if (st.watermarkEnabled) url = await applyWatermark(url);
            st.updateMessage(id, { image: url, pending: false });
            st.addHistory({ id: `${id}-h`, url, prompt: text, model: st.model, timestamp: Date.now() });
          } catch (err) {
            st.updateMessage(id, { pending: false, text: err instanceof Error ? err.message : '生成失败' });
          }
        }),
      );
    } finally {
      st.setIsGenerating(false);
    }
  }, []);

  return { prompt, setPrompt, isGenerating, send };
}
