package com.sukabaca.controller;

import com.sukabaca.model.User;
import com.sukabaca.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and password required"));
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            User user = userOpt.get();
            Map<String, Object> responseData = new LinkedHashMap<>();
            responseData.put("status", "success");
            responseData.put("userId", user.getId() != null ? user.getId() : 1L);
            responseData.put("username", username);
            responseData.put("name", user.getName() != null ? user.getName() : username);
            responseData.put("role", user.getRole() != null ? user.getRole() : "user");
            responseData.put("message", "Login successful");
            return ResponseEntity.ok(responseData);
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
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
                    "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String name = request.containsKey("name") && request.get("name") != null && !request.get("name").isBlank()
                ? request.get("name").trim()
                : (username != null ? username.trim() : "");
        String role = request.getOrDefault("role", "user");

        if (username == null || password == null || username.trim().isEmpty() || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and password are required"));
        }

        username = username.trim();
        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }

        User newUser = new User(username, password, name, role);
        userRepository.save(newUser);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "User registered successfully"
        ));
    }
}
