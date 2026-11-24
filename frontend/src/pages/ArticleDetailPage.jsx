import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Download,
  Eye,
  ArrowLeft,
  Sparkles,
  FileText,
  Bookmark,
  FileDown
} from 'lucide-react';
import Header from '../components/layout/Header';
import ReviewSection from '../components/journal/ReviewSection';
import { Badge, Skeleton } from '../components/common/UIPrimitives';
import { journalService } from '../services/journal.service';
import { reviewService } from '../services/review.service';
import { useAuth } from '../context/AuthContext';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [downloading, setDownloading] = useState(false);
  const [downloadingSummary, setDownloadingSummary] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadArticle = async () => {
      try {
        const item = await journalService.getJournalById(id);
        if (!isMounted) return;
        setJournal(item);

        if (item) {
          const [aiSum, revs] = await Promise.all([
            journalService.getAiSummary(id),
            reviewService.getReviewsByJournal(id)
          ]);
          if (!isMounted) return;
          setSummary(aiSum);
          setReviewsData(revs);
        }
      } catch {
        if (isMounted) setJournal(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadArticle();
    return () => { isMounted = false; };
  }, [id]);

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await journalService.toggleBookmark(id, Boolean(journal?.isSaved));
      setJournal((prev) => (prev ? { ...prev, isSaved: !prev.isSaved } : prev));
    } catch {
      // Ignore
    }
  };

  const handleDownloadOriginal = async () => {
    if (!journal?.fileName) return;
    setDownloading(true);
    try {
      await journalService.downloadJournal(journal.id, journal.fileName);
      setJournal((prev) => (prev ? { ...prev, download: (Number(prev.download) || 0) + 1 } : prev));
    } catch {
      // Ignore
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSummaryPdf = async () => {
    setDownloadingSummary(true);
    try {
      await journalService.downloadSummaryPdf(journal.id, journal.title);
    } catch {
      // Ignore
    } finally {
      setDownloadingSummary(false);
    }
  };

  const handleAddReview = async ({ rating, komentar, author }) => {
    await reviewService.addReview({
      journalId: Number(id),
      rating,
      komentar,
      author: author || user || 'Pengguna'
    });
    const updated = await reviewService.getReviewsByJournal(id);
    setReviewsData(updated);
  };

  const handleDeleteReview = async (reviewId) => {
    await reviewService.deleteReview(reviewId);
    const updated = await reviewService.getReviewsByJournal(id);
    setReviewsData(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-8 w-full space-y-6">
          <Skeleton className="w-24 h-8" />
          <div className="p-8 border border-[#E2E8F0] space-y-4">
            <Skeleton className="w-40 h-6" />
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-full h-32" />
          </div>
        </main>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-[#0F172A]">Publikasi Tidak Ditemukan</h2>
          <p className="text-xs text-[#64748B]">Artikel jurnal yang Anda tuju mungkin telah dihapus atau dipindahkan.</p>
          <button onClick={() => navigate('/search')} className="dokmeh-btn-primary">
            Kembali ke Pencarian
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#334155] font-sans selection:bg-[#0593C6] selection:text-white">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-8 w-full space-y-8">
        
        {/* Navigation Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="dokmeh-btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Kembali</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              className={`p-2 border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                journal.isSaved
                  ? 'bg-[#D83995]/10 border-[#D83995] text-[#D83995] shadow-hard-sm'
                  : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] hover:border-[#0F172A]'
              }`}
              title="Simpan Jurnal"
            >
              <Bookmark size={14} fill={journal.isSaved ? 'currentColor' : 'none'} />
              <span>{journal.isSaved ? 'Tersimpan' : 'Simpan'}</span>
            </button>

            {journal.fileName && (
              <button
                onClick={() => navigate(`/view/${journal.id}`)}
                className="dokmeh-btn-secondary !py-2 !px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <FileText size={14} />
                <span>Buka Reader</span>
              </button>
            )}

            {journal.fileName && (
              <button
                onClick={handleDownloadOriginal}
                disabled={downloading}
                className="dokmeh-btn-primary !py-2 !px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>{downloading ? 'Mengunduh...' : 'Unduh Berkas'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Article Primary Overview Card */}
        <article className="p-6 sm:p-10 space-y-6 bg-[#FFFFFF] border-2 border-[#0F172A] shadow-hard">
          
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">
              {journal.category || 'Umum'}
            </Badge>
            <Badge variant="accent">
              {journal.formatFile || 'PDF'}
            </Badge>
            <span className="font-mono text-xs text-[#64748B] tabular-nums">
              Tahun: {journal.year}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-snug">
            {journal.title}
          </h1>

          {/* Author & Stats Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-[#E2E8F0] text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center font-mono">
                {(journal.author || 'P')[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#0F172A]">{journal.author || 'Anonim'}</span>
                <span className="text-[11px] text-[#64748B] uppercase font-mono">Verified Scholar</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[#64748B] font-mono tabular-nums">
              <span className="flex items-center gap-1">
                <Eye size={13} className="text-[#0593C6]" />
                {journal.views} Views
              </span>
              <span className="flex items-center gap-1">
                <Download size={13} className="text-[#0593C6]" />
                {journal.download} Downloads
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <Star size={13} fill="currentColor" />
                {reviewsData.averageRating.toFixed(1)} ({reviewsData.totalReviews} ulasan)
              </span>
            </div>
          </div>

          {/* Abstract or Content */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
              Abstrak Publikasi
            </h3>
            <p className="text-sm sm:text-base text-[#334155] leading-relaxed whitespace-pre-line">
              {journal.abstract || journal.content || 'Tidak ada naskah teks tertulis langsung untuk jurnal ini. Silakan baca melalui berkas terlampir.'}
            </p>
          </div>

        </article>

        {/* AI Semantic Summary Card */}
        <section className="p-6 sm:p-8 space-y-4 bg-[#F8FAFC] border border-[#CBD5E1] shadow-hard-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#FFFFFF] border border-[#0F172A] text-[#0593C6]">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  Ringkasan Eksekutif Saintifik (AI Generated)
                </h3>
                <span className="text-xs text-[#64748B]">
                  Disintesis secara otomatis menggunakan model inferensi akademik NVIDIA.
                </span>
              </div>
            </div>

            <button
              onClick={handleDownloadSummaryPdf}
              disabled={downloadingSummary}
              className="dokmeh-btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <FileDown size={14} />
              <span>{downloadingSummary ? 'Mengekspor...' : 'Unduh Ringkasan PDF'}</span>
            </button>
          </div>

          <div className="text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-line bg-[#FFFFFF] p-5 border border-[#CBD5E1]">
            {summary?.content || summary?.ringkasan || 'Ringkasan AI belum di-generate atau sedang diproses. Anda dapat mengunduh berkas ringkasan saat siap.'}
          </div>
        </section>

        {/* Peer Reviews & Ratings Section */}
        <ReviewSection
          reviews={reviewsData.reviews}
          averageRating={reviewsData.averageRating}
          totalReviews={reviewsData.totalReviews}
          onAddReview={handleAddReview}
          onDeleteReview={handleDeleteReview}
        />

      </main>
    </div>
  );
}
