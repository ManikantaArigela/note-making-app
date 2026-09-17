import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { AddTaskModal } from '../tasks/AddTaskModal';

export const Layout = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="flex min-h-screen bg-[#f4f5f0] text-slate-800">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {children}
        </main>
      </div>

      {/* Mobile Nav */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Universal Add Task Modal */}
      <AddTaskModal />
    </div>
  );
};
