"use client";

import {
  ArrowUpRight,
  MessageSquare,
  Plus,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import type {
  AiMode,
  ClientAiSession,
  PublicAiConfig,
} from "@/lib/ai-config";
import type { Conversation } from "@/lib/chat-types";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { BrandMark, BrandName, BrandSubtitle } from "@/components/chat/brand";
import { OpenSourceLink } from "@/components/chat/open-source-link";

export function Sidebar({
  conversations,
  activeId,
  open,
  onClose,
  onNew,
  onSelect,
  onDelete,
  onOpenSettings,
  config,
  session,
  mode,
  model,
  streamingConversationId,
}: {
  conversations: Conversation[];
  activeId: string;
  open: boolean;
  onClose: () => void;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
  config: PublicAiConfig | null;
  session: ClientAiSession | null;
  mode: AiMode;
  model: string;
  streamingConversationId: string | null;
}) {
  const isDemo = mode === "demo";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/35 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[284px] flex-col border-r border-line bg-panel/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Navigation des discussions"
      >
        <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
          <BrandMark size="md" />
          <div className="min-w-0">
            <BrandName />
            <BrandSubtitle className="mt-1 block" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-faint transition-colors hover:bg-ink/[0.05] hover:text-ink lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3">
          <button
            type="button"
            onClick={() => {
              onNew();
              onClose();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(1,57,183,0.8)] transition-all hover:-translate-y-0.5 hover:bg-accent-strong"
          >
            <Plus className="h-4 w-4" />
            Nouvelle discussion
          </button>
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-4 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
              Discussions
            </p>
            <span className="text-[10px] tabular-nums text-faint/70">
              {conversations.length}
            </span>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            <ul className="space-y-0.5">
              {conversations.map((conversation) => {
                const active = conversation.id === activeId;
                const streaming = conversation.id === streamingConversationId;

                return (
                  <li key={conversation.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(conversation.id);
                        onClose();
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl py-2.5 pl-3 pr-9 text-left text-[13px] transition-colors",
                        active
                          ? "bg-accent/[0.07] font-medium text-accent"
                          : "text-muted hover:bg-ink/[0.035] hover:text-ink"
                      )}
                    >
                      <MessageSquare
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          active ? "text-accent" : "text-faint"
                        )}
                      />
                      <span className="truncate">{conversation.title}</span>
                      {streaming ? (
                        <span className="ml-auto h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent" />
                      ) : null}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(conversation.id)}
                      aria-label={`Supprimer ${conversation.title}`}
                      title="Supprimer la discussion"
                      className="absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-faint opacity-100 transition-all hover:bg-rose-50 hover:text-rose-600 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="border-t border-line p-3">
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full rounded-xl border border-line bg-canvas/70 p-3 text-left transition-colors hover:border-accent/20 hover:bg-accent/[0.035]"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isDemo ? "bg-amber-500" : "bg-green"
                )}
              />
              <span className="text-xs font-semibold text-ink">
                {isDemo
                  ? "Mode démo"
                  : session?.kind === "account"
                    ? "Compte France Student"
                    : session
                      ? "Accès France Student actif"
                      : "Connexion serveur active"}
              </span>
              <Settings2 className="ml-auto h-3.5 w-3.5 text-faint" />
            </div>
            <p className="mt-1 truncate text-[10px] text-faint">
              {isDemo
                ? "Réponses scénarisées · se connecter"
                : session?.kind === "account"
                  ? `${model} · ${session.user.email || "compte connecté"}`
                  : `${model} · ${config?.baseUrlHost ?? "France Student"}`}
            </p>
          </button>

          <div className="mt-2 flex items-center justify-between gap-2 px-1">
            <OpenSourceLink compact />
            <a
              href={SITE.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-faint transition-colors hover:text-ink"
            >
              francestudent.org
              <ArrowUpRight className="h-2.5 w-2.5" />
            </a>
          </div>

          <p className="mt-1 px-1 text-[10px] text-faint/60">
            MVP · conversations en mémoire
          </p>
        </div>
      </aside>
    </>
  );
}
