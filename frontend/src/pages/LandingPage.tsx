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
    <div className="min-h-screen bg-life-sand text-life-cocoa dark:bg-[#18110F] dark:text-zinc-100 font-sans relative overflow-x-hidden transition-colors duration-200">
      
      {/* Ambient background blur blobs */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-life-vermilion/5 dark:bg-life-vermilion/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-life-cocoa/5 dark:bg-life-cocoa/5 blur-[150px] pointer-events-none z-0" />

      {/* 1. Header/Navigation Bar */}
      <header className="sticky top-0 z-30 bg-life-sand/80 dark:bg-[#18110F]/80 backdrop-blur-md border-b border-life-cocoa/5 dark:border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-life-vermilion flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-life-vermilion/10 font-geom">
              P
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider uppercase block font-geom">PlacePilot</span>
              <span className="text-[9px] text-life-cocoa/40 uppercase font-bold tracking-widest block dark:text-zinc-500">Placement AI</span>
            </div>
          </div>

          {/* Nav anchors */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-life-cocoa/60 dark:text-zinc-400">
            <a href="#features" className="hover:text-life-vermilion transition-colors">Features</a>
            <a href="#copilot" className="hover:text-life-vermilion transition-colors">AI Studio</a>
            <a href="#matcher" className="hover:text-life-vermilion transition-colors">ATS Revision</a>
            <a href="#streak" className="hover:text-life-vermilion transition-colors">Streak Logic</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => triggerAuth(false)}
              className="text-xs font-bold uppercase tracking-wider text-life-cocoa/70 hover:text-life-vermilion transition-colors dark:text-zinc-300"
            >
              Sign In
            </button>
            <button 
              onClick={() => triggerAuth(true)}
              className="bg-life-vermilion hover:bg-life-vermilion/90 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-life-vermilion/10 transition-all active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 flex flex-col lg:flex-row items-center gap-12 z-10">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-life-vermilion/10 border border-life-vermilion/20 px-3.5 py-1 rounded-full text-life-vermilion text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 fill-life-vermilion/10 animate-pulse" />
            AI-Powered Career Engine
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-life-cocoa dark:text-white leading-tight font-geom">
            Navigating Your <br />
            <span className="text-life-vermilion">Placement Journey</span> <br />
            With Adaptive AI.
          </h1>
          <p className="text-sm md:text-base text-life-cocoa/60 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Manage stage pipelines, check match percentages, query semantic memories, and open a dedicated audio AI mock interview command center today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button 
              onClick={() => triggerAuth(true)}
              className="w-full sm:w-auto bg-life-vermilion hover:bg-life-vermilion/90 text-white font-bold text-sm px-8 py-4 rounded-xl shadow-lg shadow-life-vermilion/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#features"
              className="w-full sm:w-auto px-8 py-4 border border-life-cocoa/10 hover:bg-life-cocoa/5 rounded-xl text-sm font-bold text-life-cocoa/80 text-center transition-all dark:border-white/5 dark:text-zinc-300 dark:hover:bg-zinc-800/40"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Hero Preview Card Mockup */}
        <div className="flex-1 w-full max-w-lg">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/70 border border-life-cocoa/10 p-6 rounded-3xl shadow-xl backdrop-blur-md relative overflow-hidden dark:bg-zinc-900/60 dark:border-white/5"
          >
            {/* Header element */}
            <div className="flex items-center justify-between pb-4 border-b border-life-cocoa/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-life-vermilion/80" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[9px] uppercase font-bold text-life-cocoa/40 dark:text-zinc-500">Live Preview</span>
            </div>

            {/* Quick prepare shortcut preview */}
            <div className="mt-6 p-4 bg-life-sand/50 border border-life-cocoa/5 rounded-2xl flex items-center justify-between dark:bg-zinc-950/20 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-life-vermilion/15 flex items-center justify-center text-life-vermilion shrink-0">
                  <Sparkles className="w-4 h-4 fill-life-vermilion/10" />
                </div>
                <div>
                  <span className="font-extrabold text-xs block">Upcoming Meta Interview</span>
                  <span className="text-[10px] text-life-cocoa/40 dark:text-zinc-500 block">Scheduled in 5 days</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-white bg-life-vermilion px-3 py-1.5 rounded-lg">Prepare</span>
            </div>

            {/* Metrics preview mini grid */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="p-3 bg-white border border-life-cocoa/5 rounded-xl text-center shadow-sm dark:bg-zinc-900 dark:border-white/5">
                <span className="text-[9px] text-life-cocoa/40 dark:text-zinc-500 block uppercase font-bold">Applications</span>
                <span className="text-base font-black text-life-cocoa block mt-1 dark:text-zinc-100 font-geom">12</span>
              </div>
              <div className="p-3 bg-white border border-life-cocoa/5 rounded-xl text-center shadow-sm dark:bg-zinc-900 dark:border-white/5">
                <span className="text-[9px] text-life-cocoa/40 dark:text-zinc-500 block uppercase font-bold">Assessments</span>
                <span className="text-base font-black text-life-vermilion block mt-1 font-geom">3</span>
              </div>
              <div className="p-3 bg-white border border-life-cocoa/5 rounded-xl text-center shadow-sm dark:bg-zinc-900 dark:border-white/5">
                <span className="text-[9px] text-life-cocoa/40 dark:text-zinc-500 block uppercase font-bold">Readiness</span>
                <span className="text-base font-black text-emerald-600 block mt-1 font-geom">80%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Features Bento Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16 border-t border-life-cocoa/5 dark:border-white/5">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight font-geom">Everything You Need to Land the Role</h2>
          <p className="text-sm text-life-cocoa/60 dark:text-zinc-400 font-medium">
            PlacePilot brings AI recruiter evaluation, semantic question logs, and layout analytics under one warm minimalist design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: AI Mock Interview Studio */}
          <div className="bg-white/70 border border-life-cocoa/5 p-6 rounded-2xl md:col-span-2 shadow-sm flex flex-col justify-between dark:bg-zinc-900/35 dark:border-white/5">
            <div className="space-y-2">
              <span className="p-2.5 rounded-xl bg-life-vermilion/10 text-life-vermilion inline-flex mb-2">
                <Brain className="w-5 h-5" />
              </span>
              <h3 className="font-extrabold text-base font-geom">Adaptive AI Interview Studio</h3>
              <p className="text-xs text-life-cocoa/60 dark:text-zinc-400 max-w-md leading-relaxed">
                Take simulated voice mock interviews based on custom job requirements. The system scores technical depth and communication with active audio waveforms.
              </p>
            </div>
            
            {/* Audio Waveform Simulator Widget */}
            <div className="mt-8 bg-life-sand/50 p-4 border border-life-cocoa/5 rounded-2xl flex items-center justify-center gap-1.5 h-16 dark:bg-zinc-950/20 dark:border-white/5">
              <span className="w-1.5 bg-life-vermilion rounded-full h-8 animate-pulse"></span>
              <span className="w-1.5 bg-life-vermilion rounded-full h-12 animate-pulse animation-delay-200"></span>
              <span className="w-1.5 bg-life-vermilion rounded-full h-6 animate-pulse animation-delay-400"></span>
              <span className="w-1.5 bg-life-vermilion rounded-full h-10 animate-pulse animation-delay-100"></span>
              <span className="w-1.5 bg-life-vermilion rounded-full h-14 animate-pulse animation-delay-300"></span>
              <span className="w-1.5 bg-life-vermilion rounded-full h-8 animate-pulse animation-delay-500"></span>
              <span className="w-1.5 bg-life-vermilion rounded-full h-12 animate-pulse animation-delay-200"></span>
              <span className="w-1.5 bg-life-vermilion rounded-full h-5 animate-pulse"></span>
            </div>
          </div>

          {/* Card 2: Bento Progress Tracking */}
          <div className="bg-white/70 border border-life-cocoa/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between dark:bg-zinc-900/35 dark:border-white/5">
            <div className="space-y-2">
              <span className="p-2.5 rounded-xl bg-life-vermilion/10 text-life-vermilion inline-flex mb-2">
                <Briefcase className="w-5 h-5" />
              </span>
              <h3 className="font-extrabold text-base font-geom">Bento Progress Dashboard</h3>
              <p className="text-xs text-life-cocoa/60 dark:text-zinc-400 leading-relaxed">
                Check active roles, interview schedules, OA assessments, and streaks at a glance.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-8">
              <div className="p-2.5 bg-life-sand border border-life-cocoa/5 rounded-xl text-center dark:bg-zinc-950/20 dark:border-white/5">
                <span className="text-[8px] text-life-cocoa/40 dark:text-zinc-500 uppercase block font-bold">Offers</span>
                <span className="text-sm font-black text-emerald-600 block mt-0.5">2</span>
              </div>
              <div className="p-2.5 bg-life-sand border border-life-cocoa/5 rounded-xl text-center dark:bg-zinc-950/20 dark:border-white/5">
                <span className="text-[8px] text-life-cocoa/40 dark:text-zinc-500 uppercase block font-bold">Active OAs</span>
                <span className="text-sm font-black text-life-vermilion block mt-0.5">3</span>
              </div>
            </div>
          </div>

          {/* Card 3: ATS Resume Matcher */}
          <div id="matcher" className="bg-white/70 border border-life-cocoa/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between dark:bg-zinc-900/35 dark:border-white/5">
            <div className="space-y-2">
              <span className="p-2.5 rounded-xl bg-life-vermilion/10 text-life-vermilion inline-flex mb-2">
                <FileText className="w-5 h-5" />
              </span>
              <h3 className="font-extrabold text-base font-geom">ATS Match Engine</h3>
              <p className="text-xs text-life-cocoa/60 dark:text-zinc-400 leading-relaxed">
                Upload your resume and parse it against job descriptions instantly to find missing keyword tags.
              </p>
            </div>
            
            <div className="mt-8 p-3 bg-life-sand border border-life-cocoa/5 rounded-2xl text-center dark:bg-zinc-955/20 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold">ATS Score:</span>
              <span className="text-xs font-black text-life-vermilion font-geom">85% Match</span>
            </div>
          </div>

          {/* Card 4: Recruiter Narratives */}
          <div id="copilot" className="bg-white/70 border border-life-cocoa/5 p-6 rounded-2xl md:col-span-2 shadow-sm flex flex-col justify-between dark:bg-zinc-900/35 dark:border-white/5">
            <div className="space-y-2">
              <span className="p-2.5 rounded-xl bg-life-vermilion/10 text-life-vermilion inline-flex mb-2">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h3 className="font-extrabold text-base font-geom">AI Recruiter Weekly Reports</h3>
              <p className="text-xs text-life-cocoa/60 dark:text-zinc-400 max-w-md leading-relaxed">
                Get an automated, compiled weekly checklist and text critique from our AI Recruiter summarizing gap areas and study task priority targets.
              </p>
            </div>

            <div className="mt-8 space-y-2">
              <div className="flex items-center gap-2 text-xs text-life-cocoa/80 dark:text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-life-vermilion" />
                <span>Fix graph cycles (DFS Cycle Detection) gap</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-life-cocoa/80 dark:text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-life-vermilion" />
                <span>Prep 2 mock rounds for Meta technicals</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Secondary CTA Callout */}
      <section id="streak" className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
        <div className="bg-life-vermilion/5 border border-life-vermilion/10 rounded-3xl p-12 space-y-6 max-w-3xl mx-auto">
          <Flame className="w-10 h-10 text-life-vermilion fill-life-vermilion/10 mx-auto animate-bounce" />
          <h2 className="text-3xl font-extrabold font-geom">Ready to Take Control?</h2>
          <p className="text-sm text-life-cocoa/70 dark:text-zinc-400 max-w-md mx-auto font-medium leading-relaxed">
            Begin logging your interviews, solving DSA gap topics, and matching your resume vectors with PlacePilot today.
          </p>
          <button 
            onClick={() => triggerAuth(true)}
            className="bg-life-vermilion hover:bg-life-vermilion/90 text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-lg shadow-life-vermilion/25 inline-flex items-center gap-2 transition-all active:scale-95"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-life-cocoa/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-life-cocoa/40 uppercase font-bold tracking-widest dark:text-zinc-550">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-life-vermilion" />
          <span>PlacePilot AI Copilot © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-life-vermilion">Privacy</a>
          <a href="#" className="hover:text-life-vermilion">Terms</a>
          <a href="#" className="hover:text-life-vermilion">API Console</a>
        </div>
      </footer>

      {/* Modal Dialog Overlay for Sign In / Registration */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
