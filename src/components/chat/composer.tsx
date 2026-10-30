"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export function Composer({
  streaming,
  onSend,
  onStop,
}: {
  streaming: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 200)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !streaming;

  const submit = () => {
    const text = value.trim();
    if (!text || streaming) return;
    setValue("");
    onSend(text);
    textareaRef.current?.focus();
  };

  return (
    <div className="shrink-0 px-3 pb-3 pt-2 sm:px-6 sm:pb-5">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-[26px] border border-line bg-panel p-2 shadow-[0_18px_50px_-30px_rgba(10,27,61,0.35)] transition-colors focus-within:border-accent/40 focus-within:shadow-[0_18px_50px_-30px_rgba(1,57,183,0.35)]">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={
              streaming
                ? "Génération en cours…"
                : "Posez une question, décrivez un projet, comparez deux options…"
            }
            aria-label="Votre message"
            className="max-h-[200px] w-full resize-none bg-transparent px-3.5 py-2.5 text-[15px] leading-relaxed text-ink outline-none placeholder:text-faint/80"
          />

          <div className="flex items-center justify-between gap-3 px-1.5 pb-0.5 pt-1">
            <span className="hidden items-center gap-1.5 pl-2 text-[11px] text-faint sm:flex">
              <span className="h-1 w-1 rounded-full bg-accent" />
              Interface générative · Offre IA
            </span>

            <div className="ml-auto flex items-center gap-2">
              {streaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-ink/[0.04] px-3.5 text-xs font-medium text-ink transition-colors hover:bg-ink/[0.07]"
                >
                  <Square className="h-3 w-3 fill-current" />
                  Arrêter
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSend}
                  aria-label="Envoyer le message"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-all",
                    canSend
                      ? "bg-accent text-white shadow-[0_8px_18px_-10px_rgba(1,57,183,0.8)] hover:bg-accent-strong"
                      : "cursor-not-allowed bg-ink/[0.06] text-faint"
                  )}
                >
                  <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-[10px] leading-relaxed text-faint/80">
          <span className="sm:hidden">Entrée pour envoyer</span>
          <span className="hidden sm:inline">
            Entrée pour envoyer · Maj + Entrée pour un saut de ligne · Les réponses
            peuvent contenir des erreurs.
          </span>
        </p>
      </div>
    </div>
  );
}
