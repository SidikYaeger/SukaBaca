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
      dailyQuota: 5,
      usedToday: 0,
      periodEnd: null,
      subscriptionId: null
    };
  }

  return {
    plan: sub.plan || 'Free Access',
    rawPlan: (sub.plan || '').toLowerCase().includes('pro') ? 'pro' : 'free',
    status: sub.status || 'active',
    dailyQuota: sub.dailyQuota != null ? Number(sub.dailyQuota) : 5,
    usedToday: Number(sub.usedToday) || 0,
    periodEnd: sub.periodEnd || null,
    subscriptionId: sub.id || null
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

  async upgrade(planName = 'Ultra Academic Pro') {
    const data = await request(API_ENDPOINTS.SUBSCRIPTION_UPGRADE, {
      method: 'POST',
      body: JSON.stringify({ plan: planName })
    });
    return normalizeSubscription(data);
  },

  async cancel(subscriptionId) {
    const data = await request(API_ENDPOINTS.SUBSCRIPTION_CANCEL(subscriptionId), {
      method: 'POST'
    });
    return normalizeSubscription(data);
  }
};
