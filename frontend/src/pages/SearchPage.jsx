import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search as SearchIcon,
  X,
  Bookmark,
  RotateCcw,
  AlertCircle,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Header from '../components/layout/Header';
import SidebarDrawer from '../components/layout/SidebarDrawer';
import JournalCard from '../components/journal/JournalCard';
import JournalFilterSidebar from '../components/journal/JournalFilterSidebar';
import { Skeleton } from '../components/common/UIPrimitives';
import { journalService } from '../services/journal.service';
import { SORT_OPTIONS } from '../config/app.config';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 20;

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
  const [currentPage, setCurrentPage] = useState(1);

  // Filters state
  const [pubDateRange, setPubDateRange] = useState('');
  const [customMinYear, setCustomMinYear] = useState('');
  const [customMaxYear, setCustomMaxYear] = useState('');
  const [onlyAbstract, setOnlyAbstract] = useState(false);
  const [onlyWithFile, setOnlyWithFile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortOption, setSortOption] = useState('views_desc');
  const [savedOnly, setSavedOnly] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
    setMinRating('');
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
        minRating: minRating ? Number(minRating) : null,
        sortBy: sortBy || 'views',
        sortOrder: (sortDir || 'desc').toUpperCase()
      };

      const result = await journalService.smartSearch(criteria);
      let list = result.journals;

      if (savedOnly && isAuthenticated) {
        list = list.filter((j) => j.isSaved);
      }

      setJournals(list);
      setCurrentPage(1);
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
    minRating,
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
      const target = journals.find((j) => j.id === id);
      await journalService.toggleBookmark(id, Boolean(target?.isSaved));
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

  const totalPages = Math.max(1, Math.ceil(journals.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedJournals = journals.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (safePage > 3) pages.push('...');
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
    if (safePage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#334155] font-sans selection:bg-[#0593C6] selection:text-white">
      {/* Top Header */}
      <Header onMenuClick={() => setDrawerOpen(true)} />
      <SidebarDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full space-y-6">
        
        {/* Top Search Controls Bar */}
        <section className="p-4 sm:p-5 bg-[#F8FAFC] border border-[#CBD5E1] shadow-hard-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="w-full flex-1">
              <div className="dokmeh-search-container w-full">
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

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden dokmeh-btn-secondary h-[46px] !py-2 !px-3.5 text-xs flex items-center gap-1.5 shrink-0"
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>

              <div className="flex items-center gap-2 bg-[#FFFFFF] border-[1.5px] border-[#0F172A] shadow-[3px_3px_0px_#0F172A] px-3 h-[46px] flex-1 sm:flex-initial">
                <label
                  htmlFor="search-sort-select"
                  className="text-[#64748B] font-mono text-[11px] uppercase whitespace-nowrap select-none"
                >
                  Sort:
                </label>
                <select
                  id="search-sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#0F172A] focus:outline-none cursor-pointer w-full sm:w-auto pr-1"
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
              minRating={minRating}
              setMinRating={setMinRating}
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
                <strong className="text-[#0F172A] font-mono tabular-nums">
                  {journals.length > 0
                    ? `${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, journals.length)} dari ${journals.length}`
                    : 0}
                </strong>{' '}
                publikasi
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
                {paginatedJournals.map((journal) => (
                  <JournalCard
                    key={journal.id}
                    journal={journal}
                    onToggleBookmark={handleToggleBookmark}
                    onDownload={handleDownloadFile}
                  />
                ))}

                {totalPages > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#CBD5E1]"
                  >
                    <span className="text-xs text-[#64748B] font-mono">
                      Halaman <strong className="text-[#0F172A]">{safePage}</strong> / {totalPages}
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => goToPage(safePage - 1)}
                        disabled={safePage === 1}
                        className="dokmeh-btn-secondary !py-1.5 !px-2.5 text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={14} />
                        <span>Prev</span>
                      </button>

                      {getPageNumbers().map((item, idx) =>
                        item === '...' ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-2 py-1 text-xs font-mono text-[#64748B]"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={item}
                            type="button"
                            onClick={() => goToPage(item)}
                            className={`px-3 py-1.5 text-xs font-mono font-semibold border transition-all ${
                              item === safePage
                                ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-hard-sm'
                                : 'bg-[#FFFFFF] text-[#334155] border-[#CBD5E1] hover:border-[#0F172A]'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() => goToPage(safePage + 1)}
                        disabled={safePage === totalPages}
                        className="dokmeh-btn-secondary !py-1.5 !px-2.5 text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span>Next</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </nav>
                )}
              </div>
            )}

          </div>

        </section>

      </main>
    </div>
  );
}
