import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { apiRequest } from "../../../lib/api/client";
import { formatLKR } from "../../../utils/currency";

interface Account {
    id: string;
    name: string;
    type: "BANK" | "CASH" | "CARD";
    balance: number;
    cardNumber?: string;
    cardNetwork?: string;
}

export default function Accounts() {
    const router = useRouter();

    const { data: accounts = [], isRefetching, refetch } = useQuery<Account[]>({
        queryKey: ["accounts"],
        queryFn: async () => {
            return await apiRequest<Account[]>('get', '/accounts');
        },
        initialData: [],
    });

    const bankAccounts = accounts.filter((a) => a.type === "BANK");
    const cashAccounts = accounts.filter((a) => a.type !== "BANK");
    const allAccountsSorted = [...bankAccounts, ...cashAccounts];

    return (
        <SafeAreaView className="flex-1 bg-appbg" edges={["top"]}>
            {/* Header */}
            <LinearGradient colors={["#A8C8F8", "#D6E4FF"]} className="px-6 pt-4 pb-6 rounded-b-[30px]">
                <View className="flex-row items-center justify-between mb-4 mt-2">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/50 rounded-full items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A2B5E" />
                    </TouchableOpacity>
                    <Text className="text-navy font-bold text-xl">My Accounts</Text>
                    <TouchableOpacity onPress={() => { }} className="w-10 h-10 bg-white/50 rounded-full items-center justify-center">
                        <Ionicons name="add" size={24} color="#1A2B5E" />
                    </TouchableOpacity>
                </View>

                <View className="items-center mt-2">
                    <Text className="text-textsecondary text-sm font-medium mb-1">Total Assets</Text>
                    <Text className="text-navy text-4xl font-bold">
                        {formatLKR(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
                    </Text>
                </View>
            </LinearGradient>

            <FlatList
                className="flex-1 px-4 pt-6"
                contentContainerStyle={{ paddingBottom: 100 }}
                data={allAccountsSorted}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1A56E8" />
                }
                ListHeaderComponent={
                    <>
                        {bankAccounts.length > 0 && (
                            <Text className="text-textsecondary text-xs uppercase font-bold tracking-wider mb-3 ml-2">Bank Accounts</Text>
                        )}
                    </>
                }
                renderItem={({ item, index }) => {
                    const isCashSection = item.type !== "BANK";
                    const prevIsCash = index > 0 && allAccountsSorted[index - 1]?.type !== "BANK";

                    return (
                        <View>
                            {isCashSection && !prevIsCash && (
                                <Text className="text-textsecondary text-xs uppercase font-bold tracking-wider mt-6 mb-3 ml-2">Cash & Wallets</Text>
                            )}
                            <TouchableOpacity
                                className="bg-white p-4 rounded-card shadow-sm flex-row items-center mb-3 border border-gray-100"
                                onPress={() => router.push(`/accounts/${item.id}` as any)}
                            >
                                <View className="w-12 h-12 rounded-full mr-4 items-center justify-center bg-primary/10">
                                    {item.type === "BANK" ? (
                                        <Ionicons name="business-outline" size={24} color="#1A56E8" />
                                    ) : (
                                        <Ionicons name="wallet-outline" size={24} color="#10B981" />
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-textprimary font-bold text-base mb-0.5">{item.name}</Text>
                                    {item.cardNumber ? (
                                        <Text className="text-textsecondary text-xs">{item.cardNetwork} •••• {item.cardNumber.slice(-4)}</Text>
                                    ) : (
                                        <Text className="text-textsecondary text-xs">Standard Account</Text>
                                    )}
                                </View>
                                <Text className="text-navy font-bold text-base">
                                    {formatLKR(item.balance)}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View className="items-center py-16">
                        <Ionicons name="card-outline" size={64} color="#D1D5DB" />
                        <Text className="text-textprimary text-lg font-bold mt-4">No Accounts Found</Text>
                        <Text className="text-textsecondary text-sm mt-2 text-center px-8">
                            You haven't added any accounts yet. Tap the + icon to add your first account.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
