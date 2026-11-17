import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Eye,
  Download,
  Sparkles,
  FileText,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  Star,
  Bookmark,
  Pencil,
  Trash2,
  Loader2,
  Crown
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ModalConfirm from '../components/ModalConfirm';
import UpgradeModal from '../components/UpgradeModal';
import { store } from '../services/store';

const AI_MODELS = [
  { id: 'Basic SukaBaca AI', label: 'Basic SukaBaca AI', proOnly: false },
  { id: 'Pro SukaBaca AI', label: 'Pro SukaBaca AI', proOnly: true }
];
const PREVIEWABLE = ['pdf', 'txt'];

const getExtension = (name) => (name && name.includes('.') ? name.split('.').pop().toLowerCase() : '');

export default function JournalViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pollRef = useRef(null);

  const auth = store.getAuth();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(store.getSubscription());
  const [hasSummary, setHasSummary] = useState(false);
  const [ratingStats, setRatingStats] = useState({ avg: 0, count: 0 });
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [modalStep, setModalStep] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', author: '', category: '', publishDate: '', abstract: '' });
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [jobProgress, setJobProgress] = useState(null);
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const [summarizeError, setSummarizeError] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');

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
      setEditForm({
        title: data.title || '',
        author: data.author || '',
        category: data.category || '',
        publishDate: data.year || '2026',
        abstract: data.abstract || data.content || ''
      });
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
    return () => {
      isMounted = false;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [id]);

  const isPro = subscription.rawPlan === 'pro' || subscription.dailyQuota >= 999;
  const remainingQuota = Math.max(0, subscription.dailyQuota - subscription.usedToday);
  const canManage = auth.isAuthenticated && journal && (
    auth.profile?.role === 'admin' ||
    (journal.ownerId != null && String(journal.ownerId) === String(auth.profile?.userId))
  );

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

  const handleToggleSave = async () => {
    if (!auth.isAuthenticated || !store.getToken()) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (savingBookmark || !journal) return;
    setSavingBookmark(true);
    try {
      if (journal.isSaved) {
        await store.apiUnsaveJournal(journal.id);
        setJournal(prev => ({ ...prev, isSaved: false }));
      } else {
        await store.apiSaveJournal(journal.id);
        setJournal(prev => ({ ...prev, isSaved: true }));
      }
    } catch (err) {
      setSummarizeError(err.message || 'Gagal memperbarui bookmark');
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleSummarizeClick = () => {
    setSummarizeError('');
    if (!auth.isAuthenticated || !store.getToken()) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    const chosenModel = AI_MODELS.find(m => m.id === selectedModel);
    if (chosenModel?.proOnly && !isPro) {
      setShowUpgradeModal(true);
      return;
    }
    if (!isPro && remainingQuota <= 0) {
      setQuotaExhausted(true);
      return;
    }
    setQuotaExhausted(false);
    setModalStep(1);
  };

  const handleConfirmSummarize = async () => {
    if (summarizing) return;
    setModalStep(0);
    setSummarizing(true);
    setSummarizeError('');
    setJobProgress({ stage: 'QUEUED', currentPart: 0, totalParts: 1, message: 'Memulai ringkasan SukaBaca AI...' });

    try {
      const job = await store.apiStartSummarize(journal.id, selectedModel);
      setJobProgress(job);

      const pollOnce = async () => {
        try {
          const status = await store.apiGetSummarizeJob(job.jobId);
          setJobProgress(status);
          if (status.status === 'COMPLETED') {
            pollRef.current = null;
            setSummarizing(false);
            setSubscription(store.getSubscription());
            setHasSummary(true);
            setModalStep(2);
          } else if (status.status === 'FAILED') {
            pollRef.current = null;
            setSummarizing(false);
            setSummarizeError(status.error || 'Gagal memproses ringkasan AI');
          } else {
            pollRef.current = setTimeout(pollOnce, 800);
          }
        } catch (pollErr) {
          pollRef.current = null;
          setSummarizing(false);
          setSummarizeError(pollErr.message || 'Gagal memeriksa status ringkasan');
        }
      };

      pollRef.current = setTimeout(pollOnce, 800);
    } catch (err) {
      setSummarizing(false);
      setJobProgress(null);
      setSummarizeError(err.message || 'Gagal membuat ringkasan AI');
    }
  };

  const handleViewSummary = () => {
    setModalStep(0);
    navigate(`/article/${journal.id}`);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (editForm.title.trim().length < 3 || editForm.author.trim().length < 2 || editForm.category.trim().length < 2) {
      setEditError('Judul, penulis, dan kategori wajib diisi dengan benar');
      return;
    }
    if (!/^(19|20)\d{2}$/.test(editForm.publishDate.trim())) {
      setEditError('Tahun terbit harus 4 digit angka');
      return;
    }
    if (editForm.abstract.trim().length < 30) {
      setEditError('Abstrak minimal 30 karakter');
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await store.apiUpdateJournal(journal.id, {
        title: editForm.title.trim(),
        author: editForm.author.trim(),
        category: editForm.category.trim(),
        publishDate: editForm.publishDate.trim(),
        abstract: editForm.abstract.trim()
      });
      setJournal(prev => ({ ...prev, ...updated }));
      setEditing(false);
    } catch (err) {
      setEditError(err.message || 'Gagal memperbarui jurnal');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await store.apiDeleteJournal(journal.id);
      setDeleteConfirmOpen(false);
      navigate('/search');
    } catch (err) {
      setDeleteConfirmOpen(false);
      setSummarizeError(err.message || 'Gagal menghapus jurnal');
    }
  };

  const handleUpgrade = async () => {
    setUpgradeError('');
    try {
      const updated = await store.upgradeSubscription('Ultra Academic Pro');
      setSubscription(updated);
      setUpgradeSuccess(true);
      setTimeout(() => {
        setUpgradeSuccess(false);
        setShowUpgradeModal(false);
      }, 1200);
    } catch (err) {
      setUpgradeError(err.message || 'Gagal memperbarui langganan');
    }
  };

  const handleCancelPlan = async () => {
    if (!subscription.subscriptionId) return;
    setUpgradeError('');
    try {
      const updated = await store.apiCancelSubscription(subscription.subscriptionId);
      setSubscription(updated);
      setSelectedModel(AI_MODELS[0].id);
      setUpgradeSuccess(true);
      setTimeout(() => {
        setUpgradeSuccess(false);
        setShowUpgradeModal(false);
      }, 1200);
    } catch (err) {
      setUpgradeError(err.message || 'Gagal membatalkan langganan');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-[#ededed] min-h-screen pb-16">
        <Navbar variant="with-back" />
        <main className="page-enter w-full max-w-4xl mx-auto px-4 sm:px-8 mt-6">
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-sm font-semibold text-gray-500">Memuat dokumen...</p>
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
              Data jurnal tidak tersedia atau telah dihapus.
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
  const progressPercent = jobProgress && jobProgress.totalParts > 0
    ? Math.min(100, Math.max(10, Math.round((jobProgress.currentPart / jobProgress.totalParts) * 100)))
    : 15;

  return (
    <div className="flex-1 flex flex-col bg-[#ededed] min-h-screen pb-16">
      <Navbar variant="with-back" />

      <main className="page-enter w-full max-w-4xl mx-auto px-4 sm:px-8 mt-1 space-y-5">
        <header className="section-enter bg-white rounded-[28px] border border-gray-100 shadow-sm p-5 sm:p-7">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full">
                Article
              </span>
              <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                {journal.formatFile || 'PDF'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSave}
                disabled={savingBookmark}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 active:scale-95 ${
                  journal.isSaved
                    ? 'bg-purple-50 border-purple-400 text-purple-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bookmark size={14} fill={journal.isSaved ? 'currentColor' : 'none'} />
                <span>{journal.isSaved ? 'Tersimpan' : 'Simpan'}</span>
              </button>

              {canManage && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(prev => !prev)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-1 active:scale-95"
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-1 active:scale-95"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSaveEdit} className="space-y-3 mb-5 p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <h2 className="text-sm font-extrabold text-gray-900">Edit Detail Jurnal</h2>
              {editError && (
                <div role="alert" className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  {editError}
                </div>
              )}
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Judul jurnal"
                required
                minLength={3}
                maxLength={255}
                className="field-input"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={editForm.author}
                  onChange={(e) => setEditForm(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Penulis"
                  required
                  minLength={2}
                  maxLength={150}
                  className="field-input"
                />
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Kategori"
                  required
                  minLength={2}
                  maxLength={100}
                  className="field-input"
                />
                <input
                  type="text"
                  value={editForm.publishDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, publishDate: e.target.value }))}
                  placeholder="Tahun"
                  required
                  pattern="^(19|20)\d{2}$"
                  maxLength={4}
                  className="field-input"
                />
              </div>
              <textarea
                value={editForm.abstract}
                onChange={(e) => setEditForm(prev => ({ ...prev, abstract: e.target.value }))}
                rows={4}
                required
                minLength={30}
                maxLength={10000}
                className="field-input resize-y"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)' }}
                >
                  {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          ) : (
            <>
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
            </>
          )}

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
              disabled={summarizing}
              className="py-2.5 px-5 rounded-xl text-white font-bold text-xs sm:text-sm shadow hover:opacity-95 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
                border: '1px solid #333333'
              }}
            >
              {summarizing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} strokeWidth={2.5} />}
              <span>{summarizing ? 'Meringkas...' : 'Summarize with AI'}</span>
            </button>

            <label className="flex items-center gap-2 text-[11px] font-semibold text-gray-600 sm:ml-auto">
              <span>Model AI</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={summarizing}
                className="px-2.5 py-2 text-xs rounded-xl border border-gray-300 focus:border-purple-600 outline-none bg-white text-gray-800 font-medium"
              >
                {AI_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}{model.proOnly && !isPro ? ' [Pro]' : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-3 flex items-center gap-3 flex-wrap text-[11px] font-medium text-gray-500" aria-live="polite">
            {auth.isAuthenticated ? (
              <span>
                Sisa kuota ringkasan: <strong className="text-purple-700">{isPro ? 'Unlimited (Pro)' : remainingQuota}</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login', { state: { from: location.pathname } })}
                className="text-purple-700 font-bold hover:underline"
              >
                Login untuk meringkas atau menyimpan jurnal
              </button>
            )}
            {selectedModel === 'Pro SukaBaca AI' && !isPro && auth.isAuthenticated && (
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center gap-1 text-purple-700 font-bold hover:underline"
              >
                <Crown size={12} /> Upgrade ke Pro untuk model ini
              </button>
            )}
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

          {summarizing && jobProgress && (
            <div role="status" aria-live="polite" className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                <span className="flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin text-purple-600" />
                  <span>{jobProgress.message}</span>
                </span>
                {jobProgress.totalParts > 1 && (
                  <span className="text-purple-700">
                    Bagian {jobProgress.currentPart}/{jobProgress.totalParts}
                  </span>
                )}
              </div>
              <div className="w-full bg-purple-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#7da5d9] to-[#b83c9c] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {quotaExhausted && (
            <div role="alert" className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>Kuota harian ringkasan Anda telah habis.</span>
              </span>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="font-bold underline text-purple-800 whitespace-nowrap"
              >
                Upgrade Pro
              </button>
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
          modalStep === 2
            ? 'Jurnal sudah teringkas'
            : `Apakah anda ingin meringkas <${journal.title}>?`
        }
        subtitle={
          modalStep === 2
            ? 'Tampilkan hasil ringkasan sekarang?'
            : `Menggunakan ${selectedModel} untuk merangkum isi dokumen secara otomatis.`
        }
        onConfirm={modalStep === 2 ? handleViewSummary : handleConfirmSummarize}
        onCancel={() => setModalStep(0)}
        confirmText="Ya"
        cancelText="Tidak"
      />

      <ModalConfirm
        isOpen={deleteConfirmOpen}
        title={`Hapus jurnal <${journal.title}>?`}
        subtitle="Semua ulasan, ringkasan, dan berkas terkait akan dihapus permanen."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        confirmText="Ya"
        cancelText="Tidak"
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => { setShowUpgradeModal(false); setUpgradeError(''); }}
        onUpgrade={handleUpgrade}
        onCancelPlan={handleCancelPlan}
        isPro={isPro}
        upgradeSuccess={upgradeSuccess}
        errorMessage={upgradeError}
      />
    </div>
  );
}
