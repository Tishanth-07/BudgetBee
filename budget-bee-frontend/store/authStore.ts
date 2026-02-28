import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
    token: string | null;
    user: any | null;
    isAuthenticated: boolean;
    isReady: boolean;
    login: (token: string, user: any) => Promise<void>;
    logout: () => Promise<void>;
    loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isAuthenticated: false,
    isReady: false,
    login: async (token, user) => {
        await SecureStore.setItemAsync('token', token);
        set({ token, user, isAuthenticated: true, isReady: true });
    },
    logout: async () => {
        await SecureStore.deleteItemAsync('token');
        set({ token: null, user: null, isAuthenticated: false });
    },
    loadToken: async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                set({ token, isAuthenticated: true, isReady: true });
            } else {
                set({ isReady: true });
            }
        } catch (error) {
            set({ isReady: true });
        }
    },
}));
