import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import CollectionPage from './pages/CollectionPage';
import DataHubPage from './pages/DataHubPage';
import FusionPage from './pages/FusionPage';
import DiagnosisPage from './pages/DiagnosisPage';
import AIDecisionPage from './pages/AIDecisionPage';
import VitalityPage from './pages/VitalityPage';
import ImprovementPage from './pages/ImprovementPage';
import CourseProfilePage from './pages/CourseProfilePage';
import EfficacyEvalPage from './pages/EfficacyEvalPage';
import { ToastProvider } from './components/ToastManager';

type Page = 'dashboard' | 'collection' | 'datahub' | 'fusion' | 'diagnosis' | 'ai' | 'vitality' | 'improvement' | 'profile' | 'efficacy';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .catch(() => console.log('后端服务未启动，将使用模拟模式'));
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'collection': return <CollectionPage />;
      case 'datahub': return <DataHubPage />;
      case 'fusion': return <FusionPage />;
      case 'diagnosis': return <DiagnosisPage />;
      case 'ai': return <AIDecisionPage />;
      case 'vitality': return <VitalityPage />;
      case 'improvement': return <ImprovementPage />;
      case 'profile': return <CourseProfilePage />;
      case 'efficacy': return <EfficacyEvalPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
