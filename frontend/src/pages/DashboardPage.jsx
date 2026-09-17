import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { ActivityHeatmap } from '../components/dashboard/ActivityHeatmap';
import { WeeklyProductivityChart } from '../components/dashboard/WeeklyProductivityChart';
import { TaskCategoryChart } from '../components/dashboard/TaskCategoryChart';
import { Flame, Clock, Sun } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { refreshTrigger } = useTasks();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const fetchDashboardData = async () => {
    try {
      const { data } = await axiosClient.get('/analytics/dashboard');
      setData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs animate-pulse">
        Loading FocusFlow dashboard...
      </div>
    );
  }

  const { todayStats, weeklyData, categoryBreakdown, productivityInsight } = data;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{getGreeting()}, {user?.name?.split(' ')[0] || 'Manikanta'}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Small steps today, big results tomorrow.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e2e5dc] text-xs font-semibold text-slate-600 shadow-sm w-fit">
          <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Hero Quote Card with Serene Nature Backdrop */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm h-36 bg-slate-900 flex items-center px-8 border border-slate-800">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
          alt="Mountains"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 max-w-md space-y-1">
          <p className="text-lg font-bold text-white tracking-wide font-serif italic">
            "Discipline today, freedom tomorrow."
          </p>
          <p className="text-xs text-slate-300 font-medium">— James Clear</p>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Progress */}
        <div className="bg-white border border-[#e2e5dc] rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-800 block">Today's Progress</span>
            <span className="text-xs text-slate-500 block">
              {todayStats.completedTasks} of {todayStats.totalTasks} Tasks
            </span>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="#1b3b2b"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - todayStats.completionRate / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-bold text-slate-800">
              {todayStats.completionRate}%
            </span>
          </div>
        </div>

        {/* Focus Time */}
        <div className="bg-white border border-[#e2e5dc] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#1b3b2b]" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Focus Time</span>
            <span className="text-lg font-extrabold text-slate-900">{todayStats.focusHours}h</span>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white border border-[#e2e5dc] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-amber-600 fill-amber-500" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Current Streak</span>
            <span className="text-lg font-extrabold text-slate-900">{todayStats.currentStreak} days</span>
          </div>
        </div>

        {/* Motivational Card */}
        <div className="bg-white border border-[#e2e5dc] rounded-2xl p-4 flex items-center justify-center text-center shadow-sm">
          <p className="text-xs font-medium text-slate-700 italic leading-relaxed">
            "A better you is a series of small decisions every day."
          </p>
        </div>
      </div>

      {/* Middle Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WeeklyProductivityChart data={weeklyData} />
        </div>
        <div>
          <TaskCategoryChart data={categoryBreakdown} />
        </div>
      </div>

      {/* Signature Feature: Activity Heatmap */}
      <ActivityHeatmap />
    </div>
  );
};
