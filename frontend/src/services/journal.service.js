/**
 * Journal & Academic Discovery Service
 */
import { API_ENDPOINTS } from '../config/api.config';
import { request } from './api.client';

export const normalizeJournal = (j) => ({
  id: j.id,
  ownerId: j.ownerId != null ? j.ownerId : (j.user ? j.user.id : null),
  title: j.title || 'Untitled Publication',
  snippet: j.snippet || (j.content ? j.content.slice(0, 160) + '...' : ''),
  content: j.content || '',
  abstract: j.abstractText || null,
  author: j.author || (j.user ? (j.user.name || j.user.username) : 'Anonim'),
  date: j.publishDate || (j.createdAt ? j.createdAt.split('T')[0] : '2026'),
  year: j.publishDate ? String(j.publishDate).slice(0, 4) : '2026',
  formatFile: (j.formatFile || 'PDF').toUpperCase(),
  views: Number(j.views) || 0,
  download: Number(j.download) || 0,
  category: j.category || 'Umum',
  fileName: j.fileName || null,
  rating: Number(j.averageRating) || 0,
  reviewCount: Number(j.reviewCount) || 0,
  isSaved: Boolean(j.isSaved)
});

export const journalService = {
  async getAllJournals() {
    const data = await request(API_ENDPOINTS.JOURNALS);
    return Array.isArray(data) ? data.map(normalizeJournal) : [];
  },

  async getJournalById(id) {
    const data = await request(API_ENDPOINTS.JOURNAL_BY_ID(id));
    return data ? normalizeJournal(data) : null;
  },

  async smartSearch(criteria) {
    const data = await request(API_ENDPOINTS.JOURNAL_SMART_SEARCH, {
      method: 'POST',
      body: JSON.stringify(criteria)
    });
    return {
      journals: Array.isArray(data.journals) ? data.journals.map(normalizeJournal) : [],
      yearCounts: data.yearCounts || {}
    };
  },

  async uploadJournal({ title, author, year, category, formatFile, content, file }) {
    const formData = new FormData();
    formData.append('title', title);
    if (author) formData.append('author', author);
    if (year) formData.append('publishDate', String(year));
    if (category) formData.append('category', category);
    if (formatFile) formData.append('formatFile', formatFile);
    if (content) formData.append('content', content);
    if (file) formData.append('file', file);

    const data = await request(API_ENDPOINTS.JOURNAL_UPLOAD, {
      method: 'POST',
      body: formData
    });
    return normalizeJournal(data);
  },

  async downloadJournal(id, fileName = 'journal.pdf') {
    const blob = await request(API_ENDPOINTS.JOURNAL_DOWNLOAD(id));
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },

  getViewerUrl(id) {
    return API_ENDPOINTS.JOURNAL_FILE(id);
  },

  async getAiSummary(id) {
    try {
      const data = await request(API_ENDPOINTS.JOURNAL_SUMMARY(id));
      return data;
    } catch {
      return null;
    }
  },

  async downloadSummaryPdf(id, title = 'ringkasan') {
    const blob = await request(API_ENDPOINTS.JOURNAL_SUMMARY_PDF(id));
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ringkasan_${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },

  async toggleBookmark(id) {
    return await request(API_ENDPOINTS.BOOKMARK_JOURNAL(id), {
      method: 'POST'
    });
  },

  async getUserHistory() {
    const data = await request(API_ENDPOINTS.USER_HISTORY);
    return Array.isArray(data) ? data.map(normalizeJournal) : [];
  },

  async getUserBookmarks() {
    const data = await request(API_ENDPOINTS.USER_BOOKMARKS);
    return Array.isArray(data) ? data.map(normalizeJournal) : [];
  }
};
