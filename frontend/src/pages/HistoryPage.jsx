import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ArrowUpRight, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import SidebarDrawer from '../components/SidebarDrawer';
import ModalConfirm from '../components/ModalConfirm';
import { store } from '../services/store';

export default function HistoryPage({ onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const bgStyles = [
    'bg-gradient-to-tr from-[#80ed99] via-[#48cae4] to-[#0077b6]',
    'bg-gradient-to-br from-[#06d6a0] via-[#118ab2] to-[#ffd166]',
    'bg-gradient-to-tr from-[#9b5de5] via-[#00bbf9] to-[#d4a373]',
    'bg-[#90e0ef]'
  ];

  useEffect(() => {
    let isMounted = true;
    const loadJournals = async () => {
      const data = await store.fetchJournals();
      if (isMounted) {
        setJournals(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    };
    loadJournals();
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
          `RINGKASAN JURNAL AKADEMIK - SUKABACA RIWAYAT\n` +
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

  return (
    <div className="page-enter flex-1 flex flex-col bg-[#ededed] min-h-screen pb-16">
      {/* Top Navbar with History Title */}
      <Navbar
        title="History"
        onMenuClick={() => setDrawerOpen(true)}
      />

      <div className="flex-1 px-4 sm:px-8 max-w-4xl mx-auto w-full mt-2">
        <div className="mb-4">
          <p className="text-xs text-gray-600 font-medium">
            Koleksi jurnal dan ringkasan yang tersedia di database:
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-sm font-semibold text-gray-500">Memuat riwayat jurnal...</p>
          </div>
        ) : journals.length === 0 ? (
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-8 sm:p-10 text-center">
            <FileText size={44} className="mx-auto text-purple-400 mb-3" strokeWidth={1.6} />
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">
              Maaf, belum ada riwayat jurnal
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-6">
              Database jurnal saat ini masih kosong. Silakan unggah jurnal terlebih dahulu.
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
            {journals.map((item, idx) => {
              const style = bgStyles[idx % bgStyles.length];
              const stagger = Math.min(idx + 1, 10);
              return (
                <div 
                  key={item.id} 
                  className={`card-reveal card-reveal-${stagger} flex flex-col group cursor-pointer`}
                  onClick={() => navigate(`/journal/${item.id}`)}
                >
                  <div 
                    className={`w-full aspect-[4/3] rounded-2xl ${style} relative overflow-hidden shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between p-3.5 sm:p-4 text-white`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-extrabold bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.formatFile || 'PDF'}
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

                  <div className="flex items-center justify-between mt-2.5 px-1">
                    <span className="font-bold text-xs sm:text-sm text-gray-950 truncate max-w-[70%]">
                      {item.title}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDownloadClick(item, e)}
                      className="p-1.5 text-gray-900 hover:text-purple-700 active:scale-95 transition-all bg-white rounded-lg border border-gray-200 shadow-2xs hover:bg-purple-50"
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

      {/* Sidebar Drawer */}
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
            ? "Berkas ringkasan terstruktur akan diunduh ke perangkat Anda."
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
