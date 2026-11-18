import { useMemo, useState } from "react";
import { Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polygon } from "react-native-maps";
import { SvgXml } from "react-native-svg";
import Background from "../components/ui/Background";
import HelpButton from "../components/ui/HelpButton";
import { saudavelSvg, estressadoSvg, fugiuSvg, semSinalSvg } from "../assets/svgs";
import type { Bubalino, BubalinoStatus } from "../types";

const sairIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 6L8.586 7.414L11.172 10H3V12H11.172L8.586 14.586L10 16L14 12L10 6Z" fill="#06D001"/>
<path d="M19 4H14V2H19C20.1046 2 21 2.89543 21 4V20C21 21.1046 20.1046 22 19 22H14V20H19V4Z" fill="#06D001"/>
</svg>`;

const searchIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.888916 16.8889L4.00003 13.7778M4.44447 7.11111C4.44447 7.92822 4.60541 8.73733 4.91811 9.49225C5.23081 10.2472 5.68913 10.9331 6.26692 11.5109C6.84471 12.0887 7.53064 12.547 8.28555 12.8597C9.04047 13.1724 9.84958 13.3333 10.6667 13.3333C11.4838 13.3333 12.2929 13.1724 13.0478 12.8597C13.8027 12.547 14.4887 12.0887 15.0665 11.5109C15.6443 10.9331 16.1026 10.2472 16.4153 9.49225C16.728 8.73733 16.8889 7.92822 16.8889 7.11111C16.8889 5.46087 16.2334 3.87823 15.0665 2.71133C13.8996 1.54444 12.3169 0.888885 10.6667 0.888885C9.01646 0.888885 7.43381 1.54444 6.26692 2.71133C5.10003 3.87823 4.44447 5.46087 4.44447 7.11111Z" stroke="#AAAAAA" stroke-opacity="0.72" stroke-width="1.78" stroke-linecap="round"/>
</svg>`;

const addIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="44" height="28" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.96318 5.56716C1.96318 5.56716 -0.205331 7.50663 1.03226 8.32823C1.53407 8.66113 2.63718 8.10192 2.94549 7.76956C3.41013 7.26829 4.99702 5.77433 7.44104 7.5837C8.08279 8.05928 8.88143 8.98474 10.2119 8.34189C11.0406 7.94121 12.2017 6.38165 10.3541 5.31898M7.56239 10.4634C7.56239 10.4634 8.83059 10.0807 10.1141 11.3167C10.1141 11.3167 10.1174 12.9637 7.63509 12.973M13.037 7.16935C13.037 7.16935 14.5069 5.76449 18.3229 6.70034C21.2256 7.41206 25.1548 6.9097 26.8707 6.62818C27.4376 6.53525 33.2735 6.7714 32.8936 11.7026C32.6257 15.1749 31.8429 17.7419 33.3074 19.5665M12.0361 18.4142C10.2185 18.6449 8.81802 18.6351 7.85429 17.9698C6.82935 17.1078 6.24281 16.0183 5.78527 14.8611C4.89644 15.4717 2.21737 15.9429 1.5297 15.6062C0.106799 14.9086 0.647423 13.4426 0.647423 13.4426L2.90066 10.0436" stroke="url(#paint0_radial_2858_2083)" stroke-width="1.09328" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.9975 11.0646L16.2347 16.2292C16.2347 16.2292 14.7227 18.9176 15.1546 21.9662L14.3532 25.6795C14.3015 25.9194 14.1691 26.1344 13.9781 26.2886C13.7871 26.4427 13.5491 26.5268 13.3036 26.5268H13.2402C12.534 26.5268 12.0125 25.8555 12.2033 25.1755C12.5493 23.9423 12.8953 22.0269 12.4749 20.1224C11.6424 16.3473 12.2503 15.4229 12.2503 15.4229" stroke="url(#paint1_radial_2858_2083)" stroke-width="1.09328" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.3711 18.5422C15.3711 18.5422 21.1075 17.8862 23.868 19.255C23.868 19.255 25.5724 17.2384 26.6285 17.0706" stroke="url(#paint2_radial_2858_2083)" stroke-width="1.09328" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24.5517 12.4261C24.5517 12.4261 27.4948 18.4866 27.8304 19.5668C28.0967 20.4223 28.0644 23.9339 28.0688 25.3021C28.0742 26.9568 30.4554 26.7551 30.5204 25.4295C30.5718 24.3854 30.6866 22.3175 31.019 20.7677C31.1174 20.3108 31.183 19.8467 30.9616 19.435C30.4477 18.4784 29.923 16.6089 30.4221 14.1419C30.8774 11.8882 30.8468 11.3727 30.8468 11.3727M18.583 18.4675C18.583 18.4675 17.845 24.1143 17.8111 25.4235C17.8007 25.8296 17.2683 26.1674 16.8622 26.1674H16.2346" stroke="url(#paint3_radial_2858_2083)" stroke-width="1.09328" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M33.4078 0.567932C33.9 0.567935 34.3723 0.762933 34.7203 1.1109C35.0683 1.4589 35.2642 1.93127 35.2643 2.4234V8.2984H41.1393C41.6314 8.29852 42.1038 8.49435 42.4518 8.84235C42.7997 9.19042 42.9948 9.66267 42.9948 10.1548C42.9947 10.647 42.7997 11.1193 42.4518 11.4673C42.1038 11.8153 41.6314 12.0112 41.1393 12.0113H35.2643V17.8863C35.2642 18.3784 35.0683 18.8508 34.7203 19.1988C34.3723 19.5468 33.9 19.7418 33.4078 19.7418C32.9157 19.7418 32.4434 19.5468 32.0953 19.1988C31.7473 18.8508 31.5515 18.3784 31.5514 17.8863V12.0113H25.6764C25.1843 12.0112 24.7119 11.8153 24.3639 11.4673C24.0159 11.1193 23.8209 10.647 23.8209 10.1548C23.8209 9.66266 24.0159 9.19042 24.3639 8.84235C24.7119 8.49435 25.1843 8.29851 25.6764 8.2984H31.5514V2.4234C31.5515 1.93127 31.7473 1.4589 32.0953 1.1109C32.4434 0.762937 32.9157 0.567932 33.4078 0.567932Z" fill="url(#paint4_radial_2858_2083)" stroke="#404D55" stroke-width="1.13531"/>
<defs>
<radialGradient id="paint0_radial_2858_2083" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16.8471 12.4428) scale(16.4603 29.35)">
<stop stop-color="#90A955"/>
<stop offset="1" stop-color="#06D001"/>
</radialGradient>
<radialGradient id="paint1_radial_2858_2083" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(14.1252 18.7957) scale(2.10953 31.8521)">
<stop stop-color="#90A955"/>
<stop offset="1" stop-color="#06D001"/>
</radialGradient>
<radialGradient id="paint2_radial_2858_2083" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20.9724 18.1628) scale(5.65619 4.49979)">
<stop stop-color="#90A955"/>
<stop offset="1" stop-color="#06D001"/>
</radialGradient>
<radialGradient id="paint3_radial_2858_2083" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(23.6361 18.9281) scale(7.47408 31.1284)">
<stop stop-color="#90A955"/>
<stop offset="1" stop-color="#06D001"/>
</radialGradient>
<radialGradient id="paint4_radial_2858_2083" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(33.3634 10.1548) scale(9.06352)">
<stop stop-color="#90A955"/>
<stop offset="1" stop-color="#06D001"/>
</radialGradient>
</defs>
</svg>`;


export const GEOFENCE = [
  { latitude: -23.5489, longitude: -46.6388 },
  { latitude: -23.5489, longitude: -46.6288 },
  { latitude: -23.5589, longitude: -46.6288 },
  { latitude: -23.5589, longitude: -46.6388 },
];

const statusIcon: Record<BubalinoStatus, string> = {
  healthy: saudavelSvg,
  alert: estressadoSvg,
  location: fugiuSvg,
  disconnected: semSinalSvg,
};

interface HomeScreenProps {
  bubalinos: Bubalino[];
  onLogout: () => void;
  onAddBubalino: () => void;
  onOpenBubalino: (id: string) => void;
}

const Cell = ({ label, value, flex = 1 }: { label: string; value: string; flex?: number }) => (
  <View style={{ flex }} className="items-center">
    <Text className="font-body text-white text-xs underline mb-1">{label}</Text>
    <Text className="font-body text-white text-sm">{value}</Text>
  </View>
);

export default function HomeScreen({ bubalinos, onLogout, onAddBubalino, onOpenBubalino }: HomeScreenProps) {
  const [search, setSearch] = useState("");

  const list = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return bubalinos;
    return bubalinos.filter(
      (b) => b.id.includes(q) || b.tag.toLowerCase().includes(q) || b.collar.includes(q) || b.name.toLowerCase().includes(q)
    );
  }, [bubalinos, search]);

  return (
    <Background>
      <View className="flex-1" style={{ paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 44 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="px-6 mt-8 mb-8 items-start">
            <TouchableOpacity className="rounded-xl border-2 border-primary bg-[#1f2933] p-3" onPress={onLogout} activeOpacity={0.8} accessibilityLabel="Sair">
              <SvgXml xml={sairIcon} width={22} height={22} />
            </TouchableOpacity>
          </View>

          <View className="self-start ml-6 bg-[#2F3E46] border-t-2 border-l-2 border-r-2 border-primary rounded-t-2xl px-5 py-2 -mb-[2px] z-10">
            <Text className="font-title text-white text-base uppercase tracking-wide" numberOfLines={1}>
              LOCALIZAÇÃO DOS BUBALINOS
            </Text>
          </View>
          <View style={{ height: 250 }} className="border-t-2 border-primary/60">
            <MapView
              style={{ flex: 1 }}
              mapType="satellite"
              initialRegion={{ latitude: -23.5539, longitude: -46.6338, latitudeDelta: 0.014, longitudeDelta: 0.014 }}
            >
              <Polygon coordinates={GEOFENCE} strokeColor="#d9482b" strokeWidth={2} />
              {bubalinos.map((b) => (
                <Marker key={b.id} coordinate={b.coordinate} title={b.tag} pinColor="black" />
              ))}
            </MapView>
          </View>

          <View className="px-6 mt-5 flex-row items-center" style={{ gap: 12 }}>
            <View className="flex-1 flex-row items-center rounded-xl bg-black/30 px-3" style={{ height: 46 }}>
              <SvgXml xml={searchIcon} width={16} height={16} />
              <TextInput
                className="ml-2 flex-1 text-white font-body text-sm"
                placeholder="Insira aqui o código do animal"
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
                underlineColorAndroid="transparent"
              />
            </View>
            <TouchableOpacity className="rounded-xl border-2 border-primary bg-[#1f2933] items-center justify-center" style={{ width: 54, height: 46 }} activeOpacity={0.8} onPress={onAddBubalino} accessibilityLabel="Cadastrar bubalino">
              <SvgXml xml={addIcon} width={38} height={24} />
            </TouchableOpacity>
          </View>

          {bubalinos.length === 0 ? (
            <Text className="font-body text-white text-sm text-center mt-8">(Não há bubalinos cadastrados)</Text>
          ) : (
            <View className="px-6 mt-6">
              <Text className="font-title text-white text-sm underline mb-3">BUBALINOS CADASTRADOS:</Text>
              {list.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  activeOpacity={0.85}
                  onPress={() => onOpenBubalino(b.id)}
                  className="flex-row items-center rounded-2xl bg-[#1f2933] px-4 py-3 mb-3 border border-[#2a3840]"
                >
                  <Cell label="ID" value={b.id} flex={0.6} />
                  <Cell label="Etiqueta" value={b.tag} />
                  <Cell label="Colar" value={b.collar} />
                  <SvgXml xml={statusIcon[b.status]} width={30} height={30} />
                </TouchableOpacity>
              ))}
              {list.length === 0 && <Text className="font-body text-gray-300 text-sm text-center mt-4">(Nenhum bubalino encontrado)</Text>}
            </View>
          )}
        </ScrollView>
        <HelpButton kind={bubalinos.length ? "home" : "empty"} />
      </View>
    </Background>
  );
}
