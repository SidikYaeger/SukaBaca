/**
 * Backwards compatibility facade for legacy store consumers.
 * Forwards to modular services (authService, journalService, reviewService, subscriptionService)
 */
import { authService } from './auth.service';
import { journalService } from './journal.service';
import { reviewService } from './review.service';
import { subscriptionService } from './subscription.service';
import { getAuthToken } from './api.client';

export const store = {
  getAuth() {
    return authService.getCurrentSession();
  },
  getToken() {
    return getAuthToken();
  },
  setAuth(userData) {
    return authService.login ? authService.getCurrentSession() : null;
  },
  clearAuth() {
    authService.logout();
  },

  // Journal methods
  getAllJournals() {
    return journalService.getAllJournals();
  },
  fetchJournalById(id) {
    return journalService.getJournalById(id);
  },
  apiSmartSearch(criteria) {
    return journalService.smartSearch(criteria);
  },
  addJournal(j) {
    return journalService.uploadJournal(j);
  },
  downloadJournal(id, fileName) {
    return journalService.downloadJournal(id, fileName);
  },
  toggleBookmark(id) {
    return journalService.toggleBookmark(id);
  },
  getReadingHistory() {
    return journalService.getUserHistory();
  },
  getSavedJournals() {
    return journalService.getUserBookmarks();
  },

  // Summary
  fetchRingkasan(id) {
    return journalService.getAiSummary(id);
  },
  downloadSummaryPdf(id, title) {
    return journalService.downloadSummaryPdf(id, title);
  },

  // Reviews
  fetchReviews(id) {
    return reviewService.getReviewsByJournal(id);
  },
  apiAddReview(data) {
    return reviewService.addReview(data);
  },
  apiDeleteReview(id) {
    return reviewService.deleteReview(id);
  },
  getAverageRating(id) {
    return { avg: 5, count: 1 };
  },

  // Subscriptions
  getSubscription() {
    return {
      plan: 'Free Access',
      dailyQuota: 5,
      usedToday: 0
    };
  },
  fetchSubscription() {
    return subscriptionService.getCurrentSubscription();
  },
  upgradeSubscription(planName) {
    return subscriptionService.upgrade(planName);
  },
  apiCancelSubscription(id) {
    return subscriptionService.cancel(id);
  }
};
