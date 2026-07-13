import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getPageContent = async (key) => {
  const response = await axios.get(`${API_URL}/content/${key}`);
  return response.data;
};
