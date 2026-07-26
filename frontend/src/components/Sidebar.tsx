import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  KanbanSquare, 
  BookOpen, 
  NotebookPen, 
  LogOut,
  Moon,
  Sun,
  Sparkles,
  Brain,
  FileText
} from 'lucide-react';


interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  darkMode, 
  setDarkMode 
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'pipeline', label: 'Kanban Pipeline', icon: KanbanSquare },
    { id: 'questions', label: 'Question Bank', icon: BookOpen },
    { id: 'journal', label: 'Interview Journal', icon: NotebookPen },
    { id: 'resume', label: 'Resume Matcher', icon: Sparkles },
    { id: 'memory', label: 'Memory Vault', icon: Brain },
    { id: 'reports', label: 'Weekly Reviews', icon: FileText },
  ];




  return (
    <>
      {/* Premium Top Sticky Header */}
      <header className="sticky top-0 w-full z-40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-900/60 px-8 py-4 flex items-center justify-between transition-colors">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/25">
            P
          </div>
          <div>
            <h1 className="font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight text-sm font-sans flex items-center gap-1">
              PlacePilot <span className="text-brand-500 font-semibold text-[10px] bg-brand-500/10 px-1.5 py-0.5 rounded">AI</span>
            </h1>
            <span className="text-[9px] text-zinc-400 font-medium tracking-wider uppercase block">
              Placement Tracker & Copilot
            </span>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl border border-zinc-205 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Profile Card & Logout */}
          <div className="flex items-center gap-3 bg-zinc-150/60 dark:bg-zinc-900/40 border border-zinc-200/30 dark:border-zinc-800/40 rounded-2xl px-4 py-1.5 shadow-sm">
            <div className="text-right">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">
                {user?.full_name || 'Student'}
              </h4>
              <p className="text-[9px] text-zinc-400 truncate max-w-[120px]">
                {user?.email}
              </p>
            </div>
            <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Floating Navigation Dock */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/60 px-5 py-3 rounded-full shadow-2xl flex items-center gap-4 transition-all duration-300 hover:py-3.5 hover:shadow-brand-500/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`relative p-3 rounded-full transition-all duration-150 group hover:scale-115 active:scale-95 ${
                isActive 
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' 
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4" />
              
              {/* Custom Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-zinc-950 text-white text-[9px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-zinc-850 shadow-xl">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

