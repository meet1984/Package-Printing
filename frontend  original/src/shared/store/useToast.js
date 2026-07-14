import { create } from 'zustand';

let idCounter = 0;

export const useToast = create((set, get) => ({
  toasts: [],

  showToast: (message, type = 'success', duration = 4000) => {
    const id = ++idCounter;
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, duration);
    return id;
  },

  dismissToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
}));
