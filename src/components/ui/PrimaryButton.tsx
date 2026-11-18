import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
}

// Botão verde sólido (sem SVG/gradiente, para renderizar igual em qualquer aparelho).
export function PrimaryButton({ title, className = "", style, ...props }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      className={`self-center items-center justify-center rounded-lg mt-8 mb-4 ${className}`}
      style={[
        {
          backgroundColor: "#06D001",
          minWidth: 190,
          paddingVertical: 13,
          paddingHorizontal: 28,
          borderBottomWidth: 3,
          borderBottomColor: "#04A600",
          shadowColor: "#06D001",
          shadowOpacity: 0.45,
          shadowRadius: 10,
          elevation: 6,
        },
        style,
      ]}
      activeOpacity={0.85}
      {...props}
    >
      <Text className="font-title text-lg" style={{ color: "#0B2A0E", letterSpacing: 1 }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
