package com.sukabaca.repository;

import com.sukabaca.model.SavedJournal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SavedJournalRepository extends JpaRepository<SavedJournal, Long> {
    List<SavedJournal> findByUserIdOrderBySavedAtDesc(Long userId);
    Optional<SavedJournal> findByUserIdAndJournalId(Long userId, Long journalId);
    void deleteByJournalId(Long journalId);
}
