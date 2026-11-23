export const MENTAL_MATH_ROWS = 8;
export const MENTAL_MATH_COLUMNS = 5;
export const MENTAL_MATH_LIMIT_MS = 5 * 60 * 1000;

export const mentalMathActivities = [
  { slug: "single-digit-addition", title: "Single digit addition", operation: "addition", rowMin: 1, rowMax: 9, columnMin: 1, columnMax: 9 },
  { slug: "two-digit-addition", title: "Two digit addition", operation: "addition", rowMin: 10, rowMax: 99, columnMin: 10, columnMax: 99 },
  { slug: "single-digit-multiplication", title: "Single digit multiplication", operation: "multiplication", rowMin: 1, rowMax: 9, columnMin: 1, columnMax: 9 },
  { slug: "single-by-two-digit-multiplication", title: "Single digits multiplied by 2 digits", operation: "multiplication", rowMin: 10, rowMax: 99, columnMin: 1, columnMax: 9 },
] as const;

export type MentalMathActivity = typeof mentalMathActivities[number];

export interface MentalMathGrid {
  rows: number[];
  columns: number[];
}

export function getMentalMathActivity(slug: string) {
  return mentalMathActivities.find((activity) => activity.slug === slug);
}

export function generateMentalMathGrid(activity: MentalMathActivity): MentalMathGrid {
  function pick(min: number, max: number, count: number) {
    const values = Array.from({ length: max - min + 1 }, (_, index) => min + index);
    for (let index = values.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [values[index], values[other]] = [values[other], values[index]];
    }
    return values.slice(0, count);
  }
  return {
    rows: pick(activity.rowMin, activity.rowMax, MENTAL_MATH_ROWS),
    columns: pick(activity.columnMin, activity.columnMax, MENTAL_MATH_COLUMNS),
  };
}

export function mentalMathAnswer(activity: MentalMathActivity, row: number, column: number) {
  return activity.operation === "addition" ? row + column : row * column;
}

export function formatElapsedTime(milliseconds: number) {
  const seconds = Math.ceil(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
