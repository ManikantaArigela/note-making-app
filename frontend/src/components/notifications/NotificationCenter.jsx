import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Bell, CheckCheck, Sparkles, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTaskReminder } from '../../hooks/useTaskReminder';

export const NotificationCenter = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { permissionStatus, requestNotificationPermission } = useTaskReminder();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await axiosClient.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosClient.patch('/notifications/all/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#e2e5dc] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in duration-150 text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-[#f4f5f0]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#1b3b2b]" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#1b3b2b] text-white">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Read all
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Push Enable Banner */}
      <div className="bg-[#d6e2d5]/60 border-b border-[#e2e5dc] p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#1b3b2b] font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#1b3b2b] shrink-0" />
          <span>
            {permissionStatus === 'granted'
              ? 'Time-based mobile alerts active'
              : 'Enable mobile & web task alerts'}
          </span>
        </div>
        {permissionStatus === 'granted' ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active
          </span>
        ) : (
          <button
            onClick={requestNotificationPermission}
            className="px-2.5 py-1 rounded-lg bg-[#1b3b2b] hover:bg-[#132c1f] text-white font-bold text-[10px] shadow-sm transition-all"
          >
            Enable
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 italic">No notifications yet</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-3.5 transition-colors ${n.read ? 'bg-white opacity-70' : 'bg-slate-50 font-medium'}`}
            >
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{n.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1.5 block font-semibold">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
