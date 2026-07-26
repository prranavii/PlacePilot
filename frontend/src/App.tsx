import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { Pipeline } from './pages/Pipeline';
import { Questions } from './pages/Questions';
import { Journal } from './pages/Journal';
import { ResumeMatcher } from './pages/ResumeMatcher';
import { MemoryDebugger } from './pages/MemoryDebugger';
import { WeeklyReports } from './pages/WeeklyReports';




const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Handle dark mode toggle
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Login />;
  }

  // Render correct page based on current tab selection
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} />;
      case 'applications':
        return <Applications />;
      case 'pipeline':
        return <Pipeline />;
      case 'questions':
        return <Questions />;
      case 'journal':
        return <Journal />;
      case 'resume':
        return <ResumeMatcher />;
      case 'memory':
        return <MemoryDebugger />;
      case 'reports':
        return <WeeklyReports />;
      default:
        return <Dashboard setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col text-zinc-900 dark:text-zinc-100 transition-colors duration-200 relative overflow-hidden">
      {/* 3D Dissolving Ambient Blobs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Blob 1: Sage Green */}
        <div className="absolute top-[5%] left-[-5%] w-[550px] h-[550px] rounded-full bg-brand-500/25 dark:bg-brand-500/20 blur-[130px] animate-blob" />
        {/* Blob 2: Amber Gold */}
        <div className="absolute top-[35%] right-[-5%] w-[650px] h-[650px] rounded-full bg-amber-500/30 dark:bg-amber-500/20 blur-[150px] animate-blob animation-delay-2000" />
        {/* Blob 3: Teal */}
        <div className="absolute bottom-[-5%] left-[20%] w-[500px] h-[500px] rounded-full bg-teal-500/25 dark:bg-teal-500/20 blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sidebar Panel */}
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
        />

        {/* Main Panel Content Area */}
        <main className="flex-1 w-full max-w-[95%] xl:max-w-[92%] 2xl:max-w-[1700px] mx-auto px-6 py-8 pb-32 min-h-screen">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
