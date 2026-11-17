import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, Download, Sparkles, FileText, Calendar, User, Tag, AlertCircle, CheckCircle2, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import ModalConfirm from '../components/ModalConfirm';
import { store } from '../services/store';

const AI_MODELS = ['SukaBaca AI Engine', 'Gemini 1.5 Flash', 'DeepSeek-R1 Academic'];
const PREVIEWABLE = ['pdf', 'txt'];

const getExtension = (name) => (name && name.includes('.') ? name.split('.').pop().toLowerCase() : '');

export default function JournalViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(store.getSubscription());
  const [hasSummary, setHasSummary] = useState(false);
  const [ratingStats, setRatingStats] = useState({ avg: 0, count: 0 });
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [modalStep, setModalStep] = useState(0);
  const [summarizing, setSummarizing] = useState(false);
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const [summarizeError, setSummarizeError] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const load = async () => {
      const data = await store.fetchJournalById(id);
      if (!isMounted) return;
      if (!data) {
        setJournal(null);
        setLoading(false);
        return;
      }
      store.apiRecordView(id);
      setJournal({ ...data, views: (Number(data.views) || 0) + 1 });
      setLoading(false);
      const [sub, summary, revsData] = await Promise.all([
        store.fetchSubscription(),
        store.fetchRingkasan(id),
        store.fetchReviews(id)
      ]);
      if (!isMounted) return;
      setSubscription(sub);
      setHasSummary(!!summary);
      if (revsData) {
        setRatingStats({ avg: revsData.averageRating, count: revsData.totalReviews });
      }
    };
    load();
    return () => { isMounted = false; };
  }, [id]);

  const handleDownload = async () => {
    if (!journal) return;
    const element = document.createElement('a');
    let objectUrl = null;

    if (journal.fileName) {
      element.href = store.getJournalFileUrl(journal.id, true);
      element.download = journal.fileName;
    } else {
      const file = new Blob([
        `${journal.title}\n` +
        `Penulis: ${journal.author}\n` +
        `Kategori: ${journal.category}\n` +
        `Tahun: ${journal.year || '2026'}\n\n` +
        `Abstrak:\n${journal.abstract || journal.snippet || ''}\n\n` +
        `Isi Dokumen:\n${journal.content || ''}\n`
      ], { type: 'text/plain;charset=utf-8' });
      objectUrl = URL.createObjectURL(file);
      element.href = objectUrl;
      element.download = `${journal.title.slice(0, 40).replace(/\s+/g, '_')}.txt`;
    }

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    if (objectUrl) {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }

    await store.apiRecordDownload(journal.id);
    setJournal((prev) => ({ ...prev, download: (Number(prev.download) || 0) + 1 }));
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const remainingQuota = Math.max(0, subscription.dailyQuota - subscription.usedToday);

  const handleSummarizeClick = () => {
    setSummarizeError('');
    if (remainingQuota <= 0) {
      setQuotaExhausted(true);
      return;
    }
    setQuotaExhausted(false);
    setModalStep(1);
  };

  const handleConfirmSummarize = async () => {
    if (summarizing) return;
    setSummarizing(true);
    setSummarizeError('');
    try {
      const quota = await store.useAiQuota();
      if (!quota.success) {
        setModalStep(0);
        setQuotaExhausted(true);
        return;
      }
      await store.apiSummarizeJournal(journal.id, selectedModel);
      setSubscription(store.getSubscription());
      setHasSummary(true);
      setModalStep(2);
    } catch (err) {
      setModalStep(0);
      setSummarizeError(err.message || 'Gagal membuat ringkasan');
    } finally {
      setSummarizing(false);
    }
  };

  const handleViewSummary = () => {
    setModalStep(0);
    navigate(`/article/${journal.id}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-[#ededed] min-h-screen pb-16">
        <Navbar variant="with-back" />
        <main className="page-enter w-full max-w-4xl mx-auto px-4 sm:px-8 mt-6">
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-sm font-semibold text-gray-500">Memuat jurnal dari database...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="flex-1 flex flex-col bg-[#ededed] min-h-screen pb-16">
        <Navbar variant="with-back" />
        <main className="page-enter w-full max-w-2xl mx-auto px-4 sm:px-8 mt-6">
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-8 sm:p-10 text-center">
            <FileText size={44} className="mx-auto text-purple-400 mb-3" strokeWidth={1.6} />
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">
              Maaf, jurnal tidak ditemukan
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mb-6">
              Data jurnal tidak tersedia atau telah dihapus dari database.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/search')}
                className="py-2.5 px-5 rounded-xl text-white font-bold text-xs sm:text-sm shadow hover:opacity-95 active:scale-95"
                style={{
                  background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
                  border: '1px solid #333333'
                }}
              >
                Cari Jurnal
              </button>
              <button
                type="button"
                onClick={() => navigate('/upload-form')}
                className="py-2.5 px-5 rounded-xl bg-white hover:bg-gray-50 text-gray-900 font-bold text-xs sm:text-sm shadow border border-purple-400 active:scale-95"
              >
                Unggah Jurnal
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const extension = getExtension(journal.fileName);
  const canPreviewFile = journal.fileName && PREVIEWABLE.includes(extension);
  const abstractText = journal.abstract || journal.content || journal.snippet;

  return (
    <div className="flex-1 flex flex-col bg-[#ededed] min-h-screen pb-16">
      <Navbar variant="with-back" />

      <main className="page-enter w-full max-w-4xl mx-auto px-4 sm:px-8 mt-1 space-y-5">
        <header className="section-enter bg-white rounded-[28px] border border-gray-100 shadow-sm p-5 sm:p-7">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full">
              Article
            </span>
            <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
              {journal.formatFile || 'PDF'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight leading-snug mb-4 break-words">
            {journal.title}
          </h1>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-5">
            <div className="flex items-start gap-2 min-w-0">
              <User size={15} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <dt className="font-semibold text-gray-500">Penulis</dt>
                <dd className="font-bold text-gray-900 break-words">{journal.author}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <Calendar size={15} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <dt className="font-semibold text-gray-500">Tahun</dt>
                <dd className="font-bold text-gray-900">{journal.year || journal.date}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <Tag size={15} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <dt className="font-semibold text-gray-500">Kategori</dt>
                <dd className="font-bold text-gray-900 break-words">{journal.category}</dd>
              </div>
            </div>
          </dl>

          <div className="flex items-center gap-5 text-xs text-gray-600 font-semibold mb-5 pt-4 border-t border-gray-100 flex-wrap">
            <span className="flex items-center gap-1.5" aria-label={`${journal.views || 0} kali dilihat`}>
              <Eye size={16} className="text-gray-500" />
              <strong className="text-gray-900">{journal.views || 0}</strong> dilihat
            </span>
            <span className="flex items-center gap-1.5" aria-label={`${journal.download || 0} kali diunduh`}>
              <Download size={16} className="text-gray-500" />
              <strong className="text-gray-900">{journal.download || 0}</strong> diunduh
            </span>
            {ratingStats.count > 0 && (
              <span className="flex items-center gap-1.5 text-amber-500" aria-label={`Rating ${ratingStats.avg} dari ${ratingStats.count} ulasan`}>
                <Star size={15} fill="currentColor" />
                <strong className="text-gray-900">{ratingStats.avg}</strong>
                <span className="text-gray-500 font-normal">({ratingStats.count} ulasan)</span>
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="py-2.5 px-5 rounded-xl bg-white hover:bg-gray-50 text-gray-900 font-bold text-xs sm:text-sm shadow border border-purple-400 active:scale-95 flex items-center justify-center gap-2"
            >
              <Download size={16} strokeWidth={2.5} />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={handleSummarizeClick}
              className="py-2.5 px-5 rounded-xl text-white font-bold text-xs sm:text-sm shadow hover:opacity-95 active:scale-95 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
                border: '1px solid #333333'
              }}
            >
              <Sparkles size={16} strokeWidth={2.5} />
              <span>Summarize with AI</span>
            </button>

            <label className="flex items-center gap-2 text-[11px] font-semibold text-gray-600 sm:ml-auto">
              <span>Model AI</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-2.5 py-2 text-xs rounded-xl border border-gray-300 focus:border-purple-600 outline-none bg-white text-gray-800 font-medium"
              >
                {AI_MODELS.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-3 flex items-center gap-3 flex-wrap text-[11px] font-medium text-gray-500" aria-live="polite">
            <span>Sisa kuota ringkasan: <strong className="text-purple-700">{remainingQuota}</strong></span>
            {hasSummary && (
              <button
                type="button"
                onClick={() => navigate(`/article/${journal.id}`)}
                className="text-purple-700 font-bold hover:underline"
              >
                Lihat ringkasan sebelumnya
              </button>
            )}
            {downloadSuccess && (
              <span className="text-emerald-600 font-semibold flex items-center gap-1 animate-fade-in">
                <CheckCircle2 size={14} /> Berhasil diunduh!
              </span>
            )}
          </div>

          {quotaExhausted && (
            <div role="alert" className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>Kuota harian ringkasan Anda telah habis atau Anda belum login.</span>
            </div>
          )}

          {summarizeError && (
            <div role="alert" className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{summarizeError}</span>
            </div>
          )}
        </header>

        <section aria-labelledby="abstract-heading" className="section-enter section-enter-1 bg-white rounded-[28px] border border-gray-100 shadow-sm p-5 sm:p-7">
          <h2 id="abstract-heading" className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-3">
            Abstract
          </h2>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line break-words">
            {abstractText}
          </p>
        </section>

        <section aria-labelledby="document-heading" className="section-enter section-enter-2 bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 sm:px-7 py-3.5 bg-gray-100 border-b border-gray-200 min-w-0">
            <FileText size={16} className="text-gray-600 flex-shrink-0" />
            <h2 id="document-heading" className="text-xs font-bold text-gray-800 truncate">
              {journal.fileName || 'Teks Dokumen'}
            </h2>
          </div>

          {canPreviewFile ? (
            <iframe
              src={store.getJournalFileUrl(journal.id)}
              title={`Dokumen ${journal.title}`}
              className="w-full h-[60vh] sm:h-[75vh] bg-white block"
            />
          ) : journal.fileName ? (
            <div className="px-5 sm:px-7 py-10 text-center">
              <FileText size={40} className="mx-auto text-gray-400 mb-3" strokeWidth={1.6} />
              <p className="text-sm font-bold text-gray-800 mb-1">Pratinjau tidak tersedia untuk format {extension.toUpperCase()}</p>
              <p className="text-xs text-gray-500">Gunakan tombol Download untuk membuka dokumen secara lengkap.</p>
            </div>
          ) : (
            <article className="px-5 sm:px-10 py-8 sm:py-10">
              <h3 className="text-base sm:text-lg font-extrabold text-gray-950 text-center leading-snug mb-2 break-words">
                {journal.title}
              </h3>
              <p className="text-xs text-gray-600 text-center mb-6">{journal.author}</p>
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line break-words">
                {journal.content || journal.snippet}
              </p>
            </article>
          )}
        </section>
      </main>

      <ModalConfirm
        isOpen={modalStep > 0}
        title={
          modalStep === 1
            ? `Apakah anda ingin meringkas <${journal.title}>?`
            : 'Jurnal sudah teringkas'
        }
        subtitle={
          modalStep === 1
            ? `Menggunakan ${selectedModel} untuk ekstraksi otomatis.`
            : 'Tampilkan hasil ringkasan sekarang?'
        }
        onConfirm={modalStep === 1 ? handleConfirmSummarize : handleViewSummary}
        onCancel={() => setModalStep(0)}
        confirmText="Ya"
        cancelText="Tidak"
      />
    </div>
  );
}
