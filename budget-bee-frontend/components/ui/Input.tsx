import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps & { className?: string }) {
  const inputClasses = [
    "input-field",
    error ? "input-error" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <View>
      {label ? (
        <Text className="text-textbody font-semibold text-sm mb-1">
          {label}
        </Text>
      ) : null}
      <TextInput className={inputClasses} {...props} />
      {error ? (
        <Text className="text-danger text-xs mt-1">{error}</Text>
      ) : null}
    </View>
  );
}

