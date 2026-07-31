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
    <div className="space-y-8 pb-12 font-sans relative min-h-[85vh]">
      {/* 3D Ambient backdrop Blob */}
      <div className="absolute -top-12 right-1/4 w-96 h-96 bg-life-vermilion/5 rounded-full blur-3xl pointer-events-none animate-blob"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-life-cocoa dark:text-white font-geom flex items-center gap-2">
            <Brain className="w-6.5 h-6.5 text-life-vermilion fill-life-vermilion/10" />
            AI Placement Memory Vault
          </h2>
          <p className="text-sm text-life-cocoa/60 mt-1 max-w-lg leading-relaxed dark:text-zinc-400">
            Query the vector database to view RAG memories logged from interview journals, resumes, and preparation strategies.
          </p>
        </div>
        <button
          onClick={loadMemories}
          className="p-3 border border-life-cocoa/10 hover:bg-life-cocoa/5 text-life-cocoa/60 rounded-xl transition-all dark:border-slate-800 dark:hover:bg-slate-900"
          title="Reload Memory Logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Semantic Vector Search Box */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 bg-white/70 border border-life-cocoa/5 p-4 rounded-2xl shadow-md backdrop-blur-md dark:bg-zinc-900/35 dark:border-white/5">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-life-cocoa/40">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search semantic history (e.g. 'cycle detection DFS' or 'database indexing')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-life-sand/90 text-xs pl-10 pr-4 py-3 rounded-xl outline-none border border-life-cocoa/10 text-life-cocoa placeholder-life-cocoa/40 transition-all focus:border-life-vermilion dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-white/5"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="bg-life-vermilion hover:bg-life-vermilion/90 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-life-vermilion/10 shrink-0 transition-all active:scale-95"
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
            className="px-4 py-3 bg-life-sand hover:bg-life-sand/80 text-life-cocoa/85 font-bold text-xs rounded-xl shrink-0 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            Clear Search
          </button>
        )}
      </form>

      {/* Memory Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-3 border-life-vermilion/25 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-3 border-life-vermilion border-t-transparent animate-spin"></div>
          </div>
        </div>
      ) : memories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="bg-white border border-life-cocoa/5 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group dark:bg-zinc-900/45 dark:border-white/5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${getContentTypeColor(mem.content_type)}`}>
                      {mem.content_type}
                    </span>
                    {isSearchResult && (
                      <span className="text-[9px] bg-life-sand/80 border border-life-cocoa/10 text-life-cocoa px-1.5 py-0.5 rounded font-bold">
                        Vector Match
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(mem.id)}
                    className="p-1 rounded text-life-cocoa/40 hover:bg-life-sand hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Memory Vector"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-life-cocoa/85 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                  {mem.content}
                </p>
              </div>

              {/* Metadata tags & timestamp footer */}
              <div className="border-t border-life-cocoa/5 pt-3.5 flex flex-wrap items-center justify-between gap-2.5 text-[9px] text-life-cocoa/40 font-semibold uppercase dark:border-slate-800/80">
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
        <div className="bg-white/70 border border-life-cocoa/5 text-center py-20 rounded-2xl shadow-sm dark:bg-zinc-900/35 dark:border-white/5">
          <Database className="w-12 h-12 text-life-cocoa/30 mx-auto mb-3" />
          <h4 className="font-bold text-life-cocoa/75 text-sm dark:text-slate-350">Memory vault empty</h4>
          <p className="text-xs text-life-cocoa/50 mt-1 max-w-xs mx-auto">
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
