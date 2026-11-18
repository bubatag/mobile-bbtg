import { Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import Background from "../components/ui/Background";
import { simboloSvg } from "../assets/svgs";

// Tela de abertura: símbolo da marca centralizado e "from KRONO" na base.
export default function SplashScreen() {
  return (
    <Background rings={false}>
      <View className="flex-1 items-center justify-center">
        <SvgXml xml={simboloSvg} width={140} height={140} />
      </View>
      <View className="items-center pb-16">
        <Text className="font-body text-white text-xs mb-1">from</Text>
        <View style={{ borderTopWidth: 2, borderBottomWidth: 2, borderColor: "#E8A22B", paddingHorizontal: 6 }}>
          <Text className="font-title" style={{ color: "#E8A22B", fontSize: 26, letterSpacing: 3 }}>KRONO</Text>
        </View>
      </View>
    </Background>
  );
}
