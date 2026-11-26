import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ArrowRight, Crown, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';

export default function Header({ onMenuClick }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { subscription, remainingQuota, isPro } = useSubscription();
  const navigate = useNavigate();

  return (
    <header className="dokmeh-header w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 border-b border-[#E2E8F0]">
        
        {/* Left: Frameless Brand Logo directly next to wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="p-1.5 border border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F8FAFC] hover:border-[#0F172A] text-[#334155] transition-all cursor-pointer shrink-0"
              title="Buka Menu Navigasi"
              aria-label="Navigation Menu"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
          )}

          <Link to="/home" className="flex items-center gap-1.5 sm:gap-2.5 text-decoration-none group cursor-pointer shrink-0">
            <img 
              src="/Group 11.png" 
              alt="SukaBaca Logo" 
              className="h-6 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105 shrink-0" 
            />
            <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-[#0F172A] whitespace-nowrap">
              Suka<span className="text-[#0593C6]">Baca</span>
            </span>
          </Link>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="dokmeh-btn-ghost !py-1.5 !px-2.5 sm:!px-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="dokmeh-btn-primary !py-1.5 sm:!py-2 !px-2.5 sm:!px-4 text-xs sm:text-sm whitespace-nowrap cursor-pointer"
              >
                <span>Join for free</span>
                <ArrowRight size={14} className="hidden sm:inline shrink-0" aria-hidden="true" />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              {/* Subscription Status Tag */}
              <Link
                to="/upload"
                className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] hover:border-[#0593C6] transition-colors cursor-pointer shrink-0"
                title="Manage Subscription"
              >
                <Crown size={13} className="text-[#D83995]" aria-hidden="true" />
                <span className="uppercase text-[11px] tracking-wider">{subscription.plan}</span>
                <span className="font-mono text-[10px] font-bold bg-[#0593C6]/10 text-[#0593C6] px-1.5 py-0.2 border border-[#0593C6]/30 tabular-nums">
                  {isPro ? 'Unlimited' : `${remainingQuota} Quota`}
                </span>
              </Link>

              {/* Scholar Dashboard Button */}
              <button
                type="button"
                onClick={() => navigate('/upload')}
                className="dokmeh-btn-secondary !py-1.5 !px-2.5 sm:!px-3 text-[11px] sm:text-xs whitespace-nowrap cursor-pointer min-w-0"
              >
                <span className="sm:hidden">Dashboard</span>
                <span className="hidden sm:inline max-w-[180px] truncate">
                  Dashboard ({user || 'User'})
                </span>
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/home');
                }}
                className="p-2 border border-transparent hover:border-[#CBD5E1] text-[#64748B] hover:text-red-600 transition-colors cursor-pointer shrink-0"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
