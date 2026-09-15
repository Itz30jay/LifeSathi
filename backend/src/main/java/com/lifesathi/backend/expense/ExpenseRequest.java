package com.lifesathi.backend.expense;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record ExpenseRequest(
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        @NotBlank @Size(max = 100) String category,
        @Size(max = 500) String note,
        // Optional — defaults to "now" on create if omitted.
        Instant spentAt
) {
}
