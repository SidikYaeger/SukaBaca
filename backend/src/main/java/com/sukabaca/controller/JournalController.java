package com.sukabaca.controller;

import com.sukabaca.model.Journal;
import com.sukabaca.repository.JournalRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/journals")
public class JournalController {

    private final JournalRepository journalRepository;

    public JournalController(JournalRepository journalRepository) {
        this.journalRepository = journalRepository;
    }

    @GetMapping
    public List<Journal> getAllJournals(@RequestParam(required = false) String search) {
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
    public ResponseEntity<?> uploadJournal(@RequestBody Map<String, String> request) {
        String title = request.getOrDefault("title", "Untitled Journal");
        String author = request.getOrDefault("author", "Adira");
        String content = request.getOrDefault("content", "Journal content text...");
        String snippet = content.length() > 100 ? content.substring(0, 100) + "..." : content;

        Journal journal = new Journal(title, author, snippet, content, "2026");
        journalRepository.save(journal);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Journal uploaded successfully",
                "journalId", journal.getId()
        ));
    }

    @PostMapping("/{id}/summarize")
    public ResponseEntity<?> summarizeJournal(@PathVariable Long id) {
        return journalRepository.findById(id).map(j -> {
            String summary = "Ringkasan Eksekutif: Jurnal ini membahas metodologi dan inovasi terkini di bidang arsitektur berkelanjutan.";
            j.setSummary(summary);
            journalRepository.save(j);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "summary", summary
            ));
        }).orElse(ResponseEntity.notFound().build());
    }
}
