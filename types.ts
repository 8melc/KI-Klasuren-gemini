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

export enum UploadType {
  EXPECTATION = 'expectation',
  EXAM_TEXT = 'examText',
  STUDENT_PDF = 'studentPdf'
}

export interface AppState {
  step: 'upload' | 'processing' | 'results';
  files: {
    expectationHorizon: File | null;
    examText: File | null;
    studentPdf: File | null;
  };
  textData: {
    expectationHorizon: string;
    examText: string;
    studentAnswers: string;
  };
  gradingResult: GradingResult | null;
  studentName: string;
  error: string | null;
  statusMessage: string;
}