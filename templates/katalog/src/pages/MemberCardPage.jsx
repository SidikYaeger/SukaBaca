import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogIn,
  Info,
  X
} from 'lucide-react';
import { formatShortDateID } from '@shared/api';
import { useAuth } from '@shared/auth';
import { ModalDialog } from '@shared/ModalDialog';
import { SmoothCollapse } from '../components/SmoothCollapse';

export function MemberCardPage() {
  const { user, isAuthenticated, subscription, upgradeToPro, cancelPro } = useAuth();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleUpgrade = async () => {
    setBusy(true);
    setFeedback({ type: '', text: '' });
    try {
      await upgradeToPro();
      setFeedback({
        type: 'success',
        text: 'Kartu Anggota Pro Akademik (Demo) berhasil diaktifkan. Kuota ringkasan AI kini tanpa batas.'
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Gagal mengaktifkan paket Pro.'
      });
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmCancel = async () => {
    setBusy(true);
    setFeedback({ type: '', text: '' });
    try {
      await cancelPro();
      setCancelDialogOpen(false);
      setFeedback({
        type: 'success',
        text: 'Paket Pro telah dibatalkan. Kartu kembali ke kuota Gratis (10 ringkasan/hari).'
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Gagal membatalkan paket Pro.'
      });
    } finally {
      setBusy(false);
    }
  };

  const dailyLimit = 10;
  const remaining = subscription?.isPro ? dailyLimit : Math.max(0, Math.min(dailyLimit, subscription?.usage ?? 0));
  const usedSlots = subscription?.isPro ? 0 : dailyLimit - remaining;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Kartu Anggota Perpustakaan</h1>
        </div>
      </div>

      <SmoothCollapse open={Boolean(feedback.text)}>
        <div
          className={`alert-slip ${feedback.type === 'error' ? 'is-error' : 'is-success'}`}
          role="status"
          style={{ marginBottom: '1rem' }}
        >
          {feedback.type === 'error' ? (
            <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <CheckCircle2 size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <div>{feedback.text}</div>
        </div>
      </SmoothCollapse>

      <div className="member-layout">
        {/* Physical Library Membership Card */}
        <section className="ruled-card library-card" aria-label="Kartu identitas anggota">
          <div className="library-card-banner">
            <h2 className="section-heading">
              {isAuthenticated ? user.name || user.username : 'Belum Masuk Anggota'}
            </h2>

            {isAuthenticated ? (
              <span className={`rubber-stamp${subscription?.isPro ? ' is-success' : ''}`}>
                {subscription?.isPro ? 'PRO · TANPA BATAS' : 'ANGGOTA GRATIS'}
              </span>
            ) : (
              <span className="rubber-stamp is-ink">BELUM TERDAFTAR</span>
            )}
          </div>

          {!isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p>Masuk untuk mendapatkan akses lebih</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                <Link to="/login" className="btn btn-primary">
                  <LogIn size={16} aria-hidden="true" />
                  <span>Masuk</span>
                </Link>
                <Link to="/register" className="btn">
                  <span>Daftar</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="dossier-meta-grid">
                <div className="dossier-meta-cell">
                  <span className="dossier-meta-label">Nama Pengguna</span>
                  <span className="dossier-meta-value">@{user.username}</span>
                </div>
                <div className="dossier-meta-cell">
                  <span className="dossier-meta-label">Paket Aktif</span>
                  <span className="dossier-meta-value">{subscription.planLabel}</span>
                </div>
                <div className="dossier-meta-cell">
                  <span className="dossier-meta-label">Masa Berlaku</span>
                  <span className="dossier-meta-value tabular">
                    {subscription.currentPeriodEnd
                      ? formatShortDateID(subscription.currentPeriodEnd)
                      : '—'}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <h3 className="dossier-section-label">Kuota Harian</h3>
                {subscription.isPro ? (
                  <div className="alert-slip is-success">
                    <Sparkles size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>PRO · TANPA BATAS</strong> — Seluruh model Basic &amp; Pro SukaBaca AI terbuka tanpa batas kuota harian.
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="field-hint tabular">
                      Sisa kuota hari ini: <strong>{remaining}</strong> dari {dailyLimit} slot (terpakai: {usedSlots}).
                    </p>
                    <div
                      className="punch-grid"
                      aria-label={`Kuota tersisa ${remaining} dari ${dailyLimit}`}
                    >
                      {Array.from({ length: dailyLimit }, (_, idx) => {
                        const isPunched = idx < usedSlots;
                        return (
                          <div
                            key={idx}
                            className={`punch-slot${isPunched ? ' is-punched' : ''}`}
                            title={isPunched ? `Slot ${idx + 1}: Terpakai` : `Slot ${idx + 1}: Tersedia`}
                          >
                            <span className="punch-hole-dot" aria-hidden="true" />
                            <span>{idx + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="alert-slip" style={{ marginBottom: '1rem' }}>
                <Info size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Mode Demo Akademik:</strong> Aktivasi paket Pro pada aplikasi SukaBaca ini berjalan langsung tanpa tagihan atau pembayaran kartu kredit.
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {!subscription.isPro ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpgrade}
                    disabled={busy}
                  >
                    {busy ? (
                      <Loader2 size={16} className="spin-icon" aria-hidden="true" />
                    ) : (
                      <Sparkles size={16} aria-hidden="true" />
                    )}
                    <span>{busy ? 'Mengaktifkan...' : 'Aktifkan Kartu Pro (Demo)'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={busy || !subscription.subscriptionId}
                  >
                    <span>Batalkan Paket Pro</span>
                  </button>
                )}
              </div>
            </>
          )}

          <div className="card-punch-hole" aria-hidden="true" />
        </section>

        {/* Honest Feature Comparison Table */}
        <aside className="tier-table-sheet" aria-label="Perbandingan paket keanggotaan">
          <h2 className="section-heading">Keuntungan Membership</h2>

          <table className="tier-table">
            <thead>
              <tr>
                <th>Fasilitas</th>
                <th>Gratis</th>
                <th>Pro Akademik</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Kuota Ringkasan AI</td>
                <td className="tabular">10 / hari</td>
                <td>Tanpa batas</td>
              </tr>
              <tr>
                <td>Model Basic SukaBaca AI</td>
                <td>Tersedia</td>
                <td>Tersedia</td>
              </tr>
              <tr>
                <td>Model Pro SukaBaca AI</td>
                <td>—</td>
                <td>Tersedia</td>
              </tr>
              <tr>
                <td>Unduh PDF Ringkasan</td>
                <td>Penuh</td>
                <td>Penuh</td>
              </tr>
              <tr>
                <td>Unggah &amp; Kelola Kartu</td>
                <td>Penuh</td>
                <td>Penuh</td>
              </tr>
            </tbody>
          </table>
        </aside>
      </div>

      {/* Cancel Pro Confirmation Dialog */}
      <ModalDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        ariaLabelledBy="cancel-pro-title"
        className="catalog-dialog"
      >
        <div className="dialog-header">
          <h2 id="cancel-pro-title" className="dialog-title">
            Batalkan Kartu Pro?
          </h2>
          <button
            type="button"
            className="header-btn"
            onClick={() => setCancelDialogOpen(false)}
            aria-label="Tutup dialog pembatalan"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="dialog-body">
          <p>
            Status keanggotaan Anda akan dikembalikan ke <strong>Gratis</strong> dengan batas 10 ringkasan AI harian dan akses model Basic saja.
          </p>
        </div>

        <div className="dialog-footer">
          <button
            type="button"
            className="btn"
            autoFocus
            onClick={() => setCancelDialogOpen(false)}
            disabled={busy}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmCancel}
            disabled={busy}
          >
            {busy ? 'Memproses...' : 'Ya, Batalkan Pro'}
          </button>
        </div>
      </ModalDialog>
    </div>
  );
}
