// import axios from 'axios';
// import store from '../redux/store';
// import { loginSuccess, logout } from '../redux/userAuthSlice';

// const apiClient = axios.create({
//   baseURL: 'http://localhost:4000',
//   headers: {
//     "Content-Type": "application/json"
//   }
// });

// // Request Interceptor
// apiClient.interceptors.request.use(
//   (config) => {
//     const state = store.getState();
//     const accessToken = state.userAuth.accessToken || localStorage.getItem('userAccessToken');
//     // console.log(accessToken, 'accessToken');
//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response Interceptor
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         console.log('hey')
//         const refreshToken = store.getState().userAuth.refreshToken || localStorage.getItem("userRefreshToken");
//         // console.log(localStorage.getItem('userAccessToken'),'AccessToken')
//         console.log(localStorage.getItem('userRefreshToken'),'RefreshTOken')
//         if (!refreshToken) {
//           console.log('ehllodsfd')
//         }
//         console.log(refreshToken,'hello')
//         const { data } = await apiClient.post("/user/refresh", { refreshToken });
//         // console.log(data,'daata')
//         // const { accessToken, refreshToken:newRefreshToken } = ;
//         const accessToken = data.message.accessToken
//         store.dispatch(loginSuccess({
//           accessToken:data.message.accessToken,
//           refreshToken: data.message.refreshToken,
//           isLoggedIn: true
//         }));

//         originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         console.error(refreshError);
//         // Clear the user's session if refresh fails
//         store.dispatch(logout({ isLoggedIn: false }));
//         localStorage.removeItem("userAccessToken");
//         localStorage.removeItem("userRefreshToken");
//         window.location.href = "/user/login";
//       }
//     }

//     if (error.response?.status === 403) {
//       console.warn("User is blocked. Logging out...");

//       store.dispatch(logout({ isLoggedIn: false }));
//       localStorage.removeItem("userAccessToken");
//       localStorage.removeItem("userRefreshToken");
//       window.location.href = "/user/login";
//     }

//     return Promise.reject(error);
//   }
// );

// export default apiClient;


// src/api/apiClient.ts
import axios from 'axios';
import store from '../redux/store';
import { loginSuccess as userLogin, logout as userLogout } from '../redux/userAuthSlice';
import { loginSuccess as hostLogin, logout as hostLogout } from '../redux/hostAuthSlice';
import { loginSuccess as adminLogin, logout as adminLogout } from '../redux/adminAuthSlice';
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';

type Role = 'user' | 'host' | 'admin';

interface AuthState {
  accessToken: string;
  refreshToken: string;
  isLoggedIn: boolean;
}

interface AuthConfig {
  accessTokenKey: string;
  refreshTokenKey: string;
  slice: {
    login: ActionCreatorWithPayload<AuthState>;
    logout: ActionCreatorWithPayload<{ isLoggedIn: boolean }>;
  };
  refreshEndpoint: string;
  loginRedirect: string;
}

const authConfig: Record<Role, AuthConfig> = {
  user: {
    accessTokenKey: 'userAccessToken',
    refreshTokenKey: 'userRefreshToken',
    slice: {
      login: userLogin,
      logout: userLogout,
    },
    refreshEndpoint: '/user/refresh',
    loginRedirect: '/user/login',
  },
  host: {
    accessTokenKey: 'hostAccessToken',
    refreshTokenKey: 'hostRefreshToken',
    slice: {
      login: hostLogin,
      logout: hostLogout,
    },
    refreshEndpoint: '/host/refresh',
    loginRedirect: '/host/login',
  },
  admin: {
    accessTokenKey: 'adminAccessToken',
    refreshTokenKey: 'adminRefreshToken',
    slice: {
      login: adminLogin,
      logout: adminLogout,
    },
    refreshEndpoint: '/admin/refresh',
    loginRedirect: '/admin/login',
  },
};

const createApiClient = (role: Role) => {
  const config = authConfig[role];

  const instance = axios.create({
    baseURL: 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use(
    (req) => {
      const state = store.getState();
      const authState = state[`${role}Auth` as keyof typeof state] as AuthState;
      const accessToken = authState?.accessToken || localStorage.getItem(config.accessTokenKey);

      if (accessToken) {
        req.headers.Authorization = `Bearer ${accessToken}`;
      }

      return req;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const state = store.getState();
          const authState = state[`${role}Auth` as keyof typeof state] as AuthState;
          const refreshToken =
            authState?.refreshToken || localStorage.getItem(config.refreshTokenKey);

          if (!refreshToken) throw new Error('Refresh token missing');

          const { data } = await axios.post(
            `http://localhost:4000${config.refreshEndpoint}`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefresh } = data.message;

          store.dispatch(
            config.slice.login({
              accessToken,
              refreshToken: newRefresh,
              isLoggedIn: true,
            })
          );

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshErr) {
          console.error(refreshErr);
          store.dispatch(config.slice.logout({ isLoggedIn: false }));
          localStorage.removeItem(config.accessTokenKey);
          localStorage.removeItem(config.refreshTokenKey);
          window.location.href = config.loginRedirect;
        }
      }

      if (error.response?.status === 403) {
        console.warn(`${role.toUpperCase()} is blocked. Logging out...`);
        store.dispatch(config.slice.logout({ isLoggedIn: false }));
        localStorage.removeItem(config.accessTokenKey);
        localStorage.removeItem(config.refreshTokenKey);
        window.location.href = config.loginRedirect;
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export default createApiClient;
