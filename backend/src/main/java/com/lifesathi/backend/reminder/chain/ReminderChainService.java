package com.lifesathi.backend.reminder.chain;

import com.lifesathi.backend.reminder.Reminder;
import com.lifesathi.backend.reminder.ReminderRepository;
import com.lifesathi.backend.reminder.ReminderResponse;
import com.lifesathi.backend.reminder.ReminderType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class ReminderChainService {

    /**
     * The 45/30/15/7/1-day pattern named explicitly in the project brief as
     * the headline example of "proactive, not reactive" reminders. Not user-
     * configurable in this pass — see the class comment on why that's a
     * deliberate MVP simplification, not an oversight.
     */
    private static final int[] OFFSET_DAYS = {45, 30, 15, 7, 1};

    private final ReminderChainRepository chainRepository;
    private final ReminderRepository reminderRepository;

    public ReminderChainService(ReminderChainRepository chainRepository, ReminderRepository reminderRepository) {
        this.chainRepository = chainRepository;
        this.reminderRepository = reminderRepository;
    }

    public List<ReminderChainResponse> listForUser(UUID userId) {
        return chainRepository.findByUserIdOrderByTargetDateAsc(userId)
                .stream()
                .map(chain -> toResponse(chain, reminderRepository.findByChainIdOrderByRemindAtAsc(chain.getId())))
                .toList();
    }

    /**
     * Creates the chain row, then one ONE_TIME reminder per offset in
     * OFFSET_DAYS whose target date hasn't already passed — e.g. an expiry
     * 10 days out only gets the 7-day and 1-day reminders, not 45/30/15.
     * A target date with none of the offsets still in the future (i.e. the
     * date itself is today or in the past) is rejected outright: a cascade
     * that would generate zero reminders isn't a useful cascade.
     */
    @Transactional
    public ReminderChainResponse create(UUID userId, ReminderChainRequest request) {
        Instant now = Instant.now();

        ReminderChain chain = new ReminderChain();
        chain.setUserId(userId);
        chain.setTitle(request.title());
        chain.setTargetDate(request.targetDate());
        chain = chainRepository.save(chain);

        List<Reminder> generated = new java.util.ArrayList<>();
        for (int offset : OFFSET_DAYS) {
            Instant remindAt = request.targetDate().minus(offset, ChronoUnit.DAYS);
            if (remindAt.isBefore(now)) {
                continue; // this offset has already passed -- skip it, don't backdate a reminder
            }
            Reminder reminder = new Reminder();
            reminder.setUserId(userId);
            reminder.setTitle(request.title() + " — due in " + offset + " day" + (offset == 1 ? "" : "s"));
            reminder.setType(ReminderType.ONE_TIME);
            reminder.setRemindAt(remindAt);
            reminder.setChainId(chain.getId());
            reminder.setOffsetDays(offset);
            generated.add(reminder);
        }

        if (generated.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "targetDate is too close (or in the past) to generate any reminders — the earliest offset is 1 day before."
            );
        }

        reminderRepository.saveAll(generated);
        return toResponse(chain, generated);
    }

    /** Deactivates every still-active reminder in the chain (and the chain itself) rather than deleting history. */
    @Transactional
    public void cancel(UUID userId, UUID chainId) {
        ReminderChain chain = chainRepository.findByIdAndUserId(chainId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reminder chain not found"));
        chain.setActive(false);

        List<Reminder> reminders = reminderRepository.findByChainIdOrderByRemindAtAsc(chainId);
        reminders.forEach(r -> r.setActive(false));
        reminderRepository.saveAll(reminders);
    }

    private ReminderChainResponse toResponse(ReminderChain chain, List<Reminder> reminders) {
        return new ReminderChainResponse(
                chain.getId(),
                chain.getTitle(),
                chain.getTargetDate(),
                chain.isActive(),
                reminders.stream().map(ReminderResponse::from).toList()
        );
    }
}
