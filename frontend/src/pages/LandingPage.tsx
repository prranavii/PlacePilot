import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
   Sparkles, 
   Briefcase, 
   ArrowRight, 
   Brain, 
   Flame, 
   FileText, 
   GraduationCap,
   ChevronRight
} from 'lucide-react';
import { Login } from './Login';

export const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const triggerAuth = (register: boolean) => {
    setIsRegisterMode(register);
    setShowAuthModal(true);
  };

  const steps = [
    {
      no: '01',
      title: 'Discover',
      short: 'Resume & Gap Analysis',
      details: ['ATS Match Engine parsing', 'Evaluation against real descriptions', 'Gap areas identifying']
    },
    {
      no: '02',
      title: 'Define',
      short: 'Preparation Blueprint',
      details: ['Custom DSA checklists', 'Interview question banks', 'Structured streak targets']
    },
    {
      no: '03',
      title: 'Develop',
      short: 'Adaptive Interviewing',
      details: ['AI Voice Mock Interviews', 'Depth & tone evaluation', 'Active speech waveforms']
    },
    {
      no: '04',
      title: 'Deliver',
      short: 'Career Tracking',
      details: ['Bento applications board', 'Recruiter weekly logs', 'Progress narrative summaries']
    }
  ];

  const quotes = [
    {
      text: "The mock interview studio analyzed my DFS graph cycle depth. I cleared the Amazon OA easily.",
      author: "Yasswant",
      avatar: "👨‍💻"
    },
    {
      text: "Having a bento board made tracking 40+ active applications simple instead of chaotic.",
      author: "Yash Rana",
      avatar: "👨‍💼"
    },
    {
      text: "I matched my resume against the Google L4 spec and filled 3 missing keyword tags.",
      author: "Shaurya",
      avatar: "🧑‍💻"
    },
    {
      text: "The weekly AI recruiter report flagged my system design weakness. Saved me.",
      author: "Parth",
      avatar: "🤵"
    }
  ];

  return (
    <div className="min-h-screen bg-sand text-cocoa font-sans relative overflow-x-hidden transition-colors duration-200">
      
      {/* 1. Header/Navigation Bar */}
      <header className="sticky top-0 z-30 bg-sand/80 backdrop-blur-md border-b border-cocoa/10 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cocoa flex items-center justify-center text-white shadow-md shadow-vermilion/15 border border-white/5">
              <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 fill-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 8.5,21 L 11.5,14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 12,13 L 15.5,5 L 17,7" stroke="#FF5B37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 15.5,5 L 18.5,8" stroke="#FF5B37" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 12,13 C 14.8,13 17,10.8 17,8 C 17,5.2 14.8,3 12,3" stroke="currentColor" strokeWidth="2" strokeDasharray="0.5 2.5" strokeLinecap="round" />
                <path d="M 12,3 C 9.2,3 7,5.2 7,8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="12" cy="8" r="1.5" fill="#FF5B37" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm tracking-widest uppercase block font-serif text-cocoa">PLACEPILOT</span>
              <span className="text-[8px] text-vermilion font-bold tracking-widest block uppercase mt-0.5">Placement AI</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-cocoa/60">
            <a href="#process" className="hover:text-vermilion transition-colors">Our Process</a>
            <a href="#features" className="hover:text-vermilion transition-colors">Features</a>
            <a href="#quotes" className="hover:text-vermilion transition-colors">Reviews</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => triggerAuth(false)}
              className="text-[10px] font-bold uppercase tracking-widest text-cocoa/80 hover:text-vermilion transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => triggerAuth(true)}
              className="bg-cocoa hover:bg-cocoa/90 text-white font-bold text-[10px] px-5 py-2.5 rounded-full shadow-md transition-all active:scale-95 uppercase tracking-widest"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-28 md:pb-36 flex flex-col lg:flex-row items-center gap-16 z-10">
        
        {/* Large Architectural Background Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none">
          <span className="text-[12rem] md:text-[22rem] font-serif font-bold text-cocoa/[0.03] leading-none select-none">
            PILOT
          </span>
        </div>

        <div className="flex-1 space-y-6 text-center lg:text-left relative z-10">
          <div className="inline-flex items-center gap-2 bg-vermilion/10 border border-vermilion/25 px-3.5 py-1.5 rounded-full text-vermilion text-[9px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 fill-vermilion/10 animate-pulse" />
            AI Placement Command Center
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-cocoa leading-none font-serif tracking-tight">
            Preparation <br />
            <span className="text-vermilion font-normal italic">into Placement.</span>
          </h1>
          <p className="text-xs sm:text-sm text-cocoa/60 max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold uppercase tracking-wider">
            An adaptive preparation cockpit to track application processes, run smart vector resume parsing, and record mock feedback.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button 
              onClick={() => triggerAuth(true)}
              className="w-full sm:w-auto bg-vermilion hover:bg-vermilion/90 text-white font-bold text-xs px-8 py-4 rounded-full shadow-lg shadow-vermilion/20 flex items-center justify-center gap-2 transition-all active:scale-95 uppercase tracking-widest"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#process"
              className="w-full sm:w-auto px-8 py-4 border border-cocoa/10 hover:bg-cocoa/5 rounded-full text-xs font-bold text-cocoa/80 text-center transition-all uppercase tracking-widest"
            >
              Learn Design Process
            </a>
          </div>
        </div>

        {/* Device mockup frame with bento widgets inside */}
        <div className="flex-1 w-full max-w-md relative flex justify-center z-10">
          <div className="w-[280px] h-[540px] border-[10px] border-cocoa rounded-[3rem] bg-sand shadow-2xl relative p-4 flex flex-col justify-between overflow-hidden">
            {/* Speaker bar */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-cocoa rounded-full" />
            
            {/* Phone Screen Mock Content */}
            <div className="flex items-center justify-between mt-4">
              <span className="font-serif font-bold text-lg text-cocoa">℘</span>
              <span className="text-[7px] font-bold tracking-widest uppercase text-cocoa/40">100% Prepared</span>
            </div>

            {/* Quote Bubble Mock */}
            <div className="bg-white border border-cocoa/5 p-4 rounded-[1.5rem] shadow-sm space-y-2 mt-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-vermilion/10 text-vermilion flex items-center justify-center text-[10px]">🧑‍💻</span>
                <div>
                  <h4 className="text-[9px] font-bold text-cocoa">Got an Assignment?</h4>
                  <p className="text-[7px] text-cocoa/40">Group task review active</p>
                </div>
              </div>
              <p className="text-[8px] leading-normal text-cocoa/60 italic">
                "Make sure to evaluate system cycle paths before compiling."
              </p>
            </div>

            {/* Dashboard stats bento card block */}
            <div className="grid grid-cols-2 gap-2.5 my-auto">
              <div className="p-3 bg-[#FFE5CE] border border-[#FFD2AE] rounded-[1.5rem]">
                <span className="text-[7px] text-[#7A3C09] font-bold uppercase tracking-wider block">Streaks</span>
                <span className="text-xl font-bold text-[#7A3C09] font-serif block mt-0.5">04 Days</span>
              </div>
              <div className="p-3 bg-[#E2F5D7] border border-[#CDEEB7] rounded-[1.5rem]">
                <span className="text-[7px] text-[#335A21] font-bold uppercase tracking-wider block">OAs Logged</span>
                <span className="text-xl font-bold text-[#335A21] font-serif block mt-0.5">06 Active</span>
              </div>
            </div>

            {/* Bottom floating button inside mockup */}
            <div className="bg-cocoa text-white text-[9px] font-bold uppercase tracking-widest p-3 rounded-full text-center shadow-lg shadow-cocoa/10 flex items-center justify-center gap-1.5 mt-auto">
              <span>Enter Workspace</span>
              <ArrowRight className="w-3 h-3 text-vermilion" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Design Process interactive Section (from images 2 & 3) */}
      <section id="process" className="max-w-7xl mx-auto px-6 py-24 border-t border-cocoa/10">
        <div className="max-w-xl mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-vermilion block mb-2">/ DESIGN PROCESS</span>
          <h2 className="text-3xl font-serif font-bold text-cocoa">Transforming Chaos into Preparation</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* List items */}
          <div className="flex-1 w-full space-y-4">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div 
                  key={step.title}
                  onMouseEnter={() => setActiveStep(idx)}
                  className={`p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                    isActive 
                      ? 'bg-white border-cocoa/10 shadow-[0_4px_30px_rgba(46,26,22,0.02)] translate-x-2' 
                      : 'bg-transparent border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-bold text-vermilion tracking-widest">{step.no}</span>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-cocoa">{step.title}</h3>
                      <p className="text-xs text-cocoa/60 mt-0.5">{step.short}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-vermilion transition-transform duration-300 ${isActive ? 'rotate-90' : ''}`} />
                </div>
              );
            })}
          </div>

          {/* Details card right */}
          <div className="flex-1 w-full lg:sticky lg:top-32">
            <div className="bento-panel-dark p-8 min-h-[300px] flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[10px] text-vermilion font-bold tracking-widest uppercase">
                  {steps[activeStep].no} / {steps[activeStep].title}
                </span>
                <h3 className="text-2xl font-serif font-bold text-white">
                  {steps[activeStep].short}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed font-semibold uppercase tracking-wider">
                  The design process maps key candidate workflows:
                </p>
              </div>

              <div className="space-y-3.5 mt-8 border-t border-cocoa/10 pt-6">
                {steps[activeStep].details.map((detail, index) => (
                  <div key={index} className="flex items-center gap-3 text-white text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-vermilion" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Affinity Mapping Grid (Candidate quotes from image 4) */}
      <section id="quotes" className="bg-[#EFECE6]/50 py-24 border-t border-b border-cocoa/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <span className="text-[9px] text-vermilion font-bold tracking-widest block uppercase">/ CANDIDATE FEEDBACK</span>
            <h2 className="text-3xl font-serif font-bold text-cocoa">Affinity Mapping & Reviews</h2>
            <p className="text-xs text-cocoa/60 font-bold uppercase tracking-wider">
              Feedback from students tracking OAs, assignments, and interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quotes.map((q, idx) => (
              <div key={idx} className="bg-white border border-cocoa/5 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <p className="text-xs text-cocoa/75 italic leading-relaxed">
                  "{q.text}"
                </p>
                <div className="flex items-center gap-3 mt-6 border-t border-cocoa/5 pt-4">
                  <span className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-sm shadow-sm">{q.avatar}</span>
                  <div>
                    <h4 className="text-xs font-bold text-cocoa">{q.author}</h4>
                    <p className="text-[8px] text-cocoa/40 font-bold uppercase tracking-wider">Student Candidate</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl font-serif font-bold text-cocoa">Everything You Need to Match the Spec</h2>
          <p className="text-xs text-cocoa/60 font-bold uppercase tracking-wider">
            We bring evaluations, semantic question banks, and progress analytics under one beautiful workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: AI Mock Interview Studio */}
          <div className="bento-panel md:col-span-2 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3">
              <span className="p-2.5 rounded-[1.2rem] bg-vermilion/10 text-vermilion inline-flex mb-2">
                <Brain className="w-5 h-5" />
              </span>
              <h3 className="font-serif font-bold text-xl text-cocoa">Adaptive AI Interview Studio</h3>
              <p className="text-xs text-cocoa/60 leading-relaxed font-semibold">
                Engage in simulated voice interview practice custom-scoped to job descriptions. Check technical depth grading and active communication waveforms.
              </p>
            </div>
            
            {/* Audio Waveform Simulator Widget */}
            <div className="mt-8 bg-cocoa/5 p-4 border border-cocoa/10 rounded-[1.5rem] flex items-end justify-center gap-1.5 h-16">
              <span className="w-1 rounded-full h-8 waveform-bar"></span>
              <span className="w-1 rounded-full h-12 waveform-bar"></span>
              <span className="w-1 rounded-full h-6 waveform-bar"></span>
              <span className="w-1 rounded-full h-10 waveform-bar"></span>
              <span className="w-1 rounded-full h-14 waveform-bar"></span>
              <span className="w-1 rounded-full h-8 waveform-bar"></span>
              <span className="w-1 rounded-full h-12 waveform-bar"></span>
              <span className="w-1 rounded-full h-5 waveform-bar"></span>
            </div>
          </div>

          {/* Card 2: Bento Progress Tracking */}
          <div className="bento-panel flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3">
              <span className="p-2.5 rounded-[1.2rem] bg-vermilion/10 text-vermilion inline-flex mb-2">
                <Briefcase className="w-5 h-5" />
              </span>
              <h3 className="font-serif font-bold text-xl text-cocoa">Bento Progress</h3>
              <p className="text-xs text-cocoa/60 leading-relaxed font-semibold">
                Overview active goals, schedules, OA processes, and streak statuses.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-8">
              <div className="p-3 bg-white border border-cocoa/10 rounded-[1.2rem] text-center">
                <span className="text-[8px] text-cocoa/40 uppercase block font-bold tracking-wider">Offers</span>
                <span className="text-base font-bold text-cocoa block mt-1 font-serif">02</span>
              </div>
              <div className="p-3 bg-white border border-cocoa/10 rounded-[1.2rem] text-center">
                <span className="text-[8px] text-cocoa/40 uppercase block font-bold tracking-wider">Active OAs</span>
                <span className="text-base font-bold text-vermilion block mt-1 font-serif">03</span>
              </div>
            </div>
          </div>

          {/* Card 3: ATS Resume Matcher */}
          <div className="bento-panel flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3">
              <span className="p-2.5 rounded-[1.2rem] bg-vermilion/10 text-vermilion inline-flex mb-2">
                <FileText className="w-5 h-5" />
              </span>
              <h3 className="font-serif font-bold text-xl text-cocoa">ATS Match Engine</h3>
              <p className="text-xs text-cocoa/60 leading-relaxed font-semibold">
                Upload your resume and parse it against job descriptions instantly to find missing keyword tags.
              </p>
            </div>
            
            <div className="mt-8 p-4 bg-cocoa/5 border border-cocoa/10 rounded-[1.2rem] text-center flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-cocoa/60">ATS Match score:</span>
              <span className="text-xs font-bold text-vermilion font-serif tracking-wider">85% score</span>
            </div>
          </div>

          {/* Card 4: Recruiter Reports */}
          <div className="bento-panel md:col-span-2 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3">
              <span className="p-2.5 rounded-[1.2rem] bg-vermilion/10 text-vermilion inline-flex mb-2">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h3 className="font-serif font-bold text-xl text-cocoa">Weekly Evaluation Reports</h3>
              <p className="text-xs text-cocoa/60 leading-relaxed font-semibold">
                Receive compiled checklists and textual critique summaries from our AI recruiter to target gap topics.
              </p>
            </div>

            <div className="mt-8 space-y-2 border-t border-cocoa/5 pt-6">
              <div className="flex items-center gap-2.5 text-xs text-cocoa/80 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-vermilion" />
                <span>Fix graph cycles (DFS Cycle Detection) gap</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-cocoa/80 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-vermilion" />
                <span>Prepare 2 mock rounds for Meta systems depth</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Secondary CTA Callout */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
        <div className="bg-cocoa border border-cocoa/10 rounded-[2.5rem] p-12 space-y-6 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
          {/* Flame element inside */}
          <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] bg-vermilion/10 rounded-full blur-[80px]" />
          
          <Flame className="w-8 h-8 text-vermilion fill-vermilion/10 mx-auto animate-bounce relative z-10" />
          <h2 className="text-3xl font-serif font-bold text-white relative z-10">Ready to take control?</h2>
          <p className="text-xs text-white/60 max-w-md mx-auto font-bold uppercase tracking-wider leading-relaxed relative z-10">
            Log your interviews, solve DSA gap topics, and matching your resume vectors with PlacePilot today.
          </p>
          <button 
            onClick={() => triggerAuth(true)}
            className="bg-white hover:bg-white/90 text-cocoa font-bold text-[10px] px-8 py-4 rounded-full shadow-lg transition-all active:scale-95 uppercase tracking-widest relative z-10"
          >
            <span>Create Free Account</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-cocoa/10 flex flex-col md:flex-row items-center justify-between gap-6 text-[9px] text-cocoa/40 uppercase font-bold tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-vermilion" />
          <span>PlacePilot AI Copilot © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-vermilion">Privacy</a>
          <a href="#" className="hover:text-vermilion">Terms</a>
          <a href="#" className="hover:text-vermilion">API Console</a>
        </div>
      </footer>

      {/* Modal Dialog Overlay for Sign In / Registration */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cocoa/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
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
