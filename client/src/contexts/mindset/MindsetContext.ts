import { createContext } from "react";

// 타입 정의
export interface TestResult {
  id: string;
  date: string;
  score: number;
  analysis: string;
  category: string;
}

export interface TestHistoryItem {
  id: string;
  date: string;
  score: number;
  category: string;
}

// Context 타입 정의
export interface MindsetContextType {
  loading: boolean;
  testResult: TestResult | null;
  testHistory: TestHistoryItem[] | null;
  takeTest: (answers: Record<string, number>) => Promise<void>;
  fetchTestHistory: () => Promise<void>;
  canTakeTest: boolean;
  setCanTakeTest: (value: boolean) => void;
  refreshTestStatus: () => Promise<void>;
}

// Context 생성
export const MindsetContext = createContext<MindsetContextType | undefined>(
  undefined,
);
