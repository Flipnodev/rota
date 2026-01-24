import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { Play, Clock, Dumbbell, ChevronRight } from "@/components/icons";

const TODAY_WORKOUT = {
  name: "Push Day A",
  programName: "Push Pull Legs",
  estimatedDuration: "45-55 min",
  exercises: [
    { name: "Bench Press", sets: 4, reps: "6-8", weight: "80 kg" },
    { name: "Incline Dumbbell Press", sets: 3, reps: "8-10", weight: "30 kg" },
    { name: "Cable Flyes", sets: 3, reps: "12-15", weight: "15 kg" },
    { name: "Overhead Press", sets: 4, reps: "6-8", weight: "50 kg" },
    { name: "Lateral Raises", sets: 3, reps: "12-15", weight: "10 kg" },
    { name: "Tricep Pushdowns", sets: 3, reps: "10-12", weight: "25 kg" },
  ],
};

export default function WorkoutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Today's Workout</Text>
          <Text style={styles.subtitle}>{TODAY_WORKOUT.programName}</Text>
        </View>

        {/* Workout Card */}
        <View style={styles.workoutCard}>
          <Text style={styles.workoutName}>{TODAY_WORKOUT.name}</Text>

          <View style={styles.workoutMeta}>
            <View style={styles.metaItem}>
              <Clock size={16} color={colors.zinc400} />
              <Text style={styles.metaText}>
                {TODAY_WORKOUT.estimatedDuration}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Dumbbell size={16} color={colors.zinc400} />
              <Text style={styles.metaText}>
                {TODAY_WORKOUT.exercises.length} exercises
              </Text>
            </View>
          </View>

          {/* Start Button */}
          <Pressable
            style={styles.startButton}
            onPress={() => router.push("/workout/active")}
          >
            <Play size={24} color={colors.black} />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </Pressable>
        </View>

        {/* Exercise List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>

          {TODAY_WORKOUT.exercises.map((exercise, index) => (
            <Pressable
              key={index}
              style={styles.exerciseCard}
              onPress={() => router.push(`/exercise/${index}`)}
            >
              <View style={styles.exerciseNumber}>
                <Text style={styles.exerciseNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.sets} sets × {exercise.reps} reps · {exercise.weight}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.zinc600} />
            </Pressable>
          ))}
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
