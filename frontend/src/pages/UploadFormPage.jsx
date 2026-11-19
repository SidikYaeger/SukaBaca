import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import { journalService } from '../services/journal.service';
import { JOURNAL_CATEGORIES } from '../config/app.config';
import { useAuth } from '../context/AuthContext';

export default function UploadFormPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [category, setCategory] = useState(JOURNAL_CATEGORIES[0]);
  const [formatFile, setFormatFile] = useState('PDF');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const ext = selected.name.split('.').pop().toUpperCase();
      if (ext === 'DOCX' || ext === 'PDF') {
        setFormatFile(ext);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Judul jurnal wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const result = await journalService.uploadJournal({
        title: title.trim(),
        author: author.trim() || user || 'Anonim',
        year: year.trim(),
        category,
        formatFile,
        content: content.trim(),
        file
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/article/${result.id}`);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengunggah jurnal.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#334155] font-sans selection:bg-[#0593C6] selection:text-white">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-8 w-full space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/upload')}
            className="dokmeh-btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Hub</span>
          </button>

          <span className="text-xs text-[#64748B] font-mono uppercase tracking-wider">
            Metadata Entry
          </span>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-10 space-y-6 bg-[#FFFFFF] border-2 border-[#0F172A] shadow-hard">
          
          <div className="space-y-1 pb-4 border-b border-[#E2E8F0]">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Unggah Naskah Jurnal Ilmiah
            </h1>
            <p className="text-xs text-[#64748B]">
              Lengkapi informasi bibliografi naskah Anda agar dapat diindeks dan dianalisis oleh SukaBaca.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-300 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>Jurnal berhasil diunggah! Mengarahkan ke halaman detail...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider font-mono">
                Judul Lengkap Publikasi *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Implementasi Artificial Intelligence dalam Sistem Klasifikasi Jurnal"
                className="dokmeh-input"
              />
            </div>

            {/* Author & Year Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider font-mono">
                  Nama Penulis / Afiliasi
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder={user || 'Nama peneliti utama'}
                  className="dokmeh-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider font-mono">
                  Tahun Terbit
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                  className="dokmeh-input font-mono tabular-nums"
                  maxLength={4}
                />
              </div>
            </div>

            {/* Category & Format Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider font-mono">
                  Bidang Keilmuan
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="dokmeh-select w-full !py-2.5"
                >
                  {JOURNAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider font-mono">
                  Format Berkas
                </label>
                <select
                  value={formatFile}
                  onChange={(e) => setFormatFile(e.target.value)}
                  className="dokmeh-select w-full !py-2.5"
                >
                  <option value="PDF">Dokumen PDF (.pdf)</option>
                  <option value="DOCX">Microsoft Word (.docx)</option>
                </select>
              </div>
            </div>

            {/* File Upload Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider font-mono">
                Berkas Naskah (PDF atau DOCX)
              </label>
              <div className="p-6 border-2 border-dashed border-[#CBD5E1] text-center bg-[#F8FAFC] hover:border-[#0F172A] transition-colors">
                <input
                  type="file"
                  id="journalFile"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="journalFile" className="cursor-pointer space-y-2 block">
                  <Upload size={28} className="mx-auto text-[#0F172A]" />
                  <div className="text-xs font-semibold text-[#0F172A]">
                    {file ? file.name : 'Klik untuk memilih naskah atau seret berkas ke sini'}
                  </div>
                  <div className="text-[11px] text-[#64748B] font-mono">
                    Maksimum 25MB (format PDF & DOCX)
                  </div>
                </label>
              </div>
            </div>

            {/* Abstract or Text Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider font-mono">
                Abstrak / Teks Utama Naskah (Opsional)
              </label>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tempel abstrak atau teks naskah publikasi di sini untuk ekstraksi kata kunci dan ringkasan AI..."
                className="dokmeh-input resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || success}
                className="dokmeh-btn-primary !py-2.5 !px-6 text-xs sm:text-sm font-bold shadow-hard"
              >
                <span>{loading ? 'Mengunggah & Memproses...' : 'Terbitkan Naskah'}</span>
              </button>
            </div>

          </form>

        </div>

      </main>
    </div>
  );
}
