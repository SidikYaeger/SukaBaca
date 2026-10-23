package com.sukabaca.model;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class SmartSearch {

    private String keyword;
    private String penulis;
    private String tahunTerbit;
    private String formatFile;
    private String sortBy = "views"; // "views", "download", "date", "title"
    private String sortOrder = "DESC"; // "ASC" or "DESC"
    private Long minViews = 0L;
    private Long minDownload = 0L;

    public SmartSearch() {}

    public SmartSearch(String keyword, String penulis, String tahunTerbit, String formatFile, String sortBy, String sortOrder) {
        this.keyword = keyword;
        this.penulis = penulis;
        this.tahunTerbit = tahunTerbit;
        this.formatFile = formatFile;
        this.sortBy = sortBy != null ? sortBy : "views";
        this.sortOrder = sortOrder != null ? sortOrder : "DESC";
    }

    // --- Filter & Sort Methods ---

    public List<Journal> filterByPenulis(List<Journal> daftarJurnal, String author) {
        if (daftarJurnal == null || author == null || author.trim().isEmpty()) {
            return daftarJurnal != null ? daftarJurnal : new ArrayList<>();
        }
        return daftarJurnal.stream()
                .filter(j -> j.getAuthor() != null && j.getAuthor().toLowerCase().contains(author.toLowerCase()))
                .collect(Collectors.toList());
    }

    public List<Journal> filterByTahun(List<Journal> daftarJurnal, String year) {
        if (daftarJurnal == null || year == null || year.trim().isEmpty()) {
            return daftarJurnal != null ? daftarJurnal : new ArrayList<>();
        }
        return daftarJurnal.stream()
                .filter(j -> j.getPublishDate() != null && j.getPublishDate().contains(year))
                .collect(Collectors.toList());
    }

    public List<Journal> filterByFormat(List<Journal> daftarJurnal, String format) {
        if (daftarJurnal == null || format == null || format.trim().isEmpty()) {
            return daftarJurnal != null ? daftarJurnal : new ArrayList<>();
        }
        return daftarJurnal.stream()
                .filter(j -> j.getFormatFile() != null && j.getFormatFile().equalsIgnoreCase(format))
                .collect(Collectors.toList());
    }

    public List<Journal> sortByViews(List<Journal> daftarJurnal, boolean ascending) {
        if (daftarJurnal == null) return new ArrayList<>();
        Comparator<Journal> comparator = Comparator.comparing(Journal::viewCount);
        return daftarJurnal.stream()
                .sorted(ascending ? comparator : comparator.reversed())
                .collect(Collectors.toList());
    }

    public List<Journal> sortByDownloads(List<Journal> daftarJurnal, boolean ascending) {
        if (daftarJurnal == null) return new ArrayList<>();
        Comparator<Journal> comparator = Comparator.comparing(Journal::downloadCount);
        return daftarJurnal.stream()
                .sorted(ascending ? comparator : comparator.reversed())
                .collect(Collectors.toList());
    }

    public List<Journal> sortByTitle(List<Journal> daftarJurnal, boolean ascending) {
        if (daftarJurnal == null) return new ArrayList<>();
        Comparator<Journal> comparator = Comparator.comparing(j -> j.getTitle() != null ? j.getTitle().toLowerCase() : "");
        return daftarJurnal.stream()
                .sorted(ascending ? comparator : comparator.reversed())
                .collect(Collectors.toList());
    }

    public List<Journal> applyFilterAndSort(List<Journal> daftarJurnal) {
        if (daftarJurnal == null) return new ArrayList<>();
        List<Journal> result = new ArrayList<>(daftarJurnal);

        // Keyword search (title / snippet / author)
        if (this.keyword != null && !this.keyword.trim().isEmpty()) {
            String kw = this.keyword.toLowerCase();
            result = result.stream()
                    .filter(j -> (j.getTitle() != null && j.getTitle().toLowerCase().contains(kw)) ||
                                 (j.getAuthor() != null && j.getAuthor().toLowerCase().contains(kw)) ||
                                 (j.getSnippet() != null && j.getSnippet().toLowerCase().contains(kw)))
                    .collect(Collectors.toList());
        }

        // Apply filters
        if (this.penulis != null && !this.penulis.trim().isEmpty()) {
            result = filterByPenulis(result, this.penulis);
        }
        if (this.tahunTerbit != null && !this.tahunTerbit.trim().isEmpty()) {
            result = filterByTahun(result, this.tahunTerbit);
        }
        if (this.formatFile != null && !this.formatFile.trim().isEmpty()) {
            result = filterByFormat(result, this.formatFile);
        }

        // Apply sort
        boolean asc = "ASC".equalsIgnoreCase(this.sortOrder);
        if ("download".equalsIgnoreCase(this.sortBy)) {
            result = sortByDownloads(result, asc);
        } else if ("title".equalsIgnoreCase(this.sortBy)) {
            result = sortByTitle(result, asc);
        } else {
            result = sortByViews(result, asc);
        }

        return result;
    }

    // --- Getters & Setters ---

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }

    public String getPenulis() { return penulis; }
    public void setPenulis(String penulis) { this.penulis = penulis; }

    public String getTahunTerbit() { return tahunTerbit; }
    public void setTahunTerbit(String tahunTerbit) { this.tahunTerbit = tahunTerbit; }

    public String getFormatFile() { return formatFile; }
    public void setFormatFile(String formatFile) { this.formatFile = formatFile; }

    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }

    public String getSortOrder() { return sortOrder; }
    public void setSortOrder(String sortOrder) { this.sortOrder = sortOrder; }

    public Long getMinViews() { return minViews; }
    public void setMinViews(Long minViews) { this.minViews = minViews; }

    public Long getMinDownload() { return minDownload; }
    public void setMinDownload(Long minDownload) { this.minDownload = minDownload; }
}
