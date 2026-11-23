import type { NextAuthConfig } from "next-auth";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  nextAuth: vi.fn((config: NextAuthConfig) => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    config,
  })),
}));
vi.mock("next-auth", () => ({ default: mocks.nextAuth }));

afterEach(() => { vi.unstubAllEnvs(); });

async function loadAuth(configured: boolean) {
  vi.resetModules();
  vi.stubEnv("AUTH_SECRET", configured ? "test-secret-not-for-real-use" : "");
  vi.stubEnv("AUTH_GOOGLE_ID", configured ? "test-client" : "");
  vi.stubEnv("AUTH_GOOGLE_SECRET", configured ? "test-client-secret" : "");
  return import("./auth");
}

describe("Google authentication configuration", () => {
  it("disables Google login when credentials are missing", async () => {
    const auth = await loadAuth(false);
    expect(auth.googleConfigured).toBe(false);
    expect(mocks.nextAuth.mock.calls[0][0].providers).toEqual([]);
  });

  it("registers Google only when all credentials exist", async () => {
    const auth = await loadAuth(true);
    expect(auth.googleConfigured).toBe(true);
    const config = mocks.nextAuth.mock.calls[0][0];
    expect(config.providers).toHaveLength(1);
    expect(config.session).toEqual({ strategy: "jwt", maxAge: 28800 });
    expect(config.pages).toEqual({ signIn: "/", error: "/" });
  });

  it("accepts verified Google accounts and rejects unverified or other providers", async () => {
    await loadAuth(true);
    const callback = mocks.nextAuth.mock.calls[0][0].callbacks?.signIn;
    if (!callback) throw new Error("Sign-in callback is missing");
    const base = {
      user: { id: "test-user" },
      account: { provider: "google", type: "oidc" as const, providerAccountId: "test-id" },
    };
    expect(await callback({ ...base, profile: { email_verified: true } })).toBe(true);
    expect(await callback({ ...base, profile: { email_verified: false } })).toBe(false);
    expect(await callback({ ...base, profile: {} })).toBe(false);
    expect(await callback({ ...base, account: { ...base.account, provider: "unexpected" }, profile: { email_verified: true } })).toBe(false);
  });

});
