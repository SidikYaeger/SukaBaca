import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FilePlus2,
  Paperclip,
  X,
  AlertCircle,
  Loader2,
  LogIn
} from 'lucide-react';
import {
  api,
  CATEGORIES,
  validateUploadFile,
  fileToBase64
} from '@shared/api';
import { useAuth } from '@shared/auth';
import { useUserInvalidSync } from '@shared/formValidation';
import { SmoothCollapse } from '../components/SmoothCollapse';

export function IntakePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  useUserInvalidSync(formRef);

  const currentYear = String(new Date().getFullYear());
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(user?.name || user?.username || '');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [publishDate, setPublishDate] = useState(currentYear);
  const [abstractText, setAbstractText] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (user && !author) {
      setAuthor(user.name || user.username || '');
    }
  }, [user, author]);

  const handleFileChange = (e) => {
    setFileError('');
    const picked = e.target.files?.[0] || null;
    if (!picked) {
      setFile(null);
      return;
    }
    const validationError = validateUploadFile(picked);
    if (validationError) {
      setFileError(validationError);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setFile(picked);
  };

  const handleClearFile = () => {
    setFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (abstractText.trim().length < 30) {
      setSubmitError('Abstrak minimal terdiri dari 30 karakter agar dapat diindeks katalog.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        author: author.trim(),
        category,
        publishDate: publishDate.trim(),
        abstract: abstractText.trim(),
        content: content.trim() || undefined
      };

      if (file) {
        payload.fileName = file.name;
        payload.fileBase64 = await fileToBase64(file);
      }

      const res = await api.uploadJournal(payload);
      if (res?.journalId) {
        navigate(`/journal/${res.journalId}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setSubmitError(err.message || 'Gagal mencatat kartu jurnal baru.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="ruled-card intake-card">
        <div className="auth-slip-head">
          <h1 className="page-title">Formulir Kartu Baru</h1>
          <p className="page-lead">
            Hanya anggota perpustakaan terdaftar yang dapat memasukkan kartu jurnal baru ke dalam lemari katalog.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
          <Link to="/login" className="btn btn-primary">
            <LogIn size={16} aria-hidden="true" />
            <span>Masuk</span>
          </Link>
          <Link to="/register" className="btn">
            <span>Daftar</span>
          </Link>
        </div>
        <div className="card-punch-hole" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="ruled-card intake-card">
      <div className="auth-slip-head">
        <h1 className="page-title">Formulir Kartu Baru</h1>
        <p className="page-lead">
          Isi metadata bibliografi di bawah ini untuk mengarsipkan jurnal ke laci kategori. Lampiran berkas bersifat opsional.
        </p>
      </div>

      {submitError && (
        <div className="alert-slip is-error" role="alert" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{submitError}</div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="field-group">
          <label htmlFor="intake-title" className="field-label">
            Judul Jurnal *
          </label>
          <input
            id="intake-title"
            type="text"
            className="field-input"
            required
            minLength={3}
            maxLength={255}
            data-error="intake-title-err"
            placeholder="Contoh: Evaluasi Algoritma Ringkasan Ekstraktif pada Jurnal Berbahasa Indonesia"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
          <span id="intake-title-err" className="field-error field-error-auto">
            Judul jurnal minimal 3 karakter.
          </span>
        </div>

        <div className="form-grid-2">
          <div className="field-group">
            <label htmlFor="intake-author" className="field-label">
              Penulis *
            </label>
            <input
              id="intake-author"
              type="text"
              className="field-input"
              required
              minLength={2}
              maxLength={150}
              data-error="intake-author-err"
              placeholder="Nama lengkap penulis"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              disabled={submitting}
            />
            <span id="intake-author-err" className="field-error field-error-auto">
              Nama penulis minimal 2 karakter.
            </span>
          </div>

          <div className="field-group">
            <label htmlFor="intake-year" className="field-label">
              Tahun Terbit (4 Digit) *
            </label>
            <input
              id="intake-year"
              type="text"
              inputMode="numeric"
              className="field-input tabular"
              required
              pattern="^(19|20)\d{2}$"
              data-error="intake-year-err"
              placeholder="2026"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              disabled={submitting}
            />
            <span id="intake-year-err" className="field-error field-error-auto">
              Masukkan 4 digit tahun (1900–2099).
            </span>
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="intake-category" className="field-label">
            Laci Kategori *
          </label>
          <select
            id="intake-category"
            className="field-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={submitting}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <span className="field-error" />
        </div>

        <div className="field-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
            <label htmlFor="intake-abstract" className="field-label">
              Abstrak * (minimal 30 karakter)
            </label>
            <span className="field-hint tabular">{abstractText.trim().length} / 10000</span>
          </div>
          <textarea
            id="intake-abstract"
            className="field-textarea"
            required
            minLength={30}
            maxLength={10000}
            data-error="intake-abstract-err"
            placeholder="Ketik abstrak atau ringkasan isi naskah secara lengkap..."
            value={abstractText}
            onChange={(e) => setAbstractText(e.target.value)}
            disabled={submitting}
          />
          <span id="intake-abstract-err" className="field-error field-error-auto">
            Abstrak wajib diisi minimal 30 karakter.
          </span>
        </div>

        <div className="field-group">
          <label htmlFor="intake-content" className="field-label">
            Catatan Isi Tambahan (Opsional)
          </label>
          <textarea
            id="intake-content"
            className="field-textarea"
            placeholder="Kosongkan jika sama dengan abstrak di atas."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
          />
          <span className="field-error" />
        </div>

        <div className="field-group">
          <label htmlFor="intake-file" className="field-label">
            Lampiran Berkas (Opsional · PDF, DOCX, DOC, TXT · Maks. 8 MB)
          </label>
          <div className="file-drop-row">
            <Paperclip size={17} aria-hidden="true" />
            <input
              ref={fileInputRef}
              id="intake-file"
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              disabled={submitting}
              style={{ flex: 1, minWidth: 0 }}
            />
            {file && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleClearFile}
                disabled={submitting}
              >
                <X size={14} aria-hidden="true" />
                <span>Lepas</span>
              </button>
            )}
          </div>
          <SmoothCollapse open={Boolean(file)}>
            <span className="field-hint tabular" style={{ display: 'block', paddingTop: '0.2rem' }}>
              Terlampir: <strong>{file?.name}</strong> ({file ? (file.size / 1024).toFixed(1) : '0.0'} KB)
            </span>
          </SmoothCollapse>
          <span className="field-error">{fileError}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '0.35rem' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <Loader2 size={16} className="spin-icon" aria-hidden="true" />
            ) : (
              <FilePlus2 size={16} aria-hidden="true" />
            )}
            <span>{submitting ? 'Mengarsipkan...' : 'Masukkan ke Laci Katalog'}</span>
          </button>
          <Link to="/" className="btn btn-ghost">
            Batal
          </Link>
        </div>
      </form>

      <div className="card-punch-hole" aria-hidden="true" />
    </div>
  );
}
