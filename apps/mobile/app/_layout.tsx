import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { MobileI18nProvider } from "@/providers/i18n-provider";
import { colors } from "@/constants/theme";

export default function RootLayout() {
  return (
    <MobileI18nProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.black },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" options={{ animation: "none" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen
          name="onboarding"
          options={{
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="program/[id]"
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="workout/active"
          options={{
            animation: "slide_from_bottom",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="workout/complete"
          options={{
            animation: "fade",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="exercise/[id]"
          options={{
            presentation: "modal",
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </MobileI18nProvider>
  );
}
