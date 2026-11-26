import * as SecureStore from "expo-secure-store";
import type { Bubalino, BubalinoForm } from "../types";

// IP do computador na rede Wi-Fi.
export const API_BASE_URL = "http://192.168.18.63:3000";

const TOKEN_KEY = "bbtg_auth_token";
const USUARIO_KEY = "bbtg_usuario_id";

// O formulário do app ainda não tem campo de raça, então usamos um valor padrão.
const RACA_PADRAO = "Não informada";

export type User = { id: string; nome: string; email: string };

export type VitalsStatus = {
  pulse: number;
  temperature: number;
  status: Bubalino["status"];
  coordinate: Bubalino["coordinate"];
};

export type ApiError = Error & { status?: number };

function apiError(message: string, status?: number): ApiError {
  const err = new Error(message) as ApiError;
  err.status = status;
  return err;
}

export function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Erro inesperado.";
}

export function isUnauthorized(e: unknown): boolean {
  return (e as ApiError)?.status === 401;
}

// ---- Sessão ----
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
const getUsuarioId = () => SecureStore.getItemAsync(USUARIO_KEY);

async function saveSession(token: string, usuarioId: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USUARIO_KEY, usuarioId);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USUARIO_KEY);
}

// ---- Requisição base ----
async function request<T>(path: string, options: RequestInit = {}, withAuth = true): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (withAuth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...((options.headers as Record<string, string>) ?? {}) },
    });
  } catch {
    throw apiError("Não foi possível conectar ao servidor. Verifique sua conexão e o endereço da API.");
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw apiError(data?.mensagem ?? data?.message ?? `Erro ${res.status}`, res.status);
  }
  return data as T;
}

// ---- Conversão app <-> API ----

// Converte "dd/mm/aaaa" para "aaaa-mm-dd". Outros formatos são enviados como estão.
function toIsoDate(value: string): string {
  const m = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : value.trim();
}

// Campos do app -> campos que a API espera
function toApiBubalino(form: BubalinoForm) {
  return {
    nome: form.name,
    raca: RACA_PADRAO,
    n_etiqueta: form.tag,
    dt_nasc: toIsoDate(form.birthDate),
    sexo: form.sex,
  };
}

// Campos da API -> campos do app
function toBubalino(raw: Record<string, any>): Bubalino {
  return {
    id: String(raw._id ?? raw.id),
    name: raw.nome ?? "",
    tag: raw.n_etiqueta ?? "",
    birthDate: String(raw.dt_nasc ?? "").slice(0, 10),
    sex: raw.sexo ?? "Macho",
    collar: raw.collar ?? "",
    status: raw.status ?? "disconnected",
    pulse: Number(raw.pulse ?? 0),
    temperature: Number(raw.temperature ?? 0),
    coordinate: raw.coordinate ?? { latitude: 0, longitude: 0 },
  };
}

// ---- Autenticação ----
export async function login(email: string, password: string): Promise<User> {
  const data = await request<{ token: string; usuario: User }>(
    "/api/usuarios/login",
    { method: "POST", body: JSON.stringify({ email, senha: password }) },
    false
  );
  await saveSession(data.token, data.usuario.id);
  return data.usuario;
}

export async function register(input: {
  nome: string;
  email: string;
  password: string;
  ccir: string;
}): Promise<User> {
  await request<unknown>(
    "/api/usuarios",
    {
      method: "POST",
      body: JSON.stringify({
        nome: input.nome,
        email: input.email,
        senha: input.password,
        CCIR: input.ccir,
      }),
    },
    false
  );
  return login(input.email, input.password);
}

// ---- Coleiras ----
// Busca o ID da coleira cujo número (n_coleira) é igual ao colar escolhido no app.
async function findColeiraId(numero: string): Promise<string> {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) throw apiError("Sessão expirada. Faça login novamente.", 401);

  const data = await request<any>(`/api/coleiras/usuario/${usuarioId}/disponiveis`);
  const lista: any[] = Array.isArray(data) ? data : data?.coleiras ?? [];

  const coleira = lista.find((c) => String(c.n_coleira).trim() === numero.trim());
  if (!coleira) {
    throw apiError(`A coleira ${numero} não está cadastrada ou já está em uso. Cadastre-a antes de vincular.`);
  }
  return String(coleira._id ?? coleira.id);
}

// ---- Bubalinos ----
export async function listBubalinos(): Promise<Bubalino[]> {
  const data = await request<{ sucesso: boolean; bubalinos: Record<string, any>[] }>("/api/bubalinos");
  return (data.bubalinos ?? []).map(toBubalino);
}

export async function createBubalino(form: BubalinoForm): Promise<Bubalino> {
  const coleiraId = await findColeiraId(form.collar);
  const data = await request<any>("/api/bubalinos", {
    method: "POST",
    body: JSON.stringify({ ...toApiBubalino(form), coleira_id: coleiraId }),
  });
  // A API pode não devolver a coleira, então mantemos a escolhida no app
  return { ...toBubalino(data?.bubalino ?? data), collar: form.collar };
}

export async function updateBubalino(b: Bubalino): Promise<Bubalino> {
  const data = await request<any>(`/api/bubalinos/${b.id}`, {
    method: "PUT",
    body: JSON.stringify(toApiBubalino(b)),
  });
  return data?.bubalino ? { ...toBubalino(data.bubalino), collar: b.collar } : b;
}

export async function deleteBubalino(id: string): Promise<void> {
  await request<unknown>(`/api/bubalinos/${id}`, { method: "DELETE" });
}

// ---- Telemetria ----
// ATENÇÃO: a API ainda não tem essa rota de consulta. Vai retornar erro até ser criada.
export const getVitals = (id: string) => request<VitalsStatus>(`/api/bubalinos/${id}/status`);