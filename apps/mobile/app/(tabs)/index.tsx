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
import { TrendingUp, Calendar, ChevronRight, Dumbbell, Check } from "@/components/icons";
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
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.emerald500} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()}, {displayName}
          </Text>
          <Text style={styles.title}>Ready to train?</Text>
        </View>

        {/* Active Program Card */}
        {activeProgram ? (
          <Pressable
            style={styles.programCard}
            onPress={() => router.push(`/program/${activeProgram.program.id}`)}
          >
            <View style={styles.programBadge}>
              <Text style={styles.programBadgeText}>CURRENT PROGRAM</Text>
            </View>
            <Text style={styles.programName}>{activeProgram.program.name}</Text>
            <Text style={styles.programMeta}>
              Week {currentWeek} of {totalWeeks} · {completedWorkouts}/{totalWorkouts} workouts
            </Text>

            <View style={styles.programProgress}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress}% complete</Text>
            </View>

            {isTodaysWorkoutCompleted ? (
              <View style={styles.completedButton}>
                <Check size={20} color={colors.emerald500} />
                <Text style={styles.completedButtonText}>
                  Today's Workout Complete!
                </Text>
              </View>
            ) : (
              <View style={styles.viewProgramButton}>
                <Text style={styles.viewProgramButtonText}>
                  {todaysWorkout ? "View Today's Workout" : "View Program"}
                </Text>
                <ChevronRight size={18} color={colors.emerald500} />
              </View>
            )}
          </Pressable>
        ) : (
          <View style={styles.emptyProgramCard}>
            <View style={styles.emptyIconContainer}>
              <Dumbbell size={32} color={colors.zinc500} />
            </View>
            <Text style={styles.emptyTitle}>No Active Program</Text>
            <Text style={styles.emptyText}>
              Choose a program from the library to get started
            </Text>
            <Pressable
              style={styles.browseProgramsButton}
              onPress={() => router.push("/(tabs)/programs")}
            >
              <Text style={styles.browseProgramsText}>Browse Programs</Text>
            </Pressable>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <TrendingUp size={20} color={colors.emerald500} />
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={20} color={colors.emerald500} />
            <Text style={styles.statValue}>{stats.thisWeek}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.base,
    color: colors.zinc400,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  programCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  programBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.emeraldAlpha20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  programBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.emerald500,
    letterSpacing: 0.5,
  },
  programName: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
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
  progressBar: {
    height: 4,
    backgroundColor: colors.zinc800,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.emerald500,
    borderRadius: radius.full,
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
  },
  viewProgramButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.zinc800,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.xs,
  },
  viewProgramButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.emerald500,
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
  emptyProgramCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.zinc800,
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.whiteAlpha5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  browseProgramsButton: {
    backgroundColor: colors.emerald500,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  browseProgramsText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  statValue: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginTop: spacing.xs,
  },
});
