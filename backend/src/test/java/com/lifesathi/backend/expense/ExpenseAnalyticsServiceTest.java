package com.lifesathi.backend.expense;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

/**
 * Covers the money-logic edge cases that are easy to get subtly wrong:
 * a zero previous value (undefined percentage, not "infinite" or "0"),
 * and a decrease (which should come back negative, not just "different").
 */
class ExpenseAnalyticsServiceTest {

    @Test
    void increaseIsPositive() {
        Double result = ExpenseAnalyticsService.percentChange(new BigDecimal("236.00"), new BigDecimal("200.00"));

        assertThat(result).isCloseTo(18.0, within(0.01));
    }

    @Test
    void decreaseIsNegative() {
        Double result = ExpenseAnalyticsService.percentChange(new BigDecimal("150.00"), new BigDecimal("200.00"));

        assertThat(result).isCloseTo(-25.0, within(0.01));
    }

    @Test
    void noChangeIsZero() {
        Double result = ExpenseAnalyticsService.percentChange(new BigDecimal("100.00"), new BigDecimal("100.00"));

        assertThat(result).isCloseTo(0.0, within(0.01));
    }

    @Test
    void zeroPreviousValueIsNullNotInfiniteOrZero() {
        Double result = ExpenseAnalyticsService.percentChange(new BigDecimal("50.00"), BigDecimal.ZERO);

        assertThat(result).isNull();
    }

    @Test
    void bothZeroIsAlsoNull() {
        Double result = ExpenseAnalyticsService.percentChange(BigDecimal.ZERO, BigDecimal.ZERO);

        assertThat(result).isNull();
    }
}
