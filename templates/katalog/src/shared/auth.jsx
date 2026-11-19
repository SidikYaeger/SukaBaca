import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getSession, clearSession, normalizeSubscription } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initial = getSession();
  const [user, setUser] = useState(initial.user);
  const [token, setToken] = useState(initial.token);
  const [subscription, setSubscription] = useState(() => normalizeSubscription(null));
  const [authReady, setAuthReady] = useState(false);

  const refreshSubscription = useCallback(async (uid) => {
    const targetId = uid ?? getSession().user?.userId;
    if (!targetId || !getSession().token) {
      setSubscription(normalizeSubscription(null));
      return null;
    }
    try {
      const sub = await api.getSubscription(targetId);
      setSubscription(sub);
      return sub;
    } catch {
      return null;
    }
  }, []);

  const syncSession = useCallback(async () => {
    const sess = getSession();
    if (!sess.token) {
      setUser(null);
      setToken(null);
      setSubscription(normalizeSubscription(null));
      setAuthReady(true);
      return;
    }
    try {
      const me = await api.fetchMe();
      setUser(me);
      setToken(sess.token);
      await refreshSubscription(me.userId);
    } catch (err) {
      if (err.status === 401) {
        clearSession();
        setUser(null);
        setToken(null);
        setSubscription(normalizeSubscription(null));
      }
    } finally {
      setAuthReady(true);
    }
  }, [refreshSubscription]);

  useEffect(() => {
    syncSession();
    const onStorage = (e) => {
      if (e.key === 'sukabaca_session') {
        syncSession();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [syncSession]);

  const login = useCallback(async (credentials) => {
    const result = await api.login(credentials);
    setUser(result.user);
    setToken(result.token);
    await refreshSubscription(result.user.userId);
    return result.user;
  }, [refreshSubscription]);

  const register = useCallback(async (payload) => {
    return api.register(payload);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
    setSubscription(normalizeSubscription(null));
  }, []);

  const upgradeToPro = useCallback(async () => {
    const sub = await api.checkoutSubscription('pro');
    setSubscription(sub);
    return sub;
  }, []);

  const cancelPro = useCallback(async () => {
    if (!subscription?.subscriptionId) return null;
    const sub = await api.cancelSubscription(subscription.subscriptionId);
    setSubscription(sub);
    return sub;
  }, [subscription]);

  const updateRemainingUsage = useCallback((remainingUsage) => {
    if (remainingUsage == null) return;
    setSubscription((prev) => ({
      ...prev,
      usage: prev.isPro || remainingUsage < 0 ? -1 : Math.max(0, Number(remainingUsage))
    }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        authReady,
        subscription,
        login,
        register,
        logout,
        refreshSubscription,
        upgradeToPro,
        cancelPro,
        updateRemainingUsage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
