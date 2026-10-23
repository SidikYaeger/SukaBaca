package com.sukabaca.repository;

import com.sukabaca.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByJournalId(Long journalId);
    List<Review> findByUserId(Long userId);
}
