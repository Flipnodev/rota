import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useCallback } from "react";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import {
  ChevronLeft,
  Calendar,
  Target,
  Clock,
  ChevronRight,
  Play,
  Dumbbell,
  Check,
} from "@/components/icons";
import { useProgram } from "@/hooks/use-program";
import { useActiveProgram } from "@/hooks/use-active-program";
import { useAuth } from "@/providers/auth-provider";

// Helper to format difficulty level
function formatDifficulty(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

// Helper to format program goal
function formatGoal(goal: string): string {
  return goal.charAt(0).toUpperCase() + goal.slice(1);
}

// Helper to get day name
function getDayName(dayOfWeek: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // Adjust for 1-indexed days (1 = Monday)
  return days[dayOfWeek % 7] || `Day ${dayOfWeek}`;
}

export default function ProgramDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { startProgram } = useActiveProgram();
  const [isStarting, setIsStarting] = useState(false);

  const {
    program,
    completedWorkoutIds,
    completedWorkouts,
    totalWorkouts,
    progress,
    currentWeek,
    isLoading,
    error,
    refetch,
  } = useProgram(id || null);

  // Check if this is a template program vs user's own program
  const isTemplate = program?.is_template === true;
  const isOwnProgram = program?.user_id != null && program?.user_id === user?.id;
  const showStartButton = isTemplate && !isOwnProgram;

  // Get today's day of week (1-7, Monday-Sunday format)
  const today = new Date();
  const todayDayOfWeek = today.getDay() || 7; // Convert Sunday from 0 to 7

  // Get week 1 workouts for display
  const week1Workouts = program?.workouts?.filter((w) => w.week_number === 1) || [];

  // Find today's workout
  const todaysWorkout = week1Workouts.find((w) => w.day_of_week === todayDayOfWeek);

  // Handle starting the program (copies template if needed, sets as active)
  const handleStartProgram = useCallback(async () => {
    if (!program?.id) return;

    setIsStarting(true);
    const result = await startProgram(program.id);
    setIsStarting(false);

    if (result.success && result.programId) {
      // Navigate to the user's program
      router.replace({
        pathname: "/program/[id]",
        params: { id: result.programId },
      });
    } else {
      Alert.alert("Error", result.error || "Failed to start program. Please try again.");
    }
  }, [program?.id, startProgram, router]);

  const handleStartWorkout = useCallback(
    async (workoutId: string) => {
      if (!program?.id) return;

      // If this is a template program and user doesn't own it,
      // start the program first (which copies it and sets as active)
      if (isTemplate && !isOwnProgram) {
        setIsStarting(true);
        const result = await startProgram(program.id);
        setIsStarting(false);

        if (result.success && result.programId) {
          router.replace({
            pathname: "/program/[id]",
            params: { id: result.programId },
          });
          Alert.alert(
            "Program Started",
            "This program is now your active program. You can start your workout."
          );
        } else {
          Alert.alert("Error", result.error || "Failed to start program. Please try again.");
        }
        return;
      }

      // For user's own programs, start the workout directly
      router.push({
        pathname: "/workout/active",
        params: { workoutId, programId: id },
      });
    },
    [program?.id, isTemplate, isOwnProgram, startProgram, router, id]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Program Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.emerald500} />
          <Text style={styles.loadingText}>Loading program...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !program) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Program Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message || "Program not found"}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Program Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Program Info */}
        <View style={styles.programCard}>
          <Text style={styles.programName}>{program.name}</Text>
          <Text style={styles.programDescription}>
            {program.description || "No description available."}
          </Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Calendar size={18} color={colors.emerald500} />
              <Text style={styles.metaValue}>{program.duration_weeks} weeks</Text>
              <Text style={styles.metaLabel}>Duration</Text>
            </View>
            <View style={styles.metaItem}>
              <Target size={18} color={colors.emerald500} />
              <Text style={styles.metaValue}>{program.days_per_week}</Text>
              <Text style={styles.metaLabel}>Days/Week</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={18} color={colors.emerald500} />
              <Text style={styles.metaValue}>
                {formatDifficulty(program.difficulty)}
              </Text>
              <Text style={styles.metaLabel}>Level</Text>
            </View>
          </View>

          {/* Goal Badge */}
          <View style={styles.goalContainer}>
            <View style={styles.goalBadge}>
              <Text style={styles.goalBadgeText}>
                Goal: {formatGoal(program.goal)}
              </Text>
            </View>
          </View>

          {/* Progress - only show for user's own programs */}
          {isOwnProgram && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  Week {currentWeek} of {program.duration_weeks}
                </Text>
                <Text style={styles.progressLabel}>
                  {completedWorkouts}/{totalWorkouts} workouts
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress}% complete</Text>
            </View>
          )}
        </View>

        {/* Weekly Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Schedule</Text>
          {week1Workouts.length > 0 ? (
            week1Workouts.map((workout) => {
              const isToday = workout.day_of_week === todayDayOfWeek;
              const exerciseCount = workout.workout_exercises?.length || 0;
              const isCompleted = completedWorkoutIds.includes(workout.id);

              return (
                <Pressable
                  key={workout.id}
                  style={[
                    styles.scheduleItem,
                    isToday && styles.scheduleItemToday,
                    isCompleted && styles.scheduleItemCompleted,
                  ]}
                  onPress={() => handleStartWorkout(workout.id)}
                >
                  {/* Completion indicator */}
                  {isOwnProgram && (
                    <View style={[
                      styles.completionIndicator,
                      isCompleted && styles.completionIndicatorDone,
                    ]}>
                      {isCompleted && <Check size={14} color={colors.black} />}
                    </View>
                  )}
                  <View style={styles.scheduleDay}>
                    <Text
                      style={[
                        styles.scheduleDayText,
                        isToday && styles.scheduleDayTextToday,
                        isCompleted && styles.scheduleDayTextCompleted,
                      ]}
                    >
                      {getDayName(workout.day_of_week)}
                    </Text>
                    {isToday && !isCompleted && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayBadgeText}>TODAY</Text>
                      </View>
                    )}
                    {isCompleted && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>DONE</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={[
                      styles.scheduleWorkout,
                      isCompleted && styles.scheduleWorkoutCompleted,
                    ]}>{workout.name}</Text>
                    <Text style={styles.exerciseCount}>
                      {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.zinc600} />
                </Pressable>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No workouts defined for this program.
              </Text>
            </View>
          )}
        </View>

        {/* Workout Details Expanded */}
        {week1Workouts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Details</Text>
            {week1Workouts.map((workout) => (
              <View key={workout.id} style={styles.workoutDetailCard}>
                <View style={styles.workoutDetailHeader}>
                  <Dumbbell size={18} color={colors.emerald500} />
                  <Text style={styles.workoutDetailName}>{workout.name}</Text>
                </View>
                {workout.workout_exercises &&
                workout.workout_exercises.length > 0 ? (
                  <View style={styles.exerciseList}>
                    {workout.workout_exercises.map((we, index) => (
                      <View key={we.id} style={styles.exerciseItem}>
                        <Text style={styles.exerciseNumber}>{index + 1}</Text>
                        <View style={styles.exerciseInfo}>
                          <Text style={styles.exerciseName}>
                            {we.exercise?.name || "Unknown Exercise"}
                          </Text>
                          <Text style={styles.exerciseSets}>
                            {we.sets?.length || 0} sets
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noExercisesText}>
                    No exercises defined
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Start Button */}
        {showStartButton ? (
          // Template program - show "Start This Program"
          <Pressable
            style={[styles.startButton, isStarting && styles.startButtonDisabled]}
            onPress={handleStartProgram}
            disabled={isStarting}
          >
            <Play size={20} color={colors.black} />
            <Text style={styles.startButtonText}>
              {isStarting ? "Starting Program..." : "Start This Program"}
            </Text>
          </Pressable>
        ) : isOwnProgram && todaysWorkout ? (
          // User's own program - show today's workout button
          <Pressable
            style={styles.startButton}
            onPress={() => handleStartWorkout(todaysWorkout.id)}
          >
            <Play size={20} color={colors.black} />
            <Text style={styles.startButtonText}>Start Today's Workout</Text>
          </Pressable>
        ) : isOwnProgram && week1Workouts.length > 0 ? (
          // User's own program but no workout scheduled for today
          <View style={styles.noTodayWorkout}>
            <Text style={styles.noTodayWorkoutText}>
              No workout scheduled for today. Tap any workout above to start.
            </Text>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.zinc900,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.base,
    color: colors.zinc400,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.error,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.zinc900,
    borderRadius: radius.md,
  },
  retryButtonText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  programCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  programName: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  programDescription: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.zinc800,
  },
  metaItem: {
    alignItems: "center",
  },
  metaValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.xs,
  },
  metaLabel: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginTop: 2,
  },
  goalContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.zinc800,
    alignItems: "center",
  },
  goalBadge: {
    backgroundColor: colors.emeraldAlpha20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  goalBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.emerald500,
  },
  progressContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.zinc800,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.zinc800,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
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
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  scheduleItemToday: {
    borderColor: colors.emerald500,
  },
  scheduleItemCompleted: {
    opacity: 0.7,
  },
  completionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.zinc700,
    marginRight: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  completionIndicatorDone: {
    backgroundColor: colors.emerald500,
    borderColor: colors.emerald500,
  },
  scheduleDay: {
    width: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  scheduleDayText: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  scheduleDayTextToday: {
    color: colors.emerald500,
    fontWeight: fontWeight.medium,
  },
  scheduleDayTextCompleted: {
    color: colors.zinc500,
  },
  todayBadge: {
    backgroundColor: colors.emeraldAlpha20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  todayBadgeText: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.emerald500,
  },
  completedBadge: {
    backgroundColor: colors.emeraldAlpha20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  completedBadgeText: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.emerald500,
  },
  workoutInfo: {
    flex: 1,
  },
  scheduleWorkout: {
    fontSize: fontSize.base,
    color: colors.white,
  },
  scheduleWorkoutCompleted: {
    color: colors.zinc400,
  },
  exerciseCount: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: colors.zinc900,
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  emptyStateText: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  workoutDetailCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  workoutDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc800,
  },
  workoutDetailName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  exerciseList: {
    gap: spacing.xs,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  exerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.zinc800,
    textAlign: "center",
    lineHeight: 24,
    fontSize: fontSize.sm,
    color: colors.zinc400,
    fontWeight: fontWeight.medium,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: fontSize.sm,
    color: colors.white,
  },
  exerciseSets: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
  },
  noExercisesText: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    fontStyle: "italic",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emerald500,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
  noTodayWorkout: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  noTodayWorkoutText: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    textAlign: "center",
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
