package com.lifesathi.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.util.List;

/**
 * Bound from `lifesathi.clerk.*` in application.yml.
 *
 * `permittedOrigins` defaults to an empty list (via @DefaultValue) rather
 * than null when CLERK_PERMITTED_ORIGINS is unset, so the azp-claim check in
 * SecurityConfig can safely call .isEmpty() on it from the very first run.
 */
@ConfigurationProperties(prefix = "lifesathi.clerk")
public record ClerkProperties(
        String issuer,
        @DefaultValue List<String> permittedOrigins
) {
}
