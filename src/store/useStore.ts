import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface HistoryItem {
  id: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: number;
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
  removeReferenceImage: (index: number) => void;
  generatedImage: string | null;
  setGeneratedImage: (url: string | null) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  history: HistoryItem[];
  addHistory: (item: HistoryItem) => void;
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
}

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
      aspectRatio: '1:1',
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
      removeReferenceImage: (index) =>
        set((s) => ({ referenceImages: s.referenceImages.filter((_, i) => i !== index) })),
      generatedImage: null,
      setGeneratedImage: (url) => set({ generatedImage: url }),
      isGenerating: false,
      setIsGenerating: (v) => set({ isGenerating: v }),
      history: [],
      addHistory: (item) =>
        set((s) => ({
          history: [item, ...s.history].slice(0, 20),
          historyIndex: 0,
        })),
      historyIndex: 0,
      setHistoryIndex: (v) => set({ historyIndex: v }),
      searchQuery: '',
      setSearchQuery: (v) => set({ searchQuery: v }),
      activeTab: 'all',
      setActiveTab: (v) => set({ activeTab: v }),
      apiKey: '',
      setApiKey: (v) => set({ apiKey: v }),
      baseUrl: 'https://www.right.codes/draw',
      setBaseUrl: (v) => set({ baseUrl: v }),
    }),
    {
      name: 'gen-image-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        apiKey: state.apiKey,
        baseUrl: state.baseUrl,
      }),
    },
  ),
);
