import { Slot, useRouter, useSegments } from 'expo-router';
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

    useEffect(() => {
        loadToken();
    }, []);

    useEffect(() => {
        const inAuthGroup = segments[0] === '(auth)';

        if (isAuthenticated && inAuthGroup) {
            router.replace('/(app)');
        } else if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/welcome');
        }
    }, [isAuthenticated, segments]);

    return <Slot />;
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <InitialLayout />
        </QueryClientProvider>
    );
}
