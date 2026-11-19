/**
 * Journal Reviews & Ratings Service
 */
import { API_ENDPOINTS } from '../config/api.config';
import { request } from './api.client';

export const reviewService = {
  async getReviewsByJournal(journalId) {
    try {
      const data = await request(API_ENDPOINTS.REVIEWS_BY_JOURNAL(journalId));
      return {
        reviews: Array.isArray(data.reviews) ? data.reviews : [],
        averageRating: Number(data.averageRating) || 0,
        totalReviews: Number(data.totalReviews) || 0,
      };
    } catch {
      return { reviews: [], averageRating: 0, totalReviews: 0 };
    }
  },

  async addReview({ journalId, author, rating, komentar }) {
    return await request(API_ENDPOINTS.REVIEWS, {
      method: 'POST',
      body: JSON.stringify({
        journalId: Number(journalId),
        author,
        rating: Number(rating),
        komentar
      })
    });
  },

  async deleteReview(reviewId) {
    return await request(API_ENDPOINTS.REVIEW_BY_ID(reviewId), {
      method: 'DELETE'
    });
  }
};
