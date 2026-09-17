import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useTasks } from '../context/TaskContext';
import { TaskItem } from '../components/tasks/TaskItem';

export const InboxPage = () => {
  const { openAddTask, refreshTrigger } = useTasks();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchInboxTasks();
  }, [refreshTrigger]);

  const fetchInboxTasks = async () => {
    try {
      const { data } = await axiosClient.get('/tasks/inbox');
      setTasks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Learning', 'Project', 'Personal'];
  const filterCounts = { All: tasks.length };
  categories.forEach((cat) => {
    filterCounts[cat] = tasks.filter((t) => t.category === cat || t.labels?.includes(cat)).length;
  });

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'All') return true;
    return t.category === activeFilter || t.labels?.includes(activeFilter);
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inbox</h1>
        <p className="text-xs text-slate-500 mt-0.5">Capture everything. Organize later.</p>
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

      {/* Tasks List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 animate-pulse">Loading inbox tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white border border-[#e2e5dc] rounded-2xl p-10 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-500">Your inbox is clear!</p>
          <button onClick={() => openAddTask()} className="text-xs text-[#1b3b2b] font-bold underline">
            + Quick Add a task
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <TaskItem key={task._id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
