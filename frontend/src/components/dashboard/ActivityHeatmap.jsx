import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Calendar, CheckCircle, Clock, Activity, X, Zap } from 'lucide-react';

export const ActivityHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayDetails, setDayDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchHeatmap();
  }, []);

  const fetchHeatmap = async () => {
    try {
      const { data } = await axiosClient.get('/activity/heatmap');
      setHeatmapData(data || {});
    } catch (err) {
      console.error('Heatmap fetch error:', err);
    }
  };

  const generateGrid = () => {
    const days = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);

    for (let i = 0; i < 365; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const info = heatmapData[dateStr] || { count: 0, intensity: 0 };
      days.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        month: d.toLocaleString('en-US', { month: 'short' }),
        info,
      });
    }
    return days;
  };

  const gridDays = generateGrid();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const handleCellClick = async (dateStr) => {
    setSelectedDay(dateStr);
    setLoadingDetails(true);
    try {
      const { data } = await axiosClient.get(`/activity/day/${dateStr}`);
      setDayDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getIntensityClass = (intensity) => {
    switch (intensity) {
      case 1:
        return 'bg-[#c5e1a5] border-[#b2d88f]';
      case 2:
        return 'bg-[#7cb342] border-[#689f38]';
      case 3:
        return 'bg-[#33691e] border-[#255115]';
      case 4:
        return 'bg-[#1b3b2b] border-[#122a1e]';
      default:
        return 'bg-[#ebede6] border-[#dcdfd6] hover:border-slate-400';
    }
  };

  return (
    <div className="bg-white border border-[#e2e5dc] rounded-2xl p-5 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Activity Heatmap</span>
          </h2>
          <p className="text-[10px] text-slate-500">Your consistency over time.</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-[#ebede6] border border-[#dcdfd6]" />
          <span className="w-2.5 h-2.5 rounded-sm bg-[#c5e1a5] border border-[#b2d88f]" />
          <span className="w-2.5 h-2.5 rounded-sm bg-[#7cb342] border border-[#689f38]" />
          <span className="w-2.5 h-2.5 rounded-sm bg-[#33691e] border border-[#255115]" />
          <span className="w-2.5 h-2.5 rounded-sm bg-[#1b3b2b] border border-[#122a1e]" />
          <span>More</span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-1">
        {/* Months Label Row */}
        <div className="flex justify-between min-w-[700px] pl-6 pr-2 mb-1 text-[10px] font-semibold text-slate-500">
          {months.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>

        <div className="flex items-start gap-2 min-w-[700px]">
          {/* Day of week labels */}
          <div className="flex flex-col justify-between h-[84px] text-[9px] font-semibold text-slate-500 select-none pr-1">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* 365 days grid */}
          <div className="heatmap-grid flex-1">
            {gridDays.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleCellClick(cell.date)}
                title={`${cell.date}: ${cell.info.count || 0} activities`}
                className={`w-2.5 h-2.5 rounded-sm border transition-all duration-150 transform hover:scale-125 ${getIntensityClass(
                  cell.info.intensity
                )}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2e5dc] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1b3b2b]" />
                <span>Activity Details: {selectedDay}</span>
              </h3>
              <button
                onClick={() => {
                  setSelectedDay(null);
                  setDayDetails(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading activity details...</div>
            ) : dayDetails ? (
              <div className="space-y-4">
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#f4f5f0] p-2.5 rounded-xl border border-[#e2e5dc]">
                    <CheckCircle className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                    <div className="text-xs font-bold text-slate-900">{dayDetails.summary.taskCount}</div>
                    <div className="text-[10px] text-slate-500">Tasks Completed</div>
                  </div>
                  <div className="bg-[#f4f5f0] p-2.5 rounded-xl border border-[#e2e5dc]">
                    <Clock className="w-4 h-4 text-indigo-700 mx-auto mb-1" />
                    <div className="text-xs font-bold text-slate-900">{dayDetails.summary.focusMinutes}m</div>
                    <div className="text-[10px] text-slate-500">Focus Time</div>
                  </div>
                  <div className="bg-[#f4f5f0] p-2.5 rounded-xl border border-[#e2e5dc]">
                    <Zap className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                    <div className="text-xs font-bold text-slate-900">{dayDetails.summary.habitCount}</div>
                    <div className="text-[10px] text-slate-500">Habits Logged</div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  <div className="text-[11px] font-bold text-slate-700">Timeline ({dayDetails.events.length})</div>
                  {dayDetails.events.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No activity logged on this date.</p>
                  ) : (
                    dayDetails.events.map((evt, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1b3b2b]" />
                        <span className="font-medium truncate">{evt.title}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
