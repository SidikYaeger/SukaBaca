import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import ModalConfirm from '../components/ModalConfirm';
import { store } from '../services/store';

export default function UploadFormPage() {
  const [file, setFile] = useState(null);
  const [modalStep, setModalStep] = useState(0); // 0: closed, 1: confirm summarize, 2: view summary
  const [journalTitle, setJournalTitle] = useState('Sustainable Architecture 2026.pdf');
  const [selectedModel, setSelectedModel] = useState('SukaBaca AI Engine');
  const [newJournalId, setNewJournalId] = useState(1);
  const [quotaExhausted, setQuotaExhausted] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setJournalTitle(selected.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleTriggerUpload = () => {
    // Check quota
    const sub = store.getSubscription();
    if (sub.usedToday >= sub.dailyQuota) {
      setQuotaExhausted(true);
      return;
    }
    setQuotaExhausted(false);
    // Open modal step 1 (upload-extend-2)
    setModalStep(1);
  };

  const handleConfirmSummarize = () => {
    // Decrement quota and create journal
    store.useAiQuota();
    const created = store.addJournal({
      title: journalTitle || 'Jurnal Penelitian Baru',
      author: 'Glen',
      snippet: `Ringkasan otomatis diekstrak menggunakan ${selectedModel}. Dokumen membahas analisis konseptual dan pengujian empiris.`,
      content: `Ringkasan Dokumen: ${journalTitle}. Model: ${selectedModel}.\n\nPenelitian ini berfokus pada implementasi metodologi terstandarisasi untuk mendukung pengujian perangkat lunak yang andal. Pengujian eksperimental membuktikan peningkatan efisiensi proses secara signifikan.`,
      formatFile: file ? file.name.split('.').pop().toUpperCase() : 'PDF',
      category: 'Riset IMPAL'
    });

    setNewJournalId(created.id);
    // Move to modal step 2 (upload-extend-3)
    setModalStep(2);
  };

  const handleViewSummary = () => {
    setModalStep(0);
    navigate(`/article/${newJournalId}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ededed] min-h-screen pb-12">
      {/* Top Navbar with Back button & Logo */}
      <Navbar variant="with-back" />

      {/* Upload Container Card (matching upload-extend.png) */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 mt-2">
        <div className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col items-center border border-gray-100">
          
          {/* Header */}
          <div className="text-center mb-5">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
              Unggah Berkas Jurnal
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Sistem akan memproses dan membuat ringkasan terstruktur otomatis
            </p>
          </div>

          {/* Quota Exhausted Warning */}
          {quotaExhausted && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>Kuota harian ringkasan Anda telah habis. Silakan upgrade plan.</span>
            </div>
          )}

          {/* Dashed Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-[#b8c2d6] rounded-2xl py-10 px-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50/80 hover:border-purple-400 transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.doc,.docx,.pdf"
              className="hidden"
            />

            {/* Upload cloud arrow icon */}
            <div className="text-gray-400 group-hover:text-purple-600 transition-colors mb-2">
              <Upload size={48} strokeWidth={1.8} />
            </div>

            <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">
              {file ? `File terpilih: ${file.name}` : 'Click to upload your journal file'}
            </p>

            <p className="text-[11px] text-gray-400">
              Mendukung format .pdf, .docx, .doc, dan .txt
            </p>
          </div>

          {/* Options: AI Model & Title */}
          <div className="w-full mt-4 space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Judul Jurnal
              </label>
              <input
                type="text"
                value={journalTitle}
                onChange={(e) => setJournalTitle(e.target.value)}
                placeholder="Masukkan judul jurnal..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-purple-600 outline-none text-gray-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Sparkles size={13} className="text-purple-600" />
                Pilih Model AI Peringkas
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-purple-600 outline-none bg-white text-gray-800 font-medium"
              >
                <option value="SukaBaca AI Engine">SukaBaca AI Engine (Rekomendasi Akademik)</option>
                <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Cepat & Ringkas)</option>
                <option value="DeepSeek-R1 Academic">DeepSeek-R1 Academic (Analisis Mendalam)</option>
              </select>
            </div>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={handleTriggerUpload}
            className="w-full mt-6 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
              border: '1px solid #333333'
            }}
          >
            <Upload size={18} strokeWidth={2.5} />
            <span>Upload & Ringkas Sekarang</span>
          </button>
        </div>
      </div>

      {/* Modal Step 1: Apakah anda ingin meringkas <nama jurnal>? (upload-extend-2) */}
      <ModalConfirm
        isOpen={modalStep === 1}
        title={`Apakah anda ingin meringkas <${journalTitle}>?`}
        subtitle={`Menggunakan ${selectedModel} untuk ekstraksi otomatis.`}
        onConfirm={handleConfirmSummarize}
        onCancel={() => setModalStep(0)}
        confirmText="Ya"
        cancelText="Tidak"
      />

      {/* Modal Step 2: Jurnal sudah teringkas. Tampilkan? (upload-extend-3) */}
      <ModalConfirm
        isOpen={modalStep === 2}
        title="Jurnal sudah teringkas"
        subtitle="Tampilkan hasil ringkasan sekarang?"
        onConfirm={handleViewSummary}
        onCancel={() => setModalStep(0)}
        confirmText="Ya"
        cancelText="Tidak"
      />
    </div>
  );
}
