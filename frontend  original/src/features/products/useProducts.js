import { create } from 'zustand';
import { getProducts, getProductBySlug } from './api';

export const useProducts = create((set) => ({
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  
  fetchProducts: async (categorySlug) => {
    set({ loading: true, error: null });
    try {
      const data = await getProducts(categorySlug);
      set({ products: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  
  fetchProductDetails: async (slug) => {
    set({ loading: true, error: null });
    try {
      const data = await getProductBySlug(slug);
      set({ currentProduct: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));
