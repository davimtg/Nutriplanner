import axios from 'axios';

// Instância do Axios
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Prefixo /api definido no server
});

// Interceptor para adicionar Token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
