import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { TodayPage } from './pages/TodayPage';
import { TomorrowPage } from './pages/TomorrowPage';
import { InboxPage } from './pages/InboxPage';
import { GoalsPage } from './pages/GoalsPage';
import { FocusPage } from './pages/FocusPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { FriendsPage } from './pages/FriendsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs animate-pulse">
        Initializing ApexPulse...
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
      case 'goals':
        return <GoalsPage />;
      case 'focus':
        return <FocusPage />;
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
