package com.sukabaca.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long reviewId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "jurnal_id", nullable = false)
    @JsonIgnoreProperties({"content", "hibernateLazyInitializer", "handler"})
    private Journal journal;

    @Column(nullable = false)
    private Integer rating; // 1 to 5 stars

    @Column(columnDefinition = "TEXT")
    private String komentar;

    @Column(name = "tanggal_review")
    private LocalDateTime tanggalReview = LocalDateTime.now();

    public Review() {}

    public Review(User user, Journal journal, Integer rating, String komentar) {
        this.user = user;
        this.journal = journal;
        this.rating = rating != null ? Math.max(1, Math.min(5, rating)) : 5;
        this.komentar = komentar;
        this.tanggalReview = LocalDateTime.now();
    }

    // --- Domain / Skeleton Business Methods ---

    public void tambahReview(User user, Journal journal, Integer rating, String komentar) {
        this.user = user;
        this.journal = journal;
        this.rating = rating != null ? Math.max(1, Math.min(5, rating)) : 5;
        this.komentar = komentar;
        this.tanggalReview = LocalDateTime.now();
    }

    public void editReview(Integer newRating, String newKomentar) {
        if (newRating != null) {
            this.rating = Math.max(1, Math.min(5, newRating));
        }
        if (newKomentar != null) {
            this.komentar = newKomentar;
        }
        this.tanggalReview = LocalDateTime.now();
    }

    public void hapusReview() {
        this.komentar = null;
        this.rating = null;
    }

    public static Double hitungRataRataRating(List<Review> reviews) {
        if (reviews == null || reviews.isEmpty()) {
            return 0.0;
        }
        double total = reviews.stream()
                .filter(r -> r.getRating() != null)
                .mapToInt(Review::getRating)
                .sum();
        long count = reviews.stream().filter(r -> r.getRating() != null).count();
        return count == 0 ? 0.0 : Math.round((total / count) * 10.0) / 10.0;
    }

    // --- Getters & Setters ---

    public Long getReviewId() { return reviewId; }
    public void setReviewId(Long reviewId) { this.reviewId = reviewId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Journal getJournal() { return journal; }
    public void setJournal(Journal journal) { this.journal = journal; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getKomentar() { return komentar; }
    public void setKomentar(String komentar) { this.komentar = komentar; }

    public LocalDateTime getTanggalReview() { return tanggalReview; }
    public void setTanggalReview(LocalDateTime tanggalReview) { this.tanggalReview = tanggalReview; }
}
