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
import { Play, Clock, Dumbbell, ChevronRight, Calendar, Check } from "@/components/icons";
import { useActiveProgram } from "@/hooks/use-active-program";

// Helper to get day name from day_of_week (1 = Monday, 7 = Sunday)
function getDayName(dayOfWeek: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayOfWeek % 7] || `Day ${dayOfWeek}`;
}

function estimateDuration(exerciseCount: number): string {
  // Rough estimate: ~8 min per exercise
  const minMinutes = exerciseCount * 6;
  const maxMinutes = exerciseCount * 10;
  return `${minMinutes}-${maxMinutes} min`;
}

export default function WorkoutScreen() {
  const router = useRouter();
  const {
    activeProgram,
    todaysWorkouts,
    workouts,
    completedWorkoutIds,
    allTodaysWorkoutsCompleted,
    isLoading,
  } = useActiveProgram();

  // Find the next workout (next scheduled day after today)
  const getNextWorkout = () => {
    if (!workouts || workouts.length === 0) return null;

    const today = new Date();
    const todayDayOfWeek = today.getDay() || 7; // 1-7, Mon-Sun

    // Sort workouts by day and find the next one after today
    const sortedWorkouts = [...workouts].sort((a, b) => a.day_of_week - b.day_of_week);

    // First try to find a workout later this week
    const nextThisWeek = sortedWorkouts.find(w => w.day_of_week > todayDayOfWeek);
    if (nextThisWeek) {
      return { name: nextThisWeek.name, dayName: getDayName(nextThisWeek.day_of_week) };
    }

    // Otherwise, wrap around to next week
    if (sortedWorkouts.length > 0) {
      return { name: sortedWorkouts[0].name, dayName: getDayName(sortedWorkouts[0].day_of_week) };
    }

    return null;
  };

  const nextWorkout = getNextWorkout();

  // Check if a specific workout is completed
  const isWorkoutCompleted = (workoutId: string) => completedWorkoutIds.includes(workoutId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.emerald500} />
        </View>
      </SafeAreaView>
    );
  }

  // No active program
  if (!activeProgram) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Today's Workout</Text>
            <Text style={styles.subtitle}>No active program</Text>
          </View>

          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Dumbbell size={32} color={colors.zinc500} />
            </View>
            <Text style={styles.emptyTitle}>No Active Program</Text>
            <Text style={styles.emptyText}>
              Start a training program to see your scheduled workouts
            </Text>
            <Pressable
              style={styles.browseProgramsButton}
              onPress={() => router.push("/(tabs)/programs")}
            >
              <Text style={styles.browseProgramsText}>Browse Programs</Text>
            </Pressable>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <View style={styles.actionsRow}>
              <Pressable style={styles.actionCard}>
                <Dumbbell size={24} color={colors.zinc400} />
                <Text style={styles.actionText}>Empty Workout</Text>
              </Pressable>
              <Pressable style={styles.actionCard}>
                <Clock size={24} color={colors.zinc400} />
                <Text style={styles.actionText}>Rest Day</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Active program but no workout scheduled for today
  if (todaysWorkouts.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Rest Day</Text>
            <Text style={styles.subtitle}>{activeProgram.name}</Text>
          </View>

          <View style={styles.restDayCard}>
            <View style={styles.restDayIconContainer}>
              <Calendar size={32} color={colors.emerald500} />
            </View>
            <Text style={styles.restDayTitle}>Rest Day</Text>
            <Text style={styles.restDayText}>
              No workout scheduled for today. Take time to recover!
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <View style={styles.actionsRow}>
              <Pressable style={styles.actionCard}>
                <Dumbbell size={24} color={colors.zinc400} />
                <Text style={styles.actionText}>Empty Workout</Text>
              </Pressable>
              <Pressable style={styles.actionCard}>
                <Clock size={24} color={colors.zinc400} />
                <Text style={styles.actionText}>Log Rest Day</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // All of today's workouts are completed
  if (allTodaysWorkoutsCompleted) {
    const completedCount = todaysWorkouts.length;
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {completedCount > 1 ? "All Done!" : "Workout Complete!"}
            </Text>
            <Text style={styles.subtitle}>{activeProgram.name}</Text>
          </View>

          <View style={styles.completedCard}>
            <View style={styles.completedIconContainer}>
              <Check size={40} color={colors.emerald500} />
            </View>
            <Text style={styles.completedTitle}>
              {completedCount > 1 ? "All Workouts Complete!" : "Workout Complete!"}
            </Text>
            <Text style={styles.completedWorkoutName}>
              {todaysWorkouts.map(w => w.name).join(", ")}
            </Text>
            <Text style={styles.completedText}>
              Great work! You crushed it today. Rest up and recover.
            </Text>

            {nextWorkout && (
              <View style={styles.nextWorkoutContainer}>
                <Text style={styles.nextWorkoutLabel}>Next Workout</Text>
                <View style={styles.nextWorkoutInfo}>
                  <Calendar size={16} color={colors.zinc400} />
                  <Text style={styles.nextWorkoutText}>
                    {nextWorkout.dayName}: {nextWorkout.name}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.motivationalBadge}>
              <Check size={16} color={colors.emerald500} />
              <Text style={styles.motivationalText}>Keep up the good work!</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <View style={styles.actionsRow}>
              <Pressable style={styles.actionCard}>
                <Dumbbell size={24} color={colors.zinc400} />
                <Text style={styles.actionText}>Empty Workout</Text>
              </Pressable>
              <Pressable style={styles.actionCard}>
                <Clock size={24} color={colors.zinc400} />
                <Text style={styles.actionText}>View History</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show today's workouts (one or more)
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {todaysWorkouts.length > 1 ? "Today's Workouts" : "Today's Workout"}
          </Text>
          <Text style={styles.subtitle}>{activeProgram.name}</Text>
        </View>

        {/* Workout Cards */}
        {todaysWorkouts.map((workout) => {
          const exercises = workout.workout_exercises || [];
          const completed = isWorkoutCompleted(workout.id);

          return (
            <View
              key={workout.id}
              style={[
                styles.workoutCard,
                completed && styles.workoutCardCompleted,
              ]}
            >
              <View style={styles.workoutHeader}>
                <Text style={[styles.workoutName, completed && styles.workoutNameCompleted]}>
                  {workout.name}
                </Text>
                {completed && (
                  <View style={styles.completedBadge}>
                    <Check size={12} color={colors.black} />
                    <Text style={styles.completedBadgeText}>DONE</Text>
                  </View>
                )}
              </View>

              <View style={styles.workoutMeta}>
                <View style={styles.metaItem}>
                  <Clock size={16} color={colors.zinc400} />
                  <Text style={styles.metaText}>
                    {estimateDuration(exercises.length)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Dumbbell size={16} color={colors.zinc400} />
                  <Text style={styles.metaText}>{exercises.length} exercises</Text>
                </View>
              </View>

              {/* Start Button or Completed Message */}
              {completed ? (
                <View style={styles.completedWorkoutButton}>
                  <Check size={20} color={colors.emerald500} />
                  <Text style={styles.completedWorkoutButtonText}>Completed</Text>
                </View>
              ) : (
                <Pressable
                  style={styles.startButton}
                  onPress={() =>
                    router.push({
                      pathname: "/workout/active",
                      params: {
                        workoutId: workout.id,
                        programId: activeProgram.program.id,
                      },
                    })
                  }
                >
                  <Play size={24} color={colors.black} />
                  <Text style={styles.startButtonText}>Start Workout</Text>
                </Pressable>
              )}
            </View>
          );
        })}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsRow}>
            <Pressable style={styles.actionCard}>
              <Dumbbell size={24} color={colors.zinc400} />
              <Text style={styles.actionText}>Empty Workout</Text>
            </Pressable>
            <Pressable style={styles.actionCard}>
              <Clock size={24} color={colors.zinc400} />
              <Text style={styles.actionText}>Rest Day</Text>
            </Pressable>
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
  title: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.zinc400,
  },
  workoutCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
    marginBottom: spacing.md,
  },
  workoutCardCompleted: {
    opacity: 0.7,
    borderColor: colors.emerald500,
  },
  workoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  workoutName: {
    fontSize: fontSize["xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    flex: 1,
  },
  workoutNameCompleted: {
    color: colors.zinc400,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.emerald500,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    gap: 4,
  },
  completedBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.black,
  },
  completedWorkoutButton: {
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
  completedWorkoutButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.emerald500,
  },
  workoutMeta: {
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
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
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
  emptyCard: {
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
  restDayCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.zinc800,
    alignItems: "center",
  },
  restDayIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.emeraldAlpha10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  restDayTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  restDayText: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    textAlign: "center",
  },
  completedCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.emerald500,
    alignItems: "center",
  },
  completedIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.emeraldAlpha10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  completedTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  completedWorkoutName: {
    fontSize: fontSize.base,
    color: colors.emerald500,
    marginBottom: spacing.md,
  },
  completedText: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  nextWorkoutContainer: {
    backgroundColor: colors.zinc800,
    borderRadius: radius.lg,
    padding: spacing.md,
    width: "100%",
    marginBottom: spacing.md,
  },
  nextWorkoutLabel: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nextWorkoutInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  nextWorkoutText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
  motivationalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.emeraldAlpha10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  motivationalText: {
    fontSize: fontSize.sm,
    color: colors.emerald500,
    fontWeight: fontWeight.medium,
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.whiteAlpha5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  exerciseNumberText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.zinc400,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
    marginBottom: 2,
  },
  exerciseMeta: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  emptyExercises: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  emptyExercisesText: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.zinc800,
    gap: spacing.sm,
  },
  actionText: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
  },
});
