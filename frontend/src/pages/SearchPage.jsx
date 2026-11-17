import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  X, 
  Settings, 
  Download, 
  FileText, 
  Star, 
  Calendar, 
  User, 
  Menu, 
  Maximize2 
} from 'lucide-react';
import SidebarDrawer from '../components/SidebarDrawer';
import { store } from '../services/store';

export default function SearchPage({ onLogout }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(!!initialQuery);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadJournals = async () => {
      const data = await store.fetchJournals();
      if (isMounted) {
        setJournals(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    };
    loadJournals();
    return () => { isMounted = false; };
  }, []);

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

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveQuery('');
    setSearchParams({});
    setShowFilters(false);
  };

  const filteredJournals = journals.filter(j => {
    if (!activeQuery.trim()) return true;
    const q = activeQuery.toLowerCase();
    return [j.title, j.author, j.snippet, j.category].some(f => f?.toLowerCase().includes(q));
  });

  const popularTopics = Array.from(
    new Set(
      journals
        .flatMap(j => [j.category, j.author])
        .filter(Boolean)
    )
  ).slice(0, 6);

  const handleCardClick = (journal) => {
    navigate(`/journal/${journal.id}`);
  };

  const hasSearched = activeQuery.trim().length > 0;
  const isFilterViewActive = hasSearched || showFilters;

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
                  onClick={handleClearSearch}
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

            {/* Quick sub-links under search input */}
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

      {loading ? (
        <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full text-center">
          <div className="bg-white border border-purple-100 rounded-2xl p-10 max-w-xl mx-auto shadow-xs">
            <p className="text-sm font-semibold text-gray-500">Memuat jurnal dari database...</p>
          </div>
        </main>
      ) : journals.length === 0 ? (
        <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full text-center">
          <div className="bg-white border border-purple-100 rounded-2xl p-8 sm:p-10 max-w-xl mx-auto shadow-xs">
            <FileText size={44} className="mx-auto text-purple-400 mb-3" strokeWidth={1.6} />
            <h1 className="text-lg sm:text-xl font-extrabold text-[#2b1055] mb-2">
              Maaf, belum ada jurnal di database
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
        /* STATE 2: Has Searched -> EXACT Layout as User Mockup Screenshot in Purple Nuance */
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-5 w-full">
          {/* Action bar: Save, Email, Send to | Sort by, Display options */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 pb-3 mb-6 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-white border border-gray-300 rounded shadow-2xs hover:bg-purple-50 font-semibold text-gray-800">
                Save
              </button>
              <button className="px-3 py-1 bg-white border border-gray-300 rounded shadow-2xs hover:bg-purple-50 font-semibold text-gray-800">
                Email
              </button>
              <button className="px-3 py-1 bg-white border border-gray-300 rounded shadow-2xs hover:bg-purple-50 font-semibold text-gray-800">
                Send to
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-600">Sort by:</span>
                <select className="bg-white border border-gray-300 rounded px-2 py-1 font-semibold text-gray-800 outline-none">
                  <option>Best match</option>
                  <option>Most recent</option>
                  <option>Publication date</option>
                </select>
              </div>

              <button className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 rounded shadow-2xs hover:bg-purple-50 font-semibold text-gray-800">
                <span>Display options</span>
                <Settings size={13} />
              </button>
            </div>
          </div>

          {/* Two-column layout matching screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Mockup PubMed Sidebar in Purple Nuance */}
            {showFilters && (
              <aside className="lg:col-span-3 space-y-6 text-xs text-gray-800">
                {/* My Custom Filters */}
                <div>
                  <h4 className="text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                    MY CUSTOM FILTERS
                  </h4>
                  <span className="text-purple-700 hover:underline cursor-pointer font-medium">
                    Edit custom filters
                  </span>
                </div>

                {/* Results by Year Histogram in Purple */}
                <div className="border-t border-purple-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                      RESULTS BY YEAR
                    </h4>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Maximize2 size={13} className="cursor-pointer hover:text-purple-700" />
                      <Download size={13} className="cursor-pointer hover:text-purple-700" />
                    </div>
                  </div>

                  {/* SVG Histogram Graphic Replica matching mockup in Purple */}
                  <div className="h-20 w-full bg-white rounded flex items-end justify-between px-1 pt-4 pb-1 border-b border-purple-200">
                    <div className="w-1 bg-purple-300 h-1" />
                    <div className="w-1 bg-purple-300 h-1.5" />
                    <div className="w-1 bg-purple-400 h-2" />
                    <div className="w-1 bg-purple-400 h-3" />
                    <div className="w-1 bg-purple-500 h-5" />
                    <div className="w-1 bg-purple-500 h-8" />
                    <div className="w-1 bg-[#7c3a7f] h-12" />
                    <div className="w-1 bg-[#b83c9c] h-16" />
                    <div className="w-1 bg-[#6b21a8] h-14" />
                  </div>

                  {/* Timeline handles */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-purple-900 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-purple-600 bg-white inline-block" />
                      <span>1955</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>2027</span>
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-purple-600 bg-white inline-block" />
                    </div>
                  </div>
                </div>

                {/* Publication Date */}
                <div className="border-t border-purple-100 pt-4 space-y-2">
                  <h4 className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                    PUBLICATION DATE
                  </h4>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input type="radio" name="pub_date" className="accent-purple-600" />
                      <span>1 year</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input type="radio" name="pub_date" className="accent-purple-600" />
                      <span>5 years</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input type="radio" name="pub_date" className="accent-purple-600" />
                      <span>10 years</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input type="radio" name="pub_date" className="accent-purple-600" />
                      <span>Custom Range</span>
                    </label>
                  </div>
                </div>

                {/* Text Availability */}
                <div className="border-t border-purple-100 pt-4 space-y-2">
                  <h4 className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                    TEXT AVAILABILITY
                  </h4>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input type="checkbox" className="accent-purple-600 rounded" />
                      <span>Abstract</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input type="checkbox" className="accent-purple-600 rounded" />
                      <span>Free full text</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input type="checkbox" className="accent-purple-600 rounded" />
                      <span>Full text</span>
                    </label>
                  </div>
                </div>

                {/* Article Attribute */}
                <div className="border-t border-purple-100 pt-4">
                  <h4 className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                    ARTICLE ATTRIBUTE
                  </h4>
                </div>
              </aside>
            )}

            {/* Right Column: Results List matching mockup screenshot */}
            <div className={`${showFilters ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-4`}>
              {!hasSearched && (
                <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <h3 className="text-sm font-bold text-[#2b1055]">
                      Filter Pencarian Lanjutan (Advanced Filter)
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Menampilkan semua publikasi akademik ({filteredJournals.length} dokumen). Gunakan filter di sebelah kiri untuk menyaring.
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
              {filteredJournals.length === 0 ? (
                <div className="bg-white border border-purple-100 rounded-2xl p-10 text-center text-gray-600 shadow-xs">
                  <p className="font-bold text-sm text-gray-800">
                    Maaf, tidak ditemukan jurnal untuk "{activeQuery}"
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Coba kata kunci lain atau tampilkan semua jurnal yang tersedia di database.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveQuery('');
                      setSearchParams({});
                    }}
                    className="mt-4 px-4 py-2 rounded-lg text-white text-xs font-semibold shadow"
                    style={{
                      background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
                    }}
                  >
                    Tampilkan Semua Jurnal
                  </button>
                </div>
              ) : (
                filteredJournals.map((journal, idx) => {
                  const ratingLabel = journal.rating > 0 ? `${journal.rating} / 5` : 'Belum ada rating';
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
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-tight mb-1 truncate">
                          {journal.category || 'Umum'}
                        </div>

                        <h3 className="text-sm sm:text-base font-extrabold text-[#3b1262] group-hover:text-purple-700 tracking-tight leading-snug uppercase mb-2.5">
                          {journal.title}
                        </h3>

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

      {/* SukaBaca Sidebar Drawer */}
      <SidebarDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={onLogout}
      />
    </div>
  );
}
