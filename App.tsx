import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreenNative from "expo-splash-screen";
import SplashScreen from "./src/screens/SplashScreen";
import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";
import RegisterBubalinoScreen from "./src/screens/RegisterBubalinoScreen";
import BubalinoStatusScreen from "./src/screens/BubalinoStatusScreen";
import type { Bubalino, BubalinoForm } from "./src/types";
import "./global.css";

// Segura a tela de carregamento nativa até que as fontes estejam prontas
SplashScreenNative.preventAutoHideAsync();

type Screen = "home" | "register" | "status";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [bubalinos, setBubalinos] = useState<Bubalino[]>([]); // começa vazio, como na "Tela principal (sem bubalinos)"
  const [nextId, setNextId] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fontsLoaded, fontError] = useFonts({
    Fonarto: require("./assets/fonts/Fonarto.ttf"),
    Lato: require("./assets/fonts/Lato-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreenNative.hideAsync();
      const t = setTimeout(() => setShowSplash(false), 2200);
      return () => clearTimeout(t);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  // ---- Ações (trocar por chamadas à API quando ela existir) ----
  const createBubalino = (form: BubalinoForm): string | null => {
    const tag = form.tag.trim().toUpperCase();
    if (bubalinos.some((b) => b.tag === tag)) return "Já existe um bubalino com essa etiqueta.";
    const novo: Bubalino = {
      ...form,
      tag,
      sex: form.sex as "Macho" | "Fêmea",
      id: String(nextId),
      status: "healthy",
      pulse: 70,
      temperature: 38.5,
      coordinate: { latitude: -23.5495 - Math.random() * 0.0085, longitude: -46.6382 + Math.random() * 0.0085 },
    };
    setBubalinos((c) => [...c, novo]);
    setNextId((n) => n + 1);
    setScreen("home");
    return null;
  };
  const updateBubalino = (b: Bubalino) => setBubalinos((c) => c.map((x) => (x.id === b.id ? b : x)));
  const deleteBubalino = (id: string) => setBubalinos((c) => c.filter((x) => x.id !== id));

  const selected = bubalinos.find((b) => b.id === selectedId);

  let content;
  if (showSplash) {
    content = <SplashScreen />;
  } else if (!isAuthenticated) {
    content = <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />;
  } else if (screen === "register") {
    content = <RegisterBubalinoScreen onBack={() => setScreen("home")} onSave={createBubalino} />;
  } else if (screen === "status" && selected) {
    content = (
      <BubalinoStatusScreen
        key={selected.id}
        bubalino={selected}
        onBack={() => setScreen("home")}
        onUpdate={updateBubalino}
        onDelete={deleteBubalino}
      />
    );
  } else {
    content = (
      <HomeScreen
        bubalinos={bubalinos}
        onLogout={() => {
          setIsAuthenticated(false);
          setScreen("home");
        }}
        onAddBubalino={() => setScreen("register")}
        onOpenBubalino={(id) => {
          setSelectedId(id);
          setScreen("status");
        }}
      />
    );
  }

  return (
    <>
      {content}
      <StatusBar style="light" />
    </>
  );
}
