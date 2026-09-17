package com.lifesathi.backend.device;

import com.lifesathi.backend.user.CurrentUserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * The mobile app calls POST once it has a real FCM token (see
 * mobile/src/lib/pushNotifications.ts) and DELETE on sign-out so a signed-
 * out device stops receiving that user's notifications.
 */
@RestController
@RequestMapping("/api/device-tokens")
public class DeviceTokenController {

    private final DeviceTokenRepository deviceTokenRepository;
    private final CurrentUserService currentUserService;

    public DeviceTokenController(DeviceTokenRepository deviceTokenRepository, CurrentUserService currentUserService) {
        this.deviceTokenRepository = deviceTokenRepository;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Void> register(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody DeviceTokenRequest request) {
        UUID userId = currentUserService.resolve(jwt).getId();
        // Upsert by token, not by (userId, token): the same physical device
        // re-registering under a different account (e.g. after switching
        // users) should move the token over, not create a duplicate row --
        // `token` is UNIQUE at the database level specifically for this.
        DeviceToken deviceToken = deviceTokenRepository.findByToken(request.token()).orElseGet(DeviceToken::new);
        deviceToken.setUserId(userId);
        deviceToken.setToken(request.token());
        deviceToken.setPlatform(request.platform());
        deviceTokenRepository.save(deviceToken);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<Void> unregister(@AuthenticationPrincipal Jwt jwt, @PathVariable String token) {
        UUID userId = currentUserService.resolve(jwt).getId();
        deviceTokenRepository.findByToken(token)
                .filter(dt -> dt.getUserId().equals(userId))
                .ifPresent(deviceTokenRepository::delete);
        return ResponseEntity.noContent().build();
    }

    public record DeviceTokenRequest(
            @NotBlank String token,
            @NotBlank @Pattern(regexp = "IOS|ANDROID", message = "platform must be IOS or ANDROID") String platform
    ) {
    }
}
