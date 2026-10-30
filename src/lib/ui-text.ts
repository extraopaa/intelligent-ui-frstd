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
