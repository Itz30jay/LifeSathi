package com.lifesathi.backend.task;

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
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final CurrentUserService currentUserService;

    public TaskController(TaskService taskService, CurrentUserService currentUserService) {
        this.taskService = taskService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<TaskResponse> list(@AuthenticationPrincipal Jwt jwt) {
        return taskService.listForUser(currentUserService.resolve(jwt).getId());
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody TaskRequest request) {
        TaskResponse created = taskService.create(currentUserService.resolve(jwt).getId(), request);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public TaskResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @Valid @RequestBody TaskRequest request) {
        return taskService.update(currentUserService.resolve(jwt).getId(), id, request);
    }

    @PatchMapping("/{id}/completed")
    public TaskResponse setCompleted(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestBody CompletedRequest body
    ) {
        return taskService.setCompleted(currentUserService.resolve(jwt).getId(), id, body.completed());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        taskService.delete(currentUserService.resolve(jwt).getId(), id);
        return ResponseEntity.noContent().build();
    }

    public record CompletedRequest(boolean completed) {
    }
}
