import React, { useEffect } from 'react';
import { useGrading } from '../context/GradingContext';
import { generatePDF } from '../utils/reportGenerator';
import { StudentSubmission } from '../types';

const ResultPage: React.FC = () => {
  const { students, currentStudentId, reset, selectStudent, navigateTo, isProcessing, statusMessage, error } = useGrading();

  useEffect(() => {
    if (students.length === 0) {
      navigateTo('upload');
    }
  }, [students, navigateTo]);

  const handleReset = () => {
    reset();
  };

  const handleDownload = (student: StudentSubmission, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (student.result) {
      generatePDF(student.name, student.result);
    }
  };

  // -- DETAIL VIEW --
  if (currentStudentId) {
    const currentIndex = students.findIndex(s => s.id === currentStudentId);
    const currentStudent = students[currentIndex];
    const gradingResult = currentStudent?.result;

    const prevStudent = currentIndex > 0 ? students[currentIndex - 1] : null;
    const nextStudent = currentIndex < students.length - 1 ? students[currentIndex + 1] : null;

    if (!currentStudent || !gradingResult) return <div>Fehler: Daten nicht gefunden.</div>;

    return (
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
             <button onClick={() => selectStudent(null)} className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                Alle Schüler
             </button>
          </div>

          <div className="flex gap-2 items-center">
            <div className="flex mr-4 bg-white border border-slate-200 rounded-lg p-1">
                 <button 
                    disabled={!prevStudent || !prevStudent.result}
                    onClick={() => prevStudent && selectStudent(prevStudent.id)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Vorheriger Schüler"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                 </button>
                 <button 
                    disabled={!nextStudent || !nextStudent.result}
                    onClick={() => nextStudent && selectStudent(nextStudent.id)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Nächster Schüler"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                 </button>
            </div>

            <button 
            onClick={(e) => handleDownload(currentStudent, e)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium shadow-md flex items-center gap-2 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
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
                <p className="text-blue-700 font-medium mt-1">{currentStudent.name}</p>
              </div>
              <div className="flex items-center gap-6 bg-white/50 p-4 rounded-xl backdrop-blur-sm border border-blue-100/50">
                  <div className="text-center">
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Punkte</div>
                    <div className="text-2xl font-bold text-slate-900 leading-none">
                      {gradingResult.totalPoints} <span className="text-slate-400 text-lg">/ {gradingResult.maxPoints}</span>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-slate-200"></div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Note</div>
                    <div className="text-3xl font-bold text-blue-600 leading-none">{gradingResult.grade}</div>
                  </div>
              </div>
            </div>
          </div>
          <div className="p-8">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              Gesamteinschätzung
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {gradingResult.summary}
            </p>
          </div>
        </div>
  
        {/* Tasks */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Detailbewertung
            <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{gradingResult.tasks.length} Aufgaben</span>
          </h3>
          {gradingResult.tasks.map((task, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md group">
              <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-800 text-white font-bold px-3 py-1 rounded text-sm">Aufgabe {task.id}</span>
                </div>
                <span className={`font-bold px-3 py-1 rounded-full text-sm border ${
                  (task.points / task.maxPoints) >= 0.5 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {task.points} / {task.maxPoints} Pkt
                </span>
              </div>
              
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Analyse</div>
                  <p className="text-slate-700 leading-relaxed">{task.analysis}</p>
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
    );
  }

  // -- LIST VIEW --
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 animate-fade-in">
        {/* Status Banner for Processing */}
        {isProcessing && (
            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4 shadow-sm animate-pulse">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </div>
                <div className="flex-1">
                   <p className="text-sm font-semibold text-blue-800">{statusMessage}</p>
                   <p className="text-xs text-blue-600">Sie können fertige Ergebnisse bereits ansehen.</p>
                </div>
            </div>
        )}
        
        {error && (
             <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mt-0.5 shrink-0">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                {error}
             </div>
        )}

        <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Übersicht</h2>
                <p className="text-slate-500 mt-1">{students.length} Klausuren verarbeitet</p>
            </div>
            <button onClick={handleReset} disabled={isProcessing} className="text-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50">
                Neue Korrektur starten
            </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Schüler</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Punkte</th>
                        <th className="px-6 py-4">Note</th>
                        <th className="px-6 py-4 text-right">Aktionen</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {students.map((student) => (
                        <tr 
                            key={student.id} 
                            onClick={() => student.result && selectStudent(student.id)}
                            className={`transition-colors group ${student.result ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-slate-50'}`}
                        >
                            <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                            <td className="px-6 py-4">
                                {student.status === 'success' && <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>Fertig
                                </span>}
                                {student.status === 'error' && <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>Fehler
                                </span>}
                                {student.status === 'grading' && <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>Bewertung
                                </span>}
                                {student.status === 'ocr' && <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-pulse"></span>OCR
                                </span>}
                                {student.status === 'idle' && <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                    Warteschlange
                                </span>}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                {student.result ? `${student.result.totalPoints} / ${student.result.maxPoints}` : '-'}
                            </td>
                            <td className="px-6 py-4">
                                {student.result ? <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{student.result.grade}</span> : '-'}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                                {student.result && (
                                    <>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); selectStudent(student.id); }}
                                            className="text-slate-500 hover:text-blue-600 font-medium text-sm px-3 py-1 rounded hover:bg-blue-100 transition-colors"
                                        >
                                            Details
                                        </button>
                                        <button 
                                            onClick={(e) => handleDownload(student, e)}
                                            className="text-slate-400 hover:text-slate-900 transition-colors p-1 hover:bg-slate-200 rounded"
                                            title="PDF Download"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default ResultPage;