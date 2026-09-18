package com.lifesathi.backend.expense;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure date-math test, no Spring context or database — this is exactly the
 * part of the expense feature most likely to hide an off-by-one bug (e.g.
 * a "monthly" view that quietly includes one extra day and misreports
 * spend), so it's the one piece covered per the money-logic test rule.
 */
class ExpensePeriodCalculatorTest {

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    @Test
    void dailyBoundsCoverExactlyThatCalendarDay() {
        var bounds = ExpensePeriodCalculator.bounds(ExpensePeriod.DAILY, LocalDate.of(2026, 9, 15), IST);

        assertThat(bounds.start()).isEqualTo(atMidnight(2026, 9, 15));
        assertThat(bounds.endExclusive()).isEqualTo(atMidnight(2026, 9, 16));
    }

    @Test
    void weeklyBoundsStartOnMonday() {
        // 2026-09-15 is a Tuesday, so the week should start the day before.
        var bounds = ExpensePeriodCalculator.bounds(ExpensePeriod.WEEKLY, LocalDate.of(2026, 9, 15), IST);

        assertThat(bounds.start()).isEqualTo(atMidnight(2026, 9, 14));
        assertThat(bounds.endExclusive()).isEqualTo(atMidnight(2026, 9, 21));
    }

    @Test
    void weeklyBoundsAreUnchangedWhenReferenceIsAlreadyMonday() {
        var bounds = ExpensePeriodCalculator.bounds(ExpensePeriod.WEEKLY, LocalDate.of(2026, 9, 14), IST);

        assertThat(bounds.start()).isEqualTo(atMidnight(2026, 9, 14));
        assertThat(bounds.endExclusive()).isEqualTo(atMidnight(2026, 9, 21));
    }

    @Test
    void monthlyBoundsSpanTheFullCalendarMonthRegardlessOfLength() {
        var bounds = ExpensePeriodCalculator.bounds(ExpensePeriod.MONTHLY, LocalDate.of(2026, 9, 15), IST);

        assertThat(bounds.start()).isEqualTo(atMidnight(2026, 9, 1));
        assertThat(bounds.endExclusive()).isEqualTo(atMidnight(2026, 10, 1));
    }

    @Test
    void monthlyBoundsHandleDecemberYearRollover() {
        var bounds = ExpensePeriodCalculator.bounds(ExpensePeriod.MONTHLY, LocalDate.of(2026, 12, 25), IST);

        assertThat(bounds.start()).isEqualTo(atMidnight(2026, 12, 1));
        assertThat(bounds.endExclusive()).isEqualTo(atMidnight(2027, 1, 1));
    }

    @Test
    void previousReferenceStepsBackByOnePeriodUnit() {
        LocalDate ref = LocalDate.of(2026, 9, 15);

        assertThat(ExpensePeriodCalculator.previousReference(ExpensePeriod.DAILY, ref)).isEqualTo(LocalDate.of(2026, 9, 14));
        assertThat(ExpensePeriodCalculator.previousReference(ExpensePeriod.WEEKLY, ref)).isEqualTo(LocalDate.of(2026, 9, 8));
        assertThat(ExpensePeriodCalculator.previousReference(ExpensePeriod.MONTHLY, ref)).isEqualTo(LocalDate.of(2026, 8, 15));
    }

    @Test
    void previousReferenceHandlesMonthlyYearRollover() {
        LocalDate ref = LocalDate.of(2026, 1, 15);

        assertThat(ExpensePeriodCalculator.previousReference(ExpensePeriod.MONTHLY, ref)).isEqualTo(LocalDate.of(2025, 12, 15));
    }

    private static java.time.Instant atMidnight(int year, int month, int day) {
        return ZonedDateTime.of(year, month, day, 0, 0, 0, 0, IST).toInstant();
    }
}
