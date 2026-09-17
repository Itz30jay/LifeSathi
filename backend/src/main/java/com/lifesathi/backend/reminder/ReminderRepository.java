package com.lifesathi.backend.reminder;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReminderRepository extends JpaRepository<Reminder, UUID> {

    List<Reminder> findByUserIdOrderByRemindAtAsc(UUID userId);

    // See TaskRepository's note on findByIdAndUserId — same reasoning here.
    Optional<Reminder> findByIdAndUserId(UUID id, UUID userId);

    // Field is named `active` (not `isActive`), so the derived query
    // keyword is ActiveTrue, matching the entity property exactly.
    List<Reminder> findByActiveTrueAndRemindAtLessThanEqual(Instant now);

    List<Reminder> findByChainIdOrderByRemindAtAsc(UUID chainId);

    List<Reminder> findByUserIdAndActiveTrueAndRemindAtGreaterThanEqualAndRemindAtLessThan(
            UUID userId, Instant start, Instant endExclusive);
}
