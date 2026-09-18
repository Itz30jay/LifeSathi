package com.lifesathi.backend.expense;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

/**
 * Computes the [start, endExclusive) instant bounds for a spend period.
 * Split out from ExpenseService so the date math — the part most likely to
 * hide an off-by-one bug — can be unit tested directly, with no database.
 */
public final class ExpensePeriodCalculator {

    private ExpensePeriodCalculator() {
    }

    public record Bounds(Instant start, Instant endExclusive) {
    }

    public static Bounds bounds(ExpensePeriod period, LocalDate reference, ZoneId zone) {
        LocalDate start;
        LocalDate endExclusive;
        switch (period) {
            case DAILY -> {
                start = reference;
                endExclusive = reference.plusDays(1);
            }
            case WEEKLY -> {
                start = reference.with(DayOfWeek.MONDAY);
                endExclusive = start.plusWeeks(1);
            }
            case MONTHLY -> {
                start = reference.withDayOfMonth(1);
                endExclusive = start.plusMonths(1);
            }
            default -> throw new IllegalArgumentException("Unhandled period: " + period);
        }
        return new Bounds(start.atStartOfDay(zone).toInstant(), endExclusive.atStartOfDay(zone).toInstant());
    }

    /** The reference date for "the period immediately before this one" — e.g. last month, for comparisons. */
    public static LocalDate previousReference(ExpensePeriod period, LocalDate reference) {
        return switch (period) {
            case DAILY -> reference.minusDays(1);
            case WEEKLY -> reference.minusWeeks(1);
            case MONTHLY -> reference.minusMonths(1);
        };
    }
}
