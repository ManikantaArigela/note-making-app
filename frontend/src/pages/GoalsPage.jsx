import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Target, Plus, Trophy, X } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const GoalsPage = () => {
  const { triggerRefresh } = useTasks();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Goal form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeframe, setTimeframe] = useState('monthly');
  const [targetValue, setTargetValue] = useState(100);
  const [unit, setUnit] = useState('tasks');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await axiosClient.get('/goals');
      setGoals(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title || !targetValue) return;

    try {
      await axiosClient.post('/goals', {
        title,
        description,
        timeframe,
        targetValue: Number(targetValue),
        unit,
        deadline: deadline || null,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      fetchGoals();
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleIncrementProgress = async (goal) => {
    try {
      const nextVal = Math.min(goal.targetValue, (goal.currentValue || 0) + 1);
      const { data } = await axiosClient.patch(`/goals/${goal._id}`, { currentValue: nextVal });
      setGoals(goals.map((g) => (g._id === goal._id ? data : g)));
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Goals</h1>
          <p className="text-xs text-slate-500 mt-0.5">Set bigger outcomes and track consistent milestone progress</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#132c1f] text-white text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 animate-pulse">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="bg-white border border-[#e2e5dc] rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#f4f5f0] flex items-center justify-center mx-auto text-slate-600">
            <Target className="w-6 h-6 text-[#1b3b2b]" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No active goals set</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Goals keep you motivated long-term. Create a goal like "Solve 200 DSA Problems" or "Build 3 Projects".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const percentage = Math.min(100, Math.round(((goal.currentValue || 0) / goal.targetValue) * 100));
            const isAchieved = goal.status === 'achieved';

            return (
              <div
                key={goal._id}
                className="bg-white border border-[#e2e5dc] hover:border-slate-400/60 rounded-2xl p-5 shadow-sm space-y-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#d6e2d5] text-[#1b3b2b] uppercase tracking-wider">
                      {goal.timeframe}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2">{goal.title}</h3>
                    {goal.description && <p className="text-xs text-slate-500 mt-1">{goal.description}</p>}
                  </div>
                  {isAchieved && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" /> Achieved
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">
                      {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="text-[#1b3b2b] font-bold">{percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-[#1b3b2b] rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Action button */}
                {!isAchieved && (
                  <button
                    onClick={() => handleIncrementProgress(goal)}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-[#d6e2d5] text-xs font-bold text-slate-800 border border-[#e2e5dc] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#1b3b2b]" />
                    <span>Log Progress (+1 {goal.unit})</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2e5dc] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#1b3b2b]" />
                <span>Create Goal</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Solve 200 DSA Problems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1b3b2b]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  placeholder="Why is this outcome important?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1b3b2b] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Value</label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b3b2b]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="problems, hours..."
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b3b2b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Timeframe</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b3b2b]"
                >
                  <option value="daily">Daily Goal</option>
                  <option value="weekly">Weekly Goal</option>
                  <option value="monthly">Monthly Goal</option>
                  <option value="long-term">Long-term Goal</option>
                </select>
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
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
