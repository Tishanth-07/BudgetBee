import { Slot, useRouter, useSegments, useRootNavigationState, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, LogBox } from 'react-native';

LogBox.ignoreLogs(['SafeAreaView has been deprecated']);
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import { useAuthStore } from '../store/authStore';
import '../global.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
        },
    },
});

const customStorage = {
    getItem: async (key: string) => {
        try {
            return await AsyncStorage.getItem(key);
        } catch (error) {
            console.error('AsyncStorage getItem error:', error);
            return null;
        }
    },
    setItem: async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error('AsyncStorage setItem error:', error);
        }
    },
    removeItem: async (key: string) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('AsyncStorage removeItem error:', error);
        }
    },
};

const asyncStoragePersister = createAsyncStoragePersister({
    storage: customStorage,
});

function InitialLayout() {
    const netInfo = useNetInfo();
    const { isAuthenticated, isReady, loadToken } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        loadToken();
    }, []);

    useEffect(() => {
        if (!navigationState?.key || !isReady) return; // Wait for navigation and auth to be ready

        const inAuthGroup = segments[0] === '(auth)';

        if (isAuthenticated && inAuthGroup) {
            router.replace('/(app)');
        } else if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/welcome');
        }

        // Hide splash screen since routing decision is made
        SplashScreen.hideAsync();
    }, [isAuthenticated, isReady, segments, navigationState?.key]);

    return (
        <View style={{ flex: 1 }}>
            {!netInfo.isConnected && netInfo.type !== 'unknown' && (
                <View className="bg-red-500 py-1 items-center z-50">
                    <Text className="text-white text-xs font-semibold">You are offline. Showing cached data.</Text>
                </View>
            )}
            <Slot />
        </View>
    );
}

export default function RootLayout() {
    return (
        <PersistQueryClientProvider 
            client={queryClient} 
            persistOptions={{ persister: asyncStoragePersister, maxAge: 1000 * 60 * 60 * 24 }}
        >
            <InitialLayout />
        </PersistQueryClientProvider>
    );
}
