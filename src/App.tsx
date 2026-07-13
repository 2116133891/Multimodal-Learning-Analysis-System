import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import CollectionPage from './pages/CollectionPage';
import FusionPage from './pages/FusionPage';
import DiagnosisPage from './pages/DiagnosisPage';
import AIDecisionPage from './pages/AIDecisionPage';
import VitalityPage from './pages/VitalityPage';
import ImprovementPage from './pages/ImprovementPage';

type Page = 'dashboard' | 'collection' | 'fusion' | 'diagnosis' | 'ai' | 'vitality' | 'improvement';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    // 启动时检查服务器健康状态
    fetch('http://localhost:3001/api/health')
      .then(r => r.json())
      .catch(() => console.log('后端服务未启动，将使用模拟模式'));
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'collection': return <CollectionPage />;
      case 'fusion': return <FusionPage />;
      case 'diagnosis': return <DiagnosisPage />;
      case 'ai': return <AIDecisionPage />;
      case 'vitality': return <VitalityPage />;
      case 'improvement': return <ImprovementPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
