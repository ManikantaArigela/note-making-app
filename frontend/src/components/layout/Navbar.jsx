import React, { useState } from 'react';
import { Plus, Flame, Award, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { NotificationCenter } from '../notifications/NotificationCenter';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { openAddTask } = useTasks();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="h-14 bg-[#f4f5f0]/90 backdrop-blur-md border-b border-[#e2e5dc] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 md:hidden">
          <img src="/pwa-192x192.png" alt="FocusFlow" className="w-6 h-6 rounded-md shadow-xs object-cover" />
          <span className="font-extrabold text-[#1b3b2b] text-sm">FocusFlow</span>
        </div>
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Add Task */}
        <button
          onClick={() => openAddTask()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1b3b2b] hover:bg-[#132c1f] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>

        {/* Streak */}
        {user && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{user.currentStreak || 0}d</span>
          </div>
        )}

        {/* Level */}
        {user && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-700/10 border border-emerald-700/20 text-emerald-800 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            <span>Lvl {user.level || 1}</span>
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
          </button>
          {isNotificationsOpen && (
            <NotificationCenter onClose={() => setIsNotificationsOpen(false)} />
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-7 h-7 rounded-full bg-[#1b3b2b] text-white font-bold text-xs flex items-center justify-center shadow-sm"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
