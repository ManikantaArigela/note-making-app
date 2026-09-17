import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Users, Search, UserPlus, Flame, Award, Check, X, ShieldCheck } from 'lucide-react';

export const FriendsPage = () => {
  const [friendsData, setFriendsData] = useState({ acceptedFriends: [], pendingRequests: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const { data } = await axiosClient.get('/friends');
      setFriendsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const { data } = await axiosClient.get(`/friends/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendRequest = async (recipientId) => {
    try {
      await axiosClient.post('/friends/request', { recipientId });
      alert('Friend request sent!');
      setSearchResults(searchResults.filter((u) => u._id !== recipientId));
      fetchFriends();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleRespondRequest = async (friendshipId, action) => {
    try {
      await axiosClient.patch(`/friends/request/${friendshipId}`, { action });
      fetchFriends();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Friends</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Connect with friends, compare active streaks, and stay motivated together
        </p>
      </div>

      {/* User Search Bar */}
      <div className="bg-white border border-[#e2e5dc] rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#1b3b2b]" />
          <span>Find Friends</span>
        </h2>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1b3b2b]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#132c1f] text-white text-xs font-bold shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {searchResults.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{u.name}</span>
                  <span className="text-slate-500 block text-[11px]">{u.email}</span>
                </div>
                <button
                  onClick={() => handleSendRequest(u._id)}
                  className="px-3 py-1.5 rounded-lg bg-[#1b3b2b] hover:bg-[#132c1f] text-white font-bold text-[11px]"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {friendsData.pendingRequests.length > 0 && (
        <div className="bg-white border border-[#e2e5dc] rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-[#1b3b2b] uppercase tracking-wider">
            Pending Friend Requests ({friendsData.pendingRequests.length})
          </h2>

          <div className="space-y-2">
            {friendsData.pendingRequests.map((req) => (
              <div
                key={req.friendshipId}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{req.user.name}</span>
                  <span className="text-slate-500 block text-[11px]">Level {req.user.level || 1}</span>
                </div>

                {req.isIncoming ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondRequest(req.friendshipId, 'accept')}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                      title="Accept"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRespondRequest(req.friendshipId, 'reject')}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-600 text-slate-600 hover:text-white"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Request Sent</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends Leaderboard */}
      <div className="bg-white border border-[#e2e5dc] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Friends Streak Leaderboard</span>
          </h2>
          <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Private tasks hidden
          </span>
        </div>

        {friendsData.acceptedFriends.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">
            No friends added yet. Use the search bar above to connect with friends!
          </p>
        ) : (
          <div className="space-y-2">
            {friendsData.acceptedFriends.map(({ friendshipId, user: friend }) => (
              <div
                key={friendshipId}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1b3b2b] text-white font-bold flex items-center justify-center">
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">{friend.name}</span>
                    <span className="text-slate-500 block text-[10px]">{friend.bio || 'Productivity seeker'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-amber-700 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{friend.currentStreak || 0}d streak</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#1b3b2b] font-bold bg-[#d6e2d5] px-2.5 py-0.5 rounded-full">
                    <Award className="w-3 h-3" />
                    <span>Lvl {friend.level || 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
