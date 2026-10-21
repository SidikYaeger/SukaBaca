package com.sukabaca.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "journals")
public class Journal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String title;

    private String author;

    @Column(length = 2000)
    private String snippet;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String content;

    private String publishDate;

    @Column(name = "download", nullable = false)
    private Long download = 0L;

    @Column(name = "views", nullable = false)
    private Long views = 0L;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Journal() {}

    public Journal(String title, String author, String snippet, String content, String publishDate) {
        this.title = title;
        this.author = author;
        this.snippet = snippet;
        this.content = content;
        this.publishDate = publishDate;
    }

    public Journal(User user, String title, String author, String snippet, String content, String publishDate) {
        this.user = user;
        this.title = title;
        this.author = author;
        this.snippet = snippet;
        this.content = content;
        this.publishDate = publishDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getSnippet() { return snippet; }
    public void setSnippet(String snippet) { this.snippet = snippet; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getPublishDate() { return publishDate; }
    public void setPublishDate(String publishDate) { this.publishDate = publishDate; }

    public Long getDownload() { return download; }
    public void setDownload(Long download) { this.download = download != null ? download : 0L; }

    public Long getViews() { return views; }
    public void setViews(Long views) { this.views = views != null ? views : 0L; }

    public void incrementDownload() {
        this.download = (this.download == null ? 0L : this.download) + 1;
    }

    public void incrementViews() {
        this.views = (this.views == null ? 0L : this.views) + 1;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
