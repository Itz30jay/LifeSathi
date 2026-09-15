package com.lifesathi.backend.user;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Resolves the authenticated Clerk JWT into a local {@link User} row,
 * creating one the first time a given Clerk user is seen ("just-in-time"
 * provisioning). Clerk already verified the person's identity before this
 * token was ever issued — this class only keeps a local mirror in sync for
 * foreign-key purposes; it does not perform authentication itself.
 */
@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User resolve(Jwt jwt) {
        String clerkUserId = jwt.getSubject();
        return userRepository.findByClerkUserId(clerkUserId)
                .orElseGet(() -> provision(jwt, clerkUserId));
    }

    private User provision(Jwt jwt, String clerkUserId) {
        User user = new User();
        user.setClerkUserId(clerkUserId);
        // Clerk only includes "email"/"name" claims if a custom JWT template
        // adds them (Clerk Dashboard > Sessions > Customize session token).
        // Fall back to a placeholder so provisioning never fails before
        // that's configured — the real profile can be filled in via a
        // dedicated onboarding call once the template exists.
        String email = jwt.getClaimAsString("email");
        user.setEmail(email != null ? email : clerkUserId + "@unknown.lifesathi.local");
        user.setFullName(jwt.getClaimAsString("name"));
        return userRepository.save(user);
    }
}
