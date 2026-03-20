export enum FlagType {
  ILLEGIBLE = "ILLEGIBLE",
  AMBIGUOUS = "AMBIGUOUS",
  MISSING = "MISSING",
  NONE = "NONE"
}

export interface QuestionResult {
  id: string;
  extractedAnswer: string;
  score: number;
  maxScore: number;
  feedback: string;
  flags: FlagType[];
}

export interface GradingResult {
  studentName: string;
  globalComment: string;
  totalScore: number;
  maxTotalScore: number;
  finalGrade20: number;
  questions: QuestionResult[];
}

export interface FileData {
  file: File;
  previewUrl: string;
  base64?: string;
  mimeType: string;
}
