package com.lifesathi.backend.expense;

import java.math.BigDecimal;
import java.util.List;

/**
 * Deliberately returns numbers, not sentences — "factual pattern
 * description only, never advice" (project rule) is easiest to guarantee
 * by never generating natural-language text server-side at all, rather
 * than generating text carefully. The client composes the actual "Food
 * spending is up 18% vs last month" phrasing from these numbers, which
 * also means each locale (English/Hindi/Odia, per the multilingual
 * requirement — not built yet) can phrase it correctly rather than the
 * backend baking in one hardcoded English sentence structure.
 */
public record ExpenseAnalyticsResponse(
        ExpensePeriod period,
        BigDecimal currentTotal,
        BigDecimal previousTotal,
        Double overallPercentChange, // null when previousTotal is zero
        List<CategoryInsight> categoryInsights // sorted by currentTotal, highest first
) {
}
