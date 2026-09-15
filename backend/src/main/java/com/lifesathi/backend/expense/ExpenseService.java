package com.lifesathi.backend.expense;

import com.lifesathi.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
public class ExpenseService {

    // Every current LifeSathi user is India-based (per project scope), so a
    // fixed zone is a reasonable MVP default rather than genuinely
    // per-user-timezone-aware. Revisit (store a real zone on `users`) if
    // that assumption stops holding.
    private static final ZoneId ZONE = ZoneId.of("Asia/Kolkata");

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    public List<ExpenseResponse> listForPeriod(UUID userId, ExpensePeriod period, LocalDate reference) {
        ExpensePeriodCalculator.Bounds bounds = resolveBounds(period, reference);
        return expenseRepository
                .findByUserIdAndSpentAtGreaterThanEqualAndSpentAtLessThanOrderBySpentAtDesc(
                        userId, bounds.start(), bounds.endExclusive())
                .stream().map(ExpenseResponse::from).toList();
    }

    public ExpenseSummaryResponse summarize(UUID userId, ExpensePeriod period, LocalDate reference) {
        ExpensePeriodCalculator.Bounds bounds = resolveBounds(period, reference);
        List<Expense> expenses = expenseRepository
                .findByUserIdAndSpentAtGreaterThanEqualAndSpentAtLessThanOrderBySpentAtDesc(
                        userId, bounds.start(), bounds.endExclusive());

        BigDecimal total = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal budget = period == ExpensePeriod.MONTHLY
                ? userRepository.findById(userId).map(u -> u.getMonthlyBudget()).orElse(null)
                : null;

        return new ExpenseSummaryResponse(total, budget, expenses.size(), bounds.start(), bounds.endExclusive());
    }

    @Transactional
    public ExpenseResponse create(UUID userId, ExpenseRequest request) {
        Expense expense = new Expense();
        expense.setUserId(userId);
        expense.setAmount(request.amount());
        expense.setCategory(request.category());
        expense.setNote(request.note());
        expense.setSpentAt(request.spentAt() != null ? request.spentAt() : Instant.now());
        return ExpenseResponse.from(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse update(UUID userId, UUID expenseId, ExpenseRequest request) {
        Expense expense = findOwned(userId, expenseId);
        expense.setAmount(request.amount());
        expense.setCategory(request.category());
        expense.setNote(request.note());
        if (request.spentAt() != null) {
            expense.setSpentAt(request.spentAt());
        }
        return ExpenseResponse.from(expenseRepository.save(expense));
    }

    @Transactional
    public void delete(UUID userId, UUID expenseId) {
        expenseRepository.delete(findOwned(userId, expenseId));
    }

    private Expense findOwned(UUID userId, UUID expenseId) {
        return expenseRepository.findByIdAndUserId(expenseId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
    }

    private ExpensePeriodCalculator.Bounds resolveBounds(ExpensePeriod period, LocalDate reference) {
        LocalDate ref = reference != null ? reference : LocalDate.now(ZONE);
        return ExpensePeriodCalculator.bounds(period, ref, ZONE);
    }
}
