package com.lifesathi.backend.task;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<TaskResponse> listForUser(UUID userId) {
        return taskRepository.findByUserIdOrderByDueDateAscCreatedAtDesc(userId)
                .stream().map(TaskResponse::from).toList();
    }

    @Transactional
    public TaskResponse create(UUID userId, TaskRequest request) {
        Task task = new Task();
        task.setUserId(userId);
        applyRequest(task, request);
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(UUID userId, UUID taskId, TaskRequest request) {
        Task task = findOwned(userId, taskId);
        applyRequest(task, request);
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse setCompleted(UUID userId, UUID taskId, boolean completed) {
        Task task = findOwned(userId, taskId);
        task.setCompleted(completed);
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public void delete(UUID userId, UUID taskId) {
        taskRepository.delete(findOwned(userId, taskId));
    }

    private Task findOwned(UUID userId, UUID taskId) {
        return taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    private void applyRequest(Task task, TaskRequest request) {
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority() != null ? request.priority() : TaskPriority.MEDIUM);
        task.setDueDate(request.dueDate());
    }
}
