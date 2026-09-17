package com.lifesathi.backend.calendar;

/** Not a DB-backed enum — this is a purely in-memory tag for merging three existing sources into one view. */
public enum CalendarEventType {
    TASK, REMINDER, EXPIRY
}
