package com.sukabaca.controller;

import com.sukabaca.model.User;
import com.sukabaca.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@DisplayName("Pengujian Unit IMPAL - AuthController")
class AuthControllerTest {

    private UserRepository userRepository;
    private AuthController authController;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        authController = new AuthController(userRepository);
    }

    @Test
    @DisplayName("Uji Login Demo Fallback (Glen / Besar123)")
    void testDemoLoginFallbackSuccess() {
        when(userRepository.findByUsername("Glen")).thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.login(Map.of(
                "username", "Glen",
                "password", "Besar123"
        ));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().toString().contains("Demo user login successful"));
    }

    @Test
    @DisplayName("Uji Login Valid dari Database")
    void testDatabaseLoginSuccess() {
        User dbUser = new User("Adira", "Password123", "Adira Pratama", "user");
        when(userRepository.findByUsername("Adira")).thenReturn(Optional.of(dbUser));

        ResponseEntity<?> response = authController.login(Map.of(
                "username", "Adira",
                "password", "Password123"
        ));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("Login successful"));
    }

    @Test
    @DisplayName("Uji Login Gagal - Password Salah")
    void testLoginInvalidPassword() {
        User dbUser = new User("Adira", "PasswordBenar", "Adira Pratama", "user");
        when(userRepository.findByUsername("Adira")).thenReturn(Optional.of(dbUser));

        ResponseEntity<?> response = authController.login(Map.of(
                "username", "Adira",
                "password", "PasswordSalah"
        ));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    @DisplayName("Uji Login Validasi Input Kosong")
    void testLoginEmptyFields() {
        ResponseEntity<?> response = authController.login(Map.of(
                "username", "",
                "password", ""
        ));

        // When Glen/Besar123 not matched and user not in repo, returns 401
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}
