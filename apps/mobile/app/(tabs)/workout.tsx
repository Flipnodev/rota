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
import { Play, Clock, Dumbbell, Calendar, Check } from "@/components/icons";
import { EmptyState, Badge } from "@/components/ui";
import { useActiveProgram } from "@/hooks/use-active-program";

// Helper to get day name from day_of_week (1 = Monday, 7 = Sunday)
function getDayName(dayOfWeek: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayOfWeek % 7] || `Day ${dayOfWeek}`;
}

function estimateDuration(exerciseCount: number): string {
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

  const getNextWorkout = () => {
    if (!workouts || workouts.length === 0) return null;

    const today = new Date();
    const todayDayOfWeek = today.getDay() || 7;

    const sortedWorkouts = [...workouts].sort((a, b) => a.day_of_week - b.day_of_week);

    const nextThisWeek = sortedWorkouts.find(w => w.day_of_week > todayDayOfWeek);
    if (nextThisWeek) {
      return { name: nextThisWeek.name, dayName: getDayName(nextThisWeek.day_of_week) };
    }

    if (sortedWorkouts.length > 0) {
      return { name: sortedWorkouts[0].name, dayName: getDayName(sortedWorkouts[0].day_of_week) };
    }

    return null;
  };

  const nextWorkout = getNextWorkout();
  const isWorkoutCompleted = (workoutId: string) => completedWorkoutIds.includes(workoutId);

  if (isLoading) {
    return (
      <SafeAreaView style={layout.container} edges={["top"]}>
        <View style={layout.centered}>
          <ActivityIndicator size="large" color={colors.emerald500} />
        </View>
      </SafeAreaView>
    );
  }

  // No active program
  if (!activeProgram) {
    return (
      <SafeAreaView style={layout.container} edges={["top"]}>
        <ScrollView style={layout.scroll} showsVerticalScrollIndicator={false}>
          <View style={headerStyles.container}>
            <Text style={typography.pageTitle}>Today's Workout</Text>
            <Text style={typography.subtitle}>No active program</Text>
          </View>

          <EmptyState
            icon={<Dumbbell size={32} color={colors.zinc500} />}
            title="No Active Program"
            description="Start a training program to see your scheduled workouts"
            actionLabel="Browse Programs"
            onAction={() => router.push("/(tabs)/programs")}
          />

          <QuickActions />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Active program but no workout scheduled for today
  if (todaysWorkouts.length === 0) {
    return (
      <SafeAreaView style={layout.container} edges={["top"]}>
        <ScrollView style={layout.scroll} showsVerticalScrollIndicator={false}>
          <View style={headerStyles.container}>
            <Text style={typography.pageTitle}>Rest Day</Text>
            <Text style={typography.subtitle}>{activeProgram.program.name}</Text>
          </View>

          <View style={[card.large, styles.centeredCard]}>
            <View style={styles.largeIconContainer}>
              <Calendar size={32} color={colors.emerald500} />
            </View>
            <Text style={styles.cardTitle}>Rest Day</Text>
            <Text style={styles.cardDescription}>
              No workout scheduled for today. Take time to recover!
            </Text>
          </View>

          <QuickActions />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // All of today's workouts are completed
  if (allTodaysWorkoutsCompleted) {
    const completedCount = todaysWorkouts.length;
    return (
      <SafeAreaView style={layout.container} edges={["top"]}>
        <ScrollView style={layout.scroll} showsVerticalScrollIndicator={false}>
          <View style={headerStyles.container}>
            <Text style={typography.pageTitle}>
              {completedCount > 1 ? "All Done!" : "Workout Complete!"}
            </Text>
            <Text style={typography.subtitle}>{activeProgram.program.name}</Text>
          </View>

          <View style={[card.large, styles.completedCard]}>
            <View style={styles.completedIconContainer}>
              <Check size={40} color={colors.emerald500} />
            </View>
            <Text style={styles.completedTitle}>
              {completedCount > 1 ? "All Workouts Complete!" : "Workout Complete!"}
            </Text>
            <Text style={styles.completedWorkoutName}>
              {todaysWorkouts.map(w => w.name).join(", ")}
            </Text>
            <Text style={styles.cardDescription}>
              Great work! You crushed it today. Rest up and recover.
            </Text>

            {nextWorkout && (
              <View style={styles.nextWorkoutContainer}>
                <Text style={typography.labelUppercase}>Next Workout</Text>
                <View style={[layout.row, layout.gapSm]}>
                  <Calendar size={16} color={colors.zinc400} />
                  <Text style={typography.body}>
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

          <QuickActions />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show today's workouts (one or more)
  return (
    <SafeAreaView style={layout.container} edges={["top"]}>
      <ScrollView style={layout.scroll} showsVerticalScrollIndicator={false}>
        <View style={headerStyles.container}>
          <Text style={typography.pageTitle}>
            {todaysWorkouts.length > 1 ? "Today's Workouts" : "Today's Workout"}
          </Text>
          <Text style={typography.subtitle}>{activeProgram.program.name}</Text>
        </View>

        {todaysWorkouts.map((workout) => {
          const exercises = workout.workout_exercises || [];
          const completed = isWorkoutCompleted(workout.id);

          return (
            <View
              key={workout.id}
              style={[
                card.large,
                styles.workoutCard,
                completed && styles.workoutCardCompleted,
              ]}
            >
              <View style={[layout.rowSpaced, styles.workoutHeader]}>
                <Text style={[styles.workoutName, completed && styles.workoutNameCompleted]}>
                  {workout.name}
                </Text>
                {completed && (
                  <Badge label="DONE" variant="success" icon={<Check size={12} color={colors.black} />} />
                )}
              </View>

              <View style={[layout.row, layout.gapLg, styles.workoutMeta]}>
                <View style={[layout.row, layout.gapXs]}>
                  <Clock size={16} color={colors.zinc400} />
                  <Text style={typography.bodySm}>{estimateDuration(exercises.length)}</Text>
                </View>
                <View style={[layout.row, layout.gapXs]}>
                  <Dumbbell size={16} color={colors.zinc400} />
                  <Text style={typography.bodySm}>{exercises.length} exercises</Text>
                </View>
              </View>

              {completed ? (
                <View style={styles.completedButton}>
                  <Check size={20} color={colors.emerald500} />
                  <Text style={styles.completedButtonText}>Completed</Text>
                </View>
              ) : (
                <Pressable
                  style={button.primary}
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
                  <View style={[layout.rowCentered, layout.gapSm]}>
                    <Play size={24} color={colors.black} />
                    <Text style={button.primaryText}>Start Workout</Text>
                  </View>
                </Pressable>
              )}
            </View>
          );
        })}

        <QuickActions />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickActions() {
  return (
    <View style={styles.section}>
      <Text style={typography.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <Pressable style={[card.base, styles.actionCard]}>
          <Dumbbell size={24} color={colors.zinc400} />
          <Text style={typography.bodySm}>Empty Workout</Text>
        </Pressable>
        <Pressable style={[card.base, styles.actionCard]}>
          <Clock size={24} color={colors.zinc400} />
          <Text style={typography.bodySm}>Rest Day</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredCard: {
    alignItems: "center",
  },
  largeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.emeraldAlpha10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  cardDescription: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    textAlign: "center",
  },
  completedCard: {
    alignItems: "center",
    borderColor: colors.emerald500,
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
  nextWorkoutContainer: {
    backgroundColor: colors.zinc800,
    borderRadius: radius.lg,
    padding: spacing.md,
    width: "100%",
    marginBottom: spacing.md,
    gap: spacing.xs,
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
  workoutCard: {
    marginBottom: spacing.md,
  },
  workoutCardCompleted: {
    opacity: 0.7,
    borderColor: colors.emerald500,
  },
  workoutHeader: {
    marginBottom: spacing.md,
  },
  workoutName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    flex: 1,
  },
  workoutNameCompleted: {
    color: colors.zinc400,
  },
  workoutMeta: {
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
    fontWeight: fontWeight.medium,
    color: colors.emerald500,
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionCard: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
  },
});
