package com.sukabaca.controller;

import com.sukabaca.model.Subscription;
import com.sukabaca.model.User;
import com.sukabaca.repository.SubscriptionRepository;
import com.sukabaca.repository.UserRepository;
import com.sukabaca.security.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    @Test
    @SuppressWarnings("unchecked")
    void registerReturnsAuthenticatedUserPayloadWithValidToken() {
        UserRepository userRepository = mock(UserRepository.class);
        SubscriptionRepository subscriptionRepository = mock(SubscriptionRepository.class);
        when(userRepository.existsByUsername("alice_research")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(42L);
            return saved;
        });
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthController controller = new AuthController(userRepository, subscriptionRepository);

        ResponseEntity<?> response = controller.register(Map.of(
                "username", "alice_research",
                "password", "secret123",
                "name", "Alice"
        ));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> body = assertInstanceOf(Map.class, response.getBody());
        assertEquals("success", body.get("status"));
        assertEquals(42L, body.get("userId"));
        assertEquals("alice_research", body.get("username"));
        assertEquals("Alice", body.get("name"));
        assertEquals("user", body.get("role"));

        String token = assertInstanceOf(String.class, body.get("token"));
        TokenService.AuthClaims claims = TokenService.verify(token);
        assertNotNull(claims);
        assertEquals(42L, claims.userId());
        assertEquals("alice_research", claims.username());
        assertEquals("user", claims.role());

        verify(subscriptionRepository, times(1)).save(any(Subscription.class));
    }
}
