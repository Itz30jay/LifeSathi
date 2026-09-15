package com.lifesathi.backend.reminder;

import java.time.Instant;
import java.util.UUID;

public record ReminderResponse(
        UUID id,
        String title,
        ReminderType type,
        Instant remindAt,
        RecurrenceInterval recurrenceInterval,
        boolean active
) {
    static ReminderResponse from(Reminder reminder) {
        return new ReminderResponse(
                reminder.getId(),
                reminder.getTitle(),
                reminder.getType(),
                reminder.getRemindAt(),
                reminder.getRecurrenceInterval(),
                reminder.isActive()
        );
    }
}
