import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../../lib/api/client";

interface Account {
    id: string;
    name: string;
    type: "BANK" | "CASH" | "CARD";
    balance: number;
    cardNumber?: string;
    cardNetwork?: string;
}

function formatLKR(amount: number) {
    return amount.toLocaleString("en-LK");
}

export default function Accounts() {
    const router = useRouter();

    const { data: accounts = [], isRefetching, refetch } = useQuery<Account[]>({
        queryKey: ["accounts"],
        queryFn: async () => {
            const res = await api.get("/accounts");
            return res.data.data as Account[];
        },
    });

    const bankAccounts = accounts.filter((a) => a.type === "BANK");
    const cashAccounts = accounts.filter((a) => a.type !== "BANK");

    return (
        <SafeAreaView className="flex-1 bg-appbg" edges={["top"]}>
            {/* Header */}
            <LinearGradient colors={["#A8C8F8", "#E8F0FF"]} className="px-4 pt-4 pb-4">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#1A2B5E" />
                    </TouchableOpacity>
                    <Text className="text-navy font-bold text-xl">Accounts</Text>
                </View>
            </LinearGradient>

            <FlatList
                className="flex-1 px-4 pt-4"
                data={[...bankAccounts, ...cashAccounts]}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1A56E8" />
                }
                ListHeaderComponent={
                    <>
                        {bankAccounts.length > 0 && (
                            <Text className="text-textbody font-bold text-base mb-3">Bank accounts</Text>
                        )}
                    </>
                }
                renderItem={({ item, index }) => {
                    const isCashSection = item.type !== "BANK";
                    const prevIsCash = index > 0 && accounts[index - 1]?.type !== "BANK";
                    return (
                        <>
                            {isCashSection && !prevIsCash && (
                                <Text className="text-textbody font-bold text-base mt-4 mb-3">Cash</Text>
                            )}
                            <TouchableOpacity
                                className="transaction-row mb-3"
                                onPress={() => router.push(`/accounts/${item.id}` as any)}
                            >
                                <View className="w-12 h-8 mr-3 items-center justify-center">
                                    {item.type === "BANK" ? (
                                        <Text className="text-primary font-bold text-xs">
                                            {item.cardNetwork ?? "BANK"}
                                        </Text>
                                    ) : (
                                        <Ionicons name="layers-outline" size={28} color="#6B7280" />
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-textprimary font-bold text-base">{item.name}</Text>
                                    {item.cardNumber ? (
                                        <Text className="text-textsecondary text-sm">***{item.cardNumber}</Text>
                                    ) : null}
                                </View>
                                <Text className="text-textprimary font-bold text-base">
                                    {formatLKR(item.balance)} LKR
                                </Text>
                            </TouchableOpacity>
                        </>
                    );
                }}
                ListFooterComponent={
                    <TouchableOpacity className="items-center justify-center py-6">
                        <Ionicons name="add-circle-outline" size={32} color="#9CA3AF" />
                    </TouchableOpacity>
                }
            />
        </SafeAreaView>
    );
}
