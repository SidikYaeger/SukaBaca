const INITIAL_JOURNALS = [
  {
    id: 1,
    title: 'Fundamental to Sahrul: Studi Analisis Pola Pikir & Metodologi',
    snippet: 'Studi komparasi metode refleksi terstruktur terhadap optimasi performa akademik dan manajemen waktu mahasiswa.',
    content: 'Artikel ini mengkaji fondasi analitis dalam pengembangan kebiasaan berpikir kritis mahasiswa. Berdasarkan eksperimen terstruktur, refleksi harian terbukti meningkatkan produktivitas belajar sebesar 34%. Metodologi yang diusung menggabungkan pencatatan jurnal periodik dengan evaluasi berkala.',
    author: 'Adira Pratama',
    date: '2025-12-15',
    year: '2025',
    formatFile: 'PDF',
    views: 142,
    download: 38,
    category: 'Pendidikan & Metodologi'
  },
  {
    id: 2,
    title: 'Sustainable Architecture: Inovasi Material Ramah Lingkungan 2026',
    snippet: 'Pemanfaatan komposit limbah biomassa sebagai substitusi beton insulasi termal pada bangunan urban kontemporer.',
    content: 'Penelitian ini menganalisis efektivitas komposit geopolimer berbasis abu terbang dan serat sabut kelapa. Hasil uji mekanik menunjukkan kekuatan tekan mencapai 28 MPa dengan konduktivitas termal 40% lebih rendah dibanding bata konvensional.',
    author: 'Glen Ardianto',
    date: '2026-01-10',
    year: '2026',
    formatFile: 'PDF',
    views: 310,
    download: 95,
    category: 'Arsitektur & Energi'
  },
  {
    id: 3,
    title: 'Evaluasi Implementasi Microservices dengan Spring Boot & Kubernetes',
    snippet: 'Analisis latensi layanan dan reliabilitas failover pada arsitektur terdistribusi berbasis REST API skala enterprise.',
    content: 'Transisi monolitik ke microservices membutuhkan strategi observabilitas yang presisi. Makalah ini membandingkan service mesh Istio terhadap native Spring Cloud Gateway dalam mitigasi cascade failures.',
    author: 'Siti Rahma',
    date: '2025-11-20',
    year: '2025',
    formatFile: 'DOCX',
    views: 89,
    download: 24,
    category: 'Teknologi Informasi'
  },
  {
    id: 4,
    title: 'Machine Learning untuk Peringkasan Otomatis Dokumen Akademik',
    snippet: 'Penerapan pendekatan hybrid extractive-abstractive menggunakan arsitektur transformer ringan untuk dokumen bahasa Indonesia.',
    content: 'Peringkasan dokumen ilmiah memerlukan pemahaman kontekstual terhadap terminologi teknis. Model hybrid kami menghasilkan skor ROUGE-1 sebesar 48.6 pada dataset jurnal akademik nasional.',
    author: 'Bagas Wicaksono',
    date: '2024-09-05',
    year: '2024',
    formatFile: 'PDF',
    views: 520,
    download: 162,
    rating: 4.7,
    category: 'Artificial Intelligence'
  },
  {
    id: 5,
    title: 'PEDOMAN INVESTASI',
    snippet: 'Pedoman tata kelola alokasi modal dan mitigasi risiko portofolio korporasi berbasis standar kepatuhan industri.',
    content: 'Pedoman ini mengatur tata cara analisis kelayakan investasi, batas kewenangan persetujuan, dan pengawasan implementasi anggaran belanja modal.',
    author: 'Bidang Investasi & Umum',
    date: '2024-03-12',
    year: '2024',
    formatFile: 'PDF',
    views: 245,
    download: 82,
    rating: 4.8,
    category: 'Bidang Investasi & Umum'
  },
  {
    id: 6,
    title: 'PEDOMAN KEARSIPAN',
    snippet: 'Standar operasional prosedur pengelolaan arsip dinamis dan statis terintegrasi sistem digital.',
    content: 'Instruksi kerja mengenai retensi dokumen, pengelompokan tingkat kerahasiaan, dan alur digitalisasi dokumen penting korporat.',
    author: 'PT PUPUK SRIWIDJAJA PALEMBANG',
    date: '2025-01-18',
    year: '2025',
    formatFile: 'PDF',
    views: 180,
    download: 64,
    rating: 4.5,
    category: 'PT PUPUK SRIWIDJAJA PALEMBANG'
  },
  {
    id: 7,
    title: 'PEDOMAN KODE ETIKA & PERILAKU KERJA',
    snippet: 'Prinsip Good Corporate Governance dan kepatuhan integritas insan perusahaan di lingkungan kerja.',
    content: 'Panduan norma perilaku, pencegahan benturan kepentingan, serta mekanisme pelaporan pelanggaran (whistleblowing system).',
    author: 'PT PUPUK SRIWIDJAJA PALEMBANG',
    date: '2025-06-20',
    year: '2025',
    formatFile: 'PDF',
    views: 310,
    download: 112,
    rating: 4.9,
    category: 'PT PUPUK SRIWIDJAJA PALEMBANG'
  },
  {
    id: 8,
    title: 'PEDOMAN ORGANISASI & TATA KERJA',
    snippet: 'Struktur fungsional, pembagian wewenang, dan matriks pertanggungjawaban unit operasional.',
    content: 'Kerangka acuan pembagian tugas pokok dan fungsi (tupoksi), koordinasi lintas divisi, dan indikator kinerja utama.',
    author: 'PT PUPUK SRIWIDJAJA PALEMBANG',
    date: '2023-08-14',
    year: '2023',
    formatFile: 'PDF',
    views: 195,
    download: 50,
    rating: 4.2,
    category: 'PT PUPUK SRIWIDJAJA PALEMBANG'
  },
  {
    id: 9,
    title: 'PEDOMAN PELAYANAN KEPESERTAAN',
    snippet: 'Standar mutu pelayanan dan alur administrasi kepesertaan jaminan serta fasilitas karyawan.',
    content: 'Ketentuan layanan terpadu, verifikasi data kepesertaan, dan service level agreement penanganan keluhan.',
    author: 'PT PUPUK SRIWIDJAJA PALEMBANG',
    date: '2024-11-02',
    year: '2024',
    formatFile: 'PDF',
    views: 140,
    download: 43,
    rating: 4.6,
    category: 'PT PUPUK SRIWIDJAJA PALEMBANG'
  }
];

const INITIAL_REVIEWS = [
  {
    id: 1,
    journalId: 1,
    userId: 1,
    author: 'Babas',
    rating: 5,
    komentar: 'Sangat bermanfaat! Ringkasannya padat dan membantu saya memahami inti metodologi hanya dalam 3 menit.',
    createdAt: '2026-02-14 10:30'
  },
  {
    id: 2,
    journalId: 1,
    userId: 2,
    author: 'Zulfa',
    rating: 4,
    komentar: 'Penyajian datanya runut dan jelas. Bagus sekali untuk referensi penulisan skripsi.',
    createdAt: '2026-02-18 14:15'
  }
];

const INITIAL_SUBSCRIPTION = {
  plan: 'Pro Plan',
  status: 'active',
  dailyQuota: 10,
  usedToday: 2,
  periodEnd: '2026-12-31'
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
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapBackendJournal);
          localStorage.setItem('sukabaca_journals', JSON.stringify(mapped));
          return mapped;
        }
      }
    } catch (e) {}
    return this.getJournals();
  },

  getJournals() {
    const raw = localStorage.getItem('sukabaca_journals');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    localStorage.setItem('sukabaca_journals', JSON.stringify(INITIAL_JOURNALS));
    return INITIAL_JOURNALS;
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
    return this.getJournalById(id);
  },

  getJournalById(id) {
    const list = this.getJournals();
    return list.find(j => String(j.id) === String(id)) || list[0];
  },

  async apiUploadJournal(journalData) {
    const auth = this.getAuth();
    const userId = journalData.userId || auth.profile?.userId || auth.profile?.id || 1;
    const payload = {
      title: journalData.title || 'Untitled Journal',
      author: journalData.author || auth.user || 'Adira',
      abstract: journalData.abstract || '',
      content: journalData.content || journalData.abstract || 'Konten jurnal...',
      category: journalData.category || 'Umum',
      publishDate: journalData.publishDate || new Date().getFullYear().toString(),
      formatFile: journalData.formatFile || 'PDF',
      fileName: journalData.fileName || undefined,
      fileBase64: journalData.fileBase64 || undefined,
      userId
    };

    let backendId = null;
    let failure = null;
    try {
      const res = await fetch('/api/journals/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        backendId = data.journalId;
      } else {
        const err = await res.json().catch(() => ({}));
        failure = err.message || 'Gagal mengunggah jurnal';
      }
    } catch (e) {}
    if (failure) {
      throw new Error(failure);
    }

    const newId = backendId || Date.now();
    const snippetSource = payload.abstract || payload.content;
    const newJournal = {
      id: newId,
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
      fileName: backendId ? (payload.fileName || null) : null
    };

    const list = this.getJournals();
    list.unshift(newJournal);
    localStorage.setItem('sukabaca_journals', JSON.stringify(list));

    return newJournal;
  },

  async apiSummarizeJournal(id, model = 'gemini-1.5-flash') {
    const journal = this.getJournalById(id);
    const source = (journal.abstract || journal.content || journal.snippet || '')
      .replace(/^abstrak:\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    const sentences = source.split(/(?<=[.!?])\s+/).filter(Boolean);
    const isi = `Ringkasan Eksekutif: ${sentences.slice(0, 3).join(' ')}`;

    let saved = null;
    try {
      const res = await fetch(`/api/journals/${id}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, isi })
      });
      if (res.ok) {
        saved = await res.json();
      }
    } catch (e) {}

    const result = {
      isi: saved?.isi || isi,
      model: saved?.model || model,
      tanggalDibuat: saved?.tanggalDibuat || new Date().toISOString()
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
    const raw = localStorage.getItem(`sukabaca_ringkasan_${id}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return null;
  },

  getJournalFileUrl(id, download = false) {
    return `/api/journals/${id}/file${download ? '?download=true' : ''}`;
  },

  addJournal(journal) {
    const auth = this.getAuth();
    const userId = journal.userId || auth.profile?.userId || auth.profile?.id || 1;
    this.apiUploadJournal({ ...journal, userId });
    const list = this.getJournals();
    const newJournal = {
      id: Date.now(),
      views: 1,
      download: 0,
      year: new Date().getFullYear().toString(),
      date: new Date().toISOString().split('T')[0],
      ...journal
    };
    list.unshift(newJournal);
    localStorage.setItem('sukabaca_journals', JSON.stringify(list));
    return newJournal;
  },

  async apiRecordView(id) {
    try {
      fetch(`/api/journals/${id}/view`, { method: 'POST' }).catch(() => {});
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
      fetch(`/api/journals/${id}/download`, { method: 'POST' }).catch(() => {});
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
          createdAt: r.tanggalReview ? new Date(r.tanggalReview).toLocaleString('id-ID') : (r.createdAt || 'Baru saja')
        }));
        const allCached = this.getReviews();
        const rest = allCached.filter(r => String(r.journalId) !== String(journalId));
        localStorage.setItem('sukabaca_reviews', JSON.stringify([...mapped, ...rest]));
        return {
          totalReviews: data.totalReviews || mapped.length,
          averageRating: data.averageRating || 5.0,
          reviews: mapped
        };
      }
    } catch (e) {}

    const localList = this.getReviews(journalId);
    return {
      totalReviews: localList.length,
      averageRating: this.getAverageRating(journalId).avg,
      reviews: localList
    };
  },

  getReviews(journalId) {
    const raw = localStorage.getItem('sukabaca_reviews');
    let list = INITIAL_REVIEWS;
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch (e) {}
    } else {
      localStorage.setItem('sukabaca_reviews', JSON.stringify(INITIAL_REVIEWS));
    }
    if (journalId) {
      return list.filter(r => String(r.journalId) === String(journalId));
    }
    return list;
  },

  async apiAddReview(review) {
    const auth = this.getAuth();
    const userId = review.userId || auth.profile?.userId || auth.profile?.id || 1;
    const payload = {
      userId,
      journalId: Number(review.journalId),
      rating: Number(review.rating) || 5,
      komentar: review.komentar || ''
    };

    let backendReviewId = null;
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        backendReviewId = data.reviewId;
      }
    } catch (e) {}

    const newRev = {
      id: backendReviewId || Date.now(),
      journalId: payload.journalId,
      userId,
      author: review.author || auth.user || 'User',
      rating: payload.rating,
      komentar: payload.komentar,
      createdAt: new Date().toLocaleString('id-ID')
    };

    const raw = localStorage.getItem('sukabaca_reviews');
    let list = INITIAL_REVIEWS;
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch (e) {}
    }
    list.unshift(newRev);
    localStorage.setItem('sukabaca_reviews', JSON.stringify(list));
    return newRev;
  },

  addReview(review) {
    return this.apiAddReview(review);
  },

  getAverageRating(journalId) {
    const reviews = this.getReviews(journalId);
    if (!reviews || reviews.length === 0) return { avg: 5.0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    return {
      avg: Number((sum / reviews.length).toFixed(1)),
      count: reviews.length
    };
  },

  async fetchSubscription(userId = null) {
    const auth = this.getAuth();
    const uid = userId || auth.profile?.userId || auth.profile?.id || 1;
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
          periodEnd: data.currentPeriodEnd ? data.currentPeriodEnd.split('T')[0] : '2026-12-31'
        };
        localStorage.setItem('sukabaca_subscription', JSON.stringify(subObj));
        return subObj;
      }
    } catch (e) {}
    return this.getSubscription();
  },

  getSubscription() {
    const raw = localStorage.getItem('sukabaca_subscription');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    localStorage.setItem('sukabaca_subscription', JSON.stringify(INITIAL_SUBSCRIPTION));
    return INITIAL_SUBSCRIPTION;
  },

  async useAiQuota() {
    const auth = this.getAuth();
    const uid = auth.profile?.userId || auth.profile?.id || 1;
    try {
      fetch(`/api/subscriptions/user/${uid}/use-ai`, { method: 'POST' }).catch(() => {});
    } catch (e) {}

    const sub = this.getSubscription();
    if (sub.dailyQuota > sub.usedToday || sub.dailyQuota >= 999) {
      sub.usedToday += 1;
      localStorage.setItem('sukabaca_subscription', JSON.stringify(sub));
      return { success: true, remaining: Math.max(0, sub.dailyQuota - sub.usedToday) };
    }
    return { success: false, remaining: 0 };
  },

  async upgradeSubscription(planName = 'Ultra Academic Pro') {
    const auth = this.getAuth();
    const uid = auth.profile?.userId || auth.profile?.id || 1;
    try {
      await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, plan: 'pro' })
      });
    } catch (e) {}

    const sub = {
      plan: planName,
      status: 'active',
      dailyQuota: 999,
      usedToday: 0,
      periodEnd: '2027-12-31'
    };
    localStorage.setItem('sukabaca_subscription', JSON.stringify(sub));
    return sub;
  }
};
