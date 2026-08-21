import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api/client';
import { Ionicons } from '@expo/vector-icons';

export default function Advices() {
    const { data: advices = [], isLoading } = useQuery({
        queryKey: ['advices'],
        queryFn: async () => {
            const res = await apiRequest<any>('get', '/advices');
            return res ?? [];
        }
    });

    return (
        <SafeAreaView className="flex-1 bg-blue-50 items-center justify-center">
            {isLoading ? (
                <ActivityIndicator size="large" color="#1A56E8" />
            ) : advices.length === 0 ? (
                <View className="items-center justify-center">
                    <Ionicons name="bulb-outline" size={64} color="#9CA3AF" />
                    <Text className="text-2xl font-bold text-blue-900 mt-4">Advices</Text>
                    <Text className="text-blue-500 mt-2">No advices available right now.</Text>
                </View>
            ) : (
                <View className="items-center justify-center">
                    <Text className="text-2xl font-bold text-blue-900">Advices</Text>
                    <Text className="text-blue-500 mt-2">You have {advices.length} tips available.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}
