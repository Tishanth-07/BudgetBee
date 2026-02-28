import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../lib/api/client";

interface IncomeSource {
    id: string;
    name: string;
    amount: number;
    frequencyDays: number;
    nextDate: string;
    isActive: boolean;
    account?: {
        name: string;
        type: "BANK" | "CASH" | "CARD";
    };
}

function formatLKR(amount: number) {
    return amount.toLocaleString("en-LK");
}

function accountColor(type?: "BANK" | "CASH" | "CARD") {
    if (type === "BANK") return "text-primary";
    return "text-textprimary";
}

export default function Income() {
    const router = useRouter();

    const { data: sources = [], isRefetching, refetch } = useQuery<IncomeSource[]>({
        queryKey: ["income-sources"],
        queryFn: async () => {
            const res = await api.get("/income-sources");
            return res.data.data as IncomeSource[];
        },
    });

    return (
        <SafeAreaView className="flex-1 bg-appbg" edges={["top"]}>
            <LinearGradient colors={["#A8C8F8", "#E8F0FF"]} className="px-4 pt-4 pb-4">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#1A2B5E" />
                    </TouchableOpacity>
                    <Text className="text-navy font-bold text-xl">Income</Text>
                </View>
            </LinearGradient>

            <FlatList
                className="flex-1 px-4 pt-4"
                data={sources}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1A56E8" />
                }
                renderItem={({ item }) => (
                    <View className="card mb-3 flex-row items-center justify-between">
                        <View className="flex-1">
                            <Text className="text-textsecondary text-xs mb-0.5">{item.name}</Text>
                            <Text className="text-textprimary font-bold text-2xl">
                                {formatLKR(item.amount)}
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className={`font-bold text-base mb-0.5 ${accountColor(item.account?.type)}`}>
                                {item.account?.name ?? "—"}
                            </Text>
                            <Text className="text-textsecondary text-xs">
                                Every {item.frequencyDays} days
                            </Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center py-12">
                        <Ionicons name="cash-outline" size={48} color="#9CA3AF" />
                        <Text className="text-textsecondary text-base mt-3">No income sources yet</Text>
                    </View>
                }
                ListFooterComponent={
                    <TouchableOpacity className="items-center py-6">
                        <Ionicons name="add-circle-outline" size={32} color="#9CA3AF" />
                    </TouchableOpacity>
                }
            />
        </SafeAreaView>
    );
}
