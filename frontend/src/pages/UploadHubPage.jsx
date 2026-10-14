import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Upload, Search } from 'lucide-react';
import SidebarDrawer from '../components/SidebarDrawer';

export default function UploadHubPage({ onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-[#ededed] min-h-screen relative">
      {/* Top Bar with Hamburger */}
      <header className="w-full flex items-center justify-between p-5 relative z-20">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-12 h-12 bg-white border border-gray-300 rounded-xl shadow-sm flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
          title="Buka Menu Navigasi"
        >
          <Menu size={24} strokeWidth={2.2} />
        </button>

        {/* Small subtle logo right */}
        <div 
          onClick={() => navigate('/home')} 
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src="/logo.png" alt="SukaBaca" className="h-8 w-auto opacity-80" />
        </div>
      </header>

      {/* Main Content Center */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 text-center">
        {/* Large Brand Logo */}
        <div className="mb-4">
          <img 
            src="/logo.png" 
            alt="SukaBaca" 
            className="w-48 sm:w-56 h-auto object-contain drop-shadow-sm" 
          />
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-medium text-gray-900 max-w-xs sm:max-w-md mb-8">
          Upload your journal entries and get AI-powered summaries
        </p>

        {/* Two Action Buttons side by side (matching upload.png) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
          {/* Upload Journal Button */}
          <button
            onClick={() => navigate('/upload-form')}
            className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
              border: '1px solid #333333'
            }}
          >
            <Upload size={18} strokeWidth={2.5} />
            <span>Upload Journal</span>
          </button>

          {/* Search Journal Button */}
          <button
            onClick={() => navigate('/search')}
            className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-white text-gray-900 font-bold text-xs sm:text-sm shadow-md border border-purple-400 hover:bg-gray-50 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Search size={18} strokeWidth={2.5} />
            <span>Search Journal</span>
          </button>
        </div>
      </div>

      {/* Sidebar Drawer */}
      <SidebarDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        onLogout={onLogout}
      />
    </div>
  );
}
