import axios from 'axios';
import store from '../redux/store';
import { loginSuccess } from '../redux/hostAuthSlice';

const hostapiClient = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    "Content-Type": "application/json"
  }
});

hostapiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    let accessToken = state.hostAuth.accessToken;
    if (!accessToken) {
      accessToken = localStorage.getItem('hostAccessToken') || '';
    }
    console.log(accessToken, 'accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

hostapiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('hostRefreshToken');
        console.log(refreshToken,'refrshToken')
        if (!refreshToken) {
          throw new Error('Refresh token not available');
        }

        const { data } = await axios.post('http://localhost:4000/host/refresh', { refreshToken });
        const { accessToken } = data.message;
        // console.log(data,'data')

        store.dispatch(loginSuccess({
          accessToken:data.message.accessToken,
          refreshToken:data.message.refreshToken,
          isLoggedIn:true
      }))

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return hostapiClient(originalRequest);
      } catch (refreshError) {
        console.error(refreshError,'error');
        // Clear tokens and redirect to login page
        localStorage.removeItem('hostToken');
        localStorage.removeItem('refreshToken');
        window.location.href = "/host/login";
      }
    }

    return Promise.reject(error);
  }
);

export default hostapiClient;
