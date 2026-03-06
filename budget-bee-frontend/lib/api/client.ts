import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.194.44.56:5001/api';

export const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await SecureStore.getItemAsync('refreshToken');
                if (!refreshToken) throw new Error('No refresh token available');

                // Make a direct axios call to avoid interceptors
                const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                await SecureStore.setItemAsync('token', accessToken);
                await SecureStore.setItemAsync('refreshToken', newRefreshToken);

                // Update Zustand store (if needed, though this is outside React lifecycle)
                useAuthStore.getState().login(accessToken, newRefreshToken, useAuthStore.getState().user);

                processQueue(null, accessToken);

                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = 'Bearer ' + accessToken;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Trigger logout via store
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Universal API Request Wrapper
 * Unwraps the { success, data, message } envelope.
 */
export async function apiRequest<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: any,
    config?: AxiosRequestConfig
): Promise<T> {
    const response: AxiosResponse<{ success: boolean; data: T; message: string; error?: string }> = await api({
        method,
        url,
        data,
        ...config,
    });

    if (response.data && response.data.success !== undefined) {
        if (!response.data.success) {
            throw new Error(response.data.message || 'API Error');
        }
        return response.data.data;
    }

    // Fallback if not enveloped
    return response.data as any as T;
}
