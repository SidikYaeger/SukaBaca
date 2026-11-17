import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ArrowUpRight, FileText, Bookmark, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import SidebarDrawer from '../components/SidebarDrawer';
import ModalConfirm from '../components/ModalConfirm';
import { store } from '../services/store';

const TABS = [
  { key: 'ALL', label: 'Semua' },
  { key: 'UPLOADED', label: 'Diunggah' },
  { key: 'VIEWED', label: 'Dilihat' },
  { key: 'DOWNLOADED', label: 'Diunduh' },
  { key: 'SUMMARIZED', label: 'Diringkas' },
  { key: 'SAVED', label: 'Tersimpan' }
];

const ACTION_LABELS = {
  UPLOADED: 'Diunggah',
  VIEWED: 'Dilihat',
  DOWNLOADED: 'Diunduh',
  SUMMARIZED: 'Diringkas',
  SAVED: 'Tersimpan'
};

const formatTimestamp = (value) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function HistoryPage({ onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [savedJournals, setSavedJournals] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const bgStyles = [
    'bg-gradient-to-tr from-[#80ed99] via-[#48cae4] to-[#0077b6]',
    'bg-gradient-to-br from-[#06d6a0] via-[#118ab2] to-[#ffd166]',
    'bg-gradient-to-tr from-[#9b5de5] via-[#00bbf9] to-[#d4a373]',
    'bg-[#90e0ef]'
  ];

  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      try {
        const [hist, saved] = await Promise.all([
          store.fetchHistory(),
          store.fetchSavedJournals()
        ]);
        if (isMounted) {
          setHistoryItems(Array.isArray(hist) ? hist : []);
          setSavedJournals(Array.isArray(saved) ? saved : []);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg(err.message || 'Gagal memuat riwayat aktivitas');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadHistory();
    return () => { isMounted = false; };
  }, []);

  const handleDownloadClick = (journal, e) => {
    if (e) e.stopPropagation();
    setSelectedJournal(journal);
    setModalStep(1);
  };

  const handleConfirmDownload = async () => {
    if (selectedJournal) {
      await store.apiRecordDownload(selectedJournal.id);

      const element = document.createElement("a");
      let objectUrl = null;
      if (selectedJournal.fileName) {
        element.href = store.getJournalFileUrl(selectedJournal.id, true);
        element.download = selectedJournal.fileName;
      } else {
        const file = new Blob([
          `===================================================\n` +
          `JURNAL AKADEMIK - SUKABACA RIWAYAT\n` +
          `===================================================\n\n` +
          `Judul: ${selectedJournal.title}\n` +
          `Penulis: ${selectedJournal.author}\n` +
          `Tahun: ${selectedJournal.year || '2026'}\n\n` +
          `Isi:\n` +
          `${selectedJournal.abstract || selectedJournal.content || selectedJournal.snippet}\n`
        ], { type: 'text/plain;charset=utf-8' });
        objectUrl = URL.createObjectURL(file);
        element.href = objectUrl;
        element.download = `Riwayat_${selectedJournal.title.slice(0, 15).replace(/\s+/g, '_')}.txt`;
      }
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      if (objectUrl) {
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      }
    }
    setModalStep(2);
  };

  const handleViewDownloaded = () => {
    setModalStep(0);
    navigate(`/journal/${selectedJournal?.id || 1}`);
  };

  const displayItems = activeTab === 'SAVED'
    ? savedJournals.map((j) => ({ key: `saved-${j.id}`, actionType: 'SAVED', createdAt: j.savedAt || j.date, journal: j }))
    : historyItems
        .filter((h) => activeTab === 'ALL' || h.actionType === activeTab)
        .map((h) => ({ key: `hist-${h.historyId}`, actionType: h.actionType, createdAt: h.createdAt, journal: h.journal }));

  return (
    <div className="page-enter flex-1 flex flex-col bg-[#ededed] min-h-screen pb-16">
      <Navbar
        title="History"
        onMenuClick={() => setDrawerOpen(true)}
      />

      <div className="flex-1 px-4 sm:px-8 max-w-4xl mx-auto w-full mt-2">
        <div className="mb-4">
          <p className="text-xs text-gray-600 font-medium mb-3">
            Aktivitas terbaru Anda pada setiap jurnal (unggahan, bacaan, unduhan, ringkasan, dan tersimpan):
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#2b1055] text-white border-[#2b1055]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-sm font-semibold text-gray-500">Memuat riwayat aktivitas...</p>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-8 sm:p-10 text-center">
            {activeTab === 'SAVED' ? (
              <Bookmark size={44} className="mx-auto text-purple-400 mb-3" strokeWidth={1.6} />
            ) : (
              <FileText size={44} className="mx-auto text-purple-400 mb-3" strokeWidth={1.6} />
            )}
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">
              {activeTab === 'SAVED' ? 'Maaf, belum ada jurnal tersimpan' : 'Maaf, belum ada riwayat aktivitas'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-6">
              {activeTab === 'SAVED'
                ? 'Klik tombol Simpan pada halaman pencarian atau detail jurnal untuk menyimpannya di sini.'
                : 'Belum ada aktivitas pada kategori ini. Mulai unggah atau baca jurnal terlebih dahulu.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/upload-form')}
                className="py-2.5 px-5 rounded-xl text-white font-bold text-xs sm:text-sm shadow hover:opacity-95 active:scale-95"
                style={{
                  background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
                  border: '1px solid #333333'
                }}
              >
                Unggah Jurnal
              </button>
              <button
                type="button"
                onClick={() => navigate('/search')}
                className="py-2.5 px-5 rounded-xl bg-white hover:bg-gray-50 text-gray-900 font-bold text-xs sm:text-sm shadow border border-purple-400 active:scale-95"
              >
                Cari Jurnal
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {displayItems.map((entry, idx) => {
              const item = entry.journal;
              const style = bgStyles[idx % bgStyles.length];
              const stagger = Math.min(idx + 1, 10);
              return (
                <div 
                  key={entry.key} 
                  className={`card-reveal card-reveal-${stagger} flex flex-col group cursor-pointer`}
                  onClick={() => navigate(`/journal/${item.id}`)}
                >
                  <div 
                    className={`w-full aspect-[4/3] rounded-2xl ${style} relative overflow-hidden shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between p-3.5 sm:p-4 text-white`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[10px] font-extrabold bg-black/35 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {ACTION_LABELS[entry.actionType] || item.formatFile || 'PDF'}
                      </span>
                      <span className="text-white/80 group-hover:text-white transition-colors">
                        <ArrowUpRight size={18} />
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold line-clamp-2 drop-shadow-sm leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-white/80 mt-0.5 truncate">
                        {item.author}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start justify-between mt-2.5 px-1 gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-gray-950 truncate block">
                        {item.title}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-medium mt-0.5">
                        <Clock size={11} className="text-gray-400 flex-shrink-0" />
                        <span>{formatTimestamp(entry.createdAt)}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDownloadClick(item, e)}
                      className="p-1.5 text-gray-900 hover:text-purple-700 active:scale-95 transition-all bg-white rounded-lg border border-gray-200 shadow-2xs hover:bg-purple-50 flex-shrink-0"
                      title="Unduh Jurnal"
                    >
                      <Download size={15} strokeWidth={2.4} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SidebarDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={onLogout}
      />

      <ModalConfirm
        isOpen={modalStep > 0}
        title={
          modalStep === 1
            ? `Apakah anda ingin mengunduh <${selectedJournal?.title || 'nama jurnal'}>?`
            : "Pengunduhan berhasil"
        }
        subtitle={
          modalStep === 1
            ? "Berkas jurnal akan diunduh ke perangkat Anda."
            : "Buka halaman jurnal sekarang?"
        }
        onConfirm={modalStep === 1 ? handleConfirmDownload : handleViewDownloaded}
        onCancel={() => setModalStep(0)}
        confirmText="Ya"
        cancelText="Tidak"
      />
    </div>
  );
}
