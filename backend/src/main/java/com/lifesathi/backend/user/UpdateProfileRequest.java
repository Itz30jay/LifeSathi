package com.lifesathi.backend.user;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateProfileRequest(
        @Size(max = 255) String fullName,
        // Matches the `preferred_language` CHECK constraint on the users table.
        @NotBlank @Pattern(regexp = "en|hi|or", message = "preferredLanguage must be en, hi, or or") String preferredLanguage,
        @DecimalMin(value = "0.00", message = "monthlyBudget can't be negative") BigDecimal monthlyBudget
) {
}
