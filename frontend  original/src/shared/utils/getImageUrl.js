export const getImageUrl = (path) => {
  if (!path) return '';
  if (!path.startsWith('/uploads')) return path;
  if (import.meta.env.DEV) return path; // Rely on Vite proxy in development
  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '';
  return baseUrl + path;
};
