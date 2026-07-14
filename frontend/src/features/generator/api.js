import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export const getPublicTemplates = async () => {
  const { data } = await api.get('/templates?status=published');
  return data;
};

export const renderServerMockup = async (templateId, designImageFile, transform) => {
  const formData = new FormData();
  formData.append('templateId', templateId);
  formData.append('designImage', designImageFile);
  formData.append('transform', JSON.stringify(transform));

  const { data } = await api.post('/mockups/render', formData);
  return data; // { url: '...' }
};
