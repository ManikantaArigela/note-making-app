import React, { useState, useEffect } from 'react';
import { FocusTimer } from '../components/focus/FocusTimer';
import axiosClient from '../api/axiosClient';
import { Compass, Clock, History } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const FocusPage = () => {
  const { refreshTrigger } = useTasks();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFocusHistory();
  }, [refreshTrigger]);

  const fetchFocusHistory = async () => {
    try {
      const { data } = await axiosClient.get('/focus/history');
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Focus Zone</h1>
        <p className="text-xs text-slate-500 mt-0.5">Eliminate distractions and execute deep focused work sessions</p>
      </div>

      {/* Main Focus Timer */}
      <FocusTimer />

      {/* Focus History & Stats */}
      {history && (
        <div className="bg-white border border-[#e2e5dc] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-[#1b3b2b]" />
              <span>Recent Focus Sessions</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">Total: {history.totalHours} hours</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.sessions.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No focus sessions logged yet.</p>
            ) : (
              history.sessions.map((session) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#1b3b2b]" />
                    <div>
                      <span className="font-bold text-slate-900">
                        {session.durationMinutes} mins ({session.sessionType})
                      </span>
                      {session.taskId && <p className="text-[11px] text-slate-500">Task: {session.taskId.title}</p>}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
