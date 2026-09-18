package com.lifesathi.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Auth is delegated entirely to Clerk: the mobile app signs in against Clerk
 * directly (email/password, Google, phone OTP) and attaches Clerk's session
 * JWT as a Bearer token on every API call. This backend never sees a
 * password and never issues its own tokens — it only verifies Clerk's JWT
 * signature against Clerk's public JWKS (see jwk-set-uri in application.yml,
 * from Clerk Dashboard > API Keys > Frontend API URL + /.well-known/jwks.json).
 *
 * Per project security rules ("JWT with short expiry + refresh tokens, no
 * indefinite sessions"): Clerk session tokens already expire in ~60 seconds
 * and are silently refreshed by the Clerk client SDK, so that requirement is
 * satisfied by the platform rather than custom code here.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // stateless bearer-token API — no cookies/browser forms to protect
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/health").permitAll()
                .anyRequest().authenticated())
            .oauth2ResourceSherver(oauth2 -> oauth2.jwt(jwt -> { }));
        return http.build();
    }

    /**
     * Spring Boot builds the JwtDecoder from jwk-set-uri and auto-combines
     * it with every OAuth2TokenValidator<Jwt> bean it finds in the context —
     * this and the validator below just need to exist as @Beans; nothing
     * else has to wire them together by hand.
     */
    @Bean
    public OAuth2TokenValidator<Jwt> clerkIssuerValidator(ClerkProperties clerkProperties) {
        return new JwtIssuerValidator(clerkProperties.issuer());
    }

    /**
     * Rejects tokens whose "azp" (authorized party) claim isn't one of our
     * known clients, per Clerk's own guidance for cross-origin verification.
     * Left permissive (passes when CLERK_PERMITTED_ORIGINS is unset) because
     * there's no live Clerk instance yet to read a real azp value from —
     * fill in the property once Clerk exists and you can see what your
     * app's azp actually looks like.
     */
    @Bean
    public OAuth2TokenValidator<Jwt> clerkAuthorizedPartyValidator(ClerkProperties clerkProperties) {
        return new JwtClaimValidator<>("azp", azp ->
                clerkProperties.permittedOrigins().isEmpty()
                        || clerkProperties.permittedOrigins().contains(azp));
    }
}
