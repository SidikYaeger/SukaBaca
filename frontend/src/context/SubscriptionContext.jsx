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
    dailyQuota: 10,
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

  const upgradePlan = async (planName = 'pro') => {
    const result = await subscriptionService.upgrade(planName);
    if (!result?.checkoutUrl) {
      setSubscription(result);
    }
    return result;
  };

  const confirmCheckout = useCallback(async (sessionId) => {
    const updated = await subscriptionService.confirmCheckout(sessionId);
    setSubscription(updated);
    return updated;
  }, []);

  const cancelPlan = async () => {
    if (!subscription.subscriptionId) {
      const updated = await subscriptionService.createCheckoutSession('free');
      const normalized = await subscriptionService.getCurrentSubscription();
      setSubscription(normalized);
      return updated;
    }
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
        confirmCheckout,
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
