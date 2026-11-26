import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
import Background from "../components/ui/Background";
import HelpButton from "../components/ui/HelpButton";
import BubalinoFormFields, { validateForm } from "../components/ui/BubalinoFormFields";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import type { BubalinoForm } from "../types";

const sairIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 6L8.586 7.414L11.172 10H3V12H11.172L8.586 14.586L10 16L14 12L10 6Z" fill="#06D001"/>
<path d="M19 4H14V2H19C20.1046 2 21 2.89543 21 4V20C21 21.1046 20.1046 22 19 22H14V20H19V4Z" fill="#06D001"/>
</svg>`;

interface Props {
  onBack: () => void;
  onSave: (form: BubalinoForm) => Promise<string | null>; // retorna mensagem de erro ou null
}

export default function RegisterBubalinoScreen({ onBack, onSave }: Props) {
  const [form, setForm] = useState<BubalinoForm>({ name: "", sex: "", birthDate: "", tag: "", collar: "" });
  const [isSaving, setIsSaving] = useState(false);

  const submit = async () => {
    if (isSaving) return;

    const localError = validateForm(form);
    if (localError) {
      Alert.alert("Verifique os dados", localError);
      return;
    }

    setIsSaving(true);
    try {
      const error = await onSave(form);
      if (error) Alert.alert("Verifique os dados", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Background>
      <View className="flex-1 px-6" style={{ paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 44 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View className="mt-8 mb-8 items-start">
              <TouchableOpacity className="rounded-xl border-2 border-primary bg-[#1f2933] p-3" onPress={onBack} activeOpacity={0.8} accessibilityLabel="Voltar">
                <SvgXml xml={sairIcon} width={22} height={22} />
              </TouchableOpacity>
            </View>

            <Text className="font-title text-white text-3xl uppercase tracking-wide">Cadastre o</Text>
            <Text className="font-title text-white text-6xl uppercase tracking-wide" style={{ marginTop: -6 }}>Bubalino</Text>
            <View className="h-[2px] bg-white/80 mt-3 mb-6 -mx-6" />

            <BubalinoFormFields value={form} onChange={setForm} />
            <PrimaryButton title={isSaving ? "SALVANDO..." : "CADASTRAR"} activeOpacity={0.85} onPress={submit} />
          </ScrollView>
        </KeyboardAvoidingView>
        <HelpButton kind="newBuffalo" />
      </View>
    </Background>
  );
}