package com.sukabaca.controller;

import com.sukabaca.model.Subscription;
import com.sukabaca.model.User;
import com.sukabaca.repository.SubscriptionRepository;
import com.sukabaca.repository.UserRepository;
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
    public ResponseEntity<?> getSubscriptionByUserId(@PathVariable Long userId) {
        Optional<Subscription> subOpt = subscriptionRepository.findByUserId(userId);
        if (subOpt.isPresent()) {
            return ResponseEntity.ok(subOpt.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> request) {
        if (!request.containsKey("userId")) {
            return ResponseEntity.badRequest().body(Map.of("message", "userId is required"));
        }

        Long userId = Long.valueOf(request.get("userId").toString());
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        String plan = request.containsKey("plan") ? request.get("plan").toString().toLowerCase() : "pro";
        int usage = "pro".equalsIgnoreCase(plan) ? -1 : (request.containsKey("usage") ? Integer.parseInt(request.get("usage").toString()) : 10);

        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElse(new Subscription(user, "active", plan, LocalDateTime.now().plusMonths(1), usage));

        subscription.setStatus("active");
        subscription.setPlan(plan);
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
    public ResponseEntity<?> cancelSubscription(@PathVariable Long id) {
        return subscriptionRepository.findById(id).map(sub -> {
            sub.cancelSubscription();
            subscriptionRepository.save(sub);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Subscription canceled successfully",
                    "subscriptionId", sub.getSubscriptionId()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/use-ai")
    public ResponseEntity<?> useAiQuota(@PathVariable Long id) {
        return subscriptionRepository.findById(id).map(sub -> {
            boolean success = sub.decrementUsage();
            if (success) {
                subscriptionRepository.save(sub);
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "remainingUsage", sub.getUsage()
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "status", "error",
                        "message", "AI usage quota exhausted. Please upgrade your subscription."
                ));
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
