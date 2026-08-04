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
  Flame,
  MessageSquare
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

  const weakTopics = [
    { topic: 'Graph Implementations', status: 'Requires Timed Practice', score: 58 },
    { topic: 'DBMS Indexing', status: 'Revise B+ Tree structures', score: 64 },
    { topic: 'Computer Networks (TCP/UDP)', status: 'Revise handshake flow', score: 70 }
  ];

  const missionTasks = [
    { id: 1, title: 'Solve 2 Graph traversal cycle detection questions', duration: '45m', priority: 'High', completed: false, type: 'orange' },
    { id: 2, title: 'Revise B+ Tree index layouts', duration: '30m', priority: 'Medium', completed: false, type: 'yellow' },
    { id: 3, title: 'Mock Interview practice (Meta backend focus)', duration: '20m', priority: 'High', completed: false, type: 'green' }
  ];

  const [tasks, setTasks] = useState(missionTasks);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-vermilion/25"></div>
          <div className="absolute inset-0 rounded-full border-4 border-vermilion border-t-transparent animate-spin"></div>
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
      {/* 1. Welcome Glass Banner (revamped with warm minimalist branding) */}
      <div className="bg-[#FFE5CE] border border-[#FFD2AE] p-8 rounded-[2rem] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 overflow-hidden">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-bold text-[#7A3C09] uppercase tracking-widest bg-white/40 px-2.5 py-1 rounded-full">
              AI Workspace Active
            </span>
            <span className="text-[9px] font-bold text-[#7A3C09] uppercase tracking-widest bg-white/40 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3 fill-[#7A3C09] text-vermilion" /> 5 Day Streak
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#7A3C09] font-serif">
            Command Center Dashboard
          </h2>
          <p className="text-xs text-[#7A3C09]/75 mt-2 max-w-xl leading-relaxed font-semibold uppercase tracking-wider">
            Review your automated study schedules, track real-time placement pipeline progress, and analyze interview profiles.
          </p>
        </div>
        
        {/* Quick prepare shortcut banner */}
        {nextInterview && (
          <div className="w-full lg:w-auto bg-white border border-[#FFD2AE] rounded-[1.5rem] px-6 py-4 flex items-center justify-between lg:justify-start gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[1.2rem] bg-vermilion/10 flex items-center justify-center text-vermilion">
                <Sparkles className="w-5 h-5 fill-vermilion/20 animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-xs text-cocoa block uppercase tracking-wide">Upcoming {nextInterviewCompany} Interview</span>
                <span className="text-[10px] text-cocoa/50 font-medium">
                  {nextInterview.event_date ? getDaysRemainingText(nextInterview.event_date) : 'Scheduled'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.setItem('autoSelectCompany', nextInterviewCompany);
                setCurrentTab('applications');
              }}
              className="h-10 px-4 bg-vermilion hover:bg-vermilion/90 text-cocoa font-bold text-[10px] rounded-[1.2rem] shadow-md flex items-center gap-1.5 transition-all active:scale-95 uppercase tracking-wider"
            >
              <span>Prepare</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Metric Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total applications */}
        <div className="bento-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cocoa/50 font-bold uppercase tracking-wider">Total Apps</span>
            <span className="p-2 rounded-[1.2rem] bg-cocoa/5 text-cocoa">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-bold text-cocoa font-serif">{totalApps}</span>
            <p className="text-[10px] text-cocoa/40 mt-1 uppercase tracking-wider font-bold">Roles logged</p>
          </div>
        </div>

        {/* Active applications */}
        <div className="bento-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cocoa/50 font-bold uppercase tracking-wider">Active</span>
            <span className="p-2 rounded-[1.2rem] bg-vermilion/10 text-vermilion">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-bold text-cocoa font-serif">{activeApps}</span>
            <p className="text-[10px] text-cocoa/40 mt-1 uppercase tracking-wider font-bold">In progress</p>
          </div>
        </div>

        {/* Online assessments */}
        <div className="bento-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cocoa/50 font-bold uppercase tracking-wider">Assessments</span>
            <span className="p-2 rounded-[1.2rem] bg-[#E2F5D7] text-[#335A21]">
              <GraduationCap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-bold text-cocoa font-serif">{oaCount}</span>
            <p className="text-[10px] text-cocoa/40 mt-1 uppercase tracking-wider font-bold">Active tests</p>
          </div>
        </div>

        {/* Interviews */}
        <div className="bento-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cocoa/50 font-bold uppercase tracking-wider">Interviews</span>
            <span className="p-2 rounded-[1.2rem] bg-[#FFE5CE] text-[#7A3C09]">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-bold text-cocoa font-serif">{interviewCount}</span>
            <p className="text-[10px] text-cocoa/40 mt-1 uppercase tracking-wider font-bold">Live rounds</p>
          </div>
        </div>

        {/* Offers */}
        <div className="bento-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cocoa/50 font-bold uppercase tracking-wider">Offers</span>
            <span className="p-2 rounded-[1.2rem] bg-emerald-500/10 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-bold text-cocoa font-serif">{offerCount}</span>
            <p className="text-[10px] text-cocoa/40 mt-1 uppercase tracking-wider font-bold">Job letters</p>
          </div>
        </div>

        {/* Average Readiness */}
        <div className="bento-panel-dark flex flex-col justify-between text-cocoa">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cocoa/50 font-bold uppercase tracking-wider">Readiness</span>
            <span className="p-2 rounded-[1.2rem] bg-cocoa/10 text-cocoa">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-bold text-cocoa font-serif">{avgReadiness}%</span>
            <p className="text-[10px] text-cocoa/40 mt-1 uppercase tracking-wider font-bold">Vector match</p>
          </div>
        </div>
      </div>

      {/* 3. Main Charts & Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Performance Graph & Funnel chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Prep timeline */}
          <div className="bento-panel p-6">
            <h3 className="text-[10px] font-bold text-cocoa uppercase tracking-widest mb-6 flex items-center gap-2">
              <Target className="w-4 h-4 text-vermilion" />
              Preparation Intensity (Minutes Revision)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF5B37" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#FF5B37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(46,26,22,0.06)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#2E1A16', opacity: 0.6 }} stroke="rgba(46,26,22,0.06)" />
                  <YAxis tick={{ fontSize: 10, fill: '#2E1A16', opacity: 0.6 }} stroke="rgba(46,26,22,0.06)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#FF5B37', 
                      color: '#2E1A16',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontFamily: 'sans-serif',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }} 
                  />
                  <Area type="monotone" dataKey="prepMinutes" name="Revision (Mins)" stroke="#FF5B37" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrep)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Funnel distribution bar chart */}
          <div className="bento-panel p-6">
            <h3 className="text-[10px] font-bold text-cocoa uppercase tracking-widest mb-6 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-vermilion" />
              Pipeline Distribution Stages
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(46,26,22,0.06)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#2E1A16', opacity: 0.6 }} stroke="rgba(46,26,22,0.06)" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#2E1A16', opacity: 0.6 }} stroke="rgba(46,26,22,0.06)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#FF5B37', 
                      color: '#2E1A16',
                      borderRadius: '16px',
                      fontSize: '11px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }} 
                  />
                  <Bar dataKey="value" name="Applications" fill="#FF5B37" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column - Mission, Gaps, & AI Quotes */}
        <div className="space-y-6">
          
          {/* AI Career Coach Quote Card (mimicking quote panel from image 4) */}
          <div className="bento-panel p-6 flex flex-col justify-between border-l-4 border-l-vermilion bg-white">
            <h3 className="text-[10px] font-bold text-cocoa uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-vermilion" />
              AI Recruiter Narrative
            </h3>
            <p className="text-xs text-cocoa/75 italic leading-relaxed">
              "We noticed graph cycles and DBMS B+ Tree indices are showing lower preparation scores. Prioritize completing cycle traversal mock questions before your upcoming event assessments."
            </p>
            <div className="flex items-center gap-3 mt-5 border-t border-cocoa/5 pt-4">
              <span className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-sm shadow-sm">🤖</span>
              <div>
                <h4 className="text-xs font-bold text-cocoa">PlacePilot Copilot</h4>
                <p className="text-[8px] text-cocoa/40 font-bold uppercase tracking-wider">Placement Mentor</p>
              </div>
            </div>
          </div>

          {/* Today's Prep Mission (Styled as colorful sticky notes from user persona image) */}
          <div className="bento-panel p-6">
            <h3 className="text-xs font-bold text-cocoa uppercase tracking-widest mb-5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-vermilion" />
                Today's Focus
              </span>
              <span className="text-[8px] bg-cocoa/5 text-cocoa/50 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Active Checklist
              </span>
            </h3>
            
            <div className="space-y-4">
              {tasks.map((t) => {
                const noteClass = t.type === 'orange' 
                  ? 'sticky-note-orange' 
                  : t.type === 'yellow' 
                    ? 'sticky-note-yellow' 
                    : 'sticky-note-green';
                return (
                  <div 
                    key={t.id} 
                    onClick={() => toggleTask(t.id)}
                    className={`${noteClass} cursor-pointer relative overflow-hidden transition-all group ${
                      t.completed ? 'opacity-55 scale-98 translate-y-0.5' : 'hover:scale-[1.02] hover:-rotate-1'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <div className="w-3.5 h-3.5 rounded-md border border-current flex items-center justify-center">
                          {t.completed && <div className="w-2 h-2 rounded bg-current" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className={`font-bold text-xs leading-normal block ${t.completed ? 'line-through' : ''}`}>
                          {t.title}
                        </span>
                        <div className="flex items-center gap-2 mt-2 text-[9px] opacity-75 font-semibold">
                          <span>Duration: {t.duration}</span>
                          <span>•</span>
                          <span className="uppercase tracking-wider">{t.priority} priority</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weak Topics */}
          <div className="bento-panel p-6">
            <h3 className="text-xs font-bold text-cocoa uppercase tracking-widest mb-5 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-vermilion" />
              Struggling Gaps
            </h3>
            
            <div className="space-y-4">
              {weakTopics.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-cocoa/5 pb-3.5 last:border-b-0 last:pb-0">
                  <div>
                    <span className="text-xs font-bold text-cocoa block">{item.topic}</span>
                    <span className="text-[10px] text-cocoa/55 block mt-1">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-vermilion block">{item.score}%</span>
                    <span className="text-[8px] text-cocoa/40 uppercase tracking-wider block">Readiness</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Event Schedule */}
          <div className="bento-panel p-6">
            <h3 className="text-xs font-bold text-cocoa uppercase tracking-widest mb-5 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-vermilion" />
              Upcoming Schedules
            </h3>

            {recentEvents.length > 0 ? (
              <div className="space-y-3.5">
                {recentEvents.map((evt) => (
                  <div key={evt.id} className="p-3.5 border border-cocoa/10 bg-sand/50 rounded-[1.2rem] hover:border-cocoa/20 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cocoa">
                        {evt.company_name}
                      </span>
                      <span className="text-[9px] bg-vermilion/10 text-vermilion font-bold px-2 py-0.5 rounded-full uppercase">
                        {evt.event_type}
                      </span>
                    </div>
                    <p className="text-[10px] text-cocoa/60 mt-1">{evt.role}</p>
                    <div className="text-[10px] text-vermilion font-bold mt-3 flex items-center gap-1.5">
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
              <p className="text-xs text-cocoa/40 py-4 text-center">No upcoming assessments or interviews scheduled.</p>
            )}
          </div>

        </div>

      </div>

    </motion.div>
  );
};
