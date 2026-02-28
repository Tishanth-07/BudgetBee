import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import '../global.css';

const queryClient = new QueryClient();

function InitialLayout() {
    const { isAuthenticated, loadToken } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        loadToken();
    }, []);

    useEffect(() => {
        if (!navigationState?.key) return; // Wait for navigation to be ready

        const inAuthGroup = segments[0] === '(auth)';

        if (isAuthenticated && inAuthGroup) {
            router.replace('/(app)');
        } else if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/welcome');
        }
    }, [isAuthenticated, segments, navigationState?.key]);

    return <Slot />;
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <InitialLayout />
        </QueryClientProvider>
    );
}
