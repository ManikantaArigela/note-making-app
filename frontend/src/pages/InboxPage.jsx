import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useTasks } from '../context/TaskContext';
import { TaskItem } from '../components/tasks/TaskItem';
import { Plus } from 'lucide-react';

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

  // Filter count calculations
  const countAll = tasks.length;
  const countEveryday = tasks.filter((t) => t.repeat === 'daily' || t.repeat === 'weekday').length;
  const countWeekly = tasks.filter((t) => t.repeat === 'weekly').length;
  const countUnscheduled = tasks.filter((t) => !t.scheduledDate || t.repeat === 'none').length;
  const countLearning = tasks.filter((t) => t.category === 'Learning').length;
  const countProject = tasks.filter((t) => t.category === 'Project').length;
  const countPersonal = tasks.filter((t) => t.category === 'Personal').length;

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Everyday') return t.repeat === 'daily' || t.repeat === 'weekday';
    if (activeFilter === 'Weekly') return t.repeat === 'weekly';
    if (activeFilter === 'Unscheduled') return !t.scheduledDate || t.repeat === 'none';
    return t.category === activeFilter || t.labels?.includes(activeFilter);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inbox & Activity Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage everyday routines, weekly recurring tasks, and unscheduled ideas.
          </p>
        </div>

        <button
          onClick={() => openAddTask()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#132c1f] text-white text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveFilter('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeFilter === 'All'
              ? 'bg-[#1b3b2b] text-white'
              : 'bg-white text-slate-600 border border-[#e2e5dc] hover:bg-slate-100'
          }`}
        >
          All {countAll}
        </button>

        <button
          onClick={() => setActiveFilter('Everyday')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeFilter === 'Everyday'
              ? 'bg-[#1b3b2b] text-white'
              : 'bg-white text-slate-600 border border-[#e2e5dc] hover:bg-slate-100'
          }`}
        >
          Everyday Tasks 🔄 {countEveryday}
        </button>

        <button
          onClick={() => setActiveFilter('Weekly')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeFilter === 'Weekly'
              ? 'bg-[#1b3b2b] text-white'
              : 'bg-white text-slate-600 border border-[#e2e5dc] hover:bg-slate-100'
          }`}
        >
          Weekly Tasks 🗓️ {countWeekly}
        </button>

        <button
          onClick={() => setActiveFilter('Unscheduled')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeFilter === 'Unscheduled'
              ? 'bg-[#1b3b2b] text-white'
              : 'bg-white text-slate-600 border border-[#e2e5dc] hover:bg-slate-100'
          }`}
        >
          Unscheduled 💡 {countUnscheduled}
        </button>

        <button
          onClick={() => setActiveFilter('Learning')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeFilter === 'Learning'
              ? 'bg-[#1b3b2b] text-white'
              : 'bg-white text-slate-600 border border-[#e2e5dc] hover:bg-slate-100'
          }`}
        >
          Learning {countLearning}
        </button>

        <button
          onClick={() => setActiveFilter('Project')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeFilter === 'Project'
              ? 'bg-[#1b3b2b] text-white'
              : 'bg-white text-slate-600 border border-[#e2e5dc] hover:bg-slate-100'
          }`}
        >
          Project {countProject}
        </button>

        <button
          onClick={() => setActiveFilter('Personal')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeFilter === 'Personal'
              ? 'bg-[#1b3b2b] text-white'
              : 'bg-white text-slate-600 border border-[#e2e5dc] hover:bg-slate-100'
          }`}
        >
          Personal {countPersonal}
        </button>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 animate-pulse">Loading inbox tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white border border-[#e2e5dc] rounded-2xl p-10 text-center space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">No tasks match your selected filter.</p>
          <button onClick={() => openAddTask()} className="text-xs text-[#1b3b2b] font-bold underline">
            + Add a task
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
