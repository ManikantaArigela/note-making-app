import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useTasks } from '../context/TaskContext';
import { TaskItem } from '../components/tasks/TaskItem';
import { Plus, ChevronRight } from 'lucide-react';

export const TodayPage = () => {
  const { openAddTask, refreshTrigger } = useTasks();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchTodayTasks();
  }, [refreshTrigger]);

  const fetchTodayTasks = async () => {
    try {
      const { data } = await axiosClient.get('/tasks/today');
      setTasks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Calculate filter counts
  const categories = ['Learning', 'Project', 'Personal', 'DSA'];
  const filterCounts = {
    All: tasks.length,
  };
  categories.forEach((cat) => {
    filterCounts[cat] = tasks.filter((t) => t.category === cat || t.labels?.includes(cat)).length;
  });

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'All') return true;
    return t.category === activeFilter || t.labels?.includes(activeFilter);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Today</h1>
          <p className="text-xs text-slate-500 mt-0.5">Focus on what matters. One task at a time.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-[#e2e5dc] text-slate-600 shadow-sm">
            {formattedDate}
          </span>
          <button
            onClick={() =>
              openAddTask({
                scheduledDate: new Date().toISOString().split('T')[0],
              })
            }
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#132c1f] text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveFilter('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'All'
              ? 'bg-[#1b3b2b] text-white'
              : 'bg-white text-slate-600 border border-[#e2e5dc] hover:bg-slate-100'
          }`}
        >
          All {filterCounts.All}
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === cat
                ? 'bg-[#1b3b2b] text-white'
                : 'bg-white text-slate-600 border border-[#e2e5dc] hover:bg-slate-100'
            }`}
          >
            {cat} {filterCounts[cat] || 0}
          </button>
        ))}
      </div>

      {/* 2-Column Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tasks List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">Loading today's tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white border border-[#e2e5dc] rounded-2xl p-10 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-500">No tasks found for today.</p>
              <button
                onClick={() => openAddTask({ scheduledDate: new Date().toISOString().split('T')[0] })}
                className="text-xs text-[#1b3b2b] font-bold underline"
              >
                + Add a task for today
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => <TaskItem key={task._id} task={task} />)
          )}
        </div>

        {/* Right Column: Plant Quote Card + Quick Add */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-sm h-64 bg-slate-900 border border-slate-800 flex items-center justify-center p-6 text-center">
            <img
              src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80"
              alt="Plant"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div className="relative z-10 space-y-2">
              <p className="text-xl font-serif italic font-bold text-white leading-snug">
                "Progress,<br />not perfection."
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#e2e5dc] rounded-2xl p-4 space-y-2 shadow-sm">
            <span className="text-xs font-bold text-slate-900 block">Quick Add</span>
            <button
              onClick={() => openAddTask({ scheduledDate: new Date().toISOString().split('T')[0] })}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-[#d6e2d5] text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 border border-[#e2e5dc] transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-[#1b3b2b] text-white flex items-center justify-center font-bold text-xs">
                +
              </div>
              <span>Add a task for today</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
