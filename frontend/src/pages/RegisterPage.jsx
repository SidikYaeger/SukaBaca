import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal harus 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      await register(username.trim(), password);
      navigate('/upload', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Pendaftaran gagal. Silakan coba username lain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#334155] font-sans selection:bg-[#0593C6] selection:text-white">
      {/* Crisp Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#E2E8F0] bg-[#FFFFFF]">
        <Link to="/home" className="flex items-center gap-2 group text-decoration-none">
          <img src="/Group 11.png" alt="SukaBaca Logo" className="h-7 w-auto object-contain" />
          <span className="font-extrabold text-2xl tracking-tight text-[#0F172A]">
            Suka<span className="text-[#0593C6]">Baca</span>
          </span>
        </Link>

        <Link to="/home" className="dokmeh-btn-secondary !py-1.5 !px-3 text-xs font-semibold">
          Ke Beranda
        </Link>
      </header>

      {/* Main Register Card */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md p-8 sm:p-10 space-y-6 bg-[#FFFFFF] border-2 border-[#0F172A] shadow-hard">
          
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Daftar Akun Baru
            </h1>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider font-mono">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda"
                  className="dokmeh-input !pl-10 text-xs"
                />
                <User size={15} className="absolute left-3 top-3 text-[#94A3B8]" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider font-mono">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="dokmeh-input !pl-10 text-xs"
                />
                <Lock size={15} className="absolute left-3 top-3 text-[#94A3B8]" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider font-mono">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className="dokmeh-input !pl-10 text-xs"
                />
                <Lock size={15} className="absolute left-3 top-3 text-[#94A3B8]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="dokmeh-btn-primary w-full !py-2.5 text-xs sm:text-sm font-bold shadow-hard mt-3"
            >
              <span>{loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
            Sudah memiliki akun?{' '}
            <Link to="/login" className="text-[#0593C6] font-bold hover:underline">
              Masuk
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
