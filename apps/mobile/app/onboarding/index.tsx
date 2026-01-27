import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import {
  ChevronRight,
  ChevronLeft,
  Target,
  Dumbbell,
  Calendar,
  Check,
} from "@/components/icons";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";

type Step = "welcome" | "goals" | "experience" | "equipment" | "schedule" | "complete";

const STEPS: Step[] = [
  "welcome",
  "goals",
  "experience",
  "equipment",
  "schedule",
  "complete",
];

const GOALS = [
  { id: "strength", label: "Build Strength", icon: Target },
  { id: "muscle", label: "Build Muscle", icon: Dumbbell },
  { id: "endurance", label: "Improve Endurance", icon: Calendar },
  { id: "health", label: "General Health", icon: Check },
];

const EXPERIENCE = [
  {
    id: "beginner",
    label: "Beginner",
    description: "New to strength training",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "1-2 years of training",
  },
  { id: "advanced", label: "Advanced", description: "3+ years of training" },
];

const EQUIPMENT = [
  { id: "full", label: "Full Gym", description: "Access to all equipment" },
  {
    id: "basic",
    label: "Basic Gym",
    description: "Barbells, dumbbells, cables",
  },
  { id: "home", label: "Home Gym", description: "Limited equipment at home" },
  { id: "none", label: "Bodyweight Only", description: "No equipment needed" },
];

const SCHEDULE = [
  { id: "3", label: "3 days/week", description: "Best for beginners" },
  { id: "4", label: "4 days/week", description: "Balanced approach" },
  { id: "5", label: "5 days/week", description: "Serious training" },
  { id: "6", label: "6 days/week", description: "Advanced lifters" },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<string | null>(
    null
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
    null
  );
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentStep === "complete";

  const canProceed = () => {
    switch (currentStep) {
      case "welcome":
        return true;
      case "goals":
        return selectedGoal !== null;
      case "experience":
        return selectedExperience !== null;
      case "equipment":
        return selectedEquipment !== null;
      case "schedule":
        return selectedSchedule !== null;
      case "complete":
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (isLastStep) {
      // Save user preferences to Supabase profile
      setIsSaving(true);
      try {
        if (!user?.id) {
          throw new Error("No user logged in");
        }

        const onboardingData = {
          fitness_goal: selectedGoal,
          experience_level: selectedExperience,
          available_equipment: selectedEquipment,
          preferred_schedule: selectedSchedule,
        };

        const { error } = await supabase
          .from("profiles")
          .update({
            onboarding_completed: true,
            onboarding_data: onboardingData,
          })
          .eq("id", user.id);

        if (error) {
          throw error;
        }

        router.replace("/(tabs)");
      } catch (error) {
        console.error("Failed to save onboarding data:", error);
        Alert.alert(
          "Error",
          "Failed to save your preferences. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setIsSaving(false);
      }
    } else {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <View style={styles.stepContent}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>ROTA</Text>
            </View>
            <Text style={styles.welcomeTitle}>Welcome to ROTA</Text>
            <Text style={styles.welcomeSubtitle}>
              Train with precision. Progress with purpose.
            </Text>
            <Text style={styles.welcomeDescription}>
              Let's set up your profile to get you started with the perfect
              training program.
            </Text>
          </View>
        );

      case "goals":
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your goal?</Text>
            <Text style={styles.stepSubtitle}>
              This helps us recommend the right programs for you
            </Text>
            <View style={styles.optionsList}>
              {GOALS.map((goal) => (
                <Pressable
                  key={goal.id}
                  style={[
                    styles.optionCard,
                    selectedGoal === goal.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedGoal(goal.id)}
                >
                  <goal.icon
                    size={24}
                    color={
                      selectedGoal === goal.id
                        ? colors.emerald500
                        : colors.zinc400
                    }
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedGoal === goal.id && styles.optionLabelSelected,
                    ]}
                  >
                    {goal.label}
                  </Text>
                  {selectedGoal === goal.id && (
                    <View style={styles.checkCircle}>
                      <Check size={14} color={colors.black} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        );

      case "experience":
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Experience Level</Text>
            <Text style={styles.stepSubtitle}>
              How long have you been training?
            </Text>
            <View style={styles.optionsList}>
              {EXPERIENCE.map((exp) => (
                <Pressable
                  key={exp.id}
                  style={[
                    styles.optionCard,
                    selectedExperience === exp.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedExperience(exp.id)}
                >
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionLabel,
                        selectedExperience === exp.id &&
                          styles.optionLabelSelected,
                      ]}
                    >
                      {exp.label}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {exp.description}
                    </Text>
                  </View>
                  {selectedExperience === exp.id && (
                    <View style={styles.checkCircle}>
                      <Check size={14} color={colors.black} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        );

      case "equipment":
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Available Equipment</Text>
            <Text style={styles.stepSubtitle}>
              What equipment do you have access to?
            </Text>
            <View style={styles.optionsList}>
              {EQUIPMENT.map((eq) => (
                <Pressable
                  key={eq.id}
                  style={[
                    styles.optionCard,
                    selectedEquipment === eq.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedEquipment(eq.id)}
                >
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionLabel,
                        selectedEquipment === eq.id &&
                          styles.optionLabelSelected,
                      ]}
                    >
                      {eq.label}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {eq.description}
                    </Text>
                  </View>
                  {selectedEquipment === eq.id && (
                    <View style={styles.checkCircle}>
                      <Check size={14} color={colors.black} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        );

      case "schedule":
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Training Schedule</Text>
            <Text style={styles.stepSubtitle}>
              How many days per week can you train?
            </Text>
            <View style={styles.optionsList}>
              {SCHEDULE.map((sched) => (
                <Pressable
                  key={sched.id}
                  style={[
                    styles.optionCard,
                    selectedSchedule === sched.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedSchedule(sched.id)}
                >
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionLabel,
                        selectedSchedule === sched.id &&
                          styles.optionLabelSelected,
                      ]}
                    >
                      {sched.label}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {sched.description}
                    </Text>
                  </View>
                  {selectedSchedule === sched.id && (
                    <View style={styles.checkCircle}>
                      <Check size={14} color={colors.black} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        );

      case "complete":
        return (
          <View style={styles.stepContent}>
            <View style={styles.successIcon}>
              <Check size={48} color={colors.black} />
            </View>
            <Text style={styles.completeTitle}>You're all set!</Text>
            <Text style={styles.completeSubtitle}>
              Based on your preferences, we've found the perfect programs for
              you.
            </Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Goal</Text>
                <Text style={styles.summaryValue}>
                  {GOALS.find((g) => g.id === selectedGoal)?.label}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Experience</Text>
                <Text style={styles.summaryValue}>
                  {EXPERIENCE.find((e) => e.id === selectedExperience)?.label}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Equipment</Text>
                <Text style={styles.summaryValue}>
                  {EQUIPMENT.find((e) => e.id === selectedEquipment)?.label}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Schedule</Text>
                <Text style={styles.summaryValue}>
                  {SCHEDULE.find((s) => s.id === selectedSchedule)?.label}
                </Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Progress Indicator */}
      {currentStep !== "welcome" && (
        <View style={styles.progressContainer}>
          {STEPS.slice(1, -1).map((step, index) => (
            <View
              key={step}
              style={[
                styles.progressDot,
                STEPS.indexOf(step) <= currentIndex && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Content */}
      {renderStepContent()}

      {/* Navigation */}
      <View style={styles.navigation}>
        {!isFirstStep && !isLastStep ? (
          <Pressable style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color={colors.white} />
          </Pressable>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}

        <Pressable
          style={[
            styles.nextButton,
            (!canProceed() || isSaving) && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed() || isSaving}
        >
          <Text style={styles.nextButtonText}>
            {isSaving
              ? "Saving..."
              : isLastStep
              ? "Get Started"
              : "Continue"}
          </Text>
          {!isLastStep && !isSaving && (
            <ChevronRight size={20} color={colors.black} />
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    paddingHorizontal: spacing.md,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.zinc800,
  },
  progressDotActive: {
    backgroundColor: colors.emerald500,
  },
  stepContent: {
    flex: 1,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 48,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 4,
  },
  welcomeTitle: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: fontSize.lg,
    color: colors.emerald500,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  welcomeDescription: {
    fontSize: fontSize.base,
    color: colors.zinc400,
    textAlign: "center",
    lineHeight: 24,
  },
  stepTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: fontSize.base,
    color: colors.zinc400,
    marginBottom: spacing.xl,
  },
  optionsList: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
    gap: spacing.md,
  },
  optionCardSelected: {
    borderColor: colors.emerald500,
    backgroundColor: colors.emeraldAlpha10,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  optionLabelSelected: {
    color: colors.emerald500,
  },
  optionDescription: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.emerald500,
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.emerald500,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  completeTitle: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  completeSubtitle: {
    fontSize: fontSize.base,
    color: colors.zinc400,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
    gap: spacing.md,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  summaryValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.zinc900,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPlaceholder: {
    width: 48,
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emerald500,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.xs,
  },
  nextButtonDisabled: {
    backgroundColor: colors.zinc800,
  },
  nextButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
});
