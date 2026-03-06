import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api/client';
import { formatLKR } from '../../utils/currency';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    date: string;
    merchant: string | null;
    category?: { name: string; color: string; icon: string };
}

interface DashboardSummary {
    totalBalance: number;
    income: number;
    expense: number;
    recentTransactions: Transaction[];
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

export default function Dashboard() {
    const { user } = useAuthStore();

    const { data: summary } = useQuery<DashboardSummary>({
        queryKey: ['dashboard', 'summary'],
        queryFn: async () => {
            return await apiRequest<DashboardSummary>('get', '/dashboard/summary');
        },
        initialData: {
            totalBalance: 0,
            income: 0,
            expense: 0,
            recentTransactions: []
        }
    });

    const ActionButton = ({ icon, label, onPress }: { icon: any, label: string, onPress?: () => void }) => (
        <TouchableOpacity className="items-center" onPress={onPress}>
            <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mb-2">
                <Ionicons name={icon} size={28} color="#1A56E8" />
            </View>
            <Text className="text-textprimary text-xs font-semibold">{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-appbg" edges={['top']}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View className="flex-row justify-between items-center px-6 pt-4 mb-6 mt-2">
                    <View className="flex-row items-center gap-3">
                        <View className="w-12 h-12 bg-gray-200 justify-center items-center rounded-avatar border-2 border-white shadow-sm overflow-hidden">
                            {user?.avatar ? (
                                <Image source={{ uri: user.avatar }} className="w-full h-full" />
                            ) : (
                                <Ionicons name="person" size={24} color="#9CA3AF" />
                            )}
                        </View>
                        <View>
                            <Text className="text-textsecondary text-sm">Good morning,</Text>
                            <Text className="text-xl font-bold text-navy">{user?.firstName || user?.name || 'User'}</Text>
                        </View>
                    </View>
                    <View className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                        <Ionicons name="notifications-outline" size={24} color="#1A2B5E" />
                        <View className="absolute top-2 right-2.5 w-2 h-2 bg-danger rounded-full" />
                    </View>
                </View>

                {/* Balance Card */}
                <View className="px-6 mb-8 mt-2">
                    <LinearGradient
                        colors={['#1E293B', '#1A56E8']} // Navy to Blue gradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-card p-6 shadow-lg"
                    >
                        <View className="mb-6">
                            <Text className="text-gray-300 font-medium mb-1 text-sm">Total Balance</Text>
                            <Text className="text-white text-4xl font-bold">{formatLKR(summary.totalBalance)}</Text>
                        </View>

                        <View className="flex-row justify-between">
                            <View className="flex-row items-center gap-3">
                                <View className="bg-white/20 p-2 rounded-full">
                                    <Ionicons name="arrow-down-outline" size={20} color="#34d399" />
                                </View>
                                <View>
                                    <Text className="text-gray-300 text-xs mb-0.5">Income</Text>
                                    <Text className="text-white font-bold text-base">{formatLKR(summary.income)}</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center gap-3">
                                <View className="bg-white/20 p-2 rounded-full">
                                    <Ionicons name="arrow-up-outline" size={20} color="#f87171" />
                                </View>
                                <View>
                                    <Text className="text-gray-300 text-xs mb-0.5">Expenses</Text>
                                    <Text className="text-white font-bold text-base">{formatLKR(summary.expense)}</Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Menu Grid */}
                <View className="flex-row justify-between px-8 mb-8">
                    <ActionButton icon="swap-horizontal-outline" label="Transfer" />
                    <ActionButton icon="paper-plane-outline" label="Send" />
                    <ActionButton icon="download-outline" label="Receive" />
                    <ActionButton icon="grid-outline" label="More" />
                </View>

                {/* Transactions Header */}
                <View className="flex-row justify-between items-center px-6 mb-4">
                    <Text className="text-lg font-bold text-textprimary">Recent Transactions</Text>
                    <TouchableOpacity>
                        <Text className="text-primary font-bold text-sm">See All</Text>
                    </TouchableOpacity>
                </View>

                {/* Transactions List */}
                <View className="px-6 bg-white rounded-t-3xl pt-2 flex-1 min-h-[300px]">
                    {summary.recentTransactions.map((t) => {
                        const iconKey = t.category?.icon ?? "dots";
                        const icon = (ICON_MAP[iconKey] ?? "pricetag-outline") as any;
                        const color = t.category?.color ?? "#6B7280";

                        return (
                            <View key={t.id} className="transaction-row mb-4 flex-row justify-between items-center">
                                <View className="flex-row items-center gap-4">
                                    <View className="w-12 h-12 rounded-avatar items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                                        <Ionicons name={icon} size={24} color={color} />
                                    </View>
                                    <View>
                                        <Text className="font-bold text-textprimary text-base mb-0.5">{t.merchant || t.category?.name || 'Uncategorized'}</Text>
                                        <Text className="text-textsecondary text-xs">{new Date(t.date).toLocaleDateString("en-LK", { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                                    </View>
                                </View>
                                <Text className={`font-bold text-base ${t.type === 'INCOME' ? 'text-success' : 'text-textprimary'}`}>
                                    {t.type === 'INCOME' ? '+' : '-'}{formatLKR(t.amount)}
                                </Text>
                            </View>
                        );
                    })}
                    {!summary.recentTransactions.length && (
                        <View className="items-center justify-center py-10">
                            <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                            <Text className="text-textsecondary mt-2">No recent transactions</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
