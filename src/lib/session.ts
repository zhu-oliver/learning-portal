import { redirect } from "next/navigation";
import { auth, googleConfigured } from "@/auth";

export async function requireUser() {
  if (!googleConfigured) redirect("/");
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  return { ...session.user, id: session.user.id };
}
