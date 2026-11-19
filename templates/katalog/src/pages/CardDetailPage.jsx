import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Download,
  ExternalLink,
  FileText,
  Pencil,
  Trash2,
  Sparkles,
  Star,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  BookOpen,
  MessageSquarePlus,
  X
} from 'lucide-react';
import {
  api,
  AI_MODELS,
  CATEGORIES,
  canManageJournal,
  canDeleteReview,
  formatDateID,
  formatApaCitation,
  formatBibtexCitation
} from '@shared/api';
import { useAuth } from '@shared/auth';
import { ModalDialog } from '@shared/ModalDialog';
import { SummaryMarkdown } from '@shared/markdown';
import { useUserInvalidSync } from '@shared/formValidation';
import { formatCallNumber } from '../components/DeskShell';
import { getBookVisualProps } from '../components/BookshelfView';
import { SmoothCollapse } from '../components/SmoothCollapse';

export function CardDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, subscription, updateRemainingUsage, refreshSubscription } = useAuth();

  const prefetched =
    location.state?.prefetchedJournal &&
    String(location.state.prefetchedJournal.id) === String(id)
      ? location.state.prefetchedJournal
      : null;

  const [journal, setJournal] = useState(prefetched);
  const [loading, setLoading] = useState(!prefetched);
  const [error, setError] = useState('');

  // Folio text preview for TXT files
  const [txtPreview, setTxtPreview] = useState('');
  const [txtLoading, setTxtLoading] = useState(false);

  // Bookmark & Download
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Citations
  const [citationFormat, setCitationFormat] = useState('APA');
  const [copiedCitation, setCopiedCitation] = useState(false);

  // Edit & Delete Dialogs
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    category: 'Umum',
    publishDate: '',
    abstractText: '',
    content: ''
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const editFormRef = useRef(null);
  useUserInvalidSync(editFormRef);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // AI Summary
  const [ringkasan, setRingkasan] = useState(null);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS.BASIC);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryJob, setSummaryJob] = useState(null);
  const [summaryError, setSummaryError] = useState('');
  const pollAbortRef = useRef(null);

  // Reviews
  const [reviewsData, setReviewsData] = useState({
    totalReviews: 0,
    averageRating: 0,
    reviews: []
  });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const reviewFormRef = useRef(null);
  useUserInvalidSync(reviewFormRef);

  const viewedIdRef = useRef(null);

  const loadAll = useCallback(async () => {
    setLoading((prev) => (journal && String(journal.id) === String(id) ? false : prev || !journal));
    setError('');
    try {
      const [jData, revData, sumData] = await Promise.all([
        api.getJournal(id),
        api.getReviews(id),
        api.getLatestRingkasan(id).catch(() => null)
      ]);
      setJournal(jData);
      setReviewsData(revData);
      setRingkasan(sumData);

      if (jData?.fileName && jData.formatFile === 'TXT') {
        setTxtLoading(true);
        fetch(api.getJournalFileUrl(jData.id, false))
          .then((r) => (r.ok ? r.text() : ''))
          .then((txt) => setTxtPreview(txt))
          .catch(() => setTxtPreview(''))
          .finally(() => setTxtLoading(false));
      } else {
        setTxtPreview('');
      }
    } catch (err) {
      setError(err.message || 'Kartu katalog tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!id || viewedIdRef.current === id) return;
    viewedIdRef.current = id;
    api
      .recordView(id)
      .then((res) => {
        if (res?.views != null) {
          setJournal((prev) => (prev ? { ...prev, views: Number(res.views) } : prev));
        }
      })
      .catch(() => {
        // non-blocking view counter
      });
  }, [id]);

  useEffect(() => {
    return () => {
      if (pollAbortRef.current) {
        pollAbortRef.current.abort();
      }
    };
  }, []);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!journal) return;
    setSavingBookmark(true);
    try {
      if (journal.isSaved) {
        await api.unsaveJournal(journal.id);
      } else {
        await api.saveJournal(journal.id);
      }
      setJournal((prev) => (prev ? { ...prev, isSaved: !prev.isSaved } : prev));
    } catch (err) {
      setError(err.message || 'Gagal memperbarui status simpan.');
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleDownload = async () => {
    if (!journal) return;
    setDownloading(true);
    try {
      const res = await api.recordDownload(journal.id);
      if (res?.download != null) {
        setJournal((prev) => (prev ? { ...prev, download: Number(res.download) } : prev));
      }
    } catch {
      // still proceed with file download
    }

    if (journal.fileName) {
      const link = document.createElement('a');
      link.href = api.getJournalFileUrl(journal.id, true);
      link.download = journal.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      const textBody = [
        `NO. PANGGIL : ${formatCallNumber(journal.id)}`,
        `JUDUL       : ${journal.title}`,
        `PENULIS     : ${journal.author}`,
        `TAHUN       : ${journal.publishDate}`,
        `KATEGORI    : ${journal.category}`,
        '',
        '--- ABSTRAK / ISI ---',
        journal.content || journal.abstractText || ''
      ].join('\n');
      const blob = new Blob([textBody], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formatCallNumber(journal.id)}_${journal.title.slice(0, 36).replace(/[^a-zA-Z0-9_-]+/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }
    setDownloading(false);
  };

  const handleCopyCitation = async () => {
    if (!journal) return;
    const text = citationFormat === 'APA' ? formatApaCitation(journal) : formatBibtexCitation(journal);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2000);
    } catch {
      // clipboard blocked
    }
  };

  const openEditDialog = () => {
    if (!journal) return;
    setEditForm({
      title: journal.title || '',
      author: journal.author || '',
      category: journal.category || 'Umum',
      publishDate: journal.publishDate && journal.publishDate !== '—' ? String(journal.publishDate) : '',
      abstractText: journal.abstractText || '',
      content: journal.content || ''
    });
    setEditError('');
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSaving(true);
    try {
      const updated = await api.updateJournal(journal.id, {
        title: editForm.title.trim(),
        author: editForm.author.trim(),
        category: editForm.category,
        publishDate: editForm.publishDate.trim(),
        abstract: editForm.abstractText.trim(),
        content: editForm.content.trim() || undefined
      });
      setJournal(updated);
      setEditOpen(false);
    } catch (err) {
      setEditError(err.message || 'Gagal menyimpan perubahan kartu.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!journal) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await api.deleteJournal(journal.id);
      setDeleteOpen(false);
      navigate('/');
    } catch (err) {
      setDeleteError(err.message || 'Gagal menghapus kartu katalog.');
    } finally {
      setDeleting(false);
    }
  };

  const handleStartSummarize = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!journal) return;
    if (pollAbortRef.current) {
      pollAbortRef.current.abort();
    }
    const controller = new AbortController();
    pollAbortRef.current = controller;

    setSummarizing(true);
    setSummaryError('');
    setSummaryJob({
      stage: 'MEMULAI',
      message: 'Mengirim naskah ke meja ringkasan AI...',
      currentPart: 0,
      totalParts: 0
    });

    try {
      const started = await api.startSummarize(journal.id, selectedModel);
      setSummaryJob(started);
      if (started.status === 'COMPLETED' && started.ringkasan) {
        setRingkasan(started.ringkasan);
        if (started.remainingUsage != null) {
          updateRemainingUsage(started.remainingUsage);
        } else {
          refreshSubscription();
        }
      } else {
        const result = await api.pollSummarizeJob(started.jobId, {
          signal: controller.signal,
          onProgress: (jobState) => setSummaryJob(jobState)
        });
        if (result.ringkasan) {
          setRingkasan(result.ringkasan);
        } else {
          const latest = await api.getLatestRingkasan(journal.id);
          setRingkasan(latest);
        }
        if (result.remainingUsage != null) {
          updateRemainingUsage(result.remainingUsage);
        } else {
          refreshSubscription();
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setSummaryError(err.message || 'Gagal membuat ringkasan AI.');
      }
    } finally {
      setSummarizing(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setReviewError('');
    if (reviewComment.trim().length < 3) {
      setReviewError('Catatan ulasan minimal 3 karakter.');
      return;
    }
    setReviewSubmitting(true);
    try {
      await api.addReview({
        journalId: journal.id,
        rating: reviewRating,
        komentar: reviewComment.trim()
      });
      setReviewComment('');
      setReviewRating(5);
      const updated = await api.getReviews(journal.id);
      setReviewsData(updated);
      setJournal((prev) =>
        prev
          ? { ...prev, averageRating: updated.averageRating, reviewCount: updated.totalReviews }
          : prev
      );
    } catch (err) {
      setReviewError(err.message || 'Gagal menempel catatan pinggir.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setDeletingReviewId(reviewId);
    setReviewError('');
    try {
      await api.deleteReview(reviewId);
      const updated = await api.getReviews(journal.id);
      setReviewsData(updated);
      setJournal((prev) =>
        prev
          ? { ...prev, averageRating: updated.averageRating, reviewCount: updated.totalReviews }
          : prev
      );
    } catch (err) {
      setReviewError(err.message || 'Gagal menghapus catatan pinggir.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-strip" role="status" aria-live="polite">
        <Loader2 size={18} className="spin-icon" aria-hidden="true" />
        <span>Menarik kartu dossier dari lemari katalog...</span>
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="ruled-card empty-tray">
        <h1>Kartu Tidak Ditemukan</h1>
        <p className="page-lead">{error || 'Nomor panggil katalog tidak tersedia di arsip.'}</p>
        <div>
          <Link to="/" className="btn btn-oak">
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Kembali</span>
          </Link>
        </div>
        <div className="card-punch-hole" aria-hidden="true" />
      </div>
    );
  }

  const callNo = formatCallNumber(journal.id);
  const canManage = canManageJournal(journal, user);
  const bookTheme = location.state?.bookTheme || getBookVisualProps(journal).theme;
  const openedAsBook = Boolean(location.state?.openedAsBook);
  const progressPercent =
    summaryJob?.totalParts > 0
      ? Math.min(100, Math.round(((summaryJob.currentPart || 0) / summaryJob.totalParts) * 100))
      : summarizing
        ? 35
        : 0;
  const isProLocked = selectedModel === AI_MODELS.PRO && isAuthenticated && !subscription?.isPro;

  return (
    <div className={`open-book-shell is-theme-${bookTheme}${openedAsBook ? ' is-unfolding' : ''}`}>
      <div className="back-strip">
        <Link to="/" className="btn btn-ghost btn-sm">
          <ArrowLeft size={15} aria-hidden="true" />
          <span>Kembali</span>
        </Link>
        <span className="call-number">{callNo}</span>
      </div>

      {/* Main Open-Book Journal Spread */}
      <article className="ruled-card dossier-card open-book-spread">
        {journal.isSaved && <span className="open-book-ribbon" aria-hidden="true" />}
        <header className="dossier-head">
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="catalog-card-ids">
              <span className="call-number">{callNo}</span>
              <span className="cat-tag">{journal.category}</span>
              <span className="format-pill">{journal.formatFile}</span>
            </div>
            <h1 className="dossier-title">{journal.title}</h1>
          </div>

          <div className="dossier-actions">
            <button
              type="button"
              className={`btn btn-sm${journal.isSaved ? ' btn-brass' : ''}`}
              onClick={handleToggleSave}
              disabled={savingBookmark}
              aria-pressed={journal.isSaved}
            >
              {journal.isSaved ? (
                <BookmarkCheck size={15} aria-hidden="true" />
              ) : (
                <Bookmark size={15} aria-hidden="true" />
              )}
              <span>{journal.isSaved ? 'Tersimpan' : 'Simpan'}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download size={15} aria-hidden="true" />
              <span>{journal.fileName ? 'Unduh' : 'Unduh TXT'}</span>
            </button>

            {canManage && (
              <>
                <button type="button" className="btn btn-sm" onClick={openEditDialog}>
                  <Pencil size={15} aria-hidden="true" />
                  <span>Sunting</span>
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    setDeleteError('');
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 size={15} aria-hidden="true" />
                  <span>Hapus</span>
                </button>
              </>
            )}
          </div>
        </header>

        <div className="dossier-meta-grid">
          <div className="dossier-meta-cell">
            <span className="dossier-meta-label">Penulis</span>
            <span className="dossier-meta-value">{journal.author}</span>
          </div>
          <div className="dossier-meta-cell">
            <span className="dossier-meta-label">Tahun Terbit</span>
            <span className="dossier-meta-value tabular">{journal.publishDate}</span>
          </div>
          <div className="dossier-meta-cell">
            <span className="dossier-meta-label">Uploader</span>
            <span className="dossier-meta-value">{journal.ownerName || '—'}</span>
          </div>
          <div className="dossier-meta-cell">
            <span className="dossier-meta-label">Dibaca</span>
            <span className="dossier-meta-value tabular">{journal.views}</span>
          </div>
          <div className="dossier-meta-cell">
            <span className="dossier-meta-label">Diunduh</span>
            <span className="dossier-meta-value tabular">{journal.download}</span>
          </div>
          <div className="dossier-meta-cell">
            <span className="dossier-meta-label">Rating &amp; Ulasan</span>
            <span className="dossier-meta-value tabular">
              {reviewsData.totalReviews > 0
                ? `${reviewsData.averageRating.toFixed(1)} / 5 (${reviewsData.totalReviews} ulasan)`
                : 'Belum ada ulasan'}
            </span>
          </div>
          <div className="dossier-meta-cell">
            <span className="dossier-meta-label">Tanggal Upload</span>
            <span className="dossier-meta-value tabular">{formatDateID(journal.createdAt)}</span>
          </div>
        </div>

        <div>
          <h2 className="dossier-section-label">Abstrak &amp; Uraian Kartu</h2>
          <p className="dossier-abstract">
            {journal.abstractText || journal.content || 'Tidak ada abstrak tercatat.'}
          </p>
        </div>

        {journal.content && journal.content !== journal.abstractText && (
          <div style={{ marginBottom: '1rem' }}>
            <h2 className="dossier-section-label">Catatan Isi Tambahan</h2>
            <p className="dossier-abstract">{journal.content}</p>
          </div>
        )}

        {/* Citation Slip */}
        <div className="citation-strip">
          <div className="citation-row">
            <span className="dossier-section-label" style={{ marginBottom: 0 }}>
              Format Sitasi:
            </span>
            <button
              type="button"
              className={`year-chip${citationFormat === 'APA' ? ' is-active' : ''}`}
              aria-pressed={citationFormat === 'APA'}
              onClick={() => setCitationFormat('APA')}
            >
              APA
            </button>
            <button
              type="button"
              className={`year-chip${citationFormat === 'BIBTEX' ? ' is-active' : ''}`}
              aria-pressed={citationFormat === 'BIBTEX'}
              onClick={() => setCitationFormat('BIBTEX')}
            >
              BibTeX
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopyCitation}>
              {copiedCitation ? (
                <Check size={14} aria-hidden="true" />
              ) : (
                <Copy size={14} aria-hidden="true" />
              )}
              <span>{copiedCitation ? 'Tersalin' : 'Salin Sitasi'}</span>
            </button>
          </div>
          <pre key={citationFormat} className="citation-code smooth-swap">
            {citationFormat === 'APA' ? formatApaCitation(journal) : formatBibtexCitation(journal)}
          </pre>
        </div>

        <div className="card-punch-hole" aria-hidden="true" />
      </article>

      {/* Inline Document Folio */}
      <section className="folio-section" aria-label="Lampiran dokumen jurnal">
        <div className="section-bar">
          <h2 className="section-heading">
            <BookOpen size={18} aria-hidden="true" />
            <span>Lampiran Naskah ({journal.fileName ? journal.formatFile : 'Metadata'})</span>
          </h2>
          {journal.fileName && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <a
                href={api.getJournalFileUrl(journal.id, false)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                <ExternalLink size={14} aria-hidden="true" />
                <span>Buka Tab Baru</span>
              </a>
              <button
                type="button"
                className="btn btn-oak btn-sm"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download size={14} aria-hidden="true" />
                <span>Unduh ({journal.fileName})</span>
              </button>
            </div>
          )}
        </div>

        {!journal.fileName ? (
          <p className="field-hint">
            Kartu ini disimpan tanpa lampiran berkas eksternal. Anda tetap dapat membaca abstrak lengkap di atas atau mengunduh salinan TXT.
          </p>
        ) : journal.formatFile === 'PDF' ? (
          <iframe
            className="pdf-frame"
            src={api.getJournalFileUrl(journal.id, false)}
            title={`Pratinjau PDF — ${journal.title}`}
          />
        ) : journal.formatFile === 'TXT' ? (
          txtLoading ? (
            <div className="loading-strip">
              <Loader2 size={16} className="spin-icon" aria-hidden="true" />
              <span>Memuat isi berkas teks...</span>
            </div>
          ) : (
            <pre className="txt-folio">{txtPreview || 'Isi berkas teks kosong.'}</pre>
          )
        ) : (
          <div className="alert-slip">
            <FileText size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              Berkas <strong>{journal.fileName}</strong> ({journal.formatFile}) tidak dapat dipratinjau langsung di peramban. Gunakan tombol <strong>Unduh</strong> di atas untuk membuka dokumen.
            </div>
          </div>
        )}
      </section>

      {/* Ringkas dengan AI */}
      <section className="ruled-card ai-summary-card" aria-label="Ringkas dengan AI">
        <div className="section-bar">
          <h2 className="section-heading">
            <Sparkles size={18} aria-hidden="true" />
            <span>Ringkas dengan AI</span>
          </h2>
          {isAuthenticated ? (
            <span className={`rubber-stamp${subscription?.isPro ? ' is-success' : ''}`}>
              {subscription?.isPro
                ? 'PRO · TANPA BATAS'
                : `SISA KUOTA: ${subscription?.usage ?? 0} / 10`}
            </span>
          ) : (
            <span className="rubber-stamp is-ink">PERLU MASUK</span>
          )}
        </div>

        <div className="ai-controls-grid" role="radiogroup" aria-label="Pilih model ringkasan AI">
          <button
            type="button"
            role="radio"
            aria-checked={selectedModel === AI_MODELS.BASIC}
            className={`model-choice${selectedModel === AI_MODELS.BASIC ? ' is-selected' : ''}`}
            onClick={() => setSelectedModel(AI_MODELS.BASIC)}
            disabled={summarizing}
          >
            <span className="model-choice-title">
              <span>Basic SukaBaca AI</span>
              <span className="format-pill">Gratis &amp; Pro</span>
            </span>
            <span className="model-choice-desc">
              Ringkasan terstruktur cepat untuk intisari masalah, metode, dan temuan utama.
            </span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={selectedModel === AI_MODELS.PRO}
            className={`model-choice${selectedModel === AI_MODELS.PRO ? ' is-selected' : ''}`}
            onClick={() => setSelectedModel(AI_MODELS.PRO)}
            disabled={summarizing}
          >
            <span className="model-choice-title">
              <span>Pro SukaBaca AI</span>
              <span className="format-pill">Khusus Pro</span>
            </span>
            <span className="model-choice-desc">
              Analisis mendalam menyeluruh untuk pemetaan metodologi, keterbatasan, dan sintesis.
            </span>
          </button>
        </div>

        <div className="ai-action-row">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStartSummarize}
                disabled={summarizing || isProLocked}
              >
                {summarizing ? (
                  <Loader2 size={16} className="spin-icon" aria-hidden="true" />
                ) : (
                  <Sparkles size={16} aria-hidden="true" />
                )}
                <span>{summarizing ? 'Sedang Mengetik...' : 'Ketik Ringkasan AI'}</span>
              </button>

              {isProLocked && (
                <div className="field-hint">
                  Model Pro memerlukan keanggotaan aktif.{' '}
                  <Link to="/subscription">Lihat Kartu Anggota</Link>.
                </div>
              )}
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">
              <Sparkles size={16} aria-hidden="true" />
              <span>Masuk</span>
            </Link>
          )}
        </div>

        <SmoothCollapse open={Boolean(summaryError)}>
          <div className="alert-slip is-error" role="alert" style={{ marginBottom: '0.85rem' }}>
            <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{summaryError}</div>
          </div>
        </SmoothCollapse>

        <SmoothCollapse open={Boolean(summarizing && summaryJob)}>
          <div className="ai-progress-strip" role="status" aria-live="polite">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong>{summaryJob?.message || 'Memproses ringkasan dokumen...'}</strong>
              <span className="tabular">
                {summaryJob?.totalParts > 0
                  ? `Bagian ${summaryJob.currentPart || 0} / ${summaryJob.totalParts}`
                  : summaryJob?.stage || 'MEMPROSES'}
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </SmoothCollapse>

        {ringkasan && (
          <div className="summary-output">
            <div className="summary-meta-bar">
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                <span className="rubber-stamp">{ringkasan.model}</span>
                <span className="field-hint tabular">
                  Dicap: {formatDateID(ringkasan.tanggalDibuat)}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <a
                  href={api.getRingkasanPdfUrl(journal.id, false)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  <Eye size={14} aria-hidden="true" />
                  <span>Buka PDF</span>
                </a>
                <a
                  href={api.getRingkasanPdfUrl(journal.id, true)}
                  download
                  className="btn btn-oak btn-sm"
                >
                  <Download size={14} aria-hidden="true" />
                  <span>Unduh PDF</span>
                </a>
              </div>
            </div>

            <SummaryMarkdown text={ringkasan.isi} className="summary-markdown" />
          </div>
        )}

        <div className="card-punch-hole" aria-hidden="true" />
      </section>

      {/* Rating & Ulasan */}
      <section className="reviews-section" aria-label="Rating dan Ulasan">
        <div className="section-bar">
          <h2 className="section-heading">
            <MessageSquarePlus size={18} aria-hidden="true" />
            <span>Rating &amp; Ulasan</span>
          </h2>
          <span className="call-number">
            {reviewsData.totalReviews > 0
              ? `Rata-rata ${reviewsData.averageRating.toFixed(1)} / 5 (${reviewsData.totalReviews})`
              : '0 Catatan'}
          </span>
        </div>

        {isAuthenticated ? (
          <form ref={reviewFormRef} onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="field-group">
              <span className="field-label" id="rating-picker-label">
                Penilaian Bintang
              </span>
              <div className="star-picker" role="radiogroup" aria-labelledby="rating-picker-label">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    role="radio"
                    aria-checked={reviewRating === num}
                    aria-label={`${num} bintang`}
                    className={`star-btn${num <= reviewRating ? ' is-filled' : ''}`}
                    onClick={() => setReviewRating(num)}
                    disabled={reviewSubmitting}
                  >
                    <Star
                      size={18}
                      fill={num <= reviewRating ? 'currentColor' : 'none'}
                      aria-hidden="true"
                    />
                  </button>
                ))}
                <span className="field-hint tabular" style={{ marginLeft: '0.4rem' }}>
                  {reviewRating} / 5 bintang
                </span>
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="review-komentar" className="field-label">
                Catatan Ulasan
              </label>
              <textarea
                id="review-komentar"
                className="field-textarea"
                required
                minLength={3}
                maxLength={2000}
                data-error="review-komentar-error"
                placeholder="Tulis catatan pinggir, komentar metodologi, atau manfaat bacaan ini..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                disabled={reviewSubmitting}
              />
              <span id="review-komentar-error" className="field-error">
                {reviewError}
              </span>
            </div>

            <div>
              <button type="submit" className="btn btn-primary" disabled={reviewSubmitting}>
                {reviewSubmitting ? (
                  <Loader2 size={15} className="spin-icon" aria-hidden="true" />
                ) : (
                  <MessageSquarePlus size={15} aria-hidden="true" />
                )}
                <span>{reviewSubmitting ? 'Menyimpan...' : 'Tempel Catatan'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="alert-slip">
            <MessageSquarePlus size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              Ingin meninggalkan catatan pinggir untuk pembaca lain?{' '}
              <Link to="/login">Masuk</Link>.
            </div>
          </div>
        )}

        <div className="review-list">
          {reviewsData.reviews.length === 0 ? (
            <p className="field-hint" style={{ paddingTop: '0.9rem' }}>
              Rating tidak tersedia
            </p>
          ) : (
            reviewsData.reviews.map((rev) => (
              <div key={rev.reviewId} className="review-slip">
                <div className="review-slip-head">
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
                    <strong>{rev.authorName}</strong>
                    <span className="review-stars-static" aria-label={`Rating ${rev.rating} dari 5`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={14}
                          fill={n <= rev.rating ? 'currentColor' : 'none'}
                          aria-hidden="true"
                        />
                      ))}
                    </span>
                    <span className="field-hint tabular">{formatDateID(rev.tanggalReview)}</span>
                  </div>

                  {canDeleteReview(rev, user) && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteReview(rev.reviewId)}
                      disabled={deletingReviewId === rev.reviewId}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      <span>{deletingReviewId === rev.reviewId ? 'Menghapus...' : 'Hapus'}</span>
                    </button>
                  )}
                </div>
                <p style={{ whiteSpace: 'pre-wrap' }}>{rev.komentar}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Edit Metadata Dialog */}
      <ModalDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        ariaLabelledBy="edit-dialog-title"
        className="catalog-dialog"
      >
        <div className="dialog-header">
          <h2 id="edit-dialog-title" className="dialog-title">
            Sunting Kartu {callNo}
          </h2>
          <button
            type="button"
            className="header-btn"
            onClick={() => setEditOpen(false)}
            aria-label="Tutup dialog sunting"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <form ref={editFormRef} onSubmit={handleEditSubmit}>
          <div className="dialog-body">
            {editError && (
              <div className="alert-slip is-error" role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{editError}</span>
              </div>
            )}

            <div className="field-group">
              <label htmlFor="edit-title" className="field-label">
                Judul Jurnal
              </label>
              <input
                id="edit-title"
                type="text"
                className="field-input"
                required
                minLength={3}
                maxLength={255}
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                disabled={editSaving}
              />
            </div>

            <div className="form-grid-2">
              <div className="field-group">
                <label htmlFor="edit-author" className="field-label">
                  Penulis
                </label>
                <input
                  id="edit-author"
                  type="text"
                  className="field-input"
                  required
                  minLength={2}
                  maxLength={150}
                  value={editForm.author}
                  onChange={(e) => setEditForm((p) => ({ ...p, author: e.target.value }))}
                  disabled={editSaving}
                />
              </div>

              <div className="field-group">
                <label htmlFor="edit-year" className="field-label">
                  Tahun Terbit
                </label>
                <input
                  id="edit-year"
                  type="text"
                  className="field-input tabular"
                  pattern="^(19|20)\d{2}$"
                  required
                  value={editForm.publishDate}
                  onChange={(e) => setEditForm((p) => ({ ...p, publishDate: e.target.value }))}
                  disabled={editSaving}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="edit-category" className="field-label">
                Laci Kategori
              </label>
              <select
                id="edit-category"
                className="field-select"
                value={editForm.category}
                onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                disabled={editSaving}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="edit-abstract" className="field-label">
                Abstrak (min. 30 karakter)
              </label>
              <textarea
                id="edit-abstract"
                className="field-textarea"
                required
                minLength={30}
                maxLength={10000}
                value={editForm.abstractText}
                onChange={(e) => setEditForm((p) => ({ ...p, abstractText: e.target.value }))}
                disabled={editSaving}
              />
            </div>
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setEditOpen(false)}
              disabled={editSaving}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={editSaving}>
              {editSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* Delete Confirmation Dialog (autoFocus on safe Batal button) */}
      <ModalDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        ariaLabelledBy="delete-dialog-title"
        className="catalog-dialog"
      >
        <div className="dialog-header">
          <h2 id="delete-dialog-title" className="dialog-title">
            Hapus Kartu Katalog?
          </h2>
          <button
            type="button"
            className="header-btn"
            onClick={() => setDeleteOpen(false)}
            aria-label="Tutup dialog hapus"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="dialog-body">
          {deleteError && (
            <div className="alert-slip is-error" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{deleteError}</span>
            </div>
          )}
          <p>
            Kartu <strong>{callNo} — {journal.title}</strong> beserta berkas lampiran, ringkasan AI, dan catatan pinggirnya akan dihapus permanen dari lemari katalog.
          </p>
        </div>

        <div className="dialog-footer">
          <button
            type="button"
            className="btn"
            autoFocus
            onClick={() => setDeleteOpen(false)}
            disabled={deleting}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? 'Menghapus...' : 'Ya, Hapus Kartu'}
          </button>
        </div>
      </ModalDialog>
    </div>
  );
}
