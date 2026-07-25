import React, { useEffect, useState } from 'react';

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
    <div className="space-y-6 min-h-[80vh]">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Personal Question Bank
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Log, categorize, and revise coding questions and system design scenarios encountered in interviews.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/15 flex items-center gap-2 max-w-max transition-all"
        >
          <Plus className="w-4 h-4" />
          Log Question
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
            placeholder="Search questions by topic, text, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/40 text-sm pl-9 pr-4 py-2 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/40 text-xs px-3 py-2 rounded-xl outline-none border-none text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-brand-500 transition-all"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select
            value={solvedFilter}
            onChange={(e) => setSolvedFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/40 text-xs px-3 py-2 rounded-xl outline-none border-none text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-brand-500 transition-all"
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
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-brand-500 border-t-transparent" />
        </div>
      ) : filteredQuestions.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Question Description</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Company</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Topic</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Difficulty</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredQuestions.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block truncate max-w-sm">
                        {q.question_text}
                      </span>
                      {q.subtopic && (
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{q.subtopic}</span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {q.company_name || 'General'}
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {q.topic}
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="p-4">
                      {q.solved ? (
                        <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-block">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="p-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 inline-block">
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center py-16 rounded-2xl">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No questions logged</h4>
          <p className="text-xs text-slate-400 mt-1">Start building your placement bank by logging a question.</p>
        </div>
      )}

      {/* Selected Question Detail Drawer */}
      {selectedQuestion && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-900 shadow-2xl z-20 flex flex-col justify-between transition-colors duration-200">
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex items-start justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Question Details</span>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base mt-0.5">
                {selectedQuestion.company_name || 'General'} | {selectedQuestion.topic}
              </h3>
            </div>
            <button
              onClick={() => setSelectedQuestion(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Question Text */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-brand-500" /> Question Statement
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/40 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                {selectedQuestion.question_text}
              </p>
            </div>

            {/* Revision metadata */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/60 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 block font-semibold uppercase">Difficulty</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {selectedQuestion.difficulty}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/60 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 block font-semibold uppercase">Solved?</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {selectedQuestion.solved ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/60 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 block font-semibold uppercase">Confidence</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {selectedQuestion.confidence_level}/5
                </span>
              </div>
            </div>

            {/* User Notes */}
            {selectedQuestion.user_notes && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" /> Student Notes
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/60 rounded-xl p-3.5 text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {selectedQuestion.user_notes}
                </div>
              </div>
            )}

            {/* AI Explanation */}
            {selectedQuestion.ai_explanation && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-current" /> AI Explanation & Optimal Derivation
                </h4>
                <div className="bg-brand-50/20 dark:bg-slate-900 border border-brand-100/30 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedQuestion.ai_explanation}
                </div>
              </div>
            )}

          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-900 flex justify-end bg-slate-50 dark:bg-slate-900/20">
            <button
              onClick={() => setSelectedQuestion(null)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Close Panel
            </button>
          </div>

        </div>
      )}

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative font-sans">
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">
                Log New Placement Question
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Company name</label>
                  <input
                    type="text"
                    placeholder="e.g. Meta (Optional)"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Role / Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. SDE Backend"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Topic *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Graphs"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Subtopic</label>
                  <input
                    type="text"
                    placeholder="e.g. DFS Cycle"
                    value={subtopic}
                    onChange={(e) => setSubtopic(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Round</label>
                  <select
                    value={roundType}
                    onChange={(e) => setRoundType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="OA">Online Assessment</option>
                    <option value="Technical">Technical Round</option>
                    <option value="HR">HR Interview</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Confidence ({confidence}/5)</label>
                  <select
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="1">1 - Extremely Weak</option>
                    <option value="2">2 - Weak</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Solved?</label>
                  <div className="flex gap-4 mt-2">
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        checked={solved === true}
                        onChange={() => setSolved(true)}
                        className="accent-brand-500"
                      />
                      Yes
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        checked={solved === false}
                        onChange={() => setSolved(false)}
                        className="accent-brand-500"
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Question Statement *</label>
                <textarea
                  required
                  placeholder="Paste question statement text details..."
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Personal Notes</label>
                <textarea
                  placeholder="Add your notes or code snippet link..."
                  rows={2}
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
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
                  Log Entry
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
