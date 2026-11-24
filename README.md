# 🐃 BubaTag Mobile

Aplicativo mobile para **monitoramento de bubalinos**: cadastro dos animais, localização no pasto e acompanhamento de pulso e temperatura, a partir de coleiras inteligentes (IoT).

> **Estado atual:** o front-end está completo e funcional.

---

## 📑 Sumário
1. [Funcionalidades](#-funcionalidades)
2. [Tecnologias](#-tecnologias)
3. [Como rodar](#-como-rodar)
4. [Estrutura de pastas](#-estrutura-de-pastas)
5. [Fluxo das telas](#-fluxo-das-telas)
6. [Modelo de dados](#-modelo-de-dados)

---

## ✅ Funcionalidades

| Tela | O que faz |
|---|---|
| **Splash** | Abertura com o símbolo da marca e "from KRONO" (cerca de 2 s). |
| **Login** | E-mail e senha. Link "Não está cadastrado?" leva ao cadastro (com animação de deslize). |
| **Cadastro de usuário** | E-mail, senha e **CCIR** (documento do imóvel rural). Botão "?" com ajuda. |
| **Home** | Mapa de satélite com a cerca do pasto e um marcador por animal, barra de busca (por ID, etiqueta, colar ou nome), lista **"Bubalinos cadastrados"** e botão para cadastrar. Sem animais, mostra "(Não há bubalinos cadastrados)". |
| **Cadastro de bubalino** | Nome (opcional), sexo, data de nascimento (com máscara `dd/mm/aaaa`), número de etiqueta e colar. Valida os campos e **não aceita etiqueta repetida**. |
| **Status do bubalino** | Gráfico de monitoramento, **pulso (BPM)** e **temperatura (°C)**, dados do animal, **edição** (painel "Alterar Informações") e **exclusão** com confirmação. |
| **Ajuda ("?")** | Modal explicativo em cada tela, com o link da documentação: https://bubatag.github.io/bubatag-docs/ |

**Ícones de status** (lista e ajuda): 🟢 saudável · 🔴 estressado · 🟡 fora da área · ⚪ perda de conexão.

---

## 🧰 Tecnologias

- **Expo SDK 54** (Managed Workflow) + **React Native 0.81** + **React 19**
- **TypeScript**
- **NativeWind 4** (Tailwind CSS para React Native)
- **react-native-maps** (mapa de satélite, polígono da cerca e marcadores)
- **react-native-svg** (ícones, fundo e símbolo da marca)
- **expo-font** (fontes Fonarto e Lato) e **expo-splash-screen**

Não há biblioteca de rotas: a navegação é feita por um estado simples no `App.tsx` (`home`, `register`, `status`), o que mantém o app leve.

---

## 🚀 Como rodar

### Pré-requisitos
- [Node.js](https://nodejs.org) versão LTS
- Aplicativo **Expo Go** no celular (Android ou iOS), com celular e computador na **mesma rede Wi-Fi**

### Passo a passo
```bash
# 1. entre na pasta do projeto
cd mobile-bubatag

# 2. instale as dependências
npm install

# 3. inicie o servidor (o -c limpa o cache)
npx expo start -c
```
Escaneie o **QR code** com o Expo Go (no iPhone, com a câmera). Se a rede bloquear a conexão, use `npx expo start --tunnel`.

### ⚠️ Versão do Expo Go
O projeto usa o **SDK 54**. O Expo Go da loja só abre projetos do SDK que ele suporta. Se aparecer *"Project is incompatible with this version of Expo Go"*, há dois caminhos:

- **Atualizar o projeto** (recomendado):
  ```bash
  npx expo install expo@^58.0.0 --fix
  npx expo-doctor@latest
  npx expo start -c
  ```
  Bibliotecas como NativeWind e react-native-maps podem exigir ajustes após o upgrade.
- **Instalar um Expo Go antigo** (somente Android): https://expo.dev/go?sdkVersion=54&platform=android&device=true

### Scripts
| Comando | Ação |
|---|---|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run android` | Abre no Android |
| `npm run ios` | Abre no iOS |
| `npm run web` | Abre no navegador (o mapa pode não funcionar na web) |

---

## 🗂️ Estrutura de pastas

```
mobile-bubatag/
├── App.tsx                      # Ponto central: estado global, navegação e ações (criar/editar/excluir)
├── index.ts                     # Entrada do app
├── app.json                     # Configuração do Expo (nome, splash, cores)
├── tailwind.config.ts           # Cores e fontes do tema
├── global.css                   # Diretivas do Tailwind
├── assets/
│   ├── fonts/                   # Fonarto (títulos) e Lato (textos)
│   ├── status/                  # Ícones SVG de status (saudável, estressado, fugiu, sem sinal)
│   ├── simbolo.svg / logotipo.svg
│   └── sair.svg, pesquisar.svg, adicionar-bufalo.svg, circulo-background*.svg
└── src/
    ├── types.ts                 # Tipos: Bubalino, BubalinoForm, BubalinoStatus
    ├── assets/svgs.ts           # SVGs embutidos como texto (status e símbolo)
    ├── components/ui/
    │   ├── Background.tsx       # Fundo padrão (gradiente + círculos verdes)
    │   ├── PrimaryButton.tsx    # Botão verde
    │   ├── TextField.tsx        # Campo de texto com rótulo
    │   ├── BubalinoFormFields.tsx  # Formulário do bubalino + validação (usado no cadastro e na edição)
    │   ├── HelpButton.tsx       # Botão "?" e modais de ajuda de cada tela
    │   └── BubalinoCard.tsx     # Card antigo (não usado nas telas atuais)
    └── screens/
        ├── SplashScreen.tsx
        ├── AuthScreen.tsx       # Login + Cadastro de usuário (com animação)
        ├── HomeScreen.tsx       # Mapa, busca e lista
        ├── RegisterBubalinoScreen.tsx
        └── BubalinoStatusScreen.tsx
```
> `LoginScreen.tsx` e `RegisterScreen.tsx` são versões antigas; a tela usada é a `AuthScreen.tsx`.

---

## 🔀 Fluxo das telas

```
Splash ──► Login ◄──► Cadastro de usuário
              │
              ▼
            Home ──► Cadastro de bubalino ──► (volta à Home)
              │
              └────► Status do bubalino ──► editar / excluir ──► (volta à Home)
```
O botão de **sair** (canto superior esquerdo da Home) volta ao login.

---

## 🧬 Modelo de dados

Definido em `src/types.ts`:

```ts
type BubalinoStatus = "disconnected" | "location" | "alert" | "healthy";

type Bubalino = {
  id: string;              // gerado pelo app (hoje sequencial: "1", "2"...)
  name: string;            // opcional
  sex: "Macho" | "Fêmea";
  birthDate: string;       // "dd/mm/aaaa"
  tag: string;             // número da etiqueta (único)
  collar: string;          // número do colar
  status: BubalinoStatus;
  pulse: number;           // BPM
  temperature: number;     // °C
  coordinate: { latitude: number; longitude: number };
};
```

---

## 🔌 Integrando a API

Hoje as ações de dados estão em `App.tsx`, trabalhando só no estado local. Para ligar a API:

1. **Crie uma camada de serviços**, por exemplo `src/services/api.ts`, com as funções de rede (`login`, `register`, `listBubalinos`, `createBubalino`, `updateBubalino`, `deleteBubalino`, `getVitals`) e uma constante com a URL base.
2. **Troque o corpo das funções do `App.tsx`** (`createBubalino`, `updateBubalino`, `deleteBubalino`) por chamadas a esse serviço, e carregue a lista inicial com `listBubalinos` (por exemplo em um `useEffect` depois do login).
3. **Autenticação:** em `AuthScreen.tsx`, `handleLogin` e `handleRegister` hoje só chamam `onAuthSuccess()`, sem validar nada. Chame o serviço de login/cadastro ali e só então autentique; guarde o token (por exemplo com `expo-secure-store`).
4. **Telemetria:** em `BubalinoStatusScreen.tsx`, pulso e temperatura vêm do próprio objeto `Bubalino` (valores fixos). Substitua por uma busca periódica (a cada alguns segundos) ao endpoint de status do animal.
5. **Posição no mapa:** `coordinate` hoje é sorteada dentro da cerca de exemplo. Use a posição real enviada pela coleira.

Endpoints sugeridos (ajuste ao backend real):

| Método | Rota | Uso |
|---|---|---|
| POST | `/auth/login` · `/auth/register` | Autenticação (`{ token, user }`) |
| GET | `/bubalinos` | Lista de animais |
| POST | `/bubalinos` | Cadastro |
| PUT | `/bubalinos/:id` | Edição |
| DELETE | `/bubalinos/:id` | Exclusão |
| GET | `/bubalinos/:id/status` | `{ pulse, temperature, status, coordinate }` |

---

## 🎨 Identidade visual

- **Fundo:** gradiente radial escuro (tons de cinza-azulado) com círculos verdes nos cantos, componente `Background`.
- **Cor de destaque:** verde (`primary`), usado em bordas, botões e ícones. As cores ficam em `tailwind.config.ts`.
- **Fontes:** **Fonarto** nos títulos (`font-title`) e **Lato** nos textos (`font-body`).
- **Estilo:** componentes escuros com bordas arredondadas e alto contraste, pensado para uso em campo.

---

## 🛠️ Problemas comuns

| Sintoma | Solução |
|---|---|
| *Project is incompatible with this version of Expo Go* | Veja [Versão do Expo Go](#️-versão-do-expo-go). |
| `npx` bloqueado no PowerShell ("execução de scripts desabilitada") | Use `npx.cmd expo start`, ou o CMD, ou rode `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`. |
| *Port 8081 is being used by another process* | Aceite a porta 8082, ou feche o outro terminal com o Expo aberto. |
| Celular não encontra o servidor | Confirme a mesma rede Wi-Fi ou use `npx expo start --tunnel`. |
| Mudanças não aparecem | `npx expo start -c` e, no celular, balance e escolha **Reload**. |
| Aviso de versão do `expo-font` | `npx expo install --fix` |
| Mapa em branco | O mapa precisa de internet. Em builds de produção no Android, é necessária uma chave de API do Google Maps. |
| Botão de engrenagem cinza na tela | É o menu do Expo Go (desenvolvimento); não aparece no app instalado. |

---

## 📄 Licença
Consulte o arquivo `LICENSE` na raiz do repositório.
