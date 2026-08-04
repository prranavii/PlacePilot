import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { Pipeline } from './pages/Pipeline';
import { Questions } from './pages/Questions';
import { Journal } from './pages/Journal';
import { ResumeMatcher } from './pages/ResumeMatcher';
import { MemoryDebugger } from './pages/MemoryDebugger';
import { WeeklyReports } from './pages/WeeklyReports';
import { Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Verification states
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);

  // Password reset states
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  // Check URL query parameters for verification/reset tokens on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyTokenParam = params.get('verify_token');
    const resetTokenParam = params.get('reset_token');

    if (verifyTokenParam) {
      setVerifyStatus('loading');
      import('./services/api').then(({ api }) => {
        api.auth.verifyEmail(verifyTokenParam)
          .then((res: any) => {
            setVerifyStatus('success');
            setVerifyMsg(res.message || 'Email verified successfully! You can now log in.');
          })
          .catch((err: any) => {
            setVerifyStatus('error');
            setVerifyMsg(err.message || 'Verification failed. The link may have expired or is invalid.');
          });
      });
      // Strip token from browser URL cleanly
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (resetTokenParam) {
      setResetToken(resetTokenParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  // Reset tab to dashboard on session change/logout to prevent state leakage
  useEffect(() => {
    if (!user) {
      setCurrentTab('dashboard');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sand dark:bg-[#18110F] flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-vermilion border-t-transparent" />
      </div>
    );
  }

  // Render Verification Overlay if verification is active
  if (verifyStatus !== 'idle') {
    return (
      <div className="min-h-screen bg-sand bg-dot-grid-dark flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-vermilion/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-vermilion/3 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md bg-white border border-cocoa/10 rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl relative z-10 text-center">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-[1.2rem] bg-sand border border-cocoa/10 flex items-center justify-center text-cocoa shadow-lg shadow-vermilion/15 mb-4 animate-pulse-subtle">
              <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 fill-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 8.5,21 L 11.5,14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 12,13 L 15.5,5 L 17,7" stroke="#FF5B37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 15.5,5 L 18.5,8" stroke="#FF5B37" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="12" cy="8" r="1.5" fill="#FF5B37" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-cocoa tracking-widest text-center font-serif uppercase">
              Email Verification
            </h2>
            <span className="text-[8px] text-vermilion font-bold tracking-widest uppercase block mt-1.5 text-center">
              PlacePilot AI
            </span>
          </div>

          {verifyStatus === 'loading' && (
            <div className="flex flex-col items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-vermilion border-t-transparent mb-4" />
              <p className="text-sm text-cocoa/60">Verifying your email address...</p>
            </div>
          )}

          {verifyStatus === 'success' && (
            <div className="space-y-6">
              <div className="bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 text-xs rounded-[1.2rem] p-3.5 flex items-start gap-2.5">
                <svg className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-left">{verifyMsg}</span>
              </div>
              <button
                onClick={() => setVerifyStatus('idle')}
                className="w-full bg-vermilion hover:bg-vermilion/90 text-cocoa font-bold text-xs py-3.5 rounded-[1.2rem] shadow-lg shadow-vermilion/15 hover:shadow-vermilion/25 transition-all uppercase tracking-widest"
              >
                Sign In Now
              </button>
            </div>
          )}

          {verifyStatus === 'error' && (
            <div className="space-y-6">
              <div className="bg-vermilion/5 border border-vermilion/15 text-vermilion text-xs rounded-[1.2rem] p-3.5 flex items-start gap-2.5">
                <svg className="w-4.5 h-4.5 text-vermilion shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-left">{verifyMsg}</span>
              </div>
              <button
                onClick={() => setVerifyStatus('idle')}
                className="w-full bg-sand border border-cocoa/10 text-cocoa/60 hover:text-cocoa font-bold text-xs py-3.5 rounded-[1.2rem] transition-all uppercase tracking-widest"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Password Reset Overlay if a reset token is present
  if (resetToken !== null) {
    const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setResetStatus('loading');
      setResetMsg(null);
      
      try {
        const { api } = await import('./services/api');
        const res: any = await api.auth.resetPassword({ token: resetToken, new_password: newPassword });
        setResetStatus('success');
        setResetMsg(res.message || 'Password reset successfully! You can now sign in.');
      } catch (err: any) {
        setResetStatus('error');
        setResetMsg(err.message || 'Failed to reset password. The link may have expired.');
      }
    };

    return (
      <div className="min-h-screen bg-sand bg-dot-grid-dark flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-vermilion/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-vermilion/3 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md bg-white border border-cocoa/10 rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-[1.2rem] bg-sand border border-cocoa/10 flex items-center justify-center text-cocoa shadow-lg shadow-vermilion/15 mb-4 animate-pulse-subtle">
              <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 fill-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 8.5,21 L 11.5,14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 12,13 L 15.5,5 L 17,7" stroke="#FF5B37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 15.5,5 L 18.5,8" stroke="#FF5B37" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="12" cy="8" r="1.5" fill="#FF5B37" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-cocoa tracking-widest text-center font-serif uppercase">
              Choose New Password
            </h2>
            <span className="text-[8px] text-vermilion font-bold tracking-widest uppercase block mt-1.5 text-center">
              PlacePilot AI
            </span>
          </div>

          {resetStatus === 'success' ? (
            <div className="space-y-6">
              <div className="bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 text-xs rounded-[1.2rem] p-3.5 flex items-start gap-2.5">
                <svg className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-left">{resetMsg}</span>
              </div>
              <button
                onClick={() => {
                  setResetToken(null);
                  setResetStatus('idle');
                  setNewPassword('');
                }}
                className="w-full bg-vermilion hover:bg-vermilion/90 text-cocoa font-bold text-xs py-3.5 rounded-[1.2rem] shadow-lg shadow-vermilion/15 hover:shadow-vermilion/25 transition-all uppercase tracking-widest"
              >
                Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {resetStatus === 'error' && (
                <div className="bg-vermilion/5 border border-vermilion/15 text-vermilion text-xs rounded-[1.2rem] p-3.5 flex items-start gap-2.5">
                  <svg className="w-4.5 h-4.5 text-vermilion shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-left">{resetMsg}</span>
                </div>
              )}
              
              <div>
                <label className="block text-[9px] font-bold text-cocoa/60 mb-1.5 uppercase tracking-widest">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cocoa/45">
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-sand border border-cocoa/10 text-cocoa placeholder-white/20 text-sm rounded-[1.2rem] pl-10 pr-4 py-2.5 focus:border-vermilion focus:ring-1 focus:ring-vermilion outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetStatus === 'loading'}
                className="w-full bg-vermilion hover:bg-vermilion/90 text-cocoa font-bold text-xs py-3.5 rounded-[1.2rem] shadow-lg shadow-vermilion/15 hover:shadow-vermilion/25 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                {resetStatus === 'loading' ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Reset Password</span>
                    <Sparkles className="w-3.5 h-3.5 text-cocoa" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!user) {
    return <LandingPage />;
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
    <div className="min-h-screen bg-sand bg-dot-grid-dark flex flex-col text-cocoa transition-colors duration-200 relative overflow-hidden font-sans">
      {/* 3D Dissolving Ambient Blobs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Blob 1: Crimson Accent */}
        <div className="absolute top-[5%] left-[-5%] w-[550px] h-[550px] rounded-full bg-vermilion/5 dark:bg-vermilion/5 blur-[130px] animate-blob" />
        {/* Blob 2: Ambient Dark glow */}
        <div className="absolute top-[35%] right-[-5%] w-[650px] h-[650px] rounded-full bg-vermilion/3 dark:bg-vermilion/3 blur-[150px] animate-blob animation-delay-2000" />
        {/* Blob 3: Crimson Accent */}
        <div className="absolute bottom-[-5%] left-[20%] w-[500px] h-[500px] rounded-full bg-vermilion/4 dark:bg-vermilion/4 blur-[120px] animate-blob animation-delay-4000" />
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
