import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export const getTemplates = async (params = {}) => {
  const { data } = await api.get('/templates', { params });
  return data;
};

export const getTemplate = async (id) => {
  const { data } = await api.get(`/templates/${id}`);
  return data;
};

export const createTemplate = async (templateData) => {
  const { data } = await api.post('/templates', templateData);
  return data;
};

export const updateTemplate = async (id, templateData) => {
  const { data } = await api.patch(`/templates/${id}`, templateData);
  return data;
};

export const deleteTemplate = async (id) => {
  const { data } = await api.delete(`/templates/${id}`);
  return data;
};
