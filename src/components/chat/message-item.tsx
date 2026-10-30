"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  RefreshCw,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { ChatMessage } from "@/lib/chat-types";
import { parsePartialUI } from "@/lib/partial-ui";
import { uiToText } from "@/lib/ui-text";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/chat/brand";
import { UIResponseView } from "@/components/chat/ui-response-view";
import { MarkdownBlockView } from "@/components/blocks/display-blocks";

function ModeBadge({ mode }: { mode?: ChatMessage["mode"] }) {
  if (!mode) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
        mode === "demo"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-green/20 bg-green/[0.07] text-emerald-700"
      )}
    >
      <span
        className={cn(
          "h-1 w-1 rounded-full",
          mode === "demo" ? "bg-amber-500" : "bg-green"
        )}
      />
      {mode === "demo" ? "Démo" : "Offre IA"}
    </span>
  );
}

function ThinkingState() {
  return (
    <div className="max-w-xl space-y-3" aria-label="Réponse en cours">
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="inline-flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:140ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:280ms]" />
        </span>
        Je compose l’interface…
      </div>
      <div className="animate-pulse space-y-2.5">
        <div className="h-5 w-48 rounded-md bg-ink/[0.06]" />
        <div className="h-16 rounded-2xl border border-line bg-ink/[0.025]" />
        <div className="h-10 w-2/3 rounded-xl border border-line bg-ink/[0.02]" />
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Copié" : "Copier la réponse"}
      aria-label={copied ? "Réponse copiée" : "Copier la réponse"}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-faint transition-colors hover:bg-ink/[0.05] hover:text-ink"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export function MessageItem({
  message,
  onPrompt,
  onRetry,
  onRegenerate,
  canRegenerate = false,
  disabled = false,
}: {
  message: ChatMessage;
  onPrompt: (prompt: string) => void;
  onRetry: () => void;
  onRegenerate: () => void;
  canRegenerate?: boolean;
  disabled?: boolean;
}) {
  const parsed = useMemo(() => parsePartialUI(message.content), [message.content]);
  const isStreaming = message.status === "streaming";
  const hasBlocks = parsed.blocks.length > 0;
  const copyText = hasBlocks
    ? uiToText({ title: parsed.title, blocks: parsed.blocks, followUps: parsed.followUps })
    : message.fallback ?? message.content;

  if (message.role === "user") {
    return (
      <div className="animate-rise flex justify-end">
        <div className="max-w-[85%] rounded-3xl rounded-br-md border border-accent/20 bg-accent px-4 py-3 text-[15px] leading-relaxed text-white shadow-[0_12px_28px_-18px_rgba(1,57,183,0.8)] sm:max-w-[75%] sm:px-5">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-rise flex gap-3 sm:gap-4">
      <BrandMark size="sm" className="mt-0.5" />

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex min-h-7 items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold text-ink"
              title="France Student · Intelligent UI"
            >
              Intelligent UI
            </span>
            <ModeBadge mode={message.mode} />
            {isStreaming ? (
              <span className="text-[10px] text-faint">en train d’écrire</span>
            ) : null}
          </div>

          <div className="flex items-center gap-0.5 opacity-70 transition-opacity hover:opacity-100">
            {canRegenerate && !isStreaming ? (
              <button
                type="button"
                onClick={onRegenerate}
                title="Régénérer la réponse"
                aria-label="Régénérer la réponse"
                disabled={disabled}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-faint transition-colors hover:bg-ink/[0.05] hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            ) : null}
            {copyText ? <CopyButton text={copyText} /> : null}
          </div>
        </div>

        {message.status === "error" ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-rose-800">
                  La réponse n’a pas pu aboutir
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-rose-700">
                  {message.error ?? "Une erreur inattendue est survenue."}
                </p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-800 transition-colors hover:bg-rose-200"
                >
                  <RotateCcw className="h-3 w-3" />
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {message.status !== "error" && isStreaming && !hasBlocks ? (
          <ThinkingState />
        ) : null}

        {hasBlocks ? (
          <div className={cn(message.status === "error" && "mb-3")}>
            <UIResponseView
              ui={parsed}
              streaming={isStreaming}
              onPrompt={onPrompt}
              disabled={disabled}
            />
          </div>
        ) : null}

        {!hasBlocks && message.fallback ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">
              <Sparkles className="h-3 w-3" />
              Réponse non structurée
            </p>
            {message.fallback.trim().startsWith("{") ||
            message.fallback.trim().startsWith("```") ? (
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-white/70 p-3 text-xs leading-relaxed text-ink/70">
                {message.fallback}
              </pre>
            ) : (
              <MarkdownBlockView block={{ type: "markdown", content: message.fallback }} />
            )}
          </div>
        ) : null}

        {message.stopped ? (
          <p className="mt-3 text-[11px] text-faint">Génération interrompue.</p>
        ) : null}

        {message.incomplete && !isStreaming && !message.stopped ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
            La réponse s’est arrêtée avant la fin. Vous pouvez la régénérer.
          </p>
        ) : null}

        {!isStreaming && !hasBlocks && !message.fallback && message.status === "done" ? (
          <p className="text-sm text-muted">La réponse est vide.</p>
        ) : null}
      </div>
    </div>
  );
}
