import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-200">
              KI
            </div>
            <h1 className="text-xl font-bold tracking-tight">Klausur Korrektur <span className="text-blue-600">MVP</span></h1>
          </div>
          <div className="hidden md:block text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Unterstützt durch Gemini 2.5
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="py-8 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} KI-Klausur-Korrektur
      </footer>
    </div>
  );
};

export default Layout;