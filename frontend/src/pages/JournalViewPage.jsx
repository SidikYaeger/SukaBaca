import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import Header from '../components/layout/Header';
import { Skeleton } from '../components/common/UIPrimitives';
import { journalService } from '../services/journal.service';

export default function JournalViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const item = await journalService.getJournalById(id);
        if (isMounted) setJournal(item);
      } catch {
        if (isMounted) setJournal(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [id]);

  const fileUrl = journal?.fileName ? journalService.getViewerUrl(id) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#334155] font-sans selection:bg-[#0593C6] selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full flex flex-col space-y-4">
        
        {/* Top Control Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F8FAFC] border border-[#CBD5E1] shadow-hard-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="dokmeh-btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Kembali</span>
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-[#0F172A] truncate max-w-md sm:max-w-xl">
                {journal?.title || 'Memuat Dokumen Riset...'}
              </h2>
              <span className="text-[11px] text-[#64748B] font-mono">
                Integrated Reader Mode ({journal?.formatFile || 'PDF'})
              </span>
            </div>
          </div>

          {journal?.fileName && (
            <button
              onClick={() => journalService.downloadJournal(journal.id, journal.fileName)}
              className="dokmeh-btn-primary !py-1.5 !px-4 text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto"
            >
              <Download size={14} />
              <span>Unduh Berkas</span>
            </button>
          )}
        </div>

        {/* Integrated Viewer / Embed Frame with Dynamic Viewport Height */}
        <div className="flex-1 min-h-[calc(100vh-230px)] bg-[#FFFFFF] border-2 border-[#0F172A] shadow-hard flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex-1 p-8 space-y-4">
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-full min-h-[500px]" />
            </div>
          ) : fileUrl ? (
            <iframe
              src={fileUrl}
              title={journal?.title}
              className="w-full h-full flex-1 border-0"
            />
          ) : (
            <div className="p-8 text-center text-xs text-[#64748B] space-y-3 m-auto">
              <FileText size={36} className="mx-auto text-[#0F172A]" />
              <p className="font-semibold text-base text-[#0F172A]">Tidak Ada Berkas Fisik Terlampir</p>
              <p className="max-w-md mx-auto leading-relaxed">
                Publikasi ini hanya menyertakan naskah teks tertulis langsung di basis data. Anda dapat membaca naskah lengkap di halaman ringkasan artikel.
              </p>
              <button
                onClick={() => navigate(`/article/${id}`)}
                className="dokmeh-btn-primary !py-2 !px-4 text-xs font-semibold"
              >
                Buka Halaman Detail
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
