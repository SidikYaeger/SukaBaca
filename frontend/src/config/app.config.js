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
