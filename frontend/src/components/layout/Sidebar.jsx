import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  Inbox,
  CheckCircle2,
  Route,
  RefreshCw,
  FolderKanban,
  Users,
  Settings,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { InstallAppModal } from './InstallAppModal';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'today', label: 'Today', icon: CalendarCheck },
    { id: 'tomorrow', label: 'Tomorrow', icon: CalendarDays },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

  const focusNav = [
    { id: 'roadmap', label: 'Roadmap', icon: Route },
    { id: 'weekly-reset', label: 'Weekly Reset', icon: RefreshCw },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
  ];

  const adminNav = [
    { id: 'admin', label: 'Admin Portal', icon: ShieldCheck },
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
    <>
      <aside className="w-60 bg-[#f4f5f0] border-r border-[#e2e5dc] flex flex-col justify-between hidden md:flex h-screen sticky top-0 select-none p-4">
        <div className="space-y-6 overflow-y-auto">
          {/* Brand Header with New Logo */}
          <div className="flex items-center gap-3 px-2 py-1">
            <img
              src="/pwa-192x192.png"
              alt="FocusFlow Logo"
              className="w-8 h-8 rounded-xl shadow-md border border-slate-700/10 object-cover"
            />
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

          {/* Admin Nav if user is admin */}
          {user?.role === 'admin' && (
            <div>
              <div className="px-3.5 mb-2 text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                ADMINISTRATION
              </div>
              {renderNavGroup(adminNav)}
            </div>
          )}

          {/* Account Nav */}
          <div>
            <div className="px-3.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ACCOUNT
            </div>
            {renderNavGroup(secondaryNav)}
          </div>

          {/* Install App Button */}
          {!isInstalled && (
            <div className="px-1 pt-2">
              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#1b3b2b]/10 hover:bg-[#1b3b2b]/20 text-[#1b3b2b] text-xs font-bold transition-all border border-[#1b3b2b]/20 shadow-sm"
              >
                <Download className="w-4 h-4 text-[#1b3b2b]" />
                <span>Install Desktop App</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Handwritten Quote */}
        <div className="pt-4 px-2">
          <span className="font-handwriting text-2xl text-slate-800 leading-tight block">
            Better<br />Every Day
          </span>
        </div>
      </aside>

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallSuccess={() => setIsInstalled(true)}
      />
    </>
  );
};
