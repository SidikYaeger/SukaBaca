package com.sukabaca.controller;

import com.sukabaca.model.Journal;
import com.sukabaca.model.Ringkasan;
import com.sukabaca.model.SmartSearch;
import com.sukabaca.model.User;
import com.sukabaca.repository.JournalRepository;
import com.sukabaca.repository.RingkasanRepository;
import com.sukabaca.repository.UserRepository;
import org.springframework.http.ContentDisposition;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/journals")
public class JournalController {

    private static final Path UPLOAD_DIR = Paths.get("uploads");
    private static final long MAX_FILE_BYTES = 8L * 1024 * 1024;
    private static final Map<String, String> MEDIA_TYPES = Map.of(
            "pdf", "application/pdf",
            "txt", "text/plain;charset=UTF-8",
            "doc", "application/msword",
            "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final JournalRepository journalRepository;
    private final RingkasanRepository ringkasanRepository;
    private final UserRepository userRepository;

    public JournalController(JournalRepository journalRepository,
                             RingkasanRepository ringkasanRepository,
                             UserRepository userRepository) {
        this.journalRepository = journalRepository;
        this.ringkasanRepository = ringkasanRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Journal> getAllJournals(@RequestParam(required = false) String search,
                                        @RequestParam(required = false) Long userId) {
        if (userId != null) {
            return journalRepository.findByUserId(userId);
        }
        if (search != null && !search.trim().isEmpty()) {
            return journalRepository.findByTitleContainingIgnoreCase(search);
        }
        return journalRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getJournalById(@PathVariable Long id) {
        return journalRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadJournal(@RequestBody Map<String, Object> request) {
        String title = request.getOrDefault("title", "").toString().trim();
        if (title.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title is required"));
        }
        String author = request.getOrDefault("author", "Adira").toString();
        String abstractText = request.getOrDefault("abstract", "").toString();
        String content = request.getOrDefault("content", abstractText.isEmpty() ? "Journal content text..." : abstractText).toString();
        String publishDate = request.getOrDefault("publishDate", "2026").toString();
        String category = request.getOrDefault("category", "Umum").toString();
        String snippetSource = abstractText.isEmpty() ? content : abstractText;
        String snippet = snippetSource.length() > 160 ? snippetSource.substring(0, 160) + "..." : snippetSource;

        String originalName = request.containsKey("fileName")
                ? request.get("fileName").toString().replaceAll("[\\\\/]", "_")
                : null;
        String ext = extensionOf(originalName);
        byte[] fileBytes = null;
        if (request.containsKey("fileBase64") && !request.get("fileBase64").toString().isEmpty()) {
            if (ext == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Unsupported file type"));
            }
            try {
                fileBytes = Base64.getDecoder().decode(request.get("fileBase64").toString());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid file data"));
            }
            if (fileBytes.length > MAX_FILE_BYTES) {
                return ResponseEntity.status(413).body(Map.of("message", "File exceeds 8 MB limit"));
            }
        }

        User user = null;
        if (request.containsKey("userId")) {
            try {
                Long userId = Long.valueOf(request.get("userId").toString());
                user = userRepository.findById(userId).orElse(null);
            } catch (Exception ignored) {}
        }

        Journal journal = new Journal(user, title, author, snippet, content, publishDate);
        journal.setCategory(category);
        journal.setAbstractText(abstractText.isEmpty() ? null : abstractText);
        journal.setFormatFile(ext != null ? ext.toUpperCase() : request.getOrDefault("formatFile", "PDF").toString());
        journalRepository.save(journal);

        if (fileBytes != null) {
            try {
                Files.createDirectories(UPLOAD_DIR);
                Files.write(UPLOAD_DIR.resolve(journal.getId() + "." + ext), fileBytes);
                journal.setFileName(originalName);
                journalRepository.save(journal);
            } catch (IOException e) {
                journalRepository.delete(journal);
                return ResponseEntity.status(500).body(Map.of("message", "Failed to store file"));
            }
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Journal uploaded successfully",
                "journalId", journal.getId()
        ));
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
        Path path = UPLOAD_DIR.resolve(id + "." + ext);
        if (!Files.isRegularFile(path)) {
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
            return ResponseEntity.status(500).body(Map.of("message", "Failed to read file"));
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

    @PostMapping("/{id}/summarize")
    public ResponseEntity<?> summarizeJournal(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        return journalRepository.findById(id).map(j -> {
            String model = (body != null && body.containsKey("model")) ? body.get("model") : "gemini-1.5-flash";
            String isi = (body != null && body.containsKey("isi")) ? body.get("isi")
                    : "Ringkasan Eksekutif: Jurnal ini membahas metodologi dan inovasi terkini di bidang arsitektur berkelanjutan.";

            Ringkasan ringkasan = new Ringkasan(j, model, isi);
            ringkasanRepository.save(ringkasan);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "ringkasanId", ringkasan.getRingkasanId(),
                    "journalId", j.getId(),
                    "model", ringkasan.getModel(),
                    "isi", ringkasan.getIsi(),
                    "tanggalDibuat", ringkasan.getTanggalDibuat().toString()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<?> recordView(@PathVariable Long id) {
        return journalRepository.findById(id).map(j -> {
            j.incrementViews();
            journalRepository.save(j);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "journalId", j.getId(),
                    "views", j.getViews()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/download")
    public ResponseEntity<?> recordDownload(@PathVariable Long id) {
        return journalRepository.findById(id).map(j -> {
            j.incrementDownload();
            journalRepository.save(j);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "journalId", j.getId(),
                    "download", j.getDownload()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/smart-search")
    public List<Journal> smartSearchJournals(@RequestBody(required = false) SmartSearch searchCriteria) {
        List<Journal> allJournals = journalRepository.findAll();
        if (searchCriteria == null) {
            return allJournals;
        }
        return searchCriteria.applyFilterAndSort(allJournals);
    }

    @GetMapping("/{id}/ringkasan")
    public ResponseEntity<?> getRingkasanByJournalId(@PathVariable Long id) {
        List<Ringkasan> ringkasanList = ringkasanRepository.findByJournalId(id);
        return ResponseEntity.ok(ringkasanList);
    }
}
