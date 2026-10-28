import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { store } from '../services/store';

export default function HomePage({ isAuthenticated = false, onLogout }) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();
  const auth = store.getAuth();
  const isUserLoggedIn = isAuthenticated || auth.isAuthenticated;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleTopicClick = (topic) => {
    navigate(`/search?q=${encodeURIComponent(topic)}`);
  };

  const topics = [
    'Engineering', 'Mathematics', 'Biology',
    'Computer Science', 'Climate Change',
    'Medicine', 'Physics', 'Social Science',
    'Astrophysics', 'Chemistry'
  ];

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen text-gray-900 font-sans">
      {/* Top Navbar matching ResearchGate with SukaBaca Purple Nuance */}
      <header className="w-full border-b border-purple-100 bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo with Purple Branding */}
          <div 
            onClick={() => navigate('/home')} 
            className="cursor-pointer flex items-center gap-1 select-none"
          >
            <span className="text-2xl font-black tracking-tight text-[#7c3a7f]">
              Research<span className="text-[#b83c9c]">Gate</span>
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5 ml-2 uppercase">
              SukaBaca
            </span>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-4 text-sm font-semibold">
            {!isUserLoggedIn ? (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-700 hover:text-purple-800 transition-colors px-2 py-1"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-lg text-white font-bold text-xs sm:text-sm shadow-xs hover:opacity-95 active:scale-95 transition-all"
                  style={{
                    background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
                    border: '1px solid #6b21a8'
                  }}
                >
                  Join for free
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/upload')}
                  className="px-4 py-2 rounded-lg text-white font-bold text-xs sm:text-sm shadow-xs hover:opacity-95 active:scale-95 transition-all"
                  style={{
                    background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
                  }}
                >
                  Dashboard ({auth.user || 'Glen'})
                </button>
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    store.clearAuth();
                    navigate('/home');
                  }}
                  className="text-gray-500 hover:text-red-600 transition-colors px-2 py-1 text-xs font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        {/* Section 1: Discover research (Hero) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-8">
          {/* Left Illustration Circle with Purple Theme */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-[#f8f5fc] via-[#f3e8ff] to-[#eeddfd] flex items-center justify-center p-6 border-2 border-purple-200/80 shadow-sm">
              {/* Scientific Vector Collage */}
              <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-xs">
                {/* Laboratory Flask & Beaker in Purple Tones */}
                <path d="M105 70 L105 100 L85 140 A10 10 0 0 0 94 154 L146 154 A10 10 0 0 0 155 140 L135 100 L135 70 Z" fill="#7c3a7f" opacity="0.9" />
                <rect x="100" y="66" width="40" height="7" rx="3" fill="#581c87" />
                <circle cx="112" cy="132" r="5" fill="#fbcfe8" />
                <circle cx="128" cy="125" r="4" fill="#fbcfe8" />

                {/* Atom model */}
                <ellipse cx="60" cy="80" rx="28" ry="12" fill="none" stroke="#9333ea" strokeWidth="2.5" transform="rotate(-30 60 80)" />
                <ellipse cx="60" cy="80" rx="28" ry="12" fill="none" stroke="#9333ea" strokeWidth="2.5" transform="rotate(30 60 80)" />
                <circle cx="60" cy="80" r="5" fill="#c084fc" />

                {/* Satellite */}
                <g transform="translate(145, 120) rotate(-25)">
                  <rect x="10" y="20" width="28" height="34" rx="4" fill="#6c757d" stroke="#343a40" strokeWidth="2" />
                  <line x1="0" y1="37" x2="10" y2="37" stroke="#343a40" strokeWidth="3" />
                  <line x1="38" y1="37" x2="48" y2="37" stroke="#343a40" strokeWidth="3" />
                  <rect x="-18" y="25" width="18" height="24" rx="2" fill="#7c3a7f" stroke="#581c87" strokeWidth="1.5" />
                  <rect x="48" y="25" width="18" height="24" rx="2" fill="#7c3a7f" stroke="#581c87" strokeWidth="1.5" />
                  <circle cx="24" cy="37" r="4" fill="#ffd166" />
                </g>

                {/* Heart Rate / EKG Graph Monitor */}
                <g transform="translate(40, 140)">
                  <rect x="0" y="0" width="60" height="42" rx="4" fill="#212529" />
                  <path d="M5 24 L18 24 L24 10 L30 34 L36 18 L42 24 L55 24" fill="none" stroke="#d946ef" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </g>

                {/* DNA Double Helix */}
                <g transform="translate(75, 175)">
                  <path d="M0 10 Q12 0 24 10 T48 10 T72 10" fill="none" stroke="#b83c9c" strokeWidth="2.5" />
                  <path d="M0 10 Q12 20 24 10 T48 10 T72 10" fill="none" stroke="#7da5d9" strokeWidth="2.5" />
                  <line x1="12" y1="5" x2="12" y2="15" stroke="#495057" strokeWidth="1.5" />
                  <line x1="36" y1="5" x2="36" y2="15" stroke="#495057" strokeWidth="1.5" />
                  <line x1="60" y1="5" x2="60" y2="15" stroke="#495057" strokeWidth="1.5" />
                </g>
              </svg>
            </div>
          </div>

          {/* Right Text & Search Box */}
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2e1065] tracking-tight">
              Discover research
            </h1>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed max-w-xl">
              Access over 160 million publication pages and stay up to date with what's happening in your field.
            </p>

            {/* Search Publications Bar */}
            <form onSubmit={handleSearchSubmit} className="pt-2 max-w-lg">
              <div className="relative flex items-center border-2 border-purple-300 focus-within:border-purple-600 rounded-xl overflow-hidden bg-white shadow-xs transition-all">
                <SearchIcon size={18} className="text-purple-400 ml-3.5 flex-shrink-0" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Search publications..."
                  className="w-full px-3 py-3 text-sm outline-none placeholder-gray-400 text-gray-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2 mr-1.5 rounded-lg text-white font-bold text-xs shadow hover:opacity-95 active:scale-95 transition-all"
                  style={{
                    background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
                  }}
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="border-t border-purple-100 my-10" />

        {/* Section 2: Connect with your scientific community & Topic Pages */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-6 items-start">
          {/* Left Description */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2e1065] tracking-tight">
              Connect with your scientific community
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed max-w-md">
              Share your research, collaborate with your peers, and get the support you need to advance your career.
            </p>
          </div>

          {/* Right Topic Pills in Purple Hue */}
          <div className="lg:col-span-7">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-4">
              VISIT TOPIC PAGES
            </h3>

            <div className="flex flex-wrap gap-2.5">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicClick(topic)}
                  className="px-4 py-2 rounded-full border border-purple-400 text-purple-700 hover:bg-purple-50 active:scale-95 text-xs sm:text-sm font-semibold transition-all shadow-2xs"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-purple-100 my-12" />

        {/* Section 3: ResearchGate Business Solutions in Purple Tone */}
        <div className="py-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#2e1065] mb-8">
            ResearchGate Business Solutions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Scientific Recruitment */}
            <div className="border border-purple-100 rounded-2xl overflow-hidden bg-white shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row">
              <div className="sm:w-2/5 bg-purple-50/60 min-h-[160px] relative overflow-hidden flex items-center justify-center p-4">
                <div className="w-20 h-20 rounded-full bg-purple-200/70 flex items-center justify-center text-3xl">
                  🔬
                </div>
              </div>
              <div className="sm:w-3/5 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900 mb-2">
                    Scientific Recruitment
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    Hire qualified researchers and build the best teams in science.
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => navigate('/upload')}
                    className="px-4 py-1.5 border border-purple-400 text-purple-700 hover:bg-purple-50 text-xs font-bold rounded-lg transition-all"
                  >
                    Find out more
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Marketing Solutions */}
            <div className="border border-purple-100 rounded-2xl overflow-hidden bg-white shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row">
              <div className="sm:w-2/5 bg-purple-50/60 min-h-[160px] relative overflow-hidden flex items-center justify-center p-4">
                <div className="w-20 h-20 rounded-full bg-purple-200/70 flex items-center justify-center text-3xl">
                  📊
                </div>
              </div>
              <div className="sm:w-3/5 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900 mb-2">
                    Marketing Solutions
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    Grow your brand's impact in the scientific community with the world's leading network for scientists.
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => navigate('/upload')}
                    className="px-4 py-1.5 border border-purple-400 text-purple-700 hover:bg-purple-50 text-xs font-bold rounded-lg transition-all"
                  >
                    Find out more
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer matching ResearchGate in soft purple */}
      <footer className="w-full bg-[#fbf9fe] border-t border-purple-100 py-10 mt-12 text-xs text-gray-600">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-purple-100">
            {/* Left Nav */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <span className="cursor-pointer hover:text-purple-700 hover:underline">About us</span>
              <span className="cursor-pointer hover:text-purple-700 hover:underline">News</span>
              <span className="cursor-pointer hover:text-purple-700 hover:underline">Careers</span>
              <span className="cursor-pointer hover:text-purple-700 hover:underline">Help Center</span>
              <span className="cursor-pointer hover:text-purple-700 hover:underline">Terms</span>
              <span className="cursor-pointer hover:text-purple-700 hover:underline">Privacy</span>
              <span className="cursor-pointer hover:text-purple-700 hover:underline">Copyright</span>
              <span className="cursor-pointer hover:text-purple-700 hover:underline">Imprint</span>
            </div>

            {/* Right Nav */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 font-medium text-gray-700">
              <span className="cursor-pointer hover:text-purple-700 hover:underline">Researchers</span>
              <span className="cursor-pointer hover:text-purple-700 hover:underline">Q&A</span>
              <span className="cursor-pointer hover:text-purple-700 hover:underline">Publications</span>
              <span className="cursor-pointer hover:text-purple-700 hover:underline">Jobs</span>
              <span className="cursor-pointer hover:text-purple-700 hover:underline">Advertising</span>
              <span className="cursor-pointer hover:text-purple-700 hover:underline">Recruiting</span>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 gap-2">
            <p>© 2008-2026 SukaBaca Academic Research. All rights reserved.</p>
            <p className="text-purple-600 font-medium">IMPAL Coursework Edition • Telkom University</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
