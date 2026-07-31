import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, AlertCircle, X } from 'lucide-react';

interface LoginProps {
  onClose?: () => void;
  initialIsRegister?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onClose, initialIsRegister = false }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(initialIsRegister);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isRegister) {
        await register({ email, password, full_name: fullName });
      } else {
        await login({ email, password });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const cardContent = (
    <div className="w-full max-w-md bg-white/70 border border-life-cocoa/5 rounded-2xl p-8 shadow-xl backdrop-blur-md relative z-10 dark:bg-zinc-900/85 dark:border-white/5">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-life-cocoa/40 hover:bg-life-cocoa/5 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-life-vermilion flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-life-vermilion/20 mb-3 animate-pulse-subtle font-geom">
          P
        </div>
        <h2 className="text-2xl font-extrabold text-life-cocoa dark:text-white tracking-tight text-center font-geom">
          Welcome to PlacePilot AI
        </h2>
        <p className="text-xs text-life-cocoa/50 mt-1.5 text-center dark:text-zinc-400">
          {isRegister 
            ? 'Create an account to begin managing your placement lifecycle' 
            : 'Log in to access your placement intelligence command center'}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-life-vermilion/5 border border-life-vermilion/15 text-life-vermilion text-xs rounded-xl p-3 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-life-vermilion shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="block text-xs font-semibold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-life-cocoa/40">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-life-sand border border-life-cocoa/10 text-life-cocoa placeholder-life-cocoa/30 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-life-vermilion focus:ring-1 focus:ring-life-vermilion outline-none transition-all dark:bg-zinc-900 dark:border-white/5 dark:text-white"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-life-cocoa/40">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-life-sand border border-life-cocoa/10 text-life-cocoa placeholder-life-cocoa/30 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-life-vermilion focus:ring-1 focus:ring-life-vermilion outline-none transition-all dark:bg-zinc-900 dark:border-white/5 dark:text-white"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-life-cocoa/50 uppercase tracking-wider dark:text-zinc-400">
              Password
            </label>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-life-cocoa/40">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-life-sand border border-life-cocoa/10 text-life-cocoa placeholder-life-cocoa/30 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-life-vermilion focus:ring-1 focus:ring-life-vermilion outline-none transition-all dark:bg-zinc-900 dark:border-white/5 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-life-vermilion hover:bg-life-vermilion/90 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-life-vermilion/15 hover:shadow-life-vermilion/20 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
              <Sparkles className="w-4 h-4 text-white" />
            </>
          )}
        </button>
      </form>

      {/* Toggle Mode Footer */}
      <div className="text-center mt-6 pt-6 border-t border-life-cocoa/10 dark:border-slate-800/60">
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError(null);
          }}
          className="text-xs text-life-vermilion hover:text-life-vermilion/90 font-bold"
        >
          {isRegister 
            ? 'Already have an account? Sign in' 
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );

  if (onClose) {
    return cardContent;
  }

  return (
    <div className="min-h-screen bg-life-sand dark:bg-[#18110F] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative blurry background circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-life-vermilion/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-life-cocoa/5 rounded-full blur-[120px] pointer-events-none" />
      {cardContent}
    </div>
  );
};
