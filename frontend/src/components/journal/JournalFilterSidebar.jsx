import React from 'react';
import { JOURNAL_CATEGORIES, FILE_FORMATS } from '../../config/app.config';

export default function JournalFilterSidebar({
  pubDateRange,
  setPubDateRange,
  customMinYear,
  setCustomMinYear,
  customMaxYear,
  setCustomMaxYear,
  onlyAbstract,
  setOnlyAbstract,
  onlyWithFile,
  setOnlyWithFile,
  selectedCategory,
  setSelectedCategory,
  selectedFormat,
  setSelectedFormat,
  yearCounts = {},
  onResetFilters,
}) {
  return (
    <aside className="p-5 bg-[#F8FAFC] border border-[#CBD5E1] shadow-hard-sm space-y-6 text-xs text-[#334155]">
      
      {/* 1. Header & Reset Action */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
          Filter Hasil
        </h4>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-[#0593C6] hover:underline cursor-pointer font-semibold text-[11px]"
        >
          Reset Semua
        </button>
      </div>

      {/* 2. Publication Date Range */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
          Tahun Publikasi
        </h4>
        <div className="space-y-1.5">
          <label className="dokmeh-radio-label">
            <input
              type="radio"
              name="pub_date"
              checked={pubDateRange === ''}
              onChange={() => setPubDateRange('')}
            />
            <span>Semua tahun</span>
          </label>

          <label className="dokmeh-radio-label">
            <input
              type="radio"
              name="pub_date"
              checked={pubDateRange === '1'}
              onChange={() => setPubDateRange('1')}
            />
            <span>1 tahun terakhir</span>
          </label>

          <label className="dokmeh-radio-label">
            <input
              type="radio"
              name="pub_date"
              checked={pubDateRange === '5'}
              onChange={() => setPubDateRange('5')}
            />
            <span>5 tahun terakhir</span>
          </label>

          <label className="dokmeh-radio-label">
            <input
              type="radio"
              name="pub_date"
              checked={pubDateRange === '10'}
              onChange={() => setPubDateRange('10')}
            />
            <span>10 tahun terakhir</span>
          </label>

          <label className="dokmeh-radio-label">
            <input
              type="radio"
              name="pub_date"
              checked={pubDateRange === 'custom'}
              onChange={() => setPubDateRange('custom')}
            />
            <span>Rentang Khusus</span>
          </label>
        </div>

        {pubDateRange === 'custom' && (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Dari"
              value={customMinYear}
              onChange={(e) => setCustomMinYear(e.target.value)}
              className="dokmeh-input !py-1 text-center font-mono text-xs tabular-nums"
              maxLength={4}
            />
            <span className="text-[#94A3B8]">—</span>
            <input
              type="text"
              placeholder="Sampai"
              value={customMaxYear}
              onChange={(e) => setCustomMaxYear(e.target.value)}
              className="dokmeh-input !py-1 text-center font-mono text-xs tabular-nums"
              maxLength={4}
            />
          </div>
        )}
      </div>

      {/* 3. Text & File Availability */}
      <div className="border-t border-[#E2E8F0] pt-4 space-y-2">
        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
          Ketersediaan Teks
        </h4>
        <div className="space-y-1.5">
          <label className="dokmeh-checkbox-label">
            <input
              type="checkbox"
              checked={onlyAbstract}
              onChange={(e) => setOnlyAbstract(e.target.checked)}
            />
            <span>Abstract tersedia</span>
          </label>

          <label className="dokmeh-checkbox-label">
            <input
              type="checkbox"
              checked={onlyWithFile}
              onChange={(e) => setOnlyWithFile(e.target.checked)}
            />
            <span>Berkas unduhan tersedia</span>
          </label>
        </div>
      </div>

      {/* 4. Category Filter */}
      <div className="border-t border-[#E2E8F0] pt-4 space-y-2">
        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
          Bidang Keilmuan
        </h4>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="dokmeh-select w-full"
        >
          <option value="">Semua Kategori</option>
          {JOURNAL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 5. Format Filter */}
      <div className="border-t border-[#E2E8F0] pt-4 space-y-2">
        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
          Format Berkas
        </h4>
        <div className="flex gap-2">
          {FILE_FORMATS.map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setSelectedFormat(fmt === 'ALL' ? '' : fmt)}
              className={`flex-1 py-1.5 text-xs font-semibold border transition-all ${
                (fmt === 'ALL' && !selectedFormat) || selectedFormat === fmt
                  ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-hard-sm'
                  : 'bg-[#FFFFFF] text-[#64748B] border-[#CBD5E1] hover:border-[#0F172A]'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Results By Year Counts */}
      {Object.keys(yearCounts).length > 0 && (
        <div className="border-t border-[#E2E8F0] pt-4">
          <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono mb-2">
            Statistik Publikasi
          </h4>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
            {Object.entries(yearCounts).map(([yr, count]) => (
              <div key={yr} className="flex items-center justify-between text-xs py-0.5">
                <span className="font-mono text-[#64748B] tabular-nums">{yr}</span>
                <span className="font-mono font-bold text-[#0F172A] bg-[#FFFFFF] px-1.5 border border-[#CBD5E1] tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </aside>
  );
}
