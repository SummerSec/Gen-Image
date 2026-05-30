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
  const apiProfiles = useStore((s) => s.apiProfiles);
  const activeProfileId = useStore((s) => s.activeProfileId);
  const saveCurrentAsProfile = useStore((s) => s.saveCurrentAsProfile);
  const applyProfile = useStore((s) => s.applyProfile);
  const deleteProfile = useStore((s) => s.deleteProfile);
  const useCorsProxy = useStore((s) => s.useCorsProxy);
  const setUseCorsProxy = useStore((s) => s.setUseCorsProxy);
  const corsProxyUrl = useStore((s) => s.corsProxyUrl);
  const setCorsProxyUrl = useStore((s) => s.setCorsProxyUrl);
  const isAdmin = useStore((s) => s.isAdmin);
  const setIsAdmin = useStore((s) => s.setIsAdmin);
  const watermarkEnabled = useStore((s) => s.watermarkEnabled);
  const setWatermarkEnabled = useStore((s) => s.setWatermarkEnabled);

  const [localKey, setLocalKey] = useState(apiKey);
  const [localUrl, setLocalUrl] = useState(baseUrl);
  const [localUseCorsProxy, setLocalUseCorsProxy] = useState(useCorsProxy);
  const [localCorsProxyUrl, setLocalCorsProxyUrl] = useState(corsProxyUrl);
  const [saved, setSaved] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

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

  const handleAdminLogin = () => {
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!envPassword) {
      setAdminError('未配置管理员密码（VITE_ADMIN_PASSWORD）');
      return;
    }
    if (adminPassword === envPassword) {
      setIsAdmin(true);
      setAdminPassword('');
      setAdminError('');
    } else {
      setAdminError('密码错误');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminPassword('');
    setAdminError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-[#0f1011] rounded-2xl border border-[#23252a] w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#23252a]">
          <h2 className="text-lg font-semibold text-[#f7f8f8]">API 设置</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#23252a] flex items-center justify-center text-[#8a8f98] hover:text-[#f7f8f8] hover:border-[#34343a]"
          >
            ×
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-[#8a8f98] mb-1.5 block">OpenAI API Base URL</label>
            <input
              type="text"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              placeholder="https://www.right.codes/draw/v1"
              className="w-full h-10 rounded-lg border border-[#23252a] px-3 text-sm text-[#f7f8f8] placeholder-[#62666d] outline-none focus:border-[#5e6ad2]"
            />
            <p className="text-[10px] text-[#8a8f98] mt-1">OpenAI 兼容 API 的 Base URL（SDK 自动追加 /images/generations），例如 https://api.openai.com/v1</p>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#8a8f98] flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              CORS 代理
            </label>
            <button
              onClick={() => setLocalUseCorsProxy(!localUseCorsProxy)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                localUseCorsProxy ? 'bg-[#5e6ad2]' : 'bg-[#34343a]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#0f1011] shadow transition-transform duration-200 ${
                  localUseCorsProxy ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {localUseCorsProxy && (
            <div>
              <label className="text-xs font-medium text-[#8a8f98] mb-1.5 block">代理地址</label>
              <input
                type="text"
                value={localCorsProxyUrl}
                onChange={(e) => setLocalCorsProxyUrl(e.target.value)}
                placeholder="https://proxy.sumsec.me/"
                className="w-full h-10 rounded-lg border border-[#23252a] px-3 text-sm text-[#f7f8f8] placeholder-[#62666d] outline-none focus:border-[#5e6ad2]"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-[#8a8f98] mb-1.5 block">API Key</label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="sk-..."
              className="w-full h-10 rounded-lg border border-[#23252a] px-3 text-sm text-[#f7f8f8] placeholder-[#62666d] outline-none focus:border-[#5e6ad2]"
              onFocus={(e) => {
                e.target.type = 'text';
              }}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = 'password';
              }}
            />
            <p className="text-[10px] text-[#8a8f98] mt-1">密钥仅存储在本地浏览器（localStorage）中</p>
          </div>

          {/* API Profiles */}
          <div className="border-t border-[#23252a] pt-4">
            <h3 className="text-sm font-medium text-[#f7f8f8] mb-2">配置管理</h3>
            {apiProfiles.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-3">
                {apiProfiles.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                      p.id === activeProfileId ? 'border-[#5e6ad2] bg-[#141516]' : 'border-[#23252a]'
                    }`}
                  >
                    <button
                      onClick={() => {
                        applyProfile(p.id);
                        const s = useStore.getState();
                        setLocalKey(s.apiKey);
                        setLocalUrl(s.baseUrl);
                      }}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="text-xs font-medium text-[#f7f8f8] truncate">{p.name}</p>
                      <p className="text-[10px] text-[#8a8f98] truncate">{p.model} · {p.baseUrl}</p>
                    </button>
                    <button
                      onClick={() => deleteProfile(p.id)}
                      className="text-[#8a8f98] hover:text-red-500 text-sm"
                      title="删除配置"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="配置名称"
                className="flex-1 h-9 rounded-lg border border-[#23252a] px-3 text-sm text-[#f7f8f8] placeholder-[#62666d] outline-none focus:border-[#5e6ad2]"
              />
              <button
                onClick={() => {
                  setApiKey(localKey.trim());
                  setBaseUrl(localUrl.trim());
                  saveCurrentAsProfile(profileName);
                  setProfileName('');
                }}
                className="h-9 px-4 rounded-lg border border-[#23252a] text-sm text-[#f7f8f8] hover:border-[#34343a] transition-colors"
              >
                另存为
              </button>
            </div>
            <p className="text-[10px] text-[#8a8f98] mt-1">保存当前 Base URL / API Key / 模型为一套配置，可随时切换</p>
          </div>

          {/* Admin Section */}
          <div className="border-t border-[#23252a] pt-4">
            <h3 className="text-sm font-medium text-[#f7f8f8] mb-3">管理员</h3>

            {isAdmin ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8a8f98]">水印开关</span>
                  <button
                    onClick={() => setWatermarkEnabled(!watermarkEnabled)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                      watermarkEnabled ? 'bg-[#5e6ad2]' : 'bg-[#34343a]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#0f1011] shadow transition-transform duration-200 ${
                        watermarkEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-[#8a8f98]">
                  {watermarkEnabled ? '已开启：生成图片右下角添加 gen-img.sumsec.me 水印' : '已关闭：生成图片不添加水印'}
                </p>
                <button
                  onClick={handleAdminLogout}
                  className="h-8 rounded-lg border border-[#23252a] px-3 text-xs text-[#8a8f98] hover:text-[#f7f8f8] hover:border-[#34343a] transition-colors self-start"
                >
                  退出管理员
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminError('');
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdminLogin(); }}
                    placeholder="输入管理员密码"
                    className="flex-1 h-10 rounded-lg border border-[#23252a] px-3 text-sm text-[#f7f8f8] placeholder-[#62666d] outline-none focus:border-[#5e6ad2]"
                  />
                  <button
                    onClick={handleAdminLogin}
                    className="h-10 px-4 rounded-lg bg-[#5e6ad2] text-white text-sm font-medium hover:bg-[#828fff] transition-colors"
                  >
                    验证
                  </button>
                </div>
                {adminError && (
                  <p className="text-[11px] text-red-500">{adminError}</p>
                )}
                <p className="text-[10px] text-[#8a8f98]">在 Vercel 环境变量中设置 VITE_ADMIN_PASSWORD</p>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full h-11 rounded-full bg-[#5e6ad2] text-white text-sm font-medium hover:bg-[#828fff] transition-colors"
          >
            {saved ? '✓ 已保存' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  );
}
