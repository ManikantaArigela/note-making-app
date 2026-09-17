import React from 'react';
import {
  Compass,
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  Inbox,
  Heart,
  Timer,
  FolderKanban,
  Users,
  Settings,
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'today', label: 'Today', icon: CalendarCheck },
    { id: 'tomorrow', label: 'Tomorrow', icon: CalendarDays },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
  ];

  const focusNav = [
    { id: 'goals', label: 'Goals', icon: Heart },
    { id: 'focus', label: 'Focus', icon: Compass },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
  ];

  const secondaryNav = [
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderNavGroup = (items) => (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <li key={item.id}>
            <button
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#d6e2d5] text-[#1b3b2b] shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">
                {isActive && (item.id === 'today' || item.id === 'tomorrow' || item.id === 'inbox') ? (
                  <span className="w-4 h-4 rounded-md bg-[#1b3b2b] text-white flex items-center justify-center text-[10px] font-bold">
                    +
                  </span>
                ) : (
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#1b3b2b]' : 'text-slate-500'}`} />
                )}
              </span>
              <span>{item.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside className="w-60 bg-[#f4f5f0] border-r border-[#e2e5dc] flex flex-col justify-between hidden md:flex h-screen sticky top-0 select-none p-4">
      <div className="space-y-6 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-7 h-7 rounded-lg bg-[#1b3b2b] flex items-center justify-center shadow-md">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-base font-extrabold text-[#1b3b2b] tracking-tight">FocusFlow</h1>
        </div>

        {/* Main Nav */}
        <div>{renderNavGroup(mainNav)}</div>

        {/* Productivity Nav */}
        <div>
          <div className="px-3.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            PRODUCTIVITY
          </div>
          {renderNavGroup(focusNav)}
        </div>

        {/* Account Nav */}
        <div>
          <div className="px-3.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            ACCOUNT
          </div>
          {renderNavGroup(secondaryNav)}
        </div>
      </div>

      {/* Bottom Handwritten Quote */}
      <div className="pt-4 px-2">
        <span className="font-handwriting text-2xl text-slate-800 leading-tight block">
          Better<br />Every Day
        </span>
      </div>
    </aside>
  );
};
