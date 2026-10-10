# Project-specific ProGuard / R8 rules

# 1. Strip debug & verbose logging in release builds
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
    public static int i(...);
    public static int w(...);
}

# 2. Capacitor Core & WebView Javascript Bridge
-keepattributes *Annotation*
-keepattributes JavascriptInterface
-keepattributes SourceFile,LineNumberTable

-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keep class com.getcapacitor.** { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod <methods>;
}

# 3. Official Capacitor Plugins
# App Plugin
-keep class com.capacitorjs.plugins.app.** { *; }
# Clipboard Plugin
-keep class com.capacitorjs.plugins.clipboard.** { *; }
# Haptics Plugin
-keep class com.capacitorjs.plugins.haptics.** { *; }
# Share Plugin
-keep class com.capacitorjs.plugins.share.** { *; }
# Local Notifications Plugin
-keep class com.capacitorjs.plugins.localnotifications.** { *; }
# Push Notifications Plugin
-keep class com.capacitorjs.plugins.pushnotifications.** { *; }

# 4. Firebase Cloud Messaging & Google Play Services
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

