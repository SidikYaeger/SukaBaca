package com.sukabaca.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ringkasan")
public class Ringkasan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ringkasan_id")
    private Long ringkasanId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "jurnal_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Journal journal;

    @Column(name = "model", length = 100)
    private String model;

    @Lob
    @Column(name = "isi", columnDefinition = "LONGTEXT")
    private String isi;

    @Column(name = "tanggal_dibuat")
    private LocalDateTime tanggalDibuat = LocalDateTime.now();

    public Ringkasan() {}

    public Ringkasan(Journal journal, String model, String isi) {
        this.journal = journal;
        this.model = model;
        this.isi = isi;
        this.tanggalDibuat = LocalDateTime.now();
    }

    public Long getRingkasanId() { return ringkasanId; }
    public void setRingkasanId(Long ringkasanId) { this.ringkasanId = ringkasanId; }

    public Journal getJournal() { return journal; }
    public void setJournal(Journal journal) { this.journal = journal; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getIsi() { return isi; }
    public void setIsi(String isi) { this.isi = isi; }

    public LocalDateTime getTanggalDibuat() { return tanggalDibuat; }
    public void setTanggalDibuat(LocalDateTime tanggalDibuat) { this.tanggalDibuat = tanggalDibuat; }
}
