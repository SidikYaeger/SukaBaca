import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, History, Home, Upload, LogOut } from 'lucide-react';

export default function SidebarDrawer({ isOpen, onClose, onLogout }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Sidebar */}
      <div className="relative w-24 bg-white/95 backdrop-blur shadow-2xl h-full flex flex-col justify-between py-6 items-center z-10 border-r border-gray-100">
        {/* Top Action Icons */}
        <div className="flex flex-col items-center space-y-4 w-full">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-xl border border-gray-300 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
            title="Tutup Menu"
          >
            <X size={26} strokeWidth={2.2} />
          </button>

          {/* History button */}
          <button 
            onClick={() => { navigate('/history'); onClose(); }}
            className="w-12 h-12 rounded-xl border border-gray-300 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
            title="Riwayat Jurnal"
          >
            <History size={24} strokeWidth={2.2} />
          </button>

          {/* Home button */}
          <button 
            onClick={() => { navigate('/upload'); onClose(); }}
            className="w-12 h-12 rounded-xl border border-gray-300 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-800"
            title="Dashboard Utama"
          >
            <Home size={24} strokeWidth={2.2} fill="currentColor" />
          </button>

          {/* Upload button */}
          <button 
            onClick={() => { navigate('/upload-form'); onClose(); }}
            className="w-12 h-12 rounded-xl border border-gray-300 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
            title="Unggah Jurnal"
          >
            <Upload size={24} strokeWidth={2.2} />
          </button>
        </div>

        {/* Bottom Logout Button */}
        <div className="w-full px-2">
          <button 
            onClick={() => {
              if (onLogout) onLogout();
              navigate('/login');
              onClose();
            }}
            className="w-full py-2.5 px-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-1.5 text-xs transition-all tracking-wide"
            title="Keluar Akun"
          >
            <LogOut size={16} strokeWidth={2.5} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
