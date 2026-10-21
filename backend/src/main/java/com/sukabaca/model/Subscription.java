package com.sukabaca.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subscription_id")
    private Long subscriptionId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User user;

    @Column(nullable = false)
    private String status = "active";

    @Column(name = "plan", length = 50)
    private String plan = "free"; // "free" ($0/mo, 10 limit) or "pro" ($10/mo, unlimited)

    @Column(name = "current_period_end")
    private LocalDateTime currentPeriodEnd;

    @Column(name = "`usage`")
    private Integer usage = 10; // AI usages quota left (-1 for unlimited)

    public Subscription() {}

    public Subscription(User user, String status, String plan, LocalDateTime currentPeriodEnd, Integer usage) {
        this.user = user;
        this.status = status != null ? status : "active";
        this.plan = plan != null ? plan : "free";
        this.currentPeriodEnd = currentPeriodEnd;
        this.usage = usage != null ? usage : ("pro".equalsIgnoreCase(plan) ? -1 : 10);
    }

    public Subscription(User user, String status, LocalDateTime currentPeriodEnd, Integer usage) {
        this(user, status, "free", currentPeriodEnd, usage);
    }

    // Business & Domain methods matching UML specification
    public void createCheckoutSession() {
        // Prepares payment checkout session (e.g. Stripe/Midtrans)
    }

    public void handleWebhook() {
        // Processes payment confirmation webhooks
    }

    public void cancelSubscription() {
        this.status = "canceled";
    }

    public boolean decrementUsage() {
        if ("pro".equalsIgnoreCase(this.plan) || (this.usage != null && this.usage < 0)) {
            return true; // Unlimited quota for pro
        }
        if (this.usage != null && this.usage > 0) {
            this.usage--;
            return true;
        }
        return false;
    }

    // Getters and Setters
    public Long getSubscriptionId() {
        return subscriptionId;
    }

    public void setSubscriptionId(Long subscriptionId) {
        this.subscriptionId = subscriptionId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }

    public LocalDateTime getCurrentPeriodEnd() {
        return currentPeriodEnd;
    }

    public void setCurrentPeriodEnd(LocalDateTime currentPeriodEnd) {
        this.currentPeriodEnd = currentPeriodEnd;
    }

    public Integer getUsage() {
        return usage;
    }

    public void setUsage(Integer usage) {
        this.usage = usage;
    }
}
