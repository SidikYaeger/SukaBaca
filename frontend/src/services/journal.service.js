/**
 * Journal & Academic Discovery Service
 */
import { API_ENDPOINTS } from '../config/api.config';
import { request } from './api.client';

export const normalizeJournal = (j) => ({
  id: j.id ?? j.journalId,
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
    await request(API_ENDPOINTS.JOURNAL_DOWNLOAD(id), { method: 'POST' }).catch(() => {});
    const raw = await request(`${API_ENDPOINTS.JOURNAL_FILE(id)}?download=true`);
    const blob = raw instanceof Blob ? raw : new Blob([raw]);
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
      if (Array.isArray(data) && data.length > 0) {
        const latest = data[data.length - 1];
        return { ...latest, content: latest.isi || latest.content || '' };
      }
      if (data && typeof data === 'object') {
        return { ...data, content: data.isi || data.content || '' };
      }
      return null;
    } catch {
      return null;
    }
  },

  async generateAiSummary(id, model) {
    const data = await request(API_ENDPOINTS.JOURNAL_SUMMARY_SYNC(id), {
      method: 'POST',
      body: JSON.stringify(model ? { model } : {})
    });
    return { ...data, content: data?.isi || data?.content || '' };
  },

  async downloadSummaryPdf(id, title = 'ringkasan') {
    const raw = await request(API_ENDPOINTS.JOURNAL_SUMMARY_PDF(id));
    const blob = raw instanceof Blob ? raw : new Blob([raw], { type: 'application/pdf' });
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

  async toggleBookmark(id, currentlySaved = false) {
    return await request(API_ENDPOINTS.BOOKMARK_JOURNAL(id), {
      method: currentlySaved ? 'DELETE' : 'POST'
    });
  },

  async getUserHistory() {
    const data = await request(API_ENDPOINTS.USER_HISTORY);
    if (!Array.isArray(data)) return [];
    return data.map((entry) => normalizeJournal(entry.journal || entry));
  },

  async getUserBookmarks() {
    const data = await request(API_ENDPOINTS.USER_BOOKMARKS);
    return Array.isArray(data) ? data.map(normalizeJournal) : [];
  }
};
