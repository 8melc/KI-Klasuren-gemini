import React, { useState, useCallback } from 'react';
import UploadBox from './components/UploadBox';
import { performOCR, gradeExam } from './services/geminiService';
import { convertPdfToImages, extractTextFromTextFile } from './utils/pdfUtils';
import { generatePDF } from './utils/reportGenerator';
import { AppState, GradingResult } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: 'upload',
    files: {
      expectationHorizon: null,
      examText: null,
      studentPdf: null,
    },
    textData: {
      expectationHorizon: '',
      examText: '',
      studentAnswers: '',
    },
    gradingResult: null,
    studentName: '',
    error: null,
    statusMessage: '',
  });

  const handleFileSelect = (type: keyof AppState['files']) => (file: File) => {
    setState(prev => ({
      ...prev,
      files: { ...prev.files, [type]: file }
    }));
  };

  const processFile = async (file: File, type: 'ocr' | 'text'): Promise<string> => {
    if (file.type === 'application/pdf') {
      // Convert PDF to images
      const images = await convertPdfToImages(file);
      // Determine mode: 'handwritten' for student exam, 'document' for others
      const mode = type === 'ocr' ? 'handwritten' : 'document';
      return await performOCR(images, mode);
    } else {
      // Assume text/md
      return extractTextFromTextFile(file);
    }
  };

  const processFiles = async () => {
    if (!state.files.expectationHorizon || !state.files.examText || !state.files.studentPdf) {
      setState(prev => ({ ...prev, error: "Bitte alle Dateien hochladen." }));
      return;
    }

    if (!state.studentName.trim()) {
      setState(prev => ({ ...prev, error: "Bitte Namen des Schülers eingeben." }));
      return;
    }

    setState(prev => ({ ...prev, step: 'processing', error: null, statusMessage: 'Verarbeite Dokumente...' }));

    try {
      // 1. Process Expectation Horizon (PDF or Text)
      setState(prev => ({ ...prev, statusMessage: 'Lese Erwartungshorizont...' }));
      const horizonText = await processFile(state.files.expectationHorizon, 'text');

      // 2. Process Exam Text (PDF or Text)
      setState(prev => ({ ...prev, statusMessage: 'Lese Aufgabenstellung...' }));
      const examText = await processFile(state.files.examText, 'text');

      // 3. Process Student PDF (Always PDF/OCR/Handwritten)
      setState(prev => ({ ...prev, statusMessage: 'Analysiere Handschrift (OCR)...' }));
      const studentText = await processFile(state.files.studentPdf, 'ocr');
      
      setState(prev => ({ ...prev, statusMessage: 'KI bewertet die Klausur...' }));

      // 4. Grade with Gemini
      const result = await gradeExam(horizonText, examText, studentText);

      setState(prev => ({
        ...prev,
        step: 'results',
        gradingResult: result,
        textData: {
          expectationHorizon: horizonText,
          examText: examText,
          studentAnswers: studentText
        }
      }));

    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        step: 'upload', 
        error: "Fehler bei der Verarbeitung. Bitte prüfen Sie die Dateien oder versuchen Sie es erneut." 
      }));
    }
  };

  const downloadReport = () => {
    if (state.gradingResult) {
      generatePDF(state.studentName, state.gradingResult);
    }
  };

  const reset = () => {
    setState({
      step: 'upload',
      files: { expectationHorizon: null, examText: null, studentPdf: null },
      textData: { expectationHorizon: '', examText: '', studentAnswers: '' },
      gradingResult: null,
      studentName: '',
      error: null,
      statusMessage: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              KI
            </div>
            <h1 className="text-xl font-bold tracking-tight">Klausur Korrektur <span className="text-blue-600">MVP</span></h1>
          </div>
          <div className="text-sm text-slate-500">Unterstützt durch Gemini 2.5</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        
        {state.error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mt-0.5 shrink-0">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            {state.error}
          </div>
        )}

        {state.step === 'upload' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2 mb-10">
              <h2 className="text-3xl font-bold text-slate-900">Neue Korrektur starten</h2>
              <p className="text-slate-500">Laden Sie die Unterlagen hoch (PDF, Text), um eine automatische Bewertung zu erhalten.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Name des Schülers</label>
                <input 
                  type="text" 
                  value={state.studentName}
                  onChange={(e) => setState(s => ({...s, studentName: e.target.value}))}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="z.B. Max Mustermann"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <UploadBox 
                  label="1. Erwartungshorizont" 
                  subLabel=".pdf, .txt, .md (Lösungsschlüssel)"
                  accept=".pdf,.txt,.md"
                  file={state.files.expectationHorizon}
                  onFileSelect={handleFileSelect('expectationHorizon')}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>}
                />
                <UploadBox 
                  label="2. Aufgabenstellung" 
                  subLabel=".pdf, .txt, .md (Originalaufgaben)"
                  accept=".pdf,.txt,.md"
                  file={state.files.examText}
                  onFileSelect={handleFileSelect('examText')}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
                />
              </div>

              <UploadBox 
                label="3. Handschriftliche Klausur" 
                subLabel=".pdf (Scan oder Foto)"
                accept=".pdf"
                file={state.files.studentPdf}
                onFileSelect={handleFileSelect('studentPdf')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>}
              />
            </div>

            <button
              onClick={processFiles}
              disabled={!state.files.studentPdf || !state.studentName || !state.files.expectationHorizon || !state.files.examText}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              <span>Korrektur starten</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        )}

        {state.step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-fade-in">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-slate-900">{state.statusMessage}</h3>
              <p className="text-slate-500 max-w-md">Bitte warten Sie einen Moment. Die KI analysiert die Dokumente und bewertet die Klausur.</p>
            </div>
          </div>
        )}

        {state.step === 'results' && state.gradingResult && (
          <div className="space-y-8 animate-fade-in">
             <div className="flex items-center justify-between">
               <button onClick={reset} className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                 Zurück
               </button>
               <div className="flex gap-3">
                 <button 
                  onClick={downloadReport}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium shadow-md flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  PDF Bericht
                </button>
               </div>
             </div>

            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-100 p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Klausurergebnis</h2>
                    <p className="text-blue-700 font-medium mt-1">{state.studentName}</p>
                  </div>
                  <div className="flex items-center gap-6 bg-white/50 p-4 rounded-xl backdrop-blur-sm">
                     <div className="text-center">
                       <div className="text-sm text-slate-500 uppercase tracking-wider font-bold">Punkte</div>
                       <div className="text-2xl font-bold text-slate-900">
                         {state.gradingResult.totalPoints} <span className="text-slate-400 text-lg">/ {state.gradingResult.maxPoints}</span>
                       </div>
                     </div>
                     <div className="w-px h-10 bg-slate-200"></div>
                     <div className="text-center">
                       <div className="text-sm text-slate-500 uppercase tracking-wider font-bold">Note</div>
                       <div className="text-3xl font-bold text-blue-600">{state.gradingResult.grade}</div>
                     </div>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Gesamteinschätzung</h3>
                <p className="text-slate-600 leading-relaxed">
                  {state.gradingResult.summary}
                </p>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Detailbewertung</h3>
              {state.gradingResult.tasks.map((task, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded text-sm">Aufgabe {task.id}</span>
                    </div>
                    <span className="font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-full text-sm border border-slate-100">
                      {task.points} / {task.maxPoints} Pkt
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Analyse</div>
                      <p className="text-slate-700">{task.analysis}</p>
                    </div>
                    
                    {task.errors && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <div className="text-xs font-bold text-red-800 uppercase mb-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          Korrektur
                        </div>
                        <p className="text-red-700 text-sm">{task.errors}</p>
                      </div>
                    )}
                    
                    {task.suggestion && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="text-xs font-bold text-green-800 uppercase mb-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                          Tipp
                        </div>
                        <p className="text-green-700 text-sm">{task.suggestion}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;