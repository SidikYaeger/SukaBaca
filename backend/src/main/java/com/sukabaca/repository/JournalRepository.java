package com.sukabaca.repository;

import com.sukabaca.model.Journal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JournalRepository extends JpaRepository<Journal, Long> {
    List<Journal> findByTitleContainingIgnoreCase(String title);
    List<Journal> findByUserId(Long userId);
}

