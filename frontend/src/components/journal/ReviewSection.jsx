import React, { useState } from 'react';
import { Star, MessageSquare, Send, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ReviewSection({
  reviews = [],
  averageRating = 0,
  totalReviews = 0,
  onAddReview,
  onDeleteReview,
}) {
  const { isAuthenticated, user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const trimmed = comment.trim();
    if (trimmed.length < 3 || trimmed.length > 2000) {
      setErrorMsg('Komentar harus terdiri dari 3–2000 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      await onAddReview({
        author: user || 'Pengguna',
        rating,
        komentar: trimmed
      });
      setComment('');
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menambahkan ulasan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="dokmeh-card p-6 sm:p-8 space-y-6 border border-[#CBD5E1] bg-[#FFFFFF]">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F8FAFC] border border-[#CBD5E1] text-[#0593C6]">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
              Diskusi & Ulasan Rekan Sejawat
            </h3>
            <p className="text-xs text-[#64748B]">
              Berikan catatan evaluasi akademik dan penilaian kualitas riset.
            </p>
          </div>
        </div>

        {/* Rating summary */}
        <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 border border-[#CBD5E1]">
          <div className="flex items-center text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          <span className="font-mono font-bold text-xs text-[#0F172A] tabular-nums">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-xs text-[#64748B] tabular-nums">({totalReviews})</span>
        </div>
      </div>

      {/* Review Submission Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider font-mono">
              Beri Penilaian Publikasi:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-amber-500 hover:scale-110 transition-transform p-0.5"
                >
                  <Star
                    size={18}
                    fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tulis ulasan konstruktif, metodologi, atau pertanyaan akademik..."
            className="dokmeh-input resize-none bg-white"
            required
          />

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-600 p-2 bg-red-50 border border-red-200">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 p-2 bg-emerald-50 border border-emerald-300">
              <CheckCircle2 size={14} />
              <span>Ulasan Anda berhasil diterbitkan.</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="dokmeh-btn-primary !py-1.5 !px-4 text-xs font-semibold"
            >
              <Send size={13} />
              <span>{submitting ? 'Mengirim...' : 'Kirim Ulasan'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] text-center text-xs text-[#64748B]">
          Silakan masuk ke akun Anda untuk meninggalkan ulasan akademik.
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3 pt-2">
        {reviews.length === 0 ? (
          <p className="text-xs text-[#64748B] text-center py-6 font-mono">
            Belum ada ulasan untuk publikasi ini.
          </p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 bg-[#FFFFFF] border border-[#CBD5E1] hover:border-[#0F172A] transition-all space-y-2 shadow-hard-sm"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#0F172A] text-white font-bold text-[10px] flex items-center justify-center font-mono">
                    {(rev.author || 'U')[0].toUpperCase()}
                  </div>
                  <span className="font-bold text-[#0F172A]">{rev.author || 'Pengguna'}</span>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        fill={s <= Number(rev.rating) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>

                {onDeleteReview && (rev.author === user || user === 'admin') && (
                  <button
                    onClick={() => onDeleteReview(rev.id)}
                    className="text-[#94A3B8] hover:text-red-600 p-1 transition-colors"
                    title="Hapus Ulasan"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                {rev.komentar}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
