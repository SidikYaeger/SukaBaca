package com.sukabaca.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pengujian Unit IMPAL - SmartSearch Model")
class SmartSearchTest {

    private List<Journal> sampleJournals;

    @BeforeEach
    void setUp() {
        sampleJournals = new ArrayList<>();

        Journal j1 = new Journal(null, "Fundamental to Sahrul", "Adira Pratama", "Snippet A", "Content A", "2025");
        j1.setFormatFile("PDF");
        j1.incrementViews(); // views = 1
        j1.incrementDownload(); // downloads = 1
        sampleJournals.add(j1);

        Journal j2 = new Journal(null, "Sustainable Architecture 2026", "Glen Ardianto", "Snippet B", "Content B", "2026");
        j2.setFormatFile("PDF");
        j2.incrementViews();
        j2.incrementViews(); // views = 2
        sampleJournals.add(j2);

        Journal j3 = new Journal(null, "Microservices dengan Spring Boot", "Siti Rahma", "Snippet C", "Content C", "2025");
        j3.setFormatFile("DOCX");
        sampleJournals.add(j3);
    }

    @Test
    @DisplayName("Uji Filter Berdasarkan Penulis")
    void testFilterByPenulis() {
        SmartSearch search = new SmartSearch();
        List<Journal> result = search.filterByPenulis(sampleJournals, "Glen");

        assertEquals(1, result.size());
        assertEquals("Glen Ardianto", result.get(0).getAuthor());
    }

    @Test
    @DisplayName("Uji Filter Berdasarkan Tahun Terbit")
    void testFilterByTahun() {
        SmartSearch search = new SmartSearch();
        List<Journal> result = search.filterByTahun(sampleJournals, "2025");

        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Uji Filter Berdasarkan Format File")
    void testFilterByFormat() {
        SmartSearch search = new SmartSearch();
        List<Journal> result = search.filterByFormat(sampleJournals, "DOCX");

        assertEquals(1, result.size());
        assertEquals("DOCX", result.get(0).getFormatFile());
    }

    @Test
    @DisplayName("Uji Pengurutan Berdasarkan Jumlah Views (Descending)")
    void testSortByViewsDescending() {
        SmartSearch search = new SmartSearch();
        List<Journal> result = search.sortByViews(sampleJournals, false);

        assertEquals(2L, result.get(0).viewCount());
        assertEquals("Sustainable Architecture 2026", result.get(0).getTitle());
    }

    @Test
    @DisplayName("Uji Pengurutan Berdasarkan Judul (Ascending A-Z)")
    void testSortByTitleAscending() {
        SmartSearch search = new SmartSearch();
        List<Journal> result = search.sortByTitle(sampleJournals, true);

        assertEquals("Fundamental to Sahrul", result.get(0).getTitle());
    }

    @Test
    @DisplayName("Uji Pencarian Lengkap dengan Keyword dan Filter Terpadu")
    void testApplyFilterAndSort() {
        SmartSearch criteria = new SmartSearch("Architecture", "Glen", "2026", "PDF", "views", "DESC");
        List<Journal> result = criteria.applyFilterAndSort(sampleJournals);

        assertEquals(1, result.size());
        assertEquals("Sustainable Architecture 2026", result.get(0).getTitle());
    }
}
