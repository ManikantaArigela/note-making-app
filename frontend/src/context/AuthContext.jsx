import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('productivity_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      localStorage.removeItem('productivity_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('productivity_token');
      if (token) {
        try {
          const { data } = await axiosClient.get('/auth/me');
          setUser(data);
          localStorage.setItem('productivity_user', JSON.stringify(data));
        } catch (err) {
          console.warn('Auth verification failed:', err.message);
          setUser(null);
          localStorage.removeItem('productivity_token');
          localStorage.removeItem('productivity_user');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await axiosClient.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    localStorage.setItem('productivity_token', data.token);
    localStorage.setItem('productivity_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axiosClient.post('/auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    localStorage.setItem('productivity_token', data.token);
    localStorage.setItem('productivity_user', JSON.stringify(data));
    setUser(data);
    return data;
  };


  const logout = () => {
    localStorage.removeItem('productivity_token');
    localStorage.removeItem('productivity_user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const { data } = await axiosClient.put('/auth/profile', profileData);
    setUser(data);
    localStorage.setItem('productivity_user', JSON.stringify(data));
    return data;
  };

  const updatePreferences = async (prefData) => {
    const { data } = await axiosClient.put('/auth/preferences', prefData);
    setUser((prev) => {
      const updated = { ...prev, preferences: data };
      localStorage.setItem('productivity_user', JSON.stringify(updated));
      return updated;
    });
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
