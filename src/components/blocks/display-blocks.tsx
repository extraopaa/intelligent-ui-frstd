"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Info,
  Link2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { cn, hostnameOf } from "@/lib/utils";

type BlockOf<T extends UIBlock["type"]> = Extract<UIBlock, { type: T }>;

export function MarkdownBlockView({ block }: { block: BlockOf<"markdown"> }) {
  return (
    <div className="prose-studio">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) =>
            href ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
                <ArrowUpRight className="ml-0.5 inline h-3 w-3 opacity-60" />
              </a>
            ) : (
              <span>{children}</span>
            ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-line">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {block.content}
      </ReactMarkdown>
    </div>
  );
}

export function HeadingBlockView({ block }: { block: BlockOf<"heading"> }) {
  if (block.level === 3) {
    return (
      <h3 className="text-base font-semibold tracking-tight text-ink sm:text-lg">
        {block.text}
      </h3>
    );
  }
  return (
    <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
      {block.text}
    </h2>
  );
}

const calloutStyles = {
  info: {
    icon: Info,
    box: "border-sky-200 bg-sky-50",
    iconClass: "text-sky-600",
    title: "text-sky-800",
  },
  success: {
    icon: CheckCircle2,
    box: "border-emerald-200 bg-emerald-50",
    iconClass: "text-emerald-600",
    title: "text-emerald-800",
  },
  warning: {
    icon: AlertTriangle,
    box: "border-amber-200 bg-amber-50",
    iconClass: "text-amber-600",
    title: "text-amber-800",
  },
  danger: {
    icon: XCircle,
    box: "border-rose-200 bg-rose-50",
    iconClass: "text-rose-600",
    title: "text-rose-800",
  },
} as const;

export function CalloutBlockView({ block }: { block: BlockOf<"callout"> }) {
  const style = calloutStyles[block.variant ?? "info"];
  const Icon = style.icon;

  return (
    <div className={cn("flex gap-3 rounded-2xl border p-4", style.box)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.iconClass)} />
      <div className="min-w-0">
        {block.title ? (
          <p className={cn("text-sm font-medium", style.title)}>{block.title}</p>
        ) : null}
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
          {block.content}
        </p>
      </div>
    </div>
  );
}

export function StatsBlockView({ block }: { block: BlockOf<"stats"> }) {
  const count = block.items.length;
  const gridClass =
    count === 1
      ? "grid-cols-1"
      : count === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : count === 3
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-2 lg:grid-cols-4";

  return (
    <div className={cn("grid gap-3", gridClass)}>
      {block.items.map((item, index) => {
        const TrendIcon =
          item.trend === "up" ? TrendingUp : item.trend === "down" ? TrendingDown : null;
        const trendClass =
          item.trend === "up"
            ? "text-emerald-600"
            : item.trend === "down"
              ? "text-rose-600"
              : "text-muted";

        return (
          <div
            key={`${item.label}-${index}`}
            className="rounded-2xl border border-line bg-ink/[0.025] p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                {item.label}
              </p>
              {TrendIcon ? <TrendIcon className={cn("h-3.5 w-3.5", trendClass)} /> : null}
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              {item.value}
            </p>
            {item.hint ? <p className="mt-1 text-xs text-faint">{item.hint}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

export function TableBlockView({ block }: { block: BlockOf<"table"> }) {
  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-ink/[0.03]">
              {block.columns.map((column, index) => (
                <th
                  key={`${column}-${index}`}
                  className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-line/70 last:border-b-0 hover:bg-ink/[0.02]"
              >
                {block.columns.map((_, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cn(
                      "px-4 py-3 align-top text-ink/80",
                      cellIndex === 0 && "font-medium text-ink"
                    )}
                  >
                    {row[cellIndex] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.caption ? (
        <p className="mt-2 px-1 text-xs text-faint">{block.caption}</p>
      ) : null}
    </div>
  );
}

export function TimelineBlockView({ block }: { block: BlockOf<"timeline"> }) {
  return (
    <div className="rounded-2xl border border-line bg-ink/[0.02] p-5">
      {block.title ? (
        <p className="mb-4 text-sm font-medium text-ink">{block.title}</p>
      ) : null}
      <ol className="relative ml-1.5 border-l border-line">
        {block.items.map((item, index) => (
          <li
            key={`${item.title}-${index}`}
            className={cn("relative pl-6", index === block.items.length - 1 ? "" : "pb-5")}
          >
            <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-canvas bg-accent shadow-[0_0_0_3px_rgba(1,57,183,0.12)]" />
            {item.date ? (
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent/80">
                {item.date}
              </p>
            ) : null}
            <p className="mt-0.5 text-sm font-medium text-ink">{item.title}</p>
            {item.description ? (
              <p className="mt-1 text-sm leading-relaxed text-muted">{item.description}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function CompareBlockView({ block }: { block: BlockOf<"compare"> }) {
  const columns = [
    {
      ...block.left,
      accent: "border-accent/20 bg-accent/[0.04]",
      dot: "bg-accent",
      label: "text-accent",
    },
    {
      ...block.right,
      accent: "border-pink/20 bg-pink/[0.05]",
      dot: "bg-pink",
      label: "text-pink",
    },
  ];

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2">
        {columns.map((column) => (
          <div key={column.title} className={cn("rounded-2xl border p-5", column.accent)}>
            <p className={cn("text-sm font-semibold", column.label)}>{column.title}</p>
            <ul className="mt-3 space-y-2.5">
              {column.points.map((point, index) => (
                <li key={`${point}-${index}`} className="flex gap-2.5 text-sm text-ink/80">
                  <span className={cn("mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full", column.dot)} />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {block.verdict ? (
        <div className="mt-3 flex gap-3 rounded-2xl border border-accent/20 bg-accent/[0.06] p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
              Verdict
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink/80">{block.verdict}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SourcesBlockView({ block }: { block: BlockOf<"sources"> }) {
  return (
    <div className="rounded-2xl border border-line bg-ink/[0.02] p-2">
      <ul className="divide-y divide-line/70">
        {block.items.map((item, index) => {
          const content = (
            <>
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink/[0.05] text-muted">
                <Link2 className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start gap-2">
                  <span className="text-sm font-medium text-ink">{item.title}</span>
                  {item.url ? (
                    <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint transition-colors group-hover:text-accent" />
                  ) : null}
                </span>
                {item.url ? (
                  <span className="mt-0.5 block truncate text-[11px] text-faint">
                    {hostnameOf(item.url)}
                  </span>
                ) : null}
                {item.snippet ? (
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    {item.snippet}
                  </span>
                ) : null}
              </span>
            </>
          );

          return (
            <li key={`${item.title}-${index}`}>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-ink/[0.03]"
                >
                  {content}
                </a>
              ) : (
                <div className="flex gap-3 px-3 py-3">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
