import { pathToFileURL } from "node:url";
import { ZodError } from "zod";
import { AI_SYSTEM_PROMPT, aiOutputJsonSchema, aiRequestSchema, parseGeneratedAiDocument } from "../src/modules/ai-content.ts";

class GenerationOutputError extends Error {
  constructor(code, guidance) {
    super(guidance);
    this.name = "GenerationOutputError";
    this.code = code;
  }
}

function checkedUrl(raw, allowLocal) {
  const url = new URL(raw);
  if (url.username || url.password || url.search || url.hash ||
      (url.protocol !== "https:" && !(allowLocal && url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)))) {
    throw new Error("Use an HTTPS portal URL and a loopback HTTP or trusted HTTPS LM Studio URL, without credentials or query parameters.");
  }
  return url;
}

export function connectorConfig(env = process.env) {
  const portal = checkedUrl(env.AI_PORTAL_URL ?? "", true);
  if (portal.pathname !== "/") throw new Error("AI_PORTAL_URL must be the portal origin, without a path.");
  const lm = checkedUrl(env.LM_STUDIO_BASE_URL ?? "http://127.0.0.1:1234/v1", true);
  if (!env.AI_CONNECTOR_TOKEN || env.AI_CONNECTOR_TOKEN.length < 32 || !env.LM_STUDIO_MODEL) {
    throw new Error("Set AI_PORTAL_URL, AI_CONNECTOR_TOKEN (at least 32 characters), and LM_STUDIO_MODEL.");
  }
  return {
    endpoint: new URL("/api/ai-connector", portal).href,
    lmEndpoint: `${lm.href.replace(/\/$/, "")}/chat/completions`,
    token: env.AI_CONNECTOR_TOKEN, model: env.LM_STUDIO_MODEL, lmToken: env.LM_STUDIO_API_KEY,
  };
}

async function boundedJson(response, maxBytes) {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) { await reader.cancel(); throw new Error("Response size limit exceeded"); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally { reader.releaseLock(); }
}

async function portalRequest(config, payload) {
  return boundedJson(await fetch(config.endpoint, {
    method: "POST", redirect: "error", signal: AbortSignal.timeout(30_000),
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }), 80_000);
}

async function generateAttempt(config, request, guidance, timeout) {
  const response = await fetch(config.lmEndpoint, {
    method: "POST", redirect: "error", signal: AbortSignal.timeout(timeout),
    headers: { "Content-Type": "application/json", ...(config.lmToken ? { Authorization: `Bearer ${config.lmToken}` } : {}) },
    body: JSON.stringify({
      model: config.model, stream: false, temperature: 0.4, max_tokens: 5000, reasoning_effort: "none",
      messages: [
        { role: "system", content: AI_SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(request) },
        ...(guidance ? [{ role: "user", content: `Your previous output could not be accepted: ${guidance} Generate a complete replacement JSON document for the same learning request. Choose sections appropriate to the topic, cover every requested item, and include exactly ${request.questionCount} quiz questions. Aim for 600 to 900 teaching words overall and concise quiz explanations to fit the output budget.` }] : []),
      ],
      response_format: { type: "json_schema", json_schema: { name: "learning_document", strict: true, schema: aiOutputJsonSchema } },
    }),
  });
  const result = await boundedJson(response, 100_000);
  const choice = result.choices?.[0];
  if (choice?.finish_reason !== "stop" || typeof choice.message?.content !== "string") {
    throw new GenerationOutputError("incomplete-output", "The model did not return a complete JSON document. Keep the entire output within 5000 tokens.");
  }
  let document;
  try { document = JSON.parse(choice.message.content); }
  catch (cause) {
    if (!(cause instanceof SyntaxError)) throw cause;
    throw new GenerationOutputError("invalid-json", "Return valid JSON only, with no surrounding prose or code fences.");
  }
  try { return parseGeneratedAiDocument(document, request.questionCount); }
  catch (cause) {
    if (cause instanceof ZodError) {
      const fields = [...new Set(cause.issues.map((issue) => issue.path.join(".") || "document"))].slice(0, 8);
      throw new GenerationOutputError("invalid-structure", `Follow the JSON schema, including all field limits and unique questions/choices. Check these fields: ${fields.join(", ")}.`);
    }
    if (cause instanceof Error && cause.message === "The generated question count does not match the request.") {
      throw new GenerationOutputError("wrong-question-count", `Provide exactly ${request.questionCount} questions.`);
    }
    if (cause instanceof Error && cause.message.startsWith("The generated lesson is too brief.")) {
      throw new GenerationOutputError("lesson-too-brief", cause.message);
    }
    if (cause instanceof Error && cause.message === "Generated lesson exceeds the content size limit.") {
      throw new GenerationOutputError("content-too-large", "Keep the JSON document under 48000 UTF-8 bytes while meeting the teaching requirements.");
    }
    throw cause;
  }
}

export async function generateDocument(config, input) {
  const request = aiRequestSchema.parse(input);
  const deadline = Date.now() + 240_000;
  try { return await generateAttempt(config, request, null, 180_000); }
  catch (cause) {
    if (!(cause instanceof GenerationOutputError)) throw cause;
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw cause;
    console.warn("Local model output rejected; retrying once. Reason:", cause.code);
    return generateAttempt(config, request, cause.message, Math.min(180_000, remaining));
  }
}

export async function processOne(config) {
  const response = await portalRequest(config, { action: "claim" });
  const job = response.job;
  if (job === null) return false;
  if (!job || !/^[0-9a-f-]{36}$/i.test(job.id) || !/^[0-9a-f-]{36}$/i.test(job.leaseToken)) {
    throw new Error("The portal returned an invalid job.");
  }
  let document = null;
  try {
    document = await generateDocument(config, job.request);
  } catch (cause) {
    // Never log prompts, generated content, bearer tokens, or provider response bodies.
    const reason = cause instanceof GenerationOutputError ? cause.code :
      cause instanceof Error && /^HTTP \d{3}$/.test(cause.message) ? cause.message :
      cause instanceof Error ? cause.name : "Unknown error";
    console.error("Local generation failed. Check LM Studio model availability and structured-output support. Reason:", reason);
  }
  await portalRequest(config, { action: "finish", id: job.id, leaseToken: job.leaseToken, document });
  console.log(document ? "Generated lesson saved to its owner's library." : "Generation failure reported to the portal.");
  return true;
}

async function main() {
  const config = connectorConfig();
  const once = process.argv.includes("--once");
  console.log("AI connector running. Keep LM Studio and this process open. Press Ctrl+C to stop.");
  do {
    try { await processOne(config); }
    catch (cause) {
      console.error("Connector request failed:", cause instanceof Error ? cause.message : "Unknown error");
      if (once) { process.exitCode = 1; return; }
    }
    if (!once) await new Promise((resolve) => setTimeout(resolve, 5_000));
  } while (!once);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((cause) => { console.error("Connector setup failed:", cause.message); process.exitCode = 1; });
}
