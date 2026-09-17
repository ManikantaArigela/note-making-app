import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { CheckCircle2, Circle, Flame, Plus, Activity, X, Trophy, Sparkles } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const HabitsPage = () => {
  const { triggerRefresh } = useTasks();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(7);
  const [color, setColor] = useState('#1b3b2b');

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const { data } = await axiosClient.get('/habits');
      setHabits(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!title) return;

    try {
      await axiosClient.post('/habits', {
        title,
        description,
        frequency,
        targetDaysPerWeek: Number(targetDaysPerWeek),
        color,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      fetchHabits();
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleHabit = async (habitId) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const { data } = await axiosClient.post(`/habits/${habitId}/toggle`, { dateStr: todayStr });
      setHabits((prev) =>
        prev.map((h) =>
          h._id === habitId
            ? {
                ...h,
                isCompletedToday: data.completed,
                currentStreak: data.habit.currentStreak,
                longestStreak: data.habit.longestStreak,
              }
            : h
        )
      );
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Habits & Routines</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Build daily consistency that compounds over time.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#132c1f] text-white text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 animate-pulse">Loading habits...</div>
      ) : habits.length === 0 ? (
        <div className="bg-white border border-[#e2e5dc] rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#f4f5f0] flex items-center justify-center mx-auto text-[#1b3b2b]">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No habits created yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Track daily routines like "DSA Practice", "PostgreSQL", "Exercise", "Reading", or "English Practice".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <div
              key={habit._id}
              className={`bg-white border border-[#e2e5dc] hover:border-slate-400/60 rounded-2xl p-5 shadow-sm space-y-4 transition-all ${
                habit.isCompletedToday ? 'bg-[#f8faf7]' : ''
              }`}
            >
              {/* Card Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: habit.color || '#1b3b2b' }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">{habit.title}</h3>
                    {habit.description && <p className="text-[11px] text-slate-500 mt-0.5">{habit.description}</p>}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleHabit(habit._id)}
                  className="mt-0.5 text-slate-400 hover:text-[#1b3b2b] transition-all transform active:scale-95"
                >
                  {habit.isCompletedToday ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-6 h-6 stroke-[1.75]" />
                  )}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-center bg-[#f4f5f0] p-2.5 rounded-xl border border-[#e2e5dc] text-xs">
                <div className="flex items-center justify-center gap-1 text-amber-700 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  <span>{habit.currentStreak || 0}d streak</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-slate-700 font-bold">
                  <Trophy className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Best: {habit.longestStreak || 0}d</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2e5dc] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1b3b2b]" />
                <span>Create New Habit</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Habit Name</label>
                <input
                  type="text"
                  placeholder="e.g. DSA Practice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1b3b2b]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Solve 2 problems every morning"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1b3b2b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b3b2b]"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Color Tag</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#132c1f] text-white font-bold"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
