import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileDown,
  Copy,
  Check,
  Crown,
  Lock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  LogIn
} from 'lucide-react';
import { journalService } from '../../services/journal.service';
import { AI_MODELS } from '../../config/app.config';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import UpgradeModal from '../UpgradeModal';

const STAGE_META = {
  QUEUED: { label: 'Antrean', percent: 12 },
  EXTRACTING: { label: 'Ekstraksi Teks', percent: 28 },
  SUMMARIZING: { label: 'Analisis & Ringkasan AI', percent: 65 },
  SYNTHESIZING: { label: 'Sintesis Akhir', percent: 88 },
  DONE: { label: 'Selesai', percent: 100 },
  ERROR: { label: 'Gagal', percent: 100 }
};

function renderInlineBold(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-bold text-[#0F172A]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function FormattedSummary({ content }) {
  const lines = String(content || '').split(/\r?\n/);
  const blocks = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: 'list', items: listItems });
      listItems = [];
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line === '---' || line === '***') {
      flushList();
      return;
    }

    const headingMatch = line.match(/^#{1,3}\s+(.+)$/) || line.match(/^\*\*([^*]+)\*\*:?\s*$/);
    if (headingMatch) {
      flushList();
      blocks.push({ type: 'heading', text: headingMatch[1].replace(/\*\*/g, '').trim() });
      return;
    }

    const bulletMatch = line.match(/^([-*•]|\d+\.)\s+(.+)$/);
    if (bulletMatch) {
      listItems.push(bulletMatch[2].trim());
      return;
    }

    flushList();
    blocks.push({ type: 'paragraph', text: line });
  });
  flushList();

  return (
    <div className="space-y-3 text-xs sm:text-sm text-[#334155] leading-relaxed">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h4
              key={index}
              className="text-xs font-extrabold uppercase tracking-wider font-mono text-[#0F172A] pt-2 first:pt-0 border-b border-[#E2E8F0] pb-1"
            >
              {block.text}
            </h4>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={index} className="space-y-1.5 pl-4">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="relative pl-3 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-[#0593C6]">
                  {renderInlineBold(item)}
                </li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{renderInlineBold(block.text)}</p>;
      })}
    </div>
  );
}

function formatDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function AiSummarizerPanel({
  journalId,
  journalTitle = 'ringkasan',
  initialSummaries = null,
  compact = false
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isPro, remainingQuota, refreshSubscription } = useSubscription();

  const [summaries, setSummaries] = useState(Array.isArray(initialSummaries) ? initialSummaries : []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(initialSummaries === null);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);

  const [jobState, setJobState] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const pollTimerRef = useRef(null);
  const mountedRef = useRef(true);

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearPollTimer();
    };
  }, [clearPollTimer]);

  useEffect(() => {
    if (Array.isArray(initialSummaries)) {
      setSummaries(initialSummaries);
      setActiveIndex(0);
      setLoadingInitial(false);
      return;
    }

    let active = true;
    setLoadingInitial(true);
    journalService
      .getAiSummaries(journalId)
      .then((list) => {
        if (!active) return;
        setSummaries(list);
        setActiveIndex(0);
      })
      .finally(() => {
        if (active) setLoadingInitial(false);
      });

    return () => {
      active = false;
    };
  }, [journalId, initialSummaries]);

  const activeSummary = summaries[activeIndex] || null;

  const pollJobStatus = useCallback(
    async (jobId) => {
      if (!mountedRef.current) return;
      try {
        const statusData = await journalService.getSummarizeJob(jobId);
        if (!mountedRef.current) return;

        setJobState(statusData);

        if (statusData.status === 'COMPLETED') {
          setIsGenerating(false);
          clearPollTimer();
          if (statusData.ringkasan) {
            setSummaries((prev) => [statusData.ringkasan, ...prev]);
            setActiveIndex(0);
          } else {
            const refreshed = await journalService.getAiSummaries(journalId);
            if (mountedRef.current) {
              setSummaries(refreshed);
              setActiveIndex(0);
            }
          }
          refreshSubscription();
          return;
        }

        if (statusData.status === 'FAILED') {
          setIsGenerating(false);
          clearPollTimer();
          const msg = statusData.error || statusData.message || 'Gagal memproses ringkasan AI.';
          setErrorMsg(msg);
          setNeedsUpgrade(msg.toLowerCase().includes('kuota') || msg.toLowerCase().includes('pro'));
          return;
        }

        pollTimerRef.current = setTimeout(() => pollJobStatus(jobId), 1200);
      } catch (err) {
        if (!mountedRef.current) return;
        setIsGenerating(false);
        clearPollTimer();
        setErrorMsg(err.message || 'Koneksi terputus saat memantau progres ringkasan AI.');
      }
    },
    [clearPollTimer, journalId, refreshSubscription]
  );

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const pickedModel = AI_MODELS.find((m) => m.id === selectedModel);
    if (pickedModel?.tier === 'pro' && !isPro) {
      setShowUpgradeModal(true);
      return;
    }

    if (!isPro && remainingQuota <= 0) {
      setErrorMsg('Kuota harian ringkasan AI Anda telah habis. Upgrade ke Pro untuk kuota tanpa batas.');
      setNeedsUpgrade(true);
      return;
    }

    clearPollTimer();
    setErrorMsg('');
    setNeedsUpgrade(false);
    setIsGenerating(true);
    setJobState({
      status: 'PROCESSING',
      stage: 'QUEUED',
      currentPart: 0,
      totalParts: 1,
      message: 'Memulai proses ekstraksi & ringkasan AI...'
    });

    try {
      const started = await journalService.startAiSummary(journalId, selectedModel);
      if (!mountedRef.current) return;
      setJobState(started);
      if (started?.jobId) {
        pollTimerRef.current = setTimeout(() => pollJobStatus(started.jobId), 900);
      } else {
        throw new Error('Server tidak mengembalikan ID proses ringkasan.');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setIsGenerating(false);
      setJobState(null);
      const msg = err.message || 'Gagal memulai ringkasan AI.';
      setErrorMsg(msg);
      setNeedsUpgrade(msg.toLowerCase().includes('kuota') || msg.toLowerCase().includes('pro'));
    }
  };

  const handleCopy = async () => {
    if (!activeSummary?.content) return;
    try {
      await navigator.clipboard.writeText(activeSummary.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const handleDownloadPdf = async () => {
    if (!activeSummary?.content) return;
    setDownloadingPdf(true);
    setErrorMsg('');
    try {
      await journalService.downloadSummaryPdf(journalId, journalTitle);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengekspor ringkasan ke PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const computeProgressPercent = () => {
    if (!jobState) return 0;
    const base = STAGE_META[jobState.stage]?.percent ?? 20;
    if (jobState.stage === 'SUMMARIZING' && jobState.totalParts > 1) {
      const ratio = Math.min(1, (jobState.currentPart || 1) / jobState.totalParts);
      return Math.round(35 + ratio * 48);
    }
    return base;
  };

  const progressPercent = computeProgressPercent();

  return (
    <section
      className={`${
        compact ? 'p-4 space-y-4' : 'p-6 sm:p-8 space-y-5'
      } bg-[#F8FAFC] border border-[#CBD5E1] shadow-hard-sm`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#FFFFFF] border border-[#0F172A] text-[#0593C6] shadow-hard-sm shrink-0">
            <Sparkles size={compact ? 16 : 18} />
          </div>
          <div>
            <h3 className={`${compact ? 'text-sm' : 'text-base'} font-bold text-[#0F172A]`}>
              AI Literature Summarizer
            </h3>
            <p className="text-xs text-[#64748B]">
              Ekstrak inti jurnal, metodologi, temuan utama, dan kesimpulan secara otomatis.
            </p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-mono text-[11px] font-bold bg-[#FFFFFF] text-[#0F172A] px-2.5 py-1 border border-[#CBD5E1] tabular-nums">
              {isPro ? (
                <span className="inline-flex items-center gap-1 text-[#D83995]">
                  <Crown size={12} /> Pro Unlimited
                </span>
              ) : (
                <span className="text-[#0593C6]">{remainingQuota} Kuota Tersisa</span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Model Selector & Trigger Controls */}
      <div className="space-y-3">
        <div className={`grid grid-cols-1 ${compact ? '' : 'sm:grid-cols-2'} gap-2.5`}>
          {AI_MODELS.map((model) => {
            const isSelected = selectedModel === model.id;
            const locked = model.tier === 'pro' && !isPro;

            return (
              <button
                key={model.id}
                type="button"
                disabled={isGenerating}
                onClick={() => {
                  if (locked && isAuthenticated) {
                    setShowUpgradeModal(true);
                    return;
                  }
                  setSelectedModel(model.id);
                }}
                className={`text-left p-3 border transition-all cursor-pointer disabled:opacity-60 ${
                  isSelected
                    ? 'bg-[#FFFFFF] border-2 border-[#0F172A] shadow-hard-sm'
                    : 'bg-[#FFFFFF] border-[#CBD5E1] hover:border-[#0F172A]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                    {model.tier === 'pro' ? (
                      <Crown size={13} className="text-[#D83995]" />
                    ) : (
                      <Sparkles size={13} className="text-[#0593C6]" />
                    )}
                    {model.label}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 border uppercase ${
                      model.tier === 'pro'
                        ? 'bg-[#D83995]/10 text-[#D83995] border-[#D83995]/30'
                        : 'bg-[#0593C6]/10 text-[#0593C6] border-[#0593C6]/30'
                    }`}
                  >
                    {locked ? (
                      <span className="inline-flex items-center gap-1">
                        <Lock size={9} /> PRO
                      </span>
                    ) : (
                      model.badge
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-snug">{model.description}</p>
              </button>
            );
          })}
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="dokmeh-btn-primary !py-2 !px-4 text-xs font-bold"
            >
              <LogIn size={14} />
              <span>Masuk untuk Membuat Ringkasan AI</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="dokmeh-btn-primary !py-2 !px-4 text-xs font-bold"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Sedang Meringkas...</span>
                </>
              ) : activeSummary ? (
                <>
                  <RefreshCw size={14} />
                  <span>Ringkas Ulang dengan AI</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Buat Ringkasan AI</span>
                </>
              )}
            </button>
          )}

          {activeSummary?.content && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="dokmeh-btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                title="Salin Ringkasan"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="dokmeh-btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                title="Unduh Ringkasan PDF"
              >
                <FileDown size={13} />
                <span>{downloadingPdf ? 'Mengekspor...' : 'Unduh PDF'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Progress Bar */}
      {isGenerating && jobState && (
        <div className="p-4 bg-[#FFFFFF] border-2 border-[#0593C6] shadow-hard-sm space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-mono font-bold uppercase text-[#0593C6] flex items-center gap-1.5">
              <Loader2 size={13} className="animate-spin" />
              {STAGE_META[jobState.stage]?.label || jobState.stage || 'Memproses'}
              {jobState.totalParts > 1 && jobState.currentPart > 0 && (
                <span className="text-[#0F172A] tabular-nums">
                  ({jobState.currentPart}/{jobState.totalParts})
                </span>
              )}
            </span>
            <span className="font-mono font-bold text-[#0F172A] tabular-nums">{progressPercent}%</span>
          </div>

          <div className="w-full h-2 bg-[#E2E8F0] overflow-hidden">
            <div
              className="h-full bg-[#0593C6] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-xs text-[#64748B]">
            {jobState.message || 'Menyusun ringkasan akademik terstruktur...'}
          </p>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-300 text-red-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
          {needsUpgrade && (
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="dokmeh-btn-primary !py-1 !px-3 text-[11px] shrink-0"
            >
              <Crown size={12} />
              <span>Upgrade Pro</span>
            </button>
          )}
        </div>
      )}

      {/* Summary Output Container */}
      <div className="bg-[#FFFFFF] border border-[#CBD5E1] p-5 space-y-4">
        {loadingInitial ? (
          <div className="space-y-2.5 animate-pulse">
            <div className="h-4 w-1/3 bg-[#E2E8F0]" />
            <div className="h-3 w-full bg-[#F1F5F9]" />
            <div className="h-3 w-5/6 bg-[#F1F5F9]" />
            <div className="h-3 w-4/6 bg-[#F1F5F9]" />
          </div>
        ) : activeSummary?.content ? (
          <>
            {/* Summary Metadata & History Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0] text-[11px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="dokmeh-badge-primary font-mono">
                  {activeSummary.model || 'Basic SukaBaca AI'}
                </span>
                {activeSummary.tanggalDibuat && (
                  <span className="text-[#64748B] font-mono inline-flex items-center gap-1 tabular-nums">
                    <Clock size={11} />
                    {formatDateTime(activeSummary.tanggalDibuat)}
                  </span>
                )}
              </div>

              {summaries.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[#64748B] font-mono uppercase text-[10px]">Riwayat:</span>
                  <select
                    value={activeIndex}
                    onChange={(e) => setActiveIndex(Number(e.target.value))}
                    className="dokmeh-select !py-0.5 !px-2 text-[11px] font-mono"
                  >
                    {summaries.map((item, idx) => (
                      <option key={item.ringkasanId || idx} value={idx}>
                        #{summaries.length - idx} · {item.model || 'AI'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <FormattedSummary content={activeSummary.content} />
          </>
        ) : (
          <div className="py-6 text-center space-y-2">
            <Sparkles size={22} className="mx-auto text-[#94A3B8]" />
            <p className="text-xs sm:text-sm font-semibold text-[#0F172A]">
              Belum ada ringkasan AI untuk jurnal ini
            </p>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Pilih model AI di atas lalu klik <strong className="text-[#0F172A]">Buat Ringkasan AI</strong> untuk mengekstrak inti penelitian, metodologi, dan temuan utama secara otomatis.
            </p>
          </div>
        )}
      </div>

      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
    </section>
  );
}
