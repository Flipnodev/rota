import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback } from "react";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { X, Check, Clock, ChevronRight } from "@/components/icons";
import {
  useWorkoutSession,
  formatElapsedTime,
  type WorkoutSessionData,
} from "@/hooks/use-workout-session";

interface SetInputState {
  reps: string;
  weight: string;
}

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { workoutId, programId } = useLocalSearchParams<{
    workoutId: string;
    programId?: string;
  }>();

  const {
    workout,
    workoutLogId,
    completedSets,
    elapsedSeconds,
    isLoading,
    isSaving,
    error,
    startSession,
    completeSet,
    uncompleteSet,
    finishWorkout,
    cancelWorkout,
  } = useWorkoutSession();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [setInputs, setSetInputs] = useState<Map<string, SetInputState>>(
    new Map()
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Start session on mount
  useEffect(() => {
    if (workoutId && !isInitialized) {
      setIsInitialized(true);
      startSession(workoutId, programId).then((success) => {
        if (!success) {
          Alert.alert("Error", "Failed to start workout session", [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      });
    }
  }, [workoutId, programId, startSession, isInitialized, router]);

  // Initialize set inputs when workout loads
  useEffect(() => {
    if (workout?.workout_exercises) {
      const newInputs = new Map<string, SetInputState>();
      workout.workout_exercises.forEach((we) => {
        we.sets?.forEach((set) => {
          newInputs.set(set.id, {
            reps: set.target_reps.toString(),
            weight: (set.target_weight || 0).toString(),
          });
        });
      });
      setSetInputs(newInputs);
    }
  }, [workout]);

  const currentExercise = workout?.workout_exercises?.[currentExerciseIndex];

  const handleSetComplete = useCallback(
    async (setId: string, exerciseId: string) => {
      const isCompleted = completedSets.has(setId);

      if (isCompleted) {
        // Uncomplete the set
        await uncompleteSet(setId);
      } else {
        // Complete the set
        const inputs = setInputs.get(setId);
        if (!inputs) return;

        const reps = parseInt(inputs.reps, 10) || 0;
        const weight = parseFloat(inputs.weight) || 0;

        await completeSet({
          exercise_set_id: setId,
          exercise_id: exerciseId,
          actual_reps: reps,
          actual_weight: weight,
        });
      }
    },
    [completedSets, setInputs, completeSet, uncompleteSet]
  );

  const handleInputChange = useCallback(
    (setId: string, field: "reps" | "weight", value: string) => {
      setSetInputs((prev) => {
        const next = new Map(prev);
        const current = next.get(setId) || { reps: "0", weight: "0" };
        next.set(setId, { ...current, [field]: value });
        return next;
      });
    },
    []
  );

  const handleFinish = useCallback(async () => {
    const sessionData = await finishWorkout();
    if (sessionData) {
      // Navigate to complete screen with session data
      router.replace({
        pathname: "/workout/complete",
        params: {
          workoutLogId: sessionData.workoutLogId,
          workoutName: sessionData.workout.name,
          durationSeconds: sessionData.durationSeconds.toString(),
          exerciseCount: (sessionData.workout.workout_exercises?.length || 0).toString(),
          setCount: sessionData.setLogs.length.toString(),
          totalVolume: sessionData.setLogs
            .reduce((sum, log) => sum + log.actual_reps * log.actual_weight, 0)
            .toString(),
        },
      });
    } else {
      Alert.alert("Error", "Failed to complete workout");
    }
  }, [finishWorkout, router]);

  const handleCancel = useCallback(() => {
    Alert.alert(
      "Cancel Workout",
      "Are you sure you want to cancel this workout? Your progress will not be saved.",
      [
        { text: "Continue Workout", style: "cancel" },
        {
          text: "Cancel Workout",
          style: "destructive",
          onPress: async () => {
            await cancelWorkout();
            router.back();
          },
        },
      ]
    );
  }, [cancelWorkout, router]);

  // Loading state
  if (isLoading || !workout || !workoutLogId) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color={colors.white} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.workoutName}>Loading...</Text>
          </View>
          <View style={styles.finishButtonPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.emerald500} />
          <Text style={styles.loadingText}>Starting workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color={colors.white} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.workoutName}>Error</Text>
          </View>
          <View style={styles.finishButtonPlaceholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error.message}</Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const exercises = workout.workout_exercises || [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={handleCancel}>
          <X size={24} color={colors.white} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <View style={styles.timerContainer}>
            <Clock size={14} color={colors.emerald500} />
            <Text style={styles.timerText}>
              {formatElapsedTime(elapsedSeconds)}
            </Text>
          </View>
        </View>
        <Pressable
          style={[styles.finishButton, isSaving && styles.finishButtonDisabled]}
          onPress={handleFinish}
          disabled={isSaving}
        >
          <Text style={styles.finishButtonText}>
            {isSaving ? "..." : "Finish"}
          </Text>
        </Pressable>
      </View>

      {/* Exercise Navigation */}
      <View style={styles.exerciseNav}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.exerciseNavContent}
        >
          {exercises.map((exercise, index) => {
            // Check if all sets for this exercise are completed
            const allSetsCompleted = exercise.sets?.every((set) =>
              completedSets.has(set.id)
            );

            return (
              <Pressable
                key={exercise.id}
                style={[
                  styles.exerciseNavItem,
                  index === currentExerciseIndex && styles.exerciseNavItemActive,
                  allSetsCompleted && styles.exerciseNavItemCompleted,
                ]}
                onPress={() => setCurrentExerciseIndex(index)}
              >
                <Text
                  style={[
                    styles.exerciseNavText,
                    index === currentExerciseIndex &&
                      styles.exerciseNavTextActive,
                    allSetsCompleted && styles.exerciseNavTextCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {exercise.exercise?.name || "Exercise"}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Current Exercise */}
        {currentExercise && (
          <View style={styles.currentExercise}>
            <Pressable
              style={styles.exerciseHeader}
              onPress={() =>
                router.push(`/exercise/${currentExercise.exercise_id}`)
              }
            >
              <Text style={styles.exerciseName}>
                {currentExercise.exercise?.name || "Exercise"}
              </Text>
              <ChevronRight size={20} color={colors.zinc500} />
            </Pressable>

            {/* Sets */}
            <View style={styles.setsHeader}>
              <Text style={styles.setsHeaderText}>SET</Text>
              <Text style={styles.setsHeaderText}>TARGET</Text>
              <Text style={styles.setsHeaderText}>KG</Text>
              <Text style={styles.setsHeaderText}>REPS</Text>
              <View style={styles.setsHeaderSpacer} />
            </View>

            {currentExercise.sets?.map((set, index) => {
              const isCompleted = completedSets.has(set.id);
              const inputs = setInputs.get(set.id) || {
                reps: "0",
                weight: "0",
              };

              return (
                <View
                  key={set.id}
                  style={[styles.setRow, isCompleted && styles.setRowCompleted]}
                >
                  <View style={styles.setNumber}>
                    <Text style={styles.setNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.setPrevious}>
                    {set.target_weight || 0} x {set.target_reps}
                  </Text>
                  <View style={styles.setInput}>
                    <TextInput
                      style={styles.setInputText}
                      value={inputs.weight}
                      onChangeText={(value) =>
                        handleInputChange(set.id, "weight", value)
                      }
                      keyboardType="numeric"
                      editable={!isCompleted}
                      selectTextOnFocus
                    />
                  </View>
                  <View style={styles.setInput}>
                    <TextInput
                      style={styles.setInputText}
                      value={inputs.reps}
                      onChangeText={(value) =>
                        handleInputChange(set.id, "reps", value)
                      }
                      keyboardType="numeric"
                      editable={!isCompleted}
                      selectTextOnFocus
                    />
                  </View>
                  <Pressable
                    style={[
                      styles.setCheckButton,
                      isCompleted && styles.setCheckButtonCompleted,
                    ]}
                    onPress={() =>
                      handleSetComplete(set.id, currentExercise.exercise_id)
                    }
                    disabled={isSaving}
                  >
                    <Check
                      size={16}
                      color={isCompleted ? colors.black : colors.zinc600}
                    />
                  </Pressable>
                </View>
              );
            })}

            {/* Notes */}
            {currentExercise.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{currentExercise.notes}</Text>
              </View>
            )}
          </View>
        )}

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
  finishButtonDisabled: {
    opacity: 0.5,
  },
  finishButtonPlaceholder: {
    width: 80,
    height: 40,
  },
  finishButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.black,
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
  exerciseNavItemCompleted: {
    backgroundColor: colors.emeraldAlpha10,
    borderColor: colors.emerald600,
  },
  exerciseNavText: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
  },
  exerciseNavTextActive: {
    color: colors.emerald500,
    fontWeight: fontWeight.medium,
  },
  exerciseNavTextCompleted: {
    color: colors.emerald400,
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
    textAlign: "center",
    width: "100%",
    height: "100%",
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
  notesContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.zinc900,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  notesLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.zinc400,
    marginBottom: spacing.xs,
  },
  notesText: {
    fontSize: fontSize.sm,
    color: colors.zinc300,
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
