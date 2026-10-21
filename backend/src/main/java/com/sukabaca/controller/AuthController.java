package com.sukabaca.controller;

import com.sukabaca.model.User;
import com.sukabaca.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "userId", user.getId(),
                    "username", username,
                    "name", user.getName() != null ? user.getName() : username,
                    "role", user.getRole(),
                    "message", "Login successful"
            ));
        }

        // Demo fallback for mockup credentials (Glen / Besar123)
        if ("Glen".equalsIgnoreCase(username) && "Besar123".equals(password)) {
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "username", "Glen",
                    "role", "user",
                    "message", "Demo user login successful"
            ));
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String role = request.getOrDefault("role", "user");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "All fields are required"));
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }

        User newUser = new User(username, password, username, role);
        userRepository.save(newUser);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "User registered successfully"
        ));
    }
}
