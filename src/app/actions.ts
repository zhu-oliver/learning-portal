"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { googleConfigured, signIn, signOut } from "@/auth";

export async function login() {
  if (!googleConfigured) redirect("/?error=Configuration");
  try {
    await signIn("google", { redirectTo: "/learn" });
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("Google sign-in failed:", error.type);
      redirect("/?error=SignIn");
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
