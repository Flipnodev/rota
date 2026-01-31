import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";

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
  Lock,
} from "@/components/icons";
import { useProgram } from "@/hooks/use-program";
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

  const {
    program,
    completedWorkoutIds,
    todayCompletedWorkoutIds,
    completedWorkouts,
    totalWorkouts,
    progress,
    currentWeek,
    hasStartedProgram,
    isLoading,
    error,
  } = useProgram(id || null);

  // Check if this is a template program vs user's own program
  const isTemplate = program?.is_template === true;
  const isOwnProgram = program?.user_id != null && program?.user_id === user?.id;
  const showStartProgramText = isTemplate && !isOwnProgram && !hasStartedProgram;

  // Get today's day of week (1-7, Monday-Sunday format)
  const today = new Date();
  const todayDayOfWeek = today.getDay() || 7; // Convert Sunday from 0 to 7

  // Get week 1 workouts for display
  const week1Workouts = program?.workouts?.filter((w) => w.week_number === 1) || [];

  // Find today's workouts (can be multiple)
  const todaysWorkouts = week1Workouts.filter((w) => w.day_of_week === todayDayOfWeek);
  const allTodaysWorkoutsCompleted = todaysWorkouts.length > 0 &&
    todaysWorkouts.every((w) => todayCompletedWorkoutIds.includes(w.id));
  const nextIncompleteWorkout = todaysWorkouts.find((w) => !todayCompletedWorkoutIds.includes(w.id));
  const hasWorkoutsToday = todaysWorkouts.length > 0;

  // Track expanded workout detail cards
  const [expandedWorkoutIds, setExpandedWorkoutIds] = useState<Set<string>>(new Set());

  const toggleWorkoutExpanded = useCallback((workoutId: string) => {
    setExpandedWorkoutIds((prev) => {
      const next = new Set(prev);
      if (next.has(workoutId)) {
        next.delete(workoutId);
      } else {
        next.add(workoutId);
      }
      return next;
    });
  }, []);

  // Handle tapping a workout in the schedule (only for workouts that can be started)
  const handleWorkoutPress = useCallback(
    (workoutId: string) => {
      // Navigate to workout - pass templateProgramId if this is a template
      router.push({
        pathname: "/workout/active",
        params: {
          workoutId,
          programId: id,
          ...(isTemplate && !isOwnProgram ? { templateProgramId: program?.id } : {}),
        },
      });
    },
    [router, id, isTemplate, isOwnProgram, program?.id]
  );

  // Handle "Start Program" / "Start Today's Workout" button
  const handleStartTodaysWorkout = useCallback(() => {
    if (!nextIncompleteWorkout) {
      return;
    }

    // Navigate to workout - pass templateProgramId if this is a template
    router.push({
      pathname: "/workout/active",
      params: {
        workoutId: nextIncompleteWorkout.id,
        programId: id,
        ...(isTemplate && !isOwnProgram ? { templateProgramId: program?.id } : {}),
      },
    });
  }, [nextIncompleteWorkout, router, id, isTemplate, isOwnProgram, program?.id]);

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
              const isCompletedToday = todayCompletedWorkoutIds.includes(workout.id);
              const canStart = isToday && !isCompletedToday;

              return (
                <Pressable
                  key={workout.id}
                  style={[
                    styles.scheduleItem,
                    canStart && styles.scheduleItemToday,
                    isCompletedToday && styles.scheduleItemCompleted,
                    !isToday && !isCompletedToday && styles.scheduleItemLocked,
                  ]}
                  onPress={canStart ? () => handleWorkoutPress(workout.id) : undefined}
                  disabled={!canStart}
                >
                  {/* Status indicator */}
                  <View style={[
                    styles.statusIndicator,
                    isCompletedToday && styles.statusIndicatorDone,
                    !isToday && !isCompletedToday && styles.statusIndicatorLocked,
                    canStart && styles.statusIndicatorReady,
                  ]}>
                    {isCompletedToday ? (
                      <Check size={14} color={colors.black} />
                    ) : !isToday ? (
                      <Lock size={12} color={colors.zinc600} />
                    ) : null}
                  </View>
                  <View style={styles.scheduleDay}>
                    <Text
                      style={[
                        styles.scheduleDayText,
                        canStart && styles.scheduleDayTextToday,
                        isCompletedToday && styles.scheduleDayTextCompleted,
                      ]}
                    >
                      {getDayName(workout.day_of_week)}
                    </Text>
                    {canStart && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayBadgeText}>TODAY</Text>
                      </View>
                    )}
                    {isCompletedToday && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>COMPLETED</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={[
                      styles.scheduleWorkout,
                      !canStart && styles.scheduleWorkoutLocked,
                    ]}>{workout.name}</Text>
                    <Text style={styles.exerciseCount}>
                      {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
                    </Text>
                  </View>
                  {canStart ? (
                    <Play size={20} color={colors.emerald500} />
                  ) : isCompletedToday ? (
                    <Check size={20} color={colors.emerald500} />
                  ) : (
                    <ChevronRight size={20} color={colors.zinc700} />
                  )}
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

        {/* Workout Details - Collapsible */}
        {week1Workouts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Details</Text>
            {week1Workouts.map((workout) => {
              const isExpanded = expandedWorkoutIds.has(workout.id);
              const exerciseCount = workout.workout_exercises?.length || 0;

              return (
                <View key={workout.id} style={styles.workoutDetailCard}>
                  <Pressable
                    style={styles.workoutDetailHeader}
                    onPress={() => toggleWorkoutExpanded(workout.id)}
                  >
                    <Dumbbell size={18} color={colors.emerald500} />
                    <View style={styles.workoutDetailHeaderInfo}>
                      <Text style={styles.workoutDetailName}>{workout.name}</Text>
                      <Text style={styles.workoutDetailMeta}>
                        {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
                      </Text>
                    </View>
                    <View style={[
                      styles.expandIcon,
                      isExpanded && styles.expandIconRotated,
                    ]}>
                      <ChevronRight size={20} color={colors.zinc500} />
                    </View>
                  </Pressable>

                  {isExpanded && (
                    <>
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
                    </>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Start Button */}
        {nextIncompleteWorkout ? (
          // There's a workout today that's not completed
          <Pressable
            style={styles.startButton}
            onPress={handleStartTodaysWorkout}
          >
            <Play size={20} color={colors.black} />
            <Text style={styles.startButtonText}>
              {showStartProgramText ? "Start Program" : "Start Today's Workout"}
            </Text>
          </Pressable>
        ) : allTodaysWorkoutsCompleted ? (
          // All of today's workouts are done
          <View style={styles.completedMessage}>
            <Check size={20} color={colors.emerald500} />
            <Text style={styles.completedMessageText}>
              {todaysWorkouts.length > 1
                ? "All workouts complete! Rest up for tomorrow."
                : "Today's workout complete! Rest up for tomorrow."}
            </Text>
          </View>
        ) : week1Workouts.length > 0 && !hasWorkoutsToday ? (
          // No workout scheduled for today
          <View style={styles.noTodayWorkout}>
            <Text style={styles.noTodayWorkoutText}>
              No workout scheduled for today. Check back on your next workout day!
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
    backgroundColor: colors.emeraldAlpha10,
  },
  scheduleItemCompleted: {
    opacity: 0.7,
    borderColor: colors.emerald500,
    backgroundColor: colors.zinc900,
  },
  scheduleItemLocked: {
    opacity: 0.5,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.zinc700,
    marginRight: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  statusIndicatorDone: {
    backgroundColor: colors.emerald500,
    borderColor: colors.emerald500,
  },
  statusIndicatorLocked: {
    backgroundColor: colors.zinc800,
    borderColor: colors.zinc700,
  },
  statusIndicatorReady: {
    borderColor: colors.emerald500,
    backgroundColor: colors.emeraldAlpha20,
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
  scheduleWorkoutLocked: {
    color: colors.zinc500,
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
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
    overflow: "hidden",
  },
  workoutDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  workoutDetailHeaderInfo: {
    flex: 1,
  },
  workoutDetailName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  workoutDetailMeta: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginTop: 2,
  },
  expandIcon: {
    transform: [{ rotate: "0deg" }],
  },
  expandIconRotated: {
    transform: [{ rotate: "90deg" }],
  },
  exerciseList: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.zinc800,
    paddingTop: spacing.sm,
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.zinc800,
    paddingTop: spacing.sm,
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
  startButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
  completedMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emeraldAlpha10,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.emerald500,
  },
  completedMessageText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.emerald500,
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
