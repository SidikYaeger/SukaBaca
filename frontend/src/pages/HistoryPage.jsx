import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Bookmark, ArrowLeft, BookOpen } from 'lucide-react';
import Header from '../components/layout/Header';
import SidebarDrawer from '../components/layout/SidebarDrawer';
import JournalCard from '../components/journal/JournalCard';
import { Skeleton } from '../components/common/UIPrimitives';
import { journalService } from '../services/journal.service';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' or 'history'
  const [savedJournals, setSavedJournals] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const [saved, hist] = await Promise.all([
          journalService.getUserBookmarks(),
          journalService.getUserHistory()
        ]);
        if (!isMounted) return;
        setSavedJournals(saved);
        setReadingHistory(hist);
      } catch {
        // Fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleToggleBookmark = async (id) => {
    try {
      await journalService.toggleBookmark(id);
      setSavedJournals((prev) => prev.filter((j) => j.id !== id));
    } catch {
      // Ignore
    }
  };

  const currentList = activeTab === 'saved' ? savedJournals : readingHistory;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#334155] font-sans selection:bg-[#0593C6] selection:text-white">
      <Header onMenuClick={() => setDrawerOpen(true)} />
      <SidebarDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full space-y-6">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/upload')}
            className="dokmeh-btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Workspace</span>
          </button>

          <span className="text-xs text-[#64748B] font-mono uppercase tracking-wider">
            Personal Archive
          </span>
        </div>

        {/* Tab Selector */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8FAFC] border border-[#CBD5E1] shadow-hard-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border transition-all ${
                activeTab === 'saved'
                  ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-hard-sm'
                  : 'bg-[#FFFFFF] text-[#64748B] border-[#CBD5E1] hover:text-[#0F172A]'
              }`}
            >
              <Bookmark size={14} />
              <span className="tabular-nums">Jurnal Tersimpan ({savedJournals.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border transition-all ${
                activeTab === 'history'
                  ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-hard-sm'
                  : 'bg-[#FFFFFF] text-[#64748B] border-[#CBD5E1] hover:text-[#0F172A]'
              }`}
            >
              <History size={14} />
              <span className="tabular-nums">Riwayat Baca ({readingHistory.length})</span>
            </button>
          </div>

          <span className="text-xs text-[#64748B]">
            {activeTab === 'saved'
              ? 'Daftar jurnal yang ditandai untuk referensi mendatang.'
              : 'Daftar publikasi yang telah Anda telaah sebelumnya.'}
          </span>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 bg-white border border-[#E2E8F0] space-y-3">
                <Skeleton className="w-20 h-5" />
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-full h-12" />
              </div>
            ))}
          </div>
        ) : currentList.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-3 border border-[#CBD5E1] bg-[#F8FAFC]">
            <BookOpen size={32} className="mx-auto text-[#0F172A]" />
            <h3 className="text-base font-bold text-[#0F172A]">
              {activeTab === 'saved' ? 'Belum Ada Jurnal Tersimpan' : 'Riwayat Baca Masih Kosong'}
            </h3>
            <p className="max-w-md mx-auto leading-relaxed">
              Jelajahi repositori publikasi dan temukan karya ilmiah yang relevan dengan topik riset Anda.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="dokmeh-btn-primary !py-2 !px-4 text-xs font-semibold"
            >
              Cari Jurnal Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((journal) => (
              <JournalCard
                key={journal.id}
                journal={{ ...journal, isSaved: activeTab === 'saved' ? true : journal.isSaved }}
                onToggleBookmark={activeTab === 'saved' ? handleToggleBookmark : null}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
