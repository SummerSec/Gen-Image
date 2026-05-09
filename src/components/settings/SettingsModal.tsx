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

  const [localKey, setLocalKey] = useState(apiKey);
  const [localUrl, setLocalUrl] = useState(baseUrl);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLocalKey(apiKey);
    setLocalUrl(baseUrl);
  }, [open, apiKey, baseUrl]);

  if (!open) return null;

  const handleSave = () => {
    setApiKey(localKey.trim());
    setBaseUrl(localUrl.trim());
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
            <label className="text-xs font-medium text-[#737373] mb-1.5 block">API Base URL</label>
            <input
              type="text"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              placeholder="https://www.right.codes/draw"
              className="w-full h-10 rounded-lg border border-[#E5E7EB] px-3 text-sm text-[#171717] placeholder-[#D1D5DB] outline-none focus:border-[#9CA3AF]"
            />
            <p className="text-[10px] text-[#9CA3AF] mt-1">API 网关地址，例如 https://www.right.codes/draw</p>
          </div>

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
