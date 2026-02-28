import { Slot, useRouter, useSegments, useRootNavigationState, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import '../global.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function InitialLayout() {
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

    return <Slot />;
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <InitialLayout />
        </QueryClientProvider>
    );
}
