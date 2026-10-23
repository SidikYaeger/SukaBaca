package com.sukabaca.controller;

import com.sukabaca.model.Journal;
import com.sukabaca.model.Ringkasan;
import com.sukabaca.model.SmartSearch;
import com.sukabaca.model.User;
import com.sukabaca.repository.JournalRepository;
import com.sukabaca.repository.RingkasanRepository;
import com.sukabaca.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/journals")
public class JournalController {

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
        String title = request.getOrDefault("title", "Untitled Journal").toString();
        String author = request.getOrDefault("author", "Adira").toString();
        String content = request.getOrDefault("content", "Journal content text...").toString();
        String publishDate = request.getOrDefault("publishDate", "2026").toString();
        String snippet = content.length() > 100 ? content.substring(0, 100) + "..." : content;

        User user = null;
        if (request.containsKey("userId")) {
            try {
                Long userId = Long.valueOf(request.get("userId").toString());
                user = userRepository.findById(userId).orElse(null);
            } catch (Exception ignored) {}
        }

        Journal journal = new Journal(user, title, author, snippet, content, publishDate);
        journalRepository.save(journal);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Journal uploaded successfully",
                "journalId", journal.getId()
        ));
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
