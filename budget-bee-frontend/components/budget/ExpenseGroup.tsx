import { useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function formatLKR(amount: number) {
  return amount.toLocaleString("en-LK");
}

export interface ExpenseBillItem {
  id: string;
  amount: number;
  isPaid: boolean;
  daysLeft: number;
  logoUrl: string;
}

interface ExpenseGroupProps {
  groupName: string;
  items: ExpenseBillItem[];
  onPay: (billId: string) => void;
}

export function ExpenseGroup({ groupName, items, onPay }: ExpenseGroupProps) {
  const [expanded, setExpanded] = useState(false);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.amount, 0),
    [items]
  );

  return (
    <View>
      <TouchableOpacity
        className="flex-row items-center justify-between py-3 border-b border-gray-100"
        onPress={() => setExpanded((p) => !p)}
      >
        <View className="flex-row items-center gap-2">
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#6B7280"
          />
          <Text className="text-textprimary font-semibold text-base">
            {groupName}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-textsecondary text-sm">
            Total: {formatLKR(total)} LKR
          </Text>
          <Ionicons name="pencil-outline" size={16} color="#6B7280" />
        </View>
      </TouchableOpacity>

      {expanded &&
        items.map((item) => (
          <View
            key={item.id}
            className={`flex-row items-center py-3 px-4 mx-0 rounded-card mb-2 ${
              item.isPaid ? "bg-lightblue/30" : "bg-danger/10"
            }`}
          >
            <Image
              source={{ uri: item.logoUrl }}
              className="w-10 h-10 rounded-avatar mr-3"
            />
            <Text className="text-textprimary font-bold text-base flex-1">
              {formatLKR(item.amount)} LKR
            </Text>
            {item.isPaid ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                <Text className="text-success text-sm font-semibold">Paid</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <Text className="text-warning text-sm font-semibold">
                  {item.daysLeft} days left
                </Text>
                <TouchableOpacity
                  className="bg-primary rounded-chip px-4 py-1.5"
                  onPress={() => onPay(item.id)}
                >
                  <Text className="text-white text-sm font-semibold">Pay</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
    </View>
  );
}

