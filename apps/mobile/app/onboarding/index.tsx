import { View, Text, StyleSheet, Pressable } from "react-native";
import { showError } from "@/lib/alert";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";

import { colors, spacing, fontSize, fontWeight } from "@/constants/theme";
import { layout, selection, success } from "@/constants/styles";
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
  { id: "beginner", label: "Beginner", description: "New to strength training" },
  { id: "intermediate", label: "Intermediate", description: "1-2 years of training" },
  { id: "advanced", label: "Advanced", description: "3+ years of training" },
];

const EQUIPMENT = [
  { id: "full", label: "Full Gym", description: "Access to all equipment" },
  { id: "basic", label: "Basic Gym", description: "Barbells, dumbbells, cables" },
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
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
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
        showError("Error", "Failed to save your preferences. Please try again.");
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
          <View style={selection.stepContent}>
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
          <View style={selection.stepContent}>
            <Text style={selection.stepTitle}>What's your goal?</Text>
            <Text style={selection.stepSubtitle}>
              This helps us recommend the right programs for you
            </Text>
            <View style={selection.optionsList}>
              {GOALS.map((goal) => (
                <Pressable
                  key={goal.id}
                  style={[
                    selection.optionCard,
                    selectedGoal === goal.id && selection.optionCardSelected,
                  ]}
                  onPress={() => setSelectedGoal(goal.id)}
                >
                  <goal.icon
                    size={24}
                    color={selectedGoal === goal.id ? colors.emerald500 : colors.zinc400}
                  />
                  <Text
                    style={[
                      selection.optionLabel,
                      selectedGoal === goal.id && selection.optionLabelSelected,
                    ]}
                  >
                    {goal.label}
                  </Text>
                  {selectedGoal === goal.id && (
                    <View style={selection.checkCircle}>
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
          <View style={selection.stepContent}>
            <Text style={selection.stepTitle}>Experience Level</Text>
            <Text style={selection.stepSubtitle}>
              How long have you been training?
            </Text>
            <View style={selection.optionsList}>
              {EXPERIENCE.map((exp) => (
                <Pressable
                  key={exp.id}
                  style={[
                    selection.optionCard,
                    selectedExperience === exp.id && selection.optionCardSelected,
                  ]}
                  onPress={() => setSelectedExperience(exp.id)}
                >
                  <View style={selection.optionTextContainer}>
                    <Text
                      style={[
                        selection.optionLabel,
                        selectedExperience === exp.id && selection.optionLabelSelected,
                      ]}
                    >
                      {exp.label}
                    </Text>
                    <Text style={selection.optionDescription}>{exp.description}</Text>
                  </View>
                  {selectedExperience === exp.id && (
                    <View style={selection.checkCircle}>
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
          <View style={selection.stepContent}>
            <Text style={selection.stepTitle}>Available Equipment</Text>
            <Text style={selection.stepSubtitle}>
              What equipment do you have access to?
            </Text>
            <View style={selection.optionsList}>
              {EQUIPMENT.map((eq) => (
                <Pressable
                  key={eq.id}
                  style={[
                    selection.optionCard,
                    selectedEquipment === eq.id && selection.optionCardSelected,
                  ]}
                  onPress={() => setSelectedEquipment(eq.id)}
                >
                  <View style={selection.optionTextContainer}>
                    <Text
                      style={[
                        selection.optionLabel,
                        selectedEquipment === eq.id && selection.optionLabelSelected,
                      ]}
                    >
                      {eq.label}
                    </Text>
                    <Text style={selection.optionDescription}>{eq.description}</Text>
                  </View>
                  {selectedEquipment === eq.id && (
                    <View style={selection.checkCircle}>
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
          <View style={selection.stepContent}>
            <Text style={selection.stepTitle}>Training Schedule</Text>
            <Text style={selection.stepSubtitle}>
              How many days per week can you train?
            </Text>
            <View style={selection.optionsList}>
              {SCHEDULE.map((sched) => (
                <Pressable
                  key={sched.id}
                  style={[
                    selection.optionCard,
                    selectedSchedule === sched.id && selection.optionCardSelected,
                  ]}
                  onPress={() => setSelectedSchedule(sched.id)}
                >
                  <View style={selection.optionTextContainer}>
                    <Text
                      style={[
                        selection.optionLabel,
                        selectedSchedule === sched.id && selection.optionLabelSelected,
                      ]}
                    >
                      {sched.label}
                    </Text>
                    <Text style={selection.optionDescription}>{sched.description}</Text>
                  </View>
                  {selectedSchedule === sched.id && (
                    <View style={selection.checkCircle}>
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
          <View style={selection.stepContent}>
            <View style={success.iconContainer}>
              <Check size={48} color={colors.black} />
            </View>
            <Text style={success.title}>You're all set!</Text>
            <Text style={success.subtitle}>
              Based on your preferences, we've found the perfect programs for you.
            </Text>
            <View style={selection.summaryCard}>
              <View style={selection.summaryItem}>
                <Text style={selection.summaryLabel}>Goal</Text>
                <Text style={selection.summaryValue}>
                  {GOALS.find((g) => g.id === selectedGoal)?.label}
                </Text>
              </View>
              <View style={selection.summaryItem}>
                <Text style={selection.summaryLabel}>Experience</Text>
                <Text style={selection.summaryValue}>
                  {EXPERIENCE.find((e) => e.id === selectedExperience)?.label}
                </Text>
              </View>
              <View style={selection.summaryItem}>
                <Text style={selection.summaryLabel}>Equipment</Text>
                <Text style={selection.summaryValue}>
                  {EQUIPMENT.find((e) => e.id === selectedEquipment)?.label}
                </Text>
              </View>
              <View style={selection.summaryItem}>
                <Text style={selection.summaryLabel}>Schedule</Text>
                <Text style={selection.summaryValue}>
                  {SCHEDULE.find((s) => s.id === selectedSchedule)?.label}
                </Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={[layout.container, styles.container]} edges={["top", "bottom"]}>
      {/* Progress Indicator */}
      {currentStep !== "welcome" && (
        <View style={selection.progressContainer}>
          {STEPS.slice(1, -1).map((step, index) => (
            <View
              key={step}
              style={[
                selection.progressDot,
                STEPS.indexOf(step) <= currentIndex && selection.progressDotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Content */}
      {renderStepContent()}

      {/* Navigation */}
      <View style={selection.navigation}>
        {!isFirstStep && !isLastStep ? (
          <Pressable style={selection.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color={colors.white} />
          </Pressable>
        ) : (
          <View style={selection.backButtonPlaceholder} />
        )}

        <Pressable
          style={[
            selection.nextButton,
            (!canProceed() || isSaving) && selection.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed() || isSaving}
        >
          <Text style={selection.nextButtonText}>
            {isSaving ? "Saving..." : isLastStep ? "Get Started" : "Continue"}
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
    paddingHorizontal: spacing.md,
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
});
