import React, { useMemo } from 'react';
import { Star, Award, BarChart3, X } from 'lucide-react';

function computeClientRatingSummary(journals) {
  const distribution = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
  let totalReviews = 0;
  let totalScore = 0;
  let ratedJournalsCount = 0;

  journals.forEach((j) => {
    const count = Number(j.reviewCount) || 0;
    const avg = Number(j.rating) || 0;
    if (count > 0) {
      ratedJournalsCount += 1;
    }

    const dist = j.ratingDistribution;
    let distTotal = 0;
    if (dist && typeof dist === 'object') {
      [5, 4, 3, 2, 1].forEach((star) => {
        const c = Number(dist[String(star)]) || 0;
        distribution[String(star)] += c;
        totalScore += star * c;
        distTotal += c;
      });
    }

    if (distTotal > 0) {
      totalReviews += distTotal;
    } else if (count > 0 && avg > 0) {
      const rounded = Math.max(1, Math.min(5, Math.round(avg)));
      distribution[String(rounded)] += count;
      totalScore += avg * count;
      totalReviews += count;
    }
  });

  const averageRating = totalReviews > 0 ? Math.round((totalScore / totalReviews) * 10) / 10 : 0;

  return {
    averageRating,
    totalReviews,
    ratedJournalsCount,
    totalJournals: journals.length,
    distribution
  };
}

export default function RatingSummaryCard({
  journals = [],
  serverSummary = null,
  useClientFallback = false,
  minRating = '',
  onSelectMinRating,
  onOpenJournal
}) {
  const summary = useMemo(() => {
    if (!useClientFallback && serverSummary && typeof serverSummary === 'object') {
      return {
        averageRating: Number(serverSummary.averageRating) || 0,
        totalReviews: Number(serverSummary.totalReviews) || 0,
        ratedJournalsCount: Number(serverSummary.ratedJournalsCount) || 0,
        totalJournals: serverSummary.totalJournals != null ? Number(serverSummary.totalJournals) : journals.length,
        distribution: serverSummary.distribution || { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
      };
    }
    return computeClientRatingSummary(journals);
  }, [journals, serverSummary, useClientFallback]);

  const topRatedJournal = useMemo(() => {
    const rated = journals.filter((j) => Number(j.reviewCount) > 0 && Number(j.rating) > 0);
    if (rated.length === 0) return null;
    return rated.reduce((best, cur) => {
      if (cur.rating > best.rating) return cur;
      if (cur.rating === best.rating && cur.reviewCount > best.reviewCount) return cur;
      return best;
    }, rated[0]);
  }, [journals]);

  const stars = [5, 4, 3, 2, 1];

  return (
    <section className="p-4 sm:p-5 bg-[#F8FAFC] border border-[#CBD5E1] shadow-hard-sm space-y-4">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <BarChart3 size={15} className="text-[#0593C6]" />
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
            Ringkasan Rating Hasil Pencarian
          </h3>
        </div>

        {minRating && onSelectMinRating && (
          <button
            type="button"
            onClick={() => onSelectMinRating('')}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-bold bg-[#0F172A] text-white hover:bg-[#0593C6] transition-colors cursor-pointer"
            title="Hapus Filter Rating"
          >
            <span>Filter: {minRating}★+</span>
            <X size={11} />
          </button>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Aggregate Score */}
        <div className="md:col-span-4 p-4 bg-[#FFFFFF] border border-[#CBD5E1] flex flex-col items-center justify-center text-center space-y-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-[#0F172A] font-mono tabular-nums">
              {summary.averageRating.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[#64748B]">/ 5.0</span>
          </div>

          <div className="flex items-center gap-0.5 text-amber-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={15}
                fill={s <= Math.round(summary.averageRating) ? 'currentColor' : 'none'}
              />
            ))}
          </div>

          <p className="text-[11px] text-[#64748B] font-mono tabular-nums">
            <strong className="text-[#0F172A]">{summary.totalReviews}</strong> ulasan ·{' '}
            <strong className="text-[#0F172A]">{summary.ratedJournalsCount}</strong>/{summary.totalJournals} jurnal terulas
          </p>
        </div>

        {/* 5-to-1 Star Distribution */}
        <div className="md:col-span-8 space-y-1.5">
          {stars.map((star) => {
            const count = Number(summary.distribution?.[String(star)]) || 0;
            const percent = summary.totalReviews > 0 ? Math.round((count / summary.totalReviews) * 100) : 0;
            const isActiveFilter = String(minRating) === String(star);

            return (
              <button
                key={star}
                type="button"
                onClick={() => {
                  if (!onSelectMinRating) return;
                  onSelectMinRating(isActiveFilter ? '' : String(star));
                }}
                className={`w-full flex items-center gap-2.5 px-2 py-1 text-xs border transition-colors cursor-pointer ${
                  isActiveFilter
                    ? 'bg-[#FFFFFF] border-[#0F172A] shadow-hard-sm'
                    : 'bg-transparent border-transparent hover:bg-[#FFFFFF] hover:border-[#CBD5E1]'
                }`}
                title={`Filter jurnal dengan rating minimal ${star} bintang`}
              >
                <span className="w-10 flex items-center justify-end gap-1 font-mono font-bold text-[#0F172A] shrink-0 tabular-nums">
                  {star}
                  <Star size={11} className="text-amber-500" fill="currentColor" />
                </span>

                <div className="flex-1 h-2 bg-[#E2E8F0] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isActiveFilter ? 'bg-[#0593C6]' : 'bg-amber-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span className="w-16 text-right font-mono text-[11px] text-[#64748B] shrink-0 tabular-nums">
                  {count} ({percent}%)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Rated Highlight */}
      {topRatedJournal && (
        <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-700 font-mono text-[10px] font-bold uppercase shrink-0">
              <Award size={11} /> Rating Tertinggi
            </span>
            <button
              type="button"
              onClick={() => onOpenJournal?.(topRatedJournal.id)}
              className="font-semibold text-[#0F172A] hover:text-[#0593C6] hover:underline truncate text-left cursor-pointer"
            >
              {topRatedJournal.title}
            </button>
          </div>

          <span className="font-mono text-xs font-bold text-amber-600 flex items-center gap-1 shrink-0 tabular-nums">
            <Star size={12} fill="currentColor" />
            {Number(topRatedJournal.rating).toFixed(1)}
            <span className="text-[#64748B] font-normal">({topRatedJournal.reviewCount} ulasan)</span>
          </span>
        </div>
      )}
    </section>
  );
}
