import React, { useEffect, useState } from 'react';
import { 
  Brain, 
  Search, 
  Trash2, 
  RefreshCw, 
  Database,
  Clock,
  Code
} from 'lucide-react';

export const MemoryDebugger: React.FC = () => {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [isSearchResult, setIsSearchResult] = useState(false);

  const loadMemories = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    
    try {
      const res = await fetch(`${BASE_URL}/memory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
        setIsSearchResult(false);
      }
    } catch (err) {
      console.error('Failed to load memory vault logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      await loadMemories();
      return;
    }

    setSearching(true);
    const token = localStorage.getItem('token');
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

    try {
      const res = await fetch(`${BASE_URL}/memory/search?q=${encodeURIComponent(searchQuery)}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
        setIsSearchResult(true);
      } else {
        alert('Semantic search failed');
      }
    } catch {
      alert('Error searching memories');
    } finally {
      setSearching(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory vector log? This action is irreversible.')) return;
    const token = localStorage.getItem('token');
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

    try {
      const res = await fetch(`${BASE_URL}/memory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMemories(prev => prev.filter(m => m.id !== id));
      } else {
        alert('Failed to delete memory item');
      }
    } catch {
      alert('Error deleting memory item');
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'interview_feedback': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400';
      case 'resume_parse': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6 font-sans min-h-[85vh]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Brain className="w-6.5 h-6.5 text-brand-500 fill-brand-500/10" />
            AI Placement Memory Vault
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Query the vector database to view RAG memories logged from interview journals, resumes, and preparation strategies.
          </p>
        </div>
        <button
          onClick={loadMemories}
          className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 rounded-xl transition-all"
          title="Reload Memory Logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Semantic Vector Search Box */}
      <form onSubmit={handleSearch} className="flex gap-2.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search semantic history (e.g. 'cycle detection DFS' or 'database indexing')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/40 text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-brand-500/10 shrink-0"
        >
          {searching ? 'Querying...' : 'Semantic Query'}
        </button>
        {isSearchResult && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              loadMemories();
            }}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
          >
            Clear Search
          </button>
        )}
      </form>

      {/* Memory Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-brand-500 border-t-transparent" />
        </div>
      ) : memories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${getContentTypeColor(mem.content_type)}`}>
                      {mem.content_type}
                    </span>
                    {isSearchResult && (
                      <span className="text-[9px] bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 px-1.5 py-0.5 rounded font-bold">
                        Vector Match
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(mem.id)}
                    className="p-1 rounded text-slate-400 hover:bg-rose-50 hover:text-rose-650 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Memory Vector"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-medium whitespace-pre-wrap">
                  {mem.content}
                </p>
              </div>

              {/* Metadata tags & timestamp footer */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3.5 flex flex-wrap items-center justify-between gap-2.5 text-[9px] text-slate-400 font-semibold uppercase">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(mem.created_at).toLocaleDateString()}
                </span>
                {mem.metadata_info && Object.keys(mem.metadata_info).length > 0 && (
                  <span className="flex items-center gap-1 max-w-[200px] truncate" title={JSON.stringify(mem.metadata_info)}>
                    <Code className="w-3.5 h-3.5 shrink-0" />
                    Metadata: {JSON.stringify(mem.metadata_info)}
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center py-20 rounded-2xl shadow-sm">
          <Database className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Memory vault empty</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {isSearchResult 
              ? 'No semantic matches found for this query in the vector database.' 
              : 'Add applications, log interview journals, or paste resumes to populate memories.'
            }
          </p>
        </div>
      )}

    </div>
  );
};
