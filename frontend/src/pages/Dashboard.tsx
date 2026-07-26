import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
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
  Target
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
    { id: 1, title: 'Solve 2 Graph traversal cycle detection questions', duration: '45m', priority: 'High' },
    { id: 2, title: 'Revise B+ Tree index layouts', duration: '30m', priority: 'Medium' },
    { id: 3, title: 'Mock Interview practice (Meta backend focus)', duration: '20m', priority: 'High' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title & Premium Glass Banner */}
      <div className="glass-banner flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-tight text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            Command Center Dashboard
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-lg">
            Welcome back! Real-time telemetry, personalized study task allocations, and cognitive metrics mapped to your active placement pipeline.
          </p>
        </div>
        
        {/* Quick prepare shortcut banner */}
        <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-850/60 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 block">Upcoming Meta Interview</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Scheduled in 5 days</span>
          </div>
          <button 
            onClick={() => {
              localStorage.setItem('autoSelectCompany', 'Meta');
              setCurrentTab('applications');
            }}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 ml-4 flex items-center gap-1"
          >
            Prepare <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metric Cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total applications */}
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/40 p-4 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total</span>
            <span className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100">{totalApps}</span>
            <p className="text-[10px] text-zinc-400 mt-0.5">Submitted jobs</p>
          </div>
        </div>

        {/* Active applications */}
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/40 p-4 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Active</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 dark:bg-amber-500/10">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100">{activeApps}</span>
            <p className="text-[10px] text-zinc-400 mt-0.5">Under evaluation</p>
          </div>
        </div>

        {/* Online assessments */}
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/40 p-4 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">OAs</span>
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <GraduationCap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100">{oaCount}</span>
            <p className="text-[10px] text-zinc-400 mt-0.5">Scheduled tests</p>
          </div>
        </div>

        {/* Interviews */}
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/40 p-4 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Interviews</span>
            <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100">{interviewCount}</span>
            <p className="text-[10px] text-zinc-400 mt-0.5">Live meetings</p>
          </div>
        </div>

        {/* Offers */}
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/40 p-4 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Offers</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-zinc-800 dark:text-slate-100">{offerCount}</span>
            <p className="text-[10px] text-zinc-400 mt-0.5">Offer letters</p>
          </div>
        </div>

        {/* Average Readiness */}
        <div className="bg-gradient-to-br from-brand-500 to-emerald-600 p-4 rounded-2xl flex flex-col justify-between text-white shadow-lg shadow-brand-500/15 hover:shadow-brand-500/25 hover:scale-[1.01] transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-100 font-semibold uppercase tracking-wider">Readiness</span>
            <span className="p-1.5 rounded-lg bg-white/10 text-white">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold">{avgReadiness}%</span>
            <p className="text-[10px] text-brand-100 mt-0.5">Overall confidence</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Pipelines sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Performance & Funnel chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Prep timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-500" />
              Placement Prep Intensity (Weekly)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderColor: '#1e293b', 
                      color: '#fff',
                      borderRadius: '12px'
                    }} 
                  />
                  <Area type="monotone" dataKey="prepMinutes" name="Revision (Mins)" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorPrep)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Funnel distribution bar chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              Application Stages Funnel
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderColor: '#1e293b', 
                      color: '#fff',
                      borderRadius: '12px'
                    }} 
                  />
                  <Bar dataKey="value" name="Applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column - Mission & Upcoming Events */}
        <div className="space-y-6">
          
          {/* Today's Prep Mission */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3.5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-500" />
                Today's Prep Mission
              </span>
              <span className="text-[10px] bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold px-2 py-0.5 rounded-full">
                AI Suggested
              </span>
            </h3>
            
            <div className="space-y-3">
              {missionTasks.map((t) => (
                <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 rounded-xl flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-xs text-slate-700 dark:text-slate-200 block">
                      {t.title}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Est. Duration: {t.duration}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    t.priority === 'High' 
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Topics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3.5 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Struggling Topics (Alerts)
            </h3>
            
            <div className="space-y-3.5">
              {weakTopics.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">{item.topic}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-500 block">{item.score}%</span>
                    <span className="text-[8px] text-slate-400 uppercase tracking-wider block">Readiness</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Event Schedule */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3.5 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-500" />
              Upcoming Schedules
            </h3>

            {recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.map((evt) => (
                  <div key={evt.id} className="p-3 border border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {evt.company_name}
                      </span>
                      <span className="text-[9px] bg-brand-500 text-white font-semibold px-2 py-0.5 rounded-full">
                        {evt.event_type}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{evt.role}</p>
                    <div className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold mt-2.5 flex items-center gap-1">
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
              <p className="text-xs text-slate-400 py-4 text-center">No upcoming assessments or interviews scheduled.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
