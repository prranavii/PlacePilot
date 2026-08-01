import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
   Sparkles, 
   Briefcase, 
   ArrowRight, 
   Brain, 
   Flame, 
   FileText, 
   GraduationCap 
} from 'lucide-react';
import { Login } from './Login';

export const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const triggerAuth = (register: boolean) => {
    setIsRegisterMode(register);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-obsidian text-white font-sans relative overflow-x-hidden transition-colors duration-200 bg-dot-grid-dark">
      
      {/* Ambient background blur blobs */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-crimson/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-crimson/3 blur-[150px] pointer-events-none z-0" />

      {/* 1. Header/Navigation Bar */}
      <header className="sticky top-0 z-30 bg-obsidian/80 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white shadow-md shadow-crimson/15 border border-white/5">
              <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 fill-none" xmlns="http://www.w3.org/2000/svg">
                {/* Upward Trajectory Arrow Stem */}
                <path d="M 8.5,21 L 11.5,14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 12,13 L 15.5,5 L 17,7" stroke="#FF1E27" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 15.5,5 L 18.5,8" stroke="#FF1E27" strokeWidth="2.5" strokeLinecap="round" />
                {/* Loop Compass Sweep */}
                <path d="M 12,13 C 14.8,13 17,10.8 17,8 C 17,5.2 14.8,3 12,3" stroke="currentColor" strokeWidth="2" strokeDasharray="0.5 2.5" strokeLinecap="round" />
                <path d="M 12,3 C 9.2,3 7,5.2 7,8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                {/* AI Node Center */}
                <circle cx="12" cy="8" r="1.5" fill="#FF1E27" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm tracking-widest uppercase block font-wide text-white">PLACEPILOT</span>
              <span className="text-[8px] text-crimson font-bold tracking-widest block uppercase mt-0.5">Placement AI</span>
            </div>
          </div>

          {/* Nav anchors */}
          <nav className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <a href="#features" className="hover:text-crimson transition-colors">Features</a>
            <a href="#copilot" className="hover:text-crimson transition-colors">AI Studio</a>
            <a href="#matcher" className="hover:text-crimson transition-colors">ATS Revision</a>
            <a href="#streak" className="hover:text-crimson transition-colors">Streak Logic</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => triggerAuth(false)}
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 hover:text-crimson transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => triggerAuth(true)}
              className="bg-white hover:bg-white/90 text-obsidian font-bold text-[10px] px-5 py-2.5 rounded-full shadow-md transition-all active:scale-95 uppercase tracking-widest"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-28 md:pb-36 flex flex-col lg:flex-row items-center gap-16 z-10">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-crimson/10 border border-crimson/25 px-3.5 py-1.5 rounded-full text-crimson text-[9px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 fill-crimson/10 animate-pulse" />
            AI-Powered Career Engine
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight font-geom tracking-widest uppercase">
            PREPARATION.<br />
            <span className="text-crimson">INTO PLACEMENT.</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-450 max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold uppercase tracking-wider">
            PlacePilot is a concept platform created for modern placement cycles. 
            We analyze, prepare, and match experiences that capture attention and drive results.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button 
              onClick={() => triggerAuth(true)}
              className="w-full sm:w-auto bg-crimson hover:bg-crimson/90 text-white font-bold text-xs px-8 py-4 rounded-full shadow-lg shadow-crimson/20 flex items-center justify-center gap-2 transition-all active:scale-95 uppercase tracking-widest"
            >
              <span>Explore Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#features"
              className="w-full sm:w-auto px-8 py-4 border border-white/10 hover:bg-white/5 rounded-full text-xs font-bold text-zinc-300 text-center transition-all uppercase tracking-widest"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Hero Preview Card Mockup - Editorial Portrait Shape */}
        <div className="flex-1 w-full max-w-md relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-crimson/20 to-transparent blur-2xl rounded-full opacity-40 z-0"></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="premium-card p-6 rounded-3xl relative z-10 flex flex-col justify-between shadow-2xl overflow-hidden aspect-[4/5] border border-white/10 bg-zinc-950/80"
          >
            {/* Background cinematic vignette shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-0"></div>

            {/* Top info row */}
            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-crimson" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              </div>
              <span className="text-[8px] tracking-widest uppercase font-bold text-zinc-500">Live Preview</span>
            </div>

            {/* Center abstract layout graphic representing the model portrait */}
            <div className="relative z-10 my-8 flex-1 flex flex-col justify-center items-center">
              <div className="w-32 h-32 rounded-full border border-crimson/30 flex items-center justify-center relative bg-gradient-to-br from-crimson/10 to-transparent">
                <Sparkles className="w-8 h-8 text-crimson animate-pulse" />
                {/* Orbit path lines */}
                <div className="absolute inset-0 border border-dashed border-white/10 rounded-full animate-spin [animation-duration:15s]"></div>
              </div>
              <span className="text-[10px] font-geom font-bold tracking-widest text-white uppercase mt-5">Orchestrator Node</span>
              <span className="text-[8px] font-bold tracking-wider text-crimson uppercase mt-1">Adaptive preparation Active</span>
            </div>

            {/* Bottom mini stats widgets */}
            <div className="relative z-10 grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/5">
              <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl text-center">
                <span className="text-[8px] text-zinc-550 block uppercase font-bold tracking-wider">Active OAs</span>
                <span className="text-base font-black text-crimson block mt-1 font-geom">3</span>
              </div>
              <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl text-center">
                <span className="text-[8px] text-zinc-550 block uppercase font-bold tracking-wider">Readiness</span>
                <span className="text-base font-black text-white block mt-1 font-geom">85%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Features Bento Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center max-w-xl mx-auto mb-20 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-widest font-geom uppercase">Everything You Need to Land the Role</h2>
          <p className="text-xs text-zinc-450 font-bold uppercase tracking-wider">
            PlacePilot brings AI recruiter evaluation, semantic question logs, and layout analytics under one dark cinematic design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: AI Mock Interview Studio */}
          <div className="premium-card p-8 md:col-span-2 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3">
              <span className="p-2.5 rounded-xl bg-crimson/10 text-crimson inline-flex mb-2">
                <Brain className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-sm font-geom tracking-widest uppercase text-white">Adaptive AI Interview Studio</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                Take simulated voice mock interviews based on custom job requirements. The system scores technical depth and communication with active audio waveforms.
              </p>
            </div>
            
            {/* Audio Waveform Simulator Widget */}
            <div className="mt-8 bg-zinc-900/60 p-4 border border-white/5 rounded-2xl flex items-end justify-center gap-1.5 h-16">
              <span className="w-1 bg-crimson rounded-full h-8 waveform-bar"></span>
              <span className="w-1 bg-crimson rounded-full h-12 waveform-bar"></span>
              <span className="w-1 bg-crimson rounded-full h-6 waveform-bar"></span>
              <span className="w-1 bg-crimson rounded-full h-10 waveform-bar"></span>
              <span className="w-1 bg-crimson rounded-full h-14 waveform-bar"></span>
              <span className="w-1 bg-crimson rounded-full h-8 waveform-bar"></span>
              <span className="w-1 bg-crimson rounded-full h-12 waveform-bar"></span>
              <span className="w-1 bg-crimson rounded-full h-5 waveform-bar"></span>
            </div>
          </div>

          {/* Card 2: Bento Progress Tracking */}
          <div className="premium-card p-8 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3">
              <span className="p-2.5 rounded-xl bg-crimson/10 text-crimson inline-flex mb-2">
                <Briefcase className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-sm font-geom tracking-widest uppercase text-white">Bento Progress Dashboard</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                Check active roles, interview schedules, OA assessments, and streaks at a glance.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-8">
              <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl text-center">
                <span className="text-[8px] text-zinc-550 uppercase block font-bold tracking-wider">Offers</span>
                <span className="text-base font-black text-white block mt-1 font-geom">2</span>
              </div>
              <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl text-center">
                <span className="text-[8px] text-zinc-550 uppercase block font-bold tracking-wider">Active OAs</span>
                <span className="text-base font-black text-crimson block mt-1 font-geom">3</span>
              </div>
            </div>
          </div>

          {/* Card 3: ATS Resume Matcher */}
          <div id="matcher" className="premium-card p-8 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3">
              <span className="p-2.5 rounded-xl bg-crimson/10 text-crimson inline-flex mb-2">
                <FileText className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-sm font-geom tracking-widest uppercase text-white">ATS Match Engine</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                Upload your resume and parse it against job descriptions instantly to find missing keyword tags.
              </p>
            </div>
            
            <div className="mt-8 p-4 bg-zinc-900/60 border border-white/5 rounded-xl text-center flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">ATS Score:</span>
              <span className="text-xs font-black text-crimson font-geom tracking-wider">85% Match</span>
            </div>
          </div>

          {/* Card 4: Recruiter Narratives */}
          <div id="copilot" className="premium-card p-8 md:col-span-2 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3">
              <span className="p-2.5 rounded-xl bg-crimson/10 text-crimson inline-flex mb-2">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-sm font-geom tracking-widest uppercase text-white">AI Recruiter Weekly Reports</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                Get an automated, compiled weekly checklist and text critique from our AI Recruiter summarizing gap areas and study task priority targets.
              </p>
            </div>

            <div className="mt-8 space-y-2">
              <div className="flex items-center gap-2.5 text-xs text-zinc-300 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-crimson" />
                <span>Fix graph cycles (DFS Cycle Detection) gap</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-300 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-crimson" />
                <span>Prep 2 mock rounds for Meta technicals</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Secondary CTA Callout */}
      <section id="streak" className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
        <div className="bg-crimson/5 border border-white/5 rounded-3xl p-12 space-y-6 max-w-3xl mx-auto">
          <Flame className="w-8 h-8 text-crimson fill-crimson/10 mx-auto animate-bounce" />
          <h2 className="text-2xl md:text-3xl font-bold font-geom tracking-widest uppercase">Ready to Take Control?</h2>
          <p className="text-xs text-zinc-450 max-w-md mx-auto font-bold uppercase tracking-wider leading-relaxed">
            Begin logging your interviews, solving DSA gap topics, and matching your resume vectors with PlacePilot today.
          </p>
          <button 
            onClick={() => triggerAuth(true)}
            className="bg-white hover:bg-white/90 text-obsidian font-bold text-[10px] px-8 py-4 rounded-full shadow-lg transition-all active:scale-95 uppercase tracking-widest"
          >
            <span>Create Free Account</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[9px] text-zinc-500 uppercase font-bold tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-crimson" />
          <span>PlacePilot AI Copilot © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-crimson">Privacy</a>
          <a href="#" className="hover:text-crimson">Terms</a>
          <a href="#" className="hover:text-crimson">API Console</a>
        </div>
      </footer>

      {/* Modal Dialog Overlay for Sign In / Registration */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md"
            >
              <Login 
                onClose={() => setShowAuthModal(false)} 
                initialIsRegister={isRegisterMode} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
