import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  X,
  Settings,
  Download,
  FileText,
  Star,
  Calendar,
  User,
  Menu,
  Bookmark,
  Mail,
  Share2,
  Eye
} from 'lucide-react';
import SidebarDrawer from '../components/SidebarDrawer';
import { store } from '../services/store';

export default function SearchPage({ onLogout }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const currentYear = new Date().getFullYear();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(!!initialQuery);
  const [journals, setJournals] = useState([]);
  const [yearCounts, setYearCounts] = useState({});
  const [totalInCatalog, setTotalInCatalog] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [pubDateRange, setPubDateRange] = useState('');
  const [customMinYear, setCustomMinYear] = useState('');
  const [customMaxYear, setCustomMaxYear] = useState('');
  const [onlyAbstract, setOnlyAbstract] = useState(false);
  const [onlyWithFile, setOnlyWithFile] = useState(false);
  const [sortOption, setSortOption] = useState('views_desc');
  const [showCustomFilters, setShowCustomFilters] = useState(false);
  const [customAuthor, setCustomAuthor] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customFormat, setCustomFormat] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [showSendMenu, setShowSendMenu] = useState(false);
  const [toolbarNotice, setToolbarNotice] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const auth = store.getAuth();

  const runSmartSearch = useCallback(async () => {
    setLoading(true);
    setSearchError('');
    try {
      const [sortBy, sortDir] = sortOption.split('_');
      let minYear = null;
      let maxYear = null;
      if (pubDateRange === '1') {
        minYear = currentYear - 1;
        maxYear = currentYear;
      } else if (pubDateRange === '5') {
        minYear = currentYear - 5;
        maxYear = currentYear;
      } else if (pubDateRange === '10') {
        minYear = currentYear - 10;
        maxYear = currentYear;
      } else if (pubDateRange === 'custom') {
        if (/^\d{4}$/.test(customMinYear.trim())) minYear = Number(customMinYear.trim());
        if (/^\d{4}$/.test(customMaxYear.trim())) maxYear = Number(customMaxYear.trim());
      }

      const criteria = {
        keyword: activeQuery.trim() || null,
        penulis: customAuthor.trim() || null,
        category: customCategory.trim() || null,
        formatFile: customFormat || null,
        minYear,
        maxYear,
        hasAbstract: onlyAbstract || null,
        hasFile: onlyWithFile || null,
        sortBy: sortBy || 'views',
        sortOrder: (sortDir || 'desc').toUpperCase()
      };

      const res = await store.apiSmartSearch(criteria);
      let list = res.journals;
      if (savedOnly && auth.isAuthenticated) {
        list = list.filter(j => j.isSaved);
      }
      setJournals(list);
      setYearCounts(res.yearCounts || {});
      const catalogCount = Object.values(res.yearCounts || {}).reduce((acc, n) => acc + Number(n || 0), 0);
      setTotalInCatalog(catalogCount || res.journals.length);
    } catch (err) {
      setSearchError(err.message || 'Gagal memuat pencarian');
      setJournals([]);
    } finally {
      setLoading(false);
    }
  }, [
    activeQuery,
    pubDateRange,
    customMinYear,
    customMaxYear,
    onlyAbstract,
    onlyWithFile,
    sortOption,
    customAuthor,
    customCategory,
    customFormat,
    savedOnly,
    auth.isAuthenticated,
    currentYear
  ]);

  useEffect(() => {
    runSmartSearch();
  }, [runSmartSearch]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
    setActiveQuery(q);
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    setActiveQuery(q);
    setSearchParams(q ? { q } : {});
    if (q) setShowFilters(true);
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setActiveQuery('');
    setPubDateRange('');
    setCustomMinYear('');
    setCustomMaxYear('');
    setOnlyAbstract(false);
    setOnlyWithFile(false);
    setCustomAuthor('');
    setCustomCategory('');
    setCustomFormat('');
    setSavedOnly(false);
    setSearchParams({});
  };

  const handleCardClick = (journal) => {
    navigate(`/journal/${journal.id}`);
  };

  const handleToggleSaveCard = async (journal, e) => {
    e.stopPropagation();
    if (!auth.isAuthenticated || !store.getToken()) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    try {
      if (journal.isSaved) {
        await store.apiUnsaveJournal(journal.id);
      } else {
        await store.apiSaveJournal(journal.id);
      }
      setJournals(prev => {
        const updated = prev.map(j => j.id === journal.id ? { ...j, isSaved: !journal.isSaved } : j);
        return savedOnly ? updated.filter(j => j.isSaved) : updated;
      });
    } catch (err) {
      setToolbarNotice(err.message || 'Gagal memperbarui bookmark');
      setTimeout(() => setToolbarNotice(''), 2500);
    }
  };

  const handleToggleSavedFilter = () => {
    if (!auth.isAuthenticated || !store.getToken()) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    setSavedOnly(prev => !prev);
  };

  const handleEmailResults = () => {
    if (journals.length === 0) return;
    const lines = journals.slice(0, 10).map((j, i) =>
      `${i + 1}. ${j.title} - ${j.author} (${j.year}) -> ${window.location.origin}/journal/${j.id}`
    );
    const subject = encodeURIComponent(`Referensi Jurnal SukaBaca (${journals.length})`);
    const body = encodeURIComponent(`Berikut daftar jurnal dari SukaBaca:\n\n${lines.join('\n')}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopyShareLinks = async () => {
    setShowSendMenu(false);
    if (journals.length === 0) return;
    const text = journals.slice(0, 15).map((j, i) =>
      `${i + 1}. ${j.title} (${j.author}, ${j.year}) - ${window.location.origin}/journal/${j.id}`
    ).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setToolbarNotice('Daftar tautan disalin ke clipboard');
    } catch (e) {
      setToolbarNotice('Tidak dapat mengakses clipboard browser');
    }
    setTimeout(() => setToolbarNotice(''), 2500);
  };

  const handleExportCitations = () => {
    setShowSendMenu(false);
    if (journals.length === 0) return;
    const text = journals.map((j, i) =>
      `[${i + 1}] ${j.author} (${j.year}). "${j.title}". Kategori: ${j.category}. URL: ${window.location.origin}/journal/${j.id}`
    ).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SukaBaca_Sitasi.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadYearStats = () => {
    const entries = Object.entries(yearCounts);
    if (entries.length === 0) return;
    const csv = ['Tahun,Jumlah Jurnal', ...entries.map(([y, c]) => `${y},${c}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SukaBaca_Statistik_Tahun.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const hasActiveFilter = !!(
    activeQuery.trim() ||
    pubDateRange ||
    onlyAbstract ||
    onlyWithFile ||
    customAuthor.trim() ||
    customCategory.trim() ||
    customFormat ||
    savedOnly
  );
  const isFilterViewActive = hasActiveFilter || showFilters;

  const popularTopics = Array.from(
    new Set(journals.flatMap(j => [j.category, j.author]).filter(Boolean))
  ).slice(0, 6);

  const yearEntries = Object.entries(yearCounts).sort(([a], [b]) => a.localeCompare(b));
  const maxYearCount = Math.max(1, ...yearEntries.map(([, c]) => Number(c) || 0));

  return (
    <div className="page-enter flex-1 flex flex-col bg-[#faf9fc] min-h-screen font-sans text-gray-900">
      <div className="w-full bg-white border-b border-purple-100 py-4 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 text-gray-700"
              title="Buka Navigasi SukaBaca"
            >
              <Menu size={20} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="cursor-pointer flex items-center gap-2 select-none hover:opacity-90 active:scale-95"
              title="Kembali ke Dashboard"
            >
              <img src="/sukabaca-book.png" alt="SukaBaca Logo" className="h-9 w-auto object-contain" />
              <span className="text-3xl font-black tracking-tight text-[#4c1d95]">
                Suka<span className="text-[#b83c9c]">Baca</span>
              </span>
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex-1 w-full max-w-3xl">
            <div className="flex items-center border-2 border-purple-600 rounded-lg overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-purple-300">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul jurnal, penulis, atau kategori..."
                className="w-full px-3.5 py-2.5 text-sm sm:text-base outline-none text-gray-900 font-medium placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="px-2 text-gray-400 hover:text-purple-700 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 text-white font-bold text-sm shadow hover:opacity-95 active:scale-98 transition-all"
                style={{
                  background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
                }}
              >
                Search
              </button>
            </div>

            <div className="flex items-center text-[11px] text-purple-700 font-medium mt-1.5 px-1">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`hover:underline cursor-pointer flex items-center gap-1.5 font-semibold transition-all ${
                  showFilters ? 'text-purple-900 font-bold' : 'text-purple-700'
                }`}
              >
                <span>Advanced</span>
                {showFilters && (
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full font-bold">
                    Filter Aktif
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading && totalInCatalog === 0 ? (
        <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full text-center">
          <div className="bg-white border border-purple-100 rounded-2xl p-10 max-w-xl mx-auto shadow-xs">
            <p className="text-sm font-semibold text-gray-500">Memuat daftar jurnal...</p>
          </div>
        </main>
      ) : totalInCatalog === 0 && !hasActiveFilter ? (
        <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full text-center">
          <div className="bg-white border border-purple-100 rounded-2xl p-8 sm:p-10 max-w-xl mx-auto shadow-xs">
            <FileText size={44} className="mx-auto text-purple-400 mb-3" strokeWidth={1.6} />
            <h1 className="text-lg sm:text-xl font-extrabold text-[#2b1055] mb-2">
              Maaf, belum ada jurnal yang tersedia
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mb-6">
              Saat ini belum ada jurnal yang tersimpan. Silakan unggah jurnal pertama Anda.
            </p>
            <button
              type="button"
              onClick={() => navigate('/upload-form')}
              className="py-2.5 px-5 rounded-xl text-white font-bold text-xs sm:text-sm shadow hover:opacity-95 active:scale-95"
              style={{
                background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
                border: '1px solid #333333'
              }}
            >
              Unggah Jurnal
            </button>
          </div>
        </main>
      ) : !isFilterViewActive ? (
        <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full text-center">
          <div className="py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2b1055] mb-6 font-serif">
              Search Millions of Academic Publications & Citations
            </h1>

            <div className="bg-white border border-purple-100 rounded-2xl p-6 max-w-2xl mx-auto text-left shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-3">
                TOPIK & PENULIS TERSEDIA ({journals.length} JURNAL):
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTopics.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSearchQuery(item);
                      setActiveQuery(item);
                      setSearchParams({ q: item });
                      setShowFilters(true);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-300 text-purple-800 hover:bg-purple-600 hover:text-white transition-all text-xs font-semibold shadow-2xs"
                  >
                    {item}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  className="px-3.5 py-1.5 rounded-full bg-gray-100 border border-gray-300 text-gray-800 hover:bg-gray-200 transition-all text-xs font-semibold"
                >
                  Lihat Semua Jurnal
                </button>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-5 w-full">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 pb-3 mb-6 text-xs text-gray-700">
            <div className="flex items-center gap-2 relative">
              <button
                type="button"
                onClick={handleToggleSavedFilter}
                className={`px-3 py-1 border rounded shadow-2xs font-semibold flex items-center gap-1.5 ${
                  savedOnly
                    ? 'bg-purple-600 border-purple-700 text-white'
                    : 'bg-white border-gray-300 hover:bg-purple-50 text-gray-800'
                }`}
              >
                <Bookmark size={13} fill={savedOnly ? 'currentColor' : 'none'} />
                <span>{savedOnly ? 'Tersimpan' : 'Save'}</span>
              </button>
              <button
                type="button"
                onClick={handleEmailResults}
                disabled={journals.length === 0}
                className="px-3 py-1 bg-white border border-gray-300 rounded shadow-2xs hover:bg-purple-50 font-semibold text-gray-800 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Mail size={13} />
                <span>Email</span>
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSendMenu(prev => !prev)}
                  disabled={journals.length === 0}
                  className="px-3 py-1 bg-white border border-gray-300 rounded shadow-2xs hover:bg-purple-50 font-semibold text-gray-800 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Share2 size={13} />
                  <span>Send to</span>
                </button>
                {showSendMenu && (
                  <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                    <button
                      type="button"
                      onClick={handleCopyShareLinks}
                      className="w-full text-left px-3 py-2 hover:bg-purple-50 text-xs font-medium text-gray-800"
                    >
                      Salin tautan hasil
                    </button>
                    <button
                      type="button"
                      onClick={handleExportCitations}
                      className="w-full text-left px-3 py-2 hover:bg-purple-50 text-xs font-medium text-gray-800"
                    >
                      Unduh sitasi (.txt)
                    </button>
                  </div>
                )}
              </div>
              {toolbarNotice && (
                <span className="text-[11px] font-semibold text-purple-700 ml-2">{toolbarNotice}</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-600">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-white border border-gray-300 rounded px-2 py-1 font-semibold text-gray-800 outline-none"
                >
                  <option value="views_desc">Best match (Views)</option>
                  <option value="date_desc">Most recent</option>
                  <option value="rating_desc">Highest rated</option>
                  <option value="download_desc">Most downloaded</option>
                  <option value="title_asc">Title (A-Z)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setCompactView(prev => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 border rounded shadow-2xs font-semibold ${
                  compactView
                    ? 'bg-purple-50 border-purple-400 text-purple-900'
                    : 'bg-white border-gray-300 hover:bg-purple-50 text-gray-800'
                }`}
              >
                <span>{compactView ? 'Compact' : 'Display options'}</span>
                <Settings size={13} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {showFilters && (
              <aside className="lg:col-span-3 space-y-6 text-xs text-gray-800">
                <div>
                  <h4 className="text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                    MY CUSTOM FILTERS
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowCustomFilters(prev => !prev)}
                    className="text-purple-700 hover:underline cursor-pointer font-medium"
                  >
                    {showCustomFilters ? 'Tutup custom filters' : 'Edit custom filters'}
                  </button>
                  {showCustomFilters && (
                    <div className="mt-3 p-3 bg-white border border-purple-100 rounded-xl space-y-2.5">
                      <input
                        type="text"
                        value={customAuthor}
                        onChange={(e) => setCustomAuthor(e.target.value)}
                        placeholder="Filter penulis..."
                        className="field-input"
                      />
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Filter kategori..."
                        className="field-input"
                      />
                      <select
                        value={customFormat}
                        onChange={(e) => setCustomFormat(e.target.value)}
                        className="field-input"
                      >
                        <option value="">Semua Format</option>
                        <option value="PDF">PDF</option>
                        <option value="DOCX">DOCX</option>
                        <option value="DOC">DOC</option>
                        <option value="TXT">TXT</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleClearAllFilters}
                        className="text-[11px] font-semibold text-red-600 hover:underline"
                      >
                        Reset semua filter
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-purple-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                      RESULTS BY YEAR
                    </h4>
                    <button
                      type="button"
                      onClick={handleDownloadYearStats}
                      disabled={yearEntries.length === 0}
                      className="text-gray-400 hover:text-purple-700 disabled:opacity-40"
                      title="Unduh statistik tahun (.csv)"
                    >
                      <Download size={13} />
                    </button>
                  </div>

                  {yearEntries.length === 0 ? (
                    <p className="text-[11px] text-gray-500">Belum ada data tahun.</p>
                  ) : (
                    <>
                      <div className="h-20 w-full bg-white rounded flex items-end justify-around gap-1 px-2 pt-3 pb-1 border-b border-purple-200">
                        {yearEntries.map(([yr, cnt]) => {
                          const hPct = Math.max(15, Math.round((Number(cnt) / maxYearCount) * 100));
                          return (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => {
                                setPubDateRange('custom');
                                setCustomMinYear(yr);
                                setCustomMaxYear(yr);
                              }}
                              title={`${yr}: ${cnt} jurnal`}
                              className="w-3 bg-purple-600 hover:bg-[#b83c9c] rounded-t transition-colors"
                              style={{ height: `${hPct}%` }}
                            />
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-purple-900 mt-1">
                        <span>{yearEntries[0][0]}</span>
                        <span>{yearEntries[yearEntries.length - 1][0]}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t border-purple-100 pt-4 space-y-2">
                  <h4 className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                    PUBLICATION DATE
                  </h4>
                  <div className="space-y-1.5">
                    {[
                      { val: '', label: 'Semua tahun' },
                      { val: '1', label: '1 year' },
                      { val: '5', label: '5 years' },
                      { val: '10', label: '10 years' },
                      { val: 'custom', label: 'Custom Range' }
                    ].map(opt => (
                      <label key={opt.val || 'all'} className="flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="pub_date"
                          checked={pubDateRange === opt.val}
                          onChange={() => setPubDateRange(opt.val)}
                          className="accent-purple-600"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {pubDateRange === 'custom' && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <input
                        type="text"
                        value={customMinYear}
                        onChange={(e) => setCustomMinYear(e.target.value)}
                        placeholder="Dari (2020)"
                        maxLength={4}
                        className="field-input"
                      />
                      <input
                        type="text"
                        value={customMaxYear}
                        onChange={(e) => setCustomMaxYear(e.target.value)}
                        placeholder="Sampai (2026)"
                        maxLength={4}
                        className="field-input"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-purple-100 pt-4 space-y-2">
                  <h4 className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                    TEXT AVAILABILITY
                  </h4>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={onlyAbstract}
                        onChange={(e) => setOnlyAbstract(e.target.checked)}
                        className="accent-purple-600 rounded"
                      />
                      <span>Abstract tersedia</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={onlyWithFile}
                        onChange={(e) => setOnlyWithFile(e.target.checked)}
                        className="accent-purple-600 rounded"
                      />
                      <span>Berkas unduhan tersedia</span>
                    </label>
                  </div>
                </div>
              </aside>
            )}

            <div className={`${showFilters ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-4`}>
              {!activeQuery.trim() && (
                <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <h3 className="text-sm font-bold text-[#2b1055]">
                      Filter Pencarian Lanjutan (SmartSearch)
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Menampilkan {journals.length} publikasi akademik.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="text-xs text-purple-700 hover:text-purple-900 font-semibold underline self-start sm:self-auto"
                  >
                    Tutup Filter
                  </button>
                </div>
              )}

              {searchError && (
                <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  {searchError}
                </div>
              )}

              {journals.length === 0 ? (
                <div className="bg-white border border-purple-100 rounded-2xl p-10 text-center text-gray-600 shadow-xs">
                  <p className="font-bold text-sm text-gray-800">
                    {activeQuery
                      ? `Maaf, tidak ditemukan jurnal untuk "${activeQuery}"`
                      : 'Maaf, tidak ada jurnal yang cocok dengan filter yang dipilih'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Coba kata kunci lain atau reset filter untuk menampilkan semua jurnal yang tersedia.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="mt-4 px-4 py-2 rounded-lg text-white text-xs font-semibold shadow"
                    style={{
                      background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
                    }}
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                journals.map((journal, idx) => {
                  const ratingLabel = journal.rating > 0
                    ? `${journal.rating} / 5 (${journal.reviewCount})`
                    : 'Belum ada rating';
                  const stagger = Math.min(idx + 1, 10);
                  return (
                    <div
                      key={journal.id}
                      onClick={() => handleCardClick(journal)}
                      className={`card-reveal card-reveal-${stagger} w-full bg-white border border-gray-200 hover:border-purple-400 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-xs cursor-pointer flex items-start gap-4 group`}
                    >
                      <div className="w-10 h-12 sm:w-11 sm:h-14 border border-purple-200 bg-purple-50/70 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0 group-hover:bg-purple-100/80 transition-colors">
                        <FileText size={22} strokeWidth={1.8} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-tight truncate">
                            {journal.category || 'Umum'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleToggleSaveCard(journal, e)}
                            className={`p-1 rounded hover:bg-purple-50 ${
                              journal.isSaved ? 'text-purple-700' : 'text-gray-400 hover:text-purple-700'
                            }`}
                            title={journal.isSaved ? 'Hapus dari tersimpan' : 'Simpan jurnal'}
                          >
                            <Bookmark size={15} fill={journal.isSaved ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        <h3 className="text-sm sm:text-base font-extrabold text-[#3b1262] group-hover:text-purple-700 tracking-tight leading-snug uppercase mb-2">
                          {journal.title}
                        </h3>

                        {!compactView && journal.snippet && (
                          <p className="text-xs text-gray-600 mb-2.5 line-clamp-2">
                            {journal.snippet}
                          </p>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#fef3c7] text-[#92400e] border border-[#fde68a] px-2.5 py-0.5 rounded-full">
                            <User size={11} strokeWidth={2.5} />
                            <span>{journal.author}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full">
                            <Calendar size={11} strokeWidth={2.5} />
                            <span>{journal.year || '2026'}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 px-2.5 py-0.5 rounded-full">
                            <Star size={11} fill="currentColor" className="text-amber-500" />
                            <span>{ratingLabel}</span>
                          </span>

                          <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {journal.formatFile || 'PDF'}
                          </span>

                          {!compactView && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 ml-auto">
                              <Eye size={11} /> {journal.views || 0}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      )}

      <SidebarDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={onLogout}
      />
    </div>
  );
}
