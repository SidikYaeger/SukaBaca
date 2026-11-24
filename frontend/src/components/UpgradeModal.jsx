import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { X, Check, Crown, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

let cachedDisplayTransitionSupport;
function canTransitionDisplay() {
  if (cachedDisplayTransitionSupport !== undefined) return cachedDisplayTransitionSupport;
  if (typeof window === 'undefined' || !window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  cachedDisplayTransitionSupport = getComputedStyle(probe).display === 'block';
  probe.remove();
  return cachedDisplayTransitionSupport;
}

function supportsTopLayerExit() {
  return typeof window !== 'undefined' && window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay();
}

const FREE_FEATURES = [
  'Akses pencarian repositori publikasi ilmiah',
  '5 ringkasan AI per hari',
  'Baca abstrak dan pratinjau naskah',
  'Simpan jurnal & lacak riwayat baca',
  'Ekspor ringkasan format PDF',
];

const PRO_FEATURES = [
  'Ringkasan AI tanpa batas per hari',
  'Unduhan naskah penuh tanpa batas',
  'Sintesis literatur lebih mendalam',
  'Ekspor ringkasan format PDF resmi',
  'Prioritas pemrosesan antrean ringkasan AI',
];

export default function UpgradeModal({ onClose }) {
  const { isPro, upgradePlan, cancelPlan } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closeAnimated = useCallback(async () => {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open) return;

    if (!supportsTopLayerExit()) {
      if (dialog.hasAttribute('data-closing')) return;
      dialog.setAttribute('data-closing', '');
      const animations = dialog.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((r) => setTimeout(r, 2000)),
        ]);
      }
      if (!dialog.hasAttribute('data-closing')) return;
      dialog.removeAttribute('data-closing');
    }

    dialog.close();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    let active = true;
    dialog.removeAttribute('data-closing');
    if (!dialog.open) {
      dialog.showModal();
    }

    const handleNativeClose = () => {
      if (!active || dialog.open) return;
      onCloseRef.current?.();
    };
    const handleCancel = (event) => {
      event.preventDefault();
      closeAnimated();
    };
    dialog.addEventListener('close', handleNativeClose);
    dialog.addEventListener('cancel', handleCancel);

    // Fallback light-dismiss for browsers lacking <dialog closedby="any">
    let removeFallback = null;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const isOutside = (e) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      const onPointerDown = (e) => {
        pressedOutside = isOutside(e);
      };
      const onPointerUp = (e) => {
        if (pressedOutside && isOutside(e)) {
          closeAnimated();
        }
      };
      dialog.addEventListener('pointerdown', onPointerDown);
      dialog.addEventListener('pointerup', onPointerUp);
      removeFallback = () => {
        dialog.removeEventListener('pointerdown', onPointerDown);
        dialog.removeEventListener('pointerup', onPointerUp);
      };
    }

    return () => {
      active = false;
      dialog.removeEventListener('close', handleNativeClose);
      dialog.removeEventListener('cancel', handleCancel);
      removeFallback?.();
    };
  }, [closeAnimated]);

  const handleUpgrade = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await upgradePlan('pro');
      if (result?.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      setSuccessMsg('Paket Ultra Academic Pro berhasil diaktifkan!');
      setTimeout(() => {
        closeAnimated();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memulai pembayaran Stripe.');
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await cancelPlan();
      setSuccessMsg('Langganan telah dibatalkan kembali ke Free Access.');
      setTimeout(() => {
        closeAnimated();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal membatalkan paket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="dokmeh-dialog w-[calc(100%-1.5rem)] max-w-3xl"
      {...{ closedby: 'any' }}
    >
      <div className="bg-[#FFFFFF] border-2 border-[#0F172A] shadow-hard p-5 sm:p-8 space-y-6 relative text-[#334155]">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAnimated}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 border border-[#CBD5E1] bg-[#FFFFFF] text-[#64748B] hover:text-[#0F172A] hover:border-[#0F172A] cursor-pointer transition-colors"
          title="Tutup Modal"
          aria-label="Tutup Modal"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#D83995]/10 text-[#D83995] text-[10px] font-bold border border-[#D83995]/30 uppercase font-mono tracking-wider">
            <Crown size={12} />
            <span>Academic Tier & Quota</span>
          </div>
          <h2 id={titleId} className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Pilih Paket Riset Anda
          </h2>
          <p className="text-xs text-[#64748B]">
            Bandingkan kuota ringkasan AI dan akses unduhan naskah penuh untuk kebutuhan akademik Anda.
          </p>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs flex items-center gap-1.5">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Two-Column Plan Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* Free Tier Card */}
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#CBD5E1] flex flex-col">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 bg-[#FFFFFF] border border-[#CBD5E1] flex items-center justify-center text-[#0F172A]">
                  <BookOpen size={18} />
                </div>
                {!isPro && (
                  <span className="dokmeh-badge-primary font-mono">Paket Aktif</span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Free</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Untuk eksplorasi riset harian</p>
              </div>

              <div>
                <div className="text-2xl font-extrabold text-[#0F172A] font-mono tabular-nums">
                  Rp 0
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Gratis untuk seluruh mahasiswa & akademisi
                </p>
              </div>

              {!isPro ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-2 px-4 text-xs font-bold bg-[#FFFFFF] text-[#64748B] border border-[#CBD5E1] cursor-default"
                >
                  Paket Saat Ini
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="dokmeh-btn-secondary w-full !py-2 text-xs font-bold"
                >
                  {loading ? 'Memproses...' : 'Kembali ke Free'}
                </button>
              )}
            </div>

            <div className="border-t border-[#E2E8F0] my-5" />

            <ul className="space-y-2.5 text-xs text-[#334155]">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check size={14} className="text-[#0593C6] shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Tier Card */}
          <div className="p-5 sm:p-6 bg-[#FFFFFF] border-2 border-[#0F172A] shadow-hard-sm flex flex-col">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 bg-[#0593C6] text-white flex items-center justify-center shadow-hard-sm">
                  <Crown size={18} />
                </div>
                <span className={isPro ? 'dokmeh-badge-primary font-mono' : 'dokmeh-badge-active font-mono'}>
                  {isPro ? 'Paket Aktif' : 'Rekomendasi'}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Pro</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Untuk riset intensif tanpa batas</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-[#94A3B8] line-through tabular-nums">
                    Rp.74.999
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold font-mono uppercase bg-[#D83995]/10 text-[#D83995] border border-[#D83995]/30">
                    Hemat 53%
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-[#0F172A] font-mono tabular-nums">
                    Rp.34,999
                  </span>
                  <span className="text-xs text-[#64748B] font-mono">/bulan</span>
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Harga promo aktivasi Ultra Academic Pro
                </p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">
                  *harga belum termasuk pajak
                </p>
              </div>

              {!isPro ? (
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={loading}
                  autoFocus
                  className="dokmeh-btn-primary w-full !py-2 text-xs font-bold"
                >
                  <Sparkles size={14} />
                  <span>{loading ? 'Mengaktifkan...' : 'Aktifkan Pro'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full py-2 px-4 text-xs font-bold text-red-600 bg-[#FFFFFF] hover:bg-red-50 border border-red-300 transition-colors shadow-hard-sm cursor-pointer"
                >
                  {loading ? 'Membatalkan...' : 'Batalkan Langganan Pro'}
                </button>
              )}
            </div>

            <div className="border-t border-[#E2E8F0] my-5" />

            <div className="space-y-2.5 text-xs text-[#334155]">
              <p className="font-bold text-[#0F172A]">Semua di Free, ditambah:</p>
              <ul className="space-y-2.5">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={14} className="text-[#0593C6] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
