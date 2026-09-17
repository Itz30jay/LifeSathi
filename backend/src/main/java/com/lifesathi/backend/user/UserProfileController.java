package com.lifesathi.backend.user;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * GET exists mainly to prove the Clerk JWT wiring works end-to-end (mobile
 * sends token -> Spring Security verifies it -> handler runs with a
 * resolved local user). PUT is the actual Phase 1 "user profile" module —
 * name, preferred language, and monthly budget are the only fields Clerk
 * doesn't already own, so those are the only ones editable here.
 */
@RestController
public class UserProfileController {

    private final CurrentUserService currentUserService;

    public UserProfileController(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @GetMapping("/api/me")
    public UserProfileResponse me(@AuthenticationPrincipal Jwt jwt) {
        return toResponse(currentUserService.resolve(jwt));
    }

    @PutMapping("/api/me")
    @Transactional
    public UserProfileResponse update(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UpdateProfileRequest request) {
        User user = currentUserService.resolve(jwt);
        user.setFullName(request.fullName());
        user.setPreferredLanguage(request.preferredLanguage());
        user.setMonthlyBudget(request.monthlyBudget());
        return toResponse(user);
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPreferredLanguage(),
                user.getMonthlyBudget()
        );
    }
}
