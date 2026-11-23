package com.sukabaca.controller;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.sukabaca.exception.ApiException;
import com.sukabaca.model.Subscription;
import com.sukabaca.model.User;
import com.sukabaca.repository.SubscriptionRepository;
import com.sukabaca.repository.UserRepository;
import com.sukabaca.security.EnvLoader;
import com.sukabaca.security.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private static final String DEFAULT_STRIPE_PRICE_PRO = "price_1UesMDCtu6Uo3JBpGgqbA8Wx";
    private static final String DEFAULT_FRONTEND_URL = "http://localhost:5173";
    private static final int FREE_DAILY_QUOTA = 10;

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionController(SubscriptionRepository subscriptionRepository,
                                  UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentSubscription(HttpServletRequest request) {
        User actor = TokenService.requireUser(request, userRepository);
        Subscription sub = getOrCreateSubscription(actor);
        return ResponseEntity.ok(toSubscriptionDto(sub));
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
        Subscription newSub = new Subscription(actor, "active", "free", LocalDateTime.now().plusMonths(1), FREE_DAILY_QUOTA);
        subscriptionRepository.save(newSub);
        return ResponseEntity.ok(newSub);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> createCheckoutSession(@RequestBody(required = false) Map<String, Object> requestBody,
                                                   HttpServletRequest request) {
        User user = TokenService.requireUser(request, userRepository);
        String rawPlan = requestBody != null && requestBody.containsKey("plan")
                ? String.valueOf(requestBody.get("plan")).trim().toLowerCase()
                : "pro";
        String requestedPlan = rawPlan.contains("pro") ? "pro" : rawPlan;
        if (!"pro".equals(requestedPlan) && !"free".equals(requestedPlan)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Paket langganan harus 'free' atau 'pro'");
        }

        if ("free".equals(requestedPlan)) {
            Subscription subscription = getOrCreateSubscription(user);
            cancelRemoteStripeSubscriptionIfPresent(subscription);
            subscription.cancelSubscription();
            subscription.setStripeSubscriptionId(null);
            subscriptionRepository.save(subscription);
            return ResponseEntity.ok(toSubscriptionDto(subscription));
        }

        String secretKey = requireStripeSecretKey();
        String priceId = EnvLoader.get("STRIPE_PRICE_PRO");
        if (priceId == null || priceId.isBlank()) {
            priceId = DEFAULT_STRIPE_PRICE_PRO;
        }
        String frontendUrl = resolveFrontendUrl();

        Stripe.apiKey = secretKey;
        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setSuccessUrl(frontendUrl + "/upload?checkout=success&session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/upload?checkout=cancel")
                    .setClientReferenceId(String.valueOf(user.getId()))
                    .putMetadata("userId", String.valueOf(user.getId()))
                    .putMetadata("username", user.getUsername())
                    .putMetadata("plan", "pro")
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPrice(priceId)
                                    .setQuantity(1L)
                                    .build()
                    )
                    .build();

            Session session = Session.create(params);
            Subscription subscription = getOrCreateSubscription(user);
            subscription.createCheckoutSession();

            Map<String, Object> out = new LinkedHashMap<>();
            out.put("status", "success");
            out.put("checkoutUrl", session.getUrl());
            out.put("sessionId", session.getId());
            return ResponseEntity.ok(out);
        } catch (StripeException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Gagal membuat sesi pembayaran Stripe: " + e.getMessage());
        }
    }

    @PostMapping("/checkout/confirm")
    public ResponseEntity<?> confirmCheckoutSession(@RequestBody(required = false) Map<String, Object> requestBody,
                                                    HttpServletRequest request) {
        User user = TokenService.requireUser(request, userRepository);
        String sessionId = requestBody != null && requestBody.get("sessionId") != null
                ? String.valueOf(requestBody.get("sessionId")).trim()
                : "";
        if (sessionId.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "sessionId wajib diisi");
        }

        Stripe.apiKey = requireStripeSecretKey();
        try {
            Session session = Session.retrieve(sessionId);
            String refUserId = session.getClientReferenceId();
            if (refUserId != null && !refUserId.equals(String.valueOf(user.getId())) && !"admin".equalsIgnoreCase(user.getRole())) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Sesi pembayaran tidak cocok dengan akun Anda");
            }
            boolean isPaid = "paid".equalsIgnoreCase(session.getPaymentStatus())
                    || "no_payment_required".equalsIgnoreCase(session.getPaymentStatus());
            boolean isComplete = "complete".equalsIgnoreCase(session.getStatus());
            if (!isPaid && !isComplete) {
                throw new ApiException(HttpStatus.PAYMENT_REQUIRED, "Pembayaran belum selesai di Stripe");
            }

            Subscription updated = activateProSubscription(user, session.getCustomer(), session.getSubscription());
            return ResponseEntity.ok(toSubscriptionDto(updated));
        } catch (StripeException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Gagal memverifikasi pembayaran Stripe: " + e.getMessage());
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handleStripeWebhook(@RequestBody String payload,
                                                 @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        String webhookSecret = EnvLoader.get("STRIPE_WEBHOOK_SECRET");
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "STRIPE_WEBHOOK_SECRET belum dikonfigurasi");
        }
        if (sigHeader == null || sigHeader.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Header Stripe-Signature tidak ditemukan");
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Signature webhook Stripe tidak valid");
        }

        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        Optional<StripeObject> objOpt = deserializer.getObject();

        if ("checkout.session.completed".equals(event.getType()) && objOpt.isPresent() && objOpt.get() instanceof Session session) {
            String userIdStr = session.getClientReferenceId();
            if ((userIdStr == null || userIdStr.isBlank()) && session.getMetadata() != null) {
                userIdStr = session.getMetadata().get("userId");
            }
            if (userIdStr != null && !userIdStr.isBlank()) {
                try {
                    Long uid = Long.parseLong(userIdStr);
                    userRepository.findById(uid).ifPresent(user -> {
                        Subscription sub = activateProSubscription(user, session.getCustomer(), session.getSubscription());
                        sub.handleWebhook();
                    });
                } catch (NumberFormatException ignored) {}
            }
        } else if ("customer.subscription.deleted".equals(event.getType())
                && objOpt.isPresent()
                && objOpt.get() instanceof com.stripe.model.Subscription stripeSub) {
            subscriptionRepository.findByStripeSubscriptionId(stripeSub.getId()).ifPresent(sub -> {
                sub.cancelSubscription();
                sub.setStripeSubscriptionId(null);
                sub.handleWebhook();
                subscriptionRepository.save(sub);
            });
        }

        return ResponseEntity.ok(Map.of("received", true));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelSubscription(@PathVariable Long id, HttpServletRequest request) {
        User actor = TokenService.requireUser(request, userRepository);
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Langganan tidak ditemukan"));
        if (!sub.getUser().getId().equals(actor.getId()) && !"admin".equalsIgnoreCase(actor.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Tidak diizinkan membatalkan langganan ini");
        }

        cancelRemoteStripeSubscriptionIfPresent(sub);
        sub.cancelSubscription();
        sub.setStripeSubscriptionId(null);
        subscriptionRepository.save(sub);

        Map<String, Object> dto = toSubscriptionDto(sub);
        dto.put("statusMessage", "Langganan Pro dibatalkan. Akun kembali ke paket Free.");
        return ResponseEntity.ok(dto);
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
        Subscription sub = getOrCreateSubscription(actor);
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

    private Subscription getOrCreateSubscription(User user) {
        Optional<Subscription> subOpt = subscriptionRepository.findByUserId(user.getId());
        if (subOpt.isPresent()) {
            Subscription sub = subOpt.get();
            if (sub.refreshDailyQuotaIfNeeded()) {
                subscriptionRepository.save(sub);
            }
            return sub;
        }
        Subscription created = new Subscription(user, "active", "free", LocalDateTime.now().plusMonths(1), FREE_DAILY_QUOTA);
        return subscriptionRepository.save(created);
    }

    private Subscription activateProSubscription(User user, String stripeCustomerId, String stripeSubscriptionId) {
        Subscription subscription = subscriptionRepository.findByUserId(user.getId())
                .orElse(new Subscription(user, "active", "pro", LocalDateTime.now().plusMonths(1), -1));
        subscription.setStatus("active");
        subscription.setPlan("pro");
        subscription.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
        subscription.setUsage(-1);
        if (stripeCustomerId != null && !stripeCustomerId.isBlank()) {
            subscription.setStripeCustomerId(stripeCustomerId);
        }
        if (stripeSubscriptionId != null && !stripeSubscriptionId.isBlank()) {
            subscription.setStripeSubscriptionId(stripeSubscriptionId);
        }
        return subscriptionRepository.save(subscription);
    }

    private void cancelRemoteStripeSubscriptionIfPresent(Subscription sub) {
        String stripeSubId = sub.getStripeSubscriptionId();
        String secretKey = EnvLoader.get("STRIPE_SECRET_KEY");
        if (stripeSubId == null || stripeSubId.isBlank() || secretKey == null || secretKey.isBlank()) {
            return;
        }
        Stripe.apiKey = secretKey;
        try {
            com.stripe.model.Subscription remote = com.stripe.model.Subscription.retrieve(stripeSubId);
            if (!"canceled".equalsIgnoreCase(remote.getStatus())) {
                remote.cancel();
            }
        } catch (StripeException ignored) {
            // If already canceled or missing in sandbox, still proceed with local downgrade
        }
    }

    private String requireStripeSecretKey() {
        String secretKey = EnvLoader.get("STRIPE_SECRET_KEY");
        if (secretKey == null || secretKey.isBlank()) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "STRIPE_SECRET_KEY belum diatur. Tambahkan STRIPE_SECRET_KEY=sk_test_... di file .env lalu restart backend."
            );
        }
        return secretKey;
    }

    private String resolveFrontendUrl() {
        String configured = EnvLoader.get("FRONTEND_URL");
        if (configured != null && !configured.isBlank()) {
            return configured.endsWith("/") ? configured.substring(0, configured.length() - 1) : configured;
        }
        return DEFAULT_FRONTEND_URL;
    }

    private Map<String, Object> toSubscriptionDto(Subscription sub) {
        boolean proActive = sub.isProActive();
        int remaining = proActive ? 9999 : Math.max(0, sub.getUsage() != null ? sub.getUsage() : FREE_DAILY_QUOTA);
        int dailyQuota = proActive ? 9999 : FREE_DAILY_QUOTA;
        int usedToday = proActive ? 0 : Math.max(0, FREE_DAILY_QUOTA - remaining);

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", sub.getSubscriptionId());
        dto.put("subscriptionId", sub.getSubscriptionId());
        dto.put("plan", proActive ? "Ultra Academic Pro" : "Free Access");
        dto.put("rawPlan", proActive ? "pro" : "free");
        dto.put("status", sub.getStatus());
        dto.put("dailyQuota", dailyQuota);
        dto.put("usedToday", usedToday);
        dto.put("remainingUsage", proActive ? -1 : remaining);
        dto.put("periodEnd", sub.getCurrentPeriodEnd() != null ? sub.getCurrentPeriodEnd().toString() : null);
        return dto;
    }
}
