import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../auth/tokenStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5151';

export const api = axios.create({
  baseURL: BASE_URL,
});

// Attach access token if available
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh on 401
let isRefreshing = false;
let pending = [];

function subscribe(callback) { pending.push(callback); }
function onRefreshed(tokens) { pending.forEach(cb => cb(tokens)); pending = []; }

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const rt = getRefreshToken();
          if (!rt) throw new Error('No refresh token');
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: rt });
          setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
          onRefreshed({ accessToken: data.accessToken });
        } catch (e) {
          clearTokens();
          isRefreshing = false;
          return Promise.reject(error);
        }
        isRefreshing = false;
      }
      return new Promise((resolve) => {
        subscribe((tokens) => {
          original.headers.Authorization = `Bearer ${tokens.accessToken}`;
          resolve(api(original));
        });
      });
    }
    return Promise.reject(error);
  }
);
