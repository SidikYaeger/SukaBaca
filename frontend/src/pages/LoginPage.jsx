import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Harap masukkan username dan password');
      return;
    }
    if (onLoginSuccess) {
      onLoginSuccess(username);
    }
    navigate('/upload');
  };

  const handleFillSample = () => {
    setUsername('Glen');
    setPassword('Besar123');
    setError('');
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-[#ededed] p-4 sm:p-6 min-h-screen">
      {/* Centered White Card */}
      <div className="w-full max-w-[360px] bg-white rounded-[32px] p-8 shadow-sm flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center cursor-pointer" onClick={() => navigate('/home')}>
          <img 
            src="/logo.png" 
            alt="SukaBaca Logo" 
            className="w-36 h-auto object-contain"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full mb-3 p-2 bg-red-50 text-red-600 text-xs rounded-lg text-center border border-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
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

          {/* Gradient Login Button */}
          <button
            type="submit"
            className="w-full py-2.5 mt-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm hover:opacity-95 active:scale-98 transition-all"
            style={{
              background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
              border: '1px solid #333333'
            }}
          >
            Login
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-900 font-medium">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-bold underline decoration-1 underline-offset-2 hover:text-purple-700 transition-colors"
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Fill sample mockup data helper */}
        <div className="mt-4 pt-4 border-t border-gray-100 w-full flex justify-center">
          <button
            type="button"
            onClick={handleFillSample}
            className="text-[11px] text-gray-400 hover:text-purple-600 hover:underline transition-colors"
          >
            💡 Isi Data Sesuai Mockup (Glen / Besar123)
          </button>
        </div>
      </div>
    </div>
  );
}
