import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, Bookmark } from 'lucide-react';
import { Badge } from '../common/UIPrimitives';

export default function JournalCard({ journal, onToggleBookmark, onDownload }) {
  const navigate = useNavigate();

  const handleOpenDetail = () => {
    navigate(`/article/${journal.id}`);
  };

  return (
    <article className="dokmeh-card p-5 sm:p-6 transition-all border border-[#CBD5E1] hover:border-[#0F172A] hover:shadow-hard group relative bg-[#FFFFFF]">
      {/* Top Metadata Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Sharp Badge Category */}
          <Badge variant="primary">
            {journal.category || 'Academic'}
          </Badge>

          <Badge variant="accent">
            {journal.formatFile || 'PDF'}
          </Badge>

          <span className="font-mono text-xs text-[#64748B] tabular-nums">
            {journal.year || '2026'}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {onToggleBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(journal.id);
              }}
              className={`p-1.5 border transition-all ${
                journal.isSaved
                  ? 'bg-[#D83995]/10 border-[#D83995] text-[#D83995] shadow-hard-sm'
                  : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#94A3B8] hover:text-[#0F172A] hover:border-[#0F172A]'
              }`}
              title={journal.isSaved ? 'Hapus Simpan' : 'Simpan Jurnal'}
            >
              <Bookmark size={14} fill={journal.isSaved ? 'currentColor' : 'none'} />
            </button>
          )}

          {journal.fileName && onDownload && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(journal.id, journal.fileName);
              }}
              className="p-1.5 border border-[#CBD5E1] bg-[#FFFFFF] text-[#64748B] hover:text-[#0593C6] hover:border-[#0593C6] transition-colors"
              title="Unduh Berkas Jurnal"
            >
              <Download size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        onClick={handleOpenDetail}
        className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-[#0593C6] transition-colors leading-snug mb-2 cursor-pointer"
      >
        {journal.title}
      </h3>

      {/* Abstract / Snippet */}
      <p className="text-xs sm:text-sm text-[#334155] leading-relaxed mb-4 line-clamp-3">
        {journal.abstract || journal.snippet || journal.content}
      </p>

      {/* Footer Details */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-[#E2E8F0] text-xs">
        <div className="flex items-center gap-2 text-[#334155] font-medium">
          <span className="text-[#0F172A] font-semibold">{journal.author || 'Anonim'}</span>
          <span className="text-[#CBD5E1]">•</span>
          <span className="text-[#64748B] text-[11px] uppercase tracking-wider">SukaBaca Repository</span>
        </div>

        <div className="flex items-center gap-4 text-[#64748B]">
          <span className="font-mono text-xs flex items-center gap-1 text-[#0F172A] tabular-nums">
            <Eye size={13} className="text-[#64748B]" />
            {journal.views} views
          </span>

          <span className="font-mono text-xs flex items-center gap-1 text-[#0F172A] tabular-nums">
            <Download size={13} className="text-[#64748B]" />
            {journal.download} downloads
          </span>

          <button
            type="button"
            onClick={handleOpenDetail}
            className="text-[#0593C6] hover:underline font-bold text-xs"
          >
            Baca Jurnal →
          </button>
        </div>
      </div>
    </article>
  );
}
