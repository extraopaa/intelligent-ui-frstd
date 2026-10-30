import { z } from "zod";
import { DEFAULT_MODEL, getAiConfig, isValidModelId } from "@/lib/ai-config";
import {
  openChatCompletion,
  readChatCompletion,
  UpstreamError,
  type UpstreamMessage,
} from "@/lib/ai-upstream";
import { pickDemoResponse } from "@/lib/demo-response";
import {
  FranceStudentAuthError,
  openAccountChat,
} from "@/lib/francestudent-auth";
import {
  clearFranceStudentSession,
  readFranceStudentSession,
} from "@/lib/francestudent-cookies";
import { UIResponseSchema, type UIResponse } from "@/lib/ui-schema";

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(20000),
      })
    )
    .min(1)
    .max(40),
  apiKey: z.string().trim().min(1).max(500).optional(),
  model: z.string().trim().min(1).max(120).optional(),
  chatId: z.string().uuid().optional(),
  resetChat: z.boolean().optional(),
});

type ChatEvent =
  | {
      type: "meta";
      mode: "demo" | "live";
      model: string;
      source?: "account" | "server" | "client" | "demo";
    }
  | { type: "chat"; chatId: string }
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

const encoder = new TextEncoder();

function encodeEvent(event: ChatEvent) {
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

function demoStream(response: UIResponse, signal: AbortSignal) {
  const payload = JSON.stringify(response);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (event: ChatEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encodeEvent(event));
        } catch {
          closed = true;
        }
      };
      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // Déjà fermé.
        }
      };

      send({ type: "meta", mode: "demo", model: "Démo France Student", source: "demo" });

      try {
        // Petite pause pour laisser apparaître l'indicateur de réflexion.
        await sleep(260);
        if (signal.aborted) return;

        let offset = 0;
        while (offset < payload.length) {
          if (signal.aborted) return;

          const size = 10 + Math.floor(Math.random() * 26);
          send({ type: "delta", text: payload.slice(offset, offset + size) });
          offset += size;

          await sleep(8 + Math.random() * 14);
        }

        send({ type: "done" });
      } finally {
        close();
      }
    },
    cancel() {
      // Le signal est géré par la route.
    },
  });
}

function liveStream(
  upstream: Response,
  signal: AbortSignal,
  timeoutSignal: AbortSignal,
  model: string,
  options: {
    source: "account" | "server" | "client";
    initialChatId?: string;
  }
) {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (event: ChatEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encodeEvent(event));
        } catch {
          closed = true;
        }
      };
      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // Déjà fermé.
        }
      };

      send({ type: "meta", mode: "live", model, source: options.source });

      const announced = new Set<string>();
      const announceChat = (chatId: string) => {
        if (!chatId || announced.has(chatId)) return;
        announced.add(chatId);
        send({ type: "chat", chatId });
      };

      if (options.initialChatId) announceChat(options.initialChatId);

      try {
        for await (const delta of readChatCompletion(upstream, {
          onChatId: announceChat,
        })) {
          if (signal.aborted) return;
          send({ type: "delta", text: delta });
        }

        if (!signal.aborted) {
          send({ type: "done" });
        }
      } catch (error) {
        if (signal.aborted) return;

        const message = timeoutSignal.aborted
          ? "France Student met trop de temps à répondre (120 s). Réessayez dans un instant."
          : error instanceof UpstreamError
            ? error.message
            : "La connexion à France Student a été interrompue.";

        send({ type: "error", message });
      } finally {
        close();
      }
    },
    cancel() {
      // L'abandon est propagé par le contrôleur de la route.
    },
  });
}

function buildUpstreamMessages(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): UpstreamMessage[] {
  // Le prompt système et l'historique sont fusionnés dans le dernier message
  // utilisateur : l'API Responses de France Student ne conserve que celui-ci.
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

function errorResponse(message: string, status = 502, code?: string) {
  return Response.json(
    code ? { error: message, code } : { error: message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Le corps de la requête n'est pas un JSON valide.", 400);
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "Requête invalide : l'historique doit contenir entre 1 et 40 messages.",
      400
    );
  }

  const messages = parsed.data.messages;
  const account = await readFranceStudentSession();

  const abort = new AbortController();
  const onAbort = () => abort.abort();

  if (request.signal.aborted) {
    abort.abort();
  } else {
    request.signal.addEventListener("abort", onAbort, { once: true });
  }

  const timeoutSignal = AbortSignal.timeout(120_000);
  const signal = AbortSignal.any([abort.signal, timeoutSignal]);

  if (account) {
    const model = parsed.data.model ?? DEFAULT_MODEL;
    if (!isValidModelId(model)) {
      request.signal.removeEventListener("abort", onAbort);
      return errorResponse("L’identifiant du modèle n’est pas valide.", 400);
    }

    let upstream: Response;
    let chatId: string | undefined;

    try {
      const result = await openAccountChat({
        session: account,
        model,
        messages: buildUpstreamMessages(messages),
        chatId: parsed.data.chatId,
        restart: parsed.data.resetChat,
        signal,
      });
      upstream = result.response;
      chatId = result.chatId;
    } catch (error) {
      request.signal.removeEventListener("abort", onAbort);

      if (abort.signal.aborted) {
        return errorResponse("La requête a été annulée.", 499);
      }

      if (timeoutSignal.aborted) {
        return errorResponse(
          "France Student met trop de temps à répondre (120 s). Réessayez dans un instant.",
          504
        );
      }

      if (
        error instanceof FranceStudentAuthError &&
        error.code === "session_expired"
      ) {
        await clearFranceStudentSession();
        return errorResponse(error.message, 401, "session_expired");
      }

      const message =
        error instanceof FranceStudentAuthError
          ? error.message
          : "Impossible de joindre France Student. Vérifiez votre connexion réseau.";
      const status = error instanceof FranceStudentAuthError ? error.status : 502;

      return errorResponse(message, status);
    }

    return new Response(
      liveStream(upstream, abort.signal, timeoutSignal, model, {
        source: "account",
        initialChatId: chatId,
      }),
      { headers: SSE_HEADERS }
    );
  }

  const config = getAiConfig({
    apiKey: parsed.data.apiKey,
    model: parsed.data.model,
  });

  if (parsed.data.apiKey && config.source !== "client") {
    request.signal.removeEventListener("abort", onAbort);
    return errorResponse(
      "La clé API fournie n’est pas valide. Vérifiez-la et réessayez.",
      400
    );
  }

  if (parsed.data.model && config.model !== parsed.data.model) {
    request.signal.removeEventListener("abort", onAbort);
    return errorResponse("L’identifiant du modèle n’est pas valide.", 400);
  }

  if (config.mode === "demo") {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    let demoResponse: UIResponse;
    try {
      demoResponse = UIResponseSchema.parse(pickDemoResponse(lastUser?.content ?? ""));
    } catch {
      demoResponse = UIResponseSchema.parse(pickDemoResponse(""));
    }

    return new Response(demoStream(demoResponse, abort.signal), {
      headers: SSE_HEADERS,
    });
  }

  let upstream: Response;
  try {
    upstream = await openChatCompletion(
      config,
      buildUpstreamMessages(messages),
      signal
    );
  } catch (error) {
    request.signal.removeEventListener("abort", onAbort);

    if (abort.signal.aborted) {
      return errorResponse("La requête a été annulée.", 499);
    }

    if (timeoutSignal.aborted) {
      return errorResponse(
        "France Student met trop de temps à répondre (120 s). Réessayez dans un instant.",
        504
      );
    }

    const message =
      error instanceof UpstreamError
        ? error.message
        : "Impossible de joindre France Student. Vérifiez la clé, le modèle et la connexion réseau.";

    return errorResponse(message, 502);
  }

  return new Response(
    liveStream(upstream, abort.signal, timeoutSignal, config.model, {
      source: config.source === "client" ? "client" : "server",
    }),
    { headers: SSE_HEADERS }
  );
}
