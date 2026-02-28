import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "../../../lib/api/client";

interface Transaction {
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    date: string;
    merchant: string | null;
    category?: { name: string; color: string; icon: string };
}

interface AccountDetail {
    id: string;
    name: string;
    type: "BANK" | "CASH" | "CARD";
    balance: number;
    cardNumber?: string;
    cardNetwork?: string;
    cardHolder?: string;
    expiry?: string;
}

function formatLKR(amount: number) {
    return amount.toLocaleString("en-LK");
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-LK", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getCategoryPresentation(category?: { name: string; color: string; icon: string }) {
    if (!category) return { icon: "pricetag-outline" as const, color: "#6B7280" };
    const iconMap: Record<string, string> = {
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
    return {
        icon: (iconMap[category.icon] ?? "pricetag-outline") as any,
        color: category.color ?? "#6B7280",
    };
}

export default function AccountDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const { data: account } = useQuery<AccountDetail>({
        queryKey: ["account", id],
        queryFn: async () => {
            const res = await api.get(`/accounts/${id}`);
            return res.data.data as AccountDetail;
        },
        enabled: !!id,
    });

    const { data: txData, isRefetching, refetch } = useQuery<{ items: Transaction[] }>({
        queryKey: ["transactions", "account", id],
        queryFn: async () => {
            const res = await api.get("/transactions", { params: { accountId: id, limit: 20 } });
            return res.data.data as { items: Transaction[] };
        },
        enabled: !!id,
    });

    const transactions = txData?.items ?? [];

    return (
        <SafeAreaView className="flex-1 bg-appbg" edges={["top"]}>
            {/* Header + Card Widget */}
            <LinearGradient colors={["#A8C8F8", "#D6E4FF"]} className="px-4 pt-4 pb-6">
                <View className="flex-row items-center gap-3 mb-6">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#1A2B5E" />
                    </TouchableOpacity>
                    <Text className="text-navy font-bold text-xl">{account?.name ?? "Account"}</Text>
                </View>

                {account?.type === "BANK" && (
                    <View className="bg-gray-200/80 rounded-card p-5 mx-2">
                        <Text className="text-navy font-bold text-2xl mb-1">
                            {account.cardNetwork ?? "BANK"}
                        </Text>
                        <Text className="text-textsecondary text-sm mb-1">
                            **** **** **** {account.cardNumber ?? "----"}
                        </Text>
                        <View className="flex-row justify-between items-end mt-4">
                            <View>
                                <Text className="text-textbody font-semibold text-base">
                                    {account.cardHolder ?? "Cardholder"}
                                </Text>
                                <Text className="text-navy font-bold text-2xl mt-2">
                                    {formatLKR(account.balance)} LKR
                                </Text>
                            </View>
                            {account.expiry && (
                                <Text className="text-textsecondary text-sm">{account.expiry}</Text>
                            )}
                        </View>
                    </View>
                )}

                {account?.type !== "BANK" && (
                    <View className="bg-white rounded-card p-4 mx-2 flex-row items-center justify-between shadow-card">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="layers-outline" size={36} color="#6B7280" />
                            <Text className="text-textprimary font-bold text-lg">{account?.name}</Text>
                        </View>
                        <Text className="text-navy font-bold text-xl">
                            {formatLKR(account?.balance ?? 0)} LKR
                        </Text>
                    </View>
                )}
            </LinearGradient>

            {/* Transaction List */}
            <FlatList
                className="flex-1 px-4 pt-4"
                data={transactions}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1A56E8" />
                }
                ListHeaderComponent={
                    <Text className="text-textsecondary text-sm text-center mb-4">
                        Recent Transactions
                    </Text>
                }
                renderItem={({ item }) => {
                    const { icon, color } = getCategoryPresentation(item.category);
                    return (
                        <View className="transaction-row">
                            <View
                                className="w-12 h-12 rounded-avatar items-center justify-center mr-3"
                                style={{ backgroundColor: `${color}20` }}
                            >
                                <Ionicons name={icon} size={22} color={color} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-textsecondary text-xs mb-0.5">
                                    {formatDate(item.date)}
                                </Text>
                                <Text className="text-textprimary font-semibold text-base">
                                    {item.merchant ?? "—"}
                                </Text>
                            </View>
                            <Text
                                className={`font-bold text-base ${item.type === "INCOME" ? "text-success" : "text-textprimary"
                                    }`}
                            >
                                {item.type === "INCOME" ? "+" : "-"}{formatLKR(item.amount)} LKR
                            </Text>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View className="items-center py-12">
                        <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                        <Text className="text-textsecondary text-base mt-3">No transactions yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
