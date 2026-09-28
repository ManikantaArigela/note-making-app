import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

const ConnectionContext = createContext();

export const ConnectionProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDBConnected, setIsDBConnected] = useState(true);
  const [isDegraded, setIsDegraded] = useState(false);

  const checkHealth = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      setIsDBConnected(false);
      return;
    }

    try {
      const { data } = await axiosClient.get('/health', { _retryCount: 3 });
      if (data?.database?.status === 'ok') {
        setIsOnline(true);
        setIsDBConnected(true);
        setIsDegraded(false);
      } else {
        setIsDBConnected(false);
        setIsDegraded(true);
      }
    } catch (err) {
      setIsDegraded(true);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkHealth();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsDBConnected(false);
    };

    const handleConnectionStatus = (e) => {
      const { online, status } = e.detail || {};
      if (online) {
        setIsOnline(true);
        setIsDBConnected(status === 'ok');
        setIsDegraded(false);
      } else {
        setIsDegraded(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('connection:status', handleConnectionStatus);

    // Initial check
    checkHealth();

    // Health check ping every 30s
    const interval = setInterval(checkHealth, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('connection:status', handleConnectionStatus);
      clearInterval(interval);
    };
  }, [checkHealth]);

  return (
    <ConnectionContext.Provider
      value={{
        isOnline,
        isDBConnected,
        isDegraded,
        checkHealth,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => useContext(ConnectionContext);
