"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function FrenchPrograms({ initialProgram = "core", gradeOptions }: { initialProgram?: "core" | "immersion"; gradeOptions: readonly { grade: number; core: number; immersion: number }[] }) {
  const [program, setProgram] = useState(initialProgram);
  return <>
    <fieldset className="french-program-picker"><legend>Choose your French program</legend>
      <label><input type="radio" name="french-program" checked={program === "core"} onChange={() => setProgram("core")} /> Core French / English-stream students</label>
      <label><input type="radio" name="french-program" checked={program === "immersion"} onChange={() => setProgram("immersion")} /> French Immersion students</label>
    </fieldset>
    <h2 className="lessons-title">{program === "immersion" ? "French Immersion — choose your grade" : "Core French — choose your grade"}</h2>
    <p className="history-intro">{program === "immersion"
      ? "French-first language lessons for Grades 1–8 with optional English support. This is the French-language curriculum, not every subject taught in immersion."
      : "For students in the English-language stream. Ontario Core French lessons are available for Grades 4–8. Use shared vocabulary practice for optional enrichment in Grades 1–3."}</p>
    <div className="grade-grid">{gradeOptions.map((option) => {
      const { grade } = option;
      const count = option[program];
      return <Link className="lesson-card" href={`/learn/french/${program === "immersion" ? "immersion-" : ""}grade-${grade}`} key={grade}>
        <div><h3>Grade {grade}</h3><p>{count ? `${count} ${program === "immersion" ? "French Immersion" : "Core French"} lessons` : program === "core" && grade < 4 ? "Shared vocabulary enrichment — no provincial Core French curriculum" : "No lessons published"}</p>
          {program === "core" && grade < 4 && <p>Optional enrichment, not Ontario Core French requirements.</p>}
        </div><ArrowRight size={20} />
      </Link>;
    })}</div>
    <Link className="button secondary" href="/learn/french/practice">All-grades vocabulary practice — shared by both programs</Link>
  </>;
}
