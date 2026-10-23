package com.sukabaca.controller;

import com.sukabaca.model.Journal;
import com.sukabaca.model.Review;
import com.sukabaca.model.User;
import com.sukabaca.repository.JournalRepository;
import com.sukabaca.repository.ReviewRepository;
import com.sukabaca.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> request) {
        if (!request.containsKey("userId") || !request.containsKey("journalId") || !request.containsKey("rating")) {
            return ResponseEntity.badRequest().body(Map.of("message", "userId, journalId, and rating are required"));
        }

        Long userId = Long.valueOf(request.get("userId").toString());
        Long journalId = Long.valueOf(request.get("journalId").toString());
        Integer rating = Integer.valueOf(request.get("rating").toString());
        String komentar = request.getOrDefault("komentar", "").toString();

        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Journal> journalOpt = journalRepository.findById(journalId);

        if (userOpt.isEmpty() || journalOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User or Journal not found"));
        }

        Review review = new Review(userOpt.get(), journalOpt.get(), rating, komentar);
        reviewRepository.save(review);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Review added successfully",
                "reviewId", review.getReviewId()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        return reviewRepository.findById(id).map(r -> {
            r.hapusReview();
            reviewRepository.delete(r);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Review deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
