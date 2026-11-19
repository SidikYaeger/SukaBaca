package com.sukabaca.repository;

import com.sukabaca.model.UserHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserHistoryRepository extends JpaRepository<UserHistory, Long> {
    List<UserHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<UserHistory> findByUserIdAndJournalId(Long userId, Long journalId);
    void deleteByJournalId(Long journalId);
}
