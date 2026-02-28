import { View, ViewStyle, DimensionValue } from "react-native";

interface SkeletonProps {
  width: DimensionValue;
  height: DimensionValue;
  style?: ViewStyle;
}

export function Skeleton({ width, height, style }: SkeletonProps) {
  return (
    <View
      className="bg-gray-200 rounded-card animate-pulse"
      style={[{ width, height }, style]}
    />
  );
}

