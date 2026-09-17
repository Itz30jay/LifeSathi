package com.lifesathi.backend.notification;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.lifesathi.backend.device.DeviceToken;
import com.lifesathi.backend.device.DeviceTokenRepository;
import org.jspecify.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PushNotificationService {

    private static final Logger log = LoggerFactory.getLogger(PushNotificationService.class);

    private final FirebaseApp firebaseApp; // null when Firebase isn't configured — see FirebaseConfig
    private final DeviceTokenRepository deviceTokenRepository;

    public PushNotificationService(@Nullable FirebaseApp firebaseApp, DeviceTokenRepository deviceTokenRepository) {
        this.firebaseApp = firebaseApp;
        this.deviceTokenRepository = deviceTokenRepository;
    }

    /** Sends to every device the user has registered. Failures for one token don't stop the others. */
    public void sendToUser(UUID userId, String title, String body) {
        if (firebaseApp == null) {
            log.info("Skipping push to user {} — Firebase isn't configured yet.", userId);
            return;
        }

        List<DeviceToken> tokens = deviceTokenRepository.findByUserId(userId);
        for (DeviceToken deviceToken : tokens) {
            try {
                Message message = Message.builder()
                        // Firebase Admin SDK 9.10.0 deprecated setToken()/
                        // the token field in favor of setFid()/Installation
                        // IDs, but FIDs are a distinct concept from the
                        // registration tokens client SDKs (including
                        // @react-native-firebase/messaging) hand back, and
                        // the wider ecosystem hasn't moved onto FIDs yet.
                        // Deprecated, not removed -- revisit once FID-based
                        // tooling is mainstream.
                        .setToken(deviceToken.getToken())
                        .setNotification(
                                com.google.firebase.messaging.Notification.builder()
                                        .setTitle(title)
                                        .setBody(body)
                                        .build())
                        .build();
                FirebaseMessaging.getInstance(firebaseApp).send(message);
            } catch (FirebaseMessagingException e) {
                // An UNREGISTERED token means the app was uninstalled or
                // the token expired -- worth pruning from device_tokens as
                // a follow-up, not done in this pass.
                log.warn("Push failed for a device token ending in {}: {}", lastFour(deviceToken.getToken()), e.getMessage());
            }
        }
    }

    private String lastFour(String token) {
        return token.length() > 4 ? token.substring(token.length() - 4) : token;
    }
}
