import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { showAlert, showError } from "@/lib/alert";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { layout, header as headerStyles, typography, card, button, iconContainer } from "@/constants/styles";
import { ChevronLeft, Check, Target, Dumbbell, Calendar } from "@/components/icons";
import { useProfile } from "@/hooks/use-profile";

const GOALS = [
  { id: "strength", label: "Build Strength", description: "Focus on increasing your max lifts", icon: Target },
  { id: "muscle", label: "Build Muscle", description: "Hypertrophy-focused training", icon: Dumbbell },
  { id: "endurance", label: "Improve Endurance", description: "Higher reps, more cardio", icon: Calendar },
  { id: "health", label: "General Health", description: "Balanced approach to fitness", icon: Check },
];

interface OnboardingData {
  fitness_goal?: string;
  experience_level?: string;
  available_equipment?: string;
  preferred_schedule?: string;
}

export default function GoalsScreen() {
  const router = useRouter();
  const { profile, isLoading, updateProfile } = useProfile();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.onboarding_data) {
      const data = profile.onboarding_data as OnboardingData;
      setSelectedGoal(data.fitness_goal || null);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!selectedGoal) {
      showError("Error", "Please select a fitness goal");
      return;
    }

    setIsSaving(true);
    try {
      const currentData = (profile?.onboarding_data as OnboardingData) || {};
      const updatedData = {
        ...currentData,
        fitness_goal: selectedGoal,
      };
      await updateProfile({ onboarding_data: updatedData });
      showAlert("Success", "Fitness goal updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Failed to update goal:", error);
      showError("Error", "Failed to update goal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={layout.container} edges={["top"]}>
        <View style={layout.centered}>
          <ActivityIndicator size="large" color={colors.emerald500} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={layout.container} edges={["top"]}>
      <ScrollView style={layout.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={headerStyles.containerRow}>
          <Pressable style={headerStyles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.white} />
          </Pressable>
          <Text style={typography.screenTitle}>Fitness Goals</Text>
          <View style={headerStyles.placeholder} />
        </View>

        {/* Description */}
        <Text style={styles.description}>
          Select your primary fitness goal. This helps us recommend the right programs and track your progress effectively.
        </Text>

        {/* Goals List */}
        <View style={styles.goalsList}>
          {GOALS.map((goal) => (
            <Pressable
              key={goal.id}
              style={[
                card.selectable,
                selectedGoal === goal.id && card.selected,
              ]}
              onPress={() => setSelectedGoal(goal.id)}
            >
              <View style={[
                iconContainer.lg,
                selectedGoal === goal.id && styles.iconContainerSelected,
              ]}>
                <goal.icon
                  size={24}
                  color={selectedGoal === goal.id ? colors.emerald500 : colors.zinc400}
                />
              </View>
              <View style={styles.goalContent}>
                <Text
                  style={[
                    styles.goalLabel,
                    selectedGoal === goal.id && styles.goalLabelSelected,
                  ]}
                >
                  {goal.label}
                </Text>
                <Text style={typography.bodySm}>{goal.description}</Text>
              </View>
              {selectedGoal === goal.id && (
                <View style={styles.checkCircle}>
                  <Check size={14} color={colors.black} />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Save Button */}
        <Pressable
          style={[button.primary, isSaving && button.disabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.black} />
          ) : (
            <Text style={button.primaryText}>Save Goal</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: fontSize.base,
    color: colors.zinc400,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  goalsList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  iconContainerSelected: {
    backgroundColor: colors.emeraldAlpha20,
  },
  goalContent: {
    flex: 1,
  },
  goalLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: 2,
  },
  goalLabelSelected: {
    color: colors.emerald500,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.emerald500,
    alignItems: "center",
    justifyContent: "center",
  },
});
