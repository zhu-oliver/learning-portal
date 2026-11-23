import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/session";
import { findStudioItem } from "@/lib/ai-storage";
import { AiLesson } from "@/components/ai-lesson";

export const metadata = { title: "My AI-created lesson" };
export default async function SavedStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const lesson = await findStudioItem(user.id, id);
  if (!lesson) notFound();
  return <>
    <Link className="back-link" href="/learn/studio">Back to AI Learning Studio</Link>
    <AiLesson lesson={lesson} />
  </>;
}
