import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../../lib/api/client";

interface Transaction {
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    date: string;
    merchant: string | null;
    category?: { name: string; color: string; icon: string };
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

export default function CashTransactions() {
    const router = useRouter();

    const { data: txData, isRefetching, refetch } = useQuery<{ items: Transaction[]; total: number }>({
        queryKey: ["transactions", "cash"],
        queryFn: async () => {
            const res = await api.get("/transactions", { params: { limit: 50 } });
            return res.data.data as { items: Transaction[]; total: number };
        },
    });

    const transactions = txData?.items ?? [];

    return (
        <SafeAreaView className="flex-1 bg-appbg" edges={["top"]}>
            <LinearGradient colors={["#A8C8F8", "#E8F0FF"]} className="px-4 pt-4 pb-4">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#1A2B5E" />
                    </TouchableOpacity>
                    <Text className="text-navy font-bold text-xl">Cash Transactions</Text>
                </View>
            </LinearGradient>

            <FlatList
                className="flex-1 px-4 pt-4"
                data={transactions}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1A56E8" />
                }
                renderItem={({ item }) => {
                    const iconKey = item.category?.icon ?? "dots";
                    const icon = (ICON_MAP[iconKey] ?? "pricetag-outline") as any;
                    const color = item.category?.color ?? "#6B7280";
                    return (
                        <TouchableOpacity
                            className="transaction-row"
                            onPress={() => router.push(`/transactions/${item.id}` as any)}
                        >
                            <View
                                className="w-12 h-12 rounded-avatar items-center justify-center mr-3"
                                style={{ backgroundColor: `${color}20` }}
                            >
                                <Ionicons name={icon} size={22} color={color} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-textsecondary text-xs mb-0.5">{formatDate(item.date)}</Text>
                                <Text className="text-textprimary font-semibold text-base">
                                    {item.merchant ?? "—"}
                                </Text>
                            </View>
                            <Text
                                className={`font-bold text-base ${item.type === "INCOME" ? "text-success" : "text-textprimary"
                                    }`}
                            >
                                {formatLKR(item.amount)} LKR
                            </Text>
                        </TouchableOpacity>
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
