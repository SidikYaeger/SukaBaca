package com.sukabaca.controller;

import com.sukabaca.exception.ApiException;
import com.sukabaca.model.Subscription;
import com.sukabaca.model.User;
import com.sukabaca.repository.SubscriptionRepository;
import com.sukabaca.repository.UserRepository;
import com.sukabaca.security.PasswordHasher;
import com.sukabaca.security.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]{3,50}$");

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;

    public AuthController(UserRepository userRepository) {
        this(userRepository, null);
    }

    @Autowired
    public AuthController(UserRepository userRepository, SubscriptionRepository subscriptionRepository) {
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request != null && request.get("username") != null
                ? request.get("username").trim()
                : "";
        String password = request != null ? request.get("password") : null;

        if (username.isEmpty() || password == null || password.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Username dan password wajib diisi"));
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent() && PasswordHasher.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.ok(buildAuthResponse(userOpt.get(), "Login successful"));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Username atau password salah"));
    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        try {
            long totalUsers = userRepository.count();
            return ResponseEntity.ok(Map.of(
                    "status", "UP",
                    "database", "CONNECTED",
                    "totalUsers", totalUsers
            ));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of(
                    "status", "DOWN",
                    "database", "DISCONNECTED",
                    "error", "Database unavailable"
            ));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        User user = TokenService.requireUser(request, userRepository);
        return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "username", user.getUsername(),
                "name", user.getName() != null ? user.getName() : user.getUsername(),
                "role", user.getRole() != null ? user.getRole() : "user"
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        if (request == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Body permintaan wajib diisi");
        }
        String rawUsername = request.get("username");
        String password = request.get("password");
        String rawName = request.get("name");

        if (rawUsername == null || !USERNAME_PATTERN.matcher(rawUsername.trim()).matches()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Username harus 3–50 karakter dan hanya huruf, angka, titik, garis bawah, atau tanda hubung"
            ));
        }
        if (password == null || password.length() < 5 || password.length() > 100) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Password harus terdiri dari 5–100 karakter"
            ));
        }

        String username = rawUsername.trim();
        String name = (rawName != null && !rawName.isBlank()) ? rawName.trim() : username;
        if (name.length() > 100) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Nama maksimal 100 karakter"
            ));
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username sudah digunakan"));
        }

        String hashed = PasswordHasher.hash(password);
        User newUser = userRepository.save(new User(username, hashed, name, "user"));

        if (subscriptionRepository != null && newUser.getId() != null) {
            subscriptionRepository.save(
                    new Subscription(newUser, "active", "free", LocalDateTime.now().plusMonths(1), 10)
            );
        }

        return ResponseEntity.ok(buildAuthResponse(newUser, "User registered successfully"));
    }

    private Map<String, Object> buildAuthResponse(User user, String message) {
        String token = TokenService.createToken(user);
        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("status", "success");
        responseData.put("userId", user.getId() != null ? user.getId() : 1L);
        responseData.put("username", user.getUsername());
        responseData.put("name", user.getName() != null ? user.getName() : user.getUsername());
        responseData.put("role", user.getRole() != null ? user.getRole() : "user");
        responseData.put("token", token);
        responseData.put("message", message);
        return responseData;
    }
}
