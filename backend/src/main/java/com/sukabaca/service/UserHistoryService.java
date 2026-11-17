package com.sukabaca.service;

import com.sukabaca.model.Journal;
import com.sukabaca.model.User;
import com.sukabaca.model.UserHistory;
import com.sukabaca.repository.UserHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserHistoryService {

    private final UserHistoryRepository userHistoryRepository;

    public UserHistoryService(UserHistoryRepository userHistoryRepository) {
        this.userHistoryRepository = userHistoryRepository;
    }

    /**
     * Records or updates the single latest action for a user-journal pair.
     */
    @Transactional
    public void recordLatest(User user, Journal journal, String actionType) {
        if (user == null || journal == null || user.getId() == null || journal.getId() == null) {
            return;
        }
        List<UserHistory> existing = userHistoryRepository.findByUserIdAndJournalId(user.getId(), journal.getId());
        if (existing.isEmpty()) {
            userHistoryRepository.save(new UserHistory(user, journal, actionType));
            return;
        }

        UserHistory primary = existing.get(0);
        primary.setActionType(actionType);
        primary.setCreatedAt(LocalDateTime.now());
        userHistoryRepository.save(primary);

        for (int i = 1; i < existing.size(); i++) {
            userHistoryRepository.delete(existing.get(i));
        }
    }
}
