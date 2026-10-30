"use client";

import {
  ArrowUpRight,
  Calculator,
  ClipboardList,
  LogIn,
  MapPin,
  Scale,
  Settings2,
  Sparkles,
} from "lucide-react";
import type { AiMode, ClientAiSession, PublicAiConfig } from "@/lib/ai-config";
import { SITE } from "@/lib/site";
import { BrandMark } from "@/components/chat/brand";
import { OpenSourceLink } from "@/components/chat/open-source-link";

const suggestions = [
  {
    icon: MapPin,
    tint: "text-accent",
    background: "bg-accent-soft",
    title: "Organiser un week-end",
    description: "Itinéraire, budget et checklist",
    prompt: "Organise un week-end à Strasbourg pour deux avec un budget de 400 €.",
  },
  {
    icon: Scale,
    tint: "text-pink",
    background: "bg-pink/10",
    title: "Comparer deux options",
    description: "Forces, limites et verdict",
    prompt: "Compare le télétravail et le présentiel.",
  },
  {
    icon: Calculator,
    tint: "text-green",
    background: "bg-green/10",
    title: "Simuler un budget",
    description: "Curseur, graphique et estimation",
    prompt: "Estime le budget d'un événement de 80 personnes.",
  },
  {
    icon: Sparkles,
    tint: "text-amber-600",
    background: "bg-amber-50",
    title: "Comprendre l'interface",
    description: "Le fonctionnement, bloc par bloc",
    prompt: "Comment fonctionne l'Intelligent UI ?",
  },
];

export function EmptyState({
  onPrompt,
  onOpenSettings,
  config,
  session,
  mode,
  model,
}: {
  onPrompt: (prompt: string) => void;
  onOpenSettings: () => void;
  config: PublicAiConfig | null;
  session: ClientAiSession | null;
  mode: AiMode;
  model: string;
}) {
  const isDemo = mode === "demo";

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-start px-4 py-7 sm:justify-center sm:px-8 sm:py-14">
      <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
        <div className="relative mb-4 sm:mb-5">
          <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-accent/10 blur-3xl" />
          <BrandMark size="lg" className="sm:h-20 sm:w-20" />
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="h-px w-5 bg-accent/25" />
            Offre IA · France Student
            <span className="h-px w-5 bg-accent/25" />
          </p>
          <span className="rounded-full border border-pink/20 bg-pink/[0.07] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-pink">
            Bêta
          </span>
        </div>

        <h1 className="max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-[2.7rem] sm:leading-[1.08]">
          Posez la question.
          <br className="hidden sm:block" />{" "}
          <span className="bg-gradient-to-r from-accent to-pink bg-clip-text text-transparent">
            Obtenez l’interface.
          </span>
        </h1>

        <p className="mt-3 max-w-xl text-pretty text-xs leading-relaxed text-muted sm:mt-4 sm:text-base">
          L’IA de l’Offre France Student transforme chaque réponse en interface
          claire : texte, tableau, graphique, checklist ou formulaire. Les
          interactions restent locales, les actions relancent la conversation.
        </p>

        {isDemo ? (
          <div className="mt-5 flex flex-col items-center gap-2 sm:mt-6">
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_-14px_rgba(1,57,183,0.7)] transition-all hover:-translate-y-0.5 hover:bg-accent-strong"
            >
              <LogIn className="h-4 w-4" />
              Se connecter avec France Student
            </button>
            <p className="text-[11px] text-faint">
              ou choisissez une suggestion pour explorer le mode démo
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenSettings}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-green/20 bg-green/[0.06] px-3.5 py-1.5 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-green/[0.1] sm:mt-6"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            {session?.kind === "account"
              ? `Compte France Student · ${model}`
              : `Accès France Student · ${model}`}
            <Settings2 className="h-3 w-3 opacity-60" />
          </button>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;

          return (
            <button
              key={suggestion.title}
              type="button"
              onClick={() => onPrompt(suggestion.prompt)}
              className="group flex items-start gap-3 rounded-2xl border border-line bg-panel p-3 text-left shadow-[0_1px_2px_rgba(10,27,61,0.04)] transition-all hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-[0_18px_40px_-24px_rgba(1,57,183,0.35)] sm:p-4"
            >
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${suggestion.background} sm:h-9 sm:w-9`}
              >
                <Icon className={`h-4 w-4 ${suggestion.tint}`} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">
                    {suggestion.title}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </span>
                <span className="mt-0.5 hidden text-xs text-muted sm:block">
                  {suggestion.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-faint sm:mt-6">
        <button
          type="button"
          onClick={() => onPrompt("Crée un formulaire de brief pour un projet.")}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:bg-ink/[0.04] hover:text-ink"
        >
          <ClipboardList className="h-3 w-3" />
          Tester le formulaire de brief
          <ArrowUpRight className="h-3 w-3" />
        </button>

        <a
          href={SITE.offerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:bg-ink/[0.04] hover:text-ink"
        >
          Découvrir l’Offre IA
          <ArrowUpRight className="h-3 w-3" />
        </a>

        <OpenSourceLink />
      </div>

      {isDemo ? (
        <p className="mt-3 text-center text-[10px] leading-relaxed text-faint/80">
          Mode démo · réponses scénarisées, aucune connexion requise.
          {config?.serverConfigured ? " Une connexion serveur est aussi disponible." : ""}
        </p>
      ) : (
        <p className="mt-3 text-center text-[10px] leading-relaxed text-faint/80">
          {session?.kind === "account"
            ? "Connecté avec votre compte France Student. Les conversations sont aussi créées dans votre compte."
            : session
              ? "Connexion avec votre clé API personnelle, conservée pour cet onglet uniquement."
              : "Connexion via la configuration serveur."}
        </p>
      )}
    </div>
  );
}
