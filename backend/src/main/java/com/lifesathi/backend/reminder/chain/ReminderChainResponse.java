package com.lifesathi.backend.reminder.chain;

import com.lifesathi.backend.reminder.ReminderResponse;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ReminderChainResponse(
        UUID id,
        String title,
        Instant targetDate,
        boolean active,
        List<ReminderResponse> reminders
) {
}
