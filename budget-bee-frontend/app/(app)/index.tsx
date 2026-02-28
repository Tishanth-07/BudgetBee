import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api/client';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal } from 'lucide-react-native';

export default function Dashboard() {
    const { user } = useAuthStore();

    const { data: transactions } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const res = await api.get('/transactions');
            return res.data;
        }
    });

    // Calculate Balance (Mock logic if backend doesn't return balance)
    const income = transactions?.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0) || 0;
    const expense = transactions?.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0) || 0;
    const totalBalance = income - expense;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View className="flex-row justify-between items-center px-6 pt-4 mb-6">
                    <View>
                        <Text className="text-gray-500 font-medium">Hello,</Text>
                        <Text className="text-2xl font-bold text-gray-900">{user?.firstName || user?.name}</Text>
                    </View>
                    <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center border-2 border-white shadow-sm">
                        <Text className="text-xl">👤</Text>
                    </View>
                </View>

                {/* Balance Card */}
                <View className="px-6 mb-8">
                    <LinearGradient
                        colors={['#3B82F6', '#2563EB']} // Blue-500 to Blue-600
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-3xl p-6 shadow-lg shadow-blue-200"
                    >
                        <View className="flex-row justify-between items-start mb-8">
                            <View>
                                <Text className="text-blue-100 font-medium mb-1">Total Balance</Text>
                                <Text className="text-white text-4xl font-bold">${totalBalance.toFixed(2)}</Text>
                            </View>
                            <TouchableOpacity>
                                <MoreHorizontal color="white" size={24} opacity={0.8} />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row justify-between">
                            <View>
                                <View className="flex-row items-center gap-1 mb-1">
                                    <View className="bg-blue-400/30 p-1 rounded-full">
                                        <ArrowDownLeft size={16} color="white" />
                                    </View>
                                    <Text className="text-blue-100 text-sm">Income</Text>
                                </View>
                                <Text className="text-white font-bold text-lg">${income.toFixed(2)}</Text>
                            </View>
                            <View>
                                <View className="flex-row items-center gap-1 mb-1">
                                    <View className="bg-blue-400/30 p-1 rounded-full">
                                        <ArrowUpRight size={16} color="white" />
                                    </View>
                                    <Text className="text-blue-100 text-sm">Expenses</Text>
                                </View>
                                <Text className="text-white font-bold text-lg">${expense.toFixed(2)}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Transactions Header */}
                <View className="flex-row justify-between items-center px-6 mb-4">
                    <Text className="text-xl font-bold text-gray-900">Recent Transactions</Text>
                    <TouchableOpacity>
                        <Text className="text-blue-500 font-medium">See All</Text>
                    </TouchableOpacity>
                </View>

                {/* Transactions List */}
                <View className="px-6">
                    {transactions?.slice(0, 5).map((t: any) => (
                        <View key={t.id} className="bg-white p-4 rounded-2xl mb-3 shadow-sm flex-row justify-between items-center border border-gray-100">
                            <View className="flex-row items-center gap-4">
                                <View className={`w-12 h-12 rounded-full items-center justify-center ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <Text className="text-xl">{t.category?.emoji || (t.type === 'income' ? '💰' : '💸')}</Text>
                                </View>
                                <View>
                                    <Text className="font-bold text-gray-900 text-lg">{t.category?.name || 'Uncategorized'}</Text>
                                    <Text className="text-gray-500 text-sm">{new Date(t.date).toLocaleDateString()}</Text>
                                </View>
                            </View>
                            <Text className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {t.type === 'income' ? '+' : '-'}${t.amount}
                            </Text>
                        </View>
                    ))}
                    {!transactions?.length && (
                        <View className="items-center justify-center py-10">
                            <Text className="text-gray-400">No recent transactions</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
