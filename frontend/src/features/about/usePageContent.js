import { create } from 'zustand';
import { getPageContent } from './api';

export const usePageContent = create((set) => ({
  pages: {},
  loading: false,
  error: null,
  
  fetchPage: async (key) => {
    set({ loading: true, error: null });
    try {
      const data = await getPageContent(key);
      set((state) => ({
        pages: { ...state.pages, [key]: data.content },
        loading: false
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));
