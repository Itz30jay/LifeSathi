package com.lifesathi.backend.calendar;

import com.lifesathi.backend.user.CurrentUserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    private static final ZoneId ZONE = ZoneId.of("Asia/Kolkata");

    private final CalendarService calendarService;
    private final CurrentUserService currentUserService;

    public CalendarController(CalendarService calendarService, CurrentUserService currentUserService) {
        this.calendarService = calendarService;
        this.currentUserService = currentUserService;
    }

    /** year/month both optional — omit either (or both) for the current calendar month. */
    @GetMapping
    public List<CalendarEventResponse> forMonth(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        YearMonth target = (year != null && month != null) ? YearMonth.of(year, month) : YearMonth.now(ZONE);
        return calendarService.forMonth(currentUserService.resolve(jwt).getId(), target);
    }
}
