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
import { useCallback, useState } from "react";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { layout, header as headerStyles, typography, card, button } from "@/constants/styles";
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
import { useActiveProgram } from "@/hooks/use-active-program";
import { useAuth } from "@/providers/auth-provider";

function formatDifficulty(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function formatGoal(goal: string): string {
  return goal.charAt(0).toUpperCase() + goal.slice(1);
}

function getDayLabel(dayNumber: number): string {
  return `Day ${dayNumber}`;
}

function getCurrentProgramDay(startedAt: Date | null): number {
  if (!startedAt) return 1;

  const now = new Date();
  const startDate = new Date(startedAt.getFullYear(), startedAt.getMonth(), startedAt.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / msPerDay);

  return daysElapsed + 1;
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
    programStartedAt,
    isLoading,
    error,
    refetch,
  } = useProgram(id || null);

  const { startProgram } = useActiveProgram();
  const [isSelectingProgram, setIsSelectingProgram] = useState(false);

  const isTemplate = program?.is_template === true;
  const isOwnProgram = program?.user_id != null && program?.user_id === user?.id;
  const needsToSelectProgram = isTemplate && !hasStartedProgram;

  const week1Workouts = (program?.workouts?.filter((w) => w.week_number === 1) || [])
    .sort((a, b) => a.day_of_week - b.day_of_week);

  const daysPerWeek = program?.days_per_week || 1;
  const currentProgramDay = getCurrentProgramDay(programStartedAt);
  const dayInWeek = ((currentProgramDay - 1) % daysPerWeek) + 1;

  const todaysWorkouts = week1Workouts.filter((w) => w.day_of_week === dayInWeek);
  const allTodaysWorkoutsCompleted = todaysWorkouts.length > 0 &&
    todaysWorkouts.every((w) => todayCompletedWorkoutIds.includes(w.id));
  const nextIncompleteWorkout = todaysWorkouts.find((w) => !todayCompletedWorkoutIds.includes(w.id));
  const hasWorkoutsToday = todaysWorkouts.length > 0;

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

  const handleWorkoutPress = useCallback(
    (workoutId: string) => {
      const needsActivation = !hasStartedProgram;
      router.push({
        pathname: "/workout/active",
        params: {
          workoutId,
          programId: id,
          ...(needsActivation ? { templateProgramId: program?.id } : {}),
        },
      });
    },
    [router, id, hasStartedProgram, program?.id]
  );

  const handleSelectProgram = useCallback(async () => {
    if (!program?.id) return;

    setIsSelectingProgram(true);
    try {
      const result = await startProgram(program.id);
      if (result.success) {
        await refetch();
        if (nextIncompleteWorkout) {
          Alert.alert(
            "Program Selected",
            "Would you like to start your first workout now?",
            [
              { text: "Later", style: "cancel" },
              {
                text: "Start Now",
                onPress: () => {
                  router.push({
                    pathname: "/workout/active",
                    params: {
                      workoutId: nextIncompleteWorkout.id,
                      programId: program.id,
                    },
                  });
                },
              },
            ]
          );
        }
      } else {
        Alert.alert("Error", result.error || "Failed to select program");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to select program");
    } finally {
      setIsSelectingProgram(false);
    }
  }, [program?.id, startProgram, refetch, nextIncompleteWorkout, router]);

  const handleStartTodaysWorkout = useCallback(() => {
    if (!nextIncompleteWorkout) return;

    const needsActivation = !hasStartedProgram;
    router.push({
      pathname: "/workout/active",
      params: {
        workoutId: nextIncompleteWorkout.id,
        programId: id,
        ...(needsActivation ? { templateProgramId: program?.id } : {}),
      },
    });
  }, [nextIncompleteWorkout, router, id, hasStartedProgram, program?.id]);

  if (isLoading) {
    return (
      <SafeAreaView style={layout.container} edges={["top"]}>
        <View style={headerStyles.containerRow}>
          <Pressable style={headerStyles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.white} />
          </Pressable>
          <Text style={typography.sectionTitle}>Program Details</Text>
          <View style={headerStyles.placeholder} />
        </View>
        <View style={layout.centered}>
          <ActivityIndicator size="large" color={colors.emerald500} />
          <Text style={[typography.bodySm, { marginTop: spacing.md }]}>Loading program...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !program) {
    return (
      <SafeAreaView style={layout.container} edges={["top"]}>
        <View style={headerStyles.containerRow}>
          <Pressable style={headerStyles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.white} />
          </Pressable>
          <Text style={typography.sectionTitle}>Program Details</Text>
          <View style={headerStyles.placeholder} />
        </View>
        <View style={layout.centered}>
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
    <SafeAreaView style={layout.container} edges={["top"]}>
      {/* Header */}
      <View style={headerStyles.containerRow}>
        <Pressable style={headerStyles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.white} />
        </Pressable>
        <Text style={typography.sectionTitle}>Program Details</Text>
        <View style={headerStyles.placeholder} />
      </View>

      <ScrollView style={layout.scroll} showsVerticalScrollIndicator={false}>
        {/* Program Info */}
        <View style={card.large}>
          <Text style={styles.programName}>{program.name}</Text>
          <Text style={styles.programDescription}>
            {program.description || "No description available."}
          </Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Calendar size={18} color={colors.emerald500} />
              <Text style={styles.metaValue}>{program.duration_weeks} weeks</Text>
              <Text style={typography.caption}>Duration</Text>
            </View>
            <View style={styles.metaItem}>
              <Target size={18} color={colors.emerald500} />
              <Text style={styles.metaValue}>{program.days_per_week}</Text>
              <Text style={typography.caption}>Days/Week</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={18} color={colors.emerald500} />
              <Text style={styles.metaValue}>
                {formatDifficulty(program.difficulty)}
              </Text>
              <Text style={typography.caption}>Level</Text>
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

          {/* Progress */}
          {isOwnProgram && (
            <View style={styles.progressContainer}>
              <View style={layout.rowSpaced}>
                <Text style={typography.bodySm}>
                  Week {currentWeek} of {program.duration_weeks}
                </Text>
                <Text style={typography.bodySm}>
                  {completedWorkouts}/{totalWorkouts} workouts
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={typography.caption}>{progress}% complete</Text>
            </View>
          )}
        </View>

        {/* Action Button */}
        {needsToSelectProgram ? (
          <Pressable
            style={[button.primary, styles.actionButton, isSelectingProgram && button.disabled]}
            onPress={handleSelectProgram}
            disabled={isSelectingProgram}
          >
            {isSelectingProgram ? (
              <ActivityIndicator size="small" color={colors.black} />
            ) : (
              <Play size={20} color={colors.black} />
            )}
            <Text style={button.primaryText}>
              {isSelectingProgram ? "Selecting..." : "Start Program"}
            </Text>
          </Pressable>
        ) : nextIncompleteWorkout ? (
          <Pressable
            style={[button.primary, styles.actionButton]}
            onPress={handleStartTodaysWorkout}
          >
            <Play size={20} color={colors.black} />
            <Text style={button.primaryText}>Start Today's Workout</Text>
          </Pressable>
        ) : allTodaysWorkoutsCompleted ? (
          <View style={[card.info, styles.actionButton]}>
            <Check size={20} color={colors.emerald500} />
            <Text style={styles.completedMessageText}>
              {todaysWorkouts.length > 1
                ? "All workouts complete! Rest up for tomorrow."
                : "Today's workout complete! Rest up for tomorrow."}
            </Text>
          </View>
        ) : week1Workouts.length > 0 && !hasWorkoutsToday ? (
          <View style={[card.base, styles.actionButton]}>
            <Text style={typography.bodySm}>
              No workout scheduled for today. Check back on your next workout day!
            </Text>
          </View>
        ) : null}

        {/* Weekly Schedule */}
        <View style={styles.section}>
          <Text style={typography.sectionTitle}>Weekly Schedule</Text>
          {week1Workouts.length > 0 ? (
            week1Workouts.map((workout) => {
              const isToday = workout.day_of_week === dayInWeek;
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
                      {getDayLabel(workout.day_of_week)}
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
                    <Text style={typography.caption}>
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
            <View style={[card.base, { alignItems: "center" }]}>
              <Text style={typography.bodySm}>
                No workouts defined for this program.
              </Text>
            </View>
          )}
        </View>

        {/* Workout Details */}
        {week1Workouts.length > 0 && (
          <View style={styles.section}>
            <Text style={typography.sectionTitle}>Workout Details</Text>
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
                      <Text style={typography.caption}>
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
                      {workout.workout_exercises && workout.workout_exercises.length > 0 ? (
                        <View style={styles.exerciseList}>
                          {workout.workout_exercises.map((we, index) => (
                            <View key={we.id} style={styles.exerciseItem}>
                              <Text style={styles.exerciseNumber}>{index + 1}</Text>
                              <View style={styles.exerciseInfo}>
                                <Text style={styles.exerciseName}>
                                  {we.exercise?.name || "Unknown Exercise"}
                                </Text>
                                <Text style={typography.caption}>
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

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    marginTop: spacing.md,
  },
  retryButtonText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: fontWeight.medium,
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
  progressBar: {
    height: 4,
    backgroundColor: colors.zinc800,
    borderRadius: radius.full,
    marginVertical: spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.emerald500,
    borderRadius: radius.full,
  },
  section: {
    marginTop: spacing.xl,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  completedMessageText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.emerald500,
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
  bottomSpacer: {
    height: spacing.xl,
  },
});
