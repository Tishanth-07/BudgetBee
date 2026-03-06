import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  isPaid: boolean;
}

interface GoalCardProps {
  goal: Goal;
  onPay: (goalId: string) => void;
}

export function GoalCard({ goal, onPay }: GoalCardProps) {
  return (
    <View className="goal-card min-h-28">
      <Text className="text-textprimary font-bold text-sm text-center mb-1">
        {goal.name}
      </Text>
      <Text className="text-textsecondary text-xs text-center mb-2">
        Sold: {goal.targetAmount} euros
      </Text>

      {goal.isPaid ? (
        <View className="items-center gap-1">
          <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
          <Text className="text-success text-xs font-semibold">Payed</Text>
        </View>
      ) : (
        <TouchableOpacity className="items-center gap-1" onPress={() => onPay(goal.id)}>
          <Ionicons name="battery-dead-outline" size={22} color="#EF4444" />
          <Text className="text-danger text-xs font-semibold">Pay</Text>
        </TouchableOpacity>
      )}

      <View className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-card overflow-hidden">
        <View
          className={`h-full ${goal.isPaid ? "bg-success" : "bg-danger"}`}
          style={{
            width: `${Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)}%`,
          }}
        />
      </View>
    </View>
  );
}

