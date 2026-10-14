import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import Navbar from '../components/Navbar';
import ModalConfirm from '../components/ModalConfirm';

export default function UploadFormPage() {
  const [file, setFile] = useState(null);
  const [modalStep, setModalStep] = useState(0); // 0: closed, 1: confirm summarize, 2: view summary
  const [journalName, setJournalName] = useState('Sustainable Architecture 2026.pdf');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setJournalName(selected.name);
    }
  };

  const handleTriggerUpload = () => {
    // Open modal step 1 (upload-extend-2)
    setModalStep(1);
  };

  const handleConfirmSummarize = () => {
    // Move to modal step 2 (upload-extend-3)
    setModalStep(2);
  };

  const handleViewSummary = () => {
    setModalStep(0);
    navigate('/article/1');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ededed] min-h-screen pb-8">
      {/* Top Navbar with Back button & Logo */}
      <Navbar variant="with-back" />

      {/* Upload Container Card (matching upload-extend.png) */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col items-center border border-gray-100">
          {/* Dashed Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-[#b8c2d6] rounded-2xl py-12 px-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50/80 hover:border-purple-400 transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.doc,.docx,.pdf"
              className="hidden"
            />

            {/* Upload cloud arrow icon */}
            <div className="text-gray-400 group-hover:text-purple-600 transition-colors mb-3">
              <Upload size={56} strokeWidth={1.8} />
            </div>

            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              {file ? `File terpilih: ${file.name}` : 'Click to upload your journal file'}
            </p>

            <p className="text-[11px] text-gray-400">
              Supports .txt, .doc, and other text formats
            </p>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={handleTriggerUpload}
            className="mt-6 py-3 px-8 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center gap-2"
            style={{
              background: 'linear-gradient(90deg, #7da5d9 0%, #b83c9c 100%)',
              border: '1px solid #333333'
            }}
          >
            <Upload size={18} strokeWidth={2.5} />
            <span>Upload Journal</span>
          </button>
        </div>
      </div>

      {/* Modal Step 1: Apakah anda ingin meringkas <nama jurnal>? (upload-extend-2) */}
      <ModalConfirm
        isOpen={modalStep === 1}
        title={`Apakah anda ingin meringkas <${journalName}>?`}
        onConfirm={handleConfirmSummarize}
        onCancel={() => setModalStep(0)}
        confirmText="Ya"
        cancelText="Tidak"
      />

      {/* Modal Step 2: Jurnal sudah teringkas. Tampilkan? (upload-extend-3) */}
      <ModalConfirm
        isOpen={modalStep === 2}
        title="Jurnal sudah teringkas"
        subtitle="Tampilkan?"
        onConfirm={handleViewSummary}
        onCancel={() => setModalStep(0)}
        confirmText="Ya"
        cancelText="Tidak"
      />
    </div>
  );
}
