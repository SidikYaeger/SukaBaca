import React, { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useAuth } from '@shared/auth';
import { useUserInvalidSync } from '@shared/formValidation';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);
  useUserInvalidSync(formRef);

  const prefillUsername = location.state?.registeredUsername || '';
  const justRegistered = Boolean(location.state?.registeredUsername);

  const [username, setUsername] = useState(prefillUsername);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ username, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Username atau kata sandi tidak sesuai.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-slip-wrap">
      <div className="ruled-card auth-slip">
        <div className="auth-slip-head">
          <h1 className="page-title">Masuk ke SukaBaca</h1>
        </div>

        {justRegistered && !error && (
          <div className="alert-slip is-success" role="status" style={{ marginBottom: '0.9rem' }}>
            <CheckCircle2 size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>Kartu anggota berhasil didaftarkan. Silakan masuk dengan kata sandi Anda.</div>
          </div>
        )}

        {error && (
          <div className="alert-slip is-error" role="alert" style={{ marginBottom: '0.9rem' }}>
            <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label htmlFor="login-username" className="field-label">
              Nama Pengguna (Username)
            </label>
            <input
              id="login-username"
              name="username"
              type="text"
              className="field-input"
              required
              autoComplete="username"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="none"
              data-error="login-username-err"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
            />
            <span id="login-username-err" className="field-error field-error-auto">
              Username wajib diisi.
            </span>
          </div>

          <div className="field-group">
            <label htmlFor="login-password" className="field-label">
              Kata Sandi
            </label>
            <div className="password-wrap">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="field-input"
                required
                autoComplete="current-password"
                data-error="login-password-err"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                aria-pressed={showPassword}
                disabled={submitting}
              >
                {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
              </button>
            </div>
            <span id="login-password-err" className="field-error field-error-auto">
              Kata sandi wajib diisi.
            </span>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <Loader2 size={16} className="spin-icon" aria-hidden="true" />
            ) : (
              <LogIn size={16} aria-hidden="true" />
            )}
            <span>{submitting ? 'Memeriksa...' : 'Masuk'}</span>
          </button>
        </form>

        <p className="field-hint" style={{ marginTop: '1rem' }}>
          Belum memiliki akun? <Link to="/register">Daftar</Link>.
        </p>

        <div className="card-punch-hole" aria-hidden="true" />
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  useUserInvalidSync(formRef);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        username: username.trim(),
        password
      });
      navigate('/login', { state: { registeredUsername: username.trim() } });
    } catch (err) {
      setError(err.message || 'Gagal mendaftarkan kartu anggota baru.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-slip-wrap">
      <div className="ruled-card auth-slip">
        <div className="auth-slip-head">
          <h1 className="page-title">Daftar Akun SukaBaca</h1>
        </div>

        {error && (
          <div className="alert-slip is-error" role="alert" style={{ marginBottom: '0.9rem' }}>
            <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label htmlFor="register-name" className="field-label">
              Nama Lengkap
            </label>
            <input
              id="register-name"
              name="name"
              type="text"
              className="field-input"
              maxLength={100}
              autoComplete="name"
              data-error="register-name-err"
              placeholder="Contoh: Nadia Prameswari"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
            />
            <span id="register-name-err" className="field-error field-error-auto">
              Nama maksimal 100 karakter.
            </span>
          </div>

          <div className="field-group">
            <label htmlFor="register-username" className="field-label">
              Nama Pengguna (Username) *
            </label>
            <input
              id="register-username"
              name="username"
              type="text"
              className="field-input"
              required
              minLength={3}
              maxLength={50}
              pattern="[A-Za-z0-9._\-]{3,50}"
              autoComplete="username"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="none"
              data-error="register-username-err"
              placeholder="3–50 huruf, angka, titik, _ atau -"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
            />
            <span id="register-username-err" className="field-error field-error-auto">
              Gunakan 3–50 huruf, angka, titik, garis bawah, atau tanda hubung.
            </span>
          </div>

          <div className="field-group">
            <label htmlFor="register-password" className="field-label">
              Kata Sandi * (min. 6 karakter)
            </label>
            <div className="password-wrap">
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="field-input"
                required
                minLength={6}
                maxLength={100}
                autoComplete="new-password"
                data-error="register-password-err"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                aria-pressed={showPassword}
                disabled={submitting}
              >
                {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
              </button>
            </div>
            <span id="register-password-err" className="field-error field-error-auto">
              Kata sandi minimal 6 karakter.
            </span>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <Loader2 size={16} className="spin-icon" aria-hidden="true" />
            ) : (
              <UserPlus size={16} aria-hidden="true" />
            )}
            <span>{submitting ? 'Mendaftarkan...' : 'Daftar'}</span>
          </button>
        </form>

        <p className="field-hint" style={{ marginTop: '1rem' }}>
          Sudah memiliki akun? <Link to="/login">Masuk</Link>.
        </p>

        <div className="card-punch-hole" aria-hidden="true" />
      </div>
    </div>
  );
}
