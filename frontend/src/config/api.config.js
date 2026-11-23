/**
 * Centralized API Configuration & Endpoints
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  AUTH_ME: `${API_BASE_URL}/auth/me`,

  // Journals & Search
  JOURNALS: `${API_BASE_URL}/journals`,
  JOURNAL_BY_ID: (id) => `${API_BASE_URL}/journals/${id}`,
  JOURNAL_SEARCH: `${API_BASE_URL}/journals/search`,
  JOURNAL_SMART_SEARCH: `${API_BASE_URL}/journals/smart-search`,
  JOURNAL_UPLOAD: `${API_BASE_URL}/journals/upload`,
  JOURNAL_DOWNLOAD: (id) => `${API_BASE_URL}/journals/${id}/download`,
  JOURNAL_FILE: (id) => `${API_BASE_URL}/journals/${id}/file`,

  // AI Summaries
  JOURNAL_SUMMARY: (id) => `${API_BASE_URL}/journals/${id}/summary`,
  JOURNAL_SUMMARY_PDF: (id) => `${API_BASE_URL}/journals/${id}/summary/pdf`,

  // Reviews
  REVIEWS: `${API_BASE_URL}/reviews`,
  REVIEWS_BY_JOURNAL: (journalId) => `${API_BASE_URL}/reviews/journal/${journalId}`,
  REVIEW_BY_ID: (id) => `${API_BASE_URL}/reviews/${id}`,

  // Subscriptions
  SUBSCRIPTIONS: `${API_BASE_URL}/subscriptions`,
  SUBSCRIPTION_CURRENT: `${API_BASE_URL}/subscriptions/current`,
  SUBSCRIPTION_UPGRADE: `${API_BASE_URL}/subscriptions/upgrade`,
  SUBSCRIPTION_CANCEL: (id) => `${API_BASE_URL}/subscriptions/${id}/cancel`,

  // History & Bookmarks
  USER_HISTORY: `${API_BASE_URL}/journals/user/history`,
  USER_BOOKMARKS: `${API_BASE_URL}/journals/user/bookmarks`,
  BOOKMARK_JOURNAL: (id) => `${API_BASE_URL}/journals/${id}/bookmark`,
};
