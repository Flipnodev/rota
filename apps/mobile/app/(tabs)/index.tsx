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
import { Play, TrendingUp, Calendar, ChevronRight, Dumbbell } from "@/components/icons";
import { useProfile } from "@/hooks/use-profile";
import { useActiveProgram } from "@/hooks/use-active-program";
import { useWorkoutLogs } from "@/hooks/use-workout-logs";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0 min";
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HomeScreen() {
  const router = useRouter();
  const { profile, isLoading: profileLoading } = useProfile();
  const {
    activeProgram,
    todaysWorkout,
    currentWeek,
    totalWeeks,
    progress,
    completedWorkouts,
    totalWorkouts,
    isLoading: programLoading,
  } = useActiveProgram();
  const {
    workoutLogs,
    stats,
    isLoading: logsLoading,
  } = useWorkoutLogs({ limit: 3 });

  const isLoading = profileLoading || programLoading || logsLoading;

  const displayName = profile?.display_name || profile?.email?.split("@")[0] || "there";

  const handleStartTodaysWorkout = () => {
    if (todaysWorkout && activeProgram) {
      router.push({
        pathname: "/workout/active",
        params: {
          workoutId: todaysWorkout.id,
          programId: activeProgram.program.id,
        },
      });
    } else if (activeProgram) {
      // No workout for today, go to program details
      router.push(`/program/${activeProgram.program.id}`);
    }
  };

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

            <Pressable
              style={styles.startButton}
              onPress={handleStartTodaysWorkout}
            >
              <Play size={20} color={colors.black} />
              <Text style={styles.startButtonText}>
                {todaysWorkout ? "Start Today's Workout" : "View Program"}
              </Text>
            </Pressable>
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

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable onPress={() => router.push("/(tabs)/history")}>
              <Text style={styles.sectionLink}>See all</Text>
            </Pressable>
          </View>

          {workoutLogs.length > 0 ? (
            workoutLogs.map((log) => (
              <Pressable key={log.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Play size={16} color={colors.emerald500} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityName}>
                    {log.workout?.name || "Workout"}
                  </Text>
                  <Text style={styles.activityMeta}>
                    {formatRelativeDate(log.started_at)} ·{" "}
                    {formatDuration(log.duration_seconds)}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.zinc600} />
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>
                No workout history yet. Start your first workout to see your
                progress here!
              </Text>
            </View>
          )}
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
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emerald500,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  startButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.black,
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
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  sectionLink: {
    fontSize: fontSize.sm,
    color: colors.emerald500,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.emeraldAlpha10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  emptyActivity: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  emptyActivityText: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    textAlign: "center",
  },
});
