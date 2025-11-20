import React from 'react';
import UploadBox from '../components/UploadBox';
import { useGrading } from '../context/GradingContext';

const UploadPage: React.FC = () => {
  const { files, students, error, setFile, addStudentFiles, removeStudent, updateStudentName, startGrading, navigateTo } = useGrading();

  const handleStart = () => {
    if (students.length === 0 || !files.expectationHorizon || !files.examText) {
      startGrading(); // Triggers error in context if validation fails
      return;
    }
    
    navigateTo('result');
    startGrading(); // Starts background processing
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 animate-fade-in">
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mt-0.5 shrink-0">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="text-center space-y-2 mb-10">
        <h2 className="text-3xl font-bold text-slate-900">Korrektur starten</h2>
        <p className="text-slate-500">Laden Sie die Unterlagen und eine oder mehrere Schülerklausuren hoch.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
        
        <div className="space-y-4">
           <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Grundlagen
           </h3>
           <div className="grid md:grid-cols-2 gap-6">
            <UploadBox 
              label="Erwartungshorizont" 
              subLabel=".pdf, .txt (Lösungsschlüssel)"
              accept=".pdf,.txt,.md"
              file={files.expectationHorizon}
              onFileSelect={(f) => setFile('expectationHorizon', f)}
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>}
            />
            <UploadBox 
              label="Aufgabenstellung" 
              subLabel=".pdf, .txt (Originalaufgaben)"
              accept=".pdf,.txt,.md"
              file={files.examText}
              onFileSelect={(f) => setFile('examText', f)}
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-4">
           <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Klausuren
           </h3>
          
          <UploadBox 
            label="Schülerklausuren hochladen" 
            subLabel=".pdf (Scans oder Fotos), Mehrfachauswahl möglich"
            accept=".pdf"
            multiple={true}
            count={students.length}
            onFileSelect={() => {}} // Not used for multiple
            onFilesSelect={(files) => addStudentFiles(files)}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>}
          />

          {students.length > 0 && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                Ausgewählte Schüler ({students.length})
              </div>
              <div className="divide-y divide-slate-200">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 hover:bg-white transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                       <div className="bg-white p-2 rounded border border-slate-200">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                       </div>
                       <div className="flex-1">
                         <input 
                          type="text" 
                          value={student.name} 
                          onChange={(e) => updateStudentName(student.id, e.target.value)}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:ring-0 outline-none text-sm font-medium text-slate-700 p-0"
                          placeholder="Name eingeben..."
                        />
                       </div>
                    </div>
                    <button 
                      onClick={() => removeStudent(student.id)}
                      className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                      title="Entfernen"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      <button
        onClick={handleStart}
        disabled={students.length === 0 || !files.expectationHorizon || !files.examText}
        className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
      >
        <span>Korrektur starten ({students.length})</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  );
};

export default UploadPage;