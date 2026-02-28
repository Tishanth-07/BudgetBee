import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatLKR(amount: number) {
  return amount.toLocaleString("en-LK");
}

export type TransactionCategory = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string; // hex
};

export interface TransactionItemProps {
  date: string;
  merchant: string;
  amount: number;
  category: TransactionCategory;
  onPress?: () => void;
}

export function TransactionItem({
  date,
  merchant,
  amount,
  category,
  onPress,
}: TransactionItemProps) {
  return (
    <TouchableOpacity className="transaction-row" onPress={onPress}>
      <View
        className="w-12 h-12 rounded-avatar items-center justify-center mr-3"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <Ionicons name={category.icon} size={22} color={category.color} />
      </View>

      <View className="flex-1">
        <Text className="text-textsecondary text-xs mb-0.5">
          {formatDate(date)}
        </Text>
        <Text className="text-textprimary font-semibold text-base">
          {merchant}
        </Text>
      </View>

      <Text className="text-textprimary font-bold text-base">
        {formatLKR(amount)} LKR
      </Text>
    </TouchableOpacity>
  );
}

