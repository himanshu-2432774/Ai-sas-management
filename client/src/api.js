import axios from "axios";

export const TOKEN_KEY = "ai-saas-access-token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.localStorage.getItem(TOKEN_KEY)
    ) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("session:expired"));
    }

    return Promise.reject(error);
  },
);

export function getApiError(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}
