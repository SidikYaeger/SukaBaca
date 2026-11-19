package com.sukabaca.controller;

import com.sukabaca.exception.ApiException;
import com.sukabaca.model.Journal;
import com.sukabaca.model.Review;
import com.sukabaca.model.User;
import com.sukabaca.repository.JournalRepository;
import com.sukabaca.repository.ReviewRepository;
import com.sukabaca.repository.UserRepository;
import com.sukabaca.security.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final JournalRepository journalRepository;
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository,
                            JournalRepository journalRepository,
                            UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.journalRepository = journalRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/journal/{journalId}")
    public ResponseEntity<?> getReviewsByJournal(@PathVariable Long journalId) {
        List<Review> reviews = reviewRepository.findByJournalId(journalId);
        Double avgRating = Review.hitungRataRataRating(reviews);
        return ResponseEntity.ok(Map.of(
                "journalId", journalId,
                "totalReviews", reviews.size(),
                "averageRating", avgRating,
                "reviews", reviews
        ));
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> requestBody,
                                          HttpServletRequest request) {
        User user = TokenService.requireUser(request, userRepository);
        if (requestBody == null || !requestBody.containsKey("journalId") || !requestBody.containsKey("rating")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "journalId dan rating wajib diisi");
        }

        long journalId;
        int rating;
        try {
            journalId = Long.parseLong(String.valueOf(requestBody.get("journalId")));
            rating = Integer.parseInt(String.valueOf(requestBody.get("rating")));
        } catch (NumberFormatException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Format journalId atau rating harus berupa angka");
        }

        if (rating < 1 || rating > 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rating harus antara 1 sampai 5 bintang");
        }

        String komentar = requestBody.containsKey("komentar") && requestBody.get("komentar") != null
                ? String.valueOf(requestBody.get("komentar")).trim()
                : "";
        if (komentar.length() < 3 || komentar.length() > 2000) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Komentar harus terdiri dari 3–2000 karakter");
        }

        Journal journal = journalRepository.findById(journalId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Jurnal tidak ditemukan"));

        Review review = new Review(user, journal, rating, komentar);
        reviewRepository.save(review);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Ulasan berhasil disimpan",
                "reviewId", review.getReviewId()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id, HttpServletRequest request) {
        User actor = TokenService.requireUser(request, userRepository);
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ulasan tidak ditemukan"));

        boolean isOwner = review.getUser() != null && review.getUser().getId().equals(actor.getId());
        boolean isAdmin = "admin".equalsIgnoreCase(actor.getRole());
        if (!isOwner && !isAdmin) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Anda hanya dapat menghapus ulasan Anda sendiri");
        }

        review.hapusReview();
        reviewRepository.delete(review);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Ulasan berhasil dihapus"));
    }
}
