# 🐃 BubaTag Mobile

Aplicativo mobile para **monitoramento de bubalinos**: cadastro dos animais, localização no pasto e acompanhamento de pulso e temperatura, a partir de coleiras inteligentes (IoT).

> **Estado atual:** o app está integrado à **API BubaTag** (`API-AI-bubatag/bubatag-api-mongo`) para autenticação, cadastro de usuário, listagem, cadastro, edição e exclusão de bubalinos. Pulso e temperatura ainda são **valores de exemplo**, porque a API ainda não possui a rota de status do animal. Veja [Limitações](#-limitações-e-próximos-passos).

---

## 📑 Sumário
1. [Funcionalidades](#-funcionalidades)
2. [Tecnologias](#-tecnologias)
3. [Arquitetura](#-arquitetura)
4. [Como rodar](#-como-rodar)
5. [Estrutura de pastas](#-estrutura-de-pastas)
6. [Fluxo das telas](#-fluxo-das-telas)
7. [Modelo de dados](#-modelo-de-dados)
8. [Integração com a API](#-integração-com-a-api)
9. [Identidade visual](#-identidade-visual)
10. [Problemas comuns](#-problemas-comuns)
11. [Limitações e próximos passos](#-limitações-e-próximos-passos)

---

## ✅ Funcionalidades

| Tela | O que faz |
|---|---|
| **Splash** | Abertura com o símbolo da marca e "from KRONO" (cerca de 2 s). |
| **Login** | E-mail e senha. Valida na API, salva o token e o ID do usuário no dispositivo. Link "Não está cadastrado?" leva ao cadastro (com animação de deslize). |
| **Cadastro de usuário** | Nome, e-mail, senha e **CCIR** (documento do imóvel rural). Após cadastrar, o app faz login automaticamente. |
| **Home** | Mapa de satélite com a cerca do pasto e um marcador por animal, busca (por ID, etiqueta, colar ou nome), lista **"Bubalinos cadastrados"** e botão para cadastrar. Os dados vêm da API. |
| **Cadastro de bubalino** | Nome (opcional), sexo, data de nascimento (máscara `dd/mm/aaaa`), número de etiqueta e colar. Valida os campos antes de enviar e exibe as mensagens de erro da API. |
| **Status do bubalino** | Gráfico de monitoramento, **pulso (BPM)** e **temperatura (°C)**, dados do animal, **edição** (painel "Alterar Informações") e **exclusão** com confirmação. |
| **Ajuda ("?")** | Modal explicativo em cada tela, com o link da documentação: https://bubatag.github.io/bubatag-docs/ |

**Ícones de status** (lista e ajuda): 🟢 saudável · 🔴 estressado · 🟡 fora da área · ⚪ perda de conexão.

---

## 🧰 Tecnologias

- **Expo SDK 58** (Managed Workflow) + **React Native** + **React**
- **TypeScript**
- **NativeWind** (Tailwind CSS para React Native)
- **react-native-maps** (mapa de satélite, polígono da cerca e marcadores)
- **react-native-svg** (ícones, fundo e símbolo da marca)
- **expo-font** (fontes Fonarto e Lato) e **expo-splash-screen**
- **expo-secure-store** (armazenamento seguro do token e do ID do usuário)

A navegação é feita por um estado simples no `App.tsx` (`home`, `register`, `status`), sem biblioteca de rotas.

---

## 🏗️ Arquitetura

```
┌──────────────────────────┐        HTTP (JSON + Bearer token)        ┌────────────────────────────┐
│  mobile-bbtg (este repo) │ ───────────────────────────────────────► │  API BubaTag (Express)     │
│                          │ ◄─────────────────────────────────────── │  bubatag-api-mongo         │
│  App.tsx                 │                                          │  porta 3000                │
│  src/services/api.ts     │                                          │                            │
│  SecureStore (token)     │                                          │  MongoDB (Atlas)           │
└──────────────────────────┘                                          └────────────────────────────┘
```

Toda comunicação com o backend passa por `src/services/api.ts`. As telas e o `App.tsx` não fazem requisições diretamente.

---

## 🚀 Como rodar

São necessários **dois terminais** abertos: um para a API e outro para o app.

### Pré-requisitos
- [Node.js](https://nodejs.org) versão LTS
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para a API)
- Aplicativo **Expo Go** no celular (Android ou iOS)
- Celular e computador na **mesma rede Wi-Fi**

### 1. Subir a API

Na pasta `bubatag-api-mongo` do repositório da API:

```powershell
cd API-AI-bubatag\bubatag-api-mongo
copy .env.example .env
```

Edite o `.env` com os valores reais (peça ao responsável pelo banco). A `MONGO_URI` precisa terminar com o nome do banco:

```env
PORT=3000
MONGO_URI=mongodb+srv://USUARIO:SENHA@CLUSTER.mongodb.net/bubatag
JWT_SECRET=uma_chave_longa_e_aleatoria
```

Depois inicie:

```powershell
docker compose up --build
```

Deixe esse terminal aberto. Para conferir se a API está no ar:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/usuarios" | Format-Table nome, email
```

> ⚠️ Nunca envie o `.env` para o GitHub. Ele contém a senha do banco.

### 2. Configurar o endereço da API no app

Em `src/services/api.ts`, ajuste a constante com o **IP do seu computador na rede Wi-Fi** (não use `localhost`, porque o celular não consegue acessá-lo):

```ts
export const API_BASE_URL = "http://SEU_IP:3000";
```

Para descobrir o IP, rode `ipconfig` e use o "Endereço IPv4" do adaptador Wi-Fi. Se a rede mudar, esse IP muda e precisa ser atualizado.

### 3. Instalar e iniciar o app

Na pasta `mobile-bbtg`:

```powershell
cd mobile-bbtg
npm install
npx expo start -c
```

Escaneie o **QR code** com o Expo Go. Se aparecer erro de memória em computadores com pouca RAM, use antes:

```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"
```

> Se o PowerShell bloquear o `npx` ("execução de scripts desabilitada"), use `npx.cmd expo start -c` ou rode `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

### 4. Pré-requisitos de dados para cadastrar bubalinos

Cada bubalino precisa de uma **coleira cadastrada e livre** na API. O app busca a coleira pelo número escolhido no campo "Colar" (1 a 5, conforme o menu do formulário). Se a coleira não existir ou já estiver vinculada a outro animal, o cadastro é recusado com a mensagem correspondente.

Para cadastrar coleiras, use a rota `POST /api/coleiras/usuario/:usuarioId` (veja [Endpoints](#endpoints-utilizados)).

---

## 🗂️ Estrutura de pastas

```
mobile-bbtg/
├── App.tsx                      # Estado global, navegação, carregamento da lista e ações (criar/editar/excluir)
├── index.ts                     # Entrada do app
├── app.json                     # Configuração do Expo (nome, splash, cores)
├── tailwind.config.ts           # Cores e fontes do tema
├── global.css                   # Diretivas do Tailwind
├── assets/
│   ├── fonts/                   # Fonarto (títulos) e Lato (textos)
│   ├── status/                  # Ícones SVG de status
│   ├── simbolo.svg / logotipo.svg
│   └── sair.svg, pesquisar.svg, adicionar-bufalo.svg, circulo-background*.svg
└── src/
    ├── types.ts                 # Tipos: Bubalino, BubalinoForm, BubalinoStatus
    ├── assets/svgs.ts           # SVGs embutidos como texto (status e símbolo)
    ├── services/
    │   └── api.ts               # Camada de comunicação com a API (login, cadastro, bubalinos, coleiras)
    ├── components/ui/
    │   ├── Background.tsx       # Fundo padrão (gradiente + círculos verdes)
    │   ├── PrimaryButton.tsx    # Botão verde
    │   ├── TextField.tsx        # Campo de texto com rótulo
    │   ├── BubalinoFormFields.tsx  # Formulário do bubalino + validação (cadastro e edição)
    │   ├── HelpButton.tsx       # Botão "?" e modais de ajuda de cada tela
    │   └── BubalinoCard.tsx     # Card antigo (não usado nas telas atuais)
    └── screens/
        ├── SplashScreen.tsx
        ├── AuthScreen.tsx       # Login + Cadastro de usuário (com animação)
        ├── HomeScreen.tsx       # Mapa, busca e lista
        ├── RegisterBubalinoScreen.tsx
        └── BubalinoStatusScreen.tsx
```

> `LoginScreen.tsx` e `RegisterScreen.tsx` são versões antigas e não são usadas pelo app. Podem ser removidas.

---

## 🔀 Fluxo das telas

```
Splash ──► Login ◄──► Cadastro de usuário
              │  (valida na API, salva token e usuarioId)
              ▼
            Home (carrega bubalinos da API) ──► Cadastro de bubalino ──► (volta à Home)
              │
              └────► Status do bubalino ──► editar / excluir ──► (volta à Home)
```

O botão de **sair** (canto superior esquerdo da Home) remove o token e o ID do usuário do dispositivo e volta ao login.

---

## 🧬 Modelo de dados

Definido em `src/types.ts`:

```ts
type BubalinoStatus = "disconnected" | "location" | "alert" | "healthy";

type Bubalino = {
  id: string;              // _id do MongoDB (convertido em string)
  name: string;            // opcional
  sex: "Macho" | "Fêmea";
  birthDate: string;       // "dd/mm/aaaa" no app
  tag: string;             // número da etiqueta (único)
  collar: string;          // número do colar (1 a 5)
  status: BubalinoStatus;
  pulse: number;           // BPM
  temperature: number;     // °C
  coordinate: { latitude: number; longitude: number };
};
```

### Conversão entre app e API

| Campo no app | Campo na API | Observação |
|---|---|---|
| `name` | `nome` | |
| `tag` | `n_etiqueta` | Único por usuário |
| `birthDate` | `dt_nasc` | Convertido de `dd/mm/aaaa` para `aaaa-mm-dd` |
| `sex` | `sexo` | `Macho` ou `Fêmea` |
| — | `raca` | Enviada como `"Não informada"` (o formulário não tem esse campo) |
| `collar` | `coleira_id` | O app busca o `_id` da coleira com `n_coleira` igual ao colar escolhido |
| `CCIR` (cadastro) | `CCIR` | Obrigatório no cadastro de usuário |
| `password` | `senha` | |

---

## 🔌 Integração com a API

### Arquivos envolvidos

- **`src/services/api.ts`**: todas as chamadas HTTP, o armazenamento do token e a conversão de campos. Expõe `login`, `register`, `listBubalinos`, `createBubalino`, `updateBubalino`, `deleteBubalino`, `getVitals`, `clearToken`, `getErrorMessage` e `isUnauthorized`.
- **`App.tsx`**: carrega a lista após o login, atualiza a lista após criar, editar ou excluir, e encerra a sessão quando o token expira (erro 401).
- **`AuthScreen.tsx`**: chama `login` e `register` e só autentica se a API responder com sucesso.
- **`RegisterBubalinoScreen.tsx`** e **`BubalinoStatusScreen.tsx`**: aguardam as ações assíncronas e exibem as mensagens de erro da API em alertas.

### Autenticação

1. O login envia `{ email, senha }` para `POST /api/usuarios/login`.
2. A resposta traz `{ token, usuario }`. O token e o `usuario.id` são salvos com `expo-secure-store`.
3. Todas as rotas de bubalinos enviam o cabeçalho `Authorization: Bearer <token>`.
4. Se o token expirar, a API responde 401 e o app volta ao login.

### Endpoints utilizados

| Método | Rota | Uso no app |
|---|---|---|
| POST | `/api/usuarios/login` | Login. Retorna `{ token, usuario }` |
| POST | `/api/usuarios` | Cadastro de usuário (`nome`, `email`, `senha`, `CCIR`) |
| GET | `/api/coleiras/usuario/:usuarioId/disponiveis` | Busca a coleira livre pelo número do colar |
| GET | `/api/bubalinos` | Lista os bubalinos do usuário autenticado. Retorna `{ sucesso, bubalinos }` |
| POST | `/api/bubalinos` | Cadastro de bubalino com `coleira_id` |
| PUT | `/api/bubalinos/:id` | Edição do bubalino |
| DELETE | `/api/bubalinos/:id` | Exclusão do bubalino |
| GET | `/api/bubalinos/:id/status` | **Ainda não existe na API** (ver limitações) |

Outras rotas da API, como cadastro de coleiras (`POST /api/coleiras/usuario/:usuarioId`) e telemetria (`POST /api/telemetria/registro`), não são usadas pelo app. São usadas pelo hardware das coleiras ou para preparação de dados.

### Mensagens de erro

A API devolve erros no campo `mensagem`, e o app exibe essa mensagem diretamente no alerta. Exemplos reais: "Credenciais inválidas.", "Selecione uma coleira para o bubalino.", "Já existe um bubalino com essa etiqueta."

---

## 🎨 Identidade visual

- **Fundo:** gradiente radial escuro (tons de cinza-azulado) com círculos verdes nos cantos, componente `Background`.
- **Cor de destaque:** verde (`primary`), usado em bordas, botões e ícones. As cores ficam em `tailwind.config.ts`.
- **Fontes:** **Fonarto** nos títulos (`font-title`) e **Lato** nos textos (`font-body`).
- **Estilo:** componentes escuros com bordas arredondadas e alto contraste, pensado para uso em campo.

---

## 🛠️ Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `Não foi possível conectar ao servidor` | API desligada, IP errado ou firewall | Confirme que o `docker compose up` está rodando, o IP em `api.ts` é o atual e a porta 3000 está liberada no firewall |
| `Credenciais inválidas.` | E-mail ou senha incorretos | Confira os dados. Usuários criados em outro banco não aparecem |
| `Selecione uma coleira para o bubalino.` | Requisição sem `coleira_id` (app desatualizado) | Pare o Expo, rode `npx expo start -c` e recarregue o app |
| `A coleira X não está cadastrada ou já está em uso` | Não existe coleira com esse número ou ela já tem animal | Cadastre a coleira na API ou escolha outro colar |
| `Já existe um bubalino com essa etiqueta.` | Etiqueta repetida | Use outro número de etiqueta |
| `Sessão expirada. Faça login novamente.` | Token ou ID do usuário ausente | Saia e entre de novo no app |
| Lista de bubalinos vazia após login | Usuário sem bubalinos no banco, ou API apontando para outro banco | Confirme o banco no `.env` da API e a lista com `Invoke-RestMethod` |
| `DataCloneError: out of memory` no Metro | Pouca RAM | `$env:NODE_OPTIONS="--max-old-space-size=4096"` e `npx expo start -c` |
| *Project is incompatible with this version of Expo Go* | Versão do Expo Go diferente do SDK | Atualize o Expo Go na loja |
| `Port 8081 is being used by another process` | Outro Expo aberto | Feche o outro terminal ou aceite a porta 8082 |
| Mudanças não aparecem | Cache do Metro | `npx expo start -c` e, no celular, balance e escolha **Reload** |
| Mapa em branco | Sem internet ou sem chave do Google Maps em build de produção | Verifique a conexão. Em produção no Android, configure a chave de API |

---

## 🚧 Limitações e próximos passos

**Já integrado e testado:**
- Login e cadastro de usuário com token
- Listagem de bubalinos do usuário
- Cadastro de bubalino vinculado a coleira

**Implementado, mas ainda sem validação completa:**
- Edição e exclusão de bubalinos

**Pendências:**
- **Telemetria:** pulso e temperatura continuam sendo valores fixos de exemplo, porque a API não possui `GET /api/bubalinos/:id/status`. A função `getVitals` existe em `api.ts`, mas a rota ainda não foi criada. Enquanto isso, o app envia uma requisição a cada 5 segundos que retorna erro. Para evitar isso, remova o intervalo de atualização no `App.tsx` até a rota existir.
- **Localização:** a API não devolve coordenadas dos bubalinos, então os marcadores no mapa ficam em `(0, 0)`. A posição real precisa vir do backend.
- **Raça:** o formulário não tem esse campo, então todos os bubalinos são cadastrados como "Não informada".
- **Colar na listagem:** a API não devolve o número do colar junto com o bubalino, então o campo aparece vazio ao recarregar a lista.
- **Quantidade de colares:** o menu mostra apenas os colares 1 a 5 (`COLLARS.slice(0, 5)` em `BubalinoFormFields.tsx`).
- **Endereço da API:** o IP está fixo em `api.ts`. Para uso em produção, mova essa configuração para variáveis de ambiente.
- O logo "KRONO" da splash é um texto estilizado. Troque pelo arquivo oficial quando disponível.
- Evoluções possíveis: atualização de telemetria em tempo real, notificações de estresse ou saída da cerca, persistência offline e testes automatizados.

---

## 📄 Licença
Consulte o arquivo `LICENSE` na raiz do repositório.