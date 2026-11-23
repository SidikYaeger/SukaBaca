import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '../services/subscription.service';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState({
    plan: 'Free Access',
    rawPlan: 'free',
    status: 'active',
    dailyQuota: 5,
    usedToday: 0,
    periodEnd: null,
    subscriptionId: null
  });
  const [loading, setLoading] = useState(false);

  const refreshSubscription = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const sub = await subscriptionService.getCurrentSubscription();
      setSubscription(sub);
    } catch {
      // Keep defaults
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  const upgradePlan = async (planName = 'Ultra Academic Pro') => {
    const updated = await subscriptionService.upgrade(planName);
    setSubscription(updated);
    return updated;
  };

  const cancelPlan = async () => {
    if (!subscription.subscriptionId) return;
    const updated = await subscriptionService.cancel(subscription.subscriptionId);
    setSubscription(updated);
    return updated;
  };

  const remainingQuota = Math.max(0, subscription.dailyQuota - subscription.usedToday);
  const isPro = subscription.rawPlan === 'pro' || subscription.dailyQuota >= 999;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        isPro,
        remainingQuota,
        refreshSubscription,
        upgradePlan,
        cancelPlan,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
