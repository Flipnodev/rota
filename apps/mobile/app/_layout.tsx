import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { MobileI18nProvider } from "@/providers/i18n-provider";
import { DatabaseProvider } from "@/providers/database-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { SettingsProvider } from "@/providers/settings-provider";
import { colors } from "@/constants/theme";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <DatabaseProvider>
        <AuthProvider>
          <MobileI18nProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.black },
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="index" options={{ animation: "none" }} />
              <Stack.Screen name="auth" options={{ animation: "fade" }} />
              <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
              <Stack.Screen
                name="onboarding"
                options={{
                  animation: "fade",
                }}
              />
              <Stack.Screen
                name="program"
                options={{
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="workout"
                options={{
                  animation: "slide_from_bottom",
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="exercise"
                options={{
                  presentation: "modal",
                }}
              />
              <Stack.Screen
                name="profile"
                options={{
                  animation: "slide_from_right",
                }}
              />
            </Stack>
            <StatusBar style="light" />
          </MobileI18nProvider>
        </AuthProvider>
      </DatabaseProvider>
    </SettingsProvider>
  );
}
