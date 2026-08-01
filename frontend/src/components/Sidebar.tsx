import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
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
      <header className="sticky top-0 w-full z-45 bg-life-sand/85 backdrop-blur-md border-b border-life-cocoa/5 px-8 py-4 flex items-center justify-between transition-colors dark:bg-[#18110F]/80 dark:border-white/5">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-life-cocoa dark:bg-zinc-950 flex items-center justify-center text-white shadow-md shadow-life-cocoa/20">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" xmlns="http://www.w3.org/2000/svg">
              {/* Upward Trajectory Arrow Stem */}
              <path d="M 8.5,21 L 11.5,14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 12,13 L 15.5,5 L 17,7" stroke="#FF5B37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 15.5,5 L 18.5,8" stroke="#FF5B37" stroke-width="2.5" stroke-linecap="round" />
              {/* Loop Compass Sweep */}
              <path d="M 12,13 C 14.8,13 17,10.8 17,8 C 17,5.2 14.8,3 12,3" stroke="currentColor" strokeWidth="2" strokeDasharray="0.5 2.5" strokeLinecap="round" />
              <path d="M 12,3 C 9.2,3 7,5.2 7,8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              {/* AI Node Center */}
              <circle cx="12" cy="8" r="1.5" fill="#FF5B37" />
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-life-cocoa tracking-tight text-sm font-geom dark:text-zinc-100 uppercase">
              PLACEPILOT
            </h1>
            <span className="text-[9px] text-life-cocoa/50 font-bold tracking-wider uppercase block dark:text-zinc-400">
              Placement OS
            </span>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl border border-life-cocoa/10 text-life-cocoa/60 hover:bg-life-cocoa/5 hover:text-life-cocoa transition-all dark:border-white/5 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Profile Card & Logout */}
          <div className="flex items-center gap-3 bg-white/60 border border-life-cocoa/5 rounded-2xl px-4 py-1.5 shadow-sm backdrop-blur-md dark:bg-zinc-900/60 dark:border-white/5">
            <div className="text-right">
              <h4 className="text-xs font-bold text-life-cocoa truncate max-w-[120px] dark:text-zinc-200">
                {user?.full_name || 'Student'}
              </h4>
              <p className="text-[9px] text-life-cocoa/60 truncate max-w-[120px] dark:text-zinc-400">
                {user?.email}
              </p>
            </div>
            <div className="h-6 w-[1px] bg-life-cocoa/10 dark:bg-zinc-800" />
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-life-cocoa/60 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-450 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Floating Navigation Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.nav 
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-white/80 backdrop-blur-xl border border-life-cocoa/10 px-3 py-2 rounded-full shadow-2xl flex items-center gap-2 hover:shadow-life-vermilion/5 transition-shadow duration-300 dark:bg-zinc-900/80 dark:border-white/5"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-3 rounded-full transition-all duration-155 group ${
                  isActive 
                    ? 'bg-life-vermilion text-white shadow-lg shadow-life-vermilion/20' 
                    : 'text-life-cocoa/50 hover:bg-life-cocoa/5 hover:text-life-cocoa dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4" />
                
                {/* Custom Tooltip */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-life-cocoa text-life-sand text-[9px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl dark:bg-zinc-950 dark:text-white">
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </motion.nav>
      </div>
    </>
  );
};

