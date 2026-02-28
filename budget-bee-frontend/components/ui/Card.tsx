import { View } from "react-native";
import type { PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren {
  className?: string;
}

export function Card({ children, className }: CardProps) {
  const containerClasses = ["card", className ?? ""].filter(Boolean).join(" ");

  return <View className={containerClasses}>{children}</View>;
}

