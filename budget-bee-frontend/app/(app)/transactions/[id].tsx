import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../../lib/api/client";

interface TransactionDetail {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: string;
  merchant: string | null;
  accountMasked: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

function formatLKR(amount: number) {
  return amount.toLocaleString("en-LK");
}

function formatDateTime(date: string) {
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data } = useQuery<TransactionDetail>({
    queryKey: ["transaction", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/transactions/${id}`);
      return res.data.data as TransactionDetail;
    },
  });

  const { data: otherCategories } = useQuery<CategoryOption[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.data as CategoryOption[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      router.back();
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete transaction");
    },
  });

  const confirmDelete = () => {
    Alert.alert(
      "Delete transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  const tx = data;
  const OTHER_CATEGORIES: CategoryOption[] =
    (otherCategories ?? []).filter((c) => c.id !== tx?.category.id) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-appbg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1A2B5E" />
        </TouchableOpacity>
        <TouchableOpacity /* onPress={toggleEdit} */>
          <Text className="text-primary font-semibold text-base">Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        <Text className="amount-negative text-5xl mt-4 mb-1">
          -{formatLKR(tx?.amount ?? 0)} LKR
        </Text>

        <Text className="text-primary text-base mb-1">
          {tx?.merchant ?? "merchant.com"}
        </Text>

        <Text className="text-textsecondary text-sm mb-6">
          {tx ? formatDateTime(tx.date) : ""}
        </Text>

        <View className="bg-gray-100 rounded-input flex-row justify-between items-center px-4 py-3 mb-6">
          <Text className="text-textsecondary text-sm font-semibold">
            Account
          </Text>
          <Text className="text-textprimary text-sm font-semibold">
            {tx?.accountMasked ?? "BOC **** **** 5564"}
          </Text>
        </View>

        <Text className="text-textprimary font-bold text-base mb-4">
          Category
        </Text>
        <View className="bg-white rounded-card p-4 shadow-card mb-6">
          <View className="items-center mb-4 pb-4 border-b border-gray-100">
            <View
              className="category-icon-container category-icon-selected"
              style={{ backgroundColor: `${tx?.category.color ?? "#22C55E"}18` }}
            >
              <Ionicons
                name={(tx?.category.icon as any) ?? "restaurant-outline"}
                size={28}
                color={tx?.category.color ?? "#22C55E"}
              />
            </View>
            <Text className="text-textprimary text-xs font-semibold mt-1">
              {tx?.category.name ?? "Food"}
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-4 justify-between">
            {OTHER_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className="category-icon-container items-center gap-1"
                style={{ backgroundColor: `${cat.color ?? "#6B7280"}18` }}
              >
                <Ionicons
                  name={(cat.icon as any) ?? "pricetag-outline"}
                  size={22}
                  color={cat.color ?? "#6B7280"}
                />
                <Text className="text-textsecondary text-xs">{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 py-4 mb-8"
          onPress={confirmDelete}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text className="text-danger text-base font-semibold">
            Delete transaction
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

