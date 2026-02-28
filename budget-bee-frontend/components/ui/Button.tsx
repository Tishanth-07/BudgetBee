import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import type { TouchableOpacityProps } from "react-native";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  outline: "bg-transparent border border-primary",
  ghost: "bg-transparent",
  danger: "bg-danger",
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: "text-white",
  outline: "text-primary",
  ghost: "text-primary",
  danger: "text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2",
  md: "px-6 py-3",
  lg: "px-8 py-4",
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  className,
  ...props
}: ButtonProps & { className?: string }) {
  const isDisabled = disabled || loading;

  const containerClasses = [
    "rounded-button items-center justify-center",
    variantClasses[variant],
    sizeClasses[size],
    isDisabled ? "opacity-60" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const textClasses = [
    "font-bold text-base",
    labelClasses[variant],
    isDisabled ? "opacity-90" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <TouchableOpacity
      className={containerClasses}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className={textClasses}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

