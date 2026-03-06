import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: any | null;
    isAuthenticated: boolean;
    isReady: boolean;
    login: (token: string, refreshToken: string, user: any) => Promise<void>;
    logout: () => Promise<void>;
    loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    isReady: false,
    login: async (token, refreshToken, user) => {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        set({ token, refreshToken, user, isAuthenticated: true, isReady: true });
    },
    logout: async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('refreshToken');
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
    },
    loadToken: async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (token && refreshToken) {
                set({ token, refreshToken, isAuthenticated: true, isReady: true });
            } else {
                set({ isReady: true });
            }
        } catch (error) {
            set({ isReady: true });
        }
    },
}));
