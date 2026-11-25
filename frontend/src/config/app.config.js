/**
 * Centralized Application Configuration & Constants
 */

export const APP_CONFIG = {
  NAME: 'SukaBaca',
  TAGLINE: 'Academic Journal Discovery & Research Management',
  VERSION: '2.0.0',
  DEFAULT_PAGE_SIZE: 10,
};

export const ACADEMIC_TOPICS = [
  'Engineering',
  'Computer Science',
  'Mathematics',
  'Physics',
  'Medicine',
  'Biology',
  'Climate Change',
  'Social Science',
  'Astrophysics',
  'Chemistry',
];

export const JOURNAL_CATEGORIES = [
  'Umum',
  'Teknik & Informatika',
  'Sains & Matematika',
  'Kesehatan & Kedokteran',
  'Sosial & Humaniora',
  'Ekonomi & Bisnis',
  'Lingkungan & Iklim'
];

export const FILE_FORMATS = ['ALL', 'PDF', 'DOCX'];

export const SORT_OPTIONS = [
  { value: 'views_desc', label: 'Best Match (Views)' },
  { value: 'date_desc', label: 'Most Recent' },
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'download_desc', label: 'Most Downloaded' },
  { value: 'title_asc', label: 'Title (A–Z)' }
];

export const RATING_FILTER_OPTIONS = [
  { value: '', label: 'Semua Rating' },
  { value: '4', label: '4★ ke atas' },
  { value: '3', label: '3★ ke atas' },
  { value: '2', label: '2★ ke atas' },
  { value: '1', label: '1★ ke atas' }
];

export const AI_MODELS = [
  {
    id: 'Basic SukaBaca AI',
    label: 'Basic SukaBaca AI',
    badge: 'FREE & PRO',
    tier: 'free',
    description: 'Ringkasan cepat & padat untuk ekstraksi inti jurnal harian.'
  },
  {
    id: 'Pro SukaBaca AI',
    label: 'Pro SukaBaca AI',
    badge: 'PRO',
    tier: 'pro',
    description: 'Penalaran mendalam untuk metodologi, metrik, dan sintesis lanjutan.'
  }
];

export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Access',
    dailyQuota: 5,
    description: 'Akses membaca jurnal dasar dan ringkasan terbatas per hari.'
  },
  PRO: {
    id: 'pro',
    name: 'Ultra Academic Pro',
    dailyQuota: 9999,
    description: 'Akses tanpa batas ke seluruh ringkasan AI, unduhan jurnal, dan fitur ekspor.'
  }
};
