export interface ScienceVideo {
  videoId: string;
  title: string;
  channel: string;
  durationSeconds: number;
  learningFocus: string;
  question: string;
  verifiedAt: string;
}

export type ScienceVideoBank = Readonly<Record<string, readonly ScienceVideo[]>>;
