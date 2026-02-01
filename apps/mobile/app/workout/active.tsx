import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback, useRef } from "react";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { X, Check, Clock, ChevronRight, Pause, Play } from "@/components/icons";
import {
  useWorkoutSession,
  formatElapsedTime,
  type WorkoutSessionData,
} from "@/hooks/use-workout-session";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";
import { showAlert, showError } from "@/lib/alert";

function formatRestTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

type ExerciseType = "strength" | "cardio" | "flexibility" | "other";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

interface SetInputState {
  reps: string;
  weight: string;
  durationMinutes: string;
  distanceMeters: string;
}

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const { workoutId, programId, templateProgramId } = useLocalSearchParams<{
    workoutId: string;
    programId?: string;
    templateProgramId?: string;
  }>();

  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [checkingCompletion, setCheckingCompletion] = useState(true);
  const [completedWorkoutName, setCompletedWorkoutName] = useState<string>("");
  const [nextWorkoutInfo, setNextWorkoutInfo] = useState<{ name: string; dayName: string } | null>(null);

  const {
    workout,
    workoutLogId,
    completedSets,
    elapsedSeconds,
    isLoading,
    isSaving,
    error,
    isPaused,
    restSeconds,
    isResting,
    isTimerRunning,
    isWorkoutStarted,
    loadWorkout,
    beginWorkout,
    completeSet,
    uncompleteSet,
    finishWorkout,
    cancelWorkout,
    togglePause,
    startRestTimer,
    stopRestTimer,
  } = useWorkoutSession();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [setInputs, setSetInputs] = useState<Map<string, SetInputState>>(
    new Map()
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPromptedFinish, setHasPromptedFinish] = useState(false);
  const [lastWeights, setLastWeights] = useState<Map<string, number>>(new Map());
  const lastWeightsFetched = useRef(false);

  // Check if this workout was already completed today
  useEffect(() => {
    const checkCompletion = async () => {
      if (!workoutId || !user?.id) {
        setCheckingCompletion(false);
        return;
      }

      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

        const { data } = await supabase
          .from("workout_logs")
          .select("id")
          .eq("user_id", user.id)
          .eq("workout_id", workoutId)
          .not("completed_at", "is", null)
          .gte("started_at", startOfDay)
          .limit(1);

        if (data && data.length > 0) {
          setIsAlreadyCompleted(true);

          // Fetch workout name and next workout info
          const { data: workoutData } = await supabase
            .from("workouts")
            .select("name, day_of_week, program_id")
            .eq("id", workoutId)
            .single();

          if (workoutData) {
            setCompletedWorkoutName(workoutData.name);

            // Find next workout in the program
            if (workoutData.program_id) {
              const { data: programWorkouts } = await supabase
                .from("workouts")
                .select("name, day_of_week")
                .eq("program_id", workoutData.program_id)
                .eq("week_number", 1)
                .order("day_of_week", { ascending: true });

              if (programWorkouts && programWorkouts.length > 0) {
                const todayDayOfWeek = today.getDay() || 7;
                // Find next workout after today
                const nextWorkout = programWorkouts.find(
                  (w: { day_of_week: number }) => w.day_of_week > todayDayOfWeek
                ) || programWorkouts[0]; // Wrap to first workout of week

                if (nextWorkout) {
                  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                  const dayName = days[nextWorkout.day_of_week % 7] || `Day ${nextWorkout.day_of_week}`;
                  setNextWorkoutInfo({ name: nextWorkout.name, dayName });
                }
              }
            }
          }
        }
      } catch (err) {
        // Ignore errors, just proceed
      } finally {
        setCheckingCompletion(false);
      }
    };

    checkCompletion();
  }, [workoutId, user?.id, supabase]);

  // Load workout data on mount (does NOT create workout log yet)
  useEffect(() => {
    if (workoutId && !isInitialized && !checkingCompletion && !isAlreadyCompleted) {
      setIsInitialized(true);
      loadWorkout(workoutId, programId, templateProgramId).then((success) => {
        if (!success) {
          showAlert("Error", "Failed to load workout", [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      });
    }
  }, [workoutId, programId, templateProgramId, loadWorkout, isInitialized, checkingCompletion, isAlreadyCompleted, router]);

  // Fetch user's last weights for each exercise
  useEffect(() => {
    const fetchLastWeights = async () => {
      if (!workout?.workout_exercises || !user?.id || lastWeightsFetched.current) {
        return;
      }

      lastWeightsFetched.current = true;

      // Get unique exercise IDs from this workout
      const exerciseIds = workout.workout_exercises
        .map((we) => we.exercise_id)
        .filter((id, index, arr) => arr.indexOf(id) === index);

      if (exerciseIds.length === 0) return;

      try {
        // Fetch the most recent set_log for each exercise (through workout_logs for user filtering)
        const { data } = await supabase
          .from("set_logs")
          .select(`
            exercise_id,
            actual_weight,
            workout_log:workout_logs!inner(user_id)
          `)
          .eq("workout_log.user_id", user.id)
          .in("exercise_id", exerciseIds)
          .gt("actual_weight", 0)
          .order("completed_at", { ascending: false });

        if (data && data.length > 0) {
          const weights = new Map<string, number>();
          // Use the first (most recent) weight for each exercise
          data.forEach((log) => {
            if (!weights.has(log.exercise_id)) {
              weights.set(log.exercise_id, log.actual_weight);
            }
          });
          setLastWeights(weights);
        }
      } catch (err) {
        // Silently fail - user will just see 0 or target weight
        console.log("Failed to fetch last weights:", err);
      }
    };

    fetchLastWeights();
  }, [workout, user?.id, supabase]);

  // Initialize set inputs when workout loads (uses lastWeights if available)
  useEffect(() => {
    if (workout?.workout_exercises) {
      const newInputs = new Map<string, SetInputState>();
      workout.workout_exercises.forEach((we) => {
        // Get last weight for this exercise (if user has done it before)
        const lastWeight = lastWeights.get(we.exercise_id);

        we.sets?.forEach((set) => {
          // Priority: target_weight > lastWeight > 0
          const weight = set.target_weight ?? lastWeight ?? 0;
          const durationMins = set.target_duration_seconds ? Math.floor(set.target_duration_seconds / 60) : 0;
          const distanceM = set.target_distance_meters ?? 0;
          newInputs.set(set.id, {
            reps: set.target_reps.toString(),
            weight: weight.toString(),
            durationMinutes: durationMins.toString(),
            distanceMeters: distanceM.toString(),
          });
        });
      });
      setSetInputs(newInputs);
    }
  }, [workout, lastWeights]);

  const exercises = workout?.workout_exercises || [];
  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;

  // Check if current exercise has all sets completed
  const isCurrentExerciseComplete = currentExercise?.sets?.every((set) =>
    completedSets.has(set.id)
  ) ?? false;

  // Check if entire workout is complete (all sets of all exercises)
  const isWorkoutComplete = exercises.every((ex) =>
    ex.sets?.every((set) => completedSets.has(set.id))
  );

  const handleSetComplete = useCallback(
    async (setId: string, exerciseId: string, exerciseType: ExerciseType, restSeconds?: number) => {
      const isCompleted = completedSets.has(setId);

      if (isCompleted) {
        // Uncomplete the set
        await uncompleteSet(setId);
      } else {
        // Complete the set
        const inputs = setInputs.get(setId);
        if (!inputs) return;

        const isCardio = exerciseType === "cardio";
        const reps = parseInt(inputs.reps, 10) || (isCardio ? 1 : 0);
        const weight = parseFloat(inputs.weight) || 0;
        const durationSeconds = isCardio ? (parseInt(inputs.durationMinutes, 10) || 0) * 60 : null;
        const distanceMeters = isCardio ? parseInt(inputs.distanceMeters, 10) || 0 : null;

        const success = await completeSet({
          exercise_set_id: setId,
          exercise_id: exerciseId,
          actual_reps: reps,
          actual_weight: weight,
          actual_duration_seconds: durationSeconds,
          actual_distance_meters: distanceMeters,
        });

        // Start rest timer if set completed successfully and rest time is specified
        if (success && restSeconds && restSeconds > 0) {
          startRestTimer(restSeconds);
        }
      }
    },
    [completedSets, setInputs, completeSet, uncompleteSet, startRestTimer]
  );

  const handleInputChange = useCallback(
    (setId: string, field: "reps" | "weight" | "durationMinutes" | "distanceMeters", value: string) => {
      setSetInputs((prev) => {
        const next = new Map(prev);
        const current = next.get(setId) || { reps: "0", weight: "0", durationMinutes: "0", distanceMeters: "0" };
        next.set(setId, { ...current, [field]: value });
        return next;
      });
    },
    []
  );

  const doFinishWorkout = useCallback(async () => {
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
      showError("Error", "Failed to complete workout");
    }
  }, [finishWorkout, router]);

  const handleFinishPrompt = useCallback(() => {
    const completedCount = completedSets.size;
    const totalSets = exercises.reduce(
      (sum, ex) => sum + (ex.sets?.length || 0),
      0
    );

    showAlert(
      "Finish Workout?",
      `You've completed ${completedCount} of ${totalSets} sets.\n\nTime: ${formatElapsedTime(elapsedSeconds)}`,
      [
        { text: "Continue Workout", style: "cancel" },
        {
          text: "Finish",
          style: "default",
          onPress: doFinishWorkout,
        },
      ]
    );
  }, [completedSets, exercises, elapsedSeconds, doFinishWorkout]);

  const handleNextExercise = useCallback(() => {
    if (isLastExercise) {
      handleFinishPrompt();
    } else {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  }, [isLastExercise, handleFinishPrompt]);

  // Auto-advance to next exercise when current one is complete
  useEffect(() => {
    if (isCurrentExerciseComplete && !isLastExercise && isWorkoutStarted) {
      // Small delay to let user see the completion state
      const timeout = setTimeout(() => {
        setCurrentExerciseIndex((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isCurrentExerciseComplete, isLastExercise, isWorkoutStarted]);

  // Auto-prompt finish when last exercise is complete (only once)
  useEffect(() => {
    if (isWorkoutComplete && isWorkoutStarted && exercises.length > 0 && !hasPromptedFinish) {
      setHasPromptedFinish(true);
      handleFinishPrompt();
    }
  }, [isWorkoutComplete, isWorkoutStarted, exercises.length, hasPromptedFinish, handleFinishPrompt]);

  const handleCancel = useCallback(() => {
    showAlert(
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

  // Already completed state
  if (isAlreadyCompleted) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color={colors.white} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.workoutName}>Complete</Text>
          </View>
          <View style={styles.finishButtonPlaceholder} />
        </View>
        <View style={styles.alreadyCompletedContainer}>
          <View style={styles.alreadyCompletedIcon}>
            <Check size={48} color={colors.emerald500} />
          </View>
          <Text style={styles.alreadyCompletedTitle}>
            {completedWorkoutName || "Workout"} Complete!
          </Text>
          <Text style={styles.alreadyCompletedText}>
            Great work! You've already completed this workout today.
          </Text>
          {nextWorkoutInfo && (
            <View style={styles.nextWorkoutCard}>
              <Text style={styles.nextWorkoutLabel}>NEXT WORKOUT</Text>
              <Text style={styles.nextWorkoutName}>{nextWorkoutInfo.name}</Text>
              <Text style={styles.nextWorkoutDay}>{nextWorkoutInfo.dayName}</Text>
            </View>
          )}
          <Pressable style={styles.goBackButton} onPress={() => router.back()}>
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (isLoading || checkingCompletion || !workout) {
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
          <Text style={styles.loadingText}>Loading workout...</Text>
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

  // Show "Start Workout" screen if workout hasn't started yet
  if (!isWorkoutStarted) {
    const handleStartWorkout = async () => {
      const success = await beginWorkout();
      if (!success) {
        showError("Error", "Failed to start workout. Please try again.");
      }
    };

    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color={colors.white} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.workoutName}>{workout.name}</Text>
          </View>
          <View style={styles.finishButtonPlaceholder} />
        </View>

        <View style={styles.startWorkoutContainer}>
          <Text style={styles.startWorkoutTitle}>Ready to start?</Text>
          <Text style={styles.startWorkoutSubtitle}>
            {exercises.length} exercises • {exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0)} sets
          </Text>

          <View style={styles.exercisePreviewList}>
            {exercises.map((ex, index) => (
              <View key={ex.id} style={styles.exercisePreviewItem}>
                <Text style={styles.exercisePreviewNumber}>{index + 1}</Text>
                <Text style={styles.exercisePreviewName}>
                  {ex.exercise?.name || "Exercise"}
                </Text>
                <Text style={styles.exercisePreviewSets}>
                  {ex.sets?.length || 0} sets
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            style={[styles.startWorkoutButton, isSaving && styles.startWorkoutButtonDisabled]}
            onPress={handleStartWorkout}
            disabled={isSaving}
          >
            <Play size={24} color={colors.black} />
            <Text style={styles.startWorkoutButtonText}>
              {isSaving ? "Starting..." : "Start Workout"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={handleCancel}>
          <X size={24} color={colors.white} />
        </Pressable>
        <Pressable style={styles.headerCenter} onPress={togglePause}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <View style={[styles.timerContainer, isPaused && styles.timerPaused]}>
            {isPaused ? (
              <Play size={14} color={colors.amber500} />
            ) : (
              <Clock size={14} color={colors.emerald500} />
            )}
            <Text style={[styles.timerText, isPaused && styles.timerTextPaused]}>
              {formatElapsedTime(elapsedSeconds)}
            </Text>
            {isPaused && (
              <Text style={styles.pausedLabel}>PAUSED</Text>
            )}
          </View>
        </Pressable>
        <Pressable
          style={[styles.nextButton, isSaving && styles.nextButtonDisabled]}
          onPress={handleNextExercise}
          disabled={isSaving}
        >
          <Text style={styles.nextButtonText}>
            {isSaving ? "..." : isLastExercise ? "Finish" : "Next"}
          </Text>
          {!isLastExercise && <ChevronRight size={16} color={colors.black} />}
        </Pressable>
      </View>

      {/* Progress Bar */}
      {(() => {
        const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
        const completedCount = completedSets.size;
        const progress = totalSets > 0 ? completedCount / totalSets : 0;
        return (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            <Text style={styles.progressText}>
              {completedCount}/{totalSets} sets • Exercise {currentExerciseIndex + 1}/{exercises.length}
            </Text>
          </View>
        );
      })()}

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
            {(() => {
              const exerciseType = (currentExercise.exercise?.exercise_type as ExerciseType) || "strength";
              const isCardio = exerciseType === "cardio";

              return (
                <>
                  <View style={styles.setsHeader}>
                    <Text style={styles.setsHeaderText}>{isCardio ? "ROUND" : "SET"}</Text>
                    <Text style={styles.setsHeaderText}>TARGET</Text>
                    {isCardio ? (
                      <>
                        <Text style={styles.setsHeaderText}>MIN</Text>
                        <Text style={styles.setsHeaderText}>DIST</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.setsHeaderText}>KG</Text>
                        <Text style={styles.setsHeaderText}>REPS</Text>
                      </>
                    )}
                    <View style={styles.setsHeaderSpacer} />
                  </View>

                  {currentExercise.sets?.map((set, index) => {
                    const isCompleted = completedSets.has(set.id);
                    const inputs = setInputs.get(set.id) || {
                      reps: "0",
                      weight: "0",
                      durationMinutes: "0",
                      distanceMeters: "0",
                    };

                    // Format target display based on exercise type
                    const targetDisplay = isCardio
                      ? `${formatDuration(set.target_duration_seconds || 0)}`
                      : `${set.target_weight || 0} x ${set.target_reps}`;

                    return (
                      <View
                        key={set.id}
                        style={[styles.setRow, isCompleted && styles.setRowCompleted]}
                      >
                        <View style={styles.setNumber}>
                          <Text style={styles.setNumberText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.setPrevious}>{targetDisplay}</Text>
                        {isCardio ? (
                          <>
                            <View style={styles.setInput}>
                              <TextInput
                                style={styles.setInputText}
                                value={inputs.durationMinutes}
                                onChangeText={(value) =>
                                  handleInputChange(set.id, "durationMinutes", value)
                                }
                                keyboardType="numeric"
                                editable={!isCompleted}
                                selectTextOnFocus
                              />
                            </View>
                            <View style={styles.setInput}>
                              <TextInput
                                style={styles.setInputText}
                                value={inputs.distanceMeters}
                                onChangeText={(value) =>
                                  handleInputChange(set.id, "distanceMeters", value)
                                }
                                keyboardType="numeric"
                                editable={!isCompleted}
                                selectTextOnFocus
                              />
                            </View>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
                        <Pressable
                          style={[
                            styles.setCheckButton,
                            isCompleted && styles.setCheckButtonCompleted,
                          ]}
                          onPress={() =>
                            handleSetComplete(set.id, currentExercise.exercise_id, exerciseType, set.rest_seconds ?? undefined)
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
                </>
              );
            })()}

            {/* Notes */}
            {currentExercise.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{currentExercise.notes}</Text>
              </View>
            )}
          </View>
        )}

        {/* Rest Timer */}
        {isResting ? (
          <Pressable style={styles.restTimerCardActive} onPress={stopRestTimer}>
            <Text style={styles.restTimerCountdown}>{formatRestTime(restSeconds)}</Text>
            <Text style={styles.restTimerLabel}>REST</Text>
            <Text style={styles.restTimerHint}>Tap to skip</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.restTimerCard}
            onPress={() => startRestTimer(60)}
          >
            <Clock size={24} color={colors.zinc500} />
            <Text style={styles.restTimerText}>Rest Timer</Text>
            <Text style={styles.restTimerHint}>
              Tap for 60s rest or complete a set
            </Text>
          </Pressable>
        )}

        {/* Finish Workout Button */}
        <Pressable
          style={styles.finishWorkoutButton}
          onPress={handleFinishPrompt}
        >
          <Text style={styles.finishWorkoutButtonText}>Finish Workout</Text>
        </Pressable>

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
  timerPaused: {
    backgroundColor: colors.amber500 + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  timerTextPaused: {
    color: colors.amber500,
  },
  pausedLabel: {
    fontSize: fontSize.xs,
    color: colors.amber500,
    fontWeight: fontWeight.bold,
    marginLeft: spacing.xs,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.emerald500,
    borderRadius: radius.md,
    gap: 4,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  finishButtonPlaceholder: {
    width: 80,
    height: 40,
  },
  nextButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
  startWorkoutContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  startWorkoutTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: "center",
  },
  startWorkoutSubtitle: {
    fontSize: fontSize.base,
    color: colors.zinc400,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  exercisePreviewList: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  exercisePreviewItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  exercisePreviewNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.emerald500,
    width: 24,
  },
  exercisePreviewName: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.white,
  },
  exercisePreviewSets: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  startWorkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emerald500,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  startWorkoutButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.black,
  },
  startWorkoutButtonDisabled: {
    opacity: 0.6,
  },
  alreadyCompletedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  alreadyCompletedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.emeraldAlpha20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  alreadyCompletedTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  alreadyCompletedText: {
    fontSize: fontSize.base,
    color: colors.zinc400,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  nextWorkoutCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.zinc800,
    width: "100%",
  },
  nextWorkoutLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.zinc500,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  nextWorkoutName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  nextWorkoutDay: {
    fontSize: fontSize.base,
    color: colors.emerald500,
    fontWeight: fontWeight.medium,
  },
  goBackButton: {
    backgroundColor: colors.emerald500,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  goBackButtonText: {
    fontSize: fontSize.base,
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
  progressContainer: {
    height: 24,
    backgroundColor: colors.zinc900,
    position: "relative",
    justifyContent: "center",
  },
  progressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.emerald500 + "40",
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.zinc400,
    textAlign: "center",
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
  restTimerCardActive: {
    alignItems: "center",
    backgroundColor: colors.emerald500 + "20",
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.xl,
    borderWidth: 2,
    borderColor: colors.emerald500,
  },
  restTimerCountdown: {
    fontSize: 48,
    fontWeight: fontWeight.bold,
    color: colors.emerald500,
    fontVariant: ["tabular-nums"],
  },
  restTimerLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.emerald400,
    marginTop: spacing.xs,
    letterSpacing: 2,
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
  finishWorkoutButton: {
    alignItems: "center",
    backgroundColor: colors.error + "20",
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  finishWorkoutButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.error,
  },
  bottomSpacer: {
    height: spacing["2xl"],
  },
});
