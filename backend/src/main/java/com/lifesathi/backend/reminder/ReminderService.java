package com.lifesathi.backend.reminder;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepository;

    public ReminderService(ReminderRepository reminderRepository) {
        this.reminderRepository = reminderRepository;
    }

    public List<ReminderResponse> listForUser(UUID userId) {
        return reminderRepository.findByUserIdOrderByRemindAtAsc(userId)
                .stream().map(ReminderResponse::from).toList();
    }

    @Transactional
    public ReminderResponse create(UUID userId, ReminderRequest request) {
        validateTypeMatchesInterval(request);
        Reminder reminder = new Reminder();
        reminder.setUserId(userId);
        applyRequest(reminder, request);
        return ReminderResponse.from(reminderRepository.save(reminder));
    }

    @Transactional
    public ReminderResponse update(UUID userId, UUID reminderId, ReminderRequest request) {
        validateTypeMatchesInterval(request);
        Reminder reminder = findOwned(userId, reminderId);
        applyRequest(reminder, request);
        return ReminderResponse.from(reminderRepository.save(reminder));
    }

    @Transactional
    public ReminderResponse setActive(UUID userId, UUID reminderId, boolean active) {
        Reminder reminder = findOwned(userId, reminderId);
        reminder.setActive(active);
        return ReminderResponse.from(reminderRepository.save(reminder));
    }

    @Transactional
    public void delete(UUID userId, UUID reminderId) {
        reminderRepository.delete(findOwned(userId, reminderId));
    }

    private Reminder findOwned(UUID userId, UUID reminderId) {
        return reminderRepository.findByIdAndUserId(reminderId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reminder not found"));
    }

    private void applyRequest(Reminder reminder, ReminderRequest request) {
        reminder.setTitle(request.title());
        reminder.setType(request.type());
        reminder.setRemindAt(request.remindAt());
        reminder.setRecurrenceInterval(request.recurrenceInterval());
    }

    /** Mirrors the `recurring_needs_interval` CHECK constraint on the reminders table. */
    private void validateTypeMatchesInterval(ReminderRequest request) {
        boolean hasInterval = request.recurrenceInterval() != null;
        boolean isRecurring = request.type() == ReminderType.RECURRING;
        if (isRecurring != hasInterval) {
            String message = isRecurring
                    ? "recurrenceInterval is required when type is RECURRING"
                    : "recurrenceInterval must be omitted when type is ONE_TIME";
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }
}
