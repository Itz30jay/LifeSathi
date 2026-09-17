package com.lifesathi.backend.reminder;

import com.lifesathi.backend.notification.Notification;
import com.lifesathi.backend.notification.NotificationRepository;
import com.lifesathi.backend.notification.NotificationStatus;
import com.lifesathi.backend.notification.PushNotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;

/**
 * Polls for reminders whose time has arrived and turns them into an actual
 * push notification — without this, "reminders" would just be a to-do list
 * that never tells you anything, which defeats the whole point of the app.
 *
 * A once-a-minute poll (rather than a precise per-reminder trigger via e.g.
 * Quartz) is an acceptable trade for MVP: reminders fire within 60 seconds
 * of their target time, not to the second. Revisit if that's ever not
 * good enough.
 */
@Component
public class ReminderNotificationScheduler {

    private final ReminderRepository reminderRepository;
    private final NotificationRepository notificationRepository;
    private final PushNotificationService pushNotificationService;

    public ReminderNotificationScheduler(
            ReminderRepository reminderRepository,
            NotificationRepository notificationRepository,
            PushNotificationService pushNotificationService
    ) {
        this.reminderRepository = reminderRepository;
        this.notificationRepository = notificationRepository;
        this.pushNotificationService = pushNotificationService;
    }

    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void sendDueReminders() {
        List<Reminder> due = reminderRepository.findByActiveTrueAndRemindAtLessThanEqual(Instant.now());
        for (Reminder reminder : due) {
            fire(reminder);
        }
    }

    private void fire(Reminder reminder) {
        pushNotificationService.sendToUser(reminder.getUserId(), reminder.getTitle(), "Reminder");
        recordNotification(reminder);
        advanceOrDeactivate(reminder);
        reminderRepository.save(reminder);
    }

    private void recordNotification(Reminder reminder) {
        Notification notification = new Notification();
        notification.setUserId(reminder.getUserId());
        notification.setTitle(reminder.getTitle());
        notification.setBody("Reminder");
        notification.setRelatedEntityType("REMINDER");
        notification.setRelatedEntityId(reminder.getId());
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(Instant.now());
        notificationRepository.save(notification);
    }

    private void advanceOrDeactivate(Reminder reminder) {
        if (reminder.getType() == ReminderType.ONE_TIME) {
            reminder.setActive(false);
            return;
        }
        ZonedDateTime next = reminder.getRemindAt().atZone(ZoneOffset.UTC);
        next = switch (reminder.getRecurrenceInterval()) {
            case DAILY -> next.plusDays(1);
            case WEEKLY -> next.plusWeeks(1);
            case MONTHLY -> next.plusMonths(1);
            case YEARLY -> next.plusYears(1);
        };
        reminder.setRemindAt(next.toInstant());
    }
}
