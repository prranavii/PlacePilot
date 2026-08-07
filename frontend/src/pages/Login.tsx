import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Sparkles, Mail, Lock, User, AlertCircle, X } from 'lucide-react';

interface LoginProps {
  onClose?: () => void;
  initialIsRegister?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onClose, initialIsRegister = false }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(initialIsRegister);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      if (isForgot) {
        await api.auth.forgotPassword(email);
        setSuccessMessage('If this email is registered, a password reset link has been sent. Please check your inbox.');
      } else if (isRegister) {
        await register({ email, password, full_name: fullName });
        setSuccessMessage('Account created successfully! A verification link has been sent to your email address.');
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
    <div className="w-full max-w-md bg-white border border-cocoa/10 rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl relative z-10">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-[1.2rem] text-cocoa/60 hover:bg-cocoa/5 hover:text-cocoa transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-[1.2rem] bg-sand border border-cocoa/10 flex items-center justify-center text-cocoa shadow-lg shadow-vermilion/15 mb-4 animate-pulse-subtle">
          <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 fill-none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 8.5,21 L 11.5,14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 12,13 L 15.5,5 L 17,7" stroke="#FF5B37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 15.5,5 L 18.5,8" stroke="#FF5B37" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 12,13 C 14.8,13 17,10.8 17,8 C 17,5.2 14.8,3 12,3" stroke="currentColor" strokeWidth="2" strokeDasharray="0.5 2.5" strokeLinecap="round" />
            <path d="M 12,3 C 9.2,3 7,5.2 7,8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1.5" fill="#FF5B37" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-cocoa tracking-widest text-center font-serif uppercase">
          {isForgot ? 'Reset Password' : (isRegister ? 'Create Account' : 'Sign In')}
        </h2>
        <span className="text-[8px] text-vermilion font-bold tracking-widest uppercase block mt-1.5 text-center">
          PlacePilot AI
        </span>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6 bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 text-xs rounded-[1.2rem] p-3.5 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-vermilion/5 border border-vermilion/15 text-vermilion text-xs rounded-[1.2rem] p-3.5 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-vermilion shrink-0 mt-0.5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {isRegister && !isForgot && (
          <div>
            <label className="block text-[9px] font-bold text-cocoa/60 mb-1.5 uppercase tracking-widest">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cocoa/45">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-sand border border-cocoa/10 text-cocoa placeholder-cocoa/30 text-sm rounded-[1.2rem] pl-10 pr-4 py-2.5 focus:border-vermilion focus:ring-1 focus:ring-vermilion outline-none transition-all"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[9px] font-bold text-cocoa/60 mb-1.5 uppercase tracking-widest">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cocoa/45">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-sand border border-cocoa/10 text-cocoa placeholder-cocoa/30 text-sm rounded-[1.2rem] pl-10 pr-4 py-2.5 focus:border-vermilion focus:ring-1 focus:ring-vermilion outline-none transition-all"
            />
          </div>
        </div>

        {!isForgot && (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[9px] font-bold text-cocoa/60 uppercase tracking-widest">
                Password
              </label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgot(true);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[9px] text-cocoa/50 hover:text-vermilion transition-colors font-bold uppercase tracking-widest outline-none"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cocoa/45">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-sand border border-cocoa/10 text-cocoa placeholder-cocoa/30 text-sm rounded-[1.2rem] pl-10 pr-4 py-2.5 focus:border-vermilion focus:ring-1 focus:ring-vermilion outline-none transition-all"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-vermilion hover:bg-vermilion/90 text-white font-bold text-xs py-3.5 rounded-[1.2rem] shadow-lg shadow-vermilion/15 hover:shadow-vermilion/25 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
        >
          {submitting ? (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{isForgot ? 'Send Reset Link' : (isRegister ? 'Create Account' : 'Sign In')}</span>
              <Sparkles className="w-3.5 h-3.5 text-cocoa" />
            </>
          )}
        </button>
      </form>

      {/* Toggle Mode Footer */}
      <div className="text-center mt-6 pt-6 border-t border-cocoa/10">
        <button
          type="button"
          onClick={() => {
            if (isForgot) {
              setIsForgot(false);
            } else {
              setIsRegister(!isRegister);
            }
            setError(null);
            setSuccessMessage(null);
          }}
          className="text-xs text-vermilion hover:text-vermilion/80 font-bold tracking-wider"
        >
          {isForgot 
            ? 'Back to Sign In' 
            : (isRegister 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up")}
        </button>
      </div>
    </div>
  );

  if (onClose) {
    return cardContent;
  }

  return (
    <div className="min-h-screen bg-sand bg-dot-grid-dark flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-vermilion/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-vermilion/3 rounded-full blur-[120px] pointer-events-none" />
      {cardContent}
    </div>
  );
};
