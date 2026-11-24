package com.sukabaca.controller;

import com.sukabaca.exception.ApiException;
import com.sukabaca.model.Journal;
import com.sukabaca.model.Review;
import com.sukabaca.model.Ringkasan;
import com.sukabaca.model.SavedJournal;
import com.sukabaca.model.SmartSearch;
import com.sukabaca.model.User;
import com.sukabaca.model.UserHistory;
import com.sukabaca.repository.JournalRepository;
import com.sukabaca.repository.ReviewRepository;
import com.sukabaca.repository.RingkasanRepository;
import com.sukabaca.repository.SavedJournalRepository;
import com.sukabaca.repository.UserHistoryRepository;
import com.sukabaca.repository.UserRepository;
import com.sukabaca.security.TokenService;
import com.sukabaca.service.AiSummarizationService;
import com.sukabaca.service.DocumentTextExtractor;
import com.sukabaca.service.SummaryPdfService;
import com.sukabaca.service.UserHistoryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/journals")
public class JournalController {

    private static final Path UPLOAD_DIR = Paths.get("uploads").toAbsolutePath().normalize();
    private static final long MAX_FILE_BYTES = 25L * 1024 * 1024;
    private static final Map<String, String> MEDIA_TYPES = Map.of(
            "pdf", "application/pdf",
            "txt", "text/plain;charset=UTF-8",
            "doc", "application/msword",
            "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final JournalRepository journalRepository;
    private final RingkasanRepository ringkasanRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final UserHistoryRepository userHistoryRepository;
    private final UserHistoryService userHistoryService;
    private final SavedJournalRepository savedJournalRepository;
    private final AiSummarizationService aiSummarizationService;
    private final SummaryPdfService summaryPdfService;
    private final DocumentTextExtractor documentTextExtractor;

    public JournalController(JournalRepository journalRepository,
                             RingkasanRepository ringkasanRepository,
                             UserRepository userRepository,
                             ReviewRepository reviewRepository,
                             UserHistoryRepository userHistoryRepository,
                             UserHistoryService userHistoryService,
                             SavedJournalRepository savedJournalRepository,
                             AiSummarizationService aiSummarizationService,
                             SummaryPdfService summaryPdfService,
                             DocumentTextExtractor documentTextExtractor) {
        this.journalRepository = journalRepository;
        this.ringkasanRepository = ringkasanRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.userHistoryRepository = userHistoryRepository;
        this.userHistoryService = userHistoryService;
        this.savedJournalRepository = savedJournalRepository;
        this.aiSummarizationService = aiSummarizationService;
        this.summaryPdfService = summaryPdfService;
        this.documentTextExtractor = documentTextExtractor;
    }

    @GetMapping
    public List<Map<String, Object>> getAllJournals(@RequestParam(required = false) String search,
                                                    @RequestParam(required = false) Long userId,
                                                    HttpServletRequest request) {
        List<Journal> list;
        if (userId != null) {
            list = journalRepository.findByUserId(userId);
        } else if (search != null && !search.trim().isEmpty()) {
            list = journalRepository.findByTitleContainingIgnoreCase(search.trim());
        } else {
            list = journalRepository.findAll();
        }
        Set<Long> savedIds = resolveSavedIds(request);
        return list.stream().map(j -> toJournalDto(j, savedIds)).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getJournalById(@PathVariable Long id, HttpServletRequest request) {
        Set<Long> savedIds = resolveSavedIds(request);
        return journalRepository.findById(id)
                .map(j -> ResponseEntity.ok(toJournalDto(j, savedIds)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadJournalMultipart(@RequestParam("title") String title,
                                                    @RequestParam(value = "author", required = false) String author,
                                                    @RequestParam(value = "publishDate", required = false) String publishDate,
                                                    @RequestParam(value = "year", required = false) String year,
                                                    @RequestParam(value = "category", required = false) String category,
                                                    @RequestParam(value = "formatFile", required = false) String formatFile,
                                                    @RequestParam(value = "abstract", required = false) String abstractParam,
                                                    @RequestParam(value = "content", required = false) String contentParam,
                                                    @RequestParam(value = "file", required = false) MultipartFile file,
                                                    HttpServletRequest request) {
        User user = TokenService.requireUser(request, userRepository);
        String originalFileName = null;
        byte[] fileBytes = null;
        if (file != null && !file.isEmpty()) {
            originalFileName = file.getOriginalFilename();
            try {
                fileBytes = file.getBytes();
            } catch (IOException e) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Gagal membaca berkas unggahan");
            }
        }
        String effectiveYear = (publishDate != null && !publishDate.isBlank()) ? publishDate : year;
        return processJournalUpload(
                user, title, author, category, effectiveYear, formatFile,
                abstractParam, contentParam, originalFileName, fileBytes
        );
    }

    @PostMapping(value = "/upload", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> uploadJournal(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        User user = TokenService.requireUser(request, userRepository);
        if (body == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Body permintaan wajib diisi");
        }

        String rawFileName = body.get("fileName") != null ? String.valueOf(body.get("fileName")) : null;
        byte[] fileBytes = null;
        if (body.get("fileBase64") != null && !String.valueOf(body.get("fileBase64")).isBlank()) {
            try {
                fileBytes = Base64.getDecoder().decode(String.valueOf(body.get("fileBase64")));
            } catch (IllegalArgumentException e) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Data berkas tidak valid");
            }
            if (fileBytes.length == 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Berkas tidak boleh kosong");
            }
        }

        Object rawYear = body.get("publishDate") != null ? body.get("publishDate") : body.get("year");
        return processJournalUpload(
                user,
                body.get("title"),
                body.get("author"),
                body.get("category"),
                rawYear,
                body.get("formatFile"),
                body.get("abstract"),
                body.get("content"),
                rawFileName,
                fileBytes
        );
    }

    private ResponseEntity<?> processJournalUpload(User user,
                                                   Object rawTitle,
                                                   Object rawAuthor,
                                                   Object rawCategory,
                                                   Object rawPublishDate,
                                                   Object rawFormatFile,
                                                   Object rawAbstract,
                                                   Object rawContent,
                                                   String rawFileName,
                                                   byte[] fileBytes) {
        String title = validateBoundedText(rawTitle, "Judul", 3, 255);
        String author = validateBoundedText(
                rawAuthor != null && !String.valueOf(rawAuthor).isBlank()
                        ? rawAuthor
                        : (user.getName() != null ? user.getName() : user.getUsername()),
                "Penulis", 2, 150
        );
        String category = validateBoundedText(
                rawCategory != null && !String.valueOf(rawCategory).isBlank()
                        ? rawCategory
                        : "Umum",
                "Kategori", 2, 100
        );
        String publishDate = parsePublishYear(rawPublishDate);

        String originalName = rawFileName != null && !rawFileName.isBlank()
                ? Paths.get(rawFileName).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "_")
                : null;
        String ext = extensionOf(originalName);
        String extractedText = null;

        if (fileBytes != null) {
            if (ext == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Format berkas harus .pdf, .docx, .doc, atau .txt");
            }
            if (fileBytes.length > MAX_FILE_BYTES) {
                throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "Ukuran berkas melebihi batas 25 MB");
            }
            validateFileSignature(ext, fileBytes);
            extractedText = documentTextExtractor.extractTextFromBytes(ext, fileBytes);
            if (extractedText == null && ("pdf".equals(ext) || "docx".equals(ext))) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Berkas " + ext.toUpperCase() + " rusak atau tidak dapat dibaca");
            }
        }

        String providedAbstract = rawAbstract != null ? String.valueOf(rawAbstract).trim() : "";
        String providedContent = rawContent != null ? String.valueOf(rawContent).trim() : "";
        String cleanExtracted = extractedText != null ? extractedText.trim() : "";

        if (fileBytes == null && providedAbstract.isEmpty() && providedContent.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Unggah berkas naskah (.pdf atau .docx) atau isi teks naskah terlebih dahulu");
        }
        if (fileBytes == null && Math.max(providedAbstract.length(), providedContent.length()) < 30) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Abstrak atau teks naskah minimal 30 karakter");
        }

        String content = !providedContent.isEmpty()
                ? providedContent
                : (!providedAbstract.isEmpty()
                        ? providedAbstract
                        : (!cleanExtracted.isEmpty()
                                ? cleanExtracted
                                : "Dokumen jurnal akademik \"" + title + "\" oleh " + author + "."));

        String abstractCandidate = !providedAbstract.isEmpty()
                ? providedAbstract
                : (!providedContent.isEmpty() ? providedContent : content);
        String abstractText = abstractCandidate.length() > 10000
                ? abstractCandidate.substring(0, 10000)
                : abstractCandidate;
        String snippet = abstractText.length() > 160 ? abstractText.substring(0, 160) + "..." : abstractText;

        String resolvedFormat = ext != null
                ? ext.toUpperCase()
                : (rawFormatFile != null && !String.valueOf(rawFormatFile).isBlank()
                        ? String.valueOf(rawFormatFile).trim().toUpperCase()
                        : "PDF");

        Journal journal = new Journal(user, title, author, snippet, content, publishDate);
        journal.setCategory(category);
        journal.setAbstractText(abstractText);
        journal.setFormatFile(resolvedFormat);
        journalRepository.save(journal);

        if (fileBytes != null) {
            try {
                Files.createDirectories(UPLOAD_DIR);
                Path dest = UPLOAD_DIR.resolve(journal.getId() + "." + ext).normalize();
                if (!dest.startsWith(UPLOAD_DIR)) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Nama berkas tidak valid");
                }
                Files.write(dest, fileBytes);
                journal.setFileName(originalName);
                journalRepository.save(journal);
            } catch (IOException e) {
                journalRepository.delete(journal);
                throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Gagal menyimpan berkas jurnal");
            }
        }

        userHistoryService.recordLatest(user, journal, "UPLOADED");

        Map<String, Object> response = new LinkedHashMap<>(toJournalDto(journal, Collections.emptySet()));
        response.put("status", "success");
        response.put("message", "Jurnal berhasil diunggah");
        response.put("journalId", journal.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateJournal(@PathVariable Long id,
                                           @RequestBody Map<String, Object> body,
                                           HttpServletRequest request) {
        User actor = TokenService.requireUser(request, userRepository);
        Journal journal = journalRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Jurnal tidak ditemukan"));
        assertCanManage(journal, actor);

        if (body == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Body permintaan wajib diisi");
        }

        String title = validateBoundedText(body.get("title"), "Judul", 3, 255);
        String author = validateBoundedText(body.get("author"), "Penulis", 2, 150);
        String category = validateBoundedText(body.get("category"), "Kategori", 2, 100);
        String abstractText = validateBoundedText(body.get("abstract"), "Abstrak", 30, 10000);
        String publishDate = parsePublishYear(body.get("publishDate"));

        journal.setTitle(title);
        journal.setAuthor(author);
        journal.setCategory(category);
        journal.setAbstractText(abstractText);
        journal.setSnippet(abstractText.length() > 160 ? abstractText.substring(0, 160) + "..." : abstractText);
        journal.setPublishDate(publishDate);
        if (body.get("content") != null && !String.valueOf(body.get("content")).isBlank()) {
            journal.setContent(String.valueOf(body.get("content")).trim());
        } else if (journal.getFileName() == null) {
            journal.setContent(abstractText);
        }
        journalRepository.save(journal);

        return ResponseEntity.ok(toJournalDto(journal, resolveSavedIds(request)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteJournal(@PathVariable Long id, HttpServletRequest request) {
        User actor = TokenService.requireUser(request, userRepository);
        Journal journal = journalRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Jurnal tidak ditemukan"));
        assertCanManage(journal, actor);

        reviewRepository.deleteByJournalId(id);
        ringkasanRepository.deleteByJournalId(id);
        userHistoryRepository.deleteByJournalId(id);
        savedJournalRepository.deleteByJournalId(id);

        String ext = extensionOf(journal.getFileName());
        if (ext != null) {
            Path path = UPLOAD_DIR.resolve(id + "." + ext).normalize();
            if (path.startsWith(UPLOAD_DIR)) {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException ignored) {}
            }
        }

        journalRepository.delete(journal);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Jurnal berhasil dihapus"));
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<?> getJournalFile(@PathVariable Long id,
                                            @RequestParam(defaultValue = "false") boolean download) {
        Optional<Journal> opt = journalRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Journal journal = opt.get();
        String ext = extensionOf(journal.getFileName());
        if (ext == null) {
            return ResponseEntity.notFound().build();
        }
        Path path = UPLOAD_DIR.resolve(id + "." + ext).normalize();
        if (!path.startsWith(UPLOAD_DIR) || !Files.isRegularFile(path)) {
            return ResponseEntity.notFound().build();
        }
        try {
            byte[] bytes = Files.readAllBytes(path);
            ContentDisposition disposition = ContentDisposition
                    .builder(download ? "attachment" : "inline")
                    .filename(journal.getFileName(), StandardCharsets.UTF_8)
                    .build();
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(MEDIA_TYPES.get(ext)))
                    .header("Content-Disposition", disposition.toString())
                    .header("X-Content-Type-Options", "nosniff")
                    .body(bytes);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Gagal membaca berkas jurnal");
        }
    }

    @PostMapping("/{id}/summarize/start")
    public ResponseEntity<?> startSummarize(@PathVariable Long id,
                                            @RequestBody(required = false) Map<String, String> body,
                                            HttpServletRequest request) {
        User user = TokenService.requireUser(request, userRepository);
        Journal journal = journalRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Jurnal tidak ditemukan"));
        String requestedModel = body != null ? body.get("model") : AiSummarizationService.BASIC_LABEL;

        AiSummarizationService.SummarizeJob job = aiSummarizationService.startJob(journal, user, requestedModel);
        return ResponseEntity.accepted().body(serializeJob(job));
    }

    @GetMapping("/summarize-jobs/{jobId}")
    public ResponseEntity<?> getSummarizeJob(@PathVariable String jobId, HttpServletRequest request) {
        User user = TokenService.requireUser(request, userRepository);
        AiSummarizationService.SummarizeJob job = aiSummarizationService.getJob(jobId, user.getId());
        return ResponseEntity.ok(serializeJob(job));
    }

    @PostMapping("/{id}/summarize")
    public ResponseEntity<?> summarizeJournal(@PathVariable Long id,
                                              @RequestBody(required = false) Map<String, String> body,
                                              HttpServletRequest request) {
        User user = TokenService.requireUser(request, userRepository);
        Journal journal = journalRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Jurnal tidak ditemukan"));
        String requestedModel = body != null ? body.get("model") : AiSummarizationService.BASIC_LABEL;

        Ringkasan ringkasan = aiSummarizationService.summarizeSynchronously(journal, user, requestedModel);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "ringkasanId", ringkasan.getRingkasanId(),
                "journalId", journal.getId(),
                "model", ringkasan.getModel(),
                "isi", ringkasan.getIsi(),
                "tanggalDibuat", ringkasan.getTanggalDibuat().toString()
        ));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<?> recordView(@PathVariable Long id, HttpServletRequest request) {
        Journal journal = journalRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Jurnal tidak ditemukan"));
        journal.incrementViews();
        journalRepository.save(journal);
        TokenService.optionalUser(request, userRepository)
                .ifPresent(user -> userHistoryService.recordLatest(user, journal, "VIEWED"));
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "journalId", journal.getId(),
                "views", journal.getViews()
        ));
    }

    @PostMapping("/{id}/download")
    public ResponseEntity<?> recordDownload(@PathVariable Long id, HttpServletRequest request) {
        Journal journal = journalRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Jurnal tidak ditemukan"));
        journal.incrementDownload();
        journalRepository.save(journal);
        TokenService.optionalUser(request, userRepository)
                .ifPresent(user -> userHistoryService.recordLatest(user, journal, "DOWNLOADED"));
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "journalId", journal.getId(),
                "download", journal.getDownload()
        ));
    }

    @PostMapping("/smart-search")
    public ResponseEntity<?> smartSearchJournals(@RequestBody(required = false) SmartSearch searchCriteria,
                                                 HttpServletRequest request) {
        List<Journal> allJournals = journalRepository.findAll();
        List<Journal> filtered = searchCriteria == null
                ? allJournals
                : searchCriteria.applyFilterAndSort(allJournals);

        Set<Long> savedIds = resolveSavedIds(request);
        List<Map<String, Object>> dtos = filtered.stream()
                .map(j -> toJournalDto(j, savedIds))
                .collect(Collectors.toList());

        if (searchCriteria != null && "rating".equalsIgnoreCase(searchCriteria.getSortBy())) {
            boolean asc = "ASC".equalsIgnoreCase(searchCriteria.getSortOrder());
            dtos.sort((a, b) -> {
                double ra = ((Number) a.get("averageRating")).doubleValue();
                double rb = ((Number) b.get("averageRating")).doubleValue();
                return asc ? Double.compare(ra, rb) : Double.compare(rb, ra);
            });
        }

        Map<String, Long> yearCounts = new TreeMap<>();
        for (Journal j : allJournals) {
            String y = j.getPublishDate();
            if (y != null && y.trim().length() >= 4) {
                String yearKey = y.trim().substring(0, 4);
                yearCounts.merge(yearKey, 1L, Long::sum);
            }
        }

        return ResponseEntity.ok(Map.of(
                "total", dtos.size(),
                "journals", dtos,
                "yearCounts", yearCounts
        ));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getUserHistory(HttpServletRequest request) {
        User user = TokenService.requireUser(request, userRepository);
        Set<Long> savedIds = resolveSavedIdsForUser(user.getId());
        List<UserHistory> rows = userHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<Map<String, Object>> result = rows.stream().map(h -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("historyId", h.getId());
            entry.put("actionType", h.getActionType());
            entry.put("createdAt", h.getCreatedAt().toString());
            entry.put("journal", toJournalDto(h.getJournal(), savedIds));
            return entry;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/saved")
    public ResponseEntity<?> getSavedJournals(HttpServletRequest request) {
        User user = TokenService.requireUser(request, userRepository);
        Set<Long> savedIds = resolveSavedIdsForUser(user.getId());
        List<SavedJournal> rows = savedJournalRepository.findByUserIdOrderBySavedAtDesc(user.getId());
        List<Map<String, Object>> result = rows.stream().map(s -> {
            Map<String, Object> dto = toJournalDto(s.getJournal(), savedIds);
            dto.put("savedAt", s.getSavedAt() != null ? s.getSavedAt().toString() : null);
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<?> saveJournal(@PathVariable Long id, HttpServletRequest request) {
        User user = TokenService.requireUser(request, userRepository);
        Journal journal = journalRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Jurnal tidak ditemukan"));
        if (savedJournalRepository.findByUserIdAndJournalId(user.getId(), id).isEmpty()) {
            savedJournalRepository.save(new SavedJournal(user, journal));
        }
        return ResponseEntity.ok(Map.of("status", "success", "saved", true, "journalId", id));
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<?> unsaveJournal(@PathVariable Long id, HttpServletRequest request) {
        User user = TokenService.requireUser(request, userRepository);
        savedJournalRepository.findByUserIdAndJournalId(user.getId(), id)
                .ifPresent(savedJournalRepository::delete);
        return ResponseEntity.ok(Map.of("status", "success", "saved", false, "journalId", id));
    }

    @GetMapping("/{id}/ringkasan")
    public ResponseEntity<?> getRingkasanByJournalId(@PathVariable Long id) {
        return ResponseEntity.ok(ringkasanRepository.findByJournalId(id));
    }

    @GetMapping("/{id}/ringkasan/pdf")
    public ResponseEntity<byte[]> getRingkasanPdf(@PathVariable Long id,
                                                  @RequestParam(defaultValue = "false") boolean download) {
        Journal journal = journalRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Jurnal tidak ditemukan"));
        Ringkasan ringkasan = ringkasanRepository.findTopByJournalIdOrderByTanggalDibuatDesc(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ringkasan AI belum tersedia"));

        try {
            byte[] pdfBytes = summaryPdfService.generateSummaryPdf(journal, ringkasan);
            String baseName = (journal.getTitle() != null ? journal.getTitle() : "Ringkasan")
                    .replaceAll("[^a-zA-Z0-9._-]+", "_");
            if (baseName.length() > 45) {
                baseName = baseName.substring(0, 45);
            }
            ContentDisposition disposition = (download ? ContentDisposition.attachment() : ContentDisposition.inline())
                    .filename("Ringkasan_" + baseName + ".pdf", StandardCharsets.UTF_8)
                    .build();
            return ResponseEntity.ok()
                    .header("Content-Disposition", disposition.toString())
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(pdfBytes.length)
                    .body(pdfBytes);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Gagal membuat dokumen PDF ringkasan");
        }
    }

    private Map<String, Object> serializeJob(AiSummarizationService.SummarizeJob job) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("jobId", job.getJobId());
        out.put("journalId", job.getJournalId());
        out.put("model", job.getModel());
        out.put("status", job.getStatus());
        out.put("stage", job.getStage());
        out.put("currentPart", job.getCurrentPart());
        out.put("totalParts", job.getTotalParts());
        out.put("message", job.getMessage());
        if (job.getError() != null) {
            out.put("error", job.getError());
        }
        if (job.getRemainingUsage() != null) {
            out.put("remainingUsage", job.getRemainingUsage());
        }
        if (job.getRingkasan() != null) {
            Ringkasan r = job.getRingkasan();
            out.put("ringkasan", Map.of(
                    "ringkasanId", r.getRingkasanId(),
                    "model", r.getModel(),
                    "isi", r.getIsi(),
                    "tanggalDibuat", r.getTanggalDibuat().toString()
            ));
        }
        return out;
    }

    private Set<Long> resolveSavedIds(HttpServletRequest request) {
        return TokenService.optionalUser(request, userRepository)
                .map(u -> resolveSavedIdsForUser(u.getId()))
                .orElse(Collections.emptySet());
    }

    private Set<Long> resolveSavedIdsForUser(Long userId) {
        return savedJournalRepository.findByUserIdOrderBySavedAtDesc(userId).stream()
                .map(s -> s.getJournal().getId())
                .collect(Collectors.toSet());
    }

    private Map<String, Object> toJournalDto(Journal j, Set<Long> savedIds) {
        List<Review> reviews = reviewRepository.findByJournalId(j.getId());
        Double avgRating = Review.hitungRataRataRating(reviews);
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", j.getId());
        dto.put("user", j.getUser());
        dto.put("ownerId", j.getUser() != null ? j.getUser().getId() : null);
        dto.put("title", j.getTitle());
        dto.put("author", j.getAuthor());
        dto.put("snippet", j.getSnippet());
        dto.put("content", j.getContent());
        dto.put("publishDate", j.getPublishDate());
        dto.put("category", j.getCategory());
        dto.put("abstractText", j.getAbstractText());
        dto.put("fileName", j.getFileName());
        dto.put("formatFile", j.getFormatFile());
        dto.put("download", j.getDownload());
        dto.put("views", j.getViews());
        dto.put("createdAt", j.getCreatedAt() != null ? j.getCreatedAt().toString() : null);
        dto.put("averageRating", avgRating);
        dto.put("reviewCount", reviews.size());
        dto.put("isSaved", savedIds.contains(j.getId()));
        return dto;
    }

    private static void assertCanManage(Journal journal, User actor) {
        boolean isOwner = journal.getUser() != null && journal.getUser().getId().equals(actor.getId());
        boolean isAdmin = "admin".equalsIgnoreCase(actor.getRole());
        if (!isOwner && !isAdmin) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Anda hanya dapat mengubah atau menghapus jurnal milik sendiri");
        }
    }

    private static String validateBoundedText(Object raw, String fieldLabel, int min, int max) {
        String val = raw != null ? String.valueOf(raw).trim() : "";
        if (val.length() < min) {
            throw new ApiException(HttpStatus.BAD_REQUEST, fieldLabel + " minimal " + min + " karakter");
        }
        if (val.length() > max) {
            throw new ApiException(HttpStatus.BAD_REQUEST, fieldLabel + " maksimal " + max + " karakter");
        }
        return val;
    }

    private static String parsePublishYear(Object raw) {
        if (raw == null || String.valueOf(raw).isBlank()) {
            return String.valueOf(Year.now().getValue());
        }
        String str = String.valueOf(raw).trim();
        if (!str.matches("^(19|20)\\d{2}$")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tahun terbit harus 4 digit angka (contoh: 2026)");
        }
        return str;
    }

    private static void validateFileSignature(String ext, byte[] bytes) {
        if ("pdf".equals(ext)) {
            if (bytes.length < 4 || bytes[0] != '%' || bytes[1] != 'P' || bytes[2] != 'D' || bytes[3] != 'F') {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Berkas PDF tidak valid");
            }
        } else if ("docx".equals(ext)) {
            if (bytes.length < 2 || bytes[0] != 'P' || bytes[1] != 'K') {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Berkas DOCX tidak valid");
            }
        }
    }

    private static String extensionOf(String fileName) {
        if (fileName == null) {
            return null;
        }
        int dot = fileName.lastIndexOf('.');
        if (dot < 0 || dot == fileName.length() - 1) {
            return null;
        }
        String ext = fileName.substring(dot + 1).toLowerCase();
        return MEDIA_TYPES.containsKey(ext) ? ext : null;
    }
}
