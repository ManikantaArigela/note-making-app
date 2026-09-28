import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim();
  }
  // Fallback for production deployment on Vercel
  if (import.meta.env.PROD) {
    return 'https://workregister-wjz3.onrender.com/api';
  }
  return '/api';
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('productivity_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    // Notify connection is healthy on successful API response
    window.dispatchEvent(new CustomEvent('connection:status', { detail: { online: true, status: 'ok' } }));
    return response;
  },
  async (error) => {
    const config = error.config || {};
    const url = config.url || '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');

    if (error.response && error.response.status === 401 && !isAuthRoute) {
      localStorage.removeItem('productivity_token');
      localStorage.removeItem('productivity_user');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      return Promise.reject(error);
    }

    // Handle Network drop or 502/503/504 errors
    const isNetworkOrServerError =
      !error.response || (error.response.status >= 500 && error.response.status <= 504);

    if (isNetworkOrServerError) {
      window.dispatchEvent(new CustomEvent('connection:status', { detail: { online: false, status: 'degraded' } }));
    }

    // Retry Logic for GET / idempotent requests
    const isGetRequest = config.method === 'get';
    const currentRetry = config._retryCount || 0;
    const maxRetries = 3;

    if (isNetworkOrServerError && isGetRequest && currentRetry < maxRetries) {
      config._retryCount = currentRetry + 1;
      const backoffDelay = Math.pow(2, currentRetry) * 1000;
      console.warn(`[API Retry]: Request to ${url} failed. Retrying in ${backoffDelay}ms (Attempt ${config._retryCount}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      return axiosClient(config);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;


