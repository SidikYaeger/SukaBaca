/**
 * User Subscription & Quota Service
 */
import { API_ENDPOINTS } from '../config/api.config';
import { request } from './api.client';

export const normalizeSubscription = (sub) => {
  if (!sub) {
    return {
      plan: 'Free Access',
      rawPlan: 'free',
      status: 'active',
      dailyQuota: 10,
      usedToday: 0,
      periodEnd: null,
      subscriptionId: null
    };
  }

  const rawPlan = sub.rawPlan
    ? String(sub.rawPlan).toLowerCase()
    : ((sub.plan || '').toLowerCase().includes('pro') ? 'pro' : 'free');
  const isPro = rawPlan === 'pro' && (sub.status || 'active').toLowerCase() === 'active';

  return {
    plan: isPro ? 'Ultra Academic Pro' : 'Free Access',
    rawPlan: isPro ? 'pro' : 'free',
    status: sub.status || 'active',
    dailyQuota: sub.dailyQuota != null ? Number(sub.dailyQuota) : (isPro ? 9999 : 10),
    usedToday: Number(sub.usedToday) || 0,
    periodEnd: sub.periodEnd || sub.currentPeriodEnd || null,
    subscriptionId: sub.subscriptionId || sub.id || null
  };
};

export const subscriptionService = {
  async getCurrentSubscription() {
    try {
      const data = await request(API_ENDPOINTS.SUBSCRIPTION_CURRENT);
      return normalizeSubscription(data);
    } catch {
      return normalizeSubscription(null);
    }
  },

  async createCheckoutSession(plan = 'pro') {
    return request(API_ENDPOINTS.SUBSCRIPTION_CHECKOUT, {
      method: 'POST',
      body: JSON.stringify({ plan })
    });
  },

  async confirmCheckout(sessionId) {
    const data = await request(API_ENDPOINTS.SUBSCRIPTION_CHECKOUT_CONFIRM, {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
    return normalizeSubscription(data);
  },

  async upgrade(planName = 'pro') {
    const data = await this.createCheckoutSession(planName);
    if (data?.checkoutUrl) {
      return data;
    }
    return normalizeSubscription(data);
  },

  async cancel(subscriptionId) {
    const data = await request(API_ENDPOINTS.SUBSCRIPTION_CANCEL(subscriptionId), {
      method: 'POST'
    });
    return normalizeSubscription(data);
  }
};
