import React from 'react';
import { Crown, CheckCircle } from 'lucide-react';
import useAnimatedPresence from '../hooks/useAnimatedPresence';

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  upgradeSuccess 
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
          Upgrade Subscription SukaBaca
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Dapatkan ringkasan tak terbatas dan akses prioritas AI model untuk riset jurnal IMPAL Anda.
        </p>

        <div className="bg-purple-50/80 rounded-2xl p-4 text-left border border-purple-100 mb-5 space-y-2 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-purple-600 flex-shrink-0" />
            <span>Unlimited ringkasan jurnal harian</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-purple-600 flex-shrink-0" />
            <span>Dukungan AI Engine Gemini 1.5 & GPT-4</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-purple-600 flex-shrink-0" />
            <span>Export format PDF, DOCX, dan Plain Text</span>
          </div>
        </div>

        {upgradeSuccess ? (
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs border border-emerald-200">
            Berhasil Upgrade ke Ultra Academic Pro!
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95"
            >
              Batal
            </button>
            <button
              onClick={onUpgrade}
              className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow hover:opacity-95 active:scale-95"
              style={{
                background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
              }}
            >
              Aktifkan Pro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
