import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { copyText } from '../../utils/clipboard';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Section = 'api' | 'options' | 'data' | 'about';

const NAV: { id: Section; label: string }[] = [
  { id: 'api', label: 'API 配置' },
  { id: 'options', label: '接口选项' },
  { id: 'data', label: '数据管理' },
  { id: 'about', label: '关于' },
];

const inputCls = 'w-full h-10 rounded-lg border border-[#D9D4CC] bg-white px-3 text-sm text-[#18181B] placeholder-[#A1A1AA] outline-none transition-colors focus:border-[#D6A85D]';

const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
  <button onClick={onClick} className={`relative h-5 w-10 rounded-full transition-colors duration-200 ${on ? 'bg-[#D6A85D]' : 'bg-[#D1D5DB]'}`}>
    <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

export default function SettingsModal({ open, onClose }: Props) {
  const apiKey = useStore((s) => s.apiKey);
  const setApiKey = useStore((s) => s.setApiKey);
  const baseUrl = useStore((s) => s.baseUrl);
  const setBaseUrl = useStore((s) => s.setBaseUrl);
  const apiUserAgentEnabled = useStore((s) => s.apiUserAgentEnabled);
  const setApiUserAgentEnabled = useStore((s) => s.setApiUserAgentEnabled);
  const apiUserAgent = useStore((s) => s.apiUserAgent);
  const setApiUserAgent = useStore((s) => s.setApiUserAgent);
  const apiMode = useStore((s) => s.apiMode);
  const setApiMode = useStore((s) => s.setApiMode);
  const model = useStore((s) => s.model);
  const setModel = useStore((s) => s.setModel);
  const responseFormatB64 = useStore((s) => s.responseFormatB64);
  const setResponseFormatB64 = useStore((s) => s.setResponseFormatB64);
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
  const history = useStore((s) => s.history);
  const clearHistory = useStore((s) => s.clearHistory);

  const [section, setSection] = useState<Section>('api');
  const [localKey, setLocalKey] = useState(apiKey);
  const [localUrl, setLocalUrl] = useState(baseUrl);
  const [localUserAgentEnabled, setLocalUserAgentEnabled] = useState(apiUserAgentEnabled);
  const [localUserAgent, setLocalUserAgent] = useState(apiUserAgent);
  const [localApiMode, setLocalApiMode] = useState(apiMode);
  const [localModel, setLocalModel] = useState(model);
  const [localB64, setLocalB64] = useState(responseFormatB64);
  const [localUseCorsProxy, setLocalUseCorsProxy] = useState(useCorsProxy);
  const [localCorsProxyUrl, setLocalCorsProxyUrl] = useState(corsProxyUrl);
  const [saved, setSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setLocalKey(apiKey);
      setLocalUrl(baseUrl);
      setLocalUserAgentEnabled(apiUserAgentEnabled);
      setLocalUserAgent(apiUserAgent);
      setLocalApiMode(apiMode);
      setLocalModel(model);
      setLocalB64(responseFormatB64);
      setLocalUseCorsProxy(useCorsProxy);
      setLocalCorsProxyUrl(corsProxyUrl);
      setSaved(false);
      setCopiedKey(false);
      setAdminError('');
    });
  }, [open, apiKey, baseUrl, apiUserAgentEnabled, apiUserAgent, apiMode, model, responseFormatB64, useCorsProxy, corsProxyUrl]);

  if (!open) return null;

  const handleSave = () => {
    setApiKey(localKey.trim());
    setBaseUrl(localUrl.trim());
    setApiUserAgentEnabled(localUserAgentEnabled);
    setApiUserAgent(localUserAgent.trim());
    setApiMode(localApiMode);
    setModel(localModel.trim() || 'gpt-image-2');
    setResponseFormatB64(localB64);
    setUseCorsProxy(localUseCorsProxy);
    setCorsProxyUrl(localCorsProxyUrl.trim());
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  };

  const handleCopyKey = async () => {
    if (!localKey.trim()) return;
    await copyText(localKey);
    setCopiedKey(true);
    window.setTimeout(() => setCopiedKey(false), 1200);
  };

  const handleSaveProfile = () => {
    handleSave();
    saveCurrentAsProfile(profileName.trim() || `配置 ${apiProfiles.length + 1}`);
    setProfileName('');
  };

  const handleApplyProfile = (id: string) => {
    applyProfile(id);
    const profile = useStore.getState().apiProfiles.find((item) => item.id === id);
    if (!profile) return;
    setLocalKey(profile.apiKey);
    setLocalUrl(profile.baseUrl);
    setLocalModel(profile.model);
    setLocalUserAgentEnabled(profile.userAgentEnabled ?? false);
    setLocalUserAgent(profile.userAgent ?? '');
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin') {
      setIsAdmin(true);
      setAdminPassword('');
      setAdminError('');
    } else {
      setAdminError('密码不正确');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-[#F7F4EF] text-[#18181B] shadow-2xl">
        <aside className="hidden w-48 flex-shrink-0 border-r border-[#DDD6CC] bg-[#ECE6DB] p-4 sm:block">
          <h2 className="mb-4 text-sm font-semibold">设置</h2>
          <div className="space-y-1">
            {NAV.map((item) => (
              <button key={item.id} onClick={() => setSection(item.id)} className={`h-9 w-full rounded-lg px-3 text-left text-sm transition-colors ${section === item.id ? 'bg-[#D6A85D] text-[#16110A]' : 'text-[#625D55] hover:bg-white/60 hover:text-[#18181B]'}`}>
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-[#DDD6CC] px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A66B2F]">Settings</p>
              <h2 className="mt-1 text-lg font-semibold">{NAV.find((item) => item.id === section)?.label}</h2>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-lg border border-[#D2CABF] text-[#625D55] hover:bg-white hover:text-[#18181B]">×</button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {section === 'api' && (
              <div className="space-y-5">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">API Key</span>
                  <div className="flex gap-2">
                    <input value={localKey} onChange={(e) => setLocalKey(e.target.value)} type="password" placeholder="sk-..." className={inputCls} />
                    <button onClick={handleCopyKey} disabled={!localKey.trim()} className="h-10 rounded-lg border border-[#D9D4CC] bg-white px-3 text-sm text-[#625D55] hover:text-[#18181B] disabled:opacity-50">{copiedKey ? '已复制' : '复制'}</button>
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Base URL</span>
                  <input value={localUrl} onChange={(e) => setLocalUrl(e.target.value)} placeholder="https://..." className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">模型</span>
                  <input value={localModel} onChange={(e) => setLocalModel(e.target.value)} placeholder="gpt-image-2" className={inputCls} />
                </label>
                <div className="rounded-xl border border-[#DDD6CC] bg-white/55 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">自定义 X-User-Agent</p>
                      <p className="mt-1 text-xs text-[#625D55]">开启后请求头会携带你填写的 X-User-Agent。</p>
                    </div>
                    <Toggle on={localUserAgentEnabled} onClick={() => setLocalUserAgentEnabled((value) => !value)} />
                  </div>
                  {localUserAgentEnabled && <input value={localUserAgent} onChange={(e) => setLocalUserAgent(e.target.value)} placeholder="例如：MyApp/1.0" className={`${inputCls} mt-3`} />}
                </div>

                <div className="rounded-xl border border-[#DDD6CC] bg-white/55 p-4">
                  <div className="mb-3 flex gap-2">
                    <input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="配置名称" className={inputCls} />
                    <button onClick={handleSaveProfile} className="h-10 rounded-lg bg-[#D6A85D] px-4 text-sm font-medium text-[#16110A] hover:bg-[#E7BF7A]">保存配置</button>
                  </div>
                  <div className="space-y-2">
                    {apiProfiles.length === 0 ? <p className="text-sm text-[#625D55]">暂无配置档</p> : apiProfiles.map((profile) => (
                      <div key={profile.id} className="flex items-center gap-2 rounded-lg border border-[#DDD6CC] bg-white px-3 py-2 text-sm">
                        <span className="min-w-0 flex-1 truncate">{profile.name}{activeProfileId === profile.id ? ' · 当前' : ''}</span>
                        <button onClick={() => handleApplyProfile(profile.id)} className="text-[#A66B2F] hover:underline">应用</button>
                        <button onClick={() => deleteProfile(profile.id)} className="text-[#625D55] hover:text-red-600">删除</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {section === 'options' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-[#DDD6CC] bg-white/55 p-4"><span>接口模式：Images</span><Toggle on={localApiMode === 'images'} onClick={() => setLocalApiMode(localApiMode === 'images' ? 'responses' : 'images')} /></div>
                <div className="flex items-center justify-between rounded-xl border border-[#DDD6CC] bg-white/55 p-4"><span>返回 base64</span><Toggle on={localB64} onClick={() => setLocalB64((value) => !value)} /></div>
                <div className="flex items-center justify-between rounded-xl border border-[#DDD6CC] bg-white/55 p-4"><span>使用 CORS 代理</span><Toggle on={localUseCorsProxy} onClick={() => setLocalUseCorsProxy((value) => !value)} /></div>
                {localUseCorsProxy && <input value={localCorsProxyUrl} onChange={(e) => setLocalCorsProxyUrl(e.target.value)} placeholder="CORS 代理地址" className={inputCls} />}
                <div className="flex items-center justify-between rounded-xl border border-[#DDD6CC] bg-white/55 p-4"><span>生成图片水印</span><Toggle on={watermarkEnabled} onClick={() => setWatermarkEnabled(!watermarkEnabled)} /></div>
              </div>
            )}

            {section === 'data' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#DDD6CC] bg-white/55 p-4">
                  <p className="text-sm font-medium">历史记录</p>
                  <p className="mt-1 text-sm text-[#625D55]">当前共 {history.length} 条。</p>
                  <button onClick={clearHistory} className="mt-3 h-9 rounded-lg border border-red-200 bg-white px-3 text-sm text-red-600 hover:bg-red-50">清空历史</button>
                </div>
                <div className="rounded-xl border border-[#DDD6CC] bg-white/55 p-4">
                  <p className="text-sm font-medium">管理员</p>
                  <div className="mt-3 flex gap-2">
                    <input value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} type="password" placeholder="管理员密码" className={inputCls} />
                    <button onClick={handleAdminLogin} className="h-10 rounded-lg bg-[#D6A85D] px-4 text-sm font-medium text-[#16110A] hover:bg-[#E7BF7A]">验证</button>
                  </div>
                  {adminError && <p className="mt-2 text-xs text-red-600">{adminError}</p>}
                  {isAdmin && <p className="mt-2 text-xs text-green-700">已开启管理员模式</p>}
                </div>
              </div>
            )}

            {section === 'about' && (
              <div className="space-y-4 text-sm leading-7 text-[#625D55]">
                <p className="text-base font-semibold text-[#18181B]">Gen Image</p>
                <p>一个基于 OpenAI 兼容图像接口的图像创作工作台。</p>
                <a href="https://github.com/SummerSec/Gen-Image" target="_blank" rel="noopener noreferrer" className="text-[#A66B2F] hover:underline">GitHub 仓库 →</a>
              </div>
            )}
          </div>

          <div className="border-t border-[#DDD6CC] p-5">
            <button onClick={handleSave} className="h-11 w-full rounded-lg bg-[#D6A85D] text-sm font-semibold text-[#16110A] shadow-sm hover:bg-[#E7BF7A]">
              {saved ? '已保存' : '保存设置'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
