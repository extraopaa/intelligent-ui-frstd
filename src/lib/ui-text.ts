import type { UIBlock, UIResponse } from "@/lib/ui-schema";

function blockToText(block: UIBlock): string {
  switch (block.type) {
    case "markdown":
      return block.content;
    case "heading":
      return `## ${block.text}`;
    case "callout":
      return [block.title, block.content].filter(Boolean).join(" — ");
    case "stats":
      return block.items
        .map((item) => `${item.label} : ${item.value}${item.hint ? ` (${item.hint})` : ""}`)
        .join("\n");
    case "table":
      return [
        block.columns.join(" | "),
        ...block.rows.map((row) => row.join(" | ")),
        block.caption ?? "",
      ]
        .filter(Boolean)
        .join("\n");
    case "chart":
      return [
        block.title,
        ...block.data.map((point) => `${point.label} : ${point.value}${block.unit ?? ""}`),
        block.caption,
      ]
        .filter(Boolean)
        .join("\n");
    case "checklist":
      return [
        block.title,
        ...block.items.map((item) => `${item.checked ? "[x]" : "[ ]"} ${item.label}`),
      ]
        .filter(Boolean)
        .join("\n");
    case "timeline":
      return [
        block.title,
        ...block.items.map((item) =>
          [item.date, item.title, item.description].filter(Boolean).join(" — ")
        ),
      ]
        .filter(Boolean)
        .join("\n");
    case "compare":
      return [
        `${block.left.title} :`,
        ...block.left.points.map((point) => `- ${point}`),
        `${block.right.title} :`,
        ...block.right.points.map((point) => `- ${point}`),
        block.verdict ? `Verdict : ${block.verdict}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    case "slider":
      return [
        block.title,
        block.label,
        block.hint,
        block.resultLabel
          ? `${block.resultLabel} : ${block.defaultValue}${block.resultUnit ?? ""}`
          : undefined,
      ]
        .filter(Boolean)
        .join("\n");
    case "form":
      return [
        block.title,
        block.description,
        ...block.fields.map((field) => `- ${field.label} (${field.type})`),
      ]
        .filter(Boolean)
        .join("\n");
    case "actions":
      return [block.title, ...block.actions.map((action) => `[${action.label}]`)].filter(Boolean).join("\n");
    case "tabs":
      return [
        block.title,
        ...block.tabs.map((tab) =>
          [`### ${tab.label}`, tab.content, ...(tab.points ?? []).map((point) => `- ${point}`)]
            .filter(Boolean)
            .join("\n")
        ),
      ]
        .filter(Boolean)
        .join("\n\n");
    case "cards":
      return [
        block.title,
        ...block.items.map((item) =>
          `- ${item.title}${item.badge ? ` [${item.badge}]` : ""}${item.text ? ` : ${item.text}` : ""}`
        ),
      ]
        .filter(Boolean)
        .join("\n");
    case "steps":
      return [
        block.title,
        ...block.items.map((item, index) =>
          [`${index + 1}. ${item.title}`, item.description, item.detail]
            .filter(Boolean)
            .join(" — ")
        ),
      ]
        .filter(Boolean)
        .join("\n");
    case "flashcards":
      return [
        block.title,
        ...block.cards.map((card) => `Q : ${card.front}\nR : ${card.back}`),
      ]
        .filter(Boolean)
        .join("\n");
    case "calculator":
      return [
        block.title,
        block.description,
        ...block.inputs.map((input) => `- ${input.label} (${input.min}–${input.max}${input.unit ? ` ${input.unit}` : ""})`),
        ...block.outputs.map((output) => `→ ${output.label}`),
        block.hint,
      ]
        .filter(Boolean)
        .join("\n");
    case "map":
      return [
        block.title,
        ...block.markers.map(
          (marker, index) =>
            `${index + 1}. ${marker.icon ? `${marker.icon} ` : ""}${marker.label} (${marker.lat}, ${marker.lng})${marker.category ? ` [${marker.category}]` : ""}${marker.description ? ` — ${marker.description}` : ""}`,
        ),
        block.route ? "Itinéraire dans l'ordre des lieux." : "",
        block.caption,
      ]
        .filter(Boolean)
        .join("\n");
    case "sources":
      return block.items
        .map((item) => `${item.title}${item.url ? ` — ${item.url}` : ""}`)
        .join("\n");
    default:
      return "";
  }
}

export function uiToText(ui: Pick<UIResponse, "title" | "blocks" | "followUps">): string {
  const parts: string[] = [];
  if (ui.title) parts.push(`# ${ui.title}`);
  for (const block of ui.blocks) {
    const text = blockToText(block).trim();
    if (text) parts.push(text);
  }
  if (ui.followUps?.length) {
    parts.push(`Suggestions : ${ui.followUps.join(" · ")}`);
  }
  return parts.join("\n\n").trim();
}
