import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import type { BubalinoForm } from "../../types";

const COLLARS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export const maskDate = (text: string) => {
  const d = text.replace(/\D/g, "").slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
};

const Label = ({ children }: { children: string }) => (
  <Text className="font-body text-white text-sm mb-1 ml-1">{children}</Text>
);
const inputCls = "bg-black/30 rounded-lg px-3 py-3 text-white font-body text-sm";

interface Props {
  value: BubalinoForm;
  onChange: (v: BubalinoForm) => void;
  compact?: boolean;
}

// Campos compartilhados entre "Cadastre o bubalino" e "Alterar informações".
export default function BubalinoFormFields({ value, onChange, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof BubalinoForm>(k: K, v: BubalinoForm[K]) => onChange({ ...value, [k]: v });
  const gap = compact ? "mb-3" : "mb-5";

  return (
    <View>
      <View className={gap}>
        <Label>Nome (opcional)</Label>
        <TextInput className={inputCls} placeholder="Digite aqui o nome" placeholderTextColor="#9CA3AF" value={value.name} onChangeText={(t) => set("name", t)} />
      </View>

      <View className={`flex-row ${gap}`} style={{ gap: 12 }}>
        <View style={{ flex: 1.15 }}>
          <Label>Sexo</Label>
          <View className="flex-row items-center justify-around rounded-lg bg-black/30 px-2" style={{ height: 46 }}>
            {(["Macho", "Fêmea"] as const).map((o) => (
              <TouchableOpacity key={o} className="flex-row items-center" onPress={() => set("sex", o)} activeOpacity={0.8}>
                <Text className="font-body text-white text-sm mr-2">{o}</Text>
                <View className="w-5 h-5 rounded-full border-2 border-primary items-center justify-center" style={{ backgroundColor: value.sex === o ? "#06D001" : "#2F3E46" }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Label>Data Nascimento</Label>
          <TextInput className={inputCls} placeholder="dd/mm/aaaa" placeholderTextColor="#9CA3AF" keyboardType="number-pad" maxLength={10} value={value.birthDate} onChangeText={(t) => set("birthDate", maskDate(t))} />
        </View>
      </View>

      <View className="flex-row" style={{ gap: 12, zIndex: 20 }}>
        <View style={{ flex: 1 }}>
          <Label>Número de etiqueta</Label>
          <TextInput className={inputCls} placeholder="Digite aqui o número" placeholderTextColor="#9CA3AF" autoCapitalize="characters" value={value.tag} onChangeText={(t) => set("tag", t.toUpperCase())} />
        </View>
        <View style={{ flex: 1, zIndex: 30 }}>
          <Label> </Label>
          <TouchableOpacity className="flex-row items-center justify-between rounded-lg bg-black/30 px-3" style={{ height: 46 }} onPress={() => setOpen(!open)} activeOpacity={0.8}>
            <Text className="font-body text-sm" style={{ color: value.collar ? "#fff" : "#9CA3AF" }} numberOfLines={1}>
              {value.collar ? `Colar ${value.collar}` : "Selecione o Colar"}
            </Text>
            <Text className="text-white text-xs">▼</Text>
          </TouchableOpacity>
          {open && (
            <View className="absolute left-0 right-0 rounded-lg border border-[#2F3E46] bg-[#122023]" style={{ top: 74, maxHeight: 160, overflow: "hidden", zIndex: 50, elevation: 8 }}>
              {COLLARS.slice(0, 5).map((c) => (
                <TouchableOpacity key={c} className="px-3 py-2.5 border-b border-[#2F3E46]" onPress={() => { set("collar", c); setOpen(false); }}>
                  <Text className="font-body text-sm" style={{ color: value.collar === c ? "#06D001" : "#fff" }}>Colar {c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export const validateForm = (f: BubalinoForm): string | null => {
  if (!f.sex) return "Selecione o sexo do bubalino.";
  if (f.birthDate.length !== 10) return "Digite a data de nascimento (dd/mm/aaaa).";
  if (!f.tag.trim()) return "Informe o número da etiqueta.";
  if (!f.collar) return "Selecione o colar.";
  return null;
};
