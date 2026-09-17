import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6b7280'];

export const TaskCategoryChart = ({ data = [] }) => {
  const totalTasks = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white border border-[#e2e5dc] rounded-2xl p-5 shadow-sm space-y-3 h-full">
      <h3 className="text-xs font-bold text-slate-900 tracking-tight">Task Categories</h3>

      {data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-xs text-slate-400 italic">
          No task data
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {/* Donut Chart with center label */}
          <div className="relative w-36 h-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e5dc',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-extrabold text-slate-900">{totalTasks}</span>
              <span className="text-[9px] text-slate-500 font-semibold uppercase">Tasks</span>
            </div>
          </div>

          {/* Breakdown Legend */}
          <div className="flex-1 space-y-1.5 min-w-0">
            {data.slice(0, 5).map((cat, i) => {
              const pct = totalTasks > 0 ? Math.round((cat.count / totalTasks) * 100) : 0;
              return (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 truncate text-slate-600">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span className="font-bold text-slate-800 ml-1">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
