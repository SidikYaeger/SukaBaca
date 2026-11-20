import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  ArrowRight,
  BookmarkX,
  AlertCircle,
  Loader2,
  LogIn
} from 'lucide-react';
import { api, ACTION_LABELS_ID, formatDateID } from '@shared/api';
import { useAuth } from '@shared/auth';
import { formatCallNumber } from '../components/DeskShell';

const FILTER_TABS = [
  { id: 'ALL', label: 'Semua' },
  { id: 'UPLOADED', label: 'Diunggah' },
  { id: 'VIEWED', label: 'Dibaca' },
  { id: 'DOWNLOADED', label: 'Diunduh' },
  { id: 'SUMMARIZED', label: 'Diringkas AI' },
  { id: 'SAVED', label: 'Tersimpan' }
];

function stampVariant(actionType) {
  if (actionType === 'UPLOADED') return 'is-success';
  if (actionType === 'SUMMARIZED') return '';
  return 'is-ink';
}

export function BorrowerSlipPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('ALL');
  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyUnsaveId, setBusyUnsaveId] = useState(null);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [histList, savedList] = await Promise.all([
        api.getHistory(),
        api.getSavedJournals()
      ]);
      setHistory(histList);
      setSaved(savedList);
    } catch (err) {
      setError(err.message || 'Gagal memuat catatan kartu pinjam.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredHistory = useMemo(() => {
    if (activeTab === 'ALL') return history;
    return history.filter((entry) => entry.actionType === activeTab);
  }, [history, activeTab]);

  const handleUnsave = async (journalId) => {
    setBusyUnsaveId(journalId);
    setError('');
    try {
      await api.unsaveJournal(journalId);
      setSaved((prev) => prev.filter((item) => item.id !== journalId));
    } catch (err) {
      setError(err.message || 'Gagal melepas kartu dari daftar tersimpan.');
    } finally {
      setBusyUnsaveId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="ruled-card intake-card">
        <div className="auth-slip-head">
          <h1 className="page-title">Kartu Pinjam &amp; Riwayat</h1>
          <p className="page-lead">
            Masuk terlebih dahulu untuk melihat cap riwayat unggahan, bacaan, unduhan, ringkasan AI, serta kartu tersimpan Anda.
          </p>
        </div>
        <Link to="/login" className="btn btn-primary">
          <LogIn size={16} aria-hidden="true" />
          <span>Masuk</span>
        </Link>
        <div className="card-punch-hole" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Kartu Pinjam &amp; Riwayat</h1>
        </div>
      </div>

      <div className="slip-tabs" role="tablist" aria-label="Filter cap aktivitas">
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count =
            tab.id === 'ALL'
              ? history.length
              : tab.id === 'SAVED'
                ? saved.length
                : history.filter((h) => h.actionType === tab.id).length;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`slip-tab${isActive ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {error && (
        <div className="alert-slip is-error" role="alert" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="loading-strip" role="status" aria-live="polite">
          <Loader2 size={18} className="spin-icon" aria-hidden="true" />
          <span>Memeriksa kartu pinjam Anda...</span>
        </div>
      ) : (
        <section className="ruled-card borrower-slip-sheet" aria-label="Daftar catatan kartu pinjam">
          <div className="section-bar">
            <h2 className="section-heading">
              <ClipboardList size={18} aria-hidden="true" />
              <span>
                {activeTab === 'SAVED'
                  ? 'Rak Kartu Tersimpan'
                  : FILTER_TABS.find((t) => t.id === activeTab)?.label || 'Semua'}
              </span>
            </h2>
          </div>

          <div key={activeTab} className="smooth-swap">
            {activeTab === 'SAVED' ? (
            saved.length === 0 ? (
              <p className="field-hint" style={{ padding: '1rem 0' }}>
                Belum ada kartu jurnal yang Anda tandai tersimpan. Tarik kartu dari <Link to="/">Laci Katalog</Link> untuk menyimpannya.
              </p>
            ) : (
              <div>
                <div className="slip-header-row" aria-hidden="true">
                  <span>Cap Status</span>
                  <span>No. Panggil</span>
                  <span>Judul &amp; Penulis</span>
                  <span>Disimpan Pada</span>
                  <span>Aksi</span>
                </div>
                {saved.map((item) => (
                  <div key={item.id} className="slip-entry-row">
                    <div>
                      <span className="rubber-stamp is-success">TERSIMPAN</span>
                    </div>
                    <div>
                      <span className="call-number">{formatCallNumber(item.id)}</span>
                    </div>
                    <div className="slip-title-col">
                      <Link to={`/journal/${item.id}`} className="slip-title-link">
                        {item.title}
                      </Link>
                      <span className="field-hint">
                        {item.author} · {item.category}
                      </span>
                    </div>
                    <div className="field-hint tabular">{formatDateID(item.savedAt)}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                      <Link to={`/journal/${item.id}`} className="btn btn-oak btn-sm">
                        <span>Buka</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleUnsave(item.id)}
                        disabled={busyUnsaveId === item.id}
                        aria-label={`Lepas ${item.title} dari tersimpan`}
                      >
                        <BookmarkX size={14} aria-hidden="true" />
                        <span>Lepas</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filteredHistory.length === 0 ? (
            <p className="field-hint" style={{ padding: '1rem 0' }}>
              Belum ada cap aktivitas untuk kategori ini. Mulai jelajahi koleksi di <Link to="/">Laci Katalog</Link>.
            </p>
          ) : (
            <div>
              <div className="slip-header-row" aria-hidden="true">
                <span>Cap Aktivitas</span>
                <span>No. Panggil</span>
                <span>Judul &amp; Penulis</span>
                <span>Tanggal Cap</span>
                <span>Aksi</span>
              </div>
              {filteredHistory.map((entry) => {
                const j = entry.journal;
                const actionLabel = ACTION_LABELS_ID[entry.actionType] || entry.actionType;
                return (
                  <div key={entry.historyId} className="slip-entry-row">
                    <div>
                      <span className={`rubber-stamp ${stampVariant(entry.actionType)}`}>
                        {actionLabel}
                      </span>
                    </div>
                    <div>
                      <span className="call-number">{j ? formatCallNumber(j.id) : '—'}</span>
                    </div>
                    <div className="slip-title-col">
                      {j ? (
                        <>
                          <Link to={`/journal/${j.id}`} className="slip-title-link">
                            {j.title}
                          </Link>
                          <span className="field-hint">
                            {j.author} · {j.category}
                          </span>
                        </>
                      ) : (
                        <span className="field-hint">Jurnal sudah tidak tersedia</span>
                      )}
                    </div>
                    <div className="field-hint tabular">{formatDateID(entry.createdAt)}</div>
                    <div>
                      {j && (
                        <Link to={`/journal/${j.id}`} className="btn btn-oak btn-sm">
                          <span>Tarik</span>
                          <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>

          <div className="card-punch-hole" aria-hidden="true" />
        </section>
      )}
    </div>
  );
}
