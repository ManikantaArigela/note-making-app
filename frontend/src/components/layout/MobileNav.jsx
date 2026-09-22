import React from 'react';
import { LayoutDashboard, CalendarCheck, CalendarDays, Inbox, Route, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNav = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const items = [
    { id: 'dashboard', label: 'Dash', icon: LayoutDashboard },
    { id: 'today', label: 'Today', icon: CalendarCheck },
    { id: 'tomorrow', label: 'Tomorrow', icon: CalendarDays },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck }] : []),
    { id: 'weekly-reset', label: 'Reset', icon: RefreshCw },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#f4f5f0]/95 backdrop-blur-md border-t border-[#e2e5dc] flex items-center justify-around py-2 px-1 z-40 select-none">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-colors ${
              isActive ? 'bg-[#d6e2d5] text-[#1b3b2b] font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
