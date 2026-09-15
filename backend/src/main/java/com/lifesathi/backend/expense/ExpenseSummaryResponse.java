package com.lifesathi.backend.expense;

import java.math.BigDecimal;
import java.time.Instant;

public record ExpenseSummaryResponse(
        BigDecimal total,
        // Only populated for MONTHLY — there's no weekly/daily budget field
        // on `users` yet, just monthly_budget. Null for other periods.
        BigDecimal budget,
        int count,
        Instant periodStart,
        Instant periodEnd
) {
}
