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

import { colors, spacing, fontSize, fontWeight } from "@/constants/theme";
import { layout, header as headerStyles, typography, card, button, iconContainer } from "@/constants/styles";
import { ChevronLeft, Check, Calendar } from "@/components/icons";
import { useProfile } from "@/hooks/use-profile";

const SCHEDULES = [
  { id: "2", label: "2 days/week", description: "Light maintenance routine" },
  { id: "3", label: "3 days/week", description: "Best for beginners" },
  { id: "4", label: "4 days/week", description: "Balanced approach" },
  { id: "5", label: "5 days/week", description: "Serious training" },
  { id: "6", label: "6 days/week", description: "Advanced lifters" },
];

interface OnboardingData {
  fitness_goal?: string;
  experience_level?: string;
  available_equipment?: string;
  preferred_schedule?: string;
}

export default function ScheduleScreen() {
  const router = useRouter();
  const { profile, isLoading, updateProfile } = useProfile();
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.onboarding_data) {
      const data = profile.onboarding_data as OnboardingData;
      setSelectedSchedule(data.preferred_schedule || null);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!selectedSchedule) {
      showError("Error", "Please select a workout schedule");
      return;
    }

    setIsSaving(true);
    try {
      const currentData = (profile?.onboarding_data as OnboardingData) || {};
      const updatedData = {
        ...currentData,
        preferred_schedule: selectedSchedule,
      };
      await updateProfile({ onboarding_data: updatedData });
      showAlert("Success", "Workout schedule updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Failed to update schedule:", error);
      showError("Error", "Failed to update schedule. Please try again.");
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
          <Text style={typography.screenTitle}>Workout Schedule</Text>
          <View style={headerStyles.placeholder} />
        </View>

        {/* Description */}
        <Text style={styles.description}>
          How many days per week can you commit to training? This helps us recommend programs that fit your lifestyle.
        </Text>

        {/* Current Schedule Info */}
        <View style={card.info}>
          <View style={iconContainer.md}>
            <Calendar size={24} color={colors.emerald500} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Pro Tip</Text>
            <Text style={styles.infoText}>
              Consistency beats intensity. Choose a schedule you can maintain long-term.
            </Text>
          </View>
        </View>

        {/* Schedule List */}
        <View style={styles.scheduleList}>
          {SCHEDULES.map((schedule) => (
            <Pressable
              key={schedule.id}
              style={[
                card.selectable,
                selectedSchedule === schedule.id && card.selected,
              ]}
              onPress={() => setSelectedSchedule(schedule.id)}
            >
              <View style={styles.scheduleContent}>
                <Text
                  style={[
                    styles.scheduleLabel,
                    selectedSchedule === schedule.id && styles.scheduleLabelSelected,
                  ]}
                >
                  {schedule.label}
                </Text>
                <Text style={typography.bodySm}>{schedule.description}</Text>
              </View>
              {selectedSchedule === schedule.id && (
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
            <Text style={button.primaryText}>Save Schedule</Text>
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
    marginBottom: spacing.lg,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.emerald500,
    marginBottom: 2,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.zinc300,
    lineHeight: 20,
  },
  scheduleList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: 2,
  },
  scheduleLabelSelected: {
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
