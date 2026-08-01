import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Sparkles,
  IndianRupee,
  Activity,
  Target
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
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;

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
      setApplications(originalApps);
      alert('Failed to update stage pipeline. Reverting changes.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStageBorderColor = (stage: string) => {
    switch (stage) {
      case 'Wishlist': return 'border-t-4 border-t-zinc-700';
      case 'Applied': return 'border-t-4 border-t-crimson';
      case 'Online Assessment': return 'border-t-4 border-t-teal-500';
      case 'Technical Interview': return 'border-t-4 border-t-amber-500';
      case 'Offer': return 'border-t-4 border-t-emerald-500';
      default: return 'border-t-4 border-t-zinc-800';
    }
  };

  const getStageHeaderGlow = (stage: string) => {
    switch (stage) {
      case 'Wishlist': return 'text-zinc-300 bg-white/5 border-white/10';
      case 'Applied': return 'text-crimson bg-crimson/5 border-crimson/20';
      case 'Online Assessment': return 'text-teal-600 bg-teal-500/5 border-teal-500/20';
      case 'Technical Interview': return 'text-amber-700 bg-amber-500/5 border-amber-500/20';
      case 'Offer': return 'text-emerald-700 bg-emerald-500/5 border-emerald-500/20';
      default: return 'text-zinc-400 bg-white/5 border-white/5';
    }
  };

  const getPriorityDot = (p: string) => {
    switch (p) {
      case 'High': return 'bg-rose-500';
      case 'Medium': return 'bg-amber-500';
      default: return 'bg-zinc-400';
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
      <div className="absolute -top-12 right-1/4 w-96 h-96 bg-crimson/5 rounded-full blur-3xl pointer-events-none animate-blob"></div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-white font-geom uppercase">
            Visual Placement Pipeline
          </h2>
          <p className="text-xs text-zinc-400 mt-2 max-w-lg leading-relaxed font-semibold uppercase tracking-wider">
            Manage your recruitment phases interactively. Drag and drop cards across columns to update application stages instantly.
          </p>
        </div>
        <div className="flex items-center gap-2.5 text-[9px] font-bold bg-zinc-950/60 border border-white/5 px-4 py-2.5 rounded-full text-white shadow-sm uppercase tracking-wider">
          <Activity className="w-4 h-4 text-crimson animate-pulse" />
          <span>Real-time Status Tracking Active</span>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 overflow-x-auto pb-6 items-start">
        {STAGES.map((stage) => {
          const stageApps = applications.filter((a) => a.current_stage === stage);
          return (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="bg-zinc-950/45 border border-white/5 rounded-2xl p-4 min-h-[70vh] flex flex-col gap-4 shadow-md backdrop-blur-sm"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-1 shrink-0">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStageHeaderGlow(stage)}`}>
                  {stage}
                </span>
                <span className="text-xs bg-zinc-900 border border-white/5 text-zinc-300 font-bold px-2 py-0.5 rounded-lg shrink-0 dark:bg-zinc-900 dark:border-white/5 dark:text-zinc-400">
                  {stageApps.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[62vh] pr-1 scrollbar-thin">
                <AnimatePresence mode="popLayout">
                  {stageApps.length > 0 ? (
                    stageApps.map((app) => (
                      <motion.div
                        layout
                        key={app.id}
                        draggable={true}
                        onDragStart={(e: any) => handleDragStart(e, app.id)}
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ cursor: 'grabbing' }}
                        className={`premium-card cursor-grab p-4 relative overflow-hidden ${getStageBorderColor(stage)} ${
                          updatingId === app.id ? 'opacity-40 animate-pulse' : ''
                        }`}
                      >
                        <h4 className="font-extrabold text-white text-sm tracking-tight truncate dark:text-zinc-200">
                          {app.company_name}
                        </h4>
                        <p className="text-xs text-zinc-400 font-medium truncate mt-1 dark:text-zinc-400">
                          {app.role}
                        </p>

                        <div className="mt-4 space-y-2 border-t border-white/5 pt-3.5 dark:border-white/5">
                          {app.location && (
                            <div className="flex items-center gap-2 text-[10px] text-zinc-450 font-semibold dark:text-zinc-500">
                              <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 dark:text-zinc-500" />
                              <span className="truncate">{app.location}</span>
                            </div>
                          )}
                          {app.package_ctc && (
                            <div className="flex items-center gap-2 text-[10px] text-zinc-450 font-semibold dark:text-zinc-500">
                              <IndianRupee className="w-3.5 h-3.5 text-zinc-500 shrink-0 dark:text-zinc-500" />
                              <span>{app.package_ctc}</span>
                            </div>
                          )}
                        </div>

                        {/* Card Footer tags */}
                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3.5 dark:border-white/5">
                          <span className="text-[9px] text-zinc-450 uppercase tracking-widest font-bold flex items-center gap-1.5 dark:text-zinc-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(app.priority)}`} />
                            {app.priority}
                          </span>
                          {app.personal_readiness < 65 ? (
                            <span className="text-[9px] bg-crimson/10 text-crimson px-2 py-0.5 rounded font-bold flex items-center gap-0.5 animate-pulse">
                              <Sparkles className="w-3 h-3 fill-crimson/10" /> Boost
                            </span>
                          ) : (
                            <span className="text-[9px] text-crimson font-bold bg-crimson/10 px-2 py-0.5 rounded flex items-center gap-0.5">
                              <Target className="w-3 h-3" /> {app.personal_readiness}%
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="border border-dashed border-white/5 rounded-2xl py-12 text-center px-4 dark:border-white/5">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block dark:text-zinc-500">Column Empty</span>
                      <span className="text-[9px] text-zinc-700 block mt-1 dark:text-zinc-600">Drag applications here</span>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          );
        })}
      </div>

    </motion.div>
  );
};
