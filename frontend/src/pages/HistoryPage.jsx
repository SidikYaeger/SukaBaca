import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ArrowUpRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import SidebarDrawer from '../components/SidebarDrawer';
import ModalConfirm from '../components/ModalConfirm';
import { store } from '../services/store';

export default function HistoryPage({ onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0); // 0: closed, 1: confirm download, 2: success download
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [journals, setJournals] = useState([]);
  const navigate = useNavigate();

  const bgStyles = [
    'bg-gradient-to-tr from-[#80ed99] via-[#48cae4] to-[#0077b6]',
    'bg-gradient-to-br from-[#06d6a0] via-[#118ab2] to-[#ffd166]',
    'bg-gradient-to-tr from-[#9b5de5] via-[#00bbf9] to-[#d4a373]',
    'bg-[#90e0ef]'
  ];

  useEffect(() => {
    setJournals(store.getJournals());
  }, []);

  const handleDownloadClick = (journal, e) => {
    if (e) e.stopPropagation();
    setSelectedJournal(journal);
    setModalStep(1); // history-3 modal
  };

  const handleConfirmDownload = () => {
    if (selectedJournal) {
      store.incrementDownload(selectedJournal.id);
      
      // Trigger download
      const element = document.createElement("a");
      const file = new Blob([
        `===================================================\n` +
        `RINGKASAN JURNAL AKADEMIK - SUKABACA RIWAYAT\n` +
        `===================================================\n\n` +
        `Judul: ${selectedJournal.title}\n` +
        `Penulis: ${selectedJournal.author}\n` +
        `Tahun: ${selectedJournal.year || '2026'}\n\n` +
        `Ringkasan Eksekutif:\n` +
        `${selectedJournal.content || selectedJournal.snippet}\n`
      ], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `Riwayat_${selectedJournal.title.slice(0, 15).replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
    setModalStep(2); // history-4 modal
  };

  const handleViewDownloaded = () => {
    setModalStep(0);
    navigate(`/article/${selectedJournal?.id || 1}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ededed] min-h-screen pb-16">
      {/* Top Navbar with History Title */}
      <Navbar
        title="History"
        onMenuClick={() => setDrawerOpen(true)}
      />

      {/* Grid 2x2 of Journals (matching history.png) */}
      <div className="flex-1 px-4 sm:px-8 max-w-4xl mx-auto w-full mt-2">
        <div className="mb-4">
          <p className="text-xs text-gray-600 font-medium">
            Koleksi jurnal dan ringkasan yang telah diakses atau diunduh:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {journals.map((item, idx) => {
            const style = bgStyles[idx % bgStyles.length];
            return (
              <div 
                key={item.id} 
                className="flex flex-col group cursor-pointer"
                onClick={() => navigate(`/article/${item.id}`)}
              >
                {/* Graphic Cover Thumbnail Card */}
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

                {/* Card Footer: Title & Download Action */}
                <div className="flex items-center justify-between mt-2.5 px-1">
                  <span className="font-bold text-xs sm:text-sm text-gray-950 truncate max-w-[70%]">
                    {item.title}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDownloadClick(item, e)}
                    className="p-1.5 text-gray-900 hover:text-purple-700 active:scale-95 transition-all bg-white rounded-lg border border-gray-200 shadow-2xs hover:bg-purple-50"
                    title="Unduh Ringkasan"
                  >
                    <Download size={15} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={onLogout}
      />

      {/* Modal Step 1: Apakah anda ingin mengunduh <nama jurnal>? (history-3) */}
      <ModalConfirm
        isOpen={modalStep === 1}
        title={`Apakah anda ingin mengunduh <${selectedJournal?.title || 'nama jurnal'}>?`}
        subtitle="Berkas ringkasan terstruktur akan diunduh ke perangkat Anda."
        onConfirm={handleConfirmDownload}
        onCancel={() => setModalStep(0)}
        confirmText="Ya"
        cancelText="Tidak"
      />

      {/* Modal Step 2: Pengunduhan berhasil. Tampilkan hasil unduhan? (history-4) */}
      <ModalConfirm
        isOpen={modalStep === 2}
        title="Pengunduhan berhasil"
        subtitle="Tampilkan hasil ringkasan sekarang?"
        onConfirm={handleViewDownloaded}
        onCancel={() => setModalStep(0)}
        confirmText="Ya"
        cancelText="Tidak"
      />
    </div>
  );
}
