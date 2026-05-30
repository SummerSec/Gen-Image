import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbGet, idbSet } from '../services/idb';

export interface HistoryItem {
  id: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: number;
  favorite?: boolean;
}

const HISTORY_KEY = 'history';
let historyHydrated = false;

export interface ApiProfile {
  id: string;
  name: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  image?: string;
  pending?: boolean;
}

function persistHistory(history: HistoryItem[]) {
  if (historyHydrated) void idbSet(HISTORY_KEY, history);
}

interface AppState {
  prompt: string;
  setPrompt: (v: string) => void;
  negativePrompt: string;
  setNegativePrompt: (v: string) => void;
  model: string;
  setModel: (v: string) => void;
  resolution: string;
  setResolution: (v: string) => void;
  aspectRatio: string;
  setAspectRatio: (v: string) => void;
  style: string;
  setStyle: (v: string) => void;
  cfgScale: number;
  setCfgScale: (v: number) => void;
  generateCount: number;
  setGenerateCount: (v: number) => void;
  referenceImages: string[];
  addReferenceImage: (url: string) => void;
  setReferenceImages: (urls: string[]) => void;
  removeReferenceImage: (index: number) => void;
  generatedImage: string | null;
  setGeneratedImage: (url: string | null) => void;
  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  newSession: () => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  history: HistoryItem[];
  addHistory: (item: HistoryItem) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
  toggleFavorite: (id: string) => void;
  hydrateHistory: () => Promise<void>;
  historyIndex: number;
  setHistoryIndex: (v: number) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  activeTab: string;
  setActiveTab: (v: string) => void;
  apiKey: string;
  setApiKey: (v: string) => void;
  baseUrl: string;
  setBaseUrl: (v: string) => void;
  apiMode: 'images' | 'responses';
  setApiMode: (v: 'images' | 'responses') => void;
  apiProfiles: ApiProfile[];
  activeProfileId: string;
  saveCurrentAsProfile: (name: string) => void;
  applyProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  useCorsProxy: boolean;
  setUseCorsProxy: (v: boolean) => void;
  responseFormatB64: boolean;
  setResponseFormatB64: (v: boolean) => void;
  corsProxyUrl: string;
  setCorsProxyUrl: (v: string) => void;
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  watermarkEnabled: boolean;
  setWatermarkEnabled: (v: boolean) => void;
}

// 作为 OpenAI SDK 的 baseURL 传入，SDK 自动追加 /images/generations
// 可替换为任意 OpenAI 兼容 API 地址，如 https://api.openai.com/v1
const DEFAULT_BASE_URL = 'https://www.right.codes/draw/v1';
const LEGACY_DEFAULT_BASE_URL = 'https://www.right.codes/draw';

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      prompt: '',
      setPrompt: (v) => set({ prompt: v }),
      negativePrompt: '',
      setNegativePrompt: (v) => set({ negativePrompt: v }),
      model: 'gpt-image-2',
      setModel: (v) => set({ model: v }),
      resolution: '1k',
      setResolution: (v) => set({ resolution: v }),
      aspectRatio: '16:9',
      setAspectRatio: (v) => set({ aspectRatio: v }),
      style: '',
      setStyle: (v) => set({ style: v }),
      cfgScale: 7,
      setCfgScale: (v) => set({ cfgScale: v }),
      generateCount: 1,
      setGenerateCount: (v) => set({ generateCount: v }),
      referenceImages: [],
      addReferenceImage: (url) =>
        set((s) => ({ referenceImages: [...s.referenceImages, url] })),
      setReferenceImages: (urls) => set({ referenceImages: urls }),
      removeReferenceImage: (index) =>
        set((s) => ({ referenceImages: s.referenceImages.filter((_, i) => i !== index) })),
      generatedImage: null,
      setGeneratedImage: (url) => set({ generatedImage: url }),
      messages: [],
      addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
      updateMessage: (id, patch) =>
        set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      newSession: () => set({ messages: [], referenceImages: [], prompt: '' }),
      isGenerating: false,
      setIsGenerating: (v) => set({ isGenerating: v }),
      history: [],
      addHistory: (item) =>
        set((s) => {
          const history = [item, ...s.history];
          persistHistory(history);
          return { history, historyIndex: 0 };
        }),
      removeHistory: (id) =>
        set((s) => {
          const history = s.history.filter((h) => h.id !== id);
          persistHistory(history);
          return { history, historyIndex: 0 };
        }),
      clearHistory: () =>
        set(() => {
          persistHistory([]);
          return { history: [], historyIndex: 0 };
        }),
      toggleFavorite: (id) =>
        set((s) => {
          const history = s.history.map((h) =>
            h.id === id ? { ...h, favorite: !h.favorite } : h,
          );
          persistHistory(history);
          return { history };
        }),
      hydrateHistory: async () => {
        const stored = await idbGet<HistoryItem[]>(HISTORY_KEY);
        historyHydrated = true;
        if (stored?.length) set({ history: stored });
      },
      historyIndex: 0,
      setHistoryIndex: (v) => set({ historyIndex: v }),
      searchQuery: '',
      setSearchQuery: (v) => set({ searchQuery: v }),
      activeTab: 'all',
      setActiveTab: (v) => set({ activeTab: v }),
      apiKey: '',
      setApiKey: (v) => set({ apiKey: v }),
      baseUrl: DEFAULT_BASE_URL,
      setBaseUrl: (v) => set({ baseUrl: v }),
      apiMode: 'images',
      setApiMode: (v) => set({ apiMode: v }),
      apiProfiles: [],
      activeProfileId: '',
      saveCurrentAsProfile: (name) =>
        set((s) => {
          const profile: ApiProfile = {
            id: `${Date.now()}`,
            name: name.trim() || `配置 ${s.apiProfiles.length + 1}`,
            apiKey: s.apiKey,
            baseUrl: s.baseUrl,
            model: s.model,
          };
          return { apiProfiles: [...s.apiProfiles, profile], activeProfileId: profile.id };
        }),
      applyProfile: (id) =>
        set((s) => {
          const p = s.apiProfiles.find((x) => x.id === id);
          if (!p) return {};
          return { apiKey: p.apiKey, baseUrl: p.baseUrl, model: p.model, activeProfileId: id };
        }),
      deleteProfile: (id) =>
        set((s) => ({
          apiProfiles: s.apiProfiles.filter((x) => x.id !== id),
          activeProfileId: s.activeProfileId === id ? '' : s.activeProfileId,
        })),
      useCorsProxy: true,
      setUseCorsProxy: (v) => set({ useCorsProxy: v }),
      responseFormatB64: true,
      setResponseFormatB64: (v) => set({ responseFormatB64: v }),
      corsProxyUrl: 'https://proxy.sumsec.me/',
      setCorsProxyUrl: (v) => set({ corsProxyUrl: v }),
      isAdmin: false,
      setIsAdmin: (v) => set({ isAdmin: v }),
      watermarkEnabled: true,
      setWatermarkEnabled: (v) => set({ watermarkEnabled: v }),
    }),
    {
      name: 'gen-image-settings',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<AppState>;

        if (state.baseUrl === LEGACY_DEFAULT_BASE_URL) {
          return { ...state, baseUrl: DEFAULT_BASE_URL };
        }

        return state;
      },
      partialize: (state) => ({
        apiKey: state.apiKey,
        baseUrl: state.baseUrl,
        model: state.model,
        apiMode: state.apiMode,
        apiProfiles: state.apiProfiles,
        activeProfileId: state.activeProfileId,
        useCorsProxy: state.useCorsProxy,
        corsProxyUrl: state.corsProxyUrl,
        responseFormatB64: state.responseFormatB64,
        watermarkEnabled: state.watermarkEnabled,
      }),
    },
  ),
);
