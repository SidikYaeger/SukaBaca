package com.sukabaca.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    private String name;

    @Column(nullable = false)
    private String role = "user"; // "admin" or "user"

    @Column(name = "user_tier", length = 50)
    private String userTier = "free"; // "free" or "pro"

    @Column(name = "subscription_status", length = 50)
    private String subscriptionStatus = "active";

    @Column(name = "daily_summary_count")
    private Integer dailySummaryCount = 0;

    @Column(name = "last_usage_date")
    private LocalDateTime lastUsageDate;

    public User() {}

    public User(String username, String password, String name) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.role = "user";
    }

    public User(String username, String password, String name, String role) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.role = role != null ? role.toLowerCase() : "user";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role != null ? role.toLowerCase() : "user"; }

    public String getUserTier() { return userTier; }
    public void setUserTier(String userTier) { this.userTier = userTier; }

    public String getSubscriptionStatus() { return subscriptionStatus; }
    public void setSubscriptionStatus(String subscriptionStatus) { this.subscriptionStatus = subscriptionStatus; }

    public Integer getDailySummaryCount() { return dailySummaryCount; }
    public void setDailySummaryCount(Integer dailySummaryCount) { this.dailySummaryCount = dailySummaryCount; }

    public LocalDateTime getLastUsageDate() { return lastUsageDate; }
    public void setLastUsageDate(LocalDateTime lastUsageDate) { this.lastUsageDate = lastUsageDate; }

    // --- Skeleton Methods from UML Diagram ---

    private void registrasi() {
        // Skeleton logic for user registration processing
    }

    private void masuk() {
        // Skeleton logic for user authentication / login
    }

    private void keluar() {
        // Skeleton logic for user logout / session termination
    }

    public boolean checkQuota() {
        // Unlimited for pro users; max 10 summaries per day for free users
        if ("pro".equalsIgnoreCase(this.userTier)) {
            return true;
        }
        return this.dailySummaryCount == null || this.dailySummaryCount < 10;
    }

    public void incrementUsage() {
        if (this.dailySummaryCount == null) {
            this.dailySummaryCount = 0;
        }
        this.dailySummaryCount++;
        this.lastUsageDate = LocalDateTime.now();
    }
}
