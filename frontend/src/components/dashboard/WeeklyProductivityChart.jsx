import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const WeeklyProductivityChart = ({ data = [] }) => {
  return (
    <div className="bg-white border border-[#e2e5dc] rounded-2xl p-5 shadow-sm space-y-3 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 tracking-tight">Productivity This Week</h3>
        <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#1b3b2b]" /> Tasks Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#a3c9a8]" /> Focus Time (hrs)
          </span>
        </div>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e5dc',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#1f2937',
              }}
            />
            <Bar dataKey="completedTasks" fill="#1b3b2b" radius={[3, 3, 0, 0]} name="Tasks Completed" />
            <Bar dataKey="focusHours" fill="#a3c9a8" radius={[3, 3, 0, 0]} name="Focus Time (hrs)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
