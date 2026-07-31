import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BookOpen, 
  FileText,
  Clock
} from 'lucide-react';

export const Journal: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedAppId, setSelectedAppId] = useState('');
  const [messyText, setMessyText] = useState('');
  const [roundType, setRoundType] = useState('Technical');
  const [analyzing, setAnalyzing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const apps = await api.applications.list();
      setApplications(apps);
      if (apps.length > 0) {
        setSelectedAppId(apps[0].id);
      }

      // Fetch logged journals from backend
      const token = localStorage.getItem('token');
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const res = await fetch(`${BASE_URL}/journal`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJournals(data);
      }
    } catch (err) {
      console.error('Failed to load journal page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAnalyzeFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !messyText) return;
    setAnalyzing(true);
    setParsedResult(null);

    const token = localStorage.getItem('token');
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

    try {
      const res = await fetch(`${BASE_URL}/journal/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer {token}`.replace('{token}', token || '')
        },
        body: JSON.stringify({
          application_id: selectedAppId,
          messy_text: messyText,
          round_type: roundType
        })
      });
      if (res.ok) {
        const data = await res.json();
        setParsedResult(data);
        setMessyText('');
        // Reload history
        await loadData();
      } else {
        alert('Failed to parse feedback');
      }
    } catch {
      alert('Error parsing feedback');
    } finally {
      setAnalyzing(false);
    }
  };

  const getCompanyLabel = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    return app ? `${app.company_name} (${app.role})` : 'General';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12 font-sans relative"
    >
      {/* 3D Ambient backdrop Blob */}
      <div className="absolute -top-12 right-1/4 w-96 h-96 bg-life-vermilion/5 rounded-full blur-3xl pointer-events-none animate-blob"></div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-life-cocoa dark:text-white font-geom">
          Interview & OA Journal
        </h2>
        <p className="text-sm text-life-cocoa/60 mt-1 max-w-lg leading-relaxed dark:text-zinc-400">
          Paste raw, messy interview logs, questions, or assessment feedback. Let the Feedback Agent convert it into structured DSA progress metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Log Messy Feedback form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/70 border border-life-cocoa/5 p-6 rounded-2xl shadow-md backdrop-blur-md dark:bg-zinc-900/35 dark:border-white/5">
            <h3 className="text-xs font-bold text-life-cocoa uppercase tracking-widest mb-5 flex items-center gap-2 dark:text-white">
              <Sparkles className="w-4 h-4 text-life-vermilion fill-life-vermilion/10 animate-pulse" />
              Analyze Messy Feedback
            </h3>

            {applications.length > 0 ? (
              <form onSubmit={handleAnalyzeFeedback} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">
                    Select Application
                  </label>
                  <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full bg-life-sand/90 text-xs border border-life-cocoa/10 rounded-xl px-3.5 py-3 text-life-cocoa focus:outline-none focus:border-life-vermilion dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5"
                  >
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.company_name} — {app.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-455">
                    Round Type
                  </label>
                  <select
                    value={roundType}
                    onChange={(e) => setRoundType(e.target.value)}
                    className="w-full bg-life-sand/90 text-xs border border-life-cocoa/10 rounded-xl px-3.5 py-3 text-life-cocoa focus:outline-none focus:border-life-vermilion dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5"
                  >
                    <option value="Online Assessment">Online Assessment (OA)</option>
                    <option value="Technical">Technical Round</option>
                    <option value="HR">HR / Behavioral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-life-cocoa/50 mb-1.5 uppercase tracking-wider dark:text-zinc-400">
                    Messy Log Notes *
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Paste anything. E.g. 'They asked two graph questions. I solved DFS but stumbled on B+ Trees. Communication went well, but need indexing practice...'"
                    value={messyText}
                    onChange={(e) => setMessyText(e.target.value)}
                    className="w-full bg-life-sand/90 text-xs border border-life-cocoa/10 rounded-xl px-4 py-3 text-life-cocoa focus:outline-none focus:border-life-vermilion placeholder-life-cocoa/30 leading-relaxed dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={analyzing}
                  className="w-full bg-life-vermilion hover:bg-life-vermilion/90 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg shadow-life-vermilion/10 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {analyzing ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Parsing feedback...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze with AI</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <p className="text-xs text-life-cocoa/50 py-4 text-center">Please submit a job application first before logging journals.</p>
            )}
          </div>

          {/* Show parsed result immediately after parsing */}
          <AnimatePresence>
            {parsedResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-life-vermilion/5 border border-life-vermilion/20 p-6 rounded-2xl space-y-5"
              >
                <h4 className="text-xs font-bold text-life-cocoa uppercase tracking-widest flex items-center gap-2 dark:text-white">
                  <Sparkles className="w-4 h-4 text-life-vermilion fill-life-vermilion/10 animate-pulse" />
                  Latest AI Analysis
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-life-sand border border-life-cocoa/10 rounded-xl text-center dark:bg-zinc-900/40 dark:border-white/5">
                    <span className="text-[9px] text-life-cocoa/50 block font-bold uppercase tracking-wider dark:text-zinc-500">Tech Score</span>
                    <span className="text-xs font-extrabold text-life-vermilion mt-1 block font-geom">{parsedResult.technical_score}/10</span>
                  </div>
                  <div className="p-3 bg-life-sand border border-life-cocoa/10 rounded-xl text-center dark:bg-zinc-900/40 dark:border-white/5">
                    <span className="text-[9px] text-life-cocoa/50 block font-bold uppercase tracking-wider dark:text-zinc-500">Comm Score</span>
                    <span className="text-xs font-extrabold text-emerald-600 mt-1 block font-geom">{parsedResult.communication_score}/10</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] text-life-cocoa/50 block font-bold uppercase tracking-wider dark:text-zinc-500">Strengths</span>
                  <div className="flex flex-wrap gap-2">
                    {parsedResult.strengths.map((s: string, i: number) => (
                      <span key={i} className="text-[10px] font-bold bg-emerald-500/10 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-500/20 dark:bg-emerald-550/10 dark:text-emerald-450">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] text-life-cocoa/50 block font-bold uppercase tracking-wider dark:text-zinc-500">Weaknesses</span>
                  <div className="flex flex-wrap gap-2">
                    {parsedResult.weaknesses.map((w: string, i: number) => (
                      <span key={i} className="text-[10px] font-bold bg-life-vermilion/10 text-life-vermilion px-2.5 py-1 rounded-md border border-life-vermilion/20">{w}</span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[9px] text-life-cocoa/50 block font-bold uppercase tracking-wider dark:text-zinc-500">Recommendations</span>
                  <p className="text-xs text-life-cocoa/80 leading-relaxed bg-life-sand/40 p-4 rounded-xl border border-life-cocoa/5 dark:bg-zinc-900/45 dark:text-zinc-400 dark:border-white/5">
                    {parsedResult.recommendations}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Columns - Journal History List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/70 border border-life-cocoa/5 p-6 rounded-2xl shadow-md backdrop-blur-md dark:bg-zinc-900/35 dark:border-white/5">
            <h3 className="text-xs font-bold text-life-cocoa uppercase tracking-widest mb-5 flex items-center gap-2 dark:text-white">
              <FileText className="w-4 h-4 text-life-vermilion" />
              Journal History
            </h3>

            {loading ? (
              <div className="py-12 text-center">
                <div className="relative w-10 h-10 mx-auto">
                  <div className="absolute inset-0 rounded-full border-3 border-life-vermilion/25"></div>
                  <div className="absolute inset-0 rounded-full border-3 border-life-vermilion border-t-transparent animate-spin"></div>
                </div>
              </div>
            ) : journals.length > 0 ? (
              <div className="space-y-5">
                {journals.map((item) => (
                  <motion.div 
                    key={item.id} 
                    whileHover={{ borderColor: "rgba(46,26,22,0.15)" }}
                    className="p-5 border border-life-cocoa/5 bg-white rounded-2xl space-y-4 shadow-sm transition-all duration-300 dark:bg-zinc-900/60 dark:border-white/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[9px] font-bold text-life-vermilion bg-life-vermilion/10 border border-life-vermilion/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {item.round_type} Round
                        </span>
                        <h4 className="font-extrabold text-life-cocoa text-xs mt-2.5 dark:text-zinc-200">
                          {getCompanyLabel(item.application_id)}
                        </h4>
                      </div>
                      <span className="text-[10px] text-life-cocoa/50 font-semibold flex items-center gap-1 dark:text-zinc-500">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-xs text-life-cocoa/80 whitespace-pre-wrap bg-life-sand/40 p-4 border border-life-cocoa/5 rounded-xl max-h-24 overflow-y-auto leading-relaxed dark:bg-zinc-950/20 dark:text-zinc-400 dark:border-white/5">
                      {item.feedback}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-life-cocoa/5 pt-4 dark:border-white/5">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-life-cocoa/50 font-bold uppercase tracking-wider dark:text-zinc-500">
                          Tech Depth: <strong className="text-life-vermilion font-extrabold ml-1 font-geom">{item.technical_score || 0}/10</strong>
                        </span>
                        <span className="text-[10px] text-life-cocoa/50 font-bold uppercase tracking-wider dark:text-zinc-500">
                          Comm Flow: <strong className="text-emerald-600 font-extrabold ml-1 font-geom">{item.communication_score || 0}/10</strong>
                        </span>
                      </div>
                      {item.strengths && item.strengths.length > 0 && (
                        <div className="flex gap-1.5">
                          {item.strengths.slice(0, 2).map((s: string, idx: number) => (
                            <span key={idx} className="text-[9px] font-bold bg-emerald-500/10 text-emerald-700 px-2.5 py-0.5 rounded border border-emerald-500/20 dark:text-emerald-450">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-life-cocoa/50 text-xs flex flex-col items-center justify-center p-6 border border-dashed border-life-cocoa/10 rounded-2xl dark:border-white/5">
                <BookOpen className="w-8 h-8 text-life-cocoa/30 mb-3" />
                <h4 className="font-bold text-life-cocoa/60 uppercase tracking-wider text-[10px] mb-1 dark:text-zinc-400">Journal Empty</h4>
                <p className="text-life-cocoa/40 max-w-xs mt-0.5 dark:text-zinc-600">No past feedback logs found. Paste logs in the left panel to populate history.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </motion.div>
  );
};

