import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api/client';
import { formatLKR } from '../../utils/currency';
import clsx from 'clsx';

interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    date: string;
    merchant: string | null;
    category?: { name: string; color: string; icon: string };
}

const ICON_MAP: Record<string, string> = {
    fork: "restaurant-outline",
    car: "car-outline",
    house: "home-outline",
    stethoscope: "medkit-outline",
    "gift-box": "gift-outline",
    diamond: "diamond-outline",
    heart: "heart-outline",
    pants: "bag-outline",
    paw: "paw-outline",
    dots: "pricetag-outline",
};

export default function Budget() {
    const [scope, setScope] = useState<'PERSONAL' | 'HOUSEHOLD'>('PERSONAL');
    const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'EXPENSES' | 'GOALS'>('TRANSACTIONS');

    const { data: summary } = useQuery({
        queryKey: ['dashboard', 'summary'], // Reusing dashboard summary for the budget prototype stats
        queryFn: async () => {
            return await apiRequest<any>('get', '/dashboard/summary');
        },
        initialData: {
            totalBalance: 0,
            income: 0,
            expense: 0,
            recentTransactions: []
        }
    });

    return (
        <SafeAreaView className="flex-1 bg-appbg" edges={['top']}>
            <LinearGradient colors={['#A8C8F8', '#D6E4FF']} className="px-6 pt-4 pb-6 rounded-b-[40px]">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-navy font-bold text-2xl">Budget</Text>
                    <TouchableOpacity className="w-10 h-10 bg-white/50 rounded-full items-center justify-center">
                        <Ionicons name="search" size={20} color="#1A2B5E" />
                    </TouchableOpacity>
                </View>

                {/* Segmented Control */}
                <View className="bg-white/40 p-1 rounded-full flex-row mb-6">
                    <TouchableOpacity
                        className={clsx("flex-1 py-2.5 rounded-full items-center", scope === 'PERSONAL' && "bg-white shadow-sm")}
                        onPress={() => setScope('PERSONAL')}
                    >
                        <Text className={clsx("font-semibold text-sm", scope === 'PERSONAL' ? "text-navy" : "text-textsecondary")}>Personal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={clsx("flex-1 py-2.5 rounded-full items-center", scope === 'HOUSEHOLD' && "bg-white shadow-sm")}
                        onPress={() => setScope('HOUSEHOLD')}
                    >
                        <Text className={clsx("font-semibold text-sm", scope === 'HOUSEHOLD' ? "text-navy" : "text-textsecondary")}>Household</Text>
                    </TouchableOpacity>
                </View>

                {/* Dashboard / Summary Card */}
                <View className="items-center mb-2">
                    <Text className="text-textsecondary font-medium text-sm mb-1">Total Balance</Text>
                    <Text className="text-navy text-4xl font-bold">{formatLKR(summary.totalBalance)}</Text>
                    <Text className="text-success text-xs font-semibold mt-2 bg-success/10 px-3 py-1 rounded-full">
                        + {formatLKR(summary.income)} this month
                    </Text>
                </View>
            </LinearGradient>

            {/* Sub Tabs */}
            <View className="flex-row px-6 mt-6 mb-4 justify-between border-b border-gray-200 pb-2">
                {[
                    { id: 'TRANSACTIONS', label: 'Transactions' },
                    { id: 'EXPENSES', label: 'Expenses' },
                    { id: 'GOALS', label: 'Goals' }
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id as any)}
                        className={clsx("pb-2 px-2", activeTab === tab.id && "border-b-2 border-primary")}
                    >
                        <Text className={clsx("font-semibold", activeTab === tab.id ? "text-primary text-base" : "text-textsecondary text-sm")}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView className="flex-1 px-6 pt-2" contentContainerStyle={{ paddingBottom: 100 }}>
                {activeTab === 'TRANSACTIONS' && (
                    <View>
                        {summary.recentTransactions.map((t: Transaction) => {
                            const iconKey = t.category?.icon ?? "dots";
                            const icon = (ICON_MAP[iconKey] ?? "pricetag-outline") as any;
                            const color = t.category?.color ?? "#6B7280";

                            return (
                                <View key={t.id} className="transaction-row mb-4 flex-row justify-between items-center bg-white p-4 rounded-card shadow-sm">
                                    <View className="flex-row items-center gap-4">
                                        <View className="w-12 h-12 rounded-avatar items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                                            <Ionicons name={icon} size={24} color={color} />
                                        </View>
                                        <View>
                                            <Text className="font-bold text-textprimary text-base mb-0.5">{t.merchant || t.category?.name || 'Uncategorized'}</Text>
                                            <Text className="text-textsecondary text-xs">{t.category?.name || 'General'}</Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className={`font-bold text-base ${t.type === 'INCOME' ? 'text-success' : 'text-textprimary'}`}>
                                            {t.type === 'INCOME' ? '+' : '-'}{formatLKR(t.amount)}
                                        </Text>
                                        <Text className="text-textsecondary text-xs mt-1">{new Date(t.date).toLocaleDateString("en-LK", { day: '2-digit', month: 'short' })}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {activeTab === 'EXPENSES' && (
                    <View className="items-center justify-center py-12">
                        <Ionicons name="pie-chart-outline" size={64} color="#D1D5DB" />
                        <Text className="text-textsecondary text-base mt-4 font-medium">No expenses tracked yet</Text>
                        <Text className="text-textsecondary text-xs mt-1 text-center">Add some transactions to see your spending breakdown by category.</Text>
                    </View>
                )}

                {activeTab === 'GOALS' && (
                    <View className="items-center justify-center py-12">
                        <Ionicons name="flag-outline" size={64} color="#D1D5DB" />
                        <Text className="text-textsecondary text-base mt-4 font-medium">No active goals</Text>
                        <TouchableOpacity className="mt-4 bg-primary/10 px-4 py-2 rounded-full">
                            <Text className="text-primary font-bold">Create a Goal</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
