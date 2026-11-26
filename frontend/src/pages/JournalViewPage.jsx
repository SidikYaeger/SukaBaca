import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Sparkles, X } from 'lucide-react';
import Header from '../components/layout/Header';
import AiSummarizerPanel from '../components/journal/AiSummarizerPanel';
import { Skeleton } from '../components/common/UIPrimitives';
import { journalService } from '../services/journal.service';

export default function JournalViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);
  const [docxPreview, setDocxPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSummarizer, setShowSummarizer] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const item = await journalService.getJournalById(id);
        if (!isMounted) return;
        setJournal(item);
        if (item?.fileName && ['DOCX', 'DOC', 'TXT'].includes((item.formatFile || '').toUpperCase())) {
          const preview = await journalService.getDocxPreview(id).catch(() => null);
          if (isMounted) setDocxPreview(preview);
        }
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
  const isDocxOrTxt = ['DOCX', 'DOC', 'TXT'].includes((journal?.formatFile || '').toUpperCase());

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

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowSummarizer((prev) => !prev)}
              className={`${
                showSummarizer ? 'dokmeh-btn-primary' : 'dokmeh-btn-secondary'
              } !py-1.5 !px-3.5 text-xs font-semibold flex items-center gap-1.5`}
            >
              {showSummarizer ? <X size={14} /> : <Sparkles size={14} />}
              <span>{showSummarizer ? 'Tutup AI Summarizer' : 'AI Summarizer'}</span>
            </button>

            {journal?.fileName && (
              <button
                onClick={() => journalService.downloadJournal(journal.id, journal.fileName)}
                className="dokmeh-btn-primary !py-1.5 !px-4 text-xs font-semibold flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Unduh Berkas</span>
              </button>
            )}
          </div>
        </div>

        {/* Integrated Viewer / Embed Frame with Optional AI Summarizer Side Panel */}
        <div className={`flex-1 grid grid-cols-1 ${showSummarizer ? 'lg:grid-cols-12 gap-4' : ''}`}>
          <div className={`${showSummarizer ? 'lg:col-span-7' : ''} min-h-[calc(100vh-230px)] bg-[#FFFFFF] border-2 border-[#0F172A] shadow-hard flex flex-col overflow-hidden`}>
          {loading ? (
            <div className="flex-1 p-8 space-y-4">
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-full min-h-[500px]" />
            </div>
          ) : fileUrl && !isDocxOrTxt ? (
            <iframe
              src={fileUrl}
              title={journal?.title}
              className="w-full h-full flex-1 border-0"
            />
          ) : fileUrl && isDocxOrTxt && docxPreview ? (
            <div className="flex-1 bg-[#F1F5F9] p-4 sm:p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto bg-[#FFFFFF] border border-[#CBD5E1] shadow-hard-sm p-6 sm:p-12 space-y-4">
                <div className="pb-3 mb-4 border-b border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B] font-mono">
                  <span className="truncate">{docxPreview.fileName || journal.fileName}</span>
                  <span className="px-2 py-0.5 bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] font-bold">
                    {docxPreview.formatFile || journal.formatFile}
                  </span>
                </div>
                {Array.isArray(docxPreview.blocks) && docxPreview.blocks.length > 0 ? (
                  docxPreview.blocks.map((block, idx) => {
                    if (block.type === 'table') {
                      return (
                        <div key={idx} className="overflow-x-auto my-4">
                          <table className="w-full border-collapse text-xs sm:text-sm border border-[#CBD5E1]">
                            <tbody>
                              {(block.rows || []).map((row, rIdx) => (
                                <tr key={rIdx} className={rIdx === 0 ? 'bg-[#F8FAFC] font-semibold' : ''}>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="border border-[#CBD5E1] px-3 py-2 align-top text-[#1E293B]">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                    const renderRuns = (runs) =>
                      (runs || []).map((r, rIdx) => {
                        let node = r.text;
                        if (r.bold) node = <strong key={`b-${rIdx}`}>{node}</strong>;
                        if (r.italic) node = <em key={`i-${rIdx}`}>{node}</em>;
                        return <React.Fragment key={rIdx}>{node}</React.Fragment>;
                      });
                    if (block.type === 'h1') {
                      return (
                        <h1 key={idx} className="text-xl sm:text-2xl font-extrabold text-[#0F172A] pt-2 leading-snug">
                          {renderRuns(block.runs)}
                        </h1>
                      );
                    }
                    if (block.type === 'h2') {
                      return (
                        <h2 key={idx} className="text-base sm:text-lg font-bold text-[#0F172A] pt-3 leading-snug">
                          {renderRuns(block.runs)}
                        </h2>
                      );
                    }
                    return (
                      <p key={idx} className="text-sm sm:text-base text-[#1E293B] leading-relaxed">
                        {renderRuns(block.runs)}
                      </p>
                    );
                  })
                ) : (
                  <div className="text-sm sm:text-base text-[#1E293B] leading-relaxed whitespace-pre-wrap">
                    {docxPreview.text || journal.content}
                  </div>
                )}
              </div>
            </div>
          ) : journal?.content ? (
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-4">
              <div className="text-sm sm:text-base text-[#1E293B] leading-relaxed whitespace-pre-wrap max-w-3xl mx-auto">
                {journal.content}
              </div>
            </div>
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

          {showSummarizer && (
            <div className="lg:col-span-5 max-h-[calc(100vh-230px)] overflow-y-auto">
              <AiSummarizerPanel
                journalId={id}
                journalTitle={journal?.title || 'ringkasan'}
                compact
              />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
