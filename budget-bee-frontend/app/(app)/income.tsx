import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { apiRequest } from "../../lib/api/client";
import { formatLKR } from "../../utils/currency";

interface IncomeSource {
    id: string;
    name: string;
    amount: number;
    frequency: string; // "Monthly" | "Weekly" | "Bi-weekly" | "Annually"
}

const FREQUENCY_MULTIPLIER: Record<string, number> = {
    'Monthly': 1,
    'Weekly': 4.33,
    'Bi-weekly': 2.17,
    'Annually': 1 / 12,
};

export default function Income() {
    const router = useRouter();

    const { data: sources = [], isRefetching, refetch } = useQuery<IncomeSource[]>({
        queryKey: ["income-sources"],
        queryFn: async () => {
            return await apiRequest<IncomeSource[]>('get', '/income');
        },
        initialData: [],
    });

    const monthlyProjected = sources.reduce((acc, source) => {
        const multiplier = FREQUENCY_MULTIPLIER[source.frequency] ?? 1;
        return acc + (source.amount * multiplier);
    }, 0);

    return (
        <SafeAreaView className="flex-1 bg-appbg" edges={["top"]}>
            <LinearGradient colors={["#A8C8F8", "#D6E4FF"]} className="px-6 pt-4 pb-6 rounded-b-[30px]">
                <View className="flex-row items-center justify-between mb-4 mt-2">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/50 rounded-full items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A2B5E" />
                    </TouchableOpacity>
                    <Text className="text-navy font-bold text-xl">Regular Income</Text>
                    <TouchableOpacity onPress={() => { }} className="w-10 h-10 bg-white/50 rounded-full items-center justify-center">
                        <Ionicons name="add" size={24} color="#1A2B5E" />
                    </TouchableOpacity>
                </View>

                <View className="items-center mt-2">
                    <Text className="text-textsecondary text-sm font-medium mb-1">Projected Monthly Income</Text>
                    <Text className="text-success text-4xl font-bold">
                        {formatLKR(monthlyProjected)}
                    </Text>
                </View>
            </LinearGradient>

            <FlatList
                className="flex-1 px-4 pt-6"
                contentContainerStyle={{ paddingBottom: 100 }}
                data={sources}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1A56E8" />
                }
                renderItem={({ item }) => {
                    return (
                        <View className="bg-white p-4 rounded-card shadow-sm flex-row items-center mb-3 border border-gray-100">
                            <View className="w-12 h-12 rounded-full mr-4 items-center justify-center bg-success/10">
                                <Ionicons name="cash-outline" size={24} color="#10B981" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-textprimary font-bold text-base mb-0.5">{item.name}</Text>
                                <View className="flex-row items-center">
                                    <Ionicons name="repeat-outline" size={12} color="#9CA3AF" />
                                    <Text className="text-textsecondary text-xs ml-1">{item.frequency}</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-success font-bold text-base">
                                    +{formatLKR(item.amount)}
                                </Text>
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View className="items-center py-16">
                        <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
                        <Text className="text-textprimary text-lg font-bold mt-4">No Income Sources</Text>
                        <Text className="text-textsecondary text-sm mt-2 text-center px-8">
                            Add your salary, allowance, or other regular income to track your cashflow automatically.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

