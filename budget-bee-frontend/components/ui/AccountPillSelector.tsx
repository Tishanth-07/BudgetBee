import { Text, TouchableOpacity, View } from "react-native";

interface AccountPillSelectorProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export function AccountPillSelector({
  options,
  selected,
  onSelect,
}: AccountPillSelectorProps) {
  return (
    <View className="flex-row gap-2">
      {options.map((option) => {
        const isSelected = selected === option;
        const containerClasses = isSelected
          ? "chip-selected"
          : "chip-unselected";
        const textClasses = [
          "text-sm font-semibold",
          isSelected ? "text-white" : "text-textsecondary",
        ].join(" ");

        return (
          <TouchableOpacity
            key={option}
            className={containerClasses}
            onPress={() => onSelect(option)}
          >
            <Text className={textClasses}>
              {isSelected ? `✓ ${option}` : option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

