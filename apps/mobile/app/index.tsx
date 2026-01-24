import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { colors } from "@/constants/theme";

const ONBOARDING_COMPLETE_KEY = "@rota/onboarding_complete";

// Set to true to always show onboarding (for development)
const DEV_ALWAYS_SHOW_ONBOARDING = true;

export default function InitialScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      if (DEV_ALWAYS_SHOW_ONBOARDING) {
        router.replace("/onboarding");
        return;
      }

      const hasCompletedOnboarding = await AsyncStorage.getItem(
        ONBOARDING_COMPLETE_KEY
      );

      if (hasCompletedOnboarding === "true") {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    } catch (error) {
      // If there's an error, default to onboarding
      router.replace("/onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.emerald500} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
});
