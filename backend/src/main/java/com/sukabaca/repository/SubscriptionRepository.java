package com.sukabaca.repository;

import com.sukabaca.model.Subscription;
import com.sukabaca.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByUserId(Long userId);
    Optional<Subscription> findByUser(User user);
}
