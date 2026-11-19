const SESSION_KEY = 'sukabaca_session';

export const AI_MODELS = {
  BASIC: 'Basic SukaBaca AI',
  PRO: 'Pro SukaBaca AI'
};

export const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'doc', 'txt'];
export const MAX_FILE_BYTES = 8 * 1024 * 1024;

export const CATEGORIES = [
  'Teknologi Informasi',
  'Artificial Intelligence',
  'Pendidikan & Metodologi',
  'Arsitektur & Energi',
  'Hukum & Kebijakan',
  'Kesehatan',
  'Ekonomi & Bisnis',
  'Sains & Matematika',
  'Umum'
];

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw);
    if (parsed && parsed.token && parsed.user) {
      return parsed;
    }
  } catch {
    // ignore corrupted storage
  }
  return { token: null, user: null };
}

export function setSession(token, user) {
  const payload = { token, user };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    // storage disabled
  }
  return payload;
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export class ApiError extends Error {
  constructor(message, status, payload = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, options = {}) {
  const { method = 'GET', body, auth = true, signal } = options;
  const headers = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    const { token } = getSession();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Tidak dapat terhubung ke server SukaBaca. Pastikan backend berjalan di port 8080.', 0);
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Permintaan gagal (HTTP ${res.status})`;
    throw new ApiError(msg, res.status, data);
  }

  return data;
}

export function normalizeJournal(j) {
  if (!j) return null;
  return {
    id: Number(j.id),
    ownerId: j.ownerId != null ? Number(j.ownerId) : (j.user?.id != null ? Number(j.user.id) : null),
    ownerUsername: j.user?.username || null,
    ownerName: j.user?.name || j.user?.username || null,
    title: j.title || 'Tanpa Judul',
    author: j.author || j.user?.name || j.user?.username || 'Anonim',
    snippet: j.snippet || (j.abstractText ? j.abstractText.slice(0, 160) : ''),
    abstractText: j.abstractText || j.content || '',
    content: j.content || j.abstractText || '',
    publishDate: j.publishDate || '—',
    category: j.category || 'Umum',
    fileName: j.fileName || null,
    formatFile: (j.formatFile || 'PDF').toUpperCase(),
    views: Number(j.views) || 0,
    download: Number(j.download) || 0,
    createdAt: j.createdAt || null,
    averageRating: Number(j.averageRating) || 0,
    reviewCount: Number(j.reviewCount) || 0,
    isSaved: Boolean(j.isSaved),
    savedAt: j.savedAt || null
  };
}

export function normalizeSubscription(data) {
  if (!data) {
    return {
      subscriptionId: null,
      plan: 'free',
      planLabel: 'Gratis',
      status: 'none',
      isPro: false,
      usage: 0,
      dailyLimit: 10,
      currentPeriodEnd: null
    };
  }
  const plan = String(data.plan || 'free').toLowerCase();
  const status = String(data.status || 'active').toLowerCase();
  const isPro = plan === 'pro' && status === 'active';
  const rawUsage = data.usage != null ? Number(data.usage) : (data.remainingUsage != null ? Number(data.remainingUsage) : (isPro ? -1 : 10));
  return {
    subscriptionId: data.subscriptionId != null ? Number(data.subscriptionId) : null,
    plan,
    planLabel: isPro ? 'Pro Akademik' : 'Gratis',
    status,
    isPro,
    usage: isPro ? -1 : Math.max(0, rawUsage),
    dailyLimit: isPro ? -1 : 10,
    currentPeriodEnd: data.currentPeriodEnd || null
  };
}

export function normalizeReview(r, fallbackJournalId = null) {
  return {
    reviewId: Number(r.reviewId ?? r.id),
    journalId: Number(r.journal?.id ?? fallbackJournalId ?? 0),
    userId: r.user?.id != null ? Number(r.user.id) : null,
    authorName: r.user?.name || r.user?.username || 'Pembaca',
    authorUsername: r.user?.username || '',
    rating: Number(r.rating) || 0,
    komentar: r.komentar || '',
    tanggalReview: r.tanggalReview || null
  };
}

export function normalizeRingkasan(r) {
  if (!r) return null;
  return {
    ringkasanId: Number(r.ringkasanId),
    model: r.model || AI_MODELS.BASIC,
    isi: r.isi || '',
    formatFile: r.formatFile || 'TXT',
    tanggalDibuat: r.tanggalDibuat || null
  };
}

export const api = {
  checkHealth() {
    return request('/api/auth/health', { auth: false });
  },

  async register({ username, password, name }) {
    return request('/api/auth/register', {
      method: 'POST',
      auth: false,
      body: {
        username: username.trim(),
        password,
        name: name?.trim() || username.trim()
      }
    });
  },

  async login({ username, password }) {
    const data = await request('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: { username: username.trim(), password }
    });
    const user = {
      userId: Number(data.userId),
      username: data.username,
      name: data.name || data.username,
      role: data.role || 'user'
    };
    setSession(data.token, user);
    return { token: data.token, user };
  },

  async fetchMe() {
    const data = await request('/api/auth/me');
    return {
      userId: Number(data.userId),
      username: data.username,
      name: data.name || data.username,
      role: data.role || 'user'
    };
  },

  async getJournals({ search = '', userId = null } = {}) {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (userId != null) params.set('userId', String(userId));
    const qs = params.toString();
    const list = await request(`/api/journals${qs ? `?${qs}` : ''}`);
    return Array.isArray(list) ? list.map(normalizeJournal) : [];
  },

  async smartSearch(criteria = {}) {
    const clean = {};
    for (const [k, v] of Object.entries(criteria)) {
      if (v !== '' && v !== null && v !== undefined) {
        clean[k] = v;
      }
    }
    const data = await request('/api/journals/smart-search', {
      method: 'POST',
      body: clean
    });
    return {
      total: Number(data?.total) || 0,
      journals: Array.isArray(data?.journals) ? data.journals.map(normalizeJournal) : [],
      yearCounts: data?.yearCounts || {}
    };
  },

  async getJournal(id) {
    const data = await request(`/api/journals/${id}`);
    return normalizeJournal(data);
  },

  async uploadJournal(payload) {
    return request('/api/journals/upload', {
      method: 'POST',
      body: payload
    });
  },

  async updateJournal(id, payload) {
    const data = await request(`/api/journals/${id}`, {
      method: 'PUT',
      body: payload
    });
    return normalizeJournal(data);
  },

  async deleteJournal(id) {
    return request(`/api/journals/${id}`, { method: 'DELETE' });
  },

  async recordView(id) {
    return request(`/api/journals/${id}/view`, { method: 'POST' });
  },

  async recordDownload(id) {
    return request(`/api/journals/${id}/download`, { method: 'POST' });
  },

  getJournalFileUrl(id, download = false) {
    return `/api/journals/${id}/file${download ? '?download=true' : ''}`;
  },

  async startSummarize(id, model = AI_MODELS.BASIC) {
    return request(`/api/journals/${id}/summarize/start`, {
      method: 'POST',
      body: { model }
    });
  },

  async getSummarizeJob(jobId, signal) {
    return request(`/api/journals/summarize-jobs/${jobId}`, { signal });
  },

  async pollSummarizeJob(jobId, { onProgress, intervalMs = 1500, signal } = {}) {
    while (true) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      const job = await this.getSummarizeJob(jobId, signal);
      if (onProgress) onProgress(job);
      if (job.status === 'COMPLETED') {
        return {
          ...job,
          ringkasan: normalizeRingkasan(job.ringkasan)
        };
      }
      if (job.status === 'FAILED') {
        throw new ApiError(job.error || job.message || 'Gagal meringkas dokumen dengan AI', 502, job);
      }
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, intervalMs);
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
          }, { once: true });
        }
      });
    }
  },

  async getRingkasanList(id) {
    const list = await request(`/api/journals/${id}/ringkasan`, { auth: false });
    return Array.isArray(list) ? list.map(normalizeRingkasan) : [];
  },

  async getLatestRingkasan(id) {
    const list = await this.getRingkasanList(id);
    return list.length > 0 ? list[list.length - 1] : null;
  },

  getRingkasanPdfUrl(id, download = false) {
    return `/api/journals/${id}/ringkasan/pdf${download ? '?download=true' : ''}`;
  },

  async getHistory() {
    const list = await request('/api/journals/history');
    return Array.isArray(list)
      ? list.map((item) => ({
          historyId: Number(item.historyId),
          actionType: item.actionType,
          createdAt: item.createdAt,
          journal: normalizeJournal(item.journal)
        }))
      : [];
  },

  async getSavedJournals() {
    const list = await request('/api/journals/saved');
    return Array.isArray(list) ? list.map(normalizeJournal) : [];
  },

  async saveJournal(id) {
    return request(`/api/journals/${id}/save`, { method: 'POST' });
  },

  async unsaveJournal(id) {
    return request(`/api/journals/${id}/save`, { method: 'DELETE' });
  },

  async getReviews(journalId) {
    const data = await request(`/api/reviews/journal/${journalId}`, { auth: false });
    return {
      journalId: Number(data?.journalId ?? journalId),
      totalReviews: Number(data?.totalReviews) || 0,
      averageRating: Number(data?.averageRating) || 0,
      reviews: Array.isArray(data?.reviews)
        ? data.reviews.map((r) => normalizeReview(r, journalId))
        : []
    };
  },

  async addReview({ journalId, rating, komentar }) {
    return request('/api/reviews', {
      method: 'POST',
      body: {
        journalId: Number(journalId),
        rating: Number(rating),
        komentar: komentar.trim()
      }
    });
  },

  async deleteReview(reviewId) {
    return request(`/api/reviews/${reviewId}`, { method: 'DELETE' });
  },

  async getSubscription(userId) {
    const data = await request(`/api/subscriptions/user/${userId}`);
    return normalizeSubscription(data);
  },

  async checkoutSubscription(plan = 'pro') {
    const data = await request('/api/subscriptions/checkout', {
      method: 'POST',
      body: { plan }
    });
    return normalizeSubscription({ ...data, status: 'active' });
  },

  async cancelSubscription(subscriptionId) {
    const data = await request(`/api/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST'
    });
    return normalizeSubscription({ ...data, status: 'canceled' });
  }
};

export function getFileExtension(fileName) {
  if (!fileName || !fileName.includes('.')) return '';
  return fileName.split('.').pop().toLowerCase();
}

export function validateUploadFile(file) {
  if (!file) return null;
  const ext = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return 'Format berkas harus .pdf, .docx, .doc, atau .txt';
  }
  if (file.size === 0) {
    return 'Berkas tidak boleh kosong';
  }
  if (file.size > MAX_FILE_BYTES) {
    return 'Ukuran berkas melebihi batas maksimal 8 MB';
  }
  return null;
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas lokal'));
    reader.readAsDataURL(file);
  });
}

export function formatDateID(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatShortDateID(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function formatApaCitation(journal) {
  if (!journal) return '';
  const author = journal.author || 'Anonim';
  const year = journal.publishDate || 't.t.';
  const title = journal.title || 'Tanpa Judul';
  const cat = journal.category || 'Umum';
  return `${author} (${year}). ${title}. SukaBaca Repository — ${cat}.`;
}

export function formatBibtexCitation(journal) {
  if (!journal) return '';
  const slug = (journal.author || 'anonim').split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const year = /^\d{4}$/.test(String(journal.publishDate)) ? journal.publishDate : '2026';
  return `@article{${slug}${year}j${journal.id},
  author  = {${journal.author || 'Anonim'}},
  title   = {${journal.title || 'Tanpa Judul'}},
  year    = {${year}},
  journal = {SukaBaca — ${journal.category || 'Umum'}}
}`;
}

export function canManageJournal(journal, user) {
  if (!journal || !user) return false;
  return Number(journal.ownerId) === Number(user.userId) || String(user.role).toLowerCase() === 'admin';
}

export function canDeleteReview(review, user) {
  if (!review || !user) return false;
  return Number(review.userId) === Number(user.userId) || String(user.role).toLowerCase() === 'admin';
}

export const ACTION_LABELS_ID = {
  UPLOADED: 'Diunggah',
  VIEWED: 'Dibaca',
  DOWNLOADED: 'Diunduh',
  SUMMARIZED: 'Diringkas AI'
};
