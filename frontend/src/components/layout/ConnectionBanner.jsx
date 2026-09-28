import React, { useState, useEffect } from 'react';
import { WifiOff, Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useConnection } from '../../context/ConnectionContext';

export const ConnectionBanner = () => {
  const { isOnline, isDBConnected, isDegraded, checkHealth } = useConnection();
  const [showRestored, setShowRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline || isDegraded || !isDBConnected) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isDBConnected, isDegraded, wasOffline]);

  if (!isOnline) {
    return (
      <div className="bg-amber-600 text-white text-xs px-4 py-2 flex items-center justify-between shadow-md animate-in slide-in-from-top duration-200 select-none">
        <div className="flex items-center gap-2 font-medium">
          <WifiOff className="w-4 h-4 animate-bounce" />
          <span>You are currently offline. Changes will sync once reconnected.</span>
        </div>
        <button
          onClick={checkHealth}
          className="flex items-center gap-1 bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    );
  }

  if (isDegraded || !isDBConnected) {
    return (
      <div className="bg-amber-500/90 backdrop-blur-md text-slate-900 text-xs px-4 py-1.5 flex items-center justify-between border-b border-amber-600/30 shadow-sm animate-in slide-in-from-top duration-200 select-none">
        <div className="flex items-center gap-2 font-semibold">
          <Database className="w-4 h-4 text-slate-900 animate-pulse" />
          <span>Reconnecting to database server... Features may experience slight delay.</span>
        </div>
        <button
          onClick={checkHealth}
          className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors"
        >
          <RefreshCw className="w-3 h-3 animate-spin" />
          Checking
        </button>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div className="bg-emerald-600 text-white text-xs px-4 py-1.5 flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200 select-none">
        <CheckCircle2 className="w-4 h-4" />
        <span className="font-semibold">Connection restored! Database synced.</span>
      </div>
    );
  }

  return null;
};
