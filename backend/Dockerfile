# Render's web-service tool (via MCP) doesn't offer a native Java/Maven
# runtime -- only node/python/go/rust/ruby/elixir/docker. Docker it is.

# --- Build stage ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the POM first so `mvn dependency:go-offline` is cached across builds
# that only touch source files, not dependencies.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# --- Runtime stage ---
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Wildcard rather than a hardcoded version -- spring-boot-maven-plugin
# renames the plain (non-executable) jar to *.jar.original, so this glob
# only ever matches the one real executable jar.
COPY --from=build /app/target/*.jar app.jar

# Render sets $PORT at runtime; application.yml already reads it via
# ${PORT:8080} (see server.port), so no extra wiring needed here.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
