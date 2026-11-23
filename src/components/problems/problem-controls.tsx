"use client";

import { useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { FrenchPicture } from "@/components/french-picture";
import { wordAtPath, wordSearchPath, type Problem, type ProblemAnswer, type ProblemItem } from "@/modules/problems";

type OfType<T extends Problem["type"]> = Extract<Problem, { type: T }>;
export interface ProblemControlProps<T extends Problem = Problem> {
  problem: T;
  answer: ProblemAnswer;
  onChange: (answer: string[]) => void;
  disabled: boolean;
  language: "en" | "fr";
}

function usePlacement(items: readonly ProblemItem[], assign: (id: string, target: number) => void, disabled: boolean, language: "en" | "fr") {
  const owner = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ text: string; x: number; y: number } | null>(null);
  const [message, setMessage] = useState("");
  const drag = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef<string | null>(null);
  const french = language === "fr";

  function place(id: string, target: number) {
    assign(id, target);
    setSelected(null);
    setMessage(french ? "Élément placé. Tu peux le déplacer avant de vérifier." : "Item placed. You can move it again before checking.");
  }

  function pointerEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    drag.current = null;
    setPreview(null);
    if (!current?.moved || disabled) return;
    suppressClick.current = current.id;
    // The synthetic click following pointerup belongs to this drag, not the next keyboard activation.
    setTimeout(() => { if (suppressClick.current === current.id) suppressClick.current = null; }, 0);
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-problem-drop]");
    if (target?.dataset.problemDrop === owner && target.dataset.target !== undefined) place(current.id, Number(target.dataset.target));
    else setMessage(french ? "Déplacement annulé. Choisis un emplacement." : "Move cancelled. Select a destination.");
  }

  function token(item: ProblemItem) {
    return <button type="button" key={item.id} className={`problem-token ${selected === item.id ? "selected" : ""}`} disabled={disabled}
      aria-pressed={selected === item.id}
      onClick={(event) => {
        event.stopPropagation();
        const suppressed = suppressClick.current === item.id;
        suppressClick.current = null;
        if (suppressed) return;
        setSelected(selected === item.id ? null : item.id);
        setMessage(french ? "Choisis un emplacement." : "Select a destination.");
      }}
      onPointerDown={(event) => {
        if (disabled || !event.isPrimary || event.button !== 0) return;
        suppressClick.current = null;
        drag.current = { id: item.id, x: event.clientX, y: event.clientY, moved: false };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const current = drag.current;
        if (!current) return;
        if (Math.hypot(event.clientX - current.x, event.clientY - current.y) > 6) current.moved = true;
        if (current.moved) {
          event.preventDefault();
          setPreview({ text: item.text, x: event.clientX, y: event.clientY });
        }
      }}
      onPointerUp={pointerEnd}
      onPointerCancel={() => { suppressClick.current = null; drag.current = null; setPreview(null); }}
      onLostPointerCapture={() => { drag.current = null; setPreview(null); }}>
      <span aria-hidden="true">⠿ </span>{item.text}
    </button>;
  }

  return {
    selected, token,
    destination: (index: number) => ({
      "data-problem-drop": owner,
      "data-target": index,
      onClick: () => { if (!disabled && selected) place(selected, index); },
    }),
    guidance: <><p className="small-note">{french ? "Glisse un élément, ou sélectionne-le puis choisis un emplacement. Tab et Entrée fonctionnent aussi. Tu peux enlever une réponse pour la replacer." : "Drag an item, or select it and then select a destination. Tab and Enter work too. Remove a placed answer to return it to the bank."}</p>
      <p className="problem-announcement" role="status">{message}</p>
      {preview && <span className="problem-drag-preview" aria-hidden="true" style={{ left: preview.x, top: preview.y }}>{preview.text}</span>}</>,
  };
}

function Placement({ items, destinations, answer, onChange, disabled, language, unique = true }: {
  items: readonly ProblemItem[]; destinations: readonly { id: string; content: React.ReactNode }[];
  answer: ProblemAnswer; onChange: (answer: string[]) => void; disabled: boolean; language: "en" | "fr"; unique?: boolean;
}) {
  const controls = usePlacement(items, (id, target) => {
    const next = Array.from({ length: destinations.length }, (_, index) => unique && answer[index] === id ? "" : answer[index] ?? "");
    next[target] = id;
    onChange(next);
  }, disabled, language);
  return <div className="problem-placement">
    {controls.guidance}
    <div className="problem-bank" aria-label={language === "fr" ? "Éléments disponibles" : "Available items"}>{items.filter((item) => !unique || !answer.includes(item.id)).map(controls.token)}</div>
    <div className="problem-destinations">{destinations.map((destination, index) => {
      const placed = items.find((item) => item.id === answer[index]);
      return <div className="problem-destination" key={destination.id} {...controls.destination(index)}>
        <div className="problem-destination-content">{destination.content}</div>
        {!disabled && (!placed || controls.selected) && <button type="button" className="button secondary" disabled={!controls.selected} onClick={(event) => { event.stopPropagation(); controls.destination(index).onClick(); }}>
          {placed ? language === "fr" ? "Remplacer" : "Replace match" : language === "fr" ? "Placer ici" : "Place here"} {index + 1}
        </button>}
        {placed && <div className="problem-placed"><strong>{placed.text}</strong>
          <button type="button" className="button secondary" disabled={disabled} aria-label={`${language === "fr" ? "Enlever" : "Remove"} ${placed.text}`}
            onClick={(event) => { event.stopPropagation(); onChange(answer.map((value, position) => position === index ? "" : value)); }}>
            {language === "fr" ? "Enlever" : "Remove"}
          </button></div>}
      </div>;
    })}</div>
  </div>;
}

export function PictureMatchingProblem({ problem, ...props }: ProblemControlProps<OfType<"picture-match">>) {
  return <Placement {...props} items={problem.words} destinations={problem.pictures.map((picture) => ({
    id: picture.id, content: <FrenchPicture wordId={picture.pictureId} label={picture.description} />,
  }))} />;
}

export function PairMatchingProblem({ problem, ...props }: ProblemControlProps<OfType<"pairs">>) {
  return <Placement {...props} items={problem.right} destinations={problem.left.map((item) => ({ id: item.id, content: <strong>{item.text}</strong> }))} />;
}

export function SortingProblem({ problem, answer, onChange, disabled, language }: ProblemControlProps<OfType<"sort">>) {
  const controls = usePlacement(problem.items, (id, category) => {
    onChange(problem.items.map((item, index) => item.id === id ? problem.categories[category].id : answer[index] ?? ""));
  }, disabled, language);
  return <div>{controls.guidance}
    <div className="problem-bank">{problem.items.filter((_, index) => !answer[index]).map(controls.token)}</div>
    <div className="problem-destinations">{problem.categories.map((category, categoryIndex) => <div key={category.id} className="problem-destination" {...controls.destination(categoryIndex)}>
      <h3>{category.text}</h3>
      {!disabled && controls.selected && <button type="button" className="button secondary" onClick={(event) => { event.stopPropagation(); controls.destination(categoryIndex).onClick(); }}>
        {language === "fr" ? "Placer dans" : "Place in"} {category.text}
      </button>}
      {problem.items.map((item, index) => answer[index] === category.id && <div className="problem-placed" key={item.id}>
        {controls.token(item)}
        <button type="button" className="button secondary" disabled={disabled} aria-label={`${language === "fr" ? "Enlever" : "Remove"} ${item.text}`} onClick={(event) => {
          event.stopPropagation(); onChange(answer.map((value, position) => position === index ? "" : value));
        }}>{language === "fr" ? "Enlever" : "Remove"}</button>
      </div>)}
    </div>)}</div>
  </div>;
}

export function SequenceProblem({ problem, answer, onChange, disabled, language }: ProblemControlProps<OfType<"sequence">>) {
  const order = answer.length ? answer : problem.items.map((item) => item.id);
  function move(id: string, target: number) {
    const next = [...order];
    next.splice(next.indexOf(id), 1);
    next.splice(target, 0, id);
    onChange(next);
  }
  const controls = usePlacement(problem.items, move, disabled, language);
  return <div>{controls.guidance}
    <ol className="problem-sequence">{order.map((id, index) => {
      const item = problem.items.find((candidate) => candidate.id === id);
      if (!item) throw new Error("Sequence contains an unknown item.");
      return <li key={id} {...controls.destination(index)}>
        <span aria-hidden="true">{index + 1}.</span>{controls.token(item)}
        <button type="button" className="button secondary" disabled={disabled || index === 0} aria-label={`${language === "fr" ? "Monter" : "Move up"} ${item.text}`} onClick={(event) => { event.stopPropagation(); move(id, index - 1); }}>↑</button>
        <button type="button" className="button secondary" disabled={disabled || index === order.length - 1} aria-label={`${language === "fr" ? "Descendre" : "Move down"} ${item.text}`} onClick={(event) => { event.stopPropagation(); move(id, index + 1); }}>↓</button>
        {!disabled && controls.selected && controls.selected !== id && <button type="button" className="button secondary" onClick={(event) => { event.stopPropagation(); controls.destination(index).onClick(); }}>{language === "fr" ? "Placer ici" : "Place here"} {index + 1}</button>}
      </li>;
    })}</ol>
  </div>;
}

export function DiagramLabellingProblem({ problem, answer, onChange, disabled, language }: ProblemControlProps<OfType<"diagram">>) {
  const controls = usePlacement(problem.labels, (id, target) => {
    const next = problem.targets.map((_, index) => answer[index] === id ? "" : answer[index] ?? "");
    next[target] = id;
    onChange(next);
  }, disabled, language);
  return <div>{controls.guidance}<div className="problem-bank">{problem.labels.filter((label) => !answer.includes(label.id)).map(controls.token)}</div>
    <div className="problem-diagram">
      {/* The artwork is local and its intrinsic ratio must match the authored target coordinates. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={problem.image} alt={problem.description} />
      {problem.targets.map((target, index) => answer[index] || disabled
        ? <span key={target.id} className="problem-diagram-target" style={{ left: `${target.x}%`, top: `${target.y}%`, display: "grid", placeItems: "center" }}
          {...controls.destination(index)}>{index + 1}</span>
        : <button type="button" key={target.id} className="problem-diagram-target" style={{ left: `${target.x}%`, top: `${target.y}%` }}
          {...controls.destination(index)} disabled={!controls.selected} aria-label={`${language === "fr" ? "Placer à" : "Place at"} ${index + 1}`}>{index + 1}</button>)}
    </div>
    <ol className="problem-diagram-labels">{problem.targets.map((target, index) => {
      const label = problem.labels.find((item) => item.id === answer[index]);
      return <li key={target.id} {...controls.destination(index)}>
        {!disabled && (!label || controls.selected) && <button type="button" className="button secondary" disabled={!controls.selected} onClick={(event) => { event.stopPropagation(); controls.destination(index).onClick(); }}>
          {label ? language === "fr" ? "Remplacer l'étiquette" : "Replace label" : language === "fr" ? "Placer à" : "Place at"} {index + 1}
        </button>}
        <strong>{label?.text ?? (language === "fr" ? "Pas encore placé" : "Not labelled yet")}</strong>
        {label && <button type="button" className="button secondary" disabled={disabled} aria-label={`${language === "fr" ? "Enlever" : "Remove"} ${label.text}`} onClick={(event) => {
          event.stopPropagation(); onChange(answer.map((value, position) => position === index ? "" : value));
        }}>{language === "fr" ? "Enlever" : "Remove"}</button>}
      </li>;
    })}</ol>
  </div>;
}

export function FillBlankProblem({ problem, answer, onChange, disabled, language }: ProblemControlProps<OfType<"fill">>) {
  const id = useId();
  return <div className="problem-fill"><span>{problem.before}</span>
    <label className="sr-only" htmlFor={id}>{language === "fr" ? "Réponse dans le blanc" : "Answer for the blank"}</label>
    <input id={id} type="text" maxLength={120} value={answer[0] ?? ""} disabled={disabled} autoComplete="off" spellCheck={false} onChange={(event) => onChange([event.target.value])} />
    <span>{problem.after}</span>
  </div>;
}

export function SpellingHighlightProblem({ problem, answer, onChange, disabled }: ProblemControlProps<OfType<"spelling-highlight">>) {
  return <div className="problem-sentence">{problem.tokens.map((token, index) => /^\p{L}/u.test(token)
    ? <button type="button" key={index} className={`problem-word ${answer.includes(String(index)) ? "selected" : ""}`} disabled={disabled}
      aria-pressed={answer.includes(String(index))} onClick={() => onChange(answer.includes(String(index)) ? answer.filter((id) => id !== String(index)) : [...answer, String(index)])}>{token}</button>
    : <span key={index}>{token}</span>)}</div>;
}

export function WordSearchProblem({ problem, answer, onChange, disabled, language }: ProblemControlProps<OfType<"word-search">>) {
  const [start, setStart] = useState<number | null>(null);
  const [foundCells, setFoundCells] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const width = problem.grid[0].length;
  function pick(end: number) {
    if (start === null) { setStart(end); setMessage(language === "fr" ? "Choisis la dernière lettre." : "Select the last letter."); return; }
    const path = wordSearchPath(problem.grid, start, end);
    const text = wordAtPath(problem.grid, path);
    const word = problem.words.find((item) => item.text === text || item.text === [...text].reverse().join(""));
    if (word && !answer.includes(word.id)) {
      onChange([...answer, word.id]); setFoundCells([...new Set([...foundCells, ...path])]); setMessage(`${word.text} ✓`);
    } else setMessage(language === "fr" ? "Ce mot est déjà trouvé ou ce n'est pas un mot de la liste. Réessaie." : "That word is already found or is not in the list. Try another straight line.");
    setStart(null);
  }
  return <div>
    <p className="small-note">{language === "fr" ? "Sélectionne la première lettre puis la dernière, en ligne droite. Tu peux utiliser Tab et Entrée." : "Select the first letter, then the last, along a straight line. You can use Tab and Enter."}</p>
    <ul className="problem-search-words">{problem.words.map((word) => <li key={word.id}>{word.text} {answer.includes(word.id) && <span aria-label={language === "fr" ? "Trouvé" : "Found"}>✓</span>}</li>)}</ul>
    <div className="problem-search-grid" style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}>
      {problem.grid.flatMap((row, rowIndex) => [...row].map((letter, columnIndex) => {
        const cell = rowIndex * width + columnIndex;
        return <button type="button" key={cell} disabled={disabled} aria-pressed={start === cell || foundCells.includes(cell)}
          aria-label={`${letter}, ${language === "fr" ? "ligne" : "row"} ${rowIndex + 1}, ${language === "fr" ? "colonne" : "column"} ${columnIndex + 1}`}
          className={`${start === cell ? "selected" : ""} ${foundCells.includes(cell) ? "found" : ""}`} onClick={() => pick(cell)}>{letter}</button>;
      }))}
    </div><p role="status">{message}</p>
    {start !== null && <button type="button" className="button secondary" disabled={disabled} onClick={() => { setStart(null); setMessage(""); }}>{language === "fr" ? "Annuler" : "Cancel selection"}</button>}
  </div>;
}

export function ProblemControl(props: ProblemControlProps) {
  const { problem } = props;
  switch (problem.type) {
    case "word-search": return <WordSearchProblem {...props} problem={problem} />;
    case "picture-match": return <PictureMatchingProblem {...props} problem={problem} />;
    case "sort": return <SortingProblem {...props} problem={problem} />;
    case "sequence": return <SequenceProblem {...props} problem={problem} />;
    case "pairs": return <PairMatchingProblem {...props} problem={problem} />;
    case "diagram": return <DiagramLabellingProblem {...props} problem={problem} />;
    case "fill": return <FillBlankProblem {...props} problem={problem} />;
    case "spelling-highlight": return <SpellingHighlightProblem {...props} problem={problem} />;
  }
}
