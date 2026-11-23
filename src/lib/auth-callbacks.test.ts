import { describe, expect, it } from "vitest";
import type { Account, Session } from "next-auth";
import { accountSession, accountToken } from "./auth-callbacks";

const google: Account = { provider: "google", type: "oidc", providerAccountId: "123456789012345678901" };
const session = (): Session => ({ user: { name: "Explorer" }, expires: "2026-10-11T00:00:00Z" });

describe("persistent account ownership", () => {
  it("uses the same history owner across independent Google sign-ins", () => {
    const first = accountToken({ token: { sub: "random-login-one" }, account: google });
    const second = accountToken({ token: { sub: "random-login-two" }, account: google });
    expect(accountSession({ session: session(), token: first }).user?.id).toBe("google:123456789012345678901");
    expect(accountSession({ session: session(), token: second }).user?.id).toBe(accountSession({ session: session(), token: first }).user?.id);
  });

  it("keeps the verified owner on refresh and ignores browser-supplied updates", () => {
    const token = accountToken({ token: { sub: "random" }, account: google });
    const refreshed = accountToken({ token, account: null });
    const browserSession: Session = { ...session(), user: { id: "other-user" } };
    expect(accountSession({ session: browserSession, token: refreshed }).user?.id).toBe("google:123456789012345678901");
  });

  it("keeps different Google accounts separate", () => {
    const first = accountToken({ token: {}, account: google });
    const other = accountToken({ token: {}, account: { ...google, providerAccountId: "987654321098765432109" } });
    expect(first.googleUserId).not.toBe(other.googleUserId);
  });

  it("requires old random-ID sessions to sign in again", () => {
    const legacy: Session = { ...session(), user: { id: "random-old-login" } };
    expect(accountSession({ session: legacy, token: { sub: "random-old-login" } }).user?.id).toBeUndefined();
  });

  it("does not accept an unrelated provider or missing Google account ID", () => {
    expect(accountToken({ token: {}, account: { ...google, provider: "other" } }).googleUserId).toBeUndefined();
    expect(() => accountToken({ token: {}, account: { ...google, providerAccountId: "" } })).toThrow("account identifier");
  });
});
