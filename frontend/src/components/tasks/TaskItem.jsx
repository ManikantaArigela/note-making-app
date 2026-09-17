import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, MoreVertical, Trash2, ArrowRight } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export const TaskItem = ({ task }) => {
  const { toggleTaskCompletion, moveTask, deleteTask } = useTasks();
  const [showMenu, setShowMenu] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    try {
      setIsToggling(true);
      await toggleTaskCompletion(task._id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case 'Learning':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Project':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'DSA':
      case 'Code':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Personal':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      className={`group bg-white border border-[#e2e5dc] hover:border-slate-400/60 rounded-2xl p-4 transition-all duration-200 shadow-sm ${
        task.isCompleted ? 'opacity-65 bg-slate-50' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Checkbox & Info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className="text-slate-400 hover:text-[#1b3b2b] transition-colors focus:outline-none shrink-0"
          >
            {task.isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
            ) : (
              <Circle className="w-5 h-5 stroke-[1.75]" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <h3
              className={`text-xs font-bold text-slate-900 leading-snug break-words ${
                task.isCompleted ? 'line-through text-slate-400 font-normal' : ''
              }`}
            >
              {task.title}
            </h3>

            {task.dueTime && (
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                {task.dueTime}
              </span>
            )}
          </div>
        </div>

        {/* Right: Category Pill & 3-dots Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${getCategoryBadgeClass(
              task.category
            )}`}
          >
            {task.category}
          </span>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-7 w-40 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-20 text-xs">
                <button
                  onClick={() => {
                    moveTask(task._id, 'today');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Move to Today</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    moveTask(task._id, 'tomorrow');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Move to Tomorrow</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    moveTask(task._id, 'inbox');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Move to Inbox</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    deleteTask(task._id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 font-semibold"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
