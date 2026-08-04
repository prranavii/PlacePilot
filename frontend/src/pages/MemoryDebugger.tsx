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
      <div className="absolute -top-12 right-1/4 w-96 h-96 bg-vermilion/5 rounded-full blur-3xl pointer-events-none animate-blob"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-cocoa font-serif uppercase flex items-center gap-2">
            <Brain className="w-6.5 h-6.5 text-vermilion fill-vermilion/10" />
            AI Placement Memory Vault
          </h2>
          <p className="text-xs text-cocoa/60 mt-2 max-w-lg leading-relaxed font-semibold uppercase tracking-wider">
            Query the vector database to view RAG memories logged from interview journals, resumes, and preparation strategies.
          </p>
        </div>
        <button
          onClick={loadMemories}
          className="p-3 border border-cocoa/10 hover:bg-cocoa/5 text-cocoa/60 rounded-[1.2rem] transition-all dark:border-slate-800 dark:hover:bg-slate-900"
          title="Reload Memory Logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Semantic Vector Search Box */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 bg-white border border-cocoa/10 p-4 rounded-[1.5rem] shadow-md backdrop-blur-md">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cocoa/40">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search semantic history (e.g. 'cycle detection DFS' or 'database indexing')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sand text-xs pl-10 pr-4 py-3 rounded-[1.2rem] outline-none border border-cocoa/10 text-cocoa placeholder-life-cocoa/40 transition-all focus:border-vermilion dark:bg-sand dark:text-cocoa/80 dark:border-cocoa/10"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="bg-vermilion hover:bg-vermilion/90 text-cocoa font-bold text-xs px-5 py-3 rounded-[1.2rem] shadow-lg shadow-vermilion/10 shrink-0 transition-all active:scale-95"
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
            className="px-4 py-3 bg-sand hover:bg-sand/80 text-cocoa/85 font-bold text-xs rounded-[1.2rem] shrink-0 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            Clear Search
          </button>
        )}
      </form>

      {/* Memory Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-3 border-vermilion/25 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-3 border-vermilion border-t-transparent animate-spin"></div>
          </div>
        </div>
      ) : memories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="bg-sand border border-cocoa/10 rounded-[1.5rem] p-5 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${getContentTypeColor(mem.content_type)}`}>
                      {mem.content_type}
                    </span>
                    {isSearchResult && (
                      <span className="text-[9px] bg-sand/80 border border-cocoa/10 text-cocoa px-1.5 py-0.5 rounded font-bold">
                        Vector Match
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(mem.id)}
                    className="p-1 rounded text-cocoa/40 hover:bg-sand hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Memory Vector"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-cocoa/85 dark:text-cocoa/80 leading-relaxed font-medium whitespace-pre-wrap">
                  {mem.content}
                </p>
              </div>

              {/* Metadata tags & timestamp footer */}
              <div className="border-t border-cocoa/10 pt-3.5 flex flex-wrap items-center justify-between gap-2.5 text-[9px] text-cocoa/40 font-semibold uppercase dark:border-slate-800/80">
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
        <div className="bg-white border border-cocoa/10 text-center py-20 rounded-[1.5rem] shadow-lg">
          <Database className="w-12 h-12 text-cocoa/30 mx-auto mb-4" />
          <h4 className="font-bold text-cocoa text-sm uppercase tracking-wider font-serif">Memory vault empty</h4>
          <p className="text-[11px] text-zinc-455 mt-2.5 max-w-xs mx-auto font-semibold uppercase tracking-wider">
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
