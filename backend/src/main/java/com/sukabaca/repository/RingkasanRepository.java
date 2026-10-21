package com.sukabaca.repository;

import com.sukabaca.model.Ringkasan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RingkasanRepository extends JpaRepository<Ringkasan, Long> {
    List<Ringkasan> findByJournalId(Long journalId);
    Optional<Ringkasan> findTopByJournalIdOrderByTanggalDibuatDesc(Long journalId);
}
