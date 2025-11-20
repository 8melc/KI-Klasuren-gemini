export type Page = 'upload' | 'result';

export interface TaskGrading {
  id: string;
  points: number;
  maxPoints: number;
  analysis: string;
  errors?: string;
  suggestion?: string;
}

export interface GradingResult {
  tasks: TaskGrading[];
  totalPoints: number;
  maxPoints: number;
  grade: string;
  summary: string;
}

export interface StudentSubmission {
  id: string;
  file: File;
  name: string;
  status: 'idle' | 'ocr' | 'grading' | 'success' | 'error';
  result: GradingResult | null;
  textData: string | null;
  error?: string;
}

export interface AppState {
  files: {
    expectationHorizon: File | null;
    examText: File | null;
  };
  textData: {
    expectationHorizon: string;
    examText: string;
  };
  students: StudentSubmission[];
  currentStudentId: string | null;
  
  error: string | null;
  statusMessage: string;
  isProcessing: boolean;
}

export interface GradingContextType extends AppState {
  currentPage: Page;
  setFile: (type: 'expectationHorizon' | 'examText', file: File) => void;
  addStudentFiles: (files: File[]) => void;
  removeStudent: (id: string) => void;
  updateStudentName: (id: string, name: string) => void;
  selectStudent: (id: string | null) => void;
  startGrading: () => Promise<boolean>;
  reset: () => void;
  navigateTo: (page: Page) => void;
}