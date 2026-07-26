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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Sidebar Panel */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />

      {/* Main Panel Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 pb-32 min-h-screen">
        {renderContent()}
      </main>
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
