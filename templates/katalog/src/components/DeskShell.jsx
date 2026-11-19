import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Library,
  FilePlus2,
  ClipboardList,
  IdCard,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  User
} from 'lucide-react';
import { useAuth } from '@shared/auth';
import sukabacaLogo from '../assets/sukabaca-mark.png';
import { SmoothCollapse } from './SmoothCollapse';

export function formatCallNumber(id) {
  const num = Number(id);
  if (!Number.isFinite(num) || num <= 0) return 'SB-000';
  return `SB-${String(num).padStart(3, '0')}`;
}

const NAV_TABS = [
  { to: '/', label: 'Dashboard', icon: Library, end: true },
  { to: '/upload', label: 'Upload', icon: FilePlus2 },
  { to: '/history', label: 'Riwayat', icon: ClipboardList },
  { to: '/subscription', label: 'Akun', icon: IdCard }
];

export function DeskShell({ children }) {
  const { user, isAuthenticated, subscription, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="desk-shell">
      <a href="#konten-utama" className="skip-link">
        Lewati ke konten utama
      </a>

      <header className="cabinet-header">
        <div className="cabinet-header-inner">
          <Link to="/" className="plaque-link" aria-label="SukaBaca — Beranda">
            <img src={sukabacaLogo} alt="" className="brand-logo" width="44" height="47" />
            <span className="brand-wordmark">
              <span className="brand-suka">Suka</span>
              <span className="brand-baca">Baca</span>
            </span>
          </Link>

          <nav className="folder-nav" aria-label="Navigasi utama katalog">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) => `folder-tab${isActive ? ' is-active' : ''}`}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{tab.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="desk-account">
            {isAuthenticated ? (
              <>
                <span className="member-pill" title={`Masuk sebagai ${user.name}`}>
                  <User size={14} aria-hidden="true" />
                  <span>{user.username}</span>
                  {subscription?.isPro && <span className="pro-micro-stamp">Pro</span>}
                </span>
                <button type="button" className="header-btn" onClick={handleLogout}>
                  <LogOut size={15} aria-hidden="true" />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="header-btn">
                  <LogIn size={15} aria-hidden="true" />
                  <span>Masuk</span>
                </Link>
                <Link to="/register" className="header-btn is-primary">
                  <UserPlus size={15} aria-hidden="true" />
                  <span>Daftar</span>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="header-btn mobile-menu-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="navigasi-seluler"
          >
            {menuOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
            <span>{menuOpen ? 'Tutup' : 'Menu'}</span>
          </button>
        </div>

        <SmoothCollapse open={menuOpen} className="mobile-drawer-collapse">
          <div id="navigasi-seluler" className="mobile-drawer-nav">
            <nav className="mobile-nav-list" aria-label="Navigasi seluler katalog">
              {NAV_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    end={tab.end}
                    className={({ isActive }) => `mobile-nav-item${isActive ? ' is-active' : ''}`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{tab.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="mobile-account-bar">
              {isAuthenticated ? (
                <>
                  <span className="member-pill">
                    <User size={14} aria-hidden="true" />
                    <span>{user.username}</span>
                    {subscription?.isPro && <span className="pro-micro-stamp">Pro</span>}
                  </span>
                  <button type="button" className="header-btn" onClick={handleLogout}>
                    <LogOut size={15} aria-hidden="true" />
                    <span>Keluar</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="header-btn">
                    <LogIn size={15} aria-hidden="true" />
                    <span>Masuk</span>
                  </Link>
                  <Link to="/register" className="header-btn is-primary">
                    <UserPlus size={15} aria-hidden="true" />
                    <span>Daftar</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </SmoothCollapse>
      </header>

      <main id="konten-utama" className="desk-main">
        <div key={location.pathname} className="route-stage">
          {children}
        </div>
      </main>

      <footer className="desk-footer">
        <div className="desk-footer-inner">
          <div className="colophon-brand">
            <img src={sukabacaLogo} alt="" className="footer-logo" width="22" height="24" />
            <span>SukaBaca</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
