import type { Account, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export function accountToken({ token, account }: { token: JWT; account?: Account | null }): JWT {
  if (account?.provider === "google") {
    if (!account.providerAccountId) throw new Error("Google sign-in did not provide an account identifier.");
    token.googleUserId = `google:${account.providerAccountId}`;
  }
  return token;
}

export function accountSession({ session, token }: { session: Session; token: JWT }): Session {
  if (session.user) {
    // Old tokens contain a per-login random ID and must sign in again.
    session.user.id = typeof token.googleUserId === "string" ? token.googleUserId : undefined;
  }
  return session;
}
