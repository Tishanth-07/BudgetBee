import { Text, TouchableOpacity, View } from "react-native";

const KEYS = [
  ["1", "2", "3", "+"],
  ["4", "5", "6", "−"],
  ["7", "8", "9", "="],
  ["⊗", "0", "⌫", ""],
] as const;

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
}

export function NumericKeypad({ onKeyPress }: NumericKeypadProps) {
  return (
    <View className="bg-[#1C1C1E] pt-2">
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row">
          {row.map((key) => (
            <TouchableOpacity
              key={key || `empty-${rowIndex}`}
              className={`flex-1 h-14 items-center justify-center border-t border-gray-800 ${
                ["+", "−", "="].includes(key) ? "bg-[#2C2C2E]" : ""
              }`}
              disabled={!key}
              onPress={() => key && onKeyPress(key)}
            >
              {key ? (
                <Text
                  className={`text-xl font-medium ${
                    ["+", "−", "="].includes(key)
                      ? "text-primary"
                      : "text-white"
                  }`}
                >
                  {key}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

