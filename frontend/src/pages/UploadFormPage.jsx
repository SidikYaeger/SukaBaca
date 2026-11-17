import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import ModalConfirm from '../components/ModalConfirm';
import { store } from '../services/store';

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'doc', 'txt'];
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const CATEGORY_SUGGESTIONS = [
  'Teknologi Informasi',
  'Artificial Intelligence',
  'Pendidikan & Metodologi',
  'Arsitektur & Energi',
  'Hukum & Kebijakan',
  'Kesehatan',
  'Ekonomi & Bisnis'
];

const getExtension = (name) => name.split('.').pop().toLowerCase();

const readFile = (file, mode) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(mode === 'base64' ? String(reader.result).split(',')[1] || '' : String(reader.result));
  reader.onerror = () => reject(reader.error);
  if (mode === 'base64') {
    reader.readAsDataURL(file);
  } else {
    reader.readAsText(file);
  }
});

const syncAriaInvalid = (e) => {
  const el = e.target;
  if (el.matches('input[required], textarea[required]')) {
    if (el.checkValidity()) {
      el.removeAttribute('aria-invalid');
    } else {
      el.setAttribute('aria-invalid', 'true');
    }
  }
};

function FieldError({ id, children }) {
  return (
    <p id={id} className="field-error">
      <AlertCircle size={12} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export default function UploadFormPage() {
  const auth = store.getAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(auth.profile?.name || auth.user || '');
  const [category, setCategory] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().getFullYear().toString());
  const [abstractText, setAbstractText] = useState('');
  const [modalStep, setModalStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [newJournalId, setNewJournalId] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const selectFile = (selected) => {
    if (!ALLOWED_EXTENSIONS.includes(getExtension(selected.name))) {
      setFile(null);
      setFileError('Format berkas harus .pdf, .docx, .doc, atau .txt');
      return;
    }
    if (selected.size === 0) {
      setFile(null);
      setFileError('Berkas tidak boleh kosong');
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setFile(null);
      setFileError('Ukuran berkas maksimal 8 MB');
      return;
    }
    setFileError('');
    setFile(selected);
    if (!title.trim()) {
      setTitle(selected.name.replace(/\.[^/.]+$/, '').slice(0, 255));
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) selectFile(selected);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) selectFile(dropped);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setFileError('Pilih berkas jurnal terlebih dahulu');
      return;
    }
    if (title.trim().length < 3 || author.trim().length < 2 || category.trim().length < 2) {
      setUploadError('Judul (min. 3 karakter), penulis, dan kategori wajib diisi dengan benar');
      return;
    }
    if (!/^(19|20)\d{2}$/.test(publishDate.trim())) {
      setUploadError('Tahun terbit harus 4 digit angka (contoh: 2026)');
      return;
    }
    if (abstractText.trim().length < 30) {
      setUploadError('Abstract minimal 30 karakter');
      return;
    }
    setUploadError('');
    setModalStep(1);
  };

  const handleConfirmUpload = async () => {
    if (uploading) return;
    setUploading(true);
    try {
      const fileBase64 = await readFile(file, 'base64');
      const content = getExtension(file.name) === 'txt'
        ? await readFile(file, 'text')
        : abstractText.trim();
      const created = await store.apiUploadJournal({
        title: title.trim(),
        author: author.trim(),
        category: category.trim() || 'Umum',
        publishDate: publishDate.trim(),
        abstract: abstractText.trim(),
        content,
        fileName: file.name,
        fileBase64
      });
      setNewJournalId(created.id);
      setModalStep(2);
    } catch (err) {
      setModalStep(0);
      setUploadError(err.message || 'Gagal mengunggah jurnal');
    } finally {
      setUploading(false);
    }
  };

  const handleViewJournal = () => {
    setModalStep(0);
    navigate(`/journal/${newJournalId}`);
  };

  return (
    <div className="page-enter flex-1 flex flex-col bg-[#ededed] min-h-screen pb-12">
      <Navbar variant="with-back" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 mt-2">
        <div className="w-full max-w-xl bg-white rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col items-center border border-gray-100">
          <div className="text-center mb-5">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
              Unggah Berkas Jurnal
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Dokumen dapat dibaca lebih dulu sebelum diringkas dengan AI
            </p>
          </div>

          {uploadError && (
            <div role="alert" className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            onBlur={syncAriaInvalid}
            onInvalidCapture={syncAriaInvalid}
            className="w-full"
          >
            <label
              htmlFor="journal-file"
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`w-full border-2 border-dashed rounded-2xl py-8 px-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group focus-within:border-purple-500 ${
                dragActive
                  ? 'border-purple-500 bg-purple-50/60'
                  : 'border-[#b8c2d6] hover:bg-gray-50/80 hover:border-purple-400'
              }`}
            >
              <input
                id="journal-file"
                type="file"
                accept=".txt,.doc,.docx,.pdf"
                onChange={handleFileChange}
                aria-describedby="file-hint file-error"
                className="sr-only"
              />

              <div className="text-gray-400 group-hover:text-purple-600 transition-colors mb-2">
                {file ? <FileText size={44} strokeWidth={1.8} /> : <Upload size={44} strokeWidth={1.8} />}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-1 break-all">
                {file ? `File terpilih: ${file.name}` : 'Click to upload your journal file'}
              </p>

              <p id="file-hint" className="text-[11px] text-gray-400">
                Mendukung format .pdf, .docx, .doc, dan .txt (maks. 8 MB)
              </p>
            </label>

            {fileError && (
              <p id="file-error" role="alert" className="mt-2 flex items-center gap-1 text-[11px] text-[#d93025]">
                <AlertCircle size={12} aria-hidden="true" />
                <span>{fileError}</span>
              </p>
            )}

            <div className="w-full mt-5 space-y-3.5">
              <div>
                <label htmlFor="journal-title" className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Judul Jurnal
                </label>
                <input
                  id="journal-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul jurnal..."
                  required
                  minLength={3}
                  maxLength={255}
                  aria-errormessage="title-error"
                  className="field-input"
                />
                <FieldError id="title-error">Judul wajib diisi (minimal 3 karakter).</FieldError>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label htmlFor="journal-author" className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Penulis
                  </label>
                  <input
                    id="journal-author"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Nama penulis"
                    required
                    minLength={2}
                    maxLength={150}
                    aria-errormessage="author-error"
                    className="field-input"
                  />
                  <FieldError id="author-error">Penulis wajib diisi.</FieldError>
                </div>

                <div>
                  <label htmlFor="journal-category" className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Kategori
                  </label>
                  <input
                    id="journal-category"
                    type="text"
                    list="journal-category-list"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Pilih atau ketik kategori"
                    required
                    minLength={2}
                    maxLength={100}
                    aria-errormessage="category-error"
                    className="field-input"
                  />
                  <datalist id="journal-category-list">
                    {CATEGORY_SUGGESTIONS.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                  <FieldError id="category-error">Kategori wajib diisi.</FieldError>
                </div>

                <div>
                  <label htmlFor="journal-year" className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Tahun Terbit
                  </label>
                  <input
                    id="journal-year"
                    type="text"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    placeholder="2026"
                    required
                    pattern="^(19|20)\d{2}$"
                    maxLength={4}
                    aria-errormessage="year-error"
                    className="field-input"
                  />
                  <FieldError id="year-error">Tahun harus 4 digit (mis. 2026).</FieldError>
                </div>
              </div>

              <div>
                <label htmlFor="journal-abstract" className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Abstract
                </label>
                <textarea
                  id="journal-abstract"
                  value={abstractText}
                  onChange={(e) => setAbstractText(e.target.value)}
                  placeholder="Tulis abstrak jurnal..."
                  rows={5}
                  required
                  minLength={30}
                  maxLength={10000}
                  aria-errormessage="abstract-error"
                  className="field-input resize-y"
                />
                <FieldError id="abstract-error">Abstract wajib diisi (minimal 30 karakter).</FieldError>
              </div>
            </div>

            <button
              type="submit"
              onClick={() => {
                if (!file && !fileError) setFileError('Pilih berkas jurnal terlebih dahulu');
              }}
              className="w-full mt-6 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
                border: '1px solid #333333'
              }}
            >
              <Upload size={18} strokeWidth={2.5} />
              <span>Unggah Jurnal</span>
            </button>
          </form>
        </div>
      </div>

      <ModalConfirm
        isOpen={modalStep > 0}
        title={
          modalStep === 2
            ? 'Jurnal berhasil diunggah'
            : `Apakah anda ingin mengunggah <${title.trim()}>?`
        }
        subtitle={
          modalStep === 2
            ? 'Buka halaman jurnal sekarang?'
            : 'Jurnal akan disimpan dan dapat dibaca sebelum diringkas.'
        }
        onConfirm={modalStep === 2 ? handleViewJournal : handleConfirmUpload}
        onCancel={() => setModalStep(0)}
        confirmText="Ya"
        cancelText="Tidak"
      />
    </div>
  );
}
