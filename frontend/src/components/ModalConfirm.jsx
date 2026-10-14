import React from 'react';

export default function ModalConfirm({ 
  isOpen, 
  title, 
  subtitle, 
  onConfirm, 
  onCancel, 
  confirmText = "Ya", 
  cancelText = "Tidak" 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <div 
        className="fixed inset-0 bg-black/25 backdrop-blur-[2px] transition-opacity" 
        onClick={onCancel} 
      />

      {/* Modal Dialog Card matching mockup */}
      <div className="relative bg-white w-full max-w-sm rounded-[28px] p-8 shadow-2xl z-10 flex flex-col items-center text-center animate-modal border border-gray-100">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug px-2 mb-2">
          {title}
        </h3>
        
        {subtitle && (
          <p className="text-sm font-semibold text-gray-800 mb-4">
            {subtitle}
          </p>
        )}

        <div className="flex items-center justify-center gap-4 mt-4 w-full">
          {/* Tidak / Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            className="w-24 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all text-sm tracking-wide"
          >
            {cancelText}
          </button>

          {/* Ya / Confirm Button */}
          <button
            type="button"
            onClick={onConfirm}
            className="w-24 py-2.5 bg-[#2ecc71] hover:bg-[#27ae60] active:scale-95 text-white font-bold rounded-xl shadow-md transition-all text-sm tracking-wide"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
