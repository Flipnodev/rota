import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { X, Check, Clock, ChevronRight } from "@/components/icons";

const WORKOUT = {
  name: "Push Day A",
  exercises: [
    {
      id: "1",
      name: "Bench Press",
      sets: [
        { reps: 8, weight: 80, completed: true },
        { reps: 8, weight: 80, completed: true },
        { reps: 7, weight: 80, completed: false },
        { reps: 6, weight: 80, completed: false },
      ],
    },
    {
      id: "2",
      name: "Incline Dumbbell Press",
      sets: [
        { reps: 10, weight: 30, completed: false },
        { reps: 10, weight: 30, completed: false },
        { reps: 10, weight: 30, completed: false },
      ],
    },
    {
      id: "3",
      name: "Cable Flyes",
      sets: [
        { reps: 15, weight: 15, completed: false },
        { reps: 15, weight: 15, completed: false },
        { reps: 15, weight: 15, completed: false },
      ],
    },
    {
      id: "4",
      name: "Overhead Press",
      sets: [
        { reps: 8, weight: 50, completed: false },
        { reps: 8, weight: 50, completed: false },
        { reps: 8, weight: 50, completed: false },
        { reps: 8, weight: 50, completed: false },
      ],
    },
    {
      id: "5",
      name: "Lateral Raises",
      sets: [
        { reps: 15, weight: 10, completed: false },
        { reps: 15, weight: 10, completed: false },
        { reps: 15, weight: 10, completed: false },
      ],
    },
    {
      id: "6",
      name: "Tricep Pushdowns",
      sets: [
        { reps: 12, weight: 25, completed: false },
        { reps: 12, weight: 25, completed: false },
        { reps: 12, weight: 25, completed: false },
      ],
    },
  ],
};

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState("12:34");

  const currentExercise = WORKOUT.exercises[currentExerciseIndex];

  const handleFinish = () => {
    router.replace("/workout/complete");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={colors.white} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.workoutName}>{WORKOUT.name}</Text>
          <View style={styles.timerContainer}>
            <Clock size={14} color={colors.emerald500} />
            <Text style={styles.timerText}>{elapsedTime}</Text>
          </View>
        </View>
        <Pressable style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </Pressable>
      </View>

      {/* Exercise Navigation */}
      <View style={styles.exerciseNav}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.exerciseNavContent}
        >
          {WORKOUT.exercises.map((exercise, index) => (
            <Pressable
              key={exercise.id}
              style={[
                styles.exerciseNavItem,
                index === currentExerciseIndex && styles.exerciseNavItemActive,
              ]}
              onPress={() => setCurrentExerciseIndex(index)}
            >
              <Text
                style={[
                  styles.exerciseNavText,
                  index === currentExerciseIndex && styles.exerciseNavTextActive,
                ]}
                numberOfLines={1}
              >
                {exercise.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Current Exercise */}
        <View style={styles.currentExercise}>
          <Pressable
            style={styles.exerciseHeader}
            onPress={() => router.push(`/exercise/${currentExercise.id}`)}
          >
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            <ChevronRight size={20} color={colors.zinc500} />
          </Pressable>

          {/* Sets */}
          <View style={styles.setsHeader}>
            <Text style={styles.setsHeaderText}>SET</Text>
            <Text style={styles.setsHeaderText}>PREVIOUS</Text>
            <Text style={styles.setsHeaderText}>KG</Text>
            <Text style={styles.setsHeaderText}>REPS</Text>
            <View style={styles.setsHeaderSpacer} />
          </View>

          {currentExercise.sets.map((set, index) => (
            <View
              key={index}
              style={[
                styles.setRow,
                set.completed && styles.setRowCompleted,
              ]}
            >
              <View style={styles.setNumber}>
                <Text style={styles.setNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.setPrevious}>
                {set.weight} × {set.reps}
              </Text>
              <View style={styles.setInput}>
                <Text style={styles.setInputText}>{set.weight}</Text>
              </View>
              <View style={styles.setInput}>
                <Text style={styles.setInputText}>{set.reps}</Text>
              </View>
              <Pressable
                style={[
                  styles.setCheckButton,
                  set.completed && styles.setCheckButtonCompleted,
                ]}
              >
                <Check
                  size={16}
                  color={set.completed ? colors.black : colors.zinc600}
                />
              </Pressable>
            </View>
          ))}

          {/* Add Set Button */}
          <Pressable style={styles.addSetButton}>
            <Text style={styles.addSetText}>+ Add Set</Text>
          </Pressable>
        </View>

        {/* Rest Timer Placeholder */}
        <View style={styles.restTimerCard}>
          <Clock size={24} color={colors.zinc500} />
          <Text style={styles.restTimerText}>Rest Timer</Text>
          <Text style={styles.restTimerHint}>
            Tap to start a rest timer between sets
          </Text>
        </View>

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
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc900,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.zinc900,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  workoutName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  timerText: {
    fontSize: fontSize.sm,
    color: colors.emerald500,
    fontWeight: fontWeight.medium,
  },
  finishButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.emerald500,
    borderRadius: radius.md,
  },
  finishButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
  exerciseNav: {
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc900,
  },
  exerciseNavContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  exerciseNavItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.zinc900,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  exerciseNavItemActive: {
    backgroundColor: colors.emeraldAlpha20,
    borderColor: colors.emerald500,
  },
  exerciseNavText: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
  },
  exerciseNavTextActive: {
    color: colors.emerald500,
    fontWeight: fontWeight.medium,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  currentExercise: {
    marginTop: spacing.lg,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  exerciseName: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  setsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc800,
    marginBottom: spacing.sm,
  },
  setsHeaderText: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    fontWeight: fontWeight.medium,
    width: 70,
    textAlign: "center",
  },
  setsHeaderSpacer: {
    width: 44,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  setRowCompleted: {
    backgroundColor: colors.emeraldAlpha10,
  },
  setNumber: {
    width: 70,
    alignItems: "center",
  },
  setNumberText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.zinc400,
  },
  setPrevious: {
    width: 70,
    fontSize: fontSize.sm,
    color: colors.zinc500,
    textAlign: "center",
  },
  setInput: {
    width: 70,
    height: 40,
    backgroundColor: colors.zinc900,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  setInputText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  setCheckButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.zinc900,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  setCheckButtonCompleted: {
    backgroundColor: colors.emerald500,
    borderColor: colors.emerald500,
  },
  addSetButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  addSetText: {
    fontSize: fontSize.sm,
    color: colors.emerald500,
    fontWeight: fontWeight.medium,
  },
  restTimerCard: {
    alignItems: "center",
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  restTimerText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginTop: spacing.md,
  },
  restTimerHint: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    marginTop: spacing.xs,
  },
  bottomSpacer: {
    height: spacing["2xl"],
  },
});
