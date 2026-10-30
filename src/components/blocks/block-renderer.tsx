"use client";

import type { UIBlock } from "@/lib/ui-schema";
import {
  CalloutBlockView,
  CompareBlockView,
  HeadingBlockView,
  MarkdownBlockView,
  SourcesBlockView,
  StatsBlockView,
  TableBlockView,
  TimelineBlockView,
} from "@/components/blocks/display-blocks";
import { ChartBlockView } from "@/components/blocks/chart-block";
import { ChecklistBlockView } from "@/components/blocks/checklist-block";
import { SliderBlockView } from "@/components/blocks/slider-block";
import { FormBlockView } from "@/components/blocks/form-block";
import { ActionsBlockView } from "@/components/blocks/actions-block";
import { MapBlockView } from "@/components/blocks/map-block";
import {
  CalculatorBlockView,
  CardsBlockView,
  FlashcardsBlockView,
  StepsBlockView,
  TabsBlockView,
} from "@/components/blocks/rich-blocks";

export function BlockRenderer({
  block,
  onPrompt,
  disabled = false,
}: {
  block: UIBlock;
  onPrompt: (prompt: string) => void;
  disabled?: boolean;
}) {
  switch (block.type) {
    case "markdown":
      return <MarkdownBlockView block={block} />;
    case "heading":
      return <HeadingBlockView block={block} />;
    case "callout":
      return <CalloutBlockView block={block} />;
    case "stats":
      return <StatsBlockView block={block} />;
    case "table":
      return <TableBlockView block={block} />;
    case "chart":
      return <ChartBlockView block={block} />;
    case "checklist":
      return <ChecklistBlockView block={block} />;
    case "timeline":
      return <TimelineBlockView block={block} />;
    case "compare":
      return <CompareBlockView block={block} />;
    case "slider":
      return <SliderBlockView block={block} />;
    case "form":
      return <FormBlockView block={block} onPrompt={onPrompt} disabled={disabled} />;
    case "actions":
      return <ActionsBlockView block={block} onPrompt={onPrompt} disabled={disabled} />;
    case "tabs":
      return <TabsBlockView block={block} />;
    case "cards":
      return <CardsBlockView block={block} onPrompt={onPrompt} disabled={disabled} />;
    case "steps":
      return <StepsBlockView block={block} />;
    case "flashcards":
      return <FlashcardsBlockView block={block} />;
    case "calculator":
      return <CalculatorBlockView block={block} />;
    case "sources":
      return <SourcesBlockView block={block} />;
    case "map":
      return <MapBlockView block={block} />;
    default:
      return null;
  }
}
