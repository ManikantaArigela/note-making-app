import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Clock, Tag, Flag, Repeat, Bell, ListCheck } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import axiosClient from '../../api/axiosClient';

export const AddTaskModal = () => {
  const { isAddTaskOpen, addTaskInitialState, closeAddTask, createTask } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Learning');
  const [projectId, setProjectId] = useState('');
  const [repeat, setRepeat] = useState('none');
  const [reminder, setReminder] = useState('none');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAddTaskOpen) {
      axiosClient.get('/projects').then((res) => setProjects(res.data)).catch(() => {});

      if (addTaskInitialState) {
        setTitle(addTaskInitialState.title || '');
        setScheduledDate(addTaskInitialState.scheduledDate || '');
        setCategory(addTaskInitialState.category || 'Learning');
        setProjectId(addTaskInitialState.projectId || '');
      } else {
        setTitle('');
        setDescription('');
        setScheduledDate(new Date().toISOString().split('T')[0]);
        setDueTime('10:00');
        setPriority('medium');
        setCategory('Learning');
        setProjectId('');
        setRepeat('none');
        setReminder('none');
        setSubtasks([]);
      }
    }
  }, [isAddTaskOpen, addTaskInitialState]);

  if (!isAddTaskOpen) return null;

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), completed: false }]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await createTask({
        title,
        description,
        scheduledDate: scheduledDate || null,
        dueTime: dueTime || null,
        priority,
        category,
        projectId: projectId || null,
        repeat,
        subtasks,
      });
      closeAddTask();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#e2e5dc] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-6 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Add New Task</h2>
          <button
            onClick={closeAddTask}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <input
              type="text"
              placeholder="What do you want to do?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-[#1b3b2b]"
            />
          </div>

          {/* Description */}
          <div>
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1b3b2b]"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1b3b2b]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1b3b2b]"
              />
            </div>
          </div>

          {/* Repeat & Priority Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Repeat className="w-3 h-3 text-slate-400" /> Repeat
              </label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1b3b2b]"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Every day</option>
                <option value="weekly">Every week</option>
                <option value="monthly">Every month</option>
                <option value="yearly">Every year</option>
                <option value="custom">Custom...</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Flag className="w-3 h-3 text-amber-500" /> Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1b3b2b]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Category & Reminders Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1b3b2b]"
              >
                <option value="Learning">Learning</option>
                <option value="Project">Project</option>
                <option value="Personal">Personal</option>
                <option value="DSA">DSA</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Bell className="w-3 h-3 text-slate-400" /> Reminders
              </label>
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1b3b2b]"
              >
                <option value="none">None</option>
                <option value="10m">10 minutes before</option>
                <option value="30m">30 minutes before</option>
                <option value="1h">1 hour before</option>
              </select>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <div className="flex gap-2 mb-1.5">
              <input
                type="text"
                placeholder="Add subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1b3b2b]"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200"
              >
                + Add Subtask
              </button>
            </div>
            {subtasks.length > 0 && (
              <ul className="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200 max-h-24 overflow-y-auto">
                {subtasks.map((st, i) => (
                  <li key={i} className="flex items-center justify-between text-xs text-slate-700 py-0.5">
                    <span>• {st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(i)}
                      className="text-slate-400 hover:text-rose-600 font-bold"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={closeAddTask}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-5 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#132c1f] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all"
            >
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
