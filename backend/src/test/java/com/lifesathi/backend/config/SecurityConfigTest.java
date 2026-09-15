package com.lifesathi.backend.config;

import com.lifesathi.backend.common.HealthController;
import com.lifesathi.backend.user.CurrentUserService;
import com.lifesathi.backend.user.UserProfileController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Confirms the security wiring itself: the health check stays public, and a
 * genuinely protected endpoint refuses an unauthenticated request. This is
 * the "basic test" required for anything touching auth per project rules —
 * it deliberately doesn't test Clerk token *validity* (that needs a live
 * Clerk instance/JWKS), only that the filter chain enforces the boundary.
 *
 * Import paths here (WebMvcTest, MockitoBean) are Spring Boot 4.1-specific,
 * checked against current docs while writing this: Spring Boot 4 split the
 * old spring-boot-test-autoconfigure module by technology (WebMvcTest moved
 * to org.springframework.boot.webmvc.test.autoconfigure), and @MockBean was
 * replaced by Spring Framework's own @MockitoBean. Re-check these two
 * imports first if the build fails after a future Spring Boot upgrade.
 */
@WebMvcTest(controllers = { HealthController.class, UserProfileController.class })
@Import(SecurityConfig.class)
@EnableConfigurationProperties(ClerkProperties.class)
@TestPropertySource(properties = {
        "lifesathi.clerk.issuer=https://test.clerk.accounts.dev",
        "spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://test.clerk.accounts.dev/.well-known/jwks.json"
})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CurrentUserService currentUserService;

    @Test
    void healthEndpointIsPublic() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());
    }

    @Test
    void profileEndpointRejectsUnauthenticatedRequests() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized());
    }
}
