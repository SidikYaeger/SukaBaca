package com.sukabaca.controller;

import com.sukabaca.exception.ApiException;
import com.sukabaca.model.Subscription;
import com.sukabaca.model.User;
import com.sukabaca.repository.SubscriptionRepository;
import com.sukabaca.repository.UserRepository;
import com.sukabaca.security.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionController(SubscriptionRepository subscriptionRepository,
                                  UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getSubscriptionByUserId(@PathVariable Long userId, HttpServletRequest request) {
        User actor = TokenService.requireUser(request, userRepository);
        if (!actor.getId().equals(userId) && !"admin".equalsIgnoreCase(actor.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Tidak diizinkan melihat langganan pengguna lain");
        }
        Optional<Subscription> subOpt = subscriptionRepository.findByUserId(userId);
        if (subOpt.isPresent()) {
            Subscription sub = subOpt.get();
            if (sub.refreshDailyQuotaIfNeeded()) {
                subscriptionRepository.save(sub);
            }
            return ResponseEntity.ok(sub);
        }
        Subscription newSub = new Subscription(actor, "active", "free", LocalDateTime.now().plusMonths(1), 10);
        subscriptionRepository.save(newSub);
        return ResponseEntity.ok(newSub);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> createCheckoutSession(@RequestBody(required = false) Map<String, Object> requestBody,
                                                   HttpServletRequest request) {
        User user = TokenService.requireUser(request, userRepository);
        String requestedPlan = requestBody != null && requestBody.containsKey("plan")
                ? String.valueOf(requestBody.get("plan")).trim().toLowerCase()
                : "pro";
        if (!"pro".equals(requestedPlan) && !"free".equals(requestedPlan)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Paket langganan harus 'free' atau 'pro'");
        }

        int usage = "pro".equals(requestedPlan) ? -1 : 10;
        Subscription subscription = subscriptionRepository.findByUserId(user.getId())
                .orElse(new Subscription(user, "active", requestedPlan, LocalDateTime.now().plusMonths(1), usage));

        subscription.setStatus("active");
        subscription.setPlan(requestedPlan);
        subscription.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
        subscription.setUsage(usage);

        subscription.createCheckoutSession();
        subscriptionRepository.save(subscription);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Subscription checkout session processed successfully",
                "subscriptionId", subscription.getSubscriptionId(),
                "plan", subscription.getPlan(),
                "remainingUsage", subscription.getUsage(),
                "currentPeriodEnd", subscription.getCurrentPeriodEnd().toString()
        ));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelSubscription(@PathVariable Long id, HttpServletRequest request) {
        User actor = TokenService.requireUser(request, userRepository);
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Langganan tidak ditemukan"));
        if (!sub.getUser().getId().equals(actor.getId()) && !"admin".equalsIgnoreCase(actor.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Tidak diizinkan membatalkan langganan ini");
        }
        sub.cancelSubscription();
        subscriptionRepository.save(sub);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Langganan Pro dibatalkan. Akun kembali ke paket Free (10 kuota/hari).",
                "subscriptionId", sub.getSubscriptionId(),
                "plan", sub.getPlan(),
                "remainingUsage", sub.getUsage()
        ));
    }

    @PostMapping("/{id}/use-ai")
    public ResponseEntity<?> useAiQuota(@PathVariable Long id, HttpServletRequest request) {
        User actor = TokenService.requireUser(request, userRepository);
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Langganan tidak ditemukan"));
        if (!sub.getUser().getId().equals(actor.getId()) && !"admin".equalsIgnoreCase(actor.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Akses kuota ditolak");
        }
        if (sub.decrementUsage()) {
            subscriptionRepository.save(sub);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "remainingUsage", sub.getUsage()
            ));
        }
        return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Kuota harian AI telah habis. Silakan upgrade ke paket Pro."
        ));
    }

    @PostMapping("/user/{userId}/use-ai")
    public ResponseEntity<?> useAiQuotaByUser(@PathVariable Long userId, HttpServletRequest request) {
        User actor = TokenService.requireUser(request, userRepository);
        if (!actor.getId().equals(userId) && !"admin".equalsIgnoreCase(actor.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Akses kuota ditolak");
        }
        Subscription sub = subscriptionRepository.findByUserId(userId)
                .orElseGet(() -> new Subscription(actor, "active", "free", LocalDateTime.now().plusMonths(1), 10));
        if (sub.decrementUsage()) {
            subscriptionRepository.save(sub);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "remainingUsage", sub.getUsage()
            ));
        }
        return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Kuota harian AI telah habis. Silakan upgrade ke paket Pro."
        ));
    }
}
