import { BookOpen, Calculator, FlaskConical, Languages, SpellCheck } from "lucide-react";
import type { SubjectTheme } from "@/modules/types";

const icons = { math: Calculator, reading: BookOpen, science: FlaskConical, spelling: SpellCheck, french: Languages };

export function SubjectIcon({ theme, size = 28 }: { theme: SubjectTheme; size?: number }) {
  const Icon = icons[theme];
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}
