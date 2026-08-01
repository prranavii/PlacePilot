import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Clock, 
  GraduationCap, 
  CheckCircle, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  CalendarDays,
  Target,
  Flame
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const apps = await api.applications.list();
        setApplications(apps);
        
        // Collate events from all applications
        const allEvents: any[] = [];
        for (const app of apps) {
          try {
            const evts = await api.applications.events(app.id);
            // Append company name to events for context
            evts.forEach((e: any) => {
              allEvents.push({
                ...e,
                company_name: app.company_name,
                role: app.role
              });
            });
          } catch {
            // Ignore single app event fetch errors
          }
        }
        // Sort events by date
        allEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
        setRecentEvents(allEvents.filter(e => e.status === 'Scheduled').slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Compute metrics
  const totalApps = applications.length;
  const activeApps = applications.filter(a => 
    !['Offer', 'Rejected', 'Withdrawn'].includes(a.current_stage)
  ).length;
  const oaCount = applications.filter(a => a.current_stage === 'Online Assessment').length;
  const interviewCount = applications.filter(a => 
    ['Technical Interview', 'HR Interview'].includes(a.current_stage)
  ).length;
  const offerCount = applications.filter(a => a.current_stage === 'Offer').length;
  
  const avgReadiness = totalApps > 0 
    ? Math.round(applications.reduce((acc, a) => acc + a.personal_readiness, 0) / totalApps)
    : 50;

  // Funnel calculations
  const stageStats = [
    { name: 'Wishlist', value: applications.filter(a => a.current_stage === 'Wishlist').length },
    { name: 'Applied', value: applications.filter(a => a.current_stage === 'Applied').length },
    { name: 'OA', value: oaCount },
    { name: 'Interview', value: interviewCount },
    { name: 'Offer', value: offerCount }
  ];

  // Mock activity data for charts (weekly timeline)
  const chartData = [
    { name: 'Mon', apps: 1, prepMinutes: 45 },
    { name: 'Tue', apps: 3, prepMinutes: 90 },
    { name: 'Wed', apps: 4, prepMinutes: 120 },
    { name: 'Thu', apps: 4, prepMinutes: 60 },
    { name: 'Fri', apps: 5, prepMinutes: 180 },
    { name: 'Sat', apps: 6, prepMinutes: 200 },
    { name: 'Sun', apps: 7, prepMinutes: 150 },
  ];

  // Hardcoded dashboard elements to demonstrate Phase 1 completion beautifully
  const weakTopics = [
    { topic: 'Graph Implementations', status: 'Requires Timed Practice', score: 58 },
    { topic: 'DBMS Indexing', status: 'Revise B+ Tree structures', score: 64 },
    { topic: 'Computer Networks (TCP/UDP)', status: 'Revise handshake flow', score: 70 }
  ];

  const missionTasks = [
    { id: 1, title: 'Solve 2 Graph traversal cycle detection questions', duration: '45m', priority: 'High', completed: false },
    { id: 2, title: 'Revise B+ Tree index layouts', duration: '30m', priority: 'Medium', completed: false },
    { id: 3, title: 'Mock Interview practice (Meta backend focus)', duration: '20m', priority: 'High', completed: false }
  ];

  const [tasks, setTasks] = useState(missionTasks);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-life-vermilion/25"></div>
          <div className="absolute inset-0 rounded-full border-4 border-life-vermilion border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  const nextInterview = recentEvents[0];
  const nextInterviewCompany = nextInterview ? nextInterview.company_name : '';

  const getDaysRemainingText = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Scheduled in past';
    if (diffDays === 0) return 'Scheduled for today';
    if (diffDays === 1) return 'Scheduled for tomorrow';
    return `Scheduled in ${diffDays} days`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12 font-sans relative"
    >
      {/* 3D Ambient Glowing backdrop Blobs */}
      <div className="absolute -top-12 -left-12 w-96 h-96 bg-life-vermilion/5 rounded-full blur-3xl pointer-events-none animate-blob"></div>
      <div className="absolute top-1/2 right-12 w-80 h-80 bg-life-cocoa/5 rounded-full blur-3xl pointer-events-none animate-blob animation-delay-2000"></div>

      {/* Top Welcome Title & Premium Glass Banner */}
      <div className="relative glass-banner p-8 rounded-3xl border border-life-cocoa/10 bg-white/70 backdrop-blur-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 overflow-hidden dark:bg-zinc-900/40 dark:border-white/5">
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-life-vermilion uppercase tracking-widest bg-life-vermilion/10 px-2.5 py-1 rounded-full">
              AI Workspace
            </span>
            <span className="text-[10px] font-bold text-life-cocoa dark:text-zinc-300 uppercase tracking-widest bg-life-cocoa/10 dark:bg-zinc-800/60 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3 fill-life-cocoa dark:fill-zinc-300" /> 5 Day Streak
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-life-cocoa dark:text-white font-geom">
            Command Center Dashboard
          </h2>
          <p className="text-sm text-life-cocoa/60 dark:text-zinc-400 mt-2 max-w-xl leading-relaxed">
            Welcome back! Monitor real-time placement pipeline progress, review automated study schedules, and access personalized AI interview guides.
          </p>
        </div>
        
        {/* Quick prepare shortcut banner */}
        {nextInterview && (
          <div className="relative z-10 w-full lg:w-auto bg-white dark:bg-zinc-900 border border-life-cocoa/10 dark:border-white/5 rounded-2xl px-6 py-4 flex items-center justify-between lg:justify-start gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-life-vermilion/10 flex items-center justify-center text-life-vermilion">
                <Sparkles className="w-5 h-5 fill-life-vermilion/20 animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-sm text-life-cocoa dark:text-white block">Upcoming {nextInterviewCompany} Interview</span>
                <span className="text-xs text-life-cocoa/50 dark:text-zinc-400 font-medium">
                  {nextInterview.event_date ? getDaysRemainingText(nextInterview.event_date) : 'Scheduled'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.setItem('autoSelectCompany', nextInterviewCompany);
                setCurrentTab('applications');
              }}
              className="h-10 px-4 bg-life-vermilion hover:bg-life-vermilion/90 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 animate-pulse-subtle"
            >
              <span>Prepare</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Metric Cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total applications */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="premium-card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-life-cocoa/50 font-bold uppercase tracking-wider dark:text-zinc-400">Total Apps</span>
            <span className="p-2 rounded-xl bg-life-cocoa/5 text-life-cocoa dark:bg-zinc-800/60 dark:text-zinc-300">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-extrabold text-life-cocoa dark:text-white">{totalApps}</span>
            <p className="text-[10px] text-life-cocoa/40 mt-1 dark:text-zinc-500">Submitted roles</p>
          </div>
        </motion.div>

        {/* Active applications */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="premium-card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-life-cocoa/50 font-bold uppercase tracking-wider dark:text-zinc-400">Active</span>
            <span className="p-2 rounded-xl bg-life-vermilion/10 text-life-vermilion">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-extrabold text-life-cocoa dark:text-white">{activeApps}</span>
            <p className="text-[10px] text-life-cocoa/40 mt-1 dark:text-zinc-500">In progress</p>
          </div>
        </motion.div>

        {/* Online assessments */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="premium-card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-life-cocoa/50 font-bold uppercase tracking-wider dark:text-zinc-400">Assessments</span>
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-650 dark:text-teal-400">
              <GraduationCap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-extrabold text-life-cocoa dark:text-white">{oaCount}</span>
            <p className="text-[10px] text-life-cocoa/40 mt-1 dark:text-zinc-500">Active tests</p>
          </div>
        </motion.div>

        {/* Interviews */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="premium-card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-life-cocoa/50 font-bold uppercase tracking-wider dark:text-zinc-400">Interviews</span>
            <span className="p-2 rounded-xl bg-life-vermilion/10 text-life-vermilion">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-extrabold text-life-cocoa dark:text-white">{interviewCount}</span>
            <p className="text-[10px] text-life-cocoa/40 mt-1 dark:text-zinc-500">Live rounds</p>
          </div>
        </motion.div>

        {/* Offers */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="premium-card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-life-cocoa/50 font-bold uppercase tracking-wider dark:text-zinc-400">Offers</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-450">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-extrabold text-life-cocoa dark:text-white">{offerCount}</span>
            <p className="text-[10px] text-life-cocoa/40 mt-1 dark:text-zinc-500">Job letters</p>
          </div>
        </motion.div>

        {/* Average Readiness */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-gradient-to-br from-life-cocoa to-[#452721] p-5 rounded-2xl flex flex-col justify-between text-white shadow-lg shadow-life-cocoa/15 transition-all duration-300 border border-white/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-life-sand/70 font-bold uppercase tracking-wider">Readiness</span>
            <span className="p-2 rounded-xl bg-white/10 text-white">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-black font-geom">{avgReadiness}%</span>
            <p className="text-[10px] text-life-sand/70 mt-1">ATS & interview score</p>
          </div>
        </motion.div>
      </div>

      {/* Main Charts & Bento grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Performance & Funnel chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Prep timeline */}
          <div className="premium-card p-6">
            <h3 className="text-xs font-bold text-life-cocoa uppercase tracking-widest mb-6 flex items-center gap-2 dark:text-white">
              <Target className="w-4 h-4 text-life-vermilion" />
              Preparation Intensity (Minutes Revision)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF5B37" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#FF5B37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(46,26,22,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#2E1A16', opacity: 0.6 }} stroke="rgba(46,26,22,0.05)" />
                  <YAxis tick={{ fontSize: 10, fill: '#2E1A16', opacity: 0.6 }} stroke="rgba(46,26,22,0.05)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#2E1A16', 
                      borderColor: '#FF5B37', 
                      color: '#FAF6F0',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontFamily: 'sans-serif'
                    }} 
                  />
                  <Area type="monotone" dataKey="prepMinutes" name="Revision (Mins)" stroke="#FF5B37" strokeWidth={2} fillOpacity={1} fill="url(#colorPrep)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Funnel distribution bar chart */}
          <div className="premium-card p-6">
            <h3 className="text-xs font-bold text-life-cocoa uppercase tracking-widest mb-6 flex items-center gap-2 dark:text-white">
              <Briefcase className="w-4 h-4 text-life-vermilion" />
              Pipeline Distribution Stages
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(46,26,22,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#2E1A16', opacity: 0.6 }} stroke="rgba(46,26,22,0.05)" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#2E1A16', opacity: 0.6 }} stroke="rgba(46,26,22,0.05)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#2E1A16', 
                      borderColor: '#FF5B37', 
                      color: '#FAF6F0',
                      borderRadius: '12px',
                      fontSize: '11px'
                    }} 
                  />
                  <Bar dataKey="value" name="Applications" fill="#FF5B37" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column - Mission & Weaknesses */}
        <div className="space-y-6">
          
          {/* Today's Prep Mission */}
          <div className="premium-card p-6">
            <h3 className="text-xs font-bold text-life-cocoa uppercase tracking-widest mb-5 flex items-center justify-between dark:text-white">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-life-vermilion" />
                Today's Focus
              </span>
              <span className="text-[9px] bg-life-vermilion/10 text-life-vermilion font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Copilot Suggestions
              </span>
            </h3>
            
            <div className="space-y-3">
              {tasks.map((t) => (
                <div 
                  key={t.id} 
                  onClick={() => toggleTask(t.id)}
                  className={`p-3.5 border transition-all rounded-xl flex items-start gap-3 cursor-pointer ${
                    t.completed 
                      ? 'bg-life-sand/20 border-life-cocoa/5 opacity-55' 
                      : 'bg-life-sand/65 border-life-cocoa/5 hover:border-life-cocoa/15 hover:bg-life-sand/90 dark:bg-zinc-950/40 dark:border-white/5'
                  }`}
                >
                  <div className="mt-0.5">
                    <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-all ${
                      t.completed ? 'bg-life-vermilion border-life-vermilion' : 'border-life-cocoa/20'
                    }`}>
                      {t.completed && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className={`font-semibold text-xs leading-tight block ${
                      t.completed ? 'line-through text-life-cocoa/40' : 'text-life-cocoa dark:text-zinc-200'
                    }`}>
                      {t.title}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] text-life-cocoa/40">Duration: {t.duration}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        t.priority === 'High' 
                          ? 'bg-rose-500/10 text-rose-500' 
                          : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Topics */}
          <div className="premium-card p-6">
            <h3 className="text-xs font-bold text-life-cocoa uppercase tracking-widest mb-5 flex items-center gap-2 dark:text-white">
              <ShieldAlert className="w-4 h-4 text-rose-550" />
              Struggling Topics (Gaps)
            </h3>
            
            <div className="space-y-4">
              {weakTopics.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-life-cocoa/5 pb-3.5 last:border-b-0 last:pb-0">
                  <div>
                    <span className="text-xs font-semibold text-life-cocoa block dark:text-zinc-200">{item.topic}</span>
                    <span className="text-[10px] text-life-cocoa/55 block mt-1">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-500 block">{item.score}%</span>
                    <span className="text-[8px] text-life-cocoa/45 uppercase tracking-wider block">Readiness</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Event Schedule */}
          <div className="premium-card p-6">
            <h3 className="text-xs font-bold text-life-cocoa uppercase tracking-widest mb-5 flex items-center gap-2 dark:text-white">
              <CalendarDays className="w-4 h-4 text-life-vermilion" />
              Upcoming Schedules
            </h3>

            {recentEvents.length > 0 ? (
              <div className="space-y-3.5">
                {recentEvents.map((evt) => (
                  <div key={evt.id} className="p-3.5 border border-life-cocoa/5 bg-life-sand/40 rounded-xl hover:border-life-cocoa/15 transition-all dark:bg-zinc-950/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-life-cocoa dark:text-zinc-200">
                        {evt.company_name}
                      </span>
                      <span className="text-[9px] bg-life-vermilion/10 text-life-vermilion font-bold px-2 py-0.5 rounded-full uppercase">
                        {evt.event_type}
                      </span>
                    </div>
                    <p className="text-[10px] text-life-cocoa/50 mt-1">{evt.role}</p>
                    <div className="text-[10px] text-life-vermilion font-bold mt-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(evt.event_date).toLocaleDateString(undefined, { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-life-cocoa/50 py-4 text-center">No upcoming assessments or interviews scheduled.</p>
            )}
          </div>

        </div>

      </div>

    </motion.div>
  );
};
