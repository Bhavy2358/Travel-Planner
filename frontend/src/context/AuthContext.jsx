import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, tripsAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('travel_copilot_token') || null);
  const [loading, setLoading] = useState(true);
  const [activeTrip, setActiveTrip] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (token) {
          const res = await authAPI.getMe();
          setUser(res.data);
        } else {
          // Out-of-the-box mode: auto-login with Demo account
          const res = await authAPI.login('demo@travelplanner.com', 'demo123');
          setToken(res.data.access_token);
          localStorage.setItem('travel_copilot_token', res.data.access_token);
          setUser(res.data.user);
        }
      } catch (err) {
        console.warn('Authentication fallback:', err);
        // Set local fallback user
        setUser({
          id: 1,
          email: 'demo@travelplanner.com',
          full_name: 'Demo Explorer',
          role: 'admin',
          preferred_travel_style: 'Balanced',
          budget_preference: 'Standard',
          favorite_activities: 'Culture, Food, History'
        });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    setToken(res.data.access_token);
    localStorage.setItem('travel_copilot_token', res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    setToken(res.data.access_token);
    localStorage.setItem('travel_copilot_token', res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setActiveTrip(null);
    localStorage.removeItem('travel_copilot_token');
  };

  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        activeTrip,
        setActiveTrip,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
