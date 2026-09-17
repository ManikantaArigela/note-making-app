import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { Settings, Bell, User as UserIcon, Lock } from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateProfile, updatePreferences } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileMsg, setProfileMsg] = useState('');

  const [pushEnabled, setPushEnabled] = useState(user?.preferences?.pushNotifications ?? true);
  const [emailEnabled, setEmailEnabled] = useState(user?.preferences?.emailNotifications ?? false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(user?.preferences?.quietHours?.enabled ?? false);
  const [quietStart, setQuietStart] = useState(user?.preferences?.quietHours?.start || '22:00');
  const [quietEnd, setQuietEnd] = useState(user?.preferences?.quietHours?.end || '07:00');
  const [prefMsg, setPrefMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, bio });
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      await updatePreferences({
        pushNotifications: pushEnabled,
        emailNotifications: emailEnabled,
        quietHours: {
          enabled: quietHoursEnabled,
          start: quietStart,
          end: quietEnd,
        },
      });
      setPrefMsg('Preferences saved!');
      setTimeout(() => setPrefMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put('/auth/password', { currentPassword, newPassword });
      setPassMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPassMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Password update failed');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-xs select-none">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your profile, notification rules, theme, and security</p>
      </div>

      {/* Profile */}
      <div className="bg-white border border-[#e2e5dc] rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <UserIcon className="w-4 h-4 text-[#1b3b2b]" />
          <span>Account Profile</span>
        </h2>

        {profileMsg && <div className="text-emerald-700 text-xs font-semibold">{profileMsg}</div>}

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b3b2b]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Productivity Bio</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b3b2b]"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#132c1f] text-white font-bold shadow-sm"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Notification Rules */}
      <div className="bg-white border border-[#e2e5dc] rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Bell className="w-4 h-4 text-[#1b3b2b]" />
          <span>Smart Motivational Notifications</span>
        </h2>

        {prefMsg && <div className="text-emerald-700 text-xs font-semibold">{prefMsg}</div>}

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block">Push Notifications</span>
              <span className="text-slate-500 text-[11px]">Receive motivational progress alerts on mobile & desktop</span>
            </div>
            <input
              type="checkbox"
              checked={pushEnabled}
              onChange={(e) => setPushEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#1b3b2b] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block">Email Notifications</span>
              <span className="text-slate-500 text-[11px]">Optional daily summary emails</span>
            </div>
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#1b3b2b] rounded cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Quiet Hours</span>
                <span className="text-slate-500 text-[11px]">Suppress notifications during rest hours</span>
              </div>
              <input
                type="checkbox"
                checked={quietHoursEnabled}
                onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#1b3b2b] rounded cursor-pointer"
              />
            </div>

            {quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#132c1f] text-white font-bold shadow-sm"
          >
            Save Preferences
          </button>
        </form>
      </div>

      {/* Security */}
      <div className="bg-white border border-[#e2e5dc] rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Lock className="w-4 h-4 text-[#1b3b2b]" />
          <span>Password & Security</span>
        </h2>

        {passMsg && <div className="text-emerald-700 text-xs font-semibold">{passMsg}</div>}

        <form onSubmit={handleUpdatePassword} className="space-y-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b3b2b]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b3b2b]"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
