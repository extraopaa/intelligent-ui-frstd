"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import type { ParsedUI } from "@/lib/partial-ui";
import { BlockRenderer } from "@/components/blocks/block-renderer";

export function UIResponseView({
  ui,
  streaming,
  onPrompt,
  disabled = false,
}: {
  ui: ParsedUI;
  streaming: boolean;
  onPrompt: (prompt: string) => void;
  disabled?: boolean;
}) {
  const blocks = ui.blocks.slice(0, 24);

  return (
    <div>
      {ui.title ? (
        <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          <Sparkles className="h-3 w-3 text-accent" />
          {ui.title}
        </p>
      ) : null}

      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={`${block.type}-${index}`} className="animate-rise">
            <BlockRenderer block={block} onPrompt={onPrompt} disabled={disabled} />
          </div>
        ))}
      </div>

      {streaming ? (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-faint">
          <span className="inline-flex gap-1">
            <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:0ms]" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:160ms]" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:320ms]" />
          </span>
          L’interface se construit…
        </div>
      ) : null}

      {!streaming && ui.followUps.length > 0 ? (
        <div className="mt-5">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
            Continuer
          </p>
          <div className="flex flex-wrap gap-2">
            {ui.followUps.map((followUp, index) => (
              <button
                key={`${followUp}-${index}`}
                type="button"
                disabled={disabled}
                onClick={() => onPrompt(followUp)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-muted shadow-[0_1px_2px_rgba(10,27,61,0.03)] transition-colors hover:border-accent/25 hover:bg-accent/[0.04] hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                {followUp}
                <ArrowUpRight className="h-3 w-3 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
