import Link from "next/link";
import { requireUser } from "@/lib/session";
import { findStudioItem, listStudioItems } from "@/lib/ai-storage";
import { AiStudio } from "@/components/ai-studio";
import type { StudioItem } from "@/modules/ai-content";
import { z } from "zod";

export const metadata = { title: "AI Learning Studio" };
export default async function StudioPage({ searchParams }: { searchParams?: Promise<{ revise?: string }> }) {
  const user = await requireUser();
  let items: StudioItem[] = [];
  let selected: StudioItem | undefined;
  let error = "";
  const { revise } = await searchParams ?? {};
  try {
    items = await listStudioItems(user.id);
    if (revise) {
      if (!z.uuid().safeParse(revise).success) error = "Choose a valid saved lesson to revise.";
      else {
        const lesson = await findStudioItem(user.id, revise);
        if (lesson?.status === "ready") selected = { ...lesson, document: null };
        else error = "That saved lesson is not available in your account.";
      }
    }
  }
  catch (cause) {
    console.error("AI Studio library unavailable:", cause instanceof Error ? cause.name : "Unknown error");
    error = "Your library could not be loaded. Try Refresh library, or ask a parent to check the database setup.";
  }
  return <>
    <Link className="back-link" href="/learn">Back to subjects</Link>
    <AiStudio initialItems={items} initialLesson={selected} initialError={error} configured={Boolean(process.env.AI_CONNECTOR_TOKEN && process.env.AI_CONNECTOR_TOKEN.length >= 32)} />
  </>;
}
