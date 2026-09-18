package com.lifesathi.backend.expense;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ExpenseAnalyticsService {

    // Same fixed-zone reasoning as ExpenseService/CalendarService.
    private static final ZoneId ZONE = ZoneId.of("Asia/Kolkata");

    private final ExpenseRepository expenseRepository;

    public ExpenseAnalyticsService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public ExpenseAnalyticsResponse analyze(UUID userId, ExpensePeriod period, LocalDate reference) {
        LocalDate ref = reference != null ? reference : LocalDate.now(ZONE);
        LocalDate previousRef = ExpensePeriodCalculator.previousReference(period, ref);

        List<Expense> current = expensesFor(userId, period, ref);
        List<Expense> previous = expensesFor(userId, period, previousRef);

        Map<String, BigDecimal> currentByCategory = totalsByCategory(current);
        Map<String, BigDecimal> previousByCategory = totalsByCategory(previous);

        BigDecimal currentTotal = sum(current);
        BigDecimal previousTotal = sum(previous);

        List<CategoryInsight> categoryInsights = currentByCategory.entrySet().stream()
                .map(entry -> {
                    BigDecimal categoryPrevious = previousByCategory.getOrDefault(entry.getKey(), BigDecimal.ZERO);
                    return new CategoryInsight(entry.getKey(), entry.getValue(), categoryPrevious,
                            percentChange(entry.getValue(), categoryPrevious));
                })
                .sorted(Comparator.comparing(CategoryInsight::currentTotal).reversed())
                .toList();

        return new ExpenseAnalyticsResponse(
                period, currentTotal, previousTotal, percentChange(currentTotal, previousTotal), categoryInsights);
    }

    private List<Expense> expensesFor(UUID userId, ExpensePeriod period, LocalDate reference) {
        var bounds = ExpensePeriodCalculator.bounds(period, reference, ZONE);
        return expenseRepository.findByUserIdAndSpentAtGreaterThanEqualAndSpentAtLessThanOrderBySpentAtDesc(
                userId, bounds.start(), bounds.endExclusive());
    }

    private Map<String, BigDecimal> totalsByCategory(List<Expense> expenses) {
        return expenses.stream().collect(Collectors.groupingBy(
                Expense::getCategory,
                Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)));
    }

    private BigDecimal sum(List<Expense> expenses) {
        return expenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** Null when `previous` is zero — see CategoryInsight's doc comment on why that's not just "0". Package-private + static so it's directly unit-testable. */
    static Double percentChange(BigDecimal current, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }
}
