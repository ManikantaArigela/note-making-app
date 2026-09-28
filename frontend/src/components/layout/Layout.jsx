import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { AddTaskModal } from '../tasks/AddTaskModal';
import { ConnectionBanner } from './ConnectionBanner';

export const Layout = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f4f5f0] text-slate-800">
      <ConnectionBanner />
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <Navbar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Nav */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Universal Add Task Modal */}
      <AddTaskModal />
    </div>
  );
};

