import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getProducts = async (categorySlug) => {
  const url = categorySlug 
    ? `${API_URL}/products?category=${categorySlug}` 
    : `${API_URL}/products`;
  const response = await axios.get(url);
  return response.data;
};

export const getProductBySlug = async (slug) => {
  const response = await axios.get(`${API_URL}/products/${slug}`);
  return response.data;
};
