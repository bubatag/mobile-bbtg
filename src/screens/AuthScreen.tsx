import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Background from "../components/ui/Background";
import HelpButton from "../components/ui/HelpButton";
import TextField from "../components/ui/TextField";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import * as api from "../services/api";

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;

  // Login form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const loginPasswordRef = useRef<any>(null);

  // Register form states
  const [registerNome, setRegisterNome] = useState("");
  const [registerCcir, setRegisterCcir] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const registerEmailRef = useRef<any>(null);
  const registerPasswordRef = useRef<any>(null);
  const registerCcirRef = useRef<any>(null);

  const handleToggleForm = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);

    Animated.timing(slideAnim, {
      toValue: newIsLogin ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -screenWidth],
  });

  const handleLogin = async () => {
    if (isSubmitting) return;
    if (!loginEmail.trim() || !loginPassword) {
      Alert.alert("Verifique os dados", "Preencha email e senha.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.login(loginEmail.trim(), loginPassword);
      onAuthSuccess();
    } catch (e) {
      Alert.alert("Erro no login", api.getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (isSubmitting) return;
    if (!registerNome.trim() || !registerCcir.trim() || !registerEmail.trim() || !registerPassword) {
      Alert.alert("Verifique os dados", "Preencha nome, CCIR, email e senha.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.register({
        nome: registerNome.trim(),
        ccir: registerCcir.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
      });
      onAuthSuccess();
    } catch (e) {
      Alert.alert("Erro no cadastro", api.getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Background>
      {/* CONTEÚDO ANIMADO */}
      <KeyboardAvoidingView style={{ flex: 1, overflow: "hidden" }} behavior="padding">
        <Animated.View
          style={[
            {
              flex: 1,
              flexDirection: "row",
              width: screenWidth * 2,
              transform: [{ translateX }],
            },
          ]}
        >
          {/* LOGIN FORM */}
          <ScrollView
            style={{ width: screenWidth }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 32, paddingVertical: 56 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text className="font-title text-white text-5xl uppercase mb-12 tracking-wide text-center">
              LOGIN
            </Text>

            <TextField
              label="Email"
              placeholder="Digite aqui seu email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={loginEmail}
              onChangeText={setLoginEmail}
              returnKeyType="next"
              onSubmitEditing={() => loginPasswordRef.current?.focus()}
            />

            <TextField
              ref={loginPasswordRef}
              label="Senha"
              placeholder="Digite aqui sua senha"
              secureTextEntry
              value={loginPassword}
              onChangeText={setLoginPassword}
            />

            <PrimaryButton title={isSubmitting ? "AGUARDE..." : "LOGAR"} activeOpacity={0.8} onPress={handleLogin} />

            <TouchableOpacity className="w-full items-center" onPress={handleToggleForm}>
              <Text className="font-body text-white text-base underline">Não está cadastrado?</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* REGISTER FORM */}
          <ScrollView
            style={{ width: screenWidth }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 32, paddingVertical: 56 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text className="font-title text-white text-5xl uppercase mb-12 tracking-wide text-center">
              CADASTRE-SE
            </Text>

            <TextField
              label="Nome"
              placeholder="Digite aqui seu nome"
              autoCorrect={false}
              value={registerNome}
              onChangeText={setRegisterNome}
              returnKeyType="next"
              onSubmitEditing={() => registerEmailRef.current?.focus()}
            />

            <TextField
              ref={registerEmailRef}
              label="Email"
              placeholder="Digite aqui seu email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={registerEmail}
              onChangeText={setRegisterEmail}
              returnKeyType="next"
              onSubmitEditing={() => registerPasswordRef.current?.focus()}
            />

            <TextField
              ref={registerPasswordRef}
              label="Senha"
              placeholder="Digite aqui sua senha"
              secureTextEntry
              value={registerPassword}
              onChangeText={setRegisterPassword}
              returnKeyType="next"
              onSubmitEditing={() => registerCcirRef.current?.focus()}
            />

            <TextField
              ref={registerCcirRef}
              label="CCIR"
              placeholder="Digite aqui seu CCIR"
              keyboardType="number-pad"
              value={registerCcir}
              onChangeText={setRegisterCcir}
            />

            <PrimaryButton title={isSubmitting ? "AGUARDE..." : "CADASTRAR"} activeOpacity={0.8} onPress={handleRegister} />

            <TouchableOpacity className="w-full items-center" onPress={handleToggleForm}>
              <Text className="font-body text-white text-base underline">Já está cadastrado?</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
      {!isLogin && <HelpButton kind="register" />}
    </Background>
  );
}