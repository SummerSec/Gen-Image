import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: Props) {
  const apiKey = useStore((s) => s.apiKey);
  const setApiKey = useStore((s) => s.setApiKey);
  const baseUrl = useStore((s) => s.baseUrl);
  const setBaseUrl = useStore((s) => s.setBaseUrl);
  const useCorsProxy = useStore((s) => s.useCorsProxy);
  const setUseCorsProxy = useStore((s) => s.setUseCorsProxy);
  const corsProxyUrl = useStore((s) => s.corsProxyUrl);
  const setCorsProxyUrl = useStore((s) => s.setCorsProxyUrl);

  const [localKey, setLocalKey] = useState(apiKey);
  const [localUrl, setLocalUrl] = useState(baseUrl);
  const [localUseCorsProxy, setLocalUseCorsProxy] = useState(useCorsProxy);
  const [localCorsProxyUrl, setLocalCorsProxyUrl] = useState(corsProxyUrl);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLocalKey(apiKey);
    setLocalUrl(baseUrl);
    setLocalUseCorsProxy(useCorsProxy);
    setLocalCorsProxyUrl(corsProxyUrl);
  }, [open, apiKey, baseUrl, useCorsProxy, corsProxyUrl]);

  if (!open) return null;

  const handleSave = () => {
    setApiKey(localKey.trim());
    setBaseUrl(localUrl.trim());
    setUseCorsProxy(localUseCorsProxy);
    setCorsProxyUrl(localCorsProxyUrl.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-lg font-semibold text-[#171717]">API 设置</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#737373] hover:text-[#171717] hover:border-[#D1D5DB]"
          >
            ×
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-[#737373] mb-1.5 block">OpenAI API Base URL</label>
            <input
              type="text"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              placeholder="https://www.right.codes/draw/v1"
              className="w-full h-10 rounded-lg border border-[#E5E7EB] px-3 text-sm text-[#171717] placeholder-[#D1D5DB] outline-none focus:border-[#9CA3AF]"
            />
            <p className="text-[10px] text-[#9CA3AF] mt-1">OpenAI 兼容 API 的 Base URL（SDK 自动追加 /images/generations），例如 https://api.openai.com/v1</p>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#737373]">CORS 代理</label>
            <button
              onClick={() => setLocalUseCorsProxy(!localUseCorsProxy)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                localUseCorsProxy ? 'bg-[#171717]' : 'bg-[#D1D5DB]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  localUseCorsProxy ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {localUseCorsProxy && (
            <div>
              <label className="text-xs font-medium text-[#737373] mb-1.5 block">代理地址</label>
              <input
                type="text"
                value={localCorsProxyUrl}
                onChange={(e) => setLocalCorsProxyUrl(e.target.value)}
                placeholder="https://proxy.sumsec.me/"
                className="w-full h-10 rounded-lg border border-[#E5E7EB] px-3 text-sm text-[#171717] placeholder-[#D1D5DB] outline-none focus:border-[#9CA3AF]"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-[#737373] mb-1.5 block">API Key</label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="sk-..."
              className="w-full h-10 rounded-lg border border-[#E5E7EB] px-3 text-sm text-[#171717] placeholder-[#D1D5DB] outline-none focus:border-[#9CA3AF]"
              onFocus={(e) => {
                e.target.type = 'text';
              }}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = 'password';
              }}
            />
            <p className="text-[10px] text-[#9CA3AF] mt-1">密钥仅存储在本地浏览器（localStorage）中</p>
          </div>

          <button
            onClick={handleSave}
            className="w-full h-11 rounded-full bg-[#171717] text-white text-sm font-medium hover:bg-[#404040] transition-colors"
          >
            {saved ? '✓ 已保存' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  );
}
