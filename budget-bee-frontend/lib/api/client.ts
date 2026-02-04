import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Change this to your machine's IP for Android emulator (e.g. 10.0.2.2 or local IP)
// For iOS simulator, localhost is fine.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

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
