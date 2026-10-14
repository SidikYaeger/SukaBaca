import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import Navbar from '../components/Navbar';
import SidebarDrawer from '../components/SidebarDrawer';
import ModalConfirm from '../components/ModalConfirm';

export default function HistoryPage({ onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0); // 0: closed, 1: confirm download, 2: success download
  const [selectedJournal, setSelectedJournal] = useState(null);
  const navigate = useNavigate();

  const historyItems = [
    {
      id: 'A',
      title: 'Jurnal A',
      year: '2025',
      // Sunburst blue/lime gradient
      bgStyle: 'bg-gradient-to-tr from-[#80ed99] via-[#48cae4] to-[#0077b6]',
      pattern: (
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      )
    },
    {
      id: 'B',
      title: 'Jurnal B',
      year: '2025',
      // Emerald / warm sand gradient
      bgStyle: 'bg-gradient-to-br from-[#06d6a0] via-[#118ab2] to-[#ffd166]',
      pattern: null
    },
    {
      id: 'C',
      title: 'Jurnal C',
      year: '2025',
      // Purple / Blue / Ochre
      bgStyle: 'bg-gradient-to-tr from-[#9b5de5] via-[#00bbf9] to-[#d4a373]',
      pattern: null
    },
    {
      id: 'D',
      title: 'Jurnal D',
      year: '2025',
      // Mint with polka dots
      bgStyle: 'bg-[#90e0ef]',
      pattern: (
        <div className="absolute inset-0 flex flex-wrap gap-4 p-4 items-center justify-around opacity-60">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-[#0077b6]" />
          ))}
        </div>
      )
    },
  ];

  const handleDownloadClick = (journal) => {
    setSelectedJournal(journal);
    setModalStep(1); // history-3 modal
  };

  const handleConfirmDownload = () => {
    setModalStep(2); // history-4 modal
  };

  const handleViewDownloaded = () => {
    setModalStep(0);
    navigate('/article/1');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ededed] min-h-screen pb-12">
      {/* Top Navbar with History Title */}
      <Navbar
        title="History"
        onMenuClick={() => setDrawerOpen(true)}
      />

      {/* Grid 2x2 of Journals (matching history.png) */}
      <div className="flex-1 px-4 sm:px-8 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-2">
          {historyItems.map((item) => (
            <div key={item.id} className="flex flex-col">
              {/* Graphic Cover Thumbnail Card */}
              <div 
                onClick={() => handleDownloadClick(item)}
                className={`w-full aspect-[4/3] rounded-2xl ${item.bgStyle} relative overflow-hidden shadow-sm cursor-pointer hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center`}
              >
                {item.pattern}
              </div>

              {/* Card Footer: Title & Download Action */}
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="font-bold text-xs sm:text-sm text-gray-950">
                  {item.title}
                </span>

                <button
                  type="button"
                  onClick={() => handleDownloadClick(item)}
                  className="flex items-center gap-1.5 text-gray-900 hover:text-purple-700 active:scale-95 transition-all"
                  title="Unduh Jurnal"
                >
                  <Download size={17} strokeWidth={2.4} />
                  <span className="text-[11px] sm:text-xs font-semibold text-gray-700">
                    {item.year}
                  </span>
                </button>
              </div>
            </div>
          ))}
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
        onConfirm={handleConfirmDownload}
        onCancel={() => setModalStep(0)}
        confirmText="Ya"
        cancelText="Tidak"
      />

      {/* Modal Step 2: Pengunduhan berhasil. Tampilkan hasil unduhan? (history-4) */}
      <ModalConfirm
        isOpen={modalStep === 2}
        title="Pengunduhan berhasil"
        subtitle="Tampilkan hasil unduhan?"
        onConfirm={handleViewDownloaded}
        onCancel={() => setModalStep(0)}
        confirmText="Ya"
        cancelText="Tidak"
      />
    </div>
  );
}
