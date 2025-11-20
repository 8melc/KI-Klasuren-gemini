import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GradingProvider } from './context/GradingContext';
import Layout from './components/Layout';
import UploadPage from './pages/UploadPage';
import ResultPage from './pages/ResultPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <GradingProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/ergebnis" element={<ResultPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </GradingProvider>
    </HashRouter>
  );
};

export default App;