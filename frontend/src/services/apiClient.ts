import axios from 'axios';
import store from '../redux/store';
import { loginSuccess, logout } from '../redux/userAuthSlice';

const apiClient = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.userAuth.accessToken || localStorage.getItem('userAccessToken');
    // console.log(accessToken, 'accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log('hey')
        const refreshToken = store.getState().userAuth.refreshToken || localStorage.getItem("userRefreshToken");
        // console.log(localStorage.getItem('userAccessToken'),'AccessToken')
        console.log(localStorage.getItem('userRefreshToken'),'RefreshTOken')
        if (!refreshToken) {
          console.log('ehllodsfd')
        }
        console.log(refreshToken,'hello')
        const { data } = await apiClient.post("/user/refresh", { refreshToken });
        // console.log(data,'daata')
        // const { accessToken, refreshToken:newRefreshToken } = ;
        const accessToken = data.message.accessToken
        store.dispatch(loginSuccess({
          accessToken:data.message.accessToken,
          refreshToken: data.message.refreshToken,
          isLoggedIn: true
        }));

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error(refreshError);
        // Clear the user's session if refresh fails
        store.dispatch(logout({ isLoggedIn: false }));
        localStorage.removeItem("userAccessToken");
        localStorage.removeItem("userRefreshToken");
        window.location.href = "/user/login";
      }
    }

    if (error.response?.status === 403) {
      console.warn("User is blocked. Logging out...");

      store.dispatch(logout({ isLoggedIn: false }));
      localStorage.removeItem("userAccessToken");
      localStorage.removeItem("userRefreshToken");
      window.location.href = "/user/login";
    }

    return Promise.reject(error);
  }
);

export default apiClient;
