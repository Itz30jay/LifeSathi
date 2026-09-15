package com.lifesathi.backend.reminder;

import com.lifesathi.backend.user.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderService reminderService;
    private final CurrentUserService currentUserService;

    public ReminderController(ReminderService reminderService, CurrentUserService currentUserService) {
        this.reminderService = reminderService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<ReminderResponse> list(@AuthenticationPrincipal Jwt jwt) {
        return reminderService.listForUser(currentUserService.resolve(jwt).getId());
    }

    @PostMapping
    public ResponseEntity<ReminderResponse> create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ReminderRequest request) {
        ReminderResponse created = reminderService.create(currentUserService.resolve(jwt).getId(), request);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ReminderResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @Valid @RequestBody ReminderRequest request) {
        return reminderService.update(currentUserService.resolve(jwt).getId(), id, request);
    }

    @PatchMapping("/{id}/active")
    public ReminderResponse setActive(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestBody ActiveRequest body
    ) {
        return reminderService.setActive(currentUserService.resolve(jwt).getId(), id, body.active());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        reminderService.delete(currentUserService.resolve(jwt).getId(), id);
        return ResponseEntity.noContent().build();
    }

    public record ActiveRequest(boolean active) {
    }
}
