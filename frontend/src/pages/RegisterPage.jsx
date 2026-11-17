import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { store } from '../services/store';

export default function RegisterPage({ onRegisterSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const cleanUser = username.trim();
    if (!/^[a-zA-Z0-9._-]{3,50}$/.test(cleanUser)) {
      setError('Username harus 3–50 karakter (huruf, angka, titik, underscore, atau tanda hubung)');
      return;
    }
    if (password.length < 6 || password.length > 100) {
      setError('Password minimal 6 karakter');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password dan Konfirmasi Password tidak cocok');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');
    const result = await store.apiRegister(cleanUser, password);
    setLoading(false);

    if (result.success) {
      if (onRegisterSuccess) {
        onRegisterSuccess(cleanUser);
      }
      setSuccessMsg('Akun berhasil dibuat! Mengalihkan ke halaman masuk...');
      setTimeout(() => {
        navigate('/login', { state: { registeredUsername: cleanUser } });
      }, 1200);
    } else {
      setError(result.message || 'Registrasi gagal, coba username lain');
    }
  };

  return (
    <div className="page-enter flex-1 flex flex-col justify-center items-center bg-[#ededed] p-4 sm:p-6 min-h-screen">
      {/* Centered White Card */}
      <div className="w-full max-w-[360px] bg-white rounded-[32px] p-8 shadow-sm flex flex-col items-center">
        {/* SukaBaca Brand Logo */}
        <div className="mb-6 flex flex-col items-center cursor-pointer" onClick={() => navigate('/home')}>
          <img 
            src="/sukabaca-book.png" 
            alt="SukaBaca Logo" 
            className="w-20 h-auto object-contain mb-1"
          />
          <h1 className="text-2xl font-black tracking-tight text-[#4c1d95]">
            Suka<span className="text-[#b83c9c]">Baca</span>
          </h1>
        </div>

        {error && (
          <div className="w-full mb-3 p-2 bg-red-50 text-red-600 text-xs rounded-lg text-center border border-red-200">
            {error}
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="w-full mb-3 p-2 bg-green-50 text-green-700 text-xs rounded-lg text-center border border-green-200">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="w-full space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5 ml-0.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition-all placeholder-gray-400 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5 ml-0.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition-all placeholder-gray-400 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5 ml-0.5">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition-all placeholder-gray-400 text-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
              border: '1px solid #333333'
            }}
          >
            {loading ? 'Mendaftarkan...' : 'Register'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-900 font-medium">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-bold underline decoration-1 underline-offset-2 hover:text-purple-700 transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
