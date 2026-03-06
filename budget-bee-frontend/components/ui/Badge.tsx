import { Text, View } from "react-native";

type BadgeVariant = "default" | "success" | "danger" | "warning" | "outline";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const badgeVariantClasses: Record<BadgeVariant, string> = {
  default: "bg-lightblue",
  success: "bg-success/10",
  danger: "bg-danger/10",
  warning: "bg-warning/10",
  outline: "bg-transparent border border-gray-300",
};

const badgeTextClasses: Record<BadgeVariant, string> = {
  default: "text-textprimary",
  success: "text-success",
  danger: "text-danger",
  warning: "text-warning",
  outline: "text-textsecondary",
};

export function Badge({ label, variant = "default", className }: BadgeProps) {
  const containerClasses = [
    "px-3 py-1 rounded-chip items-center justify-center",
    badgeVariantClasses[variant],
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const textClasses = [
    "text-xs font-semibold",
    badgeTextClasses[variant],
  ].join(" ");

  return (
    <View className={containerClasses}>
      <Text className={textClasses}>{label}</Text>
    </View>
  );
}

