"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  CURATED_MODELS,
  DEFAULT_MODEL,
  type AccountSession,
  type AccountUser,
  type AiMode,
  type ClientAiSession,
  type ClientKeySession,
  type PublicAiConfig,
} from "@/lib/ai-config";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/chat/brand";
import { OpenSourceLink } from "@/components/chat/open-source-link";
import { GitHubIcon } from "@/components/icons/github-icon";

type ConnectionStatus = "idle" | "testing" | "success" | "error";
type View = "account" | "key";

const envExample = `# .env.local — connexion serveur (facultatif)
FRANCESTUDENT_API_KEY=votre-cle-api
FRANCESTUDENT_MODEL=gpt-6-luna

# Facultatif : autre passerelle compatible
# FRANCESTUDENT_BASE_URL=https://api.francestudent.ai/v1`;

function initialKey(session: ClientAiSession | null) {
  return session?.kind === "key" ? session.apiKey : "";
}

function initialModel(session: ClientAiSession | null, config: PublicAiConfig | null) {
  return session?.model ?? config?.model ?? DEFAULT_MODEL;
}

export function SettingsDialog({
  onClose,
  config,
  session,
  mode,
  model,
  onConnectKey,
  onDisconnectKey,
  onConnectAccount,
  onDisconnectAccount,
  onAccountModelChange,
  onClearAll,
}: {
  onClose: () => void;
  config: PublicAiConfig | null;
  session: ClientAiSession | null;
  mode: AiMode;
  model: string;
  onConnectKey: (session: ClientKeySession) => void;
  onDisconnectKey: () => void;
  onConnectAccount: (session: AccountSession) => void;
  onDisconnectAccount: () => void;
  onAccountModelChange: (model: string) => void;
  onClearAll: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [view, setView] = useState<View>("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [accountStatus, setAccountStatus] = useState<ConnectionStatus>("idle");
  const [accountMessage, setAccountMessage] = useState("");
  const [apiKey, setApiKey] = useState(() => initialKey(session));
  const [modelInput, setModelInput] = useState(() => initialModel(session, config));
  const [showKey, setShowKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<ConnectionStatus>("idle");
  const [keyMessage, setKeyMessage] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [copied, setCopied] = useState(false);

  const closeDialog = useCallback(() => {
    setConfirmClear(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 30);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [closeDialog]);

  const account = session?.kind === "account" ? session : null;
  const keySession = session?.kind === "key" ? session : null;
  const isLive = mode === "live";
  const models = config?.models?.length ? config.models : CURATED_MODELS;
  const knownModel = models.some((option) => option.id === modelInput);
  const selectedModel = models.find((option) => option.id === modelInput);
  const accountBusy = accountStatus === "testing";
  const keyBusy = keyStatus === "testing";

  const connectionTitle = account
    ? "Compte France Student connecté"
    : keySession
      ? "Clé API personnelle active"
      : isLive
        ? "Connexion serveur active"
        : "Mode démo";

  const connectionBadge = account
    ? "Compte"
    : keySession
      ? "Clé personnelle"
      : isLive
        ? "Administrateur"
        : "Sans connexion";

  const connectAccount = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setAccountStatus("error");
      setAccountMessage("Renseignez votre email et votre mot de passe France Student.");
      return;
    }
    if (!consent) {
      setAccountStatus("error");
      setAccountMessage(
        "Cochez la case pour accepter d’utiliser la connexion non officielle."
      );
      return;
    }

    setAccountStatus("testing");
    setAccountMessage("");

    try {
      const response = await fetch("/api/auth/francestudent/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        user?: AccountUser;
      } | null;

      if (!response.ok || !data?.ok || !data.user) {
        setAccountStatus("error");
        setAccountMessage(
          data?.error ??
            "La connexion à France Student a échoué. Réessayez dans un instant."
        );
        return;
      }

      onConnectAccount({
        kind: "account",
        model: modelInput,
        user: data.user,
      });
      setPassword("");
      setConsent(false);
      setAccountStatus("success");
      setAccountMessage(
        `Connecté en tant que ${data.user.name || data.user.email}.`
      );
    } catch {
      setAccountStatus("error");
      setAccountMessage(
        "Impossible de joindre le serveur de connexion. Vérifiez votre connexion réseau."
      );
    }
  };

  const connectKey = async () => {
    const key = apiKey.trim();
    if (!key) {
      setKeyStatus("error");
      setKeyMessage("Collez votre clé API France Student pour continuer.");
      return;
    }

    setKeyStatus("testing");
    setKeyMessage("");

    try {
      const response = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key, model: modelInput }),
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        model?: string;
      } | null;

      if (!response.ok || !data?.ok) {
        setKeyStatus("error");
        setKeyMessage(
          data?.error ??
            "La connexion n'a pas pu être vérifiée. Réessayez dans un instant."
        );
        return;
      }

      onConnectKey({
        kind: "key",
        apiKey: key,
        model: data.model ?? modelInput,
      });
      setKeyStatus("success");
      setKeyMessage(
        "Clé vérifiée. L’Offre IA est connectée pour cet onglet — vous pouvez fermer ce panneau."
      );
    } catch {
      setKeyStatus("error");
      setKeyMessage(
        "Impossible de joindre le serveur de vérification. Vérifiez votre connexion réseau."
      );
    }
  };

  const disconnectKey = () => {
    onDisconnectKey();
    setApiKey("");
    setKeyStatus("idle");
    setKeyMessage(
      config?.serverConfigured
        ? "Clé personnelle retirée. La connexion serveur reste disponible."
        : "Clé personnelle retirée. Le mode démo reprend."
    );
  };

  const disconnectAccount = () => {
    onDisconnectAccount();
    setPassword("");
    setConsent(false);
    setAccountStatus("idle");
    setAccountMessage("");
  };

  const copyEnv = async () => {
    try {
      await navigator.clipboard.writeText(envExample);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
        onClick={closeDialog}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="animate-rise relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-line bg-panel shadow-[0_40px_120px_-30px_rgba(10,27,61,0.55)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <BrandMark size="sm" />
          <div className="min-w-0">
            <h2 id="settings-title" className="text-sm font-bold text-ink">
              Connexion France Student
            </h2>
            <p className="mt-0.5 text-[11px] text-faint">
              Offre IA · Intelligent UI
            </p>
          </div>
          <span className="ml-auto hidden items-center gap-1 rounded-full border border-line bg-canvas/70 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-faint sm:inline-flex">
            <GitHubIcon className="h-3 w-3" />
            Open source
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={closeDialog}
            aria-label="Fermer les réglages"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-faint transition-colors hover:bg-ink/[0.05] hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <section>
            <div
              className={cn(
                "rounded-2xl border p-4",
                isLive
                  ? "border-green/25 bg-green/[0.05]"
                  : "border-amber-200 bg-amber-50/70"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isLive ? "bg-green" : "bg-amber-500"
                  )}
                />
                <p className="text-sm font-semibold text-ink">{connectionTitle}</p>
                {isLive ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-green/25 bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <BadgeCheck className="h-3 w-3" />
                    {connectionBadge}
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-200 bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    Sans connexion
                  </span>
                )}
              </div>

              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-faint" />
                  <dt className="text-faint">Modèle</dt>
                  <dd className="ml-auto truncate font-semibold text-ink/85">
                    {isLive ? model : "Scénarios de démonstration"}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <Server className="h-3.5 w-3.5 text-faint" />
                  <dt className="text-faint">Fournisseur</dt>
                  <dd className="ml-auto truncate font-semibold text-ink/85">
                    France Student
                    {config?.baseUrlHost ? (
                      <span className="font-normal text-faint"> · {config.baseUrlHost}</span>
                    ) : null}
                  </dd>
                </div>
                {account ? (
                  <div className="flex items-center gap-2">
                    <UserRound className="h-3.5 w-3.5 text-faint" />
                    <dt className="text-faint">Compte</dt>
                    <dd className="ml-auto max-w-[65%] truncate font-semibold text-ink/85">
                      {account.user.name}
                      {account.user.email ? (
                        <span className="font-normal text-faint"> · {account.user.email}</span>
                      ) : null}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {!isLive ? (
                <p className="mt-3 border-t border-amber-200/70 pt-3 text-xs leading-relaxed text-amber-800/90">
                  Les réponses sont scénarisées localement. Connectez votre compte
                  France Student ou une clé API pour utiliser les modèles de l’Offre IA.
                </p>
              ) : null}

              {isLive && !session && config?.serverConfigured ? (
                <p className="mt-3 border-t border-green/15 pt-3 text-xs leading-relaxed text-emerald-800/90">
                  Une connexion serveur est configurée par l’administrateur. Elle est
                  utilisable sans compte personnel.
                </p>
              ) : null}

              {account ? (
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-green/15 pt-3">
                  <p className="text-[11px] leading-relaxed text-emerald-800/90">
                    Session France Student active sur ce serveur.
                  </p>
                  <button
                    type="button"
                    onClick={disconnectAccount}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-green/20 bg-white/70 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <LogOut className="h-3 w-3" />
                    Se déconnecter
                  </button>
                </div>
              ) : null}

              {keySession ? (
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-green/15 pt-3">
                  <p className="text-[11px] leading-relaxed text-emerald-800/90">
                    Votre clé API est vérifiée pour cet onglet.
                  </p>
                  <button
                    type="button"
                    onClick={disconnectKey}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-green/20 bg-white/70 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <LogOut className="h-3 w-3" />
                    Retirer ma clé
                  </button>
                </div>
              ) : null}
            </div>
          </section>

          {view === "account" ? (
            <>
              <section className="mt-5 overflow-hidden rounded-3xl border border-accent/15 bg-[linear-gradient(135deg,rgba(233,239,255,0.95)_0%,rgba(255,255,255,0.98)_52%,rgba(255,75,140,0.06)_100%)] p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-white shadow-[0_12px_28px_-12px_rgba(1,57,183,0.75)]">
                    <LogIn className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
                      Connexion au compte
                    </p>
                    <h3 className="mt-0.5 text-base font-extrabold tracking-tight text-ink">
                      Votre compte France Student
                    </h3>
                  </div>
                </div>

                {account ? (
                  <div className="mt-4 rounded-2xl border border-green/25 bg-white/70 p-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green/10 text-emerald-700">
                        <UserRound className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {account.user.name}
                        </p>
                        <p className="truncate text-[11px] text-faint">
                          {account.user.email || "Compte France Student"}
                        </p>
                      </div>
                    </div>

                    <label
                      htmlFor="account-model"
                      className="mb-1.5 mt-4 block text-xs font-semibold text-ink/80"
                    >
                      Modèle
                    </label>
                    <select
                      id="account-model"
                      value={modelInput}
                      onChange={(event) => {
                        setModelInput(event.target.value);
                        onAccountModelChange(event.target.value);
                      }}
                      className="w-full appearance-none rounded-xl border border-line bg-canvas/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/15"
                    >
                      {!knownModel ? (
                        <option value={modelInput}>{modelInput} · personnalisé</option>
                      ) : null}
                      {models.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label} — {option.hint}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-[11px] text-faint">
                      {selectedModel
                        ? selectedModel.hint
                        : "Identifiant de modèle transmis tel quel à France Student."}
                    </p>

                    <button
                      type="button"
                      onClick={disconnectAccount}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-3.5 py-2 text-xs font-semibold text-muted transition-colors hover:border-rose-200 hover:text-rose-700"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Se déconnecter de France Student
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="mt-3 text-xs leading-relaxed text-muted">
                      Connectez-vous avec l’email et le mot de passe de votre compte
                      France Student. Aucune clé API n’est nécessaire.
                    </p>

                    <div className="mt-3 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50/90 px-3.5 py-2.5 text-[11px] leading-relaxed text-amber-800">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <p className="font-semibold">Connexion non officielle</p>
                        <p className="mt-0.5">
                          Cette méthode reproduit le parcours de connexion de France
                          Student. Elle n’est pas officiellement prise en charge : elle
                          peut cesser de fonctionner à tout moment. Votre mot de passe
                          est transmis à France Student pendant la connexion, puis
                          oublié. Seul le jeton de session est conservé dans un cookie
                          HttpOnly, sur ce serveur, pendant environ 30 jours.
                        </p>
                      </div>
                    </div>

                    <form
                      className="mt-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void connectAccount();
                      }}
                    >
                      <label
                        htmlFor="fs-email"
                        className="mb-1.5 block text-xs font-semibold text-ink/80"
                      >
                        Email France Student
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                        <input
                          id="fs-email"
                          type="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            if (accountStatus !== "idle") {
                              setAccountStatus("idle");
                              setAccountMessage("");
                            }
                          }}
                          placeholder="prenom.nom@exemple.fr"
                          autoComplete="email"
                          spellCheck={false}
                          className="w-full rounded-xl border border-line bg-white/80 py-2.5 pl-10 pr-3.5 text-sm text-ink outline-none transition-colors placeholder:text-faint/70 focus:border-accent/60 focus:ring-2 focus:ring-accent/15"
                        />
                      </div>

                      <label
                        htmlFor="fs-password"
                        className="mb-1.5 mt-4 block text-xs font-semibold text-ink/80"
                      >
                        Mot de passe
                      </label>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                        <input
                          id="fs-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(event) => {
                            setPassword(event.target.value);
                            if (accountStatus !== "idle") {
                              setAccountStatus("idle");
                              setAccountMessage("");
                            }
                          }}
                          placeholder="Votre mot de passe France Student"
                          autoComplete="current-password"
                          className="w-full rounded-xl border border-line bg-white/80 py-2.5 pl-10 pr-11 text-sm text-ink outline-none transition-colors placeholder:text-faint/70 focus:border-accent/60 focus:ring-2 focus:ring-accent/15"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          aria-label={
                            showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                          }
                          className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-faint transition-colors hover:bg-ink/[0.05] hover:text-ink"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-white/60 px-3 py-2.5 text-[11px] leading-relaxed text-muted">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(event) => {
                            setConsent(event.target.checked);
                            if (accountStatus !== "idle") {
                              setAccountStatus("idle");
                              setAccountMessage("");
                            }
                          }}
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-accent"
                        />
                        <span>
                          Je comprends et j’accepte d’utiliser cette connexion non
                          officielle avec mon compte France Student.
                        </span>
                      </label>

                      {accountStatus === "error" ? (
                        <div
                          role="alert"
                          className="mt-3 flex gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-700"
                        >
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{accountMessage}</span>
                        </div>
                      ) : null}

                      {accountStatus === "success" ? (
                        <div
                          role="status"
                          className="mt-3 flex gap-2.5 rounded-xl border border-green/25 bg-green/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-emerald-800"
                        >
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{accountMessage}</span>
                        </div>
                      ) : null}

                      <button
                        type="submit"
                        disabled={
                          accountBusy ||
                          !email.trim() ||
                          !password ||
                          !consent
                        }
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_-16px_rgba(1,57,183,0.9)] transition-all hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        {accountBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogIn className="h-4 w-4" />
                        )}
                        {accountBusy ? "Connexion à France Student…" : "Se connecter"}
                      </button>
                    </form>

                    <div className="my-4 flex items-center gap-3">
                      <span className="h-px flex-1 bg-line" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
                        ou
                      </span>
                      <span className="h-px flex-1 bg-line" />
                    </div>

                    <a
                      href={SITE.loginUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-accent/20 bg-white/70 px-4 py-2.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/[0.05]"
                    >
                      Ouvrir le portail officiel France Student
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                    <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-faint">
                      <LockKeyhole className="mt-0.5 h-3 w-3 shrink-0" />
                      Le portail officiel reste la voie recommandée. La connexion
                      automatique ci-dessus est un contournement technique, sans
                      garantie de compatibilité avec France Student.
                    </p>
                  </>
                )}
              </section>

              {!account ? (
                <section className="mt-4 rounded-2xl border border-line bg-panel p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink/[0.05] text-ink">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-ink">
                        Accès développeur
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                        Vous disposez déjà d’une clé API France Student ?
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setView("key");
                        setKeyStatus("idle");
                        setKeyMessage("");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas/60 px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-accent/30 hover:bg-accent/[0.05] hover:text-accent"
                    >
                      Utiliser une clé
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </section>
              ) : null}

              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] leading-relaxed text-faint/80">
                <Sparkles className="h-3 w-3" />
                Sans connexion, le mode démo reste disponible avec 10 scénarios.
              </p>
            </>
          ) : (
            <section className="mt-5">
              <button
                type="button"
                onClick={() => {
                  setView("account");
                  setKeyStatus("idle");
                  setKeyMessage("");
                }}
                className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-faint transition-colors hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour à la connexion France Student
              </button>

              <div className="mb-2 flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-accent" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-faint">
                  Clé API France Student
                </h3>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-muted">
                L’accès API officiel de France Student utilise une clé créée depuis
                votre compte développeur. Elle reste dans cet onglet et n’est jamais
                enregistrée par l’application.
              </p>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void connectKey();
                }}
              >
                <label
                  htmlFor="api-key"
                  className="mb-1.5 block text-xs font-semibold text-ink/80"
                >
                  Clé API
                </label>
                <div className="relative">
                  <input
                    id="api-key"
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(event) => {
                      setApiKey(event.target.value);
                      if (keyStatus !== "idle") {
                        setKeyStatus("idle");
                        setKeyMessage("");
                      }
                    }}
                    placeholder="Collez votre clé API France Student"
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full rounded-xl border border-line bg-canvas/60 py-2.5 pl-3.5 pr-11 text-sm text-ink outline-none transition-colors placeholder:text-faint/70 focus:border-accent/60 focus:ring-2 focus:ring-accent/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((current) => !current)}
                    aria-label={showKey ? "Masquer la clé" : "Afficher la clé"}
                    className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-faint transition-colors hover:bg-ink/[0.05] hover:text-ink"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px]">
                  <a
                    href={SITE.accountUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                  >
                    Créer une clé API
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                  <a
                    href={SITE.apiDocsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-faint hover:text-ink"
                  >
                    Documentation API
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>

                <label
                  htmlFor="api-model"
                  className="mb-1.5 mt-4 block text-xs font-semibold text-ink/80"
                >
                  Modèle
                </label>
                <select
                  id="api-model"
                  value={modelInput}
                  onChange={(event) => {
                    setModelInput(event.target.value);
                    if (keyStatus !== "idle") {
                      setKeyStatus("idle");
                      setKeyMessage("");
                    }
                  }}
                  className="w-full appearance-none rounded-xl border border-line bg-canvas/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/15"
                >
                  {!knownModel ? (
                    <option value={modelInput}>{modelInput} · personnalisé</option>
                  ) : null}
                  {models.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label} — {option.hint}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] text-faint">
                  {selectedModel
                    ? selectedModel.hint
                    : "Identifiant de modèle transmis tel quel à l’API France Student."}
                </p>

                {keyStatus === "error" ? (
                  <div
                    role="alert"
                    className="mt-3 flex gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-700"
                  >
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{keyMessage}</span>
                  </div>
                ) : null}

                {keyStatus === "success" ? (
                  <div
                    role="status"
                    className="mt-3 flex gap-2.5 rounded-xl border border-green/25 bg-green/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-emerald-800"
                  >
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{keyMessage}</span>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="submit"
                    disabled={keyBusy || !apiKey.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_26px_-16px_rgba(1,57,183,0.9)] transition-all hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {keyBusy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                    {keyBusy
                      ? "Vérification…"
                      : keySession
                        ? "Tester et mettre à jour"
                        : "Tester et connecter"}
                  </button>

                  {keySession ? (
                    <button
                      type="button"
                      onClick={disconnectKey}
                      disabled={keyBusy}
                      className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:border-rose-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Se déconnecter
                    </button>
                  ) : null}
                </div>

                <p className="mt-2.5 text-[10px] leading-relaxed text-faint">
                  La vérification envoie un échange minimal au modèle et peut consommer
                  quelques tokens de votre budget API.
                </p>
              </form>
            </section>
          )}

          <section className="mt-6">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-green" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-faint">
                Données et confidentialité
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-muted">
              Les discussions restent en mémoire dans cet onglet : cette application
              n’enregistre aucun historique. En mode compte, la conversation est aussi
              créée dans votre compte France Student ; elle est supprimée lorsque vous
              supprimez la discussion ou vous déconnectez. Le mot de passe n’est jamais
              stocké. En mode clé, la clé reste dans le `sessionStorage` de l’onglet.
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-line bg-canvas/60 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink/[0.05] text-ink">
                <GitHubIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">Projet open source</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Le code de cette interface est public sous licence {SITE.license}.
                  Vous pouvez l’auto-héberger, l’étudier et le modifier librement.
                </p>
                <a
                  href={SITE.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                >
                  Voir le dépôt GitHub
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </section>

          <details className="mt-4 rounded-xl border border-line bg-canvas/50 px-4 py-3">
            <summary className="cursor-pointer select-none text-xs font-semibold text-muted">
              Déploiement : configurer une clé serveur
            </summary>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Pour offrir l’accès sans clé personnelle, renseignez ces variables dans{" "}
              <code className="rounded bg-ink/[0.06] px-1 py-0.5 text-[10px] text-ink/80">
                .env.local
              </code>{" "}
              puis redémarrez le serveur.
            </p>
            <div className="mt-2 overflow-hidden rounded-lg border border-line bg-panel">
              <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
                <span className="font-mono text-[10px] text-faint">.env.local</span>
                <button
                  type="button"
                  onClick={() => void copyEnv()}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>
              <pre className="overflow-x-auto p-3 text-[10px] leading-relaxed text-ink/75">
                {envExample}
              </pre>
            </div>
          </details>

          <section className="mt-6 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => {
                if (!confirmClear) {
                  setConfirmClear(true);
                  return;
                }
                onClearAll();
                setConfirmClear(false);
                closeDialog();
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                confirmClear
                  ? "border-rose-300 bg-rose-100 text-rose-700 hover:bg-rose-200"
                  : "border-line bg-panel text-muted hover:border-rose-200 hover:text-rose-700"
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmClear ? "Confirmer l’effacement" : "Effacer toutes les discussions"}
            </button>
            {confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="ml-2 text-[11px] text-faint underline-offset-2 hover:underline"
              >
                Annuler
              </button>
            ) : null}
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          <OpenSourceLink />
          <button
            type="button"
            onClick={closeDialog}
            className="rounded-xl bg-ink/[0.06] px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-ink/[0.09]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
