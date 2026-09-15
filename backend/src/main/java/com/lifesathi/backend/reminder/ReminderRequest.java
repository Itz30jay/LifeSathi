package com.lifesathi.backend.reminder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record ReminderRequest(
        @NotBlank @Size(max = 255) String title,
        @NotNull ReminderType type,
        @NotNull Instant remindAt,
        // Required when type=RECURRING, must be null when type=ONE_TIME —
        // enforced in ReminderService (mirrors the DB's CHECK constraint so
        // the API returns a clear 400 instead of a raw constraint error).
        RecurrenceInterval recurrenceInterval
) {
}
