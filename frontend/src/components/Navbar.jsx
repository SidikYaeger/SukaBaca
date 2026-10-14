import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft } from 'lucide-react';

export default function Navbar({ 
  variant = 'standard', 
  title = '', 
  onMenuClick, 
  centerContent = null,
  isAuthenticated = false,
  onLogout 
}) {
  const navigate = useNavigate();

  // Variant: With Back button (upload-extend, tampil)
  if (variant === 'with-back') {
    return (
      <header className="w-full flex items-center justify-between px-4 sm:px-8 py-5">
        <div 
          onClick={() => navigate('/upload')} 
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img src="/logo.png" alt="SukaBaca Logo" className="h-10 sm:h-12 w-auto object-contain" />
        </div>

        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-black hover:bg-gray-800 active:scale-95 text-white font-semibold text-sm rounded-xl shadow transition-all flex items-center gap-1.5"
        >
          <span>Back</span>
        </button>
      </header>
    );
  }

  // Variant: Home landing page
  if (variant === 'home') {
    return (
      <header className="w-full pt-8 pb-4 flex flex-col items-center justify-center relative">
        <div 
          onClick={() => navigate('/home')}
          className="cursor-pointer hover:opacity-95 transition-opacity mb-4"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="text-[#2590eb]">Suka</span>
            <span className="text-[#c2339f]">Baca</span>
          </h1>
        </div>

        {/* Buttons underneath logo like in mockup */}
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2 bg-white text-gray-900 font-semibold text-xs sm:text-sm rounded-xl shadow-md hover:bg-gray-100 active:scale-95 transition-all"
              >
                Register
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 bg-[#4b5563]/90 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md hover:bg-[#374151] active:scale-95 transition-all"
              >
                Login
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/upload')}
                className="px-5 py-2 bg-white text-gray-900 font-semibold text-xs sm:text-sm rounded-xl shadow-md hover:bg-gray-100 active:scale-95 transition-all"
              >
                Upload
              </button>
              <button
                onClick={() => {
                  if (onLogout) onLogout();
                  navigate('/home');
                }}
                className="px-5 py-2 bg-[#4b5563]/90 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md hover:bg-[#374151] active:scale-95 transition-all"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>
    );
  }

  // Variant: Standard (search, history, dashboard)
  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-8 py-5 gap-3">
      {/* Hamburger button on left */}
      <button
        onClick={onMenuClick}
        className="w-12 h-12 bg-white border border-gray-300 rounded-xl shadow-sm flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700 flex-shrink-0"
        title="Buka Menu"
      >
        <Menu size={24} strokeWidth={2.2} />
      </button>

      {/* Center content or title */}
      <div className="flex-1 flex justify-center items-center px-2">
        {centerContent ? (
          centerContent
        ) : title ? (
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight text-left w-full">
            {title}
          </h2>
        ) : null}
      </div>

      {/* SukaBaca logo on right */}
      <div 
        onClick={() => navigate('/upload')}
        className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
      >
        <img src="/logo.png" alt="SukaBaca Logo" className="h-9 sm:h-11 w-auto object-contain" />
      </div>
    </header>
  );
}
