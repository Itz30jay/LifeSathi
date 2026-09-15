package com.lifesathi.backend.user;

import java.math.BigDecimal;
import java.util.UUID;

/** What the app's profile screen / dashboard header actually needs — never the raw entity. */
public record UserProfileResponse(
        UUID id,
        String email,
        String fullName,
        String preferredLanguage,
        BigDecimal monthlyBudget
) {
}
