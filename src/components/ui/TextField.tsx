import { forwardRef } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface TextFieldProps extends TextInputProps {
  label: string;
  className?: string;
}

const TextField = forwardRef<TextInput, TextFieldProps>(({ label, className = "", ...props }, ref) => {
  const InputComponent = TextInput as any; // contorna o conflito de tipos entre versões do react-native

  return (
    <View className={`w-full mb-6 ${className}`}>
      <Text className="font-body text-white text-base mb-2">{label}</Text>
      <InputComponent
        ref={ref}
        className="w-full bg-black/30 rounded-lg p-4 text-white font-body"
        placeholderTextColor="#9CA3AF"
        {...props}
      />
    </View>
  );
});

TextField.displayName = "TextField";

export default TextField;