package com.lifesathi.backend.expense;

import com.lifesathi.backend.user.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * `period`/`date` query params back the "daily/weekly/monthly views"
 * required for Phase 1. `date` is an optional reference date (defaults to
 * today, Asia/Kolkata) so the same endpoint can also answer "what did I
 * spend last month" — not just the current period.
 *
 * Note: enum query params bind case-sensitively (?period=MONTHLY, not
 * "monthly") — that's a plain Spring MVC default, not something we added.
 */
@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final CurrentUserService currentUserService;

    public ExpenseController(ExpenseService expenseService, CurrentUserService currentUserService) {
        this.expenseService = expenseService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<ExpenseResponse> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "MONTHLY") ExpensePeriod period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return expenseService.listForPeriod(currentUserService.resolve(jwt).getId(), period, date);
    }

    @GetMapping("/summary")
    public ExpenseSummaryResponse summary(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "MONTHLY") ExpensePeriod period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return expenseService.summarize(currentUserService.resolve(jwt).getId(), period, date);
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse created = expenseService.create(currentUserService.resolve(jwt).getId(), request);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ExpenseResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @Valid @RequestBody ExpenseRequest request) {
        return expenseService.update(currentUserService.resolve(jwt).getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        expenseService.delete(currentUserService.resolve(jwt).getId(), id);
        return ResponseEntity.noContent().build();
    }
}
