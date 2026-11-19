import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, History, Home, Upload, Search, LogOut, Crown, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';

export default function SidebarDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { subscription, remainingQuota } = useSubscription();

  if (!isOpen) return null;

  const navItems = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Search Journal', path: '/search', icon: Search },
    { label: 'Scholar Dashboard', path: '/upload', icon: Upload, requiresAuth: true },
    { label: 'History & Bookmarks', path: '/history', icon: History, requiresAuth: true },
  ];

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sharp Drawer Panel */}
      <aside className="relative w-72 bg-[#FFFFFF] shadow-2xl h-full flex flex-col justify-between p-6 z-10 border-r-2 border-[#0F172A]">
        
        {/* Top Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <img src="/sukabaca-book.png" alt="SukaBaca Logo" className="h-7 w-auto object-contain" />
              <span className="font-extrabold text-lg text-[#0F172A] tracking-tight">
                Suka<span className="text-[#0593C6]">Baca</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 border border-[#CBD5E1] bg-[#FFFFFF] text-[#64748B] hover:text-[#0F172A] hover:border-[#0F172A]"
              title="Close Menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* User profile card */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#CBD5E1] space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs font-mono">
                {(user || 'G')[0].toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-[#0F172A] truncate">
                  {user || 'Guest User'}
                </span>
                <span className="text-[10px] uppercase font-mono text-[#64748B]">
                  {isAuthenticated ? 'Active Scholar' : 'Not signed in'}
                </span>
              </div>
            </div>

            {isAuthenticated && (
              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <span className="text-[#64748B] flex items-center gap-1 font-semibold text-[11px]">
                  <Crown size={12} className="text-[#D83995]" />
                  {subscription.plan}
                </span>
                <span className="font-mono font-bold text-[#0593C6] bg-[#0593C6]/10 px-1.5 py-0.5 border border-[#0593C6]/30 tabular-nums">
                  {remainingQuota} Left
                </span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.requiresAuth && !isAuthenticated) return null;
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold border transition-all ${
                    isActive
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-hard-sm'
                      : 'text-[#334155] border-transparent hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-[#E2E8F0]">
          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                onClose();
                navigate('/home');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-300 shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                navigate('/login');
              }}
              className="dokmeh-btn-primary w-full text-xs"
            >
              <User size={14} />
              <span>Log In</span>
            </button>
          )}
        </div>

      </aside>
    </div>
  );
}
