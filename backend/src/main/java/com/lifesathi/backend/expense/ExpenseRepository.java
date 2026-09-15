package com.lifesathi.backend.expense;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findByUserIdAndSpentAtGreaterThanEqualAndSpentAtLessThanOrderBySpentAtDesc(
            UUID userId, Instant periodStart, Instant periodEndExclusive);

    // See TaskRepository's note on findByIdAndUserId — same reasoning here.
    Optional<Expense> findByIdAndUserId(UUID id, UUID userId);
}
