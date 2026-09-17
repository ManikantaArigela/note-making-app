import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useTasks } from '../context/TaskContext';
import {
  CheckCircle2,
  Search,
  RotateCcw,
  Trash2,
  Calendar,
  Clock,
  Tag,
  Flame,
  Trophy,
  Activity,
  Zap,
} from 'lucide-react';

export const CompletedPage = () => {
  const { toggleTaskCompletion, deleteTask, refreshTrigger } = useTasks();
  const [historyGroups, setHistoryGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All'); // All, Tasks, Focus, Habits

  useEffect(() => {
    fetchActivityHistory();
  }, [refreshTrigger]);

  const fetchActivityHistory = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/activity/history');
      setHistoryGroups(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreTask = async (taskId) => {
    try {
      await toggleTaskCompletion(taskId);
      fetchActivityHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      fetchActivityHistory();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter groups
  const filteredGroups = historyGroups.map((group) => {
    let tasks = group.tasks;
    let focus = group.focus;
    let habits = group.habits;
    let events = group.events;

    if (search.trim()) {
      const q = search.toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(q));
      focus = focus.filter((f) => f.notes?.toLowerCase().includes(q) || f.taskId?.title?.toLowerCase().includes(q));
      habits = habits.filter((h) => h.habitId?.title?.toLowerCase().includes(q));
      events = events.filter((e) => e.title.toLowerCase().includes(q));
    }

    if (filterType === 'Tasks') {
      focus = [];
      habits = [];
      events = events.filter((e) => e.eventType === 'TASK_COMPLETED');
    } else if (filterType === 'Focus') {
      tasks = [];
      habits = [];
      events = events.filter((e) => e.eventType === 'FOCUS_COMPLETED');
    } else if (filterType === 'Habits') {
      tasks = [];
      focus = [];
      events = events.filter((e) => e.eventType === 'HABIT_COMPLETED');
    }

    return {
      ...group,
      tasks,
      focus,
      habits,
      events,
      totalItems: tasks.length + focus.length + habits.length + events.length,
    };
  }).filter((group) => group.totalItems > 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-800">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Completed & Everyday Activity Logs</span>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Complete day-by-day log history of finished tasks, habit completions, focus time, and achievements.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-[#e2e5dc] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search completed logs across all days..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1b3b2b]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Tasks', 'Focus', 'Habits'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === type
                  ? 'bg-[#1b3b2b] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'All' ? 'All Everyday Activity' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Day-by-Day Activity Groups */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
          Loading everyday activity logs...
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white border border-[#e2e5dc] rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No activity logs found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Complete tasks, focus sessions, or habits to store your daily productivity history here!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div
              key={group.dateStr}
              className="bg-white border border-[#e2e5dc] rounded-2xl p-5 shadow-sm space-y-4"
            >
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1b3b2b]" />
                  <h2 className="text-sm font-bold text-slate-900">{group.formattedDate}</h2>
                  <span className="text-[10px] text-slate-400 font-mono">({group.dateStr})</span>
                </div>

                {/* Daily Summary Pills */}
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  {group.summary.taskCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {group.summary.taskCount} Tasks
                    </span>
                  )}
                  {group.summary.focusMinutes > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {group.summary.focusHours}h Focused
                    </span>
                  )}
                  {group.summary.habitCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-600" /> {group.summary.habitCount} Habits
                    </span>
                  )}
                </div>
              </div>

              {/* Items Timeline for Day */}
              <div className="space-y-2.5">
                {/* 1. Completed Tasks */}
                {group.tasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-900 line-through truncate block">
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span className="font-semibold">{task.category}</span>
                          {task.projectId && (
                            <span
                              className="px-1.5 py-0.2 rounded text-white font-bold"
                              style={{ backgroundColor: task.projectId.color || '#1b3b2b' }}
                            >
                              {task.projectId.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRestoreTask(task._id)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#d6e2d5] text-slate-800 text-[11px] font-bold border border-slate-200 flex items-center gap-1"
                        title="Restore to active list"
                      >
                        <RotateCcw className="w-3 h-3 text-[#1b3b2b]" /> Restore
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* 2. Focus Sessions */}
                {group.focus.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-indigo-700 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 block">
                          Focus Session: {f.durationMinutes} mins ({f.sessionType})
                        </span>
                        {f.taskId && <span className="text-[10px] text-slate-500">Task: {f.taskId.title}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      Focus Logged
                    </span>
                  </div>
                ))}

                {/* 3. Habit Completions */}
                {group.habits.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-bold text-slate-900">
                        Habit Completed: {h.habitId?.title || 'Daily Routine'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Habit Logged
                    </span>
                  </div>
                ))}

                {/* 4. Goal & Level Events */}
                {group.events
                  .filter(
                    (e) =>
                      e.eventType === 'GOAL_COMPLETED' ||
                      e.eventType === 'PROJECT_COMPLETED' ||
                      e.eventType === 'ACHIEVEMENT_UNLOCKED'
                  )
                  .map((evt, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Trophy className="w-4 h-4 text-purple-700 shrink-0" />
                        <span className="font-bold text-slate-900">{evt.title}</span>
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        Milestone
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
