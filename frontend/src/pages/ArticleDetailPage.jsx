import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Download, Eye, Calendar, User, Send, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import { store } from '../services/store';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const journalId = id || 1;

  const [journal, setJournal] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({ avg: 5.0, count: 0 });

  // Review Form State
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const data = store.getJournalById(journalId);
    setJournal(data);
    store.incrementView(journalId);

    const revs = store.getReviews(journalId);
    setReviews(revs);
    setRatingStats(store.getAverageRating(journalId));

    const auth = store.getAuth();
    if (auth.user) {
      setReviewerName(auth.user);
    }
  }, [journalId]);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const author = reviewerName.trim() || 'Glen';
    const newRev = store.addReview({
      journalId: Number(journalId),
      author,
      rating: userRating,
      komentar: comment.trim()
    });

    setReviews([newRev, ...reviews]);
    setRatingStats(store.getAverageRating(journalId));
    setComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const handleDownload = () => {
    store.incrementDownload(journalId);
    const updated = store.getJournalById(journalId);
    setJournal(updated);

    // Trigger mock/real file download of the summary
    const element = document.createElement("a");
    const file = new Blob([
      `===================================================\n` +
      `RINGKASAN JURNAL AKADEMIK - SUKABACA\n` +
      `===================================================\n\n` +
      `Judul: ${journal?.title || 'Jurnal'}\n` +
      `Penulis: ${journal?.author || 'Penulis'}\n` +
      `Tanggal: ${journal?.date || '2026'}\n` +
      `Format: ${journal?.formatFile || 'PDF'}\n\n` +
      `Ringkasan Eksekutif:\n` +
      `${journal?.content || 'Konten ringkasan...'}\n\n` +
      `Dihasilkan secara otomatis oleh SukaBaca AI Engine.`
    ], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Ringkasan_${(journal?.title || 'Jurnal').slice(0, 20).replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  if (!journal) return null;

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen pb-20">
      {/* Top Navbar */}
      <Navbar variant="with-back" />

      {/* Article Content Container */}
      <article className="max-w-2xl mx-auto px-5 sm:px-8 w-full mt-3">
        {/* Date & Metadata Badge */}
        <div className="flex items-center justify-center gap-2 mb-2 flex-wrap text-xs text-gray-500 font-medium">
          <span className="flex items-center gap-1">
            <Calendar size={13} />
            {journal.date || 'Januari 2026'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
            <Sparkles size={12} />
            AI Ringkasan Terverifikasi
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 text-center tracking-tight mb-2 leading-snug">
          {journal.title}
        </h1>

        {/* Author & Stats Row */}
        <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-gray-600 font-medium mb-6 flex-wrap">
          <span className="flex items-center gap-1.5">
            <User size={15} className="text-gray-500" />
            Penulis: <strong className="text-gray-800">{journal.author}</strong>
          </span>
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Star size={15} fill="currentColor" />
            {ratingStats.avg} ({ratingStats.count} ulasan)
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <Eye size={14} />
            {journal.views || 0} dilihat
          </span>
        </div>

        {/* Action Bar (Download & Read) */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={handleDownload}
            className="py-2.5 px-5 rounded-xl text-white font-semibold text-xs sm:text-sm shadow hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
            style={{
              background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
              border: '1px solid #333333'
            }}
          >
            <Download size={16} strokeWidth={2.5} />
            <span>Unduh Ringkasan (.txt)</span>
          </button>

          {downloadSuccess && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-fade-in">
              <CheckCircle2 size={16} /> Berhasil diunduh!
            </span>
          )}
        </div>

        {/* Cover Graphic Banner */}
        <div className="w-full rounded-2xl overflow-hidden mb-8 shadow-sm border border-gray-100 bg-gradient-to-br from-[#fde2e4] via-[#e2ece9] to-[#dfe7fd] flex items-center justify-center p-6 sm:p-8">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
            {/* Abstract floral illustration */}
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm">
              <circle cx="80" cy="70" r="35" fill="#52796f" opacity="0.8" />
              <circle cx="120" cy="70" r="35" fill="#4ea8de" opacity="0.8" />
              <circle cx="100" cy="95" r="35" fill="#b5e48c" opacity="0.8" />
              <circle cx="100" cy="60" r="28" fill="#d9ed92" opacity="0.9" />
              <rect x="96" y="95" width="8" height="75" fill="#2d6a4f" rx="4" />
              <path d="M96 130 C70 120, 65 145, 96 145 Z" fill="#74c69d" />
              <path d="M104 140 C130 130, 135 155, 104 155 Z" fill="#74c69d" />
              <path d="M140 65 Q150 55 160 65 Q170 55 180 65 Q185 75 175 80 Q165 85 140 80 Z" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Structured Sections */}
        <section className="mb-8 bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
          <h2 className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles size={16} className="text-purple-600" />
            Ringkasan Eksekutif AI
          </h2>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal">
            {journal.content || journal.snippet}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-950 mb-2 tracking-tight">
            Metodologi & Pengujian
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
            Penelitian ini menerapkan kerangka kerja analitis dengan parameter pengujian terukur. Evaluasi dilakukan secara berulang untuk memvalidasi hipotesis awal dengan derajat akurasi tinggi serta meminimalkan bias eksperimental.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-950 mb-2 tracking-tight">
            Kesimpulan & Implikasi Praktis
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
            Hasil pengujian menunjukkan keselarasan yang konsisten dengan teori dasar. Rekomendasi praktis ditujukan bagi peneliti dan praktisi untuk mengadopsi standar pengujian yang lebih komprehensif dalam implementasi perangkat lunak maupun rekayasa sistem.
          </p>
        </section>

        <hr className="border-gray-200 mb-10" />

        {/* NEW FEATURE: Review & Rating Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
                <MessageSquare size={20} className="text-purple-600" />
                Ulasan & Rating Pembaca
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Berdasarkan feedback mahasiswa dan akademisi IMPAL
              </p>
            </div>

            {/* Average Rating Pill */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500 text-lg font-black">
                <Star size={20} fill="currentColor" />
                {ratingStats.avg}
              </div>
              <span className="text-[10px] text-gray-500 font-semibold">
                {ratingStats.count} Total Ulasan
              </span>
            </div>
          </div>

          {/* Add Review Form */}
          <form onSubmit={handleAddReview} className="bg-[#fafafa] border border-gray-200 rounded-2xl p-5 mb-8 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              Tulis Ulasan Anda
            </h3>

            {/* Interactive Star Rating Picker */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-gray-600">Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={24}
                      className={
                        (hoverRating || userRating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-600 ml-2">
                {userRating} / 5 Bintang
              </span>
            </div>

            {/* Comment Textarea */}
            <div className="mb-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Bagikan pandangan Anda mengenai jurnal atau ringkasan ini..."
                rows={3}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition-all placeholder-gray-400 bg-white"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                Masuk sebagai: <strong>{reviewerName || 'Glen'}</strong>
              </span>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-white font-semibold text-xs shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
                style={{
                  background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
                }}
              >
                <Send size={14} />
                <span>Kirim Ulasan</span>
              </button>
            </div>

            {reviewSubmitted && (
              <div className="mt-3 p-2 bg-emerald-50 text-emerald-700 text-xs rounded-lg text-center font-medium border border-emerald-200">
                Ulasan Anda berhasil disimpan!
              </div>
            )}
          </form>

          {/* Reviews List */}
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                      {rev.author.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block leading-tight">
                        {rev.author}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {rev.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Stars display */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < rev.rating ? 'currentColor' : 'none'}
                        className={i < rev.rating ? 'text-amber-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed pl-9">
                  {rev.komentar}
                </p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
