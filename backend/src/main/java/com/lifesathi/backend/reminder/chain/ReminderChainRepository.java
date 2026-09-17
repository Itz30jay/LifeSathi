package com.lifesathi.backend.reminder.chain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReminderChainRepository extends JpaRepository<ReminderChain, UUID> {

    List<ReminderChain> findByUserIdOrderByTargetDateAsc(UUID userId);

    Optional<ReminderChain> findByIdAndUserId(UUID id, UUID userId);
}
