package com.lifesathi.backend.calendar;

import java.time.Instant;
import java.util.UUID;

/**
 * A single day's worth of "something is happening" — sourced from a task's
 * due date, a reminder's remind_at, or a reminder chain's target (expiry)
 * date. This is a read-only merge; nothing here is stored, and there's
 * nowhere to write back to via this endpoint — edit the source (a task, a
 * reminder) through its own endpoint instead.
 */
public record CalendarEventResponse(
        UUID id,
        CalendarEventType type,
        String title,
        Instant date
) {
}
