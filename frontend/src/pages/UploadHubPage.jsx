import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Search, Crown, History, PlusCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import SidebarDrawer from '../components/layout/SidebarDrawer';
import UpgradeModal from '../components/UpgradeModal';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

export default function UploadHubPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, remainingQuota, isPro } = useSubscription();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#334155] font-sans selection:bg-[#0593C6] selection:text-white">
      <Header onMenuClick={() => setDrawerOpen(true)} />
      <SidebarDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full space-y-8">
        
        {/* Scholar Banner */}
        <section className="p-6 sm:p-8 bg-[#F8FAFC] border-2 border-[#0F172A] shadow-hard flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#FFFFFF] border border-[#0F172A] text-xs font-semibold text-[#0593C6]">
              <span className="w-2 h-2 bg-[#0593C6]" />
              <span className="font-mono uppercase text-[11px] tracking-wider">Scholar Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Selamat Datang, {user || 'Peneliti'}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-xl">
              Pusat pengelolaan publikasi ilmiah, unggah naskah baru, periksa kuota ringkasan AI, dan pelacakan arsip riset Anda.
            </p>
          </div>

          {/* Subscription status card */}
          <div className="p-4 bg-[#FFFFFF] border border-[#0F172A] shadow-hard-sm min-w-[250px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B] uppercase font-mono text-[11px]">Paket:</span>
              <span className="text-xs font-bold text-[#D83995] flex items-center gap-1 uppercase font-mono">
                <Crown size={13} /> {subscription.plan}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#64748B] uppercase font-mono text-[11px]">Kuota Harian:</span>
              <span className="font-mono text-xs font-bold text-[#0593C6] bg-[#0593C6]/10 px-2 py-0.5 border border-[#0593C6]/30 tabular-nums">
                {remainingQuota} Sisa
              </span>
            </div>

            <button
              onClick={() => setShowUpgradeModal(true)}
              className="dokmeh-btn-primary w-full !py-1.5 text-xs font-bold mt-1"
            >
              <span>{isPro ? 'Kelola Paket' : 'Upgrade ke Pro'}</span>
            </button>
          </div>
        </section>

        {/* Action Hub Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Upload Journal */}
          <div
            onClick={() => navigate('/upload-form')}
            className="p-6 bg-[#FFFFFF] border border-[#CBD5E1] hover:border-[#0F172A] hover:shadow-hard cursor-pointer transition-all group space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-[#0593C6] text-white flex items-center justify-center shadow-hard-sm">
                <Upload size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#0593C6] transition-colors">
                Unggah Jurnal Baru
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Publikasikan naskah riset dalam format PDF atau DOCX dengan metadata lengkap dan ekstraksi teks otomatis.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#0593C6]">
              <span>Mulai Unggah →</span>
              <PlusCircle size={16} />
            </div>
          </div>

          {/* Card 2: Explore & Search */}
          <div
            onClick={() => navigate('/search')}
            className="p-6 bg-[#FFFFFF] border border-[#CBD5E1] hover:border-[#0F172A] hover:shadow-hard cursor-pointer transition-all group space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-[#D83995] text-white flex items-center justify-center shadow-hard-sm">
                <Search size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#0593C6] transition-colors">
                Jelajahi Repositori
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Temukan publikasi ilmiah lintas disiplin ilmu dengan fitur smart search, filter rentang tahun, dan metrik sitasi.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#0593C6]">
              <span>Cari Publikasi →</span>
            </div>
          </div>

          {/* Card 3: History & Bookmarks */}
          <div
            onClick={() => navigate('/history')}
            className="p-6 bg-[#FFFFFF] border border-[#CBD5E1] hover:border-[#0F172A] hover:shadow-hard cursor-pointer transition-all group space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-[#0F172A] text-white flex items-center justify-center shadow-hard-sm">
                <History size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#0593C6] transition-colors">
                Riwayat & Simpanan
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Akses cepat ke daftar artikel yang pernah Anda baca atau tandai sebagai referensi penting untuk penelitian mendatang.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#0593C6]">
              <span>Buka Riwayat →</span>
            </div>
          </div>

        </section>

      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}
