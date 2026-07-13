import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/categories`);
  return response.data;
};

export const getCategory = async (slug) => {
  const response = await axios.get(`${API_URL}/categories/${slug}`);
  return response.data;
};
