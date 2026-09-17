package com.lifesathi.backend.task;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByUserIdOrderByDueDateAscCreatedAtDesc(UUID userId);

    // Scoping every lookup by userId (not just the task id) is what stops
    // one user from reading/editing/deleting another user's task by
    // guessing a UUID — never query Task by id alone in a user-facing path.
    Optional<Task> findByIdAndUserId(UUID id, UUID userId);

    List<Task> findByUserIdAndDueDateGreaterThanEqualAndDueDateLessThan(UUID userId, Instant start, Instant endExclusive);
}
