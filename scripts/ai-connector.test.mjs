import { describe, expect, it, vi, afterEach } from "vitest";
import { connectorConfig, generateDocument, processOne } from "./ai-connector.mjs";
import { documentFixture, richDocumentFixture } from "../src/test/ai-fixture";

const config = { endpoint: "https://portal.example/api/ai-connector", token: "x".repeat(40), lmEndpoint: "http://127.0.0.1:1234/v1/chat/completions", model: "test-model" };
const request = { prompt: "Teach me plants", grade: 4, questionCount: 1, previous: null };
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe("outbound LM Studio connector", () => {
  it("requires HTTPS off-device and never accepts credentials or paths in the portal origin", () => {
    const env = { AI_PORTAL_URL: "https://portal.example", AI_CONNECTOR_TOKEN: config.token, LM_STUDIO_MODEL: "test-model" };
    expect(connectorConfig(env).lmEndpoint).toBe(config.lmEndpoint);
    for (const AI_PORTAL_URL of ["http://public.example", "https://user:pass@portal.example", "https://portal.example/path"]) {
      expect(() => connectorConfig({ ...env, AI_PORTAL_URL })).toThrow();
    }
    expect(() => connectorConfig({ ...env, AI_CONNECTOR_TOKEN: "" })).toThrow();
  });
  it("requests strict JSON from only the configured LM endpoint without forwarding portal credentials", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(richDocumentFixture) } }] })));
    vi.stubGlobal("fetch", fetcher);
    expect(await generateDocument(config, request)).toEqual(richDocumentFixture);
    const [url, options] = fetcher.mock.calls[0];
    expect(url).toBe(config.lmEndpoint);
    expect(options.headers.Authorization).toBeUndefined();
    const body = JSON.parse(options.body);
    expect(body.response_format.json_schema.strict).toBe(true);
    expect(body.stream).toBe(false);
    expect(body.reasoning_effort).toBe("none");
    expect(body).not.toHaveProperty("tools");
    expect(body.messages[1].content).not.toContain(config.token);
    expect(options.redirect).toBe("error");
  });
  it("generates and revises seven-section documents without forcing four-section repair guidance", async () => {
    const sevenSections = { ...richDocumentFixture, sections: Array.from({ length: 7 }, (_, index) => ({ ...richDocumentFixture.sections[0], heading: `Wonder ${index + 1}` })) };
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ finish_reason: "length", message: { content: "{}" } }] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(sevenSections) } }] })));
    vi.stubGlobal("fetch", fetcher);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await generateDocument(config, { ...request, previous: sevenSections })).toEqual(sevenSections);
    const repair = JSON.parse(fetcher.mock.calls[1][1].body);
    expect(JSON.parse(repair.messages[1].content).previous.sections).toHaveLength(7);
    expect(repair.messages[0].content).toContain("topic-appropriate structure");
    expect(repair.messages[2].content).toContain("cover every requested item");
    expect(repair.messages[2].content).not.toContain("four");
  });
  it("rejects malformed, truncated and wrong-count output", async () => {
    for (const response of [
      { choices: [{ finish_reason: "length", message: { content: "{}" } }] },
      { choices: [{ finish_reason: "stop", message: { content: "not json" } }] },
      { choices: [{ finish_reason: "stop", message: { content: JSON.stringify(documentFixture) } }] },
    ]) {
      vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(response))));
      await expect(generateDocument(config, { ...request, questionCount: 2 })).rejects.toThrow();
    }
  });
  it("rejects a brief lesson even when its question count is correct", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(documentFixture) } }] }))));
    await expect(generateDocument(config, request)).rejects.toThrow();
  });
  it.each([
    ["incomplete", { finish_reason: "length", message: { content: "{}" } }],
    ["malformed", { finish_reason: "stop", message: { content: "private-output-not-json" } }],
    ["brief", { finish_reason: "stop", message: { content: JSON.stringify(documentFixture) } }],
  ])("retries %s output once with safe corrective instructions and returns only validated content", async (_, choice) => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [choice] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(richDocumentFixture) } }] })));
    vi.stubGlobal("fetch", fetcher);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await generateDocument(config, request)).toEqual(richDocumentFixture);
    expect(fetcher).toHaveBeenCalledTimes(2);
    const repair = JSON.parse(fetcher.mock.calls[1][1].body);
    expect(repair.messages[2].content).toContain("complete replacement");
    expect(repair.messages[2].content).not.toContain("private-output-not-json");
    expect(repair.messages[2].content).not.toContain(config.token);
  });
  it("limits rejected-output retries to one and logs a safe failure category", async () => {
    const id = "10000000-0000-4000-8000-000000000001";
    const bad = { choices: [{ finish_reason: "stop", message: { content: "private-generated-output" } }] };
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ job: { id, leaseToken: id, request } })))
      .mockResolvedValueOnce(new Response(JSON.stringify(bad)))
      .mockResolvedValueOnce(new Response(JSON.stringify(bad)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetcher);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    expect(await processOne(config)).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(log).toHaveBeenCalledWith(expect.any(String), "invalid-json");
    expect(JSON.stringify(log.mock.calls)).not.toContain("private-generated-output");
    expect(JSON.parse(fetcher.mock.calls[3][1].body).document).toBeNull();
  });
  it("keeps a retry within the four-minute total generation deadline", async () => {
    const clock = vi.spyOn(Date, "now").mockReturnValueOnce(0).mockReturnValueOnce(170_000);
    const timeout = vi.spyOn(AbortSignal, "timeout");
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ finish_reason: "length", message: { content: "{}" } }] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(richDocumentFixture) } }] })));
    vi.stubGlobal("fetch", fetcher);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await generateDocument(config, request)).toEqual(richDocumentFixture);
    expect(timeout).toHaveBeenNthCalledWith(1, 180_000);
    expect(timeout).toHaveBeenNthCalledWith(2, 70_000);
    clock.mockRestore();
  });
  it("reports actual provider failure to the portal without inventing content", async () => {
    const id = "10000000-0000-4000-8000-000000000001";
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ job: { id, leaseToken: id, request } })))
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetcher);
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    expect(await processOne(config)).toBe(true);
    expect(JSON.parse(fetcher.mock.calls[2][1].body).document).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${config.token}`);
  });
});
