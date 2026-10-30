import { z } from "zod";
import { ICON_NAMES } from "@/lib/ui-icons";

/**
 * Catalogue de blocs que le modèle est autorisé à produire.
 * Chaque bloc est validé côté client avant rendu : le modèle ne peut pas
 * injecter de HTML ou de composant arbitraire.
 */

const shortText = (max = 240) => z.string().min(1).max(max);
const optionalText = (max = 500) => z.string().max(max).optional();

export const ActionSchema = z.object({
  label: shortText(60).describe("Libellé court du bouton, à l'infinitif ou à l'impératif."),
  prompt: shortText(1200).describe(
    "Message complet envoyé à l'assistant quand l'utilisateur clique. Il doit être autonome et reprendre le contexte utile."
  ),
  variant: z.enum(["primary", "secondary"]).optional(),
});

export type UIAction = z.infer<typeof ActionSchema>;

export const FormFieldSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Identifiant de champ invalide")
    .describe("Identifiant technique du champ, sans espaces (ex: budget)."),
  label: shortText(80),
  type: z.enum(["text", "number", "textarea", "select"]),
  placeholder: optionalText(120),
  options: z.array(shortText(80)).max(12).optional(),
  required: z.boolean().optional(),
  defaultValue: optionalText(200),
});

export type UIFormField = z.infer<typeof FormFieldSchema>;

const MarkdownBlock = z.object({
  type: z.literal("markdown"),
  content: z.string().max(12000).describe("Texte Markdown. Pas de HTML brut."),
});

const HeadingBlock = z.object({
  type: z.literal("heading"),
  text: shortText(160),
  level: z.union([z.literal(2), z.literal(3)]).optional(),
});

const CalloutBlock = z.object({
  type: z.literal("callout"),
  variant: z.enum(["info", "success", "warning", "danger"]).optional(),
  title: optionalText(120),
  content: z.string().max(2000),
});

const StatsBlock = z.object({
  type: z.literal("stats"),
  items: z
    .array(
      z.object({
        label: shortText(60),
        value: shortText(40),
        hint: optionalText(100),
        trend: z.enum(["up", "down", "neutral"]).optional(),
      })
    )
    .min(1)
    .max(8),
});

const TableBlock = z.object({
  type: z.literal("table"),
  columns: z.array(shortText(80)).min(1).max(8),
  rows: z.array(z.array(z.string().max(300)).min(1).max(8)).min(1).max(40),
  caption: optionalText(200),
});

const ChartBlock = z.object({
  type: z.literal("chart"),
  chartType: z.enum(["bar", "line", "area", "pie", "donut"]),
  title: optionalText(120),
  data: z
    .array(
      z.object({
        label: shortText(40),
        value: z.number().finite(),
      })
    )
    .min(2)
    .max(24),
  unit: optionalText(24),
  caption: optionalText(200),
});

const ChecklistBlock = z.object({
  type: z.literal("checklist"),
  title: optionalText(120),
  items: z
    .array(
      z.object({
        id: z.string().min(1).max(60),
        label: shortText(160),
        checked: z.boolean().optional(),
      })
    )
    .min(1)
    .max(20),
});

const TimelineBlock = z.object({
  type: z.literal("timeline"),
  title: optionalText(120),
  items: z
    .array(
      z.object({
        title: shortText(120),
        description: optionalText(500),
        date: optionalText(60),
      })
    )
    .min(1)
    .max(16),
});

const CompareBlock = z.object({
  type: z.literal("compare"),
  left: z.object({
    title: shortText(80),
    points: z.array(shortText(220)).min(1).max(8),
  }),
  right: z.object({
    title: shortText(80),
    points: z.array(shortText(220)).min(1).max(8),
  }),
  verdict: optionalText(400),
});

const SliderBlock = z.object({
  type: z.literal("slider"),
  title: optionalText(120),
  label: shortText(120),
  min: z.number().finite(),
  max: z.number().finite(),
  step: z.number().finite().positive().optional(),
  defaultValue: z.number().finite(),
  unit: optionalText(24),
  formula: z
    .string()
    .max(200)
    .optional()
    .describe(
      "Formule arithmétique utilisant la variable value. Ex: value * 12. Autorise + - * / ( ) et des nombres."
    ),
  resultLabel: optionalText(80),
  resultUnit: optionalText(24),
  hint: optionalText(240),
});

const FormBlock = z.object({
  type: z.literal("form"),
  title: optionalText(120),
  description: optionalText(400),
  fields: z.array(FormFieldSchema).min(1).max(8),
  submitLabel: optionalText(60),
  promptTemplate: optionalText(1200).describe(
    "Modèle de message avec des variables {{nom_du_champ}}. Si absent, les valeurs sont ajoutées automatiquement."
  ),
});

const ActionsBlock = z.object({
  type: z.literal("actions"),
  title: optionalText(120),
  actions: z.array(ActionSchema).min(1).max(6),
});

const safeUrl = z
  .string()
  .url()
  .max(500)
  .refine((value) => /^https?:\/\//i.test(value), "URL http(s) attendue");

const SourcesBlock = z.object({
  type: z.literal("sources"),
  items: z
    .array(
      z.object({
        title: shortText(160),
        url: safeUrl.optional(),
        snippet: optionalText(300),
      })
    )
    .min(1)
    .max(8),
});

const iconName = z.enum(ICON_NAMES);

const TabsBlock = z.object({
  type: z.literal("tabs"),
  title: optionalText(120),
  tabs: z
    .array(
      z.object({
        label: shortText(40),
        icon: iconName.optional(),
        content: z.string().max(3000).describe("Texte Markdown du panneau. Pas de HTML."),
        points: z.array(shortText(220)).max(8).optional(),
      })
    )
    .min(2)
    .max(8),
});

const CardsBlock = z.object({
  type: z.literal("cards"),
  title: optionalText(120),
  layout: z.enum(["grid", "carousel"]).optional(),
  items: z
    .array(
      z.object({
        title: shortText(80),
        text: optionalText(400),
        icon: iconName.optional(),
        badge: optionalText(30),
        prompt: optionalText(1200).describe(
          "Message autonome envoyé à l'assistant si l'utilisateur clique sur la carte. Optionnel."
        ),
      })
    )
    .min(1)
    .max(12),
});

const StepsBlock = z.object({
  type: z.literal("steps"),
  title: optionalText(120),
  items: z
    .array(
      z.object({
        title: shortText(120),
        description: optionalText(300),
        detail: optionalText(1500).describe("Détail affiché quand l'utilisateur déplie l'étape."),
      })
    )
    .min(1)
    .max(12),
});

const FlashcardsBlock = z.object({
  type: z.literal("flashcards"),
  title: optionalText(120),
  cards: z
    .array(
      z.object({
        front: shortText(300),
        back: shortText(600),
      })
    )
    .min(1)
    .max(16),
});

const CalculatorBlock = z.object({
  type: z.literal("calculator"),
  title: optionalText(120),
  description: optionalText(300),
  inputs: z
    .array(
      z.object({
        name: z
          .string()
          .min(1)
          .max(30)
          .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Identifiant invalide")
          .describe("Nom de variable utilisable dans les formules (ex: capital)."),
        label: shortText(80),
        min: z.number().finite(),
        max: z.number().finite(),
        step: z.number().finite().positive().optional(),
        defaultValue: z.number().finite(),
        unit: optionalText(24),
      })
    )
    .min(1)
    .max(6),
  outputs: z
    .array(
      z.object({
        label: shortText(80),
        formula: z
          .string()
          .min(1)
          .max(300)
          .describe(
            "Expression utilisant les noms des entrées, + - * / % ^, parenthèses et min max abs sqrt round floor ceil pow."
          ),
        unit: optionalText(24),
        decimals: z.number().int().min(0).max(6).optional(),
        highlight: z.boolean().optional(),
      })
    )
    .min(1)
    .max(6),
  hint: optionalText(240),
});

const MapBlock = z.object({
  type: z.literal("map"),
  title: optionalText(120),
  markers: z
    .array(
      z.object({
        label: shortText(80),
        lat: z.number().finite().min(-90).max(90),
        lng: z.number().finite().min(-180).max(180),
        category: optionalText(40),
        icon: optionalText(8).describe("Un seul emoji pour l'épingle ; sinon l'épingle affiche son numéro."),
        description: optionalText(240),
      })
    )
    .min(1)
    .max(20),
  route: z.boolean().optional().describe("Trace l'itinéraire routier entre les marqueurs, dans l'ordre."),
  height: z.number().int().min(200).max(720).optional(),
  caption: optionalText(200),
});

export const BlockSchema = z.discriminatedUnion("type", [
  MapBlock,
  TabsBlock,
  CardsBlock,
  StepsBlock,
  FlashcardsBlock,
  CalculatorBlock,
  MarkdownBlock,
  HeadingBlock,
  CalloutBlock,
  StatsBlock,
  TableBlock,
  ChartBlock,
  ChecklistBlock,
  TimelineBlock,
  CompareBlock,
  SliderBlock,
  FormBlock,
  ActionsBlock,
  SourcesBlock,
]);

export type UIBlock = z.infer<typeof BlockSchema>;
export type BlockType = UIBlock["type"];

export const UIResponseSchema = z.object({
  title: z.string().max(160).optional(),
  blocks: z.array(BlockSchema).min(1).max(24),
  followUps: z.array(shortText(180)).max(6).optional(),
});

export type UIResponse = z.infer<typeof UIResponseSchema>;

export const BLOCK_TYPES = BlockSchema.options.map((option) => option.shape.type.value) as BlockType[];

export const MAX_BLOCKS = 8;
