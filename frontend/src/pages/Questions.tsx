import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Plus, 
  Search, 
  BookOpen, 
  Check, 
  AlertCircle, 
  X,
  FileText,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [solvedFilter, setSolvedFilter] = useState('');

  // Selected Question for Drawer details
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

  // Add Question Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [roundType, setRoundType] = useState('Technical');
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [text, setText] = useState('');
  const [solved, setSolved] = useState(true);
  const [confidence, setConfidence] = useState(3);
  const [userNotes, setUserNotes] = useState('');

  const loadQuestions = async () => {
    setLoading(true);
    try {
      // For Phase 1 we will load seeded questions from database
      const token = localStorage.getItem('token');
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const res = await fetch(`${BASE_URL}/questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      } else {
        // Fallback mock questions in case route isn't hit
        setQuestions([
          {
            id: '1',
            company_name: 'Meta',
            role: 'SWE Backend',
            round_type: 'OA',
            topic: 'Graphs',
            subtopic: 'Traversal',
            difficulty: 'Medium',
            question_text: 'Reconstruct itinerary (Graph Flight Traversal). Given a list of tickets, reconstruct the itinerary in order.',
            solved: true,
            confidence_level: 4,
            user_notes: 'Used Eulerian path traversal (Hierholzer\'s algorithm) to build route in O(E log E) time.',
            ai_explanation: 'This problem represents a Eulerian path search. First sort destination tickets alphabetically, build adjacency list, then run DFS to reconstruct route.',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            company_name: 'Stripe',
            role: 'Software Engineer Intern',
            round_type: 'Technical',
            topic: 'APIs',
            subtopic: 'Rate Limiting',
            difficulty: 'Hard',
            question_text: 'Build a thread-safe token bucket rate limiter middleware in Python.',
            solved: true,
            confidence_level: 5,
            user_notes: 'Used threading.Lock to synchronize token depletion and calculated refills based on timestamps.',
            ai_explanation: 'Thread-safety is achieved by locking during request checks. Replenishment: min(capacity, current + rate * elapsed_time).',
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    
    const payload = {
      company_name: company || null,
      role: role || null,
      round_type: roundType,
      topic,
      subtopic: subtopic || null,
      difficulty,
      question_text: text,
      source: 'real_interview',
      solved,
      confidence_level: confidence,
      user_notes: userNotes || null,
      ai_explanation: 'AI explanation will be updated automatically in Phase 2.'
    };

    try {
      const res = await fetch(`${BASE_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAddModal(false);
        // Reset form
        setCompany('');
        setRole('');
        setTopic('');
        setSubtopic('');
        setText('');
        setUserNotes('');
        await loadQuestions();
      } else {
        alert('Failed to log question');
      }
    } catch {
      alert('Error connecting to question bank api');
    }
  };

  // Filter logic
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question_text.toLowerCase().includes(search.toLowerCase()) ||
                          q.topic.toLowerCase().includes(search.toLowerCase()) ||
                          (q.company_name && q.company_name.toLowerCase().includes(search.toLowerCase()));
    const matchesDiff = difficultyFilter ? q.difficulty === difficultyFilter : true;
    const matchesSolved = solvedFilter 
      ? (solvedFilter === 'Solved' ? q.solved === true : q.solved === false) 
      : true;
    return matchesSearch && matchesDiff && matchesSolved;
  });

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'Easy': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'Medium': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400';
      case 'Hard': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans relative min-h-[80vh]">
      {/* 3D Ambient backdrop Blob */}
      <div className="absolute -top-12 right-1/4 w-96 h-96 bg-crimson/5 rounded-full blur-3xl pointer-events-none animate-blob"></div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-white font-geom uppercase">
            Personal Question Bank
          </h2>
          <p className="text-xs text-zinc-400 mt-2 max-w-lg leading-relaxed font-semibold uppercase tracking-wider">
            Log, categorize, and revise coding questions and system design scenarios encountered in interviews.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-crimson hover:bg-crimson/90 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-crimson/15 flex items-center gap-2 max-w-max transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Log Question
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-zinc-950/60 border border-white/5 p-4 rounded-2xl shadow-md backdrop-blur-md">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search questions by topic, text, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 text-xs pl-10 pr-4 py-3 rounded-xl outline-none border border-white/5 text-white placeholder-life-cocoa/40 transition-all focus:border-crimson dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-zinc-900 text-xs px-4 py-3 rounded-xl outline-none border border-white/5 text-white transition-all focus:border-crimson dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select
            value={solvedFilter}
            onChange={(e) => setSolvedFilter(e.target.value)}
            className="bg-zinc-900 text-xs px-4 py-3 rounded-xl outline-none border border-white/5 text-white transition-all focus:border-crimson dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5"
          >
            <option value="">All Statuses</option>
            <option value="Solved">Solved</option>
            <option value="Unsolved">Unsolved</option>
          </select>
        </div>
      </div>

      {/* Questions list Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-3 border-crimson/25 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-3 border-crimson border-t-transparent animate-spin"></div>
          </div>
        </div>
      ) : filteredQuestions.length > 0 ? (
        <div className="bg-white border border-white/5 rounded-2xl overflow-hidden shadow-sm dark:bg-zinc-900/40 dark:border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 text-zinc-450 border-b border-white/5 dark:bg-zinc-800/50 dark:border-zinc-800">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">Question Description</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">Company</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">Topic</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">Difficulty</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-life-cocoa/5 dark:divide-slate-800/60">
                {filteredQuestions.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    className="hover:bg-zinc-900/40 dark:hover:bg-zinc-800/20 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <span className="text-xs font-semibold text-white dark:text-slate-200 block truncate max-w-sm">
                        {q.question_text}
                      </span>
                      {q.subtopic && (
                        <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">{q.subtopic}</span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-bold text-white dark:text-slate-300">
                      {q.company_name || 'General'}
                    </td>
                    <td className="p-4 text-xs font-medium text-zinc-400 dark:text-slate-400">
                      {q.topic}
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="p-4">
                      {q.solved ? (
                        <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 inline-block">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="p-1 rounded-full bg-crimson/10 text-crimson inline-block">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-950/60 border border-white/5 text-center py-20 rounded-2xl shadow-lg">
          <BookOpen className="w-10 h-10 text-zinc-650 mx-auto mb-4" />
          <h4 className="font-bold text-white text-sm uppercase tracking-wider font-geom">No questions logged</h4>
          <p className="text-[11px] text-zinc-450 mt-2 font-semibold uppercase tracking-wider">Start building your placement bank by logging a question.</p>
        </div>
      )}

      {/* Selected Question Detail Drawer */}
      <AnimatePresence>
        {selectedQuestion && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-white/5 shadow-2xl z-45 flex flex-col justify-between dark:bg-zinc-900 dark:border-white/5"
          >
            
            <div className="p-6 bg-zinc-900 border-b border-white/5 flex items-start justify-between dark:bg-zinc-950/20 dark:border-white/5">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-450 block">Question Details</span>
                <h3 className="font-extrabold text-white dark:text-slate-100 text-base mt-0.5 font-geom">
                  {selectedQuestion.company_name || 'General'} | {selectedQuestion.topic}
                </h3>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-white/5 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Question Text */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-zinc-450 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-crimson" /> Question Statement
                </h4>
                <p className="text-xs text-zinc-350 font-medium whitespace-pre-wrap bg-zinc-900/40 p-4 border border-white/5 rounded-2xl dark:bg-zinc-900/40 dark:border-white/5">
                  {selectedQuestion.question_text}
                </p>
              </div>

              {/* Revision metadata */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-900 border border-white/5 rounded-xl text-center dark:bg-zinc-950/20 dark:border-white/5">
                  <span className="text-[9px] text-zinc-450 block font-semibold uppercase">Difficulty</span>
                  <span className="text-xs font-bold text-white mt-1 block dark:text-zinc-200">
                    {selectedQuestion.difficulty}
                  </span>
                </div>
                <div className="p-3 bg-zinc-900 border border-white/5 rounded-xl text-center dark:bg-zinc-900/20 dark:border-white/5">
                  <span className="text-[9px] text-zinc-450 block font-semibold uppercase">Solved?</span>
                  <span className="text-xs font-bold text-white mt-1 block dark:text-zinc-200">
                    {selectedQuestion.solved ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="p-3 bg-zinc-900 border border-white/5 rounded-xl text-center dark:bg-zinc-900/20 dark:border-white/5">
                  <span className="text-[9px] text-zinc-450 block font-semibold uppercase">Confidence</span>
                  <span className="text-xs font-bold text-white mt-1 block dark:text-zinc-200">
                    {selectedQuestion.confidence_level}/5
                  </span>
                </div>
              </div>

              {/* User Notes */}
              {selectedQuestion.user_notes && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-zinc-450 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-crimson" /> Student Notes
                  </h4>
                  <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3.5 text-xs text-zinc-350 dark:bg-zinc-950/20 dark:border-white/5 dark:text-zinc-400 whitespace-pre-wrap">
                    {selectedQuestion.user_notes}
                  </div>
                </div>
              )}

              {/* AI Explanation */}
              {selectedQuestion.ai_explanation && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-450 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-crimson fill-crimson/10" /> AI Explanation & Optimal Derivation
                  </h4>
                  <div className="bg-crimson/5 border border-crimson/10 rounded-xl p-3.5 text-xs text-white dark:bg-zinc-900 dark:border-white/5 dark:text-zinc-300 whitespace-pre-wrap">
                    {selectedQuestion.ai_explanation}
                  </div>
                </div>
              )}

            </div>

            <div className="p-6 border-t border-white/5 flex justify-end bg-zinc-900 dark:bg-zinc-905/20 dark:border-white/5">
              <button
                onClick={() => setSelectedQuestion(null)}
                className="px-4 py-2 border border-white/5 bg-zinc-900 text-xs font-bold text-zinc-350 rounded-xl hover:bg-white/5 dark:border-white/5 dark:bg-zinc-950/40 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-all"
              >
                Close Panel
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Question Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white border border-white/5 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative font-sans dark:bg-zinc-900 dark:border-white/5">
              
              <div className="p-6 bg-zinc-900 text-white border-b border-white/5 flex items-center justify-between dark:bg-zinc-950/20 dark:border-white/5">
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider dark:text-white font-geom">
                  Log New Placement Question
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:bg-white/5 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleAddQuestion} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-450 mb-1 uppercase dark:text-zinc-400">Company name</label>
                    <input
                      type="text"
                      placeholder="e.g. Meta (Optional)"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-zinc-900 text-xs border border-white/5 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-crimson placeholder-life-cocoa/30 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-white/5 dark:focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-450 mb-1 uppercase dark:text-zinc-400">Role / Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. SDE Backend"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-zinc-900 text-xs border border-white/5 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-crimson placeholder-life-cocoa/30 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-white/5 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-450 mb-1 uppercase dark:text-zinc-400">Topic *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Graphs"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-zinc-900 text-xs border border-white/5 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-crimson placeholder-life-cocoa/30 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-white/5 dark:focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-450 mb-1 uppercase dark:text-zinc-400">Subtopic</label>
                    <input
                      type="text"
                      placeholder="e.g. DFS Cycle"
                      value={subtopic}
                      onChange={(e) => setSubtopic(e.target.value)}
                      className="w-full bg-zinc-900 text-xs border border-white/5 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-crimson placeholder-life-cocoa/30 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-white/5 dark:focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-450 mb-1 uppercase dark:text-zinc-400">Round</label>
                    <select
                      value={roundType}
                      onChange={(e) => setRoundType(e.target.value)}
                      className="w-full bg-zinc-900 text-xs border border-white/5 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-crimson dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-white/5 dark:focus:border-indigo-500"
                    >
                      <option value="OA">Online Assessment</option>
                      <option value="Technical">Technical Round</option>
                      <option value="HR">HR Interview</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-450 mb-1 uppercase dark:text-zinc-400">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-zinc-900 text-xs border border-white/5 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-crimson dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-white/5 dark:focus:border-indigo-500"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-450 mb-1 uppercase dark:text-zinc-400">Confidence ({confidence}/5)</label>
                    <select
                      value={confidence}
                      onChange={(e) => setConfidence(parseInt(e.target.value))}
                      className="w-full bg-zinc-900 text-xs border border-white/5 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-crimson dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5 dark:focus:border-indigo-500"
                    >
                      <option value="1">1 - Extremely Weak</option>
                      <option value="2">2 - Weak</option>
                      <option value="3">3 - Average</option>
                      <option value="4">4 - Good</option>
                      <option value="5">5 - Excellent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-450 mb-1 uppercase dark:text-zinc-400">Solved?</label>
                    <div className="flex gap-4 mt-2">
                      <label className="inline-flex items-center gap-1.5 text-xs text-white dark:text-slate-300">
                        <input
                          type="radio"
                          checked={solved === true}
                          onChange={() => setSolved(true)}
                          className="accent-life-vermilion"
                        />
                        Yes
                      </label>
                      <label className="inline-flex items-center gap-1.5 text-xs text-white dark:text-slate-300">
                        <input
                          type="radio"
                          checked={solved === false}
                          onChange={() => setSolved(false)}
                          className="accent-life-vermilion"
                        />
                        No
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-450 mb-1 uppercase dark:text-zinc-400">Question Statement *</label>
                  <textarea
                    required
                    placeholder="Paste question statement text details..."
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-zinc-900 text-xs border border-white/5 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-crimson placeholder-life-cocoa/30 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-white/5 dark:focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-450 mb-1 uppercase dark:text-zinc-400">Personal Notes</label>
                  <textarea
                    placeholder="Add your notes or code snippet link..."
                    rows={2}
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    className="w-full bg-zinc-900 text-xs border border-white/5 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-crimson placeholder-life-cocoa/30 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-white/5 dark:focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-white/5 bg-zinc-900 text-xs font-bold text-zinc-400 rounded-xl hover:bg-white/5 dark:border-white/5 dark:bg-zinc-950/40 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-crimson hover:bg-crimson/90 text-white rounded-xl text-xs font-bold shadow-lg shadow-crimson/15"
                  >
                    Log Entry
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
