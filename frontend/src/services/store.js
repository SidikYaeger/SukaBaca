// SukaBaca Data & API Store
// Provides seamless client-side state persistence with full REST API compatibility

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

export const store = {
  // Auth
  getAuth() {
    const raw = localStorage.getItem('sukabaca_auth');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return { isAuthenticated: false, user: null };
      }
    }
    return { isAuthenticated: false, user: null };
  },

  setAuth(user) {
    const data = { isAuthenticated: !!user, user };
    localStorage.setItem('sukabaca_auth', JSON.stringify(data));
    return data;
  },

  clearAuth() {
    localStorage.removeItem('sukabaca_auth');
  },

  // Journals
  getJournals() {
    const raw = localStorage.getItem('sukabaca_journals');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    localStorage.setItem('sukabaca_journals', JSON.stringify(INITIAL_JOURNALS));
    return INITIAL_JOURNALS;
  },

  getJournalById(id) {
    const list = this.getJournals();
    return list.find(j => String(j.id) === String(id)) || list[0];
  },

  addJournal(journal) {
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

  incrementView(id) {
    const list = this.getJournals();
    const target = list.find(j => String(j.id) === String(id));
    if (target) {
      target.views = (target.views || 0) + 1;
      localStorage.setItem('sukabaca_journals', JSON.stringify(list));
    }
  },

  incrementDownload(id) {
    const list = this.getJournals();
    const target = list.find(j => String(j.id) === String(id));
    if (target) {
      target.download = (target.download || 0) + 1;
      localStorage.setItem('sukabaca_journals', JSON.stringify(list));
    }
  },

  // Reviews
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

  addReview(review) {
    const raw = localStorage.getItem('sukabaca_reviews');
    let list = INITIAL_REVIEWS;
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch (e) {}
    }
    const newReview = {
      id: Date.now(),
      createdAt: new Date().toLocaleString('id-ID'),
      ...review
    };
    list.unshift(newReview);
    localStorage.setItem('sukabaca_reviews', JSON.stringify(list));
    return newReview;
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

  // Subscription / Quota
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

  useAiQuota() {
    const sub = this.getSubscription();
    if (sub.usedToday < sub.dailyQuota) {
      sub.usedToday += 1;
      localStorage.setItem('sukabaca_subscription', JSON.stringify(sub));
      return { success: true, remaining: sub.dailyQuota - sub.usedToday };
    }
    return { success: false, remaining: 0 };
  },

  upgradeSubscription(planName = 'Ultra Unlimited') {
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
