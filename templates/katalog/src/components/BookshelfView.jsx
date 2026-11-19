import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Star,
  User
} from 'lucide-react';
import { formatCallNumber } from './DeskShell';
import { SmoothCollapse } from './SmoothCollapse';

const SHELF_ROWS = 2;
const EXIT_BASE_MS = 200;
const EXIT_STAGGER_MS = 5;
const ENTER_BASE_MS = 380;
const ENTER_STAGGER_MS = 14;

const CATEGORY_THEMES = {
  'Artificial Intelligence': 'cerulean',
  'Teknologi Informasi': 'indigo',
  'Pendidikan & Metodologi': 'paper',
  'Arsitektur & Energi': 'slate',
  'Hukum & Kebijakan': 'plum',
  'Kesehatan': 'berry',
  'Ekonomi & Bisnis': 'sky',
  'Sains & Matematika': 'indigo',
  'Umum': 'paper'
};

const FALLBACK_THEMES = ['cerulean', 'paper', 'plum', 'indigo', 'sky', 'slate', 'berry'];

export function getBookVisualProps(journal, index = 0) {
  const idNum = Number(journal?.id) || index + 1;
  const seed = (idNum * 37 + (journal?.title?.length || 12) * 13) >>> 0;
  const theme =
    CATEGORY_THEMES[journal?.category] ||
    FALLBACK_THEMES[seed % FALLBACK_THEMES.length];

  // Staggered spine heights (184px – 232px) and widths (56px – 72px)
  const height = 184 + (seed % 5) * 12;
  const width = 56 + ((seed >> 3) % 4) * 5 + (((seed >> 3) % 4) === 3 ? 1 : 0);
  const bandStyle = (seed >> 5) % 3; // 0: double bands, 1: top cap, 2: thin rule

  return { theme, height, width, bandStyle };
}

/**
 * Compute how many books fit comfortably across one wall shelf.
 * At standard 1200px container width (~1080px inner shelf), returns 15 per row
 * -> 30 journals across 2 rows of shelves.
 */
function computeBooksPerShelf(shelfBoxWidth, viewportWidth) {
  if (shelfBoxWidth > 0) {
    const isCompact = viewportWidth <= 640;
    const horizPad = isCompact ? 38 : 82;
    const inner = Math.max(200, shelfBoxWidth - horizPad);
    const slotTarget = isCompact ? 56 : 71;
    return Math.max(4, Math.min(15, Math.floor((inner + 5) / slotTarget)));
  }
  if (viewportWidth >= 1140) return 15;
  if (viewportWidth >= 960) return 12;
  if (viewportWidth >= 740) return 9;
  if (viewportWidth >= 400) return 6;
  if (viewportWidth >= 355) return 5;
  return 4;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  );
}

export function BookshelfView({ journals, onToggleSave, busySaveId }) {
  const navigate = useNavigate();
  const wallRef = useRef(null);
  const [booksPerShelf, setBooksPerShelf] = useState(() =>
    typeof window !== 'undefined' ? computeBooksPerShelf(0, window.innerWidth) : 15
  );
  const [page, setPage] = useState(0);
  // phase drives CSS animations: idle | exit | enter ; variant: next | prev | rise
  const [motion, setMotion] = useState({ phase: 'enter', variant: 'rise' });
  const [highlightedId, setHighlightedId] = useState(null);
  const [openingBook, setOpeningBook] = useState(null);
  const [dissolvingOpen, setDissolvingOpen] = useState(false);
  const timersRef = useRef([]);

  const pageSize = booksPerShelf * SHELF_ROWS;
  const totalPages = Math.max(1, Math.ceil(journals.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn, ms) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    const updateCapacity = () => {
      const boxW = wallRef.current?.clientWidth || 0;
      setBooksPerShelf(computeBooksPerShelf(boxW, window.innerWidth));
    };
    updateCapacity();
    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && wallRef.current) {
      ro = new ResizeObserver(updateCapacity);
      ro.observe(wallRef.current);
    }
    window.addEventListener('resize', updateCapacity);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateCapacity);
    };
  }, []);

  const playEnter = useCallback(
    (variant) => {
      if (prefersReducedMotion()) {
        setMotion({ phase: 'idle', variant });
        return;
      }
      setMotion({ phase: 'enter', variant });
      schedule(
        () => setMotion({ phase: 'idle', variant }),
        ENTER_BASE_MS + pageSize * ENTER_STAGGER_MS + 60
      );
    },
    [pageSize, schedule]
  );

  // New search result set (different journal IDs) → back to shelf 1 with a rise-in.
  // Saving/unsaving keeps the same IDs, so the current shelf page is preserved.
  const idsKey = useMemo(() => journals.map((j) => j.id).join(','), [journals]);
  useEffect(() => {
    clearTimers();
    setPage(0);
    playEnter('rise');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  // Clamp page if the viewport shrinks the page size
  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const pageJournals = useMemo(
    () => journals.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [journals, safePage, pageSize]
  );

  const shelves = useMemo(() => {
    if (!pageJournals.length) return [[]];
    const rowCount = Math.min(SHELF_ROWS, Math.ceil(pageJournals.length / booksPerShelf));
    const rows = [];
    for (let r = 0; r < rowCount; r += 1) {
      rows.push(pageJournals.slice(r * booksPerShelf, r * booksPerShelf + booksPerShelf));
    }
    return rows;
  }, [pageJournals, booksPerShelf]);

  // Keep the highlighted book on the visible shelf page
  useEffect(() => {
    if (!pageJournals.length) {
      setHighlightedId(null);
      return;
    }
    setHighlightedId((prev) =>
      pageJournals.some((j) => j.id === prev) ? prev : pageJournals[0].id
    );
  }, [pageJournals]);

  const highlightedJournal = useMemo(
    () => pageJournals.find((j) => j.id === highlightedId) || pageJournals[0] || null,
    [pageJournals, highlightedId]
  );

  const goToPage = (target) => {
    if (target < 0 || target >= totalPages || target === safePage) return;
    if (motion.phase === 'exit' || openingBook) return;
    const variant = target > safePage ? 'next' : 'prev';
    clearTimers();

    if (prefersReducedMotion()) {
      setPage(target);
      setMotion({ phase: 'idle', variant });
      return;
    }

    setMotion({ phase: 'exit', variant });
    schedule(() => {
      setPage(target);
      playEnter(variant);
    }, EXIT_BASE_MS + pageJournals.length * EXIT_STAGGER_MS + 20);
  };

  const handleOpenBook = (journal, visual) => {
    if (!journal || openingBook) return;
    const state = {
      openedAsBook: true,
      bookTheme: visual.theme,
      prefetchedJournal: journal
    };

    if (prefersReducedMotion()) {
      navigate(`/journal/${journal.id}`, { state });
      return;
    }

    setDissolvingOpen(false);
    setOpeningBook({ journal, visual });
    schedule(() => setDissolvingOpen(true), 520);
    schedule(() => navigate(`/journal/${journal.id}`, { state }), 690);
  };

  const rangeStart = journals.length ? safePage * pageSize + 1 : 0;
  const rangeEnd = Math.min(journals.length, (safePage + 1) * pageSize);
  const motionClass =
    motion.phase === 'idle' ? '' : ` is-${motion.phase}-${motion.variant}`;

  return (
    <section className="bookshelf-stage" aria-label="Rak buku hasil pencarian jurnal">
      {/* Live Inspection Strip for Highlighted Book */}
      <SmoothCollapse open={Boolean(highlightedJournal)}>
        {highlightedJournal && (
          <div className="shelf-inspect-bar" aria-live="polite">
            <div key={highlightedJournal.id} className="shelf-inspect-content">
              <div className="shelf-inspect-main">
                <div className="shelf-inspect-badges">
                  <span className="call-number">{formatCallNumber(highlightedJournal.id)}</span>
                  <span className="cat-tag">{highlightedJournal.category}</span>
                  <span className="format-pill">{highlightedJournal.formatFile}</span>
                </div>
                <h2 className="shelf-inspect-title">{highlightedJournal.title}</h2>
                <div className="shelf-inspect-meta">
                  <span className="meta-piece">
                    <User size={13} aria-hidden="true" />
                    <span>{highlightedJournal.author}</span>
                  </span>
                  <span className="meta-piece tabular">
                    <Calendar size={13} aria-hidden="true" />
                    <span>{highlightedJournal.publishDate}</span>
                  </span>
                  <span className="meta-piece tabular">
                    <Star size={13} aria-hidden="true" />
                    <span>
                      {highlightedJournal.reviewCount > 0
                        ? `${highlightedJournal.averageRating.toFixed(1)} (${highlightedJournal.reviewCount})`
                        : '—'}
                    </span>
                  </span>
                  <span className="meta-piece tabular">
                    <Eye size={13} aria-hidden="true" />
                    <span>{highlightedJournal.views}</span>
                  </span>
                  <span className="meta-piece tabular">
                    <Download size={13} aria-hidden="true" />
                    <span>{highlightedJournal.download}</span>
                  </span>
                </div>
              </div>

              <div className="shelf-inspect-actions">
                <button
                  type="button"
                  className={`btn btn-sm${highlightedJournal.isSaved ? ' btn-brass' : ''}`}
                  onClick={() => onToggleSave(highlightedJournal)}
                  disabled={busySaveId === highlightedJournal.id}
                  aria-pressed={highlightedJournal.isSaved}
                >
                  {highlightedJournal.isSaved ? (
                    <BookmarkCheck size={15} aria-hidden="true" />
                  ) : (
                    <Bookmark size={15} aria-hidden="true" />
                  )}
                  <span>{highlightedJournal.isSaved ? 'Tersimpan' : 'Simpan'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() =>
                    handleOpenBook(highlightedJournal, getBookVisualProps(highlightedJournal))
                  }
                >
                  <BookOpen size={15} aria-hidden="true" />
                  <span>Buka</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </SmoothCollapse>

      {/* Shelf Pager (smoothly expands when collection spans multiple shelf pages) */}
      <SmoothCollapse open={totalPages > 1}>
        <nav className="shelf-pager" aria-label="Navigasi halaman rak buku">
          <button
            type="button"
            className="btn btn-ghost btn-sm shelf-pager-btn"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 0 || motion.phase === 'exit'}
          >
            <ChevronLeft size={16} aria-hidden="true" />
            <span>Sebelumnya</span>
          </button>

          <div className="shelf-pager-status">
            <span className="shelf-pager-range tabular" aria-live="polite">
              Jurnal {rangeStart}–{rangeEnd} dari {journals.length}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm shelf-pager-btn"
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage >= totalPages - 1 || motion.phase === 'exit'}
          >
            <span>Berikutnya</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </nav>
      </SmoothCollapse>

      {/* Floating Wall Shelves (1 to 2 tiers based on visible journal count) */}
      <div ref={wallRef} className={`wall-shelves${motionClass}`}>
        {shelves.map((row, rowIndex) => {
          const isFullRow = row.length === booksPerShelf && journals.length > 0;
          return (
            <div key={rowIndex} className="shelf-tier">
              <div
                className={`shelf-books-row${isFullRow ? ' is-full-row' : ''}`}
                role="list"
                aria-label={`Rak ${rowIndex + 1}`}
              >
                {journals.length === 0 && rowIndex === 0 ? (
                  <div className="shelf-empty-whisper">Tidak ada jurnal yang ditemukan</div>
                ) : (
                  row.map((journal, colIndex) => {
                    const slotIndex = rowIndex * booksPerShelf + colIndex;
                    const visual = getBookVisualProps(journal);
                    const isHighlighted = highlightedId === journal.id;
                    const isOpening = openingBook?.journal?.id === journal.id;
                    const isLeaning =
                      row.length >= 2 &&
                      colIndex === row.length - 1 &&
                      !isFullRow;

                    return (
                      <div
                        key={journal.id}
                        className="shelf-book-slot"
                        role="listitem"
                        style={{
                          '--i': slotIndex,
                          '--book-w': `${visual.width}px`,
                          '--book-grow': visual.width
                        }}
                      >
                        <button
                          type="button"
                          className={`book-spine is-theme-${visual.theme} is-band-${visual.bandStyle}${
                            isHighlighted ? ' is-highlighted' : ''
                          }${isOpening ? ' is-opening' : ''}${isLeaning ? ' is-leaning' : ''}`}
                          style={{
                            '--book-h': `${visual.height}px`
                          }}
                          onMouseEnter={() => setHighlightedId(journal.id)}
                          onFocus={() => setHighlightedId(journal.id)}
                          onClick={() => handleOpenBook(journal, visual)}
                          aria-label={`Buka buku jurnal: ${journal.title} oleh ${journal.author} (${journal.publishDate})`}
                        >
                          {journal.isSaved && <span className="book-ribbon" aria-hidden="true" />}
                          <span className="book-spine-cap" aria-hidden="true" />
                          <span className="book-spine-title">{journal.title}</span>
                          <span className="book-spine-foot">
                            <span className="book-spine-year">{journal.publishDate || '—'}</span>
                          </span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Wall-mounted Floating Shelf Plank + Side Brackets */}
              <div className="shelf-plank-wrap" aria-hidden="true">
                <span className="shelf-bracket is-left" />
                <div className="shelf-plank">
                  <span className="shelf-plank-top" />
                  <span className="shelf-plank-front" />
                </div>
                <span className="shelf-bracket is-right" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3D Book-Opening Transition Stage (portaled to body so backdrop covers 100% of viewport) */}
      {openingBook &&
        createPortal(
          <div
            className={`book-open-overlay${dissolvingOpen ? ' is-dissolving' : ''}`}
            role="status"
            aria-live="assertive"
            aria-label={`Membuka buku ${openingBook.journal.title}`}
          >
            <div className="book-open-scene">
              <div className={`book-open-rig is-theme-${openingBook.visual.theme}`}>
                <div className="book-open-page-base">
                  <div className="book-open-page-inner">
                    <span className="call-number">{formatCallNumber(openingBook.journal.id)}</span>
                    <h3 className="book-open-page-title">{openingBook.journal.title}</h3>
                    <p className="book-open-page-author">{openingBook.journal.author}</p>
                    <div className="book-open-page-lines" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>

                <div className="book-open-cover-leaf">
                  <div className="book-open-cover-front">
                    <span className="book-cover-call">{formatCallNumber(openingBook.journal.id)}</span>
                    <div className="book-cover-body">
                      <span className="book-cover-cat">{openingBook.journal.category}</span>
                      <strong className="book-cover-title">{openingBook.journal.title}</strong>
                      <span className="book-cover-author">{openingBook.journal.author}</span>
                    </div>
                    <span className="book-cover-footer">SUKABACA · {openingBook.journal.publishDate}</span>
                  </div>
                  <div className="book-open-cover-back" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
