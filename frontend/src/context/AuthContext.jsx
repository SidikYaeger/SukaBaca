import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getCurrentSession());

  useEffect(() => {
    setSession(authService.getCurrentSession());
  }, []);

  const login = async (username, password) => {
    const updated = await authService.login(username, password);
    setSession(updated);
    return updated;
  };

  const register = async (username, password, email, name) => {
    const updated = await authService.register(username, password, email, name);
    setSession(updated);
    return updated;
  };

  const logout = () => {
    authService.logout();
    setSession({ isAuthenticated: false, user: null, profile: null });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: session.isAuthenticated,
        user: session.user,
        profile: session.profile,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
