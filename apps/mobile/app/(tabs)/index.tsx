import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { layout, header as headerStyles, typography, card, button } from "@/constants/styles";
import { TrendingUp, Calendar, ChevronRight, Dumbbell, Check } from "@/components/icons";
import { StatCard, EmptyState, Badge, ProgressBar } from "@/components/ui";
import { useProfile } from "@/hooks/use-profile";
import { useActiveProgram } from "@/hooks/use-active-program";
import { useWorkoutLogs } from "@/hooks/use-workout-logs";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const { profile, isLoading: profileLoading } = useProfile();
  const {
    activeProgram,
    todaysWorkout,
    isTodaysWorkoutCompleted,
    currentWeek,
    totalWeeks,
    currentProgramDay,
    programStartedAt,
    progress,
    completedWorkouts,
    totalWorkouts,
    isLoading: programLoading,
  } = useActiveProgram();
  const { stats, isLoading: statsLoading } = useWorkoutLogs();

  const isLoading = profileLoading || programLoading || statsLoading;

  const displayName = profile?.display_name || profile?.email?.split("@")[0] || "there";

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
        <View style={headerStyles.container}>
          <Text style={typography.subtitle}>
            {getGreeting()}, {displayName}
          </Text>
          <Text style={typography.pageTitle}>Ready to train?</Text>
        </View>

        {/* Active Program Card */}
        {activeProgram ? (
          <Pressable
            style={card.large}
            onPress={() => router.push(`/program/${activeProgram.program.id}`)}
          >
            <Badge label="CURRENT PROGRAM" variant="success" size="md" />
            <Text style={styles.programName}>{activeProgram.program.name}</Text>
            <Text style={styles.programMeta}>
              {programStartedAt ? `Day ${currentProgramDay}` : "Not started"} · Week {currentWeek} of {totalWeeks} · {completedWorkouts}/{totalWorkouts} workouts
            </Text>

            <View style={styles.programProgress}>
              <ProgressBar progress={progress} showLabel />
            </View>

            {isTodaysWorkoutCompleted ? (
              <View style={styles.completedButton}>
                <Check size={20} color={colors.emerald500} />
                <Text style={styles.completedButtonText}>
                  Today's Workout Complete!
                </Text>
              </View>
            ) : (
              <View style={button.secondary}>
                <Text style={button.secondaryText}>
                  {todaysWorkout ? "View Today's Workout" : "View Program"}
                </Text>
                <ChevronRight size={18} color={colors.emerald500} />
              </View>
            )}
          </Pressable>
        ) : (
          <EmptyState
            icon={<Dumbbell size={32} color={colors.zinc500} />}
            title="No Active Program"
            description="Choose a program from the library to get started"
            actionLabel="Browse Programs"
            onAction={() => router.push("/(tabs)/programs")}
          />
        )}

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon={<TrendingUp size={20} color={colors.emerald500} />}
            value={stats.totalWorkouts}
            label="Workouts"
          />
          <StatCard
            icon={<Calendar size={20} color={colors.emerald500} />}
            value={stats.thisWeek}
            label="This Week"
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  programName: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  programMeta: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
    marginBottom: spacing.lg,
  },
  programProgress: {
    marginBottom: spacing.lg,
  },
  completedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emeraldAlpha10,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.emerald500,
  },
  completedButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.emerald500,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
