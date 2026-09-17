package com.lifesathi.backend.reminder.chain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record ReminderChainRequest(
        @NotBlank @Size(max = 255) String title,
        @NotNull Instant targetDate
) {
}
