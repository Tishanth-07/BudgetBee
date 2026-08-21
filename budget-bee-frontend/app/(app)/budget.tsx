import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api/client';
import { formatLKR } from '../../utils/currency';
import { logger } from '../../utils/logger';
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

    const queryClient = useQueryClient();
    const [payingExpense, setPayingExpense] = useState<any>(null);
    const [selectedAccount, setSelectedAccount] = useState<string>('');

    const { data: expensesGroups = [] } = useQuery({
        queryKey: ['expenses', scope],
        queryFn: async () => {
            const res = await apiRequest<any>('get', `/expenses?type=${scope.toLowerCase()}`);
            return res ?? [];
        }
    });

    const { data: accounts = [] } = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const res = await apiRequest<any>('get', '/accounts');
            return res ?? [];
        }
    });

    const { data: summary } = useQuery({
        queryKey: ['dashboard', 'summary'], // Reusing dashboard summary for the budget prototype stats
        queryFn: async () => {
            const res = await apiRequest<any>('get', '/dashboard/summary');
            return res ?? { totalBalance: 0, income: 0, expense: 0, recentTransactions: [] };
        },
        initialData: {
            totalBalance: 0,
            income: 0,
            expense: 0,
            recentTransactions: []
        }
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} edges={['top']}>
            <LinearGradient colors={['#A8C8F8', '#D6E4FF']} style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}>
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-navy font-bold text-2xl">Budget</Text>
                    <TouchableOpacity className="w-10 h-10 bg-white/50 rounded-full items-center justify-center">
                        <Ionicons name="search" size={20} color="#1A2B5E" />
                    </TouchableOpacity>
                </View>

                {/* Segmented Control */}
                <View className="bg-white/40 p-1 rounded-full flex-row mb-6">
                    <TouchableOpacity
                        className={clsx("flex-1 py-2.5 rounded-full items-center", scope === 'PERSONAL' && "bg-white")}
                        onPress={() => setScope('PERSONAL')}
                    >
                        <Text className={clsx("font-semibold text-sm", scope === 'PERSONAL' ? "text-navy" : "text-textsecondary")}>Personal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={clsx("flex-1 py-2.5 rounded-full items-center", scope === 'HOUSEHOLD' && "bg-white")}
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
                        {(!summary.recentTransactions || summary.recentTransactions.length === 0) ? (
                            <View className="items-center justify-center py-12">
                                <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
                                <Text className="text-textsecondary text-base mt-4 font-medium">No recent transactions</Text>
                            </View>
                        ) : (
                            summary.recentTransactions.map((t: Transaction) => {
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
                                            <Text className={`font-bold text-base ${t.type.toUpperCase() === 'INCOME' ? 'text-success' : 'text-textprimary'}`}>
                                                {t.type.toUpperCase() === 'INCOME' ? '+' : '-'}{formatLKR(t.amount)}
                                            </Text>
                                            <Text className="text-textsecondary text-xs mt-1">{new Date(t.date).toLocaleDateString("en-LK", { day: '2-digit', month: 'short' })}</Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                )}

                {activeTab === 'EXPENSES' && (
                    <View>
                        {expensesGroups.length === 0 ? (
                            <View className="items-center justify-center py-12">
                                <Ionicons name="pie-chart-outline" size={64} color="#D1D5DB" />
                                <Text className="text-textsecondary text-base mt-4 font-medium">No expenses tracked yet</Text>
                                <Text className="text-textsecondary text-xs mt-1 text-center">Add some transactions to see your spending breakdown by category.</Text>
                            </View>
                        ) : (
                            expensesGroups.map((group: any) => (
                                <View key={group.groupName} className="mb-6">
                                    <Text className="text-navy font-bold text-lg mb-3">{group.groupName}</Text>
                                    {group.items.map((expense: any) => (
                                        <View key={expense.id} className="bg-white p-4 rounded-card shadow-sm mb-3 flex-row justify-between items-center">
                                            <View className="flex-1">
                                                <Text className="font-bold text-textprimary text-base">{expense.name}</Text>
                                                <View className="flex-row items-center mt-1">
                                                    <Text className={clsx(
                                                        "text-[10px] px-2 py-0.5 rounded-full font-bold",
                                                        expense.priorityLevel === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                                                        expense.priorityLevel === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                                                        expense.priorityLevel === 'MEDIUM' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-gray-100 text-gray-600'
                                                    )}>
                                                        {expense.priorityLevel}
                                                    </Text>
                                                    {expense.daysUntilDue !== null && !expense.isPaid && (
                                                        <Text className={clsx(
                                                            "text-[10px] px-2 py-0.5 rounded-full ml-2 font-bold",
                                                            expense.daysUntilDue < 0 ? "bg-red-100 text-red-600" :
                                                            expense.daysUntilDue <= 3 ? "bg-yellow-100 text-yellow-600" :
                                                            "bg-gray-100 text-gray-600"
                                                        )}>
                                                            {expense.daysUntilDue < 0 ? `${Math.abs(expense.daysUntilDue)} days overdue` : `${expense.daysUntilDue} days left`}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                            <View className="items-end ml-2">
                                                <Text className="font-bold text-textprimary text-base">{formatLKR(expense.amount)}</Text>
                                                {expense.isPaid ? (
                                                    <Text className="text-success text-xs font-bold mt-1">Paid</Text>
                                                ) : (
                                                    <TouchableOpacity 
                                                        className="bg-primary px-4 py-1.5 rounded-full mt-2"
                                                        onPress={() => setPayingExpense(expense)}
                                                    >
                                                        <Text className="text-white text-xs font-bold">Pay Now</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ))
                        )}
                    </View>
                )}

                {activeTab === 'GOALS' && (
                    <View className="items-center justify-center py-12">
                        <Ionicons name="flag-outline" size={64} color="#D1D5DB" />
                        <Text className="text-textsecondary text-base mt-4 font-medium">No active goals</Text>
                        <TouchableOpacity className="h-14 bg-blue-600 rounded-2xl shadow-md flex-row justify-center items-center active:bg-blue-700 mt-4 px-8">
                            <Text className="font-bold text-white text-lg">Create a Goal</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {payingExpense && (
                <View className="absolute inset-0 bg-black/50 justify-center items-center p-4 z-50">
                    <View className="bg-white rounded-2xl w-full p-6">
                        <Text className="font-bold text-xl text-navy mb-2">Pay {payingExpense.name}</Text>
                        <Text className="text-textsecondary mb-4">Amount: {formatLKR(payingExpense.amount)}</Text>
                        
                        <Text className="font-semibold text-textprimary mb-2">Select Account to Deduct From</Text>
                        <ScrollView className="max-h-48 mb-4">
                            {accounts.map((acc: any) => (
                                <TouchableOpacity 
                                    key={acc.id} 
                                    className={clsx("p-3 rounded-xl border mb-2 flex-row justify-between items-center", selectedAccount === acc.id ? "border-primary bg-blue-50" : "border-gray-200")}
                                    onPress={() => setSelectedAccount(acc.id)}
                                >
                                    <Text className="font-semibold text-textprimary">{acc.name}</Text>
                                    <Text className="text-textsecondary text-sm">{formatLKR(acc.balance)}</Text>
                                </TouchableOpacity>
                            ))}
                            {accounts.length === 0 && (
                                <Text className="text-textsecondary">No accounts found.</Text>
                            )}
                        </ScrollView>

                        <View className="flex-row gap-3 mt-2">
                            <TouchableOpacity 
                                className="flex-1 bg-gray-200 py-3 rounded-xl items-center"
                                onPress={() => { setPayingExpense(null); setSelectedAccount(''); }}
                            >
                                <Text className="font-bold text-gray-700">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                className={clsx("flex-1 py-3 rounded-xl items-center", selectedAccount ? "bg-primary" : "bg-primary/50")}
                                disabled={!selectedAccount}
                                onPress={async () => {
                                    if (!selectedAccount) return;
                                    try {
                                        await apiRequest('patch', `/expenses/${payingExpense.id}/pay`, { accountId: selectedAccount });
                                        queryClient.invalidateQueries({ queryKey: ['expenses'] });
                                        queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
                                        queryClient.invalidateQueries({ queryKey: ['accounts'] });
                                        setPayingExpense(null);
                                        setSelectedAccount('');
                                    } catch (e) {
                                        logger.error('Payment failed', e);
                                        alert('Payment failed');
                                    }
                                }}
                            >
                                <Text className="font-bold text-white">Confirm Pay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
