import axios from 'axios';

// Remove trailing slash if present to prevent double slashes
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export default API_URL;
