import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ArrowRight, Crown, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';

export default function Header({ onMenuClick }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { subscription, remainingQuota } = useSubscription();
  const navigate = useNavigate();

  return (
    <header className="dokmeh-header w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#E2E8F0]">
        
        {/* Left: Frameless Brand Logo directly next to wordmark */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="p-1.5 border border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F8FAFC] hover:border-[#0F172A] text-[#334155] transition-all cursor-pointer"
              title="Buka Menu Navigasi"
              aria-label="Navigation Menu"
            >
              <Menu size={18} />
            </button>
          )}

          <Link to="/home" className="flex items-center gap-2.5 text-decoration-none group cursor-pointer">
            <img 
              src="/Group 11.png" 
              alt="SukaBaca Logo" 
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105" 
            />
            <span className="font-extrabold text-2xl tracking-tight text-[#0F172A]">
              Suka<span className="text-[#0593C6]">Baca</span>
            </span>
          </Link>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="dokmeh-btn-ghost text-xs sm:text-sm font-semibold cursor-pointer">
                Log in
              </Link>
              <Link to="/register" className="dokmeh-btn-primary text-xs sm:text-sm cursor-pointer">
                <span>Join for free</span>
                <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* Subscription Status Tag */}
              <Link
                to="/upload"
                className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] hover:border-[#0593C6] transition-colors cursor-pointer"
                title="Manage Subscription"
              >
                <Crown size={13} className="text-[#D83995]" />
                <span className="uppercase text-[11px] tracking-wider">{subscription.plan}</span>
                <span className="font-mono text-[10px] font-bold bg-[#0593C6]/10 text-[#0593C6] px-1.5 py-0.2 border border-[#0593C6]/30 tabular-nums">
                  {remainingQuota} Quota
                </span>
              </Link>

              {/* Scholar Dashboard Button */}
              <button
                onClick={() => navigate('/upload')}
                className="dokmeh-btn-secondary !py-1.5 !px-3 text-xs cursor-pointer"
              >
                <span>Dashboard ({user || 'User'})</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  navigate('/home');
                }}
                className="p-2 border border-transparent hover:border-[#CBD5E1] text-[#64748B] hover:text-red-600 transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
