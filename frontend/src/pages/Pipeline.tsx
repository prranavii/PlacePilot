import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  MapPin, 
  Sparkles,
  IndianRupee
} from 'lucide-react';

const STAGES = [
  'Wishlist',
  'Applied',
  'Online Assessment',
  'Technical Interview',
  'Offer'
];

export const Pipeline: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      const data = await api.applications.list();
      setApplications(data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;

    // Optimistically update the UI state
    const originalApps = [...applications];
    const targetApp = applications.find(a => a.id === id);
    if (!targetApp || targetApp.current_stage === targetStage) return;

    setApplications(apps => 
      apps.map(a => a.id === id ? { ...a, current_stage: targetStage } : a)
    );
    setUpdatingId(id);

    try {
      await api.applications.update(id, { current_stage: targetStage });
    } catch (err) {
      // Revert if API request fails
      setApplications(originalApps);
      alert('Failed to update stage pipeline. Reverting changes.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'border-l-4 border-rose-500';
      case 'Medium': return 'border-l-4 border-amber-500';
      default: return 'border-l-4 border-slate-300 dark:border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[75vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Visual Placement Pipeline
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Drag and drop cards across columns to update application stages instantly.
        </p>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start">
        {STAGES.map((stage) => {
          const stageApps = applications.filter((a) => a.current_stage === stage);
          return (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 min-h-[70vh] flex flex-col gap-3 transition-all"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60 mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">
                  {stage}
                </span>
                <span className="text-[10px] bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold px-2 py-0.5 rounded-full shrink-0">
                  {stageApps.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[60vh] pr-1">
                {stageApps.length > 0 ? (
                  stageApps.map((app) => (
                    <div
                      key={app.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      className={`bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-150 relative overflow-hidden ${getPriorityColor(app.priority)} ${
                        updatingId === app.id ? 'opacity-40 animate-pulse' : ''
                      }`}
                    >
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs tracking-tight truncate">
                        {app.company_name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                        {app.role}
                      </p>

                      <div className="mt-3.5 space-y-1.5 border-t border-slate-100 dark:border-slate-850/60 pt-3">
                        {app.location && (
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-medium">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {app.location}
                          </div>
                        )}
                        {app.package_ctc && (
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-medium">
                            <IndianRupee className="w-3 h-3 text-slate-400 shrink-0" />
                            {app.package_ctc}
                          </div>
                        )}
                      </div>

                      {/* AI Prepare Tag Indicator */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[8px] text-slate-400 uppercase tracking-widest font-semibold">
                          Priority: {app.priority}
                        </span>
                        {app.personal_readiness < 65 && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 animate-pulse">
                            <Sparkles className="w-2.5 h-2.5" /> Boost
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-8 text-center px-2">
                    <span className="text-[10px] text-slate-400">Drag items here</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
