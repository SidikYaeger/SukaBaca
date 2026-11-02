import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Upload, Search, Crown, Sparkles, ArrowRight, Clock } from 'lucide-react';
import SidebarDrawer from '../components/SidebarDrawer';
import UpgradeModal from '../components/UpgradeModal';
import { store } from '../services/store';

export default function UploadHubPage({ onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subscription, setSubscription] = useState(store.getSubscription());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadSub = async () => {
      const sub = await store.fetchSubscription();
      if (isMounted && sub) {
        setSubscription(sub);
      }
    };
    loadSub();
    return () => { isMounted = false; };
  }, []);

  const handleUpgrade = async () => {
    const updated = await store.upgradeSubscription('Ultra Academic Pro');
    setSubscription(updated);
    setUpgradeSuccess(true);
    setTimeout(() => {
      setUpgradeSuccess(false);
      setShowUpgradeModal(false);
    }, 1500);
  };

  const remainingQuota = Math.max(0, subscription.dailyQuota - subscription.usedToday);
  const quotaPercent = Math.min(100, Math.round((subscription.usedToday / subscription.dailyQuota) * 100));

  return (
    <div className="flex-1 flex flex-col bg-[#ededed] min-h-screen relative">
      {/* Top Bar with Hamburger */}
      <header className="w-full flex items-center justify-between p-5 relative z-20">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-12 h-12 bg-white border border-gray-300 rounded-xl shadow-xs flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
          title="Buka Menu Navigasi"
        >
          <Menu size={24} strokeWidth={2.2} />
        </button>

        {/* Subscription Quota Pill */}
        <div 
          onClick={() => setShowUpgradeModal(true)}
          className="cursor-pointer bg-white border border-purple-200 px-3 py-1.5 rounded-full shadow-xs flex items-center gap-2 hover:border-purple-400 transition-all"
          title="Kelola Kuota & Langganan"
        >
          <Crown size={15} className="text-purple-600" />
          <span className="text-xs font-bold text-gray-800">
            {subscription.plan}
          </span>
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
            {remainingQuota} Sisa
          </span>
        </div>

        {/* Small subtle logo right */}
        <div 
          onClick={() => navigate('/home')} 
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src="/logo.png" alt="SukaBaca" className="h-8 w-auto opacity-80" />
        </div>
      </header>

      {/* Main Content Center */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-12 text-center max-w-lg mx-auto w-full">
        {/* Large Brand Logo */}
        <div className="mb-3">
          <img 
            src="/logo.png" 
            alt="SukaBaca" 
            className="w-48 sm:w-56 h-auto object-contain drop-shadow-xs mx-auto" 
          />
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-medium text-gray-900 max-w-xs sm:max-w-md mb-6">
          Upload your journal entries and get AI-powered summaries
        </p>

        {/* AI Quota Meter Card */}
        <div className="w-full bg-white rounded-2xl p-4 mb-6 shadow-xs border border-gray-200/80 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-600" />
              Kuota Ringkasan Harian
            </span>
            <span className="text-xs font-semibold text-purple-700">
              {subscription.usedToday} / {subscription.dailyQuota} Terpakai
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${quotaPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>Reset otomatis setiap 24 jam</span>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="text-purple-700 font-bold hover:underline"
            >
              Upgrade Kuota
            </button>
          </div>
        </div>

        {/* Two Action Buttons side by side (matching upload.png) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full mb-6">
          {/* Upload Journal Button */}
          <button
            onClick={() => navigate('/upload-form')}
            className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl text-white font-bold text-xs sm:text-sm shadow hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
              border: '1px solid #333333'
            }}
          >
            <Upload size={18} strokeWidth={2.5} />
            <span>Upload Journal</span>
          </button>

          {/* Search Journal Button */}
          <button
            onClick={() => navigate('/search')}
            className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-white text-gray-900 font-bold text-xs sm:text-sm shadow border border-purple-400 hover:bg-gray-50 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Search size={18} strokeWidth={2.5} />
            <span>Search Journal</span>
          </button>
        </div>

        {/* Quick Shortcut to History */}
        <div 
          onClick={() => navigate('/history')}
          className="w-full bg-white/70 hover:bg-white rounded-xl p-3 border border-gray-200/60 shadow-2xs flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
            <Clock size={16} className="text-gray-500" />
            <span>Lihat Riwayat & Koleksi Jurnal Anda</span>
          </div>
          <ArrowRight size={16} className="text-gray-400" />
        </div>
      </div>

      {/* Upgrade Subscription Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        upgradeSuccess={upgradeSuccess}
      />

      {/* Sidebar Drawer */}
      <SidebarDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        onLogout={onLogout}
      />
    </div>
  );
}
