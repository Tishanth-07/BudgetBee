import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api/client';

export default function Dashboard() {
    const { logout, user } = useAuthStore();

    const { data: transactions } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const res = await api.get('/transactions');
            return res.data;
        }
    });

    return (
        <ScrollView className="flex-1 bg-gray-50 p-4">
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold">Hello, {user?.name}</Text>
                <TouchableOpacity onPress={logout}>
                    <Text className="text-red-500">Logout</Text>
                </TouchableOpacity>
            </View>

            <View className="bg-yellow-500 p-6 rounded-xl mb-6 shadow-sm">
                <Text className="text-white opacity-80 mb-1">Total Balance</Text>
                <Text className="text-white text-3xl font-bold">$1,250.00</Text>
            </View>

            <Text className="text-lg font-bold mb-4">Recent Transactions</Text>
            {transactions?.map((t: any) => (
                <View key={t.id} className="bg-white p-4 rounded-lg mb-3 shadow-sm flex-row justify-between">
                    <View>
                        <Text className="font-bold">{t.category?.name || 'Uncategorized'}</Text>
                        <Text className="text-gray-500 text-xs">{new Date(t.date).toLocaleDateString()}</Text>
                    </View>
                    <Text className={t.type === 'expense' ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                        {t.type === 'expense' ? '-' : '+'}${t.amount}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );
}
