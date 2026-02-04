import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
    token: string | null;
    user: any | null;
    isAuthenticated: boolean;
    login: (token: string, user: any) => Promise<void>;
    logout: () => Promise<void>;
    loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isAuthenticated: false,
    login: async (token, user) => {
        await SecureStore.setItemAsync('token', token);
        set({ token, user, isAuthenticated: true });
    },
    logout: async () => {
        await SecureStore.deleteItemAsync('token');
        set({ token: null, user: null, isAuthenticated: false });
    },
    loadToken: async () => {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            set({ token, isAuthenticated: true });
        }
    },
}));
