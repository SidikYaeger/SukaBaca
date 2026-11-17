import React from 'react';
import { Crown, CheckCircle, AlertCircle } from 'lucide-react';
import useAnimatedPresence from '../hooks/useAnimatedPresence';

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  onUpgrade,
  onCancelPlan,
  isPro = false,
  upgradeSuccess,
  errorMessage = ''
}) {
  const { isMounted, isExiting } = useAnimatedPresence(isOpen, 220);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className={`fixed inset-0 bg-black/40 cursor-pointer ${
          isExiting ? 'animate-backdrop-out' : 'animate-backdrop-in'
        }`}
        onClick={onClose}
      />

      <div 
        className={`relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center z-10 ${
          isExiting ? 'animate-modal-out' : 'animate-modal-in'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 mx-auto mb-3 flex items-center justify-center">
          <Crown size={28} />
        </div>

        <h3 className="text-lg font-extrabold text-gray-900 mb-1">
          {isPro ? 'Kelola Paket Pro SukaBaca' : 'Upgrade Subscription SukaBaca'}
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          {isPro
            ? 'Anda saat ini menikmati akses penuh Pro SukaBaca AI dan kuota ringkasan tak terbatas.'
            : 'Dapatkan ringkasan tak terbatas serta akses model penalaran lanjut Pro SukaBaca AI.'}
        </p>

        <div className="bg-purple-50/80 rounded-2xl p-4 text-left border border-purple-100 mb-5 space-y-2 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-purple-600 flex-shrink-0" />
            <span>Unlimited ringkasan jurnal harian</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-purple-600 flex-shrink-0" />
            <span>Akses penuh Pro SukaBaca AI</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-purple-600 flex-shrink-0" />
            <span>Pemrosesan otomatis dokumen akademik panjang</span>
          </div>
        </div>

        {errorMessage && (
          <div role="alert" className="mb-3 p-2.5 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 flex items-center gap-2 text-left">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {upgradeSuccess ? (
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs border border-emerald-200">
            Status langganan berhasil diperbarui!
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95"
            >
              Tutup
            </button>
            {isPro ? (
              <button
                type="button"
                onClick={onCancelPlan}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow active:scale-95"
              >
                Batalkan Pro
              </button>
            ) : (
              <button
                type="button"
                onClick={onUpgrade}
                className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow hover:opacity-95 active:scale-95"
                style={{
                  background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
                }}
              >
                Aktifkan Pro
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
