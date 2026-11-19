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
    private String category;
    private String sortBy = "views";
    private String sortOrder = "DESC";
    private Long minViews = 0L;
    private Long minDownload = 0L;
    private Integer minYear;
    private Integer maxYear;
    private Boolean hasAbstract;
    private Boolean hasFile;

    public SmartSearch() {}

    public SmartSearch(String keyword, String penulis, String tahunTerbit, String formatFile, String sortBy, String sortOrder) {
        this.keyword = keyword;
        this.penulis = penulis;
        this.tahunTerbit = tahunTerbit;
        this.formatFile = formatFile;
        this.sortBy = sortBy != null ? sortBy : "views";
        this.sortOrder = sortOrder != null ? sortOrder : "DESC";
    }

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

    public List<Journal> sortByDate(List<Journal> daftarJurnal, boolean ascending) {
        if (daftarJurnal == null) return new ArrayList<>();
        Comparator<Journal> comparator = Comparator
                .comparing((Journal j) -> parseYear(j.getPublishDate()))
                .thenComparing(j -> j.getCreatedAt() != null ? j.getCreatedAt().toString() : "");
        return daftarJurnal.stream()
                .sorted(ascending ? comparator : comparator.reversed())
                .collect(Collectors.toList());
    }

    private static int parseYear(String publishDate) {
        if (publishDate == null || publishDate.isBlank()) {
            return 0;
        }
        try {
            return Integer.parseInt(publishDate.trim().substring(0, Math.min(4, publishDate.trim().length())));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    public List<Journal> applyFilterAndSort(List<Journal> daftarJurnal) {
        if (daftarJurnal == null) return new ArrayList<>();
        List<Journal> result = new ArrayList<>(daftarJurnal);

        if (this.keyword != null && !this.keyword.trim().isEmpty()) {
            String kw = this.keyword.toLowerCase();
            result = result.stream()
                    .filter(j -> (j.getTitle() != null && j.getTitle().toLowerCase().contains(kw)) ||
                                 (j.getAuthor() != null && j.getAuthor().toLowerCase().contains(kw)) ||
                                 (j.getCategory() != null && j.getCategory().toLowerCase().contains(kw)) ||
                                 (j.getSnippet() != null && j.getSnippet().toLowerCase().contains(kw)))
                    .collect(Collectors.toList());
        }

        if (this.penulis != null && !this.penulis.trim().isEmpty()) {
            result = filterByPenulis(result, this.penulis);
        }
        if (this.tahunTerbit != null && !this.tahunTerbit.trim().isEmpty()) {
            result = filterByTahun(result, this.tahunTerbit);
        }
        if (this.formatFile != null && !this.formatFile.trim().isEmpty()) {
            result = filterByFormat(result, this.formatFile);
        }
        if (this.category != null && !this.category.trim().isEmpty()) {
            String cat = this.category.trim().toLowerCase();
            result = result.stream()
                    .filter(j -> j.getCategory() != null && j.getCategory().toLowerCase().contains(cat))
                    .collect(Collectors.toList());
        }
        if (this.minYear != null) {
            result = result.stream()
                    .filter(j -> parseYear(j.getPublishDate()) >= this.minYear)
                    .collect(Collectors.toList());
        }
        if (this.maxYear != null) {
            result = result.stream()
                    .filter(j -> parseYear(j.getPublishDate()) <= this.maxYear)
                    .collect(Collectors.toList());
        }
        if (Boolean.TRUE.equals(this.hasAbstract)) {
            result = result.stream()
                    .filter(j -> (j.getAbstractText() != null && !j.getAbstractText().isBlank())
                            || (j.getContent() != null && !j.getContent().isBlank()))
                    .collect(Collectors.toList());
        }
        if (Boolean.TRUE.equals(this.hasFile)) {
            result = result.stream()
                    .filter(j -> j.getFileName() != null && !j.getFileName().isBlank())
                    .collect(Collectors.toList());
        }
        if (this.minViews != null && this.minViews > 0) {
            result = result.stream()
                    .filter(j -> j.viewCount() >= this.minViews)
                    .collect(Collectors.toList());
        }
        if (this.minDownload != null && this.minDownload > 0) {
            result = result.stream()
                    .filter(j -> j.downloadCount() >= this.minDownload)
                    .collect(Collectors.toList());
        }

        boolean asc = "ASC".equalsIgnoreCase(this.sortOrder);
        if ("download".equalsIgnoreCase(this.sortBy)) {
            result = sortByDownloads(result, asc);
        } else if ("title".equalsIgnoreCase(this.sortBy)) {
            result = sortByTitle(result, asc);
        } else if ("date".equalsIgnoreCase(this.sortBy) || "recent".equalsIgnoreCase(this.sortBy)) {
            result = sortByDate(result, asc);
        } else {
            result = sortByViews(result, asc);
        }

        return result;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getMinYear() { return minYear; }
    public void setMinYear(Integer minYear) { this.minYear = minYear; }

    public Integer getMaxYear() { return maxYear; }
    public void setMaxYear(Integer maxYear) { this.maxYear = maxYear; }

    public Boolean getHasAbstract() { return hasAbstract; }
    public void setHasAbstract(Boolean hasAbstract) { this.hasAbstract = hasAbstract; }

    public Boolean getHasFile() { return hasFile; }
    public void setHasFile(Boolean hasFile) { this.hasFile = hasFile; }

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
