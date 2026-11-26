import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreenNative from "expo-splash-screen";
import SplashScreen from "./src/screens/SplashScreen";
import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";
import RegisterBubalinoScreen from "./src/screens/RegisterBubalinoScreen";
import BubalinoStatusScreen from "./src/screens/BubalinoStatusScreen";
import type { Bubalino, BubalinoForm } from "./src/types";
import * as api from "./src/services/api";
import "./global.css";

// Segura a tela de carregamento nativa até que as fontes estejam prontas
SplashScreenNative.preventAutoHideAsync();

type Screen = "home" | "register" | "status";

const VITALS_INTERVAL_MS = 5000;

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [bubalinos, setBubalinos] = useState<Bubalino[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fontsLoaded, fontError] = useFonts({
    Fonarto: require("./assets/fonts/Fonarto.ttf"),
    Lato: require("./assets/fonts/Lato-Regular.ttf"),
  });

  const bubalinoIds = bubalinos.map((b) => b.id).join(",");

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreenNative.hideAsync();
      const t = setTimeout(() => setShowSplash(false), 2200);
      return () => clearTimeout(t);
    }
  }, [fontsLoaded, fontError]);

  const signOut = async () => {
    await api.clearToken();
    setIsAuthenticated(false);
    setBubalinos([]);
    setSelectedId(null);
    setScreen("home");
  };

  // Carrega a lista inicial depois do login
  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .listBubalinos()
      .then(setBubalinos)
      .catch((e) => {
        if (api.isUnauthorized(e)) signOut();
        else Alert.alert("Erro", api.getErrorMessage(e));
      });
  }, [isAuthenticated]);

  // Atualiza pulso, temperatura, status e posição de todos os animais periodicamente
  useEffect(() => {
    if (!isAuthenticated || !bubalinoIds) return;
    const ids = bubalinoIds.split(",");
    let active = true;

    const refresh = async () => {
      const results = await Promise.allSettled(ids.map((id) => api.getVitals(id)));
      if (!active) return;
      setBubalinos((current) =>
        current.map((b) => {
          const i = ids.indexOf(b.id);
          const r = i >= 0 ? results[i] : undefined;
          return r && r.status === "fulfilled" ? { ...b, ...r.value } : b;
        })
      );
    };

    refresh();
    const interval = setInterval(refresh, VITALS_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, bubalinoIds]);

  if (!fontsLoaded && !fontError) return null;

  // ---- Ações (agora chamam a API) ----
  const createBubalino = async (form: BubalinoForm): Promise<string | null> => {
    const tag = form.tag.trim().toUpperCase();
    if (bubalinos.some((b) => b.tag === tag)) return "Já existe um bubalino com essa etiqueta.";
    try {
      const novo = await api.createBubalino({ ...form, tag });
      setBubalinos((c) => [...c, novo]);
      setScreen("home");
      return null;
    } catch (e) {
      return api.getErrorMessage(e);
    }
  };

  const updateBubalino = async (b: Bubalino): Promise<void> => {
    const saved = await api.updateBubalino(b);
    setBubalinos((c) => c.map((x) => (x.id === saved.id ? saved : x)));
  };

  const deleteBubalino = async (id: string): Promise<void> => {
    await api.deleteBubalino(id);
    setBubalinos((c) => c.filter((x) => x.id !== id));
  };

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
        onLogout={signOut}
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