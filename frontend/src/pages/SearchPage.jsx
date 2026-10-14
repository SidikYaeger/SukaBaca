import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, User, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import SidebarDrawer from '../components/SidebarDrawer';
import ModalConfirm from '../components/ModalConfirm';

export default function SearchPage({ onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0); // 0: none, 1: confirm, 2: success
  const [selectedJournal, setSelectedJournal] = useState(null);
  const navigate = useNavigate();

  const journalList = [
    {
      id: 1,
      title: 'Fundamental to sahrul',
      snippet: 'Started the day with meditation and reflection on recent goals...',
      author: 'Adira',
      date: 'Dec 32, 2025',
    },
    {
      id: 2,
      title: 'Fundamental to sahrul',
      snippet: 'Started the day with meditation and reflection on recent goals...',
      author: 'Adira',
      date: 'Dec 32, 2025',
    },
    {
      id: 3,
      title: 'Fundamental to sahrul',
      snippet: 'Started the day with meditation and reflection on recent goals...',
      author: 'Adira',
      date: 'Dec 32, 2025',
    },
    {
      id: 4,
      title: 'Fundamental to sahrul',
      snippet: 'Started the day with meditation and reflection on recent goals...',
      author: 'Adira',
      date: 'Dec 32, 2025',
    },
  ];

  const filteredJournals = journalList.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (journal) => {
    setSelectedJournal(journal);
    setModalStep(1); // search-2 modal
  };

  const handleConfirmSummarize = () => {
    setModalStep(2); // search-3 modal
  };

  const handleViewArticle = () => {
    setModalStep(0);
    navigate(`/article/${selectedJournal?.id || 1}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ededed] min-h-screen pb-10">
      {/* Top Bar with Search Pill and Logo */}
      <Navbar
        onMenuClick={() => setDrawerOpen(true)}
        centerContent={
          <div className="w-full max-w-sm sm:max-w-md bg-black rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
            <SearchIcon size={18} className="text-gray-300 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title"
              className="bg-transparent text-white placeholder-gray-400 text-xs sm:text-sm outline-none w-full"
            />
          </div>
        }
      />

      {/* Journal Cards List (matching search.png) */}
      <div className="flex-1 px-4 sm:px-8 max-w-3xl mx-auto w-full space-y-4 mt-2">
        {filteredJournals.map((journal, idx) => (
          <div
            key={idx}
            onClick={() => handleCardClick(journal)}
            className="w-full bg-[#7a7a7a] hover:bg-[#6e6e6e] active:scale-[0.99] rounded-2xl p-4 sm:p-5 text-gray-950 shadow-sm cursor-pointer transition-all"
          >
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-black mb-1">
              {journal.title}
            </h3>

            <p className="text-xs sm:text-sm text-gray-900 font-medium mb-4 line-clamp-1">
              {journal.snippet}
            </p>

            <div className="flex items-center gap-4 text-xs font-semibold text-black">
              <div className="flex items-center gap-1.5">
                <User size={15} strokeWidth={2.5} />
                <span>{journal.author}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar size={15} strokeWidth={2.5} />
                <span>{journal.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={onLogout}
      />

      {/* Modal Step 1: Apakah anda ingin meringkas <nama jurnal>? (search-2) */}
      <ModalConfirm
        isOpen={modalStep === 1}
        title={`Apakah anda ingin meringkas <${selectedJournal?.title || 'nama jurnal'}>?`}
        onConfirm={handleConfirmSummarize}
        onCancel={() => setModalStep(0)}
        confirmText="Ya"
        cancelText="Tidak"
      />

      {/* Modal Step 2: Jurnal sudah teringkas. Tampilkan? (search-3) */}
      <ModalConfirm
        isOpen={modalStep === 2}
        title="Jurnal sudah teringkas"
        subtitle="Tampilkan?"
        onConfirm={handleViewArticle}
        onCancel={() => setModalStep(0)}
        confirmText="Ya"
        cancelText="Tidak"
      />
    </div>
  );
}
