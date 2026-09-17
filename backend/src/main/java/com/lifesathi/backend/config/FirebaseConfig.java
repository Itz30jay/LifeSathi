package com.lifesathi.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.jspecify.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.util.Base64;

/**
 * No Firebase project exists in this workspace yet — there's no MCP
 * connector for Firebase, so creating one is a manual step in the
 * Firebase console, same as Clerk. Rather than fail application startup
 * over that, this bean is null until FIREBASE_SERVICE_ACCOUNT_BASE64 is
 * set; PushNotificationService checks for null and no-ops (with a log
 * line) instead of crashing the whole app.
 */
@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Bean
    @Nullable
    public FirebaseApp firebaseApp(@Value("${lifesathi.firebase.service-account-base64:}") String serviceAccountBase64) {
        if (serviceAccountBase64 == null || serviceAccountBase64.isBlank()) {
            log.warn("FIREBASE_SERVICE_ACCOUNT_BASE64 not set — push notifications are disabled until it is.");
            return null;
        }
        try {
            byte[] decoded = Base64.getDecoder().decode(serviceAccountBase64);
            GoogleCredentials credentials = GoogleCredentials.fromStream(new ByteArrayInputStream(decoded));
            FirebaseOptions options = FirebaseOptions.builder().setCredentials(credentials).build();
            return FirebaseApp.getApps().isEmpty() ? FirebaseApp.initializeApp(options) : FirebaseApp.getInstance();
        } catch (Exception e) {
            // Broad catch is deliberate: a malformed credential should
            // disable push notifications, not take the whole API down.
            log.error("Failed to initialize Firebase — push notifications disabled.", e);
            return null;
        }
    }
}
