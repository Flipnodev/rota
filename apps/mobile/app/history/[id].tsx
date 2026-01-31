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

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import {
  ChevronLeft,
  Clock,
  Dumbbell,
  Target,
  TrendingUp,
  Check,
  Calendar,
} from "@/components/icons";
import { useWorkoutLogDetail } from "@/hooks/use-workout-log-detail";
import { formatElapsedTime } from "@/hooks/use-workout-session";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatWeight(weight: number): string {
  return weight % 1 === 0 ? weight.toString() : weight.toFixed(1);
}

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return Math.round(volume).toString();
}

function capitalizeFirst(str: string): string {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workoutLog, isLoading, error } = useWorkoutLogDetail(id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Workout Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.emerald500} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !workoutLog) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Workout Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message || "Workout not found"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { summary, exercisesWithSets, workout } = workoutLog;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Workout Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Workout Title Card */}
        <View style={styles.titleCard}>
          <View style={styles.completedBadge}>
            <Check size={12} color={colors.emerald500} />
            <Text style={styles.completedBadgeText}>Completed</Text>
          </View>
          <Text style={styles.workoutName}>
            {workout?.name || "Workout"}
          </Text>
          <View style={styles.dateRow}>
            <Calendar size={14} color={colors.zinc500} />
            <Text style={styles.dateText}>
              {formatDate(workoutLog.started_at)}
            </Text>
          </View>
          <Text style={styles.timeText}>
            {formatTime(workoutLog.started_at)}
            {workoutLog.completed_at &&
              ` - ${formatTime(workoutLog.completed_at)}`}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Clock size={20} color={colors.emerald500} />
            <Text style={styles.statValue}>
              {formatElapsedTime(workoutLog.duration_seconds || 0)}
            </Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Dumbbell size={20} color={colors.emerald500} />
            <Text style={styles.statValue}>{summary.exerciseCount}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={20} color={colors.emerald500} />
            <Text style={styles.statValue}>{summary.totalSets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color={colors.emerald500} />
            <Text style={styles.statValue}>{formatVolume(summary.totalVolume)} kg</Text>
            <Text style={styles.statLabel}>Volume</Text>
          </View>
        </View>

        {/* Additional Stats */}
        <View style={styles.additionalStats}>
          <View style={styles.additionalStatRow}>
            <Text style={styles.additionalStatLabel}>Total Reps</Text>
            <Text style={styles.additionalStatValue}>{summary.totalReps}</Text>
          </View>
          <View style={styles.additionalStatRow}>
            <Text style={styles.additionalStatLabel}>Max Weight</Text>
            <Text style={styles.additionalStatValue}>
              {formatWeight(summary.maxWeight)} kg
            </Text>
          </View>
          {summary.averageRpe !== null && (
            <View style={styles.additionalStatRow}>
              <Text style={styles.additionalStatLabel}>Avg RPE</Text>
              <Text style={styles.additionalStatValue}>
                {summary.averageRpe.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {workoutLog.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{workoutLog.notes}</Text>
          </View>
        )}

        {/* Exercise Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Breakdown</Text>

          {exercisesWithSets.map((exerciseData, exerciseIndex) => (
            <View key={exerciseData.exercise.id} style={styles.exerciseCard}>
              {/* Exercise Header */}
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>
                    {exerciseIndex + 1}
                  </Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>
                    {exerciseData.exercise.name}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                    {exerciseData.sets.length} sets ·{" "}
                    {formatVolume(exerciseData.totalVolume)} kg volume
                  </Text>
                </View>
              </View>

              {/* Muscle Groups */}
              {exerciseData.exercise.muscle_groups &&
                exerciseData.exercise.muscle_groups.length > 0 && (
                  <View style={styles.muscleGroups}>
                    {exerciseData.exercise.muscle_groups.map((muscle) => (
                      <View key={muscle} style={styles.muscleTag}>
                        <Text style={styles.muscleTagText}>
                          {capitalizeFirst(muscle)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

              {/* Sets Table */}
              <View style={styles.setsTable}>
                <View style={styles.setsTableHeader}>
                  <Text style={[styles.setsTableCell, styles.setCellNumber]}>
                    Set
                  </Text>
                  <Text style={[styles.setsTableCell, styles.setCellWeight]}>
                    Weight
                  </Text>
                  <Text style={[styles.setsTableCell, styles.setCellReps]}>
                    Reps
                  </Text>
                  <Text style={[styles.setsTableCell, styles.setCellVolume]}>
                    Volume
                  </Text>
                </View>

                {exerciseData.sets.map((setLog, setIndex) => {
                  const setVolume = setLog.actual_weight * setLog.actual_reps;
                  const targetReps = setLog.exercise_set?.target_reps;
                  const targetWeight = setLog.exercise_set?.target_weight;
                  const hitTarget =
                    targetReps &&
                    setLog.actual_reps >= targetReps &&
                    (!targetWeight || setLog.actual_weight >= targetWeight);

                  return (
                    <View key={setLog.id} style={styles.setsTableRow}>
                      <View style={[styles.setsTableCell, styles.setCellNumber]}>
                        <Text style={styles.setNumber}>{setIndex + 1}</Text>
                        {hitTarget && (
                          <Check size={12} color={colors.emerald500} />
                        )}
                      </View>
                      <View style={[styles.setsTableCell, styles.setCellWeight]}>
                        <Text style={styles.setCellValue}>
                          {formatWeight(setLog.actual_weight)} kg
                        </Text>
                        {targetWeight && (
                          <Text style={styles.targetText}>
                            / {formatWeight(targetWeight)}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.setsTableCell, styles.setCellReps]}>
                        <Text style={styles.setCellValue}>
                          {setLog.actual_reps}
                        </Text>
                        {targetReps && (
                          <Text style={styles.targetText}>/ {targetReps}</Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.setsTableCell,
                          styles.setCellVolume,
                          styles.setCellValue,
                        ]}
                      >
                        {formatVolume(setVolume)}
                      </Text>
                    </View>
                  );
                })}

                {/* Exercise Summary Row */}
                <View style={styles.exerciseSummaryRow}>
                  <Text style={styles.exerciseSummaryLabel}>Total</Text>
                  <Text style={styles.exerciseSummaryValue}>
                    {exerciseData.totalReps} reps · {formatVolume(exerciseData.totalVolume)} kg
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
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
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc900,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.zinc500,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  titleCard: {
    margin: spacing.md,
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: colors.emeraldAlpha10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  completedBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.emerald500,
  },
  workoutName: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 4,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
  },
  timeText: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginTop: 2,
  },
  additionalStats: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  additionalStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  additionalStatLabel: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  additionalStatValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  notesCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  notesTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.zinc400,
    marginBottom: spacing.xs,
  },
  notesText: {
    fontSize: fontSize.sm,
    color: colors.white,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  exerciseCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
    overflow: "hidden",
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc800,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.emeraldAlpha20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  exerciseNumberText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.emerald500,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: 2,
  },
  exerciseMeta: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
  },
  muscleGroups: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  muscleTag: {
    backgroundColor: colors.whiteAlpha5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  muscleTagText: {
    fontSize: fontSize.xs,
    color: colors.zinc400,
  },
  setsTable: {
    padding: spacing.md,
  },
  setsTableHeader: {
    flexDirection: "row",
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc800,
  },
  setsTableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  setsTableCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  setCellNumber: {
    width: 50,
  },
  setCellWeight: {
    flex: 1,
  },
  setCellReps: {
    width: 60,
  },
  setCellVolume: {
    width: 60,
    justifyContent: "flex-end",
  },
  setNumber: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
  },
  setCellValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  targetText: {
    fontSize: fontSize.xs,
    color: colors.zinc600,
  },
  exerciseSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.zinc800,
  },
  exerciseSummaryLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.zinc400,
  },
  exerciseSummaryValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.emerald500,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});
