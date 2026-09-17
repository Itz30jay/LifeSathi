package com.lifesathi.backend.calendar;

import com.lifesathi.backend.reminder.ReminderRepository;
import com.lifesathi.backend.reminder.chain.ReminderChainRepository;
import com.lifesathi.backend.task.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class CalendarService {

    // Same reasoning as ExpenseService: every current user is India-based,
    // so a fixed zone is a reasonable MVP default for "which calendar month
    // does this date fall in" rather than genuinely per-user timezone logic.
    private static final ZoneId ZONE = ZoneId.of("Asia/Kolkata");

    private final TaskRepository taskRepository;
    private final ReminderRepository reminderRepository;
    private final ReminderChainRepository reminderChainRepository;

    public CalendarService(
            TaskRepository taskRepository,
            ReminderRepository reminderRepository,
            ReminderChainRepository reminderChainRepository
    ) {
        this.taskRepository = taskRepository;
        this.reminderRepository = reminderRepository;
        this.reminderChainRepository = reminderChainRepository;
    }

    public List<CalendarEventResponse> forMonth(UUID userId, YearMonth month) {
        Instant start = month.atDay(1).atStartOfDay(ZONE).toInstant();
        Instant endExclusive = month.plusMonths(1).atDay(1).atStartOfDay(ZONE).toInstant();

        List<CalendarEventResponse> events = new ArrayList<>();

        taskRepository.findByUserIdAndDueDateGreaterThanEqualAndDueDateLessThan(userId, start, endExclusive)
                .forEach(t -> events.add(new CalendarEventResponse(t.getId(), CalendarEventType.TASK, t.getTitle(), t.getDueDate())));

        // Deliberately excludes paused/deactivated reminders (activeTrue) —
        // a calendar should show what's actually still going to happen,
        // not a history of what used to be scheduled.
        reminderRepository
                .findByUserIdAndActiveTrueAndRemindAtGreaterThanEqualAndRemindAtLessThan(userId, start, endExclusive)
                .forEach(r -> events.add(new CalendarEventResponse(r.getId(), CalendarEventType.REMINDER, r.getTitle(), r.getRemindAt())));

        reminderChainRepository
                .findByUserIdAndActiveTrueAndTargetDateGreaterThanEqualAndTargetDateLessThan(userId, start, endExclusive)
                .forEach(c -> events.add(new CalendarEventResponse(c.getId(), CalendarEventType.EXPIRY, c.getTitle(), c.getTargetDate())));

        events.sort(Comparator.comparing(CalendarEventResponse::date));
        return events;
    }
}
