import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Sparkles, 
  BookOpen, 
  FileText
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
    <div className="space-y-6 min-h-[80vh] font-sans">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Interview & OA Journal
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Paste raw, messy interview logs, questions, or assessment feedback. Let the Feedback Agent convert it into structured progress metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Log Messy Feedback form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500 fill-current" />
              Analyze Messy Feedback
            </h3>

            {applications.length > 0 ? (
              <form onSubmit={handleAnalyzeFeedback} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">
                    Select Application
                  </label>
                  <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500"
                  >
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.company_name} - {app.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">
                    Round Type
                  </label>
                  <select
                    value={roundType}
                    onChange={(e) => setRoundType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Online Assessment">Online Assessment (OA)</option>
                    <option value="Technical">Technical Round</option>
                    <option value="HR">HR / Behavioral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">
                    Messy Log Notes *
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Paste anything. E.g. 'They asked two graph questions. I solved DFS but stumbled on B+ Trees. Communication went well, but need indexing practice...'"
                    value={messyText}
                    onChange={(e) => setMessyText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 placeholder-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={analyzing}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-3 rounded-xl shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
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
              <p className="text-xs text-slate-400 py-4 text-center">Please submit a job application first before logging journals.</p>
            )}
          </div>

          {/* Show parsed result immediately after parsing */}
          {parsedResult && (
            <div className="bg-brand-50/20 dark:bg-slate-900 border border-brand-200/20 dark:border-slate-800 p-6 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
                Latest AI Structured Analysis
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">Tech Score</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{parsedResult.technical_score}/10</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">Comm Score</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{parsedResult.communication_score}/10</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Strengths</span>
                <div className="flex flex-wrap gap-1.5">
                  {parsedResult.strengths.map((s: string, i: number) => (
                    <span key={i} className="text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md">{s}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Weaknesses</span>
                <div className="flex flex-wrap gap-1.5">
                  {parsedResult.weaknesses.map((w: string, i: number) => (
                    <span key={i} className="text-[10px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md">{w}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Recommendations</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  {parsedResult.recommendations}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Columns - Journal History List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Journal History
            </h3>

            {loading ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent mx-auto" />
              </div>
            ) : journals.length > 0 ? (
              <div className="space-y-4">
                {journals.map((item) => (
                  <div key={item.id} className="p-4 border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl space-y-3.5">
                    
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[9px] font-bold text-brand-500 uppercase tracking-widest block">
                          {item.round_type} Round
                        </span>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5">
                          {getCompanyLabel(item.application_id)}
                        </h4>
                      </div>
                      <span className="text-[9px] text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 whitespace-pre-wrap bg-white dark:bg-slate-950 p-3 border border-slate-100 dark:border-slate-850 rounded-xl max-h-24 overflow-y-auto">
                      {item.feedback}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-3.5">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-slate-400">
                          Tech: <strong className="text-slate-700 dark:text-slate-300 font-bold">{item.technical_score || 0}/10</strong>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Comm: <strong className="text-slate-700 dark:text-slate-300 font-bold">{item.communication_score || 0}/10</strong>
                        </span>
                      </div>
                      {item.strengths && item.strengths.length > 0 && (
                        <div className="flex gap-1.5">
                          {item.strengths.slice(0, 2).map((s: string, idx: number) => (
                            <span key={idx} className="text-[8px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No past feedback logs found. Paste logs in the left panel to populate history.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
