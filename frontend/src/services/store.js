const EMPTY_SUBSCRIPTION = {
  plan: 'Belum Aktif',
  status: 'none',
  dailyQuota: 0,
  usedToday: 0,
  periodEnd: null
};

const mapBackendJournal = (j) => ({
  id: j.id,
  title: j.title,
  snippet: j.snippet || (j.content ? j.content.slice(0, 120) + '...' : ''),
  content: j.content,
  abstract: j.abstractText || null,
  author: j.author || (j.user ? (j.user.name || j.user.username) : 'Anonim'),
  date: j.publishDate || (j.createdAt ? j.createdAt.split('T')[0] : '2026'),
  year: j.publishDate || '2026',
  formatFile: j.formatFile || 'PDF',
  views: Number(j.views) || 0,
  download: Number(j.download) || 0,
  category: j.category || 'Umum',
  fileName: j.fileName || null
});

export const store = {
  getAuth() {
    const raw = localStorage.getItem('sukabaca_auth');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return { isAuthenticated: false, user: null, profile: null };
      }
    }
    return { isAuthenticated: false, user: null, profile: null };
  },

  setAuth(user) {
    const usernameStr = typeof user === 'object' && user !== null ? (user.username || user.name || 'User') : (user || '');
    const data = { 
      isAuthenticated: !!usernameStr, 
      user: usernameStr, 
      profile: typeof user === 'object' ? user : null 
    };
    localStorage.setItem('sukabaca_auth', JSON.stringify(data));
    return data;
  },

  clearAuth() {
    localStorage.removeItem('sukabaca_auth');
    localStorage.removeItem('sukabaca_subscription');
  },

  async checkServerHealth() {
    try {
      const res = await fetch('/api/auth/health', { signal: AbortSignal.timeout(3000) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.database === 'CONNECTED') {
        return { connected: true, status: 'CONNECTED', totalUsers: data.totalUsers };
      }
      return { connected: false, status: 'DISCONNECTED', message: data.error || 'Database disconnected' };
    } catch (err) {
      try {
        const res2 = await fetch('http://localhost:8080/api/auth/health', { signal: AbortSignal.timeout(3000) });
        const data2 = await res2.json().catch(() => ({}));
        if (res2.ok && data2.database === 'CONNECTED') {
          return { connected: true, status: 'CONNECTED', totalUsers: data2.totalUsers };
        }
      } catch (e) {}
      return { connected: false, status: 'DISCONNECTED', message: 'Backend server offline' };
    }
  },

  async apiLogin(username, password) {
    const payload = { username: username.trim(), password };
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'success') {
        const userObj = {
          userId: data.userId || 1,
          username: data.username || username,
          name: data.name || username,
          role: data.role || 'user'
        };
        this.setAuth(userObj);
        return { success: true, user: userObj, username: userObj.username, data };
      } else if (res.status === 401 || res.status === 400) {
        return { success: false, message: data.message || 'Username atau password salah' };
      }
    } catch (err) {}

    try {
      const res2 = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data2 = await res2.json().catch(() => ({}));
      if (res2.ok && data2.status === 'success') {
        const userObj = {
          userId: data2.userId || 1,
          username: data2.username || username,
          name: data2.name || username,
          role: data2.role || 'user'
        };
        this.setAuth(userObj);
        return { success: true, user: userObj, username: userObj.username, data: data2 };
      } else {
        return { success: false, message: data2.message || 'Username atau password salah' };
      }
    } catch (err2) {
      return { 
        success: false, 
        message: 'Koneksi ke backend gagal. Pastikan backend Spring Boot sedang berjalan.' 
      };
    }
  },

  async apiRegister(username, password, name = '') {
    const payload = { 
      username: username.trim(), 
      password, 
      name: name ? name.trim() : username.trim(),
      role: 'user'
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'success') {
        return { success: true, message: data.message || 'Registrasi berhasil' };
      } else if (data.message) {
        return { success: false, message: data.message };
      }
    } catch (err) {}

    try {
      const res2 = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data2 = await res2.json().catch(() => ({}));
      if (res2.ok && data2.status === 'success') {
        return { success: true, message: data2.message || 'Registrasi berhasil' };
      } else {
        return { success: false, message: data2.message || 'Registrasi gagal' };
      }
    } catch (err2) {
      return { 
        success: false, 
        message: 'Koneksi ke backend gagal. Pastikan backend Spring Boot sedang berjalan.' 
      };
    }
  },

  async fetchJournals(search = '', userId = null) {
    try {
      const url = new URL('/api/journals', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (userId) url.searchParams.set('userId', userId);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        const mapped = Array.isArray(data) ? data.map(mapBackendJournal) : [];
        localStorage.setItem('sukabaca_journals', JSON.stringify(mapped));
        return mapped;
      }
    } catch (e) {}
    localStorage.removeItem('sukabaca_journals');
    return [];
  },

  getJournals() {
    const raw = localStorage.getItem('sukabaca_journals');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  },

  async fetchJournalById(id) {
    try {
      const res = await fetch(`/api/journals/${id}`);
      if (res.ok) {
        const j = await res.json();
        const mapped = mapBackendJournal(j);
        const currentList = this.getJournals();
        const index = currentList.findIndex(item => String(item.id) === String(id));
        if (index >= 0) {
          currentList[index] = { ...currentList[index], ...mapped };
        } else {
          currentList.unshift(mapped);
        }
        localStorage.setItem('sukabaca_journals', JSON.stringify(currentList));
        return mapped;
      }
    } catch (e) {}
    const filtered = this.getJournals().filter(item => String(item.id) !== String(id));
    localStorage.setItem('sukabaca_journals', JSON.stringify(filtered));
    return null;
  },

  getJournalById(id) {
    const list = this.getJournals();
    return list.find(j => String(j.id) === String(id)) || null;
  },

  async apiUploadJournal(journalData) {
    const auth = this.getAuth();
    const userId = journalData.userId || auth.profile?.userId || auth.profile?.id || 1;
    const payload = {
      title: journalData.title || 'Untitled Journal',
      author: journalData.author || auth.user || 'Anonim',
      abstract: journalData.abstract || '',
      content: journalData.content || journalData.abstract || '',
      category: journalData.category || 'Umum',
      publishDate: journalData.publishDate || new Date().getFullYear().toString(),
      formatFile: journalData.formatFile || 'PDF',
      fileName: journalData.fileName || undefined,
      fileBase64: journalData.fileBase64 || undefined,
      userId
    };

    const res = await fetch('/api/journals/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.journalId) {
      throw new Error(data.message || 'Gagal mengunggah jurnal ke database');
    }

    const snippetSource = payload.abstract || payload.content;
    const newJournal = {
      id: data.journalId,
      title: payload.title,
      author: payload.author,
      snippet: snippetSource.length > 160 ? snippetSource.slice(0, 160) + '...' : snippetSource,
      content: payload.content,
      abstract: payload.abstract || null,
      publishDate: payload.publishDate,
      year: payload.publishDate,
      date: new Date().toISOString().split('T')[0],
      formatFile: payload.fileName ? payload.fileName.split('.').pop().toUpperCase() : payload.formatFile,
      views: 0,
      download: 0,
      category: payload.category,
      fileName: payload.fileName || null
    };

    const list = this.getJournals();
    list.unshift(newJournal);
    localStorage.setItem('sukabaca_journals', JSON.stringify(list));

    return newJournal;
  },

  async apiSummarizeJournal(id, model = 'gemini-1.5-flash') {
    const journal = this.getJournalById(id);
    if (!journal) {
      throw new Error('Jurnal tidak ditemukan di database');
    }
    const source = (journal.abstract || journal.content || journal.snippet || '')
      .replace(/^abstrak:\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    const sentences = source.split(/(?<=[.!?])\s+/).filter(Boolean);
    const isi = `Ringkasan Eksekutif: ${sentences.slice(0, 3).join(' ')}`;

    const res = await fetch(`/api/journals/${id}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, isi })
    });
    if (!res.ok) {
      throw new Error('Gagal menyimpan ringkasan ke database');
    }
    const saved = await res.json();

    const result = {
      isi: saved.isi || isi,
      model: saved.model || model,
      tanggalDibuat: saved.tanggalDibuat || new Date().toISOString()
    };
    localStorage.setItem(`sukabaca_ringkasan_${id}`, JSON.stringify(result));
    return result;
  },

  async fetchRingkasan(id) {
    try {
      const res = await fetch(`/api/journals/${id}/ringkasan`);
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const latest = list[list.length - 1];
          const result = {
            isi: latest.isi,
            model: latest.model,
            tanggalDibuat: latest.tanggalDibuat
          };
          localStorage.setItem(`sukabaca_ringkasan_${id}`, JSON.stringify(result));
          return result;
        }
      }
    } catch (e) {}
    localStorage.removeItem(`sukabaca_ringkasan_${id}`);
    return null;
  },

  getJournalFileUrl(id, download = false) {
    return `/api/journals/${id}/file${download ? '?download=true' : ''}`;
  },

  addJournal(journal) {
    const auth = this.getAuth();
    const userId = journal.userId || auth.profile?.userId || auth.profile?.id || 1;
    return this.apiUploadJournal({ ...journal, userId });
  },

  async apiRecordView(id) {
    try {
      await fetch(`/api/journals/${id}/view`, { method: 'POST' });
    } catch (e) {}
    const list = this.getJournals();
    const target = list.find(j => String(j.id) === String(id));
    if (target) {
      target.views = (Number(target.views) || 0) + 1;
      localStorage.setItem('sukabaca_journals', JSON.stringify(list));
    }
  },

  incrementView(id) {
    this.apiRecordView(id);
  },

  async apiRecordDownload(id) {
    try {
      await fetch(`/api/journals/${id}/download`, { method: 'POST' });
    } catch (e) {}
    const list = this.getJournals();
    const target = list.find(j => String(j.id) === String(id));
    if (target) {
      target.download = (Number(target.download) || 0) + 1;
      localStorage.setItem('sukabaca_journals', JSON.stringify(list));
    }
  },

  incrementDownload(id) {
    this.apiRecordDownload(id);
  },

  async fetchReviews(journalId) {
    try {
      const res = await fetch(`/api/reviews/journal/${journalId}`);
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.reviews || []).map(r => ({
          id: r.reviewId || r.id,
          journalId: Number(journalId),
          userId: r.user?.id || 1,
          author: r.author || r.user?.name || r.user?.username || 'User',
          rating: Number(r.rating) || 5,
          komentar: r.komentar || '',
          createdAt: r.tanggalReview ? new Date(r.tanggalReview).toLocaleString('id-ID') : 'Baru saja'
        }));
        const allCached = this.getReviews();
        const rest = allCached.filter(r => String(r.journalId) !== String(journalId));
        localStorage.setItem('sukabaca_reviews', JSON.stringify([...mapped, ...rest]));
        return {
          totalReviews: data.totalReviews || 0,
          averageRating: data.averageRating || 0,
          reviews: mapped
        };
      }
    } catch (e) {}

    return {
      totalReviews: 0,
      averageRating: 0,
      reviews: []
    };
  },

  getReviews(journalId) {
    const raw = localStorage.getItem('sukabaca_reviews');
    let list = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          list = parsed;
        }
      } catch (e) {}
    }
    if (journalId) {
      return list.filter(r => String(r.journalId) === String(journalId));
    }
    return list;
  },

  async apiAddReview(review) {
    const auth = this.getAuth();
    const userId = review.userId || auth.profile?.userId || auth.profile?.id;
    if (!userId) {
      throw new Error('Silakan login terlebih dahulu untuk mengirim ulasan');
    }
    const payload = {
      userId,
      journalId: Number(review.journalId),
      rating: Number(review.rating) || 5,
      komentar: review.komentar || ''
    };

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.reviewId) {
      throw new Error(data.message || 'Gagal menyimpan ulasan ke database');
    }

    const newRev = {
      id: data.reviewId,
      journalId: payload.journalId,
      userId,
      author: review.author || auth.user || 'User',
      rating: payload.rating,
      komentar: payload.komentar,
      createdAt: new Date().toLocaleString('id-ID')
    };

    const list = this.getReviews();
    list.unshift(newRev);
    localStorage.setItem('sukabaca_reviews', JSON.stringify(list));
    return newRev;
  },

  addReview(review) {
    return this.apiAddReview(review);
  },

  getAverageRating(journalId) {
    const reviews = this.getReviews(journalId);
    if (!reviews || reviews.length === 0) return { avg: 0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    return {
      avg: Number((sum / reviews.length).toFixed(1)),
      count: reviews.length
    };
  },

  async fetchSubscription(userId = null) {
    const auth = this.getAuth();
    const uid = userId || auth.profile?.userId || auth.profile?.id;
    if (!uid) {
      localStorage.removeItem('sukabaca_subscription');
      return { ...EMPTY_SUBSCRIPTION };
    }
    try {
      const res = await fetch(`/api/subscriptions/user/${uid}`);
      if (res.ok) {
        const data = await res.json();
        const isPro = String(data.plan).toLowerCase() === 'pro';
        const subObj = {
          subscriptionId: data.subscriptionId,
          plan: isPro ? 'Ultra Academic Pro' : 'Free Academic',
          status: data.status || 'active',
          dailyQuota: isPro ? 999 : 10,
          usedToday: isPro ? 0 : Math.max(0, 10 - (data.usage != null ? data.usage : 10)),
          periodEnd: data.currentPeriodEnd ? data.currentPeriodEnd.split('T')[0] : null
        };
        localStorage.setItem('sukabaca_subscription', JSON.stringify(subObj));
        return subObj;
      }
    } catch (e) {}
    localStorage.removeItem('sukabaca_subscription');
    return { ...EMPTY_SUBSCRIPTION };
  },

  getSubscription() {
    const raw = localStorage.getItem('sukabaca_subscription');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return { ...EMPTY_SUBSCRIPTION };
  },

  async useAiQuota() {
    const auth = this.getAuth();
    const uid = auth.profile?.userId || auth.profile?.id;
    if (!uid) {
      return { success: false, remaining: 0 };
    }
    try {
      const res = await fetch(`/api/subscriptions/user/${uid}/use-ai`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const sub = this.getSubscription();
        const isPro = sub.dailyQuota >= 999 || Number(data.remainingUsage) < 0;
        const remaining = isPro ? 999 : Math.max(0, Number(data.remainingUsage) || 0);
        const updated = {
          ...sub,
          dailyQuota: isPro ? 999 : 10,
          usedToday: isPro ? 0 : Math.max(0, 10 - remaining)
        };
        localStorage.setItem('sukabaca_subscription', JSON.stringify(updated));
        return { success: true, remaining };
      }
    } catch (e) {}
    return { success: false, remaining: 0 };
  },

  async upgradeSubscription(planName = 'Ultra Academic Pro') {
    const auth = this.getAuth();
    const uid = auth.profile?.userId || auth.profile?.id;
    if (!uid) {
      throw new Error('Silakan login terlebih dahulu');
    }
    const res = await fetch('/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid, plan: 'pro' })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Gagal memperbarui langganan');
    }

    const sub = {
      subscriptionId: data.subscriptionId,
      plan: planName,
      status: 'active',
      dailyQuota: 999,
      usedToday: 0,
      periodEnd: data.currentPeriodEnd ? data.currentPeriodEnd.split('T')[0] : null
    };
    localStorage.setItem('sukabaca_subscription', JSON.stringify(sub));
    return sub;
  }
};
