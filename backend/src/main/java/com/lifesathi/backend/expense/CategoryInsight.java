package com.lifesathi.backend.expense;

import java.math.BigDecimal;

public record CategoryInsight(
        String category,
        BigDecimal currentTotal,
        BigDecimal previousTotal,
        // Null when previousTotal is zero — "up 400%" from a zero baseline
        // isn't a meaningful number, and "infinite% increase" isn't either.
        // The client shows "new this period" instead when this is null.
        Double percentChange
) {
}
