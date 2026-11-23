import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  configured: true,
  auth: vi.fn(),
  redirect: vi.fn((url: string): never => { throw new Error(`redirect:${url}`); }),
}));

vi.mock("@/auth", () => ({
  get googleConfigured() { return mocks.configured; },
  auth: mocks.auth,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { requireUser } from "./session";

describe("server-side access", () => {
  beforeEach(() => { mocks.configured = true; });

  it("redirects to login without invoking auth when configuration is missing", async () => {
    mocks.configured = false;
    await expect(requireUser()).rejects.toThrow("redirect:/");
    expect(mocks.auth).not.toHaveBeenCalled();
  });

  it("denies unauthenticated access", async () => {
    mocks.auth.mockResolvedValue(null);
    await expect(requireUser()).rejects.toThrow("redirect:/");
  });

  it("returns the authenticated user", async () => {
    const user = { id: "google-user-id", name: "Young Explorer", email: "example@example.com" };
    mocks.auth.mockResolvedValue({ user });
    await expect(requireUser()).resolves.toEqual(user);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("rejects sessions without a stable user ID", async () => {
    mocks.auth.mockResolvedValue({ user: { name: "Explorer" } });
    await expect(requireUser()).rejects.toThrow("redirect:/");
  });

  it("does not swallow authentication errors", async () => {
    mocks.auth.mockRejectedValue(new Error("session failure"));
    await expect(requireUser()).rejects.toThrow("session failure");
  });
});
