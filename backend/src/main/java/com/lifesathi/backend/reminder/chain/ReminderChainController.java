package com.lifesathi.backend.reminder.chain;

import com.lifesathi.backend.user.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * "Cascading reminders" — the Phase 2 headline feature. Give it a title and
 * a target/expiry date, get back a 45/30/15/7/1-day reminder chain instead
 * of having to create five reminders by hand.
 */
@RestController
@RequestMapping("/api/reminder-chains")
public class ReminderChainController {

    private final ReminderChainService reminderChainService;
    private final CurrentUserService currentUserService;

    public ReminderChainController(ReminderChainService reminderChainService, CurrentUserService currentUserService) {
        this.reminderChainService = reminderChainService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<ReminderChainResponse> list(@AuthenticationPrincipal Jwt jwt) {
        return reminderChainService.listForUser(currentUserService.resolve(jwt).getId());
    }

    @PostMapping
    public ResponseEntity<ReminderChainResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ReminderChainRequest request
    ) {
        ReminderChainResponse created = reminderChainService.create(currentUserService.resolve(jwt).getId(), request);
        return ResponseEntity.status(201).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        reminderChainService.cancel(currentUserService.resolve(jwt).getId(), id);
        return ResponseEntity.noContent().build();
    }
}
