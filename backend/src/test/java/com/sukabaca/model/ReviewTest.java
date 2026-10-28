package com.sukabaca.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pengujian Unit IMPAL - Review Model & Rating")
class ReviewTest {

    @Test
    @DisplayName("Uji Pembatasan Rating Maksimal 5 Bintang dan Minimal 1")
    void testRatingClamping() {
        Review revOver = new Review(null, null, 10, "Terlalu tinggi");
        assertEquals(5, revOver.getRating(), "Rating lebih dari 5 harus dipotong ke 5");

        Review revUnder = new Review(null, null, -2, "Terlalu rendah");
        assertEquals(1, revUnder.getRating(), "Rating kurang dari 1 harus diangkat ke 1");
    }

    @Test
    @DisplayName("Uji Perhitungan Rata-Rata Rating (Equivalence Partitioning)")
    void testHitungRataRataRating() {
        List<Review> reviews = new ArrayList<>();
        reviews.add(new Review(null, null, 5, "Bagus"));
        reviews.add(new Review(null, null, 4, "Lumayan"));
        reviews.add(new Review(null, null, 3, "Biasa"));

        // (5 + 4 + 3) / 3 = 4.0
        Double avg = Review.hitungRataRataRating(reviews);
        assertEquals(4.0, avg);
    }

    @Test
    @DisplayName("Uji Perhitungan Rata-Rata Pada Daftar Kosong atau Null (Boundary)")
    void testHitungRataRataEmptyOrNull() {
        assertEquals(0.0, Review.hitungRataRataRating(null));
        assertEquals(0.0, Review.hitungRataRataRating(new ArrayList<>()));
    }

    @Test
    @DisplayName("Uji Edit dan Hapus Review")
    void testEditDanHapusReview() {
        Review rev = new Review(null, null, 3, "Awalnya biasa saja");
        rev.editReview(5, "Ternyata sangat bermanfaat setelah dibaca ulang");

        assertEquals(5, rev.getRating());
        assertEquals("Ternyata sangat bermanfaat setelah dibaca ulang", rev.getKomentar());

        rev.hapusReview();
        assertNull(rev.getRating());
        assertNull(rev.getKomentar());
    }
}
