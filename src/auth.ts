import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { accountSession, accountToken } from "@/lib/auth-callbacks";

export const googleConfigured = Boolean(
  process.env.AUTH_SECRET &&
  process.env.AUTH_GOOGLE_ID &&
  process.env.AUTH_GOOGLE_SECRET,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: googleConfigured ? [Google] : [],
  pages: { signIn: "/", error: "/" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  callbacks: {
    jwt: accountToken,
    session: accountSession,
    signIn({ account, profile }) {
      return account?.provider === "google" && profile?.email_verified === true;
    },
  },
});
