package com.lifesathi.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class LifeSathiApplication {

    public static void main(String[] args) {
        SpringApplication.run(LifeSathiApplication.class, args);
    }
}
