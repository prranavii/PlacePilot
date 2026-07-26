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
    <aside className="w-60 h-[calc(100vh-2rem)] m-4 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-900/60 flex flex-col justify-between fixed left-0 top-0 rounded-3xl transition-all duration-200 z-10 shadow-sm">
      <div>
        {/* Brand Logo Header */}
        <div className="p-6 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900/60">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-semibold shadow-md shadow-brand-500/20">
            P
          </div>
          <div>
            <h1 className="font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight font-sans">
              PlacePilot <span className="text-brand-500 font-medium">AI</span>
            </h1>
            <span className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase block -mt-1">
              Copilot Edition
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-brand-50/70 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 font-semibold shadow-sm' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-zinc-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Theme Toggle */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-900/60 space-y-3">
        {/* Theme and Account status */}
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            Theme
          </span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Profile Card & Log Out */}
        <div className="bg-zinc-50 dark:bg-zinc-850/40 rounded-xl p-3 flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {user?.full_name || 'Student'}
            </h4>
            <p className="text-[10px] text-zinc-400 truncate mt-0.5">
              {user?.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
