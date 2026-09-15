package com.lifesathi.backend.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record TaskRequest(
        @NotBlank @Size(max = 255) String title,
        @Size(max = 2000) String description,
        TaskPriority priority,
        Instant dueDate
) {
}
