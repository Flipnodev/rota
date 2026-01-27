import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useRootNavigationState } from "expo-router";

import { colors } from "@/constants/theme";
import { useAuth } from "@/providers/auth-provider";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@rota/database";

export default function InitialScreen() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { user, loading: authLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for the navigation state to be ready before navigating
    if (!rootNavigationState?.key) return;

    // Wait for auth to finish loading
    if (authLoading) return;

    checkAuthAndOnboardingStatus();
  }, [rootNavigationState?.key, authLoading, user]);

  const checkAuthAndOnboardingStatus = async () => {
    try {
      // If not authenticated, redirect to sign in
      if (!user) {
        router.replace("/auth/sign-in");
        return;
      }

      // User is authenticated, check onboarding status from Supabase profiles table
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (error) {
        // If profile doesn't exist or error, assume not onboarded
        console.warn("Error fetching profile:", error.message);
        router.replace("/onboarding");
        return;
      }

      if (profile?.onboarding_completed) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    } catch (error) {
      // If there's an error, default to onboarding for authenticated users
      console.warn("Error checking onboarding status:", error);
      router.replace("/onboarding");
    } finally {
      setIsChecking(false);
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
