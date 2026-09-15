package com.lifesathi.backend.user;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * First protected endpoint — exists mainly to prove the Clerk JWT wiring
 * works end-to-end (mobile sends token -> Spring Security verifies it ->
 * handler runs with a resolved local user) before any real Phase 1 feature
 * is built on top of it.
 */
@RestController
public class UserProfileController {

    private final CurrentUserService currentUserService;

    public UserProfileController(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @GetMapping("/api/me")
    public UserProfileResponse me(@AuthenticationPrincipal Jwt jwt) {
        User user = currentUserService.resolve(jwt);
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPreferredLanguage(),
                user.getMonthlyBudget()
        );
    }
}
