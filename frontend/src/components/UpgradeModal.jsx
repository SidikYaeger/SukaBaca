import React, { useState } from 'react';
import { X, Check, Crown, Sparkles, CheckCircle2 } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

export default function UpgradeModal({ onClose }) {
  const { subscription, isPro, upgradePlan, cancelPlan } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpgrade = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await upgradePlan('Ultra Academic Pro');
      setSuccessMsg('Paket Ultra Academic Pro berhasil diaktifkan!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memperbarui langganan.');
    } finally {
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
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal membatalkan paket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border-2 border-[#0F172A] shadow-hard max-w-lg w-full p-6 sm:p-8 space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 border border-[#CBD5E1] bg-[#FFFFFF] text-[#64748B] hover:text-[#0F172A] hover:border-[#0F172A]"
          title="Tutup Modal"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#D83995]/10 text-[#D83995] text-[10px] font-bold border border-[#D83995]/30 uppercase font-mono tracking-wider">
            <Crown size={12} />
            <span>Academic Tier & Quota</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Tingkatkan Kapasitas Riset Anda
          </h2>
          <p className="text-xs text-[#64748B]">
            Dapatkan kuota inferensi tak terbatas untuk sintesis ringkasan jurnal dan unduhan naskah penuh.
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
            <CheckCircle2 size={14} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Feature Comparison Box */}
        <div className="p-5 bg-[#F8FAFC] border border-[#CBD5E1] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#0F172A] font-mono uppercase">Paket Saat Ini:</span>
            <span className="font-mono text-xs font-bold text-[#0593C6] bg-[#FFFFFF] px-2 py-0.5 border border-[#CBD5E1]">
              {subscription.plan}
            </span>
          </div>

          <div className="space-y-2 text-xs text-[#334155]">
            <div className="flex items-center gap-2">
              <Check size={14} className="text-[#0593C6] shrink-0" />
              <span>Akses Penuh ke 1.2M+ Repositori Publikasi</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={14} className="text-[#0593C6] shrink-0" />
              <span>{isPro ? 'Ringkasan Saintifik AI Tanpa Batas' : '5 Ringkasan Saintifik AI per Hari'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={14} className="text-[#0593C6] shrink-0" />
              <span>Ekspor Ringkasan Format PDF Resmi</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isPro ? (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="dokmeh-btn-primary w-full !py-2.5 text-xs sm:text-sm font-bold shadow-hard flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              <span>{loading ? 'Mengaktifkan...' : 'Aktifkan Ultra Academic Pro'}</span>
            </button>
          ) : (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-300 transition-colors shadow-hard-sm"
            >
              {loading ? 'Membatalkan...' : 'Batalkan Langganan Pro'}
            </button>
          )}

          <button
            onClick={onClose}
            className="dokmeh-btn-secondary w-full text-xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
