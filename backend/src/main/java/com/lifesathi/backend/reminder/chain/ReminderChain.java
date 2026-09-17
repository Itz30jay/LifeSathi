package com.lifesathi.backend.reminder.chain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * The source expiry/due event behind a cascade of reminders (e.g. "Car
 * insurance renewal" due on a specific date). The individual 45/30/15/7/
 * 1-day reminders live in the `reminders` table with chain_id pointing
 * back here — this table itself doesn't fire anything.
 */
@Entity
@Table(name = "reminder_chains")
@Getter
@Setter
@NoArgsConstructor
public class ReminderChain {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String title;

    @Column(name = "target_date", nullable = false)
    private Instant targetDate;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;
}
