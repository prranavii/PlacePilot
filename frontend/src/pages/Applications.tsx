import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  Sparkles,
  ChevronRight,
  X,
  Trash2,
  Briefcase
} from 'lucide-react';

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  
  // Selected Application for Workspace Panel
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [appEvents, setAppEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [prepTasks, setPrepTasks] = useState<any[]>([]);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);

  // Create Application Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [jd, setJd] = useState('');
  const [ctc, setCtc] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [source, setSource] = useState('LinkedIn');
  const [deadline, setDeadline] = useState('');
  const [stage, setStage] = useState('Applied');
  const [priority, setPriority] = useState('Medium');
  const [readiness, setReadiness] = useState(50);
  const [notes, setNotes] = useState('');

  // Mock Interview Panel States
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockLoadingStart, setMockLoadingStart] = useState(false);
  const [mockSessionId, setMockSessionId] = useState<string | null>(null);
  const [mockQuestion, setMockQuestion] = useState('');
  const [mockQuestionNumber, setMockQuestionNumber] = useState(1);
  const [mockTotalQuestions, setMockTotalQuestions] = useState(3);
  const [mockAnswerText, setMockAnswerText] = useState('');
  const [mockSubmittingAnswer, setMockSubmittingAnswer] = useState(false);
  const [mockScorecard, setMockScorecard] = useState<any | null>(null);

  const handleStartMock = async () => {
    if (!selectedApp) return;
    setShowMockModal(true);
    setMockLoadingStart(true);
    setMockSessionId(null);
    setMockScorecard(null);
    setMockQuestion('');
    setMockAnswerText('');

    const token = localStorage.getItem('token');
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

    try {
      const res = await fetch(`${BASE_URL}/mock-interviews/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ application_id: selectedApp.id })
      });
      if (res.ok) {
        const data = await res.json();
        setMockSessionId(data.session_id);
        setMockQuestion(data.question);
        setMockQuestionNumber(data.question_number);
        setMockTotalQuestions(data.total_questions);
      } else {
        alert('Failed to start mock interview session.');
        setShowMockModal(false);
      }
    } catch (err) {
      alert('Error starting mock interview.');
      setShowMockModal(false);
    } finally {
      setMockLoadingStart(false);
    }
  };

  const handleSubmitMockAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockSessionId || !mockAnswerText.trim()) return;
    setMockSubmittingAnswer(true);

    const token = localStorage.getItem('token');
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

    try {
      const res = await fetch(`${BASE_URL}/mock-interviews/${mockSessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answer_text: mockAnswerText })
      });
      if (res.ok) {
        const data = await res.json();
        setMockAnswerText('');
        if (data.completed) {
          setMockScorecard(data.scorecard);
          // Reload timeline events of selected application
          handleSelectApp(selectedApp);
        } else {
          setMockQuestion(data.question);
          setMockQuestionNumber(data.question_number);
        }
      } else {
        alert('Failed to submit mock interview answer.');
      }
    } catch (err) {
      alert('Error submitting answer.');
    } finally {
      setMockSubmittingAnswer(false);
    }
  };


  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await api.applications.list();
      setApplications(data);
      return data;
    } catch (err) {
      console.error('Failed to load applications:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initApps = async () => {
      const data = await loadApplications();
      const autoSelectCompany = localStorage.getItem('autoSelectCompany');
      if (autoSelectCompany && data.length > 0) {
        const matched = data.find((a: any) => a.company_name.toLowerCase() === autoSelectCompany.toLowerCase());
        if (matched) {
          handleSelectApp(matched);
        }
        localStorage.removeItem('autoSelectCompany');
      }
    };
    initApps();
  }, []);

  const handleSelectApp = async (app: any) => {
    setSelectedApp(app);
    setLoadingEvents(true);
    setPrepTasks([]);
    setStudyPlan([]);
    try {
      const evts = await api.applications.events(app.id);
      setAppEvents(evts);
    } catch (err) {
      console.error('Failed to load application events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.applications.create({
        company_name: companyName,
        role,
        job_description: jd || null,
        package_ctc: ctc || null,
        location: location || null,
        job_type: jobType || null,
        application_source: source || null,
        deadline: deadline || null,
        current_stage: stage,
        priority,
        personal_readiness: readiness,
        notes: notes || null
      });
      setShowAddModal(false);
      
      // Reset form
      setCompanyName('');
      setRole('');
      setJd('');
      setCtc('');
      setLocation('');
      setDeadline('');
      setNotes('');
      setStage('Applied');
      
      await loadApplications();
    } catch (err) {
      alert('Error creating application');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
      await api.applications.delete(id);
      setSelectedApp(null);
      await loadApplications();
    } catch (err) {
      alert('Error deleting application');
    }
  };

  const handlePrepareMe = async () => {
    if (!selectedApp) return;
    setPreparing(true);
    setPrepTasks([]);
    setStudyPlan([]);
    
    const token = localStorage.getItem('token');
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

    try {
      const res = await fetch(`${BASE_URL}/applications/${selectedApp.id}/prepare`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Load generated tasks from database returned object
        setPrepTasks(data.tasks.map((t: any) => ({
          title: t.title,
          duration: `${t.estimated_duration_mins || 30} mins`,
          type: t.topic || 'DSA'
        })));
        
        // Load structured study plan
        setStudyPlan(data.study_plan || []);

        // Dynamically append AI Insight to workspace notes
        if (data.ai_insight) {
          setSelectedApp((prev: any) => ({
            ...prev,
            notes: `${prev.notes || ''}\n\n[AI Copilot Insight]:\n${data.ai_insight}`
          }));
        }
      } else {
        alert('Failed to generate AI preparation strategy.');
      }
    } catch (err) {
      console.error('Prepare Me error:', err);
      alert('Error connecting to preparation API.');
    } finally {
      setPreparing(false);
    }
  };


  // Filtered Applications list
  const filteredApps = applications.filter((app) => {
    const matchesSearch = app.company_name.toLowerCase().includes(search.toLowerCase()) ||
                          app.role.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter ? app.current_stage === stageFilter : true;
    return matchesSearch && matchesStage;
  });

  const getStageColor = (s: string) => {
    switch (s) {
      case 'Wishlist': return 'bg-life-cocoa/5 text-life-cocoa/70 border-life-cocoa/10 border';
      case 'Applied': return 'bg-life-vermilion/10 text-life-vermilion border-life-vermilion/20 border';
      case 'Online Assessment': return 'bg-teal-500/10 text-teal-600 border-teal-500/20 border';
      case 'Technical Interview': return 'bg-amber-500/10 text-amber-600 border-amber-550/20 border';
      case 'Offer': return 'bg-emerald-500/10 text-emerald-600 border-emerald-555/20 border';
      case 'Rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 border';
      default: return 'bg-life-cocoa/5 text-life-cocoa/50 border';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12 font-sans relative"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-life-cocoa dark:text-white font-geom">
            Job Applications Tracker
          </h2>
          <p className="text-sm text-life-cocoa/60 mt-1 max-w-lg leading-relaxed dark:text-zinc-400">
            Manage stage pipelines, check match percentages, and open dedicated AI company preparation workspaces.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-life-vermilion hover:bg-life-vermilion/90 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-life-vermilion/15 flex items-center gap-2 max-w-max transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/70 border border-life-cocoa/5 p-4 rounded-2xl shadow-md backdrop-blur-md dark:bg-zinc-900/35 dark:border-white/5">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-life-cocoa/40">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-life-sand/90 text-xs pl-10 pr-4 py-3 rounded-xl outline-none border border-life-cocoa/10 text-life-cocoa placeholder-life-cocoa/40 transition-all focus:border-life-vermilion dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-life-sand/90 text-xs px-4 py-3 rounded-xl outline-none border border-life-cocoa/10 text-life-cocoa transition-all focus:border-life-vermilion dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5"
          >
            <option value="">All Stages</option>
            <option value="Wishlist">Wishlist</option>
            <option value="Applied">Applied</option>
            <option value="Online Assessment">Online Assessment</option>
            <option value="Technical Interview">Technical Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications list */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-3 border-life-vermilion/25"></div>
            <div className="absolute inset-0 rounded-full border-3 border-life-vermilion border-t-transparent animate-spin"></div>
          </div>
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app) => (
            <motion.div
              key={app.id}
              onClick={() => handleSelectApp(app)}
              whileHover={{ y: -4, borderColor: "rgba(46,26,22,0.15)" }}
              className={`bg-white border p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between dark:bg-zinc-900/45 dark:border-white/5 ${
                selectedApp?.id === app.id 
                  ? 'border-life-vermilion ring-1 ring-life-vermilion/20' 
                  : 'border-life-cocoa/5'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-life-cocoa text-sm tracking-tight dark:text-zinc-200">
                      {app.company_name}
                    </h4>
                    <p className="text-xs text-life-cocoa/60 font-medium mt-1 dark:text-zinc-400">{app.role}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getStageColor(app.current_stage)}`}>
                    {app.current_stage}
                  </span>
                </div>

                <div className="mt-5 space-y-2 border-t border-life-cocoa/5 pt-4 dark:border-white/5">
                  {app.location && (
                    <div className="flex items-center gap-2 text-[10px] text-life-cocoa/50 font-semibold dark:text-zinc-500">
                      <MapPin className="w-3.5 h-3.5 text-life-cocoa/40 shrink-0 dark:text-zinc-500" />
                      {app.location}
                    </div>
                  )}
                  {app.package_ctc && (
                    <div className="flex items-center gap-2 text-[10px] text-life-cocoa/50 font-semibold dark:text-zinc-500">
                      <IndianRupee className="w-3.5 h-3.5 text-life-cocoa/40 shrink-0 dark:text-zinc-500" />
                      {app.package_ctc}
                    </div>
                  )}
                  {app.deadline && (
                    <div className="flex items-center gap-2 text-[10px] text-life-cocoa/50 font-semibold dark:text-zinc-500">
                      <Calendar className="w-3.5 h-3.5 text-life-cocoa/40 shrink-0 dark:text-zinc-500" />
                      Deadline: {new Date(app.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-life-cocoa/5 flex items-center justify-between dark:border-white/5">
                <span className="text-[10px] text-life-cocoa/50 font-bold uppercase tracking-wider dark:text-zinc-400">
                  Readiness: <strong className="text-life-vermilion font-extrabold text-xs ml-1 font-geom">{app.personal_readiness}%</strong>
                </span>
                <span className="text-life-vermilion font-bold text-xs flex items-center gap-1 transition-all hover:translate-x-1">
                  <span>Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white/75 border border-life-cocoa/5 text-center py-16 rounded-2xl shadow-sm dark:bg-zinc-900/35 dark:border-white/5">
          <Briefcase className="w-10 h-10 text-life-cocoa/30 mx-auto mb-3" />
          <h4 className="font-bold text-life-cocoa/70 text-sm dark:text-zinc-300">No applications found</h4>
          <p className="text-xs text-life-cocoa/50 mt-1">Submit your first placement entry using the button above.</p>
        </div>
      )}

      {/* Slide-over Company Workspace Drawer Panel */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-life-cocoa/10 shadow-2xl z-40 flex flex-col justify-between dark:bg-zinc-900 dark:border-white/5"
          >
            {/* Workspace Header */}
            <div className="p-6 border-b border-life-cocoa/5 flex items-start justify-between bg-life-sand/90 dark:bg-zinc-950/20">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-life-cocoa/50 block dark:text-zinc-500">Company Workspace</span>
                <h3 className="font-extrabold text-life-cocoa text-base mt-1 dark:text-white font-geom">
                  {selectedApp.company_name}
                </h3>
                <p className="text-xs text-life-cocoa/60 font-medium dark:text-zinc-400">{selectedApp.role}</p>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleDeleteApplication(selectedApp.id)}
                  className="p-2 rounded-lg text-life-cocoa/65 hover:text-rose-500 hover:bg-life-cocoa/5 dark:hover:text-rose-450 dark:hover:bg-zinc-800"
                  title="Delete Application"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 rounded-lg text-life-cocoa/65 hover:bg-life-cocoa/5 dark:hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Workspace scrollable contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Prepare Me Flags Button */}
              <div className="bg-life-sand/50 border border-life-cocoa/5 p-5 rounded-2xl flex flex-col gap-3 shadow-inner dark:bg-zinc-950/40 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-life-cocoa dark:text-zinc-200">Prepare Me AI Copilot</span>
                  <span className="text-[9px] text-life-vermilion bg-life-vermilion/10 border border-life-vermilion/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 fill-life-vermilion/10" /> Active
                  </span>
                </div>
                <p className="text-[11px] text-life-cocoa/60 leading-relaxed dark:text-zinc-500">
                  Let the AI Copilot analyze the job description, check your DSA topic weaknesses, and compile today's study priorities.
                </p>
                <button
                  onClick={handlePrepareMe}
                  disabled={preparing}
                  className="w-full bg-life-vermilion hover:bg-life-vermilion/90 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-life-vermilion/15 flex items-center justify-center gap-2 mt-1.5 transition-all disabled:opacity-50 active:scale-95"
                >
                  {preparing ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing history...</span>
                    </>
                  ) : (
                    <>
                      <span>✨ Generate Prep Strategy</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleStartMock}
                  className="w-full bg-life-cocoa/5 hover:bg-life-cocoa/10 text-life-cocoa border border-life-cocoa/10 font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 mt-1 transition-all active:scale-95 dark:bg-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-200 dark:border-white/5"
                >
                  <span>🎙️ Start AI Mock Interview</span>
                </button>

                {/* Structured Multi-Phase Study Plan display */}
                {studyPlan.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-life-cocoa/5 space-y-4 dark:border-white/5">
                    <h4 className="text-[10px] font-bold text-life-cocoa/50 uppercase tracking-widest flex items-center gap-1.5 dark:text-zinc-400">
                      <Sparkles className="w-3.5 h-3.5 text-life-vermilion animate-pulse" />
                      Structured Prep Strategy
                    </h4>
                    
                    <div className="space-y-4 relative pl-3.5 before:absolute before:inset-y-1.5 before:left-1 before:w-[1px] before:bg-life-vermilion/20 dark:before:bg-white/10">
                      {studyPlan.map((phase: any, pIdx: number) => (
                        <div key={pIdx} className="relative space-y-2">
                          {/* Chronological bullet dot */}
                          <div className="absolute -left-[17.5px] top-1.5 w-2 h-2 rounded-full bg-life-vermilion border-2 border-life-sand dark:border-[#18110F]" />
                          
                          <div className="bg-white border border-life-cocoa/5 rounded-xl p-4 shadow-sm dark:bg-zinc-900/60 dark:border-white/5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-life-cocoa dark:text-zinc-200 block">
                                {phase.phase_name}
                              </span>
                              <span className="text-[9px] bg-life-vermilion/10 text-life-vermilion font-bold px-2 py-0.5 rounded-full">
                                {phase.duration_days} {phase.duration_days === 1 ? 'day' : 'days'}
                              </span>
                            </div>

                            {/* Focus Areas Tags */}
                            {phase.focus_areas && phase.focus_areas.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {phase.focus_areas.map((tag: string, tIdx: number) => (
                                  <span key={tIdx} className="text-[9px] bg-life-cocoa/5 text-life-cocoa/60 font-semibold px-2 py-0.5 rounded dark:bg-zinc-800 dark:text-zinc-400">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Concrete Tasks checklist */}
                            <ul className="mt-3 space-y-2 border-t border-life-cocoa/5 pt-3 dark:border-white/5">
                              {phase.concrete_tasks.map((task: string, tIdx: number) => (
                                <li key={tIdx} className="text-xs text-life-cocoa/70 flex items-start gap-2 dark:text-zinc-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-life-vermilion/55 mt-1.5 shrink-0" />
                                  <span className="leading-relaxed">{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flat fallback tasks display if old plan schema is returned */}
                {studyPlan.length === 0 && prepTasks.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-life-cocoa/5 space-y-3 dark:border-white/5">
                    <h4 className="text-xs font-bold text-life-cocoa/50 uppercase tracking-widest text-[9px] dark:text-zinc-400">Generated Study Plan</h4>
                    {prepTasks.map((t, i) => (
                      <div key={i} className="p-3 bg-white border border-life-cocoa/5 rounded-xl dark:bg-zinc-900 dark:border-white/5">
                        <span className="text-[9px] font-bold text-life-vermilion block uppercase tracking-wider">{t.type}</span>
                        <p className="text-xs text-life-cocoa font-bold mt-1 leading-normal dark:text-zinc-100">{t.title}</p>
                        <span className="text-[9px] text-life-cocoa/40 mt-2 block">Estimate: {t.duration}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stage Info and Readiness */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-life-sand border border-life-cocoa/5 rounded-xl text-center dark:bg-zinc-900/20 dark:border-white/5">
                  <span className="text-[9px] text-life-cocoa/50 font-bold block uppercase tracking-wider dark:text-zinc-500">Stage</span>
                  <span className="text-xs font-extrabold text-life-cocoa mt-1 block dark:text-zinc-200">
                    {selectedApp.current_stage}
                  </span>
                </div>
                <div className="p-3 bg-life-sand border border-life-cocoa/5 rounded-xl text-center dark:bg-zinc-900/20 dark:border-white/5">
                  <span className="text-[9px] text-life-cocoa/50 font-bold block uppercase tracking-wider dark:text-zinc-500">Readiness</span>
                  <span className="text-xs font-extrabold text-life-cocoa mt-1 block dark:text-zinc-200">
                    {selectedApp.personal_readiness}%
                  </span>
                </div>
              </div>

              {/* Notes Section */}
              {selectedApp.notes && (
                <div className="space-y-2">
                  <h4 className="text-[9px] font-bold text-life-cocoa/50 uppercase tracking-widest dark:text-zinc-400">Notes</h4>
                  <div className="bg-life-sand/40 border border-life-cocoa/5 rounded-xl p-4 text-xs text-life-cocoa/80 whitespace-pre-wrap leading-relaxed dark:bg-zinc-900/20 dark:border-white/5 dark:text-zinc-400">
                    {selectedApp.notes}
                  </div>
                </div>
              )}

              {/* Job Description */}
              {selectedApp.job_description && (
                <div className="space-y-2">
                  <h4 className="text-[9px] font-bold text-life-cocoa/50 uppercase tracking-widest dark:text-zinc-400">Job Description</h4>
                  <div className="bg-life-sand/40 border border-life-cocoa/5 rounded-xl p-4 text-xs text-life-cocoa/80 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto dark:bg-zinc-900/20 dark:border-white/5 dark:text-zinc-400">
                    {selectedApp.job_description}
                  </div>
                </div>
              )}

              {/* Activity Timeline */}
              <div className="space-y-4">
                <h4 className="text-[9px] font-bold text-life-cocoa/50 uppercase tracking-widest dark:text-zinc-400">Hiring Timeline</h4>
                
                {loadingEvents ? (
                  <div className="py-4 text-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-life-vermilion border-t-transparent mx-auto" />
                  </div>
                ) : appEvents.length > 0 ? (
                  <div className="border-l border-life-cocoa/10 ml-2.5 pl-4 space-y-5 dark:border-white/5">
                    {appEvents.map((evt) => (
                      <div key={evt.id} className="relative">
                        {/* Timeline dot marker */}
                        <span className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-life-vermilion border border-life-sand ring-4 ring-life-vermilion/10 dark:border-zinc-900" />
                        
                        <div className="text-xs">
                          <span className="font-extrabold text-life-cocoa block dark:text-zinc-200">
                            {evt.event_type}
                          </span>
                          <span className="text-[9px] text-life-cocoa/50 mt-0.5 block dark:text-zinc-500">
                            {new Date(evt.event_date).toLocaleDateString()}
                          </span>
                          {evt.details && (
                            <p className="text-[11px] text-life-cocoa/80 mt-2 bg-life-sand/40 border border-life-cocoa/5 p-3 rounded-lg leading-relaxed dark:bg-zinc-900/40 dark:border-white/5 dark:text-zinc-400">
                              {evt.details}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-life-cocoa/40">No events logged yet.</p>
                )}
              </div>

            </div>
            
            {/* Footer action */}
            <div className="p-6 border-t border-life-cocoa/5 flex justify-end gap-3 bg-life-sand/90 dark:border-white/5 dark:bg-zinc-950/20 shrink-0">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 border border-life-cocoa/10 bg-life-sand text-xs font-bold text-life-cocoa/80 rounded-xl hover:bg-life-cocoa/5 dark:border-white/5 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 dark:text-zinc-400 transition-all"
              >
                Close Workspace
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Application Modal Backdrop */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-white border border-life-cocoa/10 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative font-sans dark:bg-zinc-900 dark:border-white/5"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-life-cocoa/5 flex items-center justify-between bg-life-sand/90 dark:bg-zinc-950/20 dark:border-white/5">
                <h3 className="font-extrabold text-life-cocoa text-sm uppercase tracking-widest dark:text-white font-geom">
                  Add Job Application
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-life-cocoa/60 hover:bg-life-cocoa/5 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateApplication} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-life-sand text-xs border border-life-cocoa/10 rounded-xl px-3.5 py-2.5 text-life-cocoa focus:outline-none focus:border-life-vermilion placeholder-life-cocoa/30 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-white/5 dark:focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">Role / Job Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Frontend Intern"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-life-sand text-xs border border-life-cocoa/10 rounded-xl px-3.5 py-2.5 text-life-cocoa focus:outline-none focus:border-life-vermilion placeholder-life-cocoa/30 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-white/5 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">Package (CTC / Wage)</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹12,00,000 / yr"
                      value={ctc}
                      onChange={(e) => setCtc(e.target.value)}
                      className="w-full bg-life-sand text-xs border border-life-cocoa/10 rounded-xl px-3.5 py-2.5 text-life-cocoa focus:outline-none focus:border-life-vermilion placeholder-life-cocoa/30 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-white/5 dark:focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Seattle, WA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-life-sand text-xs border border-life-cocoa/10 rounded-xl px-3.5 py-2.5 text-life-cocoa focus:outline-none focus:border-life-vermilion placeholder-life-cocoa/30 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-white/5 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">Job Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full bg-life-sand text-xs border border-life-cocoa/10 rounded-xl px-3 py-2.5 text-life-cocoa focus:outline-none focus:border-life-vermilion dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5 dark:focus:border-indigo-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full bg-life-sand text-xs border border-life-cocoa/10 rounded-xl px-3 py-2.5 text-life-cocoa focus:outline-none focus:border-life-vermilion dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5 dark:focus:border-indigo-500"
                    >
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Referral">Referral</option>
                      <option value="On-campus">On-campus</option>
                      <option value="Company Portal">Portal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">Deadline</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-life-sand text-xs border border-life-cocoa/10 rounded-xl px-2 py-2.5 text-life-cocoa focus:outline-none focus:border-life-vermilion dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">Stage</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full bg-life-sand text-xs border border-life-cocoa/10 rounded-xl px-3 py-2.5 text-life-cocoa focus:outline-none focus:border-life-vermilion dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5 dark:focus:border-indigo-500"
                    >
                      <option value="Wishlist">Wishlist</option>
                      <option value="Applied">Applied</option>
                      <option value="Online Assessment">Online Assessment</option>
                      <option value="Technical Interview">Technical Interview</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-life-sand text-xs border border-life-cocoa/10 rounded-xl px-3 py-2.5 text-life-cocoa focus:outline-none focus:border-life-vermilion dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5 dark:focus:border-indigo-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">Readiness ({readiness}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={readiness}
                      onChange={(e) => setReadiness(parseInt(e.target.value))}
                      className="w-full mt-3 accent-life-vermilion"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">Job Description</label>
                  <textarea
                    placeholder="Paste job requirements..."
                    rows={3}
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    className="w-full bg-life-sand text-xs border border-life-cocoa/10 rounded-xl px-3.5 py-2.5 text-life-cocoa focus:outline-none focus:border-life-vermilion placeholder-life-cocoa/30 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-white/5 dark:focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">Personal Notes</label>
                  <textarea
                    placeholder="Enter custom interview details..."
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-life-sand text-xs border border-life-cocoa/10 rounded-xl px-3.5 py-2.5 text-life-cocoa focus:outline-none focus:border-life-vermilion placeholder-life-cocoa/30 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-white/5 dark:focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-5 border-t border-life-cocoa/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 border border-life-cocoa/10 bg-life-sand text-xs font-bold text-life-cocoa/60 rounded-xl hover:bg-life-cocoa/5 dark:border-white/5 dark:bg-zinc-950/40 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-life-vermilion hover:bg-life-vermilion/90 text-white rounded-xl text-xs font-bold shadow-lg shadow-life-vermilion/15"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Mock Interview Modal */}
      <AnimatePresence>
        {showMockModal && (
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
              className="w-full max-w-xl bg-white border border-life-cocoa/10 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col font-sans dark:bg-zinc-900 dark:border-white/5"
            >
              <div className="p-6 border-b border-life-cocoa/5 flex items-center justify-between bg-life-sand/90 shrink-0 dark:bg-zinc-950/20 dark:border-white/5">
                <h3 className="font-extrabold text-life-cocoa text-xs uppercase tracking-widest flex items-center gap-2 dark:text-white font-geom">
                  <Sparkles className="w-4 h-4 text-life-vermilion fill-life-vermilion/10 animate-pulse" />
                  AI Interview Studio: {selectedApp?.company_name}
                </h3>
                {!mockSubmittingAnswer && !mockLoadingStart && (
                  <button 
                    onClick={() => setShowMockModal(false)}
                    className="p-1.5 rounded-lg text-life-cocoa/60 hover:bg-life-cocoa/5 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {mockLoadingStart ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="relative w-10 h-10 mx-auto">
                      <div className="absolute inset-0 rounded-full border-3 border-life-vermilion/25 animate-pulse"></div>
                      <div className="absolute inset-0 rounded-full border-3 border-life-vermilion border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-xs text-life-cocoa/50 font-bold uppercase tracking-wider">Assembling Adaptive Studio Context...</p>
                  </div>
                ) : mockScorecard ? (
                  // Evaluation Scorecard Display
                  <div className="space-y-6">
                    <div className="text-center pb-4 border-b border-life-cocoa/5 dark:border-white/5">
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Session Evaluation Completed</span>
                      <h4 className="font-extrabold text-life-cocoa text-lg mt-2 dark:text-white font-geom">Scorecard Report</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-life-sand border border-life-cocoa/5 rounded-2xl text-center shadow-inner dark:bg-zinc-950/40 dark:border-white/5">
                        <span className="text-[10px] text-life-cocoa/50 font-bold uppercase block dark:text-zinc-500">Technical Depth</span>
                        <span className="text-2xl font-black text-life-vermilion block mt-1 font-geom">{mockScorecard.technical_score}/10</span>
                      </div>
                      <div className="p-4 bg-life-sand border border-life-cocoa/5 rounded-2xl text-center shadow-inner dark:bg-zinc-900/40 dark:border-white/5">
                        <span className="text-[10px] text-life-cocoa/50 font-bold uppercase block dark:text-zinc-500">Communication</span>
                        <span className="text-2xl font-black text-emerald-600 block mt-1 font-geom">{mockScorecard.communication_score}/10</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] text-life-cocoa/50 font-bold uppercase tracking-wider block dark:text-zinc-500">Recruiter Recommendations</span>
                      <p className="text-xs text-life-cocoa/80 leading-relaxed bg-life-sand/40 p-4 rounded-xl border border-life-cocoa/5 dark:bg-zinc-950/30 dark:border-white/5 dark:text-zinc-400">
                        {mockScorecard.recommendations}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[9px] text-life-cocoa/50 font-bold uppercase tracking-wider block dark:text-zinc-500">Strengths Demonstrated</span>
                      <div className="flex flex-wrap gap-2">
                        {mockScorecard.strengths.map((s: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold bg-emerald-500/10 text-emerald-700 px-3 py-1 rounded-full border border-emerald-500/20 dark:text-emerald-450">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[9px] text-life-cocoa/50 font-bold uppercase tracking-wider block dark:text-zinc-500">Identified Gaps</span>
                      <div className="flex flex-wrap gap-2">
                        {mockScorecard.weaknesses.map((w: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold bg-life-vermilion/10 text-life-vermilion px-3 py-1 rounded-full border border-life-vermilion/20">{w}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Active Interview Question flow
                  <form onSubmit={handleSubmitMockAnswer} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] bg-life-sand border border-life-cocoa/10 text-life-cocoa/70 font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider dark:bg-zinc-950/60 dark:border-white/5 dark:text-zinc-400">
                          Question {mockQuestionNumber} of {mockTotalQuestions}
                        </span>
                        <span className="text-[9px] text-life-vermilion font-bold uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-life-vermilion animate-ping" />
                          🎙️ Active Session
                        </span>
                      </div>
                      
                      <div className="bg-life-sand/40 p-5 border border-life-cocoa/5 rounded-2xl shadow-inner relative overflow-hidden dark:bg-zinc-950/40 dark:border-white/5">
                        <p className="text-sm font-semibold text-life-cocoa leading-relaxed relative z-10 dark:text-zinc-100">
                          {mockQuestion}
                        </p>
                        
                        {/* Audio Waveform Decoration */}
                        <div className="flex items-center gap-1 justify-center h-16 py-2">
                          <span className="w-1.5 bg-life-vermilion rounded-full h-8 waveform-bar"></span>
                          <span className="w-1.5 bg-life-vermilion rounded-full h-12 waveform-bar"></span>
                          <span className="w-1.5 bg-life-vermilion rounded-full h-6 waveform-bar"></span>
                          <span className="w-1.5 bg-life-vermilion rounded-full h-10 waveform-bar"></span>
                          <span className="w-1.5 bg-life-vermilion rounded-full h-14 waveform-bar"></span>
                          <span className="w-1.5 bg-life-vermilion rounded-full h-8 waveform-bar"></span>
                          <span className="w-1.5 bg-life-vermilion rounded-full h-12 waveform-bar"></span>
                          <span className="w-1.5 bg-life-vermilion rounded-full h-5 waveform-bar"></span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold text-life-cocoa/50 uppercase tracking-wider dark:text-zinc-400">Your Response *</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Type your structured response details (mention caching, algorithms, complexity where relevant)..."
                        value={mockAnswerText}
                        onChange={(e) => setMockAnswerText(e.target.value)}
                        className="w-full bg-life-sand text-xs border border-life-cocoa/10 rounded-xl px-4 py-3 text-life-cocoa focus:outline-none focus:border-life-vermilion placeholder-life-cocoa/30 leading-relaxed dark:bg-zinc-950/60 dark:text-zinc-300 dark:border-white/5"
                      />
                    </div>

                    <div className="flex justify-end pt-5 border-t border-life-cocoa/5 dark:border-white/5">
                      <button
                        type="submit"
                        disabled={mockSubmittingAnswer || !mockAnswerText.trim()}
                        className="bg-life-vermilion hover:bg-life-vermilion/90 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-life-vermilion/20 flex items-center gap-1.5 disabled:opacity-50 transition-all active:scale-95"
                      >
                        {mockSubmittingAnswer ? (
                          <>
                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Evaluating response...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Answer</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {mockScorecard && (
                <div className="p-6 border-t border-life-cocoa/5 bg-life-sand/90 flex justify-end shrink-0 dark:border-white/5 dark:bg-zinc-950/20">
                  <button
                    onClick={() => setShowMockModal(false)}
                    className="px-5 py-2.5 bg-life-vermilion hover:bg-life-vermilion/90 text-white font-bold text-xs rounded-xl shadow-lg shadow-life-vermilion/10 active:scale-95 transition-all"
                  >
                    Close Session
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
