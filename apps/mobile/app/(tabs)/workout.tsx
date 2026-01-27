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
import { Play, Clock, Dumbbell, ChevronRight, Calendar } from "@/components/icons";
import { useActiveProgram } from "@/hooks/use-active-program";

function estimateDuration(exerciseCount: number): string {
  // Rough estimate: ~8 min per exercise
  const minMinutes = exerciseCount * 6;
  const maxMinutes = exerciseCount * 10;
  return `${minMinutes}-${maxMinutes} min`;
}

export default function WorkoutScreen() {
  const router = useRouter();
  const { activeProgram, todaysWorkout, isLoading, error } = useActiveProgram();

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
  if (!todaysWorkout) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Today's Workout</Text>
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

  // Get exercises from today's workout
  const exercises = todaysWorkout.workout_exercises || [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Today's Workout</Text>
          <Text style={styles.subtitle}>{activeProgram.name}</Text>
        </View>

        {/* Workout Card */}
        <View style={styles.workoutCard}>
          <Text style={styles.workoutName}>{todaysWorkout.name}</Text>

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

          {/* Start Button */}
          <Pressable
            style={styles.startButton}
            onPress={() =>
              router.push({
                pathname: "/workout/active",
                params: {
                  workoutId: todaysWorkout.id,
                  programId: activeProgram.id,
                },
              })
            }
          >
            <Play size={24} color={colors.black} />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </Pressable>
        </View>

        {/* Exercise List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>

          {exercises.length > 0 ? (
            exercises.map((workoutExercise, index) => {
              const exercise = workoutExercise.exercise;
              const sets = workoutExercise.sets || [];
              const setCount = sets.length;
              const targetReps = sets.length > 0 ? sets[0].target_reps : 0;

              return (
                <Pressable
                  key={workoutExercise.id}
                  style={styles.exerciseCard}
                  onPress={() =>
                    router.push(`/exercise/${workoutExercise.exercise_id}`)
                  }
                >
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseContent}>
                    <Text style={styles.exerciseName}>
                      {exercise?.name || "Unknown Exercise"}
                    </Text>
                    <Text style={styles.exerciseMeta}>
                      {setCount} sets x {targetReps} reps
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.zinc600} />
                </Pressable>
              );
            })
          ) : (
            <View style={styles.emptyExercises}>
              <Text style={styles.emptyExercisesText}>
                No exercises added to this workout yet
              </Text>
            </View>
          )}
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
  },
  workoutName: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.md,
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
