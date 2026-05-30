import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';

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

const inputCls = 'w-full h-10 rounded-lg border border-[#E5E7EB] px-3 text-sm text-[#18181B] placeholder-[#A1A1AA] outline-none focus:border-[#5e6ad2]';
const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
  <button onClick={onClick} className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${on ? 'bg-[#5e6ad2]' : 'bg-[#D1D5DB]'}`}>
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

export default function SettingsModal({ open, onClose }: Props) {
  const apiKey = useStore((s) => s.apiKey);
  const setApiKey = useStore((s) => s.setApiKey);
  const baseUrl = useStore((s) => s.baseUrl);
  const setBaseUrl = useStore((s) => s.setBaseUrl);
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
  const watermarkEnabled = useStore((s) => s.watermarkEnabled);
  const setWatermarkEnabled = useStore((s) => s.setWatermarkEnabled);
  const history = useStore((s) => s.history);
  const clearHistory = useStore((s) => s.clearHistory);

  const [section, setSection] = useState<Section>('api');
  const [localKey, setLocalKey] = useState(apiKey);
  const [localUrl, setLocalUrl] = useState(baseUrl);
  const [localApiMode, setLocalApiMode] = useState(apiMode);
  const [localModel, setLocalModel] = useState(model);
  const [localB64, setLocalB64] = useState(responseFormatB64);
  const [localUseCorsProxy, setLocalUseCorsProxy] = useState(useCorsProxy);
  const [localCorsProxyUrl, setLocalCorsProxyUrl] = useState(corsProxyUrl);
  const [saved, setSaved] = useState(false);
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    if (!open) return;
    setLocalKey(apiKey);
    setLocalUrl(baseUrl);
    setLocalApiMode(apiMode);
    setLocalModel(model);
    setLocalB64(responseFormatB64);
    setLocalUseCorsProxy(useCorsProxy);
    setLocalCorsProxyUrl(corsProxyUrl);
  }, [open, apiKey, baseUrl, apiMode, model, responseFormatB64, useCorsProxy, corsProxyUrl]);

  if (!open) return null;

  const handleSave = () => {
    setApiKey(localKey.trim());
    setBaseUrl(localUrl.trim());
    setApiMode(localApiMode);
    setModel(localModel.trim());
    setResponseFormatB64(localB64);
    setUseCorsProxy(localUseCorsProxy);
    setCorsProxyUrl(localCorsProxyUrl.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 lg:p-6">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] w-full max-w-2xl h-[80vh] max-h-[640px] shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <h2 className="text-lg font-semibold text-[#18181B]">设置</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#A1A1AA]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>v{__APP_VERSION__}</span>
            <button onClick={onClose} className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#71717A] hover:text-[#18181B] hover:border-[#D1D5DB]">×</button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex">
          {/* Sidebar */}
          <nav className="w-36 lg:w-44 flex-shrink-0 border-r border-[#E5E7EB] p-2 flex flex-col gap-0.5 overflow-y-auto">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={`text-left h-9 px-3 rounded-lg text-sm transition-colors ${section === n.id ? 'bg-[#F1F2F5] text-[#18181B] font-medium' : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F7F8FA]'}`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-y-auto p-6 flex flex-col gap-4">
            {section === 'api' && (
              <>
                <div>
                  <label className="text-xs font-medium text-[#71717A] mb-1.5 block">API Base URL</label>
                  <input type="text" value={localUrl} onChange={(e) => setLocalUrl(e.target.value)} placeholder="https://api.openai.com/v1" className={inputCls} />
                  <p className="text-[10px] text-[#71717A] mt-1">OpenAI 兼容 API 的 Base URL（自动追加 /images/generations）</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#71717A] mb-1.5 block">API 接口</label>
                  <select value={localApiMode} onChange={(e) => setLocalApiMode(e.target.value as 'images' | 'responses')} className={`${inputCls} cursor-pointer`}>
                    <option value="images">Images API (/v1/images)</option>
                    <option value="responses">Responses API (/v1/responses)</option>
                  </select>
                  <p className="text-[10px] text-[#71717A] mt-1">Images API 走 /images/generations；Responses API 走 /responses + image_generation 工具。按服务商支持情况选择。</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#71717A] mb-1.5 block">模型 ID</label>
                  <input type="text" value={localModel} onChange={(e) => setLocalModel(e.target.value)} placeholder="gpt-image-2" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#71717A] mb-1.5 block">API Key</label>
                  <input type="password" value={localKey} onChange={(e) => setLocalKey(e.target.value)} placeholder="sk-..." className={inputCls}
                    onFocus={(e) => { e.target.type = 'text'; }} onBlur={(e) => { if (!e.target.value) e.target.type = 'password'; }} />
                  <p className="text-[10px] text-[#71717A] mt-1">密钥仅存储在本地浏览器（localStorage）中</p>
                </div>

                <div className="border-t border-[#E5E7EB] pt-4">
                  <h3 className="text-sm font-medium text-[#18181B] mb-2">配置管理</h3>
                  {apiProfiles.length > 0 && (
                    <div className="flex flex-col gap-1.5 mb-3">
                      {apiProfiles.map((p) => (
                        <div key={p.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${p.id === activeProfileId ? 'border-[#5e6ad2] bg-[#F1F2F5]' : 'border-[#E5E7EB]'}`}>
                          <button onClick={() => { applyProfile(p.id); const s = useStore.getState(); setLocalKey(s.apiKey); setLocalUrl(s.baseUrl); setLocalModel(s.model); }} className="flex-1 text-left min-w-0">
                            <p className="text-xs font-medium text-[#18181B] truncate">{p.name}</p>
                            <p className="text-[10px] text-[#71717A] truncate">{p.model} · {p.baseUrl}</p>
                          </button>
                          <button onClick={() => deleteProfile(p.id)} className="text-[#71717A] hover:text-red-500 text-sm" title="删除配置">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="配置名称" className="flex-1 h-9 rounded-lg border border-[#E5E7EB] px-3 text-sm text-[#18181B] placeholder-[#A1A1AA] outline-none focus:border-[#5e6ad2]" />
                    <button onClick={() => { setApiKey(localKey.trim()); setBaseUrl(localUrl.trim()); setModel(localModel.trim()); saveCurrentAsProfile(profileName); setProfileName(''); }} className="h-9 px-4 rounded-lg border border-[#E5E7EB] text-sm text-[#18181B] hover:border-[#D1D5DB] transition-colors">另存为</button>
                  </div>
                  <p className="text-[10px] text-[#71717A] mt-1">保存当前 Base URL / 模型 / API Key 为一套配置，可随时切换</p>
                </div>
              </>
            )}

            {section === 'options' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#71717A]">返回 base64 图片数据</label>
                  <Toggle on={localB64} onClick={() => setLocalB64(!localB64)} />
                </div>
                <p className="text-[10px] text-[#71717A] -mt-2">开启后在请求体追加 response_format: b64_json，接口直接返回 Base64 图片数据而非 URL。并非所有服务商和网关都支持，若报错可关闭。</p>

                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4">
                  <label className="text-xs font-medium text-[#71717A]">CORS 代理</label>
                  <Toggle on={localUseCorsProxy} onClick={() => setLocalUseCorsProxy(!localUseCorsProxy)} />
                </div>
                {localUseCorsProxy && (
                  <div>
                    <label className="text-xs font-medium text-[#71717A] mb-1.5 block">代理地址</label>
                    <input type="text" value={localCorsProxyUrl} onChange={(e) => setLocalCorsProxyUrl(e.target.value)} placeholder="https://proxy.sumsec.me/" className={inputCls} />
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4">
                  <label className="text-xs font-medium text-[#71717A]">生成图片水印</label>
                  <Toggle on={watermarkEnabled} onClick={() => setWatermarkEnabled(!watermarkEnabled)} />
                </div>
                <p className="text-[10px] text-[#71717A] -mt-2">{watermarkEnabled ? '已开启：生成图片右下角添加 gen-img.sumsec.me 水印' : '已关闭：生成图片不添加水印'}</p>
              </>
            )}

            {section === 'data' && (
              <div>
                <h3 className="text-sm font-medium text-[#18181B] mb-1">历史记录</h3>
                <p className="text-[10px] text-[#71717A] mb-3">共 {history.length} 条，存储于浏览器 IndexedDB。</p>
                <button onClick={() => { if (confirm('确定清空全部历史记录？此操作不可恢复。')) clearHistory(); }} className="h-9 px-4 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50 transition-colors">清空历史记录</button>
              </div>
            )}

            {section === 'about' && (
              <div className="flex flex-col gap-2 text-sm text-[#3F3F46]">
                <p className="text-base font-semibold text-[#18181B]">Image Studio <span className="text-xs font-normal text-[#A1A1AA]">v{__APP_VERSION__}</span></p>
                <p className="text-[#71717A]">基于 OpenAI 兼容接口的 AI 图像生成工作台。</p>
                <a href="https://github.com/SummerSec/Gen-Image" target="_blank" rel="noopener noreferrer" className="text-[#5e6ad2] hover:underline w-fit">GitHub 仓库 →</a>
              </div>
            )}
          </div>
        </div>

        {(section === 'api' || section === 'options') && (
          <div className="px-6 py-3 border-t border-[#E5E7EB] flex-shrink-0">
            <button onClick={handleSave} className="w-full h-11 rounded-full bg-[#5e6ad2] text-white text-sm font-medium hover:bg-[#4F58C9] transition-colors">
              {saved ? '✓ 已保存' : '保存设置'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
