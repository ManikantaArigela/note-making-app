import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useTasks } from '../context/TaskContext';
import { RefreshCw, CheckCircle2, Trash2, ArrowRight, Sparkles, Trophy, Flame, Plus, Check } from 'lucide-react';

export const WeeklyResetPage = () => {
  const { triggerRefresh } = useTasks();
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Next week's priorities state
  const [priorityInputs, setPriorityInputs] = useState(['', '', '']);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWeeklyReview();
  }, []);

  const fetchWeeklyReview = async () => {
    try {
      const { data } = await axiosClient.get('/analytics/weekly-review');
      setReviewData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleTask = async (taskId, target) => {
    try {
      await axiosClient.post('/tasks/batch-reschedule', { taskIds: [taskId], target });
      fetchWeeklyReview();
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCleanupTask = async (taskId) => {
    try {
      await axiosClient.post('/tasks/batch-cleanup', { taskIds: [taskId] });
      fetchWeeklyReview();
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchRescheduleAll = async () => {
    if (!reviewData?.unfinishedTasks?.length) return;
    const ids = reviewData.unfinishedTasks.map((t) => t._id);
    try {
      await axiosClient.post('/tasks/batch-reschedule', { taskIds: ids, target: 'next_week' });
      fetchWeeklyReview();
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchCleanupAll = async () => {
    if (!reviewData?.unfinishedTasks?.length) return;
    const ids = reviewData.unfinishedTasks.map((t) => t._id);
    try {
      await axiosClient.post('/tasks/batch-cleanup', { taskIds: ids });
      fetchWeeklyReview();
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePriorityChange = (index, value) => {
    const updated = [...priorityInputs];
    updated[index] = value;
    setPriorityInputs(updated);
  };

  const handleAddPriorityInput = () => {
    if (priorityInputs.length < 5) {
      setPriorityInputs([...priorityInputs, '']);
    }
  };

  const handleCompleteReset = async () => {
    try {
      setIsSubmitting(true);
      const validPriorities = priorityInputs.filter((p) => p.trim().length > 0);
      await axiosClient.post('/analytics/weekly-reset', { priorities: validPriorities });
      setResetCompleted(true);
      triggerRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !reviewData) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
        Loading Weekly Reset workspace...
      </div>
    );
  }

  const { completedTasksCount, unfinishedTasks = [], completionRate, currentStreak } = reviewData;

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Weekly Reset</span>
            <RefreshCw className="w-5 h-5 text-[#1b3b2b]" />
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Reflect on your week, clean up clutter, and set next week's priorities.
          </p>
        </div>

        {resetCompleted && (
          <span className="px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Check className="w-4 h-4" /> Reset Complete! (+50 XP)
          </span>
        )}
      </div>

      {/* Step 1: Progress Review */}
      <div className="bg-white border border-[#e2e5dc] rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Step 1: Review Progress</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-[#f4f5f0] p-3 rounded-xl border border-[#e2e5dc]">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Tasks Completed</span>
            <span className="text-xl font-extrabold text-slate-900">{completedTasksCount}</span>
          </div>

          <div className="bg-[#f4f5f0] p-3 rounded-xl border border-[#e2e5dc]">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Completion Rate</span>
            <span className="text-xl font-extrabold text-[#1b3b2b]">{completionRate}%</span>
          </div>

          <div className="bg-[#f4f5f0] p-3 rounded-xl border border-[#e2e5dc]">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Active Streak</span>
            <span className="text-xl font-extrabold text-amber-600 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-500" /> {currentStreak}d
            </span>
          </div>

          <div className="bg-[#f4f5f0] p-3 rounded-xl border border-[#e2e5dc]">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Unfinished Tasks</span>
            <span className="text-xl font-extrabold text-slate-900">{unfinishedTasks.length}</span>
          </div>
        </div>
      </div>

      {/* Step 2: Review Unfinished Tasks */}
      <div className="bg-white border border-[#e2e5dc] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#1b3b2b]" />
              <span>Step 2: Review & Clean Up Unfinished Tasks ({unfinishedTasks.length})</span>
            </h2>
            <p className="text-[11px] text-slate-500">Reschedule to next week, move to inbox, or clean up obsolete items.</p>
          </div>

          {unfinishedTasks.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchRescheduleAll}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#d6e2d5] text-[11px] font-bold text-slate-800 border border-[#e2e5dc] flex items-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5 text-[#1b3b2b]" /> Move All to Next Week
              </button>
              <button
                onClick={handleBatchCleanupAll}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[11px] font-bold text-rose-700 border border-rose-200 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clean Up All
              </button>
            </div>
          )}
        </div>

        {unfinishedTasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 italic">
            🎉 All caught up! No unfinished tasks to review.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {unfinishedTasks.map((task) => (
              <div
                key={task._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{task.title}</h4>
                  <span className="text-[10px] text-slate-500">
                    Category: {task.category} • Priority: {task.priority}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRescheduleTask(task._id, 'next_week')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 font-semibold text-slate-700 text-[11px] flex items-center gap-1"
                  >
                    Next Week
                  </button>
                  <button
                    onClick={() => handleRescheduleTask(task._id, 'inbox')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 font-semibold text-slate-700 text-[11px]"
                  >
                    Inbox
                  </button>
                  <button
                    onClick={() => handleCleanupTask(task._id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Clean up"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 3: Select Next Week's Priorities */}
      <div className="bg-white border border-[#e2e5dc] rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Sparkles className="w-4 h-4 text-[#1b3b2b]" />
          <span>Step 3: Select Next Week's Priorities (Top 3 - 5 Outcomes)</span>
        </h2>

        <div className="space-y-2.5">
          {priorityInputs.map((val, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1b3b2b] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <input
                type="text"
                placeholder={`Priority ${idx + 1} (e.g. Master PostgreSQL Indexing / Build Auth Module)`}
                value={val}
                onChange={(e) => handlePriorityChange(idx, e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1b3b2b]"
              />
            </div>
          ))}
        </div>

        {priorityInputs.length < 5 && (
          <button
            onClick={handleAddPriorityInput}
            className="text-xs text-[#1b3b2b] font-bold hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Priority Field
          </button>
        )}
      </div>

      {/* Step 4: Complete Weekly Reset Action */}
      <div className="bg-gradient-to-r from-slate-900 to-[#1b3b2b] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="text-base font-extrabold tracking-tight">Ready for a Fresh Week?</h3>
          <p className="text-xs text-slate-200 mt-1">
            Complete your reset to save priorities, log your weekly milestone (+50 XP), and start fresh.
          </p>
        </div>

        <button
          onClick={handleCompleteReset}
          disabled={isSubmitting || resetCompleted}
          className="px-6 py-3 rounded-xl bg-white text-[#1b3b2b] hover:bg-slate-100 font-extrabold text-xs shadow-lg transition-all shrink-0 disabled:opacity-50"
        >
          {isSubmitting ? 'Resetting...' : resetCompleted ? 'Reset Completed! 🎉' : 'Complete Weekly Reset 🚀'}
        </button>
      </div>
    </div>
  );
};
