import React from 'react';
import { TaskItem } from './TaskItem';
import { CheckCircle2, Inbox } from 'lucide-react';

export const TaskList = ({ tasks = [], title, emptyMessage = 'No tasks found' }) => {
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header and Progress Bar */}
      {title && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>{title}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {completedCount}/{totalCount}
              </span>
            </h2>
            <span className="text-xs font-bold text-indigo-400">{percentage}% completed</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Task List items */}
      {totalCount === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
            <Inbox className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-sm font-medium text-slate-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <TaskItem key={task._id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
