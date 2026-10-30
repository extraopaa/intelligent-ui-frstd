import { Allow, parse } from "partial-json";
import {
  BlockSchema,
  UIResponseSchema,
  type UIBlock,
} from "@/lib/ui-schema";

export type ParsedUI = {
  title?: string;
  blocks: UIBlock[];
  followUps: string[];
  complete: boolean;
};

const EMPTY: ParsedUI = { blocks: [], followUps: [], complete: false };

/**
 * Le modèle peut entourer le JSON de ```json ... ``` ou ajouter un préambule.
 * On isole le premier objet JSON et on ignore le reste.
 */
export function extractJsonCandidate(raw: string): string {
  let text = raw.trim();

  text = text.replace(/^```(?:json)?\s*/i, "");
  text = text.replace(/\s*```\s*$/i, "");

  const start = text.indexOf("{");
  if (start === -1) return "";

  return text.slice(start);
}

/**
 * Parse un JSON partiel pendant le streaming.
 * Les blocs incomplets sont ignorés ; les blocs valides déjà reçus sont rendus.
 */
export function parsePartialUI(raw: string): ParsedUI {
  const candidate = extractJsonCandidate(raw);
  if (!candidate) return EMPTY;

  let value: unknown;
  try {
    value = parse(candidate, Allow.ALL);
  } catch {
    return EMPTY;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return EMPTY;
  }

  const record = value as Record<string, unknown>;
  const blocks: UIBlock[] = [];

  if (Array.isArray(record.blocks)) {
    for (const candidateBlock of record.blocks) {
      const result = BlockSchema.safeParse(candidateBlock);
      if (result.success) blocks.push(result.data);
    }
  }

  const followUps = Array.isArray(record.followUps)
    ? record.followUps
        .filter((item): item is string => typeof item === "string")
        .slice(0, 6)
    : [];

  const title =
    typeof record.title === "string" && record.title.trim().length > 0
      ? record.title
      : undefined;

  let complete = false;
  try {
    const full = JSON.parse(candidate) as unknown;
    complete = UIResponseSchema.safeParse(full).success;
  } catch {
    complete = false;
  }

  return { title, blocks, followUps, complete };
}
