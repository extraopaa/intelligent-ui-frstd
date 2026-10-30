"use client";

import { useId, useState } from "react";
import type { UIBlock } from "@/lib/ui-schema";
import { formatCompact, formatNumber } from "@/lib/utils";

type ChartBlock = Extract<UIBlock, { type: "chart" }>;

const WIDTH = 720;
const HEIGHT = 300;
const PAD = { top: 18, right: 18, bottom: 46, left: 54 };

function niceStep(raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const exponent = Math.floor(Math.log10(raw));
  const fraction = raw / 10 ** exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * 10 ** exponent;
}

function shortLabel(label: string) {
  return label.length > 11 ? `${label.slice(0, 10)}…` : label;
}

export function ChartBlockView({ block }: { block: ChartBlock }) {
  const [hover, setHover] = useState<number | null>(null);
  const rawId = useId();
  const gradientId = `chart-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const values = block.data.map((point) => point.value);
  const rawMin = Math.min(0, ...values);
  const rawMax = Math.max(0, ...values);
  const rawSpan = rawMax - rawMin || Math.abs(rawMax) || 1;
  const tickStep = niceStep(rawSpan / 4);
  const min = Math.floor(rawMin / tickStep) * tickStep;
  const max = Math.ceil(rawMax / tickStep) * tickStep;
  const range = max - min || 1;

  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const slot = plotWidth / block.data.length;

  const xAt = (index: number) => PAD.left + slot * (index + 0.5);
  const yAt = (value: number) => PAD.top + ((max - value) / range) * plotHeight;
  const zeroY = yAt(0);

  const ticks = Array.from({ length: 5 }, (_, index) => min + (range / 4) * index);
  const active = hover !== null ? block.data[hover] : null;
  const labelEvery = Math.ceil(block.data.length / 8);

  const linePoints = block.data.map((point, index) => ({
    x: xAt(index),
    y: yAt(point.value),
  }));
  const linePath = linePoints
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  const areaPath =
    linePoints.length > 0
      ? `${linePath} L${linePoints[linePoints.length - 1].x},${zeroY} L${linePoints[0].x},${zeroY} Z`
      : "";

  return (
    <div className="rounded-2xl border border-line bg-ink/[0.02] p-4 sm:p-5">
      <div className="mb-3 flex min-h-5 flex-wrap items-center justify-between gap-2">
        {block.title ? (
          <h4 className="text-sm font-medium text-ink">{block.title}</h4>
        ) : (
          <span />
        )}
        <span className="text-[11px] tabular-nums text-faint">
          {active
            ? `${active.label} · ${formatNumber(active.value, 1)}${block.unit ? ` ${block.unit}` : ""}`
            : block.unit
              ? `en ${block.unit}`
              : ""}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`Graphique ${block.chartType === "bar" ? "en barres" : "en courbe"}${
          block.title ? ` : ${block.title}` : ""
        }`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0139b7" />
            <stop offset="100%" stopColor="#ff4b8c" />
          </linearGradient>
          <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0139b7" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0139b7" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={yAt(tick)}
              y2={yAt(tick)}
              stroke="rgba(10,27,61,0.08)"
              strokeDasharray={tick === 0 ? undefined : "3 5"}
            />
            <text
              x={PAD.left - 10}
              y={yAt(tick) + 3.5}
              textAnchor="end"
              fontSize="10"
              fill="#8490a5"
            >
              {formatCompact(tick)}
            </text>
          </g>
        ))}

        {block.chartType === "bar"
          ? block.data.map((point, index) => {
              const barWidth = Math.min(46, slot * 0.56);
              const x = PAD.left + slot * index + (slot - barWidth) / 2;
              const y = Math.min(yAt(point.value), zeroY);
              const height = Math.max(2, Math.abs(zeroY - yAt(point.value)));
              const isActive = hover === index;

              return (
                <g key={`${point.label}-${index}`}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    rx={Math.min(6, height / 2)}
                    fill={`url(#${gradientId})`}
                    opacity={hover === null || isActive ? 1 : 0.42}
                    className="transition-opacity duration-150"
                  />
                  {isActive ? (
                    <text
                      x={x + barWidth / 2}
                      y={Math.max(PAD.top + 11, y - 7)}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#0a1b3d"
                    >
                      {formatNumber(point.value, 1)}
                    </text>
                  ) : null}
                </g>
              );
            })
          : null}

        {block.chartType === "line" ? (
          <>
            {areaPath ? <path d={areaPath} fill={`url(#${gradientId}-area)`} /> : null}
            <path
              d={linePath}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {linePoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={hover === index ? 5 : 3.5}
                fill="#ffffff"
                stroke={hover === index ? "#ff4b8c" : "#0139b7"}
                strokeWidth="2"
                className="transition-all duration-150"
              />
            ))}
            {hover !== null ? (
              <line
                x1={xAt(hover)}
                x2={xAt(hover)}
                y1={PAD.top}
                y2={PAD.top + plotHeight}
                stroke="rgba(10,27,61,0.14)"
                strokeDasharray="3 4"
              />
            ) : null}
          </>
        ) : null}

        {block.data.map((point, index) => {
          const showLabel =
            index % labelEvery === 0 || index === block.data.length - 1;

          return (
            <g key={`labels-${point.label}-${index}`}>
              {showLabel ? (
                <text
                  x={xAt(index)}
                  y={HEIGHT - PAD.bottom + 22}
                  textAnchor="middle"
                  fontSize="10"
                  fill={hover === index ? "#0a1b3d" : "#8490a5"}
                >
                  {shortLabel(point.label)}
                </text>
              ) : null}
              <rect
                x={PAD.left + slot * index}
                y={PAD.top}
                width={slot}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(index)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                role="presentation"
              />
            </g>
          );
        })}
      </svg>

      {block.caption ? (
        <p className="mt-1 px-1 text-xs leading-relaxed text-faint">{block.caption}</p>
      ) : null}

      <ul className="sr-only">
        {block.data.map((point) => (
          <li key={point.label}>
            {point.label} : {point.value}
            {block.unit ? ` ${block.unit}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
