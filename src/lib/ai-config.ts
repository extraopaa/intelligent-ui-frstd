export type AiMode = "demo" | "live";
export type AiSource = "server" | "client" | "none";

export type AiConfig = {
  mode: AiMode;
  apiKey?: string;
  baseUrl: string;
  model: string;
  source: AiSource;
};

export type AiModelOption = {
  id: string;
  label: string;
  hint: string;
  tier: "economique" | "equilibre" | "qualite";
};

export type PublicAiConfig = {
  mode: AiMode;
  serverConfigured: boolean;
  model: string;
  baseUrlHost: string;
  provider: "France Student";
  models: AiModelOption[];
};

export type AccountUser = {
  id?: number;
  name: string;
  email: string;
  avatar?: string | null;
};

export type ClientKeySession = {
  kind: "key";
  apiKey: string;
  model: string;
};

export type AccountSession = {
  kind: "account";
  model: string;
  user: AccountUser;
};

export type ClientAiSession = ClientKeySession | AccountSession;

export type AccountSessionInfo = {
  connected: boolean;
  user?: AccountUser;
  defaultModel?: string;
  expired?: boolean;
  warning?: string;
};

export const DEFAULT_MODEL = "gpt-6-luna";
export const DEFAULT_BASE_URL = "https://api.francestudent.ai/v1";

/**
 * Une sélection courte et lisible dans l'interface. L'API France Student
 * expose beaucoup plus de modèles via GET /v1/models ; n'importe quel
 * identifiant valide peut être forcé avec FRANCESTUDENT_MODEL.
 */
export const CURATED_MODELS: AiModelOption[] = [
  {
    id: "gpt-6-luna",
    label: "GPT-6 Luna",
    hint: "Rapide et économique",
    tier: "economique",
  },
  {
    id: "gpt-5.6-luna",
    label: "GPT-5.6 Luna",
    hint: "Bon compromis",
    tier: "economique",
  },
  {
    id: "claude-haiku-5-5",
    label: "Claude Haiku 5.5",
    hint: "Rapide, à l'aise en rédaction",
    tier: "economique",
  },
  {
    id: "gpt-6.1-terra",
    label: "GPT-6.1 Terra",
    hint: "Équilibré et récent",
    tier: "equilibre",
  },
  {
    id: "claude-sonnet-5-5",
    label: "Claude Sonnet 5.5",
    hint: "Qualité de raisonnement",
    tier: "qualite",
  },
  {
    id: "gpt-6.1-sol",
    label: "GPT-6.1 Sol",
    hint: "Raisonnement avancé",
    tier: "qualite",
  },
];

function cleanKey(raw: string | undefined) {
  const value = raw?.trim();
  if (!value || value.length > 500) return undefined;
  // Une clé API est un jeton ASCII imprimable, sans espace ni saut de ligne.
  if (!/^[\x21-\x7E]+$/.test(value)) return undefined;
  return value;
}

function cleanModel(raw: string | undefined) {
  const value = raw?.trim();
  if (!value || value.length > 120) return undefined;
  if (!/^[a-zA-Z0-9._/-]+$/.test(value)) return undefined;
  return value;
}

/** Valide un identifiant de modèle sans lire la configuration serveur. */
export function isValidModelId(value: string) {
  return cleanModel(value) === value;
}

function normalizeBaseUrl(raw: string | undefined) {
  const value = raw?.trim();
  if (!value) return null;
  return value.replace(/\/+$/, "");
}

/**
 * Configuration lue uniquement côté serveur. La clé API ne doit jamais
 * traverser la frontière client, sauf lorsqu'un utilisateur fournit la sienne
 * pour la durée de son onglet.
 */
export function getAiConfig(overrides?: {
  apiKey?: string;
  model?: string;
}): AiConfig {
  const clientKey = cleanKey(overrides?.apiKey);
  const serverKey =
    cleanKey(process.env.FRANCESTUDENT_API_KEY) ?? cleanKey(process.env.AI_API_KEY);
  const apiKey = clientKey ?? serverKey;

  const explicitBaseUrl = normalizeBaseUrl(
    process.env.FRANCESTUDENT_BASE_URL ?? process.env.AI_BASE_URL
  );
  const baseUrl = explicitBaseUrl ?? DEFAULT_BASE_URL;

  const model =
    cleanModel(overrides?.model) ??
    cleanModel(process.env.FRANCESTUDENT_MODEL) ??
    cleanModel(process.env.AI_MODEL) ??
    DEFAULT_MODEL;

  // Une URL de base explicite suffit pour un serveur local ou un mock.
  const configured = Boolean(apiKey || explicitBaseUrl);

  return {
    mode: configured ? "live" : "demo",
    apiKey,
    baseUrl,
    model,
    source: clientKey ? "client" : serverKey ? "server" : "none",
  };
}

export function getPublicAiConfig(): PublicAiConfig {
  const config = getAiConfig();

  let baseUrlHost = "api.francestudent.ai";
  try {
    baseUrlHost = new URL(config.baseUrl).host;
  } catch {
    baseUrlHost = config.baseUrl;
  }

  return {
    mode: config.mode,
    serverConfigured: config.mode === "live",
    model: config.model,
    baseUrlHost,
    provider: "France Student",
    models: CURATED_MODELS,
  };
}
