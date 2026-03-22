# Android APK Builder Dockerfile
# Builds React Native/Expo apps into Android APK files

FROM ubuntu:22.04

# Set environment variables
ENV ANDROID_HOME=/opt/android-sdk-linux \
    ANDROID_SDK_ROOT=/opt/android-sdk-linux \
    PATH=${PATH}:/opt/android-sdk-linux/cmdline-tools/latest/bin:/opt/android-sdk-linux/platform-tools:/opt/android-sdk-linux/tools/bin \
    JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 \
    DEBIAN_FRONTEND=noninteractive

# Install base dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    openjdk-17-jdk \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Android SDK
RUN mkdir -p ${ANDROID_HOME} && \
    cd ${ANDROID_HOME} && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip && \
    unzip -q commandlinetools-linux-10406996_latest.zip && \
    rm commandlinetools-linux-10406996_latest.zip && \
    mkdir -p cmdline-tools/latest && \
    mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true

# Install Android SDK packages
RUN yes | sdkmanager --licenses && \
    sdkmanager \
    "platform-tools" \
    "platforms;android-35" \
    "build-tools;35.0.0" \
    "cmake;3.22.1" \
    "ndk;27.0.11718014"

# Set Gradle properties for better build performance
RUN mkdir -p /root/.gradle && \
    printf "org.gradle.jvmargs=-Xmx3072m\norg.gradle.parallel=true\norg.gradle.workers.max=4\n" > /root/.gradle/gradle.properties

# Create working directory
WORKDIR /app

# Default command
CMD ["/bin/bash"]
