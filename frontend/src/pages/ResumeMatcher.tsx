import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Sparkles, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Search,
  Check
} from 'lucide-react';

export const ResumeMatcher: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection
  const [selectedAppId, setSelectedAppId] = useState('');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  
  // Status
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const apps = await api.applications.list();
        setApplications(apps);
        if (apps.length > 0) {
          setSelectedAppId(apps[0].id);
          setJdText(apps[0].job_description || '');
        }
      } catch (err) {
        console.error('Failed to load apps:', err);
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, []);

  // Update JD text when selecting an application
  const handleAppChange = (appId: string) => {
    setSelectedAppId(appId);
    const app = applications.find(a => a.id === appId);
    if (app) {
      setJdText(app.job_description || '');
    }
  };

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim() || !jdText.trim()) return;
    setMatching(true);
    setResult(null);

    const token = localStorage.getItem('token');
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

    try {
      const res = await fetch(`${BASE_URL}/resume/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resume_text: resumeText,
          jd_text: jdText
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        alert('Match calculation failed');
      }
    } catch {
      alert('Error connecting to match API');
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans min-h-[85vh]">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Resume-Role Match Agent
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Evaluate how well your resume matches a target job description. Identify missing skills and keyword gaps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Side: Input Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <form onSubmit={handleMatch} className="space-y-4">
            
            {/* Select Job application */}
            {applications.length > 0 && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">
                  Prefill JD from Application
                </label>
                <select
                  value={selectedAppId}
                  onChange={(e) => handleAppChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.company_name} - {app.role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Job Description Textarea */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">
                Job Description (JD) *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Paste the target role description and requirements..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 placeholder-slate-400"
              />
            </div>

            {/* Candidate Resume Textarea */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">
                Paste Resume Text *
              </label>
              <textarea
                required
                rows={7}
                placeholder="Paste the text from your resume..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 placeholder-slate-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={matching || !resumeText.trim() || !jdText.trim()}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-3 rounded-xl shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {matching ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Matching resume...</span>
                </>
              ) : (
                <>
                  <span>Calculate Resume-Role Match</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Scorecard Results */}
        <div className="space-y-6">
          {result ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
              
              {/* Match Score Gauge */}
              <div className="flex flex-col items-center pb-4 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Calculated Score
                </span>
                <div className="text-3xl font-extrabold text-brand-600 dark:text-brand-400 mt-1">
                  {result.match_percentage}%
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-tight mt-1.5">
                  Resume-Role Match
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3.5 overflow-hidden">
                  <div 
                    className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${result.match_percentage}%` }}
                  />
                </div>
              </div>

              {/* Explanation Card */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">
                  Match Explanation
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  {result.explanation}
                </p>
              </div>

              {/* Matched Skills */}
              {result.matched_skills.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Matched Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matched_skills.map((s: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3 shrink-0" /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {result.missing_skills.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Missing Skills / Gaps
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missing_skills.map((s: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyword Gaps */}
              {result.keyword_gaps.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-rose-500" /> Keyword Gaps
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyword_gaps.map((k: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Likely Interview Topics */}
              {result.likely_interview_areas.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-brand-500" /> Likely Interview Topics
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1 bg-slate-50 dark:bg-slate-800/20 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                    {result.likely_interview_areas.map((t: string, idx: number) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center py-20 rounded-2xl flex flex-col items-center justify-center p-6 shadow-sm">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No analysis generated</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Paste your resume text and target JD on the left panel, and click calculate to retrieve structured recruiter scorecard analytics.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
