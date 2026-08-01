import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Search,
  Check,
  Upload
} from 'lucide-react';

export const ResumeMatcher: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection
  const [selectedAppId, setSelectedAppId] = useState('');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [parsing, setParsing] = useState(false);
  
  // Status
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    const token = localStorage.getItem('token');
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${BASE_URL}/resume/parse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setResumeText(data.text);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.detail || 'Failed to parse resume file');
      }
    } catch (err) {
      alert('Error connecting to resume parse API');
    } finally {
      setParsing(false);
      e.target.value = '';
    }
  };

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
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-crimson/25"></div>
          <div className="absolute inset-0 rounded-full border-4 border-crimson border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12 font-sans relative"
    >
      {/* 3D Ambient backdrop Blob */}
      <div className="absolute -top-12 -left-12 w-96 h-96 bg-crimson/5 rounded-full blur-3xl pointer-events-none animate-blob"></div>

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-widest text-white font-geom uppercase">
          Resume-Role Match Agent
        </h2>
        <p className="text-xs text-zinc-400 mt-2 max-w-lg leading-relaxed font-semibold uppercase tracking-wider">
          Evaluate how well your resume matches a target job description. Identify missing skills, critical keyword gaps, and likely interview focus areas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Side: Input Form */}
        <div className="bg-zinc-950/60 border border-white/5 p-6 rounded-2xl shadow-md backdrop-blur-md space-y-5">
          <form onSubmit={handleMatch} className="space-y-5">
            
            {/* Select Job application */}
            {applications.length > 0 && (
              <div>
                <label className="block text-[9px] font-bold text-zinc-450 mb-1.5 uppercase tracking-wider dark:text-zinc-400">
                  Prefill JD from Application
                </label>
                <select
                  value={selectedAppId}
                  onChange={(e) => handleAppChange(e.target.value)}
                  className="w-full bg-zinc-900 text-xs border border-white/5 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-crimson dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.company_name} — {app.role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Job Description Textarea */}
            <div>
              <label className="block text-[9px] font-bold text-zinc-450 mb-1.5 uppercase tracking-wider dark:text-zinc-455">
                Job Description (JD) *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Paste the target role description and requirements..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="w-full bg-zinc-900 text-xs border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-crimson placeholder-life-cocoa/30 leading-relaxed dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5"
              />
            </div>

            {/* Candidate Resume Textarea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wider dark:text-zinc-455">
                  Resume Content *
                </label>
                <div className="relative">
                  <label className="cursor-pointer text-[10px] font-bold text-crimson hover:text-crimson/85 flex items-center gap-1.5 transition-all">
                    {parsing ? (
                      <>
                        <span className="h-3.5 w-3.5 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
                        <span>Extracting text...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload PDF / Word</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      disabled={parsing}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <textarea
                required
                rows={6}
                placeholder="Upload your resume file above or paste the text content here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full bg-zinc-900 text-xs border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-crimson placeholder-life-cocoa/30 leading-relaxed dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={matching || !resumeText.trim() || !jdText.trim()}
              className="w-full bg-crimson hover:bg-crimson/90 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg shadow-crimson/10 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {matching ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Calculating Match Vector...</span>
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
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white/70 border border-white/5 p-6 rounded-2xl shadow-md backdrop-blur-md space-y-6 relative overflow-hidden dark:bg-zinc-900/35 dark:border-white/5"
              >
                
                {/* Match Score Gauge */}
                <div className="flex flex-col items-center pb-5 border-b border-white/5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                    Calculated Score
                  </span>
                  <div className="text-3xl font-black text-crimson mt-2 font-geom">
                    {result.match_percentage}%
                  </div>
                  <div className="text-xs font-semibold text-zinc-350 tracking-tight mt-1 dark:text-zinc-300">
                    Resume-Role Alignment
                  </div>
                  <div className="w-full bg-zinc-900 border border-white/5 h-3 rounded-full mt-4 overflow-hidden p-0.5 dark:bg-zinc-950 dark:border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.match_percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="bg-crimson h-full rounded-full" 
                    />
                  </div>
                </div>

                {/* Explanation Card */}
                <div className="space-y-2">
                  <span className="text-[9px] text-zinc-450 block font-bold uppercase tracking-wider dark:text-zinc-500">
                    Match Explanation
                  </span>
                  <p className="text-xs text-zinc-350 leading-relaxed bg-zinc-900/40 p-4 rounded-xl border border-white/5 dark:bg-zinc-950/20 dark:text-zinc-400 dark:border-white/5">
                    {result.explanation}
                  </p>
                </div>

                {/* Matched Skills */}
                {result.matched_skills.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-[9px] text-zinc-450 block font-bold uppercase tracking-wider flex items-center gap-1.5 dark:text-zinc-500">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-450" /> Matched Skills
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.matched_skills.map((s: string, idx: number) => (
                        <span key={idx} className="text-[10px] font-bold bg-emerald-500/10 text-emerald-700 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1 dark:text-emerald-400">
                          <Check className="w-3 h-3 shrink-0" /> {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {result.missing_skills.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-[9px] text-zinc-450 block font-bold uppercase tracking-wider flex items-center gap-1.5 dark:text-zinc-500">
                      <AlertTriangle className="w-3.5 h-3.5 text-crimson" /> Missing Skills / Gaps
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_skills.map((s: string, idx: number) => (
                        <span key={idx} className="text-[10px] font-bold bg-crimson/10 text-crimson px-3 py-1 rounded-full border border-crimson/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keyword Gaps */}
                {result.keyword_gaps.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-[9px] text-zinc-450 block font-bold uppercase tracking-wider flex items-center gap-1.5 dark:text-zinc-500">
                      <Search className="w-3.5 h-3.5 text-crimson" /> Keyword Gaps
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.keyword_gaps.map((k: string, idx: number) => (
                        <span key={idx} className="text-[10px] font-bold bg-crimson/10 text-crimson px-3 py-1 rounded-full border border-crimson/20">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Likely Interview Topics */}
                {result.likely_interview_areas.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[9px] text-zinc-450 block font-bold uppercase tracking-wider flex items-center gap-1.5 dark:text-zinc-500">
                      <Lightbulb className="w-3.5 h-3.5 text-crimson" /> Likely Interview Topics
                    </span>
                    <ul className="text-xs text-white/85 list-disc list-inside space-y-2 bg-zinc-900/40 p-4 rounded-xl border border-white/5 leading-relaxed dark:bg-zinc-950/20 dark:text-zinc-400 dark:border-white/5">
                      {result.likely_interview_areas.map((t: string, idx: number) => (
                        <li key={idx} className="marker:text-crimson">{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </motion.div>
            ) : (
              <div className="bg-white/70 border border-white/5 text-center py-20 rounded-2xl flex flex-col items-center justify-center p-6 shadow-md dark:bg-zinc-900/35 dark:border-white/5">
                <FileText className="w-12 h-12 text-zinc-650 mb-4" />
                <h4 className="font-bold text-white/75 text-sm dark:text-zinc-300">No analysis generated</h4>
                <p className="text-xs text-zinc-450 max-w-xs mt-1.5 leading-relaxed dark:text-zinc-500">
                  Paste your resume text and target JD on the left panel, or upload a resume file, and click calculate to retrieve structured recruiter scorecard analytics.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </motion.div>
  );
};
