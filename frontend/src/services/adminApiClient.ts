import axios from 'axios';
import store from '../redux/store';
import { loginSuccess, logout } from '../redux/adminAuthSlice';

const adminApiClient = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor
adminApiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.adminAuth.accessToken || localStorage.getItem('adminAccessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
adminApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = store.getState().adminAuth.refreshToken || localStorage.getItem("adminRefreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        const { data } = await adminApiClient.post("/admin/refresh", { refreshToken });

        const accessToken = data.message.accessToken;

        store.dispatch(loginSuccess({
          accessToken: data.message.accessToken,
          refreshToken: data.message.refreshToken,
          isLoggedIn: true
        }));

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return adminApiClient(originalRequest);
      } catch (refreshError) {
        console.error(refreshError);

        store.dispatch(logout({ isLoggedIn: false }));
        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("adminRefreshToken");

        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);

export default adminApiClient;
