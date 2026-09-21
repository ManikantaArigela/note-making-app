import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { TodayPage } from './pages/TodayPage';
import { TomorrowPage } from './pages/TomorrowPage';
import { InboxPage } from './pages/InboxPage';
import { CompletedPage } from './pages/CompletedPage';
import { GoalsPage } from './pages/GoalsPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { WeeklyResetPage } from './pages/WeeklyResetPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { FriendsPage } from './pages/FriendsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Initialize background task reminder checker
  useTaskReminder();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f5f0] flex items-center justify-center text-slate-500 text-xs animate-pulse">
        Initializing FocusFlow...
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'today':
        return <TodayPage />;
      case 'tomorrow':
        return <TomorrowPage />;
      case 'inbox':
        return <InboxPage />;
      case 'completed':
        return <CompletedPage />;
      case 'roadmap':
        return <RoadmapPage />;
      case 'goals':
        return <RoadmapPage />;
      case 'weekly-reset':
        return <WeeklyResetPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'friends':
        return <FriendsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <Layout activeTab={activeTab} setActiveTab={setActiveTab}>{renderActivePage()}</Layout>;
}

export default App;
