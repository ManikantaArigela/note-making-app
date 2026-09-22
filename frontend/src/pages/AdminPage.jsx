import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Users, UserCheck, CheckSquare, ShieldCheck, Flame, Search, RefreshCw } from 'lucide-react';

export const AdminPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosClient.get('/admin/stats');
      setData(response.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err.response?.data?.message || 'Failed to load admin metrics');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = data?.users?.filter((u) => {
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  }) || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#1b3b2b]" />
            <span>Admin Portal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Platform overview & user growth statistics
          </p>
        </div>

        <button
          onClick={fetchAdminStats}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e2e5dc] text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-xs text-rose-700 font-semibold">
          {error}
        </div>
      ) : loading ? (
        <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
          Loading platform metrics...
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Registered Users */}
            <div className="bg-white border border-[#e2e5dc] rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#1b3b2b]" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{data?.metrics?.totalUsers || 0}</p>
              <p className="text-[11px] text-slate-400">Total registered platform accounts</p>
            </div>

            {/* Active Users Today */}
            <div className="bg-white border border-[#e2e5dc] rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Today</span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-blue-700" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{data?.metrics?.activeUsersToday || 0}</p>
              <p className="text-[11px] text-slate-400">Users logged in / active today</p>
            </div>

            {/* Total Platform Tasks */}
            <div className="bg-white border border-[#e2e5dc] rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tasks</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-indigo-700" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{data?.metrics?.totalTasks || 0}</p>
              <p className="text-[11px] text-slate-400">
                {data?.metrics?.totalCompletedTasks || 0} tasks completed
              </p>
            </div>

            {/* Total Focus Sessions */}
            <div className="bg-white border border-[#e2e5dc] rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Focus Sessions</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{data?.metrics?.totalFocusSessions || 0}</p>
              <p className="text-[11px] text-slate-400">Pomodoro focus timers completed</p>
            </div>
          </div>

          {/* User Directory Section */}
          <div className="bg-white border border-[#e2e5dc] rounded-2xl shadow-sm overflow-hidden space-y-4 p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">User Directory</h2>
                <p className="text-xs text-slate-500">List of all registered users on FocusFlow</p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1b3b2b]"
                />
              </div>
            </div>

            {/* User Directory Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Streak</th>
                    <th className="px-4 py-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1b3b2b]/10 text-[#1b3b2b] flex items-center justify-center font-bold text-xs shrink-0">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span>{user.name}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{user.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              user.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {user.currentStreak || 0} days 🔥
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
