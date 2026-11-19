package com.sukabaca.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sukabaca.exception.ApiException;
import com.sukabaca.model.User;
import com.sukabaca.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

public final class TokenService {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final long TTL_SECONDS = 7L * 24 * 60 * 60;
    private static final byte[] SECRET_BYTES = initSecret();

    private TokenService() {}

    private static byte[] initSecret() {
        String configured = EnvLoader.get("AUTH_SECRET");
        if (configured != null && configured.length() >= 16) {
            return configured.getBytes(StandardCharsets.UTF_8);
        }
        byte[] random = new byte[32];
        new SecureRandom().nextBytes(random);
        return random;
    }

    public static String createToken(User user) {
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("uid", user.getId() != null ? user.getId() : 1L);
            payload.put("usr", user.getUsername());
            payload.put("role", user.getRole() != null ? user.getRole() : "user");
            payload.put("exp", Instant.now().getEpochSecond() + TTL_SECONDS);
            String payloadB64 = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(MAPPER.writeValueAsBytes(payload));
            String sigB64 = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(hmac(payloadB64.getBytes(StandardCharsets.UTF_8)));
            return payloadB64 + "." + sigB64;
        } catch (Exception e) {
            throw new IllegalStateException("Token generation failed", e);
        }
    }

    public static AuthClaims parseHeader(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        String token = header.substring(7).trim();
        return verify(token);
    }

    public static User requireUser(HttpServletRequest request, UserRepository userRepository) {
        AuthClaims claims = parseHeader(request);
        if (claims == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Silakan login terlebih dahulu");
        }
        return userRepository.findById(claims.userId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Sesi login tidak valid"));
    }

    public static Optional<User> optionalUser(HttpServletRequest request, UserRepository userRepository) {
        AuthClaims claims = parseHeader(request);
        if (claims == null) {
            return Optional.empty();
        }
        return userRepository.findById(claims.userId());
    }

    public static AuthClaims verify(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        String[] parts = token.split("\\.");
        if (parts.length != 2) {
            return null;
        }
        try {
            byte[] expectedSig = hmac(parts[0].getBytes(StandardCharsets.UTF_8));
            byte[] actualSig = Base64.getUrlDecoder().decode(parts[1]);
            if (!MessageDigest.isEqual(expectedSig, actualSig)) {
                return null;
            }
            byte[] jsonBytes = Base64.getUrlDecoder().decode(parts[0]);
            Map<String, Object> payload = MAPPER.readValue(jsonBytes, new TypeReference<>() {});
            long exp = Long.parseLong(String.valueOf(payload.get("exp")));
            if (Instant.now().getEpochSecond() > exp) {
                return null;
            }
            long uid = Long.parseLong(String.valueOf(payload.get("uid")));
            String usr = String.valueOf(payload.get("usr"));
            String role = String.valueOf(payload.getOrDefault("role", "user"));
            return new AuthClaims(uid, usr, role);
        } catch (Exception e) {
            return null;
        }
    }

    private static byte[] hmac(byte[] data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET_BYTES, "HmacSHA256"));
        return mac.doFinal(data);
    }

    public record AuthClaims(Long userId, String username, String role) {
        public boolean isAdmin() {
            return "admin".equalsIgnoreCase(role);
        }
    }
}
