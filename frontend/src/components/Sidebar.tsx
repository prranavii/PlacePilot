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
          <div className="w-8 h-8 rounded-lg bg-life-vermilion flex items-center justify-center text-white shadow-md shadow-life-vermilion/25">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M 12,12 C 11.2,10 9.5,6.5 9.5,4.5 C 9.5,3.1 10.6,2 12,2 C 13.4,2 14.5,3.1 14.5,4.5 C 14.5,6.5 12.8,10 12,12 Z" />
              <path d="M 12,12 C 11.2,10 9.5,6.5 9.5,4.5 C 9.5,3.1 10.6,2 12,2 C 13.4,2 14.5,3.1 14.5,4.5 C 14.5,6.5 12.8,10 12,12 Z" transform="rotate(60 12 12)" />
              <path d="M 12,12 C 11.2,10 9.5,6.5 9.5,4.5 C 9.5,3.1 10.6,2 12,2 C 13.4,2 14.5,3.1 14.5,4.5 C 14.5,6.5 12.8,10 12,12 Z" transform="rotate(120 12 12)" />
              <path d="M 12,12 C 11.2,10 9.5,6.5 9.5,4.5 C 9.5,3.1 10.6,2 12,2 C 13.4,2 14.5,3.1 14.5,4.5 C 14.5,6.5 12.8,10 12,12 Z" transform="rotate(180 12 12)" />
              <path d="M 12,12 C 11.2,10 9.5,6.5 9.5,4.5 C 9.5,3.1 10.6,2 12,2 C 13.4,2 14.5,3.1 14.5,4.5 C 14.5,6.5 12.8,10 12,12 Z" transform="rotate(240 12 12)" />
              <path d="M 12,12 C 11.2,10 9.5,6.5 9.5,4.5 C 9.5,3.1 10.6,2 12,2 C 13.4,2 14.5,3.1 14.5,4.5 C 14.5,6.5 12.8,10 12,12 Z" transform="rotate(300 12 12)" />
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-life-cocoa tracking-tight text-sm font-geom flex items-center gap-1 dark:text-zinc-100">
              PlacePilot <span className="text-life-vermilion font-bold text-[10px] bg-life-vermilion/10 px-1.5 py-0.5 rounded">AI</span>
            </h1>
            <span className="text-[9px] text-life-cocoa/50 font-medium tracking-wider uppercase block dark:text-zinc-400">
              Placement Tracker & Copilot
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

