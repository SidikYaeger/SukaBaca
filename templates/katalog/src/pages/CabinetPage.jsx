import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { api, CATEGORIES } from '@shared/api';
import { useAuth } from '@shared/auth';
import { BookshelfView } from '../components/BookshelfView';
import { SmoothCollapse } from '../components/SmoothCollapse';

const INITIAL_FILTERS = {
  keyword: '',
  penulis: '',
  category: '',
  formatFile: '',
  minYear: '',
  maxYear: '',
  hasAbstract: false,
  hasFile: false,
  savedOnly: false,
  sortBy: 'views',
  sortOrder: 'DESC'
};

export function CabinetPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [journals, setJournals] = useState([]);
  const [yearCounts, setYearCounts] = useState({});
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busySaveId, setBusySaveId] = useState(null);

  const runSearch = useCallback(async (activeFilters) => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        keyword: activeFilters.keyword.trim() || undefined,
        penulis: activeFilters.penulis.trim() || undefined,
        formatFile: activeFilters.formatFile || undefined,
        category: activeFilters.category || undefined,
        minYear: activeFilters.minYear ? Number(activeFilters.minYear) : undefined,
        maxYear: activeFilters.maxYear ? Number(activeFilters.maxYear) : undefined,
        hasAbstract: activeFilters.hasAbstract ? true : undefined,
        hasFile: activeFilters.hasFile ? true : undefined,
        sortBy: activeFilters.sortBy,
        sortOrder: activeFilters.sortOrder
      };
      const res = await api.smartSearch(payload);
      setJournals(res.journals);
      setYearCounts(res.yearCounts || {});
    } catch (err) {
      setError(err.message || 'Gagal memuat kartu katalog dari server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const displayedJournals = useMemo(() => {
    if (filters.savedOnly && isAuthenticated) {
      return journals.filter((j) => j.isSaved);
    }
    return journals;
  }, [journals, filters.savedOnly, isAuthenticated]);

  const yearEntries = useMemo(() => {
    return Object.entries(yearCounts).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [yearCounts]);

  const handleSubmitSearch = (e) => {
    e.preventDefault();
    runSearch(filters);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    runSearch(INITIAL_FILTERS);
  };

  const handleYearChip = (year) => {
    const alreadySelected = filters.minYear === year && filters.maxYear === year;
    const next = {
      ...filters,
      minYear: alreadySelected ? '' : year,
      maxYear: alreadySelected ? '' : year
    };
    setFilters(next);
    runSearch(next);
  };

  const handleToggleSave = async (journal) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBusySaveId(journal.id);
    try {
      if (journal.isSaved) {
        await api.unsaveJournal(journal.id);
      } else {
        await api.saveJournal(journal.id);
      }
      const nextSaved = !journal.isSaved;
      setJournals((prev) =>
        prev.map((item) => (item.id === journal.id ? { ...item, isSaved: nextSaved } : item))
      );
    } catch (err) {
      setError(err.message || 'Gagal memperbarui status simpan kartu.');
    } finally {
      setBusySaveId(null);
    }
  };

  const hasActiveFilters =
    Boolean(filters.category) ||
    Boolean(filters.keyword.trim()) ||
    Boolean(filters.penulis.trim()) ||
    Boolean(filters.formatFile) ||
    Boolean(filters.minYear) ||
    Boolean(filters.maxYear) ||
    filters.hasAbstract ||
    filters.hasFile ||
    filters.savedOnly ||
    filters.sortBy !== 'views' ||
    filters.sortOrder !== 'DESC';

  return (
    <div>
      <h1 className="sr-only">Katalog Jurnal SukaBaca</h1>

      {/* Catalog Search Slip */}
      <form className="search-slip" onSubmit={handleSubmitSearch} aria-label="Slip pencarian katalog">
        <div className="search-primary-row">
          <div className="field-group">
            <label htmlFor="catalog-keyword" className="sr-only">
              Kata kunci judul, penulis, atau abstrak
            </label>
            <input
              id="catalog-keyword"
              type="search"
              className="field-input"
              placeholder="Ketik judul, penulis, atau topik katalog..."
              value={filters.keyword}
              onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Search size={16} aria-hidden="true" />
            <span>Cari</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowAdvanced((prev) => !prev)}
            aria-expanded={showAdvanced}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span>{showAdvanced ? 'Tutup Filter' : 'Filter'}</span>
          </button>
        </div>

        <SmoothCollapse open={showAdvanced} innerClassName="search-advanced-panel">
          <div className="search-advanced-grid">
              <div className="field-group">
                <label htmlFor="filter-category" className="field-label">
                  Kategori
                </label>
                <select
                  id="filter-category"
                  className="field-select"
                  value={filters.category}
                  onChange={(e) => {
                    const next = { ...filters, category: e.target.value };
                    setFilters(next);
                    runSearch(next);
                  }}
                >
                  <option value="">Semua Kategori</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label htmlFor="filter-penulis" className="field-label">
                  Penulis
                </label>
                <input
                  id="filter-penulis"
                  type="text"
                  className="field-input"
                  placeholder="Nama penulis..."
                  value={filters.penulis}
                  onChange={(e) => setFilters((prev) => ({ ...prev, penulis: e.target.value }))}
                />
              </div>

              <div className="field-group">
                <label htmlFor="filter-format" className="field-label">
                  Format Berkas
                </label>
                <select
                  id="filter-format"
                  className="field-select"
                  value={filters.formatFile}
                  onChange={(e) => setFilters((prev) => ({ ...prev, formatFile: e.target.value }))}
                >
                  <option value="">Semua Format</option>
                  <option value="PDF">PDF</option>
                  <option value="DOCX">DOCX</option>
                  <option value="DOC">DOC</option>
                  <option value="TXT">TXT</option>
                </select>
              </div>

              <div className="field-group">
                <label htmlFor="filter-min-year" className="field-label">
                  Tahun Mulai
                </label>
                <input
                  id="filter-min-year"
                  type="number"
                  min="1900"
                  max="2099"
                  className="field-input tabular"
                  placeholder="mis. 2020"
                  value={filters.minYear}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minYear: e.target.value }))}
                />
              </div>

              <div className="field-group">
                <label htmlFor="filter-max-year" className="field-label">
                  Tahun Akhir
                </label>
                <input
                  id="filter-max-year"
                  type="number"
                  min="1900"
                  max="2099"
                  className="field-input tabular"
                  placeholder="mis. 2026"
                  value={filters.maxYear}
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxYear: e.target.value }))}
                />
              </div>

              <div className="field-group">
                <label htmlFor="filter-sort-by" className="field-label">
                  Urutkan Menurut
                </label>
                <select
                  id="filter-sort-by"
                  className="field-select"
                  value={filters.sortBy}
                  onChange={(e) => {
                    const next = { ...filters, sortBy: e.target.value };
                    setFilters(next);
                    runSearch(next);
                  }}
                >
                  <option value="views">Terbanyak Dibaca</option>
                  <option value="download">Terbanyak Diunduh</option>
                  <option value="date">Tahun Terbit</option>
                  <option value="rating">Rating Pembaca</option>
                  <option value="title">Abjad Judul</option>
                </select>
              </div>

              <div className="field-group">
                <label htmlFor="filter-sort-order" className="field-label">
                  Arah Urutan
                </label>
                <select
                  id="filter-sort-order"
                  className="field-select"
                  value={filters.sortOrder}
                  onChange={(e) => {
                    const next = { ...filters, sortOrder: e.target.value };
                    setFilters(next);
                    runSearch(next);
                  }}
                >
                  <option value="DESC">Menurun (Tertinggi / Terbaru)</option>
                  <option value="ASC">Menaik (Terendah / A–Z)</option>
                </select>
              </div>
            </div>

            <div className="search-checks-row">
              <div className="search-checks-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.hasAbstract}
                    onChange={(e) => {
                      const next = { ...filters, hasAbstract: e.target.checked };
                      setFilters(next);
                      runSearch(next);
                    }}
                  />
                  <span>Punya Abstrak</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.hasFile}
                    onChange={(e) => {
                      const next = { ...filters, hasFile: e.target.checked };
                      setFilters(next);
                      runSearch(next);
                    }}
                  />
                  <span>Punya Lampiran Berkas</span>
                </label>

                <label
                  className={`checkbox-label${!isAuthenticated ? ' is-disabled' : ''}`}
                  title={!isAuthenticated ? 'Masuk untuk menyaring kartu tersimpan' : undefined}
                >
                  <input
                    type="checkbox"
                    disabled={!isAuthenticated}
                    checked={filters.savedOnly}
                    onChange={(e) => setFilters((prev) => ({ ...prev, savedOnly: e.target.checked }))}
                  />
                  <span>Hanya Tersimpan</span>
                </label>
              </div>

              {hasActiveFilters && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleReset}>
                  <RotateCcw size={14} aria-hidden="true" />
                  <span>Reset Slip</span>
                </button>
              )}
            </div>
        </SmoothCollapse>

        {yearEntries.length > 0 && (
          <div className="year-bar" aria-label="Saring berdasarkan tahun terbit">
            <span className="field-label">Indeks Tahun:</span>
            {yearEntries.map(([year, count]) => {
              const active = filters.minYear === year && filters.maxYear === year;
              return (
                <button
                  key={year}
                  type="button"
                  className={`year-chip${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => handleYearChip(year)}
                >
                  {year} ({count})
                </button>
              );
            })}
          </div>
        )}
      </form>

      <SmoothCollapse open={Boolean(error)}>
        <div className="alert-slip is-error" role="alert" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Gagal membaca katalog:</strong> {error}
          </div>
        </div>
      </SmoothCollapse>

      {loading ? (
        <div className="loading-strip" role="status" aria-live="polite">
          <Loader2 size={18} className="spin-icon" aria-hidden="true" />
          <span>Menata buku pada rak katalog...</span>
        </div>
      ) : (
        <BookshelfView
          journals={displayedJournals}
          onToggleSave={handleToggleSave}
          busySaveId={busySaveId}
        />
      )}
    </div>
  );
}
