import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search as SearchIcon,
  X,
  Bookmark,
  RotateCcw,
  AlertCircle,
  SlidersHorizontal
} from 'lucide-react';
import Header from '../components/layout/Header';
import SidebarDrawer from '../components/layout/SidebarDrawer';
import JournalCard from '../components/journal/JournalCard';
import JournalFilterSidebar from '../components/journal/JournalFilterSidebar';
import { Skeleton } from '../components/common/UIPrimitives';
import { journalService } from '../services/journal.service';
import { SORT_OPTIONS } from '../config/app.config';
import { useAuth } from '../context/AuthContext';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const currentYear = new Date().getFullYear();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [journals, setJournals] = useState([]);
  const [yearCounts, setYearCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state
  const [pubDateRange, setPubDateRange] = useState('');
  const [customMinYear, setCustomMinYear] = useState('');
  const [customMaxYear, setCustomMaxYear] = useState('');
  const [onlyAbstract, setOnlyAbstract] = useState(false);
  const [onlyWithFile, setOnlyWithFile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [sortOption, setSortOption] = useState('views_desc');
  const [savedOnly, setSavedOnly] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const hasActiveFilters = Boolean(
    pubDateRange || onlyAbstract || onlyWithFile || selectedCategory || selectedFormat || savedOnly
  );

  const syncSearchParams = (qVal, categoryVal) => {
    const params = {};
    if (qVal) params.q = qVal;
    if (categoryVal) params.category = categoryVal;
    setSearchParams(params);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    syncSearchParams(activeQuery.trim(), category);
  };

  const handleResetFilters = () => {
    setPubDateRange('');
    setCustomMinYear('');
    setCustomMaxYear('');
    setOnlyAbstract(false);
    setOnlyWithFile(false);
    setSelectedCategory('');
    setSelectedFormat('');
    setSavedOnly(false);
    syncSearchParams(activeQuery.trim(), '');
  };

  const executeSearch = useCallback(async () => {
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
        category: selectedCategory || null,
        formatFile: selectedFormat || null,
        minYear,
        maxYear,
        hasAbstract: onlyAbstract || null,
        hasFile: onlyWithFile || null,
        sortBy: sortBy || 'views',
        sortOrder: (sortDir || 'desc').toUpperCase()
      };

      const result = await journalService.smartSearch(criteria);
      let list = result.journals;

      if (savedOnly && isAuthenticated) {
        list = list.filter((j) => j.isSaved);
      }

      setJournals(list);
      setYearCounts(result.yearCounts || {});
    } catch (err) {
      setSearchError(err.message || 'Gagal memuat hasil pencarian jurnal.');
      setJournals([]);
    } finally {
      setLoading(false);
    }
  }, [
    activeQuery,
    sortOption,
    pubDateRange,
    customMinYear,
    customMaxYear,
    selectedCategory,
    selectedFormat,
    onlyAbstract,
    onlyWithFile,
    savedOnly,
    isAuthenticated,
    currentYear,
  ]);

  useEffect(() => {
    setSearchQuery(initialQuery);
    setActiveQuery(initialQuery);
    setSelectedCategory(initialCategory);
  }, [initialQuery, initialCategory]);

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setActiveQuery(q);
    syncSearchParams(q, selectedCategory);
  };

  const handleClearQuery = () => {
    setSearchQuery('');
    setActiveQuery('');
    syncSearchParams('', selectedCategory);
  };

  const handleToggleBookmark = async (id) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await journalService.toggleBookmark(id);
      setJournals((prev) =>
        prev.map((j) => (j.id === id ? { ...j, isSaved: !j.isSaved } : j))
      );
    } catch {
      // Ignore
    }
  };

  const handleDownloadFile = async (id, fileName) => {
    try {
      await journalService.downloadJournal(id, fileName);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#334155] font-sans selection:bg-[#0593C6] selection:text-white">
      {/* Top Header */}
      <Header onMenuClick={() => setDrawerOpen(true)} />
      <SidebarDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full space-y-6">
        
        {/* Top Search Controls Bar */}
        <section className="p-4 sm:p-5 space-y-3 bg-[#F8FAFC] border border-[#CBD5E1] shadow-hard-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="dokmeh-search-container w-full flex-1">
              <SearchIcon size={18} className="text-[#64748B] shrink-0 mr-1.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul jurnal, topik riset, atau nama penulis..."
                className="dokmeh-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearQuery}
                  className="px-2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                  title="Clear"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                className="dokmeh-btn-primary !py-2 !px-5 text-xs sm:text-sm ml-1"
              >
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Sub-bar with active filter indicator and controls */}
          <div className="flex flex-wrap items-center justify-between text-xs gap-3 pt-1 border-t border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <span className="text-[#64748B] font-mono text-[11px] uppercase">Query:</span>
              <span className="font-bold text-[#0F172A] bg-[#FFFFFF] px-2 py-0.5 border border-[#CBD5E1] font-mono">
                {activeQuery ? `"${activeQuery}"` : 'ALL_PUBLICATIONS'}
              </span>

              {selectedCategory && (
                <span className="font-bold text-[#0593C6] bg-[#FFFFFF] px-2 py-0.5 border border-[#0593C6]/40 font-mono">
                  {selectedCategory}
                </span>
              )}

              {hasActiveFilters && (
                <span className="dokmeh-badge-active">
                  <span className="w-1.5 h-1.5 bg-[#D83995]" />
                  <span>FILTER_ACTIVE</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto sm:ml-0">
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden dokmeh-btn-secondary !py-1 !px-2.5 text-xs flex items-center gap-1.5"
              >
                <SlidersHorizontal size={13} />
                <span>Filters</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[#64748B] font-mono text-[11px] uppercase">Sort:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="dokmeh-select"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Search Results & Filter Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (3 cols): Filter Sidebar */}
          <div className={`lg:col-span-3 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <JournalFilterSidebar
              pubDateRange={pubDateRange}
              setPubDateRange={setPubDateRange}
              customMinYear={customMinYear}
              setCustomMinYear={setCustomMinYear}
              customMaxYear={customMaxYear}
              setCustomMaxYear={setCustomMaxYear}
              onlyAbstract={onlyAbstract}
              setOnlyAbstract={setOnlyAbstract}
              onlyWithFile={onlyWithFile}
              setOnlyWithFile={setOnlyWithFile}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
              selectedFormat={selectedFormat}
              setSelectedFormat={setSelectedFormat}
              yearCounts={yearCounts}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Right Column (9 cols): Result Cards */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* Results count banner */}
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#CBD5E1] text-xs">
              <span className="text-[#64748B]">
                Menampilkan{' '}
                <strong className="text-[#0F172A] font-mono tabular-nums">{journals.length}</strong> publikasi
              </span>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setSavedOnly(!savedOnly)}
                  className={`px-2.5 py-1 text-xs font-semibold border transition-all ${
                    savedOnly
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-hard-sm'
                      : 'bg-[#FFFFFF] text-[#64748B] border-[#CBD5E1] hover:border-[#0F172A]'
                  }`}
                >
                  <Bookmark size={12} className="inline mr-1" />
                  Hanya Tersimpan
                </button>
              )}
            </div>

            {/* Error Message */}
            {searchError && (
              <div className="p-4 bg-red-50 border border-red-300 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{searchError}</span>
              </div>
            )}

            {/* Loading State: Content-Matched Sharp Skeletons */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-6 bg-white border border-[#E2E8F0] space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="w-20 h-5" />
                      <Skeleton className="w-14 h-5" />
                    </div>
                    <Skeleton className="w-3/4 h-6" />
                    <Skeleton className="w-full h-12" />
                    <div className="pt-3 border-t border-[#E2E8F0] flex justify-between">
                      <Skeleton className="w-36 h-4" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : journals.length === 0 ? (
              /* Sharp Empty State View */
              <div className="p-10 sm:p-14 text-center space-y-4 border border-[#CBD5E1] bg-[#F8FAFC]">
                <div className="mx-auto w-14 h-14 bg-[#FFFFFF] border-2 border-[#0F172A] shadow-hard-sm flex items-center justify-center text-[#0F172A]">
                  <SearchIcon size={24} />
                </div>

                <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
                  Tidak ditemukan jurnal untuk{' '}
                  <span className="text-[#0593C6] font-mono">{activeQuery ? `"${activeQuery}"` : 'kriteria ini'}</span>
                </h3>

                <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
                  Coba gunakan istilah kata kunci lain atau reset filter untuk menampilkan seluruh repositori yang tersedia.
                </p>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="dokmeh-btn-primary"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Filter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/home')}
                    className="dokmeh-btn-secondary"
                  >
                    <span>Kembali ke Beranda</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Populated Cards List */
              <div className="space-y-4">
                {journals.map((journal) => (
                  <JournalCard
                    key={journal.id}
                    journal={journal}
                    onToggleBookmark={handleToggleBookmark}
                    onDownload={handleDownloadFile}
                  />
                ))}
              </div>
            )}

          </div>

        </section>

      </main>
    </div>
  );
}
