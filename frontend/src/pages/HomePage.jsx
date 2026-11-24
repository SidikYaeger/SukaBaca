import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import Header from '../components/layout/Header';
import { ACADEMIC_TOPICS, JOURNAL_CATEGORIES } from '../config/app.config';

export default function HomePage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();

  // Typing animation cycling through academic topics
  const [topicIndex, setTopicIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentTopic = ACADEMIC_TOPICS[topicIndex];
    let typingSpeed = isDeleting ? 45 : 90;

    if (!isDeleting && displayedText === currentTopic) {
      // Pause at full word before deleting
      const timeout = setTimeout(() => setIsDeleting(true), 1600);
      return () => clearTimeout(timeout);
    } else if (isDeleting && displayedText === '') {
      // Move to next topic after deletion
      setIsDeleting(false);
      setTopicIndex((prev) => (prev + 1) % ACADEMIC_TOPICS.length);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText((prev) =>
        isDeleting
          ? currentTopic.substring(0, prev.length - 1)
          : currentTopic.substring(0, prev.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, topicIndex]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchKeyword.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  const handleCategoryClick = (category) => {
    navigate(`/search?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#334155] font-sans selection:bg-[#0593C6] selection:text-white">
      {/* Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-14 md:py-20 w-full space-y-20">
        
        {/* Centered Hero & Search Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* High-Contrast Editorial Headline with Typing Animation */}
          <div className="reveal-item reveal-delay-1 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.15]">
              Discover{' '}
              <span className="text-[#0593C6] inline-block min-w-[200px] text-left sm:text-center">
                {displayedText}
                <span className="animate-pulse font-normal text-[#0593C6]">|</span>
              </span>
              .
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-2xl mx-auto font-normal">
              Akses publikasi ilmiah dan ringkasan berbasis AI.
            </p>
          </div>

          {/* Centered Unified Search Bar */}
          <form onSubmit={handleSearchSubmit} className="reveal-item reveal-delay-2 pt-2 max-w-2xl mx-auto">
            <div className="dokmeh-search-container">
              <SearchIcon size={18} className="text-[#64748B] shrink-0 mr-1.5" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Cari judul jurnal, topik riset, atau nama penulis..."
                className="dokmeh-search-input focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                className="dokmeh-btn-primary !py-2 !px-5 text-xs sm:text-sm ml-1"
              >
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Centered Academic Topics Pills */}
          <div className="reveal-item reveal-delay-3 pt-4 space-y-2.5">
            <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider block font-mono">
              Topik Riset Terpopuler
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {JOURNAL_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className="text-xs px-3 py-1.5 border border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F8FAFC] hover:border-[#0F172A] hover:text-[#0F172A] font-medium transition-all shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

        </section>

        {/* Feature Cards Section (No Boxed Icons) */}
        <section className="reveal-item reveal-delay-4 space-y-8 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F8FAFC] border border-[#CBD5E1] shadow-hard-sm space-y-2.5">
              <h3 className="text-base font-bold text-[#0F172A]">Smart Filter & Discovery</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Filter tahun publikasi, bidang studi dan urut berdasarkan jumlah pembaca/download.
              </p>
            </div>

            <div className="p-6 bg-[#F8FAFC] border border-[#CBD5E1] shadow-hard-sm space-y-2.5">
              <h3 className="text-base font-bold text-[#0F172A]">AI Literature Summarizer</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Ekstrak metodologi, temuan kunci, dan kesimpulan jurnal secara terstruktur dengan sistem pemrosesan bahasa alami.
              </p>
            </div>

            <div className="p-6 bg-[#F8FAFC] border border-[#CBD5E1] shadow-hard-sm space-y-2.5">
              <h3 className="text-base font-bold text-[#0F172A]">Peer Reviews & Discussions</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Tingkatkan efesiensi dan kualitas jurnal melalui catatan ulasan, pemberian rating bintang, dan diskusi terbuka antar sesama akademisi.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
