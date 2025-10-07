

import axios from 'axios';
import store from '../redux/store';
import { loginSuccess as userLogin, logout as userLogout } from '../redux/userAuthSlice';
import { loginSuccess as hostLogin, logout as hostLogout } from '../redux/hostAuthSlice';
import { loginSuccess as adminLogin, logout as adminLogout } from '../redux/adminAuthSlice';
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';
const apiUrl = import.meta.env.VITE_BACKEND_URL;

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
    refreshEndpoint: '/user/token/refresh',
    loginRedirect: '/login',
  },
  host: {
    accessTokenKey: 'hostAccessToken',
    refreshTokenKey: 'hostRefreshToken',
    slice: {
      login: hostLogin,
      logout: hostLogout,
    },
    refreshEndpoint: '/host/token/refresh',
    loginRedirect: '/host/login',
  },
  admin: {
    accessTokenKey: 'adminAccessToken',
    refreshTokenKey: 'adminRefreshToken',
    slice: {
      login: adminLogin,
      logout: adminLogout,
    },
    refreshEndpoint: '/admin/token/refresh',
    loginRedirect: '/admin/login',
  },
};

const createApiClient = (role: Role) => {
  const config = authConfig[role];

  const instance = axios.create({
    baseURL: apiUrl,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use(
    (req) => {
      const accessToken = localStorage.getItem(config.accessTokenKey);
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
      console.log(error.response.status,'Status',originalRequest._retry)
      if(error.response.status == 404 || error.response.status== 401){
        store.dispatch(config.slice.logout({ isLoggedIn: false }));
          localStorage.removeItem(config.accessTokenKey);
          localStorage.removeItem(config.refreshTokenKey);
          // window.location.href = config.loginRedirect;
      }
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newRefreshToken = localStorage.getItem(config.refreshTokenKey);
          if (!newRefreshToken) throw new Error('Refresh token missing');
          const { data } = await axios.post(
            `${apiUrl}${config.refreshEndpoint}`,
            { refreshToken:newRefreshToken }
          );
          const { accessToken, refreshToken } = data.message;
          console.log(data.message)
          store.dispatch(
            config.slice.login({
              accessToken,
              refreshToken: refreshToken,
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
          // window.location.href = config.loginRedirect;
        }
      }


      if (error.response?.status == 403 && error.response.message == `Access denied:Not a ${role.toUpperCase()}`) {
        console.warn(`Access denied:Not a ${role.toUpperCase()}`);
        //  window.location.href = config.loginRedirect;
      }
      console.log(error, 'Error Und')
      if (error.response?.status === 403) {
        console.warn(`${role.toUpperCase()} is blocked. Logging out...`);
        store.dispatch(config.slice.logout({ isLoggedIn: false }));
        localStorage.removeItem(config.accessTokenKey);
        localStorage.removeItem(config.refreshTokenKey);
        // window.location.href = config.loginRedirect;
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export default createApiClient;
