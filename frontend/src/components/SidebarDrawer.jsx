import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, History, Home, Upload, Search, LogOut, Crown } from 'lucide-react';
import { store } from '../services/store';

export default function SidebarDrawer({ isOpen, onClose, onLogout }) {
  const navigate = useNavigate();
  const auth = store.getAuth();
  const sub = store.getSubscription();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/25 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Sidebar */}
      <div className="relative w-28 sm:w-32 bg-white/95 backdrop-blur shadow-2xl h-full flex flex-col justify-between py-6 items-center z-10 border-r border-gray-100">
        {/* Top Action Icons */}
        <div className="flex flex-col items-center space-y-3.5 w-full px-2">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-xl border border-gray-300 bg-white shadow-xs flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
            title="Tutup Menu"
          >
            <X size={24} strokeWidth={2.2} />
          </button>

          {/* User Profile Mini Badge */}
          <div className="w-full py-2 px-1 bg-purple-50 rounded-xl flex flex-col items-center text-center border border-purple-100 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs mb-1">
              {(auth.user || 'G').slice(0, 1).toUpperCase()}
            </div>
            <span className="text-[11px] font-bold text-gray-900 truncate max-w-full">
              {auth.user || 'Glen'}
            </span>
            <span className="text-[9px] font-semibold text-purple-700 flex items-center gap-0.5 mt-0.5">
              <Crown size={10} /> {sub.plan || 'Pro'}
            </span>
          </div>

          {/* History button */}
          <button 
            onClick={() => { navigate('/history'); onClose(); }}
            className="w-12 h-12 rounded-xl border border-gray-300 bg-white shadow-xs flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
            title="Riwayat Jurnal"
          >
            <History size={22} strokeWidth={2.2} />
          </button>

          {/* Home button */}
          <button 
            onClick={() => { navigate('/upload'); onClose(); }}
            className="w-12 h-12 rounded-xl border border-gray-300 bg-white shadow-xs flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-800"
            title="Dashboard Utama"
          >
            <Home size={22} strokeWidth={2.2} fill="currentColor" />
          </button>

          {/* Upload button */}
          <button 
            onClick={() => { navigate('/upload-form'); onClose(); }}
            className="w-12 h-12 rounded-xl border border-gray-300 bg-white shadow-xs flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
            title="Unggah Jurnal"
          >
            <Upload size={22} strokeWidth={2.2} />
          </button>

          {/* Search button */}
          <button 
            onClick={() => { navigate('/search'); onClose(); }}
            className="w-12 h-12 rounded-xl border border-gray-300 bg-white shadow-xs flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
            title="Cari Jurnal"
          >
            <Search size={22} strokeWidth={2.2} />
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
            className="w-full py-2.5 px-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold rounded-xl shadow flex items-center justify-center gap-1.5 text-xs transition-all tracking-wide"
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
