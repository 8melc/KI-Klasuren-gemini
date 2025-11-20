import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState, GradingResult, GradingContextType, Page, StudentSubmission } from '../types';
import { performOCR, gradeExam } from '../services/geminiService';
import { convertPdfToImages, extractTextFromTextFile } from '../utils/pdfUtils';

const GradingContext = createContext<GradingContextType | undefined>(undefined);

export const GradingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState<Page>('upload');
  const [state, setState] = useState<AppState>({
    files: {
      expectationHorizon: null,
      examText: null,
    },
    textData: {
      expectationHorizon: '',
      examText: '',
    },
    students: [],
    currentStudentId: null,
    error: null,
    statusMessage: '',
    isProcessing: false,
  });

  const setFile = (type: 'expectationHorizon' | 'examText', file: File) => {
    setState(prev => ({
      ...prev,
      files: { ...prev.files, [type]: file }
    }));
  };

  const addStudentFiles = (newFiles: File[]) => {
    const newStudents: StudentSubmission[] = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name.replace(/\.[^/.]+$/, ""), // Default name from filename
      status: 'idle',
      result: null,
      textData: null
    }));

    setState(prev => ({
      ...prev,
      students: [...prev.students, ...newStudents]
    }));
  };

  const removeStudent = (id: string) => {
    setState(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== id)
    }));
  };

  const updateStudentName = (id: string, name: string) => {
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === id ? { ...s, name } : s)
    }));
  };

  const selectStudent = (id: string | null) => {
    setState(prev => ({ ...prev, currentStudentId: id }));
  };

  const navigateTo = (newPage: Page) => {
    setPage(newPage);
    if (newPage === 'result') navigate('/ergebnis');
    if (newPage === 'upload') navigate('/');
  };

  const processFile = async (file: File, type: 'ocr' | 'text'): Promise<string> => {
    if (file.type === 'application/pdf') {
      const images = await convertPdfToImages(file);
      const mode = type === 'ocr' ? 'handwritten' : 'document';
      return await performOCR(images, mode);
    } else {
      return extractTextFromTextFile(file);
    }
  };

  const startGrading = async (): Promise<boolean> => {
    if (!state.files.expectationHorizon || !state.files.examText) {
      setState(prev => ({ ...prev, error: "Bitte Erwartungshorizont und Aufgabenstellung hochladen." }));
      return false;
    }

    if (state.students.length === 0) {
      setState(prev => ({ ...prev, error: "Bitte mindestens eine Schülerklausur hochladen." }));
      return false;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null, statusMessage: 'Initialisiere...' }));

    try {
      // 1. Process Base Files (if not done yet)
      let horizonText = state.textData.expectationHorizon;
      let examText = state.textData.examText;

      if (!horizonText) {
        setState(prev => ({ ...prev, statusMessage: 'Verarbeite Erwartungshorizont...' }));
        horizonText = await processFile(state.files.expectationHorizon, 'text');
      }
      
      if (!examText) {
        setState(prev => ({ ...prev, statusMessage: 'Verarbeite Aufgabenstellung...' }));
        examText = await processFile(state.files.examText, 'text');
      }

      // Update state with base texts
      setState(prev => ({
        ...prev,
        textData: { expectationHorizon: horizonText, examText: examText }
      }));

      // 2. Process Students Sequentially
      const studentsToProcess = state.students.filter(s => s.status === 'idle' || s.status === 'error');
      
      for (let i = 0; i < studentsToProcess.length; i++) {
        const student = studentsToProcess[i];
        const progressMsg = `Korrigiere Klausur ${i + 1} von ${studentsToProcess.length}: ${student.name}`;
        setState(prev => ({ ...prev, statusMessage: progressMsg }));

        // Update student status to OCR
        setState(prev => ({
          ...prev,
          students: prev.students.map(s => s.id === student.id ? { ...s, status: 'ocr' } : s)
        }));

        try {
          // OCR
          const studentText = await processFile(student.file, 'ocr');
          
          // Update student status to Grading
          setState(prev => ({
            ...prev,
            students: prev.students.map(s => s.id === student.id ? { ...s, status: 'grading', textData: studentText } : s)
          }));

          // Grading
          const result = await gradeExam(horizonText, examText, studentText);

          // Success
          setState(prev => ({
            ...prev,
            students: prev.students.map(s => s.id === student.id ? { ...s, status: 'success', result: result, error: undefined } : s)
          }));

        } catch (err) {
          console.error(`Error processing student ${student.id}:`, err);
          setState(prev => ({
            ...prev,
            students: prev.students.map(s => s.id === student.id ? { ...s, status: 'error', error: 'Fehler bei der Verarbeitung' } : s)
          }));
        }
      }

      setState(prev => ({ ...prev, isProcessing: false, statusMessage: 'Fertig' }));
      return true;

    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: "Kritischer Fehler bei der Verarbeitung." 
      }));
      return false;
    }
  };

  const reset = () => {
    setState({
      files: { expectationHorizon: null, examText: null },
      textData: { expectationHorizon: '', examText: '' },
      students: [],
      currentStudentId: null,
      error: null,
      statusMessage: '',
      isProcessing: false,
    });
    setPage('upload');
    navigate('/');
  };

  return (
    <GradingContext.Provider value={{ ...state, currentPage: page, setFile, addStudentFiles, removeStudent, updateStudentName, selectStudent, startGrading, reset, navigateTo }}>
      {children}
    </GradingContext.Provider>
  );
};

export const useGrading = () => {
  const context = useContext(GradingContext);
  if (context === undefined) {
    throw new Error('useGrading must be used within a GradingProvider');
  }
  return context;
};