export type Verdict = "HOT_DOG" | "NOT_HOT_DOG";

export interface ClassifyResponse {
  id: string;
  verdict: Verdict;
  confidence: number;
  rationale: string;
  latencyMs: number;
  modelId: string;
  createdAt: string;
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  HOT_DOG: "Hot Dog",
  NOT_HOT_DOG: "Not Hot Dog",
};
