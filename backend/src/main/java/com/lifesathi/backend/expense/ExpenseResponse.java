package com.lifesathi.backend.expense;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ExpenseResponse(
        UUID id,
        BigDecimal amount,
        String category,
        String note,
        Instant spentAt
) {
    static ExpenseResponse from(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getNote(),
                expense.getSpentAt()
        );
    }
}
