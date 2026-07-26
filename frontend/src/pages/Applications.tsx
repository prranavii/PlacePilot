import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
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
      case 'Wishlist': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'Applied': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
      case 'Online Assessment': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400';
      case 'Technical Interview': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
      case 'Offer': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'Rejected': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 relative min-h-[85vh]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Job Applications Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track stage pipelines and open dedicated AI company preparation workspaces.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/15 flex items-center gap-2 max-w-max transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/40 text-sm pl-9 pr-4 py-2 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/40 text-xs px-3 py-2 rounded-xl outline-none border-none text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-brand-500 transition-all"
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
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-brand-500 border-t-transparent" />
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              onClick={() => handleSelectApp(app)}
              className={`bg-white dark:bg-slate-900 border ${
                selectedApp?.id === app.id 
                  ? 'border-brand-500 ring-1 ring-brand-500/20' 
                  : 'border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              } p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-150 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-tight">
                      {app.company_name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{app.role}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getStageColor(app.current_stage)}`}>
                    {app.current_stage}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {app.location && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {app.location}
                    </div>
                  )}
                  {app.package_ctc && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {app.package_ctc}
                    </div>
                  )}
                  {app.deadline && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      Deadline: {new Date(app.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Readiness: <strong className="text-slate-700 dark:text-slate-300 font-bold">{app.personal_readiness}%</strong>
                </span>
                <span className="text-brand-500 hover:text-brand-600 font-semibold text-xs flex items-center gap-1">
                  Workspace <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center py-16 rounded-2xl">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No applications found</h4>
          <p className="text-xs text-slate-400 mt-1">Submit your first placement entry using the button above.</p>
        </div>
      )}

      {/* Slide-over Company Workspace Drawer Panel */}
      {selectedApp && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-900 shadow-2xl z-20 flex flex-col justify-between transition-colors duration-200">
          
          {/* Workspace Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex items-start justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Company Workspace</span>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base mt-0.5">
                {selectedApp.company_name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{selectedApp.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleDeleteApplication(selectedApp.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-900"
                title="Delete Application"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Workspace scrollable contents */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Prepare Me Flags Button */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Prepare Me AI Copilot</span>
                <span className="text-[10px] text-brand-500 font-bold flex items-center gap-0.5">
                  <Sparkles className="w-3.5 h-3.5 fill-current" /> Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Let the AI Copilot analyze the job description, check your graph / database performance weaknesses, and compile today's study priorities.
              </p>
              <button
                onClick={handlePrepareMe}
                disabled={preparing}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 mt-1.5 transition-all disabled:opacity-50"
              >
                {preparing ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing history...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Prepare Me</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleStartMock}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 mt-1 transition-all"
              >
                <span>🎙️ Start AI Mock Interview</span>
              </button>


              {/* Prep tasks display if generated */}
              {prepTasks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Generated Study Plan</h4>
                  {prepTasks.map((t, i) => (
                    <div key={i} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-xl">
                      <span className="text-[10px] font-bold text-brand-500 block uppercase tracking-wider">{t.type}</span>
                      <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-0.5">{t.title}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block">Estimate: {t.duration}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stage Info and Readiness */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Stage</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {selectedApp.current_stage}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Readiness</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {selectedApp.personal_readiness}%
                </span>
              </div>
            </div>

            {/* Notes Section */}
            {selectedApp.notes && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Notes</h4>
                <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/60 rounded-xl p-3.5 text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {selectedApp.notes}
                </div>
              </div>
            )}

            {/* Job Description */}
            {selectedApp.job_description && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Job Description</h4>
                <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/60 rounded-xl p-3.5 text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedApp.job_description}
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Hiring Timeline</h4>
              
              {loadingEvents ? (
                <div className="py-4 text-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-500 border-t-transparent mx-auto" />
                </div>
              ) : appEvents.length > 0 ? (
                <div className="border-l border-slate-200 dark:border-slate-800 ml-2.5 pl-4 space-y-4">
                  {appEvents.map((evt) => (
                    <div key={evt.id} className="relative">
                      {/* Timeline dot marker */}
                      <span className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 border border-white dark:border-slate-900 ring-2 ring-brand-500/10" />
                      
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {evt.event_type}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {new Date(evt.event_date).toLocaleDateString()}
                        </span>
                        {evt.details && (
                          <p className="text-[11px] text-slate-500 mt-1 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                            {evt.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No events logged yet.</p>
              )}
            </div>

          </div>
          
          {/* Footer action */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-900 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/20">
            <button
              onClick={() => setSelectedApp(null)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
            >
              Close Workspace
            </button>
          </div>

        </div>
      )}

      {/* Add Application Modal Backdrop */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4 transition-all duration-200">
          
          {/* Modal Container */}
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative font-sans">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">
                Add Job Application
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateApplication} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Role / Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frontend Intern"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Package (CTC / Wage)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹12,00,000 / yr"
                    value={ctc}
                    onChange={(e) => setCtc(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Seattle, WA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Job Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Referral">Referral</option>
                    <option value="On-campus">On-campus</option>
                    <option value="Company Portal">Portal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Wishlist">Wishlist</option>
                    <option value="Applied">Applied</option>
                    <option value="Online Assessment">Online Assessment</option>
                    <option value="Technical Interview">Technical Interview</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Readiness ({readiness}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={readiness}
                    onChange={(e) => setReadiness(parseInt(e.target.value))}
                    className="w-full mt-2 accent-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Job Description</label>
                <textarea
                  placeholder="Paste job requirements..."
                  rows={3}
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Personal Notes</label>
                <textarea
                  placeholder="Enter custom interview details..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/15"
                >
                  Save Entry
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      {/* AI Mock Interview Modal */}

      {showMockModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative font-sans">
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500 fill-brand-500/10 animate-pulse" />
                AI Mock Session: {selectedApp?.company_name}
              </h3>
              {!mockSubmittingAnswer && !mockLoadingStart && (
                <button 
                  onClick={() => setShowMockModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {mockLoadingStart ? (
                <div className="py-16 text-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-brand-500 border-t-transparent mx-auto" />
                  <p className="text-xs text-slate-400">Assembling adaptive mock interview context...</p>
                </div>
              ) : mockScorecard ? (
                // Evaluation Scorecard Display
                <div className="space-y-6">
                  <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest block">Session Completed</span>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg mt-1">Scorecard Assessment</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 rounded-2xl text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Technical Depth</span>
                      <span className="text-2xl font-black text-brand-600 dark:text-brand-400 block mt-1">{mockScorecard.technical_score}/10</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 rounded-2xl text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Communication</span>
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block mt-1">{mockScorecard.communication_score}/10</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Recruiter Recommendations</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-150 dark:border-slate-850">
                      {mockScorecard.recommendations}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Strengths Demonstrated</span>
                    <div className="flex flex-wrap gap-1.5">
                      {mockScorecard.strengths.map((s: string, i: number) => (
                        <span key={i} className="text-[10px] font-medium bg-emerald-550/10 text-emerald-650 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Identified Gaps</span>
                    <div className="flex flex-wrap gap-1.5">
                      {mockScorecard.weaknesses.map((w: string, i: number) => (
                        <span key={i} className="text-[10px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full">{w}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Active Interview Question flow
                <form onSubmit={handleSubmitMockAnswer} className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Question {mockQuestionNumber} of {mockTotalQuestions}
                      </span>
                      <span className="text-[9px] text-brand-500 font-bold uppercase tracking-wider animate-pulse">🎙️ Recording Session</span>
                    </div>
                    
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-5 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                      {mockQuestion}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Your Response *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Type your structured response details (mention caching, algorithms, complexity where relevant)..."
                      value={mockAnswerText}
                      onChange={(e) => setMockAnswerText(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-3 text-slate-700 dark:text-slate-350 focus:outline-none focus:border-brand-500 placeholder-slate-400"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
                    <button
                      type="submit"
                      disabled={mockSubmittingAnswer || !mockAnswerText.trim()}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-brand-500/10 flex items-center gap-1.5 disabled:opacity-50"
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
              <div className="p-6 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/20 flex justify-end">
                <button
                  onClick={() => setShowMockModal(false)}
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/10"
                >
                  Close Session
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

