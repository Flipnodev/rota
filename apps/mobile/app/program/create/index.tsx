import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { showAlert, showError } from "@/lib/alert";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  radius,
} from "@/constants/theme";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Trash,
  X,
} from "@/components/icons";
import {
  useProgramEditor,
  type DifficultyLevel,
  type ProgramGoal,
  type WorkoutDraft,
  type ExerciseDraft,
  type ExerciseType,
} from "@/hooks/use-program-editor";
import { useExercises } from "@/hooks/use-exercises";
import { useActiveProgram } from "@/hooks/use-active-program";

type Step = "info" | "workouts" | "exercises" | "review";

const STEPS: Step[] = ["info", "workouts", "exercises", "review"];

const DIFFICULTIES: { id: DifficultyLevel; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const GOALS: { id: ProgramGoal; label: string }[] = [
  { id: "strength", label: "Strength" },
  { id: "hypertrophy", label: "Hypertrophy" },
  { id: "endurance", label: "Endurance" },
  { id: "general", label: "General Fitness" },
];

const DAY_NAMES = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function CreateProgramScreen() {
  const router = useRouter();
  const {
    programDraft,
    isSaving,
    initNewProgram,
    updateProgramInfo,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addExercise,
    updateExercise,
    deleteExercise,
    addSet,
    updateSet,
    deleteSet,
    saveProgram,
    canSave,
    getValidationErrors,
  } = useProgramEditor();

  const { startProgram } = useActiveProgram();

  const [currentStep, setCurrentStep] = useState<Step>("info");
  const [selectedWorkoutIndex, setSelectedWorkoutIndex] = useState<
    number | null
  >(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  // Temporary input values for numeric fields
  const [durationInput, setDurationInput] = useState<string>("");
  const [daysInput, setDaysInput] = useState<string>("");

  // Initialize new program on mount
  useEffect(() => {
    initNewProgram();
  }, [initNewProgram]);

  // Sync input values when draft changes
  useEffect(() => {
    if (programDraft) {
      setDurationInput(String(programDraft.durationWeeks));
      setDaysInput(String(programDraft.daysPerWeek));
    }
  }, [programDraft?.durationWeeks, programDraft?.daysPerWeek]);

  const currentIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentStep === "review";

  const canProceed = () => {
    if (!programDraft) return false;
    switch (currentStep) {
      case "info":
        return (
          programDraft.name.trim().length > 0 &&
          programDraft.daysPerWeek >= 1 &&
          programDraft.daysPerWeek <= 7
        );
      case "workouts":
        return programDraft.workouts.length > 0;
      case "exercises":
        return programDraft.workouts.every((w) => w.exercises.length > 0);
      case "review":
        return canSave();
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (isLastStep) {
      const result = await saveProgram();
      if (result.success && result.programId) {
        // Ask user if they want to activate the program
        showAlert(
          "Program Created",
          "Your program has been saved. Would you like to start it now?",
          [
            {
              text: "Later",
              style: "cancel",
              onPress: () => router.replace(`/program/${result.programId}`),
            },
            {
              text: "Start Now",
              style: "default",
              onPress: async () => {
                const startResult = await startProgram(result.programId!);
                if (startResult.success) {
                  showAlert(
                    "Program Activated",
                    "Your program is now active. Ready to train!",
                    [{ text: "OK", onPress: () => router.replace(`/program/${result.programId}`) }]
                  );
                } else {
                  showError("Error", startResult.error || "Could not activate program");
                  router.replace(`/program/${result.programId}`);
                }
              },
            },
          ]
        );
      } else {
        showError("Error", result.error || "Could not save the program");
      }
    } else {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentIndex - 1]);
    } else {
      router.back();
    }
  };

  const handleAddWorkout = (dayOfWeek: number) => {
    addWorkout(dayOfWeek);
  };

  const handleSelectExercise = (exercise: { id: string; name: string }) => {
    if (selectedWorkoutIndex !== null) {
      addExercise(selectedWorkoutIndex, exercise);
      setShowExercisePicker(false);
    }
  };

  if (!programDraft) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.emerald500} />
      </SafeAreaView>
    );
  }

  const renderInfoStep = () => (
    <ScrollView
      style={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={Keyboard.dismiss}
    >
      <Text style={styles.stepTitle}>Program Info</Text>
      <Text style={styles.stepSubtitle}>
        Give your program a name and choose settings
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Program Name *</Text>
        <TextInput
          style={styles.textInput}
          value={programDraft.name}
          onChangeText={(text) => updateProgramInfo({ name: text })}
          placeholder="E.g. My Strength Program"
          placeholderTextColor={colors.zinc500}
          maxLength={50}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={programDraft.description}
          onChangeText={(text) => updateProgramInfo({ description: text })}
          placeholder="Describe the program (optional)"
          placeholderTextColor={colors.zinc500}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Duration (weeks)</Text>
          <TextInput
            style={styles.textInput}
            value={durationInput}
            onChangeText={(text) => {
              // Only allow numbers
              const cleaned = text.replace(/[^0-9]/g, "");
              setDurationInput(cleaned);
            }}
            onBlur={() => {
              const num = parseInt(durationInput) || 1;
              const clamped = Math.min(12, Math.max(1, num));
              updateProgramInfo({ durationWeeks: clamped });
              setDurationInput(String(clamped));
            }}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Days/week</Text>
          <TextInput
            style={styles.textInput}
            value={daysInput}
            onChangeText={(text) => {
              // Only allow numbers
              const cleaned = text.replace(/[^0-9]/g, "");
              setDaysInput(cleaned);
            }}
            onBlur={() => {
              const num = parseInt(daysInput) || 1;
              const clamped = Math.min(7, Math.max(1, num));
              updateProgramInfo({ daysPerWeek: clamped });
              setDaysInput(String(clamped));
            }}
            keyboardType="numeric"
            maxLength={1}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Difficulty</Text>
        <View style={styles.optionsList}>
          {DIFFICULTIES.map((diff) => (
            <Pressable
              key={diff.id}
              style={[
                styles.optionCard,
                programDraft.difficulty === diff.id && styles.optionCardSelected,
              ]}
              onPress={() => updateProgramInfo({ difficulty: diff.id })}
            >
              <Text
                style={[
                  styles.optionLabel,
                  programDraft.difficulty === diff.id && styles.optionLabelSelected,
                ]}
              >
                {diff.label}
              </Text>
              {programDraft.difficulty === diff.id && (
                <View style={styles.checkCircle}>
                  <Check size={14} color={colors.black} />
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Goal</Text>
        <View style={styles.optionsList}>
          {GOALS.map((goal) => (
            <Pressable
              key={goal.id}
              style={[
                styles.optionCard,
                programDraft.goal === goal.id && styles.optionCardSelected,
              ]}
              onPress={() => updateProgramInfo({ goal: goal.id })}
            >
              <Text
                style={[
                  styles.optionLabel,
                  programDraft.goal === goal.id && styles.optionLabelSelected,
                ]}
              >
                {goal.label}
              </Text>
              {programDraft.goal === goal.id && (
                <View style={styles.checkCircle}>
                  <Check size={14} color={colors.black} />
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderWorkoutsStep = () => (
    <ScrollView
      style={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={Keyboard.dismiss}
    >
      <Text style={styles.stepTitle}>Workouts</Text>
      <Text style={styles.stepSubtitle}>
        Add workouts for each training day ({programDraft.daysPerWeek} days/week)
      </Text>

      <View style={styles.workoutsList}>
        {Array.from({ length: programDraft.daysPerWeek }, (_, i) => i + 1).map(
          (dayOfWeek) => {
            const workout = programDraft.workouts.find(
              (w) => w.dayOfWeek === dayOfWeek
            );
            const workoutIndex = programDraft.workouts.findIndex(
              (w) => w.dayOfWeek === dayOfWeek
            );

            return (
              <View key={dayOfWeek} style={styles.dayContainer}>
                <Text style={styles.dayLabel}>{DAY_NAMES[dayOfWeek]}</Text>
                {workout ? (
                  <View style={styles.workoutCard}>
                    <TextInput
                      style={styles.workoutNameInput}
                      value={workout.name}
                      onChangeText={(text) =>
                        updateWorkout(workoutIndex, { name: text })
                      }
                      placeholder="Workout name"
                      placeholderTextColor={colors.zinc500}
                    />
                    <Text style={styles.exerciseCount}>
                      {workout.exercises.length} exercises
                    </Text>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => deleteWorkout(workoutIndex)}
                    >
                      <Trash size={18} color={colors.error} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    style={styles.addWorkoutButton}
                    onPress={() => handleAddWorkout(dayOfWeek)}
                  >
                    <Plus size={20} color={colors.emerald500} />
                    <Text style={styles.addWorkoutText}>Add workout</Text>
                  </Pressable>
                )}
              </View>
            );
          }
        )}
      </View>
    </ScrollView>
  );

  const renderExercisesStep = () => (
    <ScrollView
      style={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={Keyboard.dismiss}
    >
      <Text style={styles.stepTitle}>Exercises</Text>
      <Text style={styles.stepSubtitle}>
        Add exercises for each workout
      </Text>

      {programDraft.workouts.map((workout, workoutIndex) => (
        <View key={workoutIndex} style={styles.workoutSection}>
          <Text style={styles.workoutSectionTitle}>
            {DAY_NAMES[workout.dayOfWeek]}: {workout.name}
          </Text>

          {workout.exercises.map((exercise, exerciseIndex) => (
            <View key={exerciseIndex} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                <Pressable
                  onPress={() => deleteExercise(workoutIndex, exerciseIndex)}
                >
                  <Trash size={18} color={colors.error} />
                </Pressable>
              </View>

              <View style={styles.setsContainer}>
                {exercise.sets.map((set, setIndex) => (
                  <View key={setIndex} style={styles.setRow}>
                    <Text style={styles.setNumber}>
                      {exercise.exerciseType === "cardio" ? `Round ${set.setNumber}` : `Set ${set.setNumber}`}
                    </Text>
                    <View style={styles.setInputs}>
                      {exercise.exerciseType === "cardio" ? (
                        <>
                          <TextInput
                            style={styles.setInput}
                            value={set.targetDurationSeconds ? String(Math.floor(set.targetDurationSeconds / 60)) : ""}
                            onChangeText={(text) => {
                              const mins = parseInt(text) || 0;
                              updateSet(workoutIndex, exerciseIndex, setIndex, {
                                targetDurationSeconds: mins * 60,
                              });
                            }}
                            keyboardType="numeric"
                            placeholder="Min"
                            placeholderTextColor={colors.zinc500}
                          />
                          <Text style={styles.setLabel}>min</Text>
                          <TextInput
                            style={styles.setInput}
                            value={set.targetDistanceMeters ? String(set.targetDistanceMeters) : ""}
                            onChangeText={(text) => {
                              const meters = parseInt(text) || 0;
                              updateSet(workoutIndex, exerciseIndex, setIndex, {
                                targetDistanceMeters: meters,
                              });
                            }}
                            keyboardType="numeric"
                            placeholder="Dist"
                            placeholderTextColor={colors.zinc500}
                          />
                          <Text style={styles.setLabel}>m</Text>
                        </>
                      ) : (
                        <>
                          <TextInput
                            style={styles.setInput}
                            value={String(set.targetReps)}
                            onChangeText={(text) => {
                              const num = parseInt(text) || 1;
                              updateSet(workoutIndex, exerciseIndex, setIndex, {
                                targetReps: Math.min(100, Math.max(1, num)),
                              });
                            }}
                            keyboardType="numeric"
                            placeholder="Reps"
                            placeholderTextColor={colors.zinc500}
                          />
                          <Text style={styles.setLabel}>reps</Text>
                          <TextInput
                            style={styles.setInput}
                            value={set.targetWeight ? String(set.targetWeight) : ""}
                            onChangeText={(text) => {
                              const num = text ? parseFloat(text) : null;
                              updateSet(workoutIndex, exerciseIndex, setIndex, {
                                targetWeight: num,
                              });
                            }}
                            keyboardType="numeric"
                            placeholder="Weight"
                            placeholderTextColor={colors.zinc500}
                          />
                          <Text style={styles.setLabel}>kg</Text>
                        </>
                      )}
                    </View>
                    {exercise.sets.length > 1 && (
                      <Pressable
                        onPress={() =>
                          deleteSet(workoutIndex, exerciseIndex, setIndex)
                        }
                      >
                        <X size={16} color={colors.zinc500} />
                      </Pressable>
                    )}
                  </View>
                ))}
                <Pressable
                  style={styles.addSetButton}
                  onPress={() => addSet(workoutIndex, exerciseIndex)}
                >
                  <Plus size={16} color={colors.emerald500} />
                  <Text style={styles.addSetText}>
                    {exercise.exerciseType === "cardio" ? "Add round" : "Add set"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}

          <Pressable
            style={styles.addExerciseButton}
            onPress={() => {
              setSelectedWorkoutIndex(workoutIndex);
              setShowExercisePicker(true);
            }}
          >
            <Plus size={20} color={colors.emerald500} />
            <Text style={styles.addExerciseText}>Add exercise</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );

  const renderReviewStep = () => {
    const errors = getValidationErrors();
    return (
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <Text style={styles.stepTitle}>Review</Text>
        <Text style={styles.stepSubtitle}>
          Review your program before saving
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Name</Text>
            <Text style={styles.summaryValue}>{programDraft.name}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>
              {programDraft.durationWeeks} weeks
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Days/week</Text>
            <Text style={styles.summaryValue}>{programDraft.daysPerWeek}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Difficulty</Text>
            <Text style={styles.summaryValue}>
              {DIFFICULTIES.find((d) => d.id === programDraft.difficulty)?.label}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Goal</Text>
            <Text style={styles.summaryValue}>
              {GOALS.find((g) => g.id === programDraft.goal)?.label}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Workouts</Text>
        {programDraft.workouts.map((workout, index) => (
          <View key={index} style={styles.reviewWorkoutCard}>
            <Text style={styles.reviewWorkoutName}>
              {DAY_NAMES[workout.dayOfWeek]}: {workout.name}
            </Text>
            <Text style={styles.reviewExerciseCount}>
              {workout.exercises.length} exercises,{" "}
              {workout.exercises.reduce((sum, e) => sum + e.sets.length, 0)} sets
            </Text>
          </View>
        ))}

        {errors.length > 0 && (
          <View style={styles.errorsContainer}>
            <Text style={styles.errorsTitle}>Missing:</Text>
            {errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                • {error}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "info":
        return renderInfoStep();
      case "workouts":
        return renderWorkoutsStep();
      case "exercises":
        return renderExercisesStep();
      case "review":
        return renderReviewStep();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.headerButton}>
            <ChevronLeft size={24} color={colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>New Program</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Progress Indicator */}
        <Pressable style={styles.progressContainer} onPress={Keyboard.dismiss}>
          {STEPS.map((step, index) => (
            <View
              key={step}
              style={[
                styles.progressDot,
                index <= currentIndex && styles.progressDotActive,
              ]}
            />
          ))}
        </Pressable>

        {/* Content */}
        {renderStepContent()}

        {/* Navigation */}
        <View style={styles.navigation}>
          <Pressable
            style={[
              styles.nextButton,
              (!canProceed() || isSaving) && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canProceed() || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {isLastStep ? "Save Program" : "Next"}
                </Text>
                {!isLastStep && <ChevronRight size={20} color={colors.black} />}
              </>
            )}
          </Pressable>
        </View>

        {/* Exercise Picker Modal */}
        <ExercisePickerModal
          visible={showExercisePicker}
          onSelect={handleSelectExercise}
          onClose={() => setShowExercisePicker(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Exercise Picker Modal Component
function ExercisePickerModal({
  visible,
  onSelect,
  onClose,
}: {
  visible: boolean;
  onSelect: (exercise: { id: string; name: string; type?: ExerciseType }) => void;
  onClose: () => void;
}) {
  const { exercises, isLoading, error } = useExercises();
  const [search, setSearch] = useState("");

  const filteredExercises = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Exercise</Text>
            <Pressable onPress={onClose}>
              <X size={24} color={colors.white} />
            </Pressable>
          </View>

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search for exercise..."
            placeholderTextColor={colors.zinc500}
          />

          {isLoading ? (
            <ActivityIndicator
              color={colors.emerald500}
              style={{ marginTop: spacing.lg }}
            />
          ) : error ? (
            <View style={{ padding: spacing.lg, alignItems: "center" }}>
              <Text style={{ color: colors.error, fontSize: fontSize.base, marginBottom: spacing.sm }}>
                Failed to load exercises
              </Text>
              <Text style={{ color: colors.zinc500, fontSize: fontSize.sm, textAlign: "center" }}>
                {error.message}
              </Text>
            </View>
          ) : filteredExercises.length === 0 ? (
            <View style={{ padding: spacing.lg, alignItems: "center" }}>
              <Text style={{ color: colors.zinc400, fontSize: fontSize.base }}>
                {search ? "No exercises found" : "No exercises available"}
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.exerciseList}>
              {filteredExercises.map((exercise) => (
                <Pressable
                  key={exercise.id}
                  style={styles.exercisePickerItem}
                  onPress={() => onSelect({
                    id: exercise.id,
                    name: exercise.name,
                    type: (exercise.exercise_type as ExerciseType) || "strength",
                  })}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={styles.exercisePickerName}>{exercise.name}</Text>
                    {exercise.exercise_type === "cardio" && (
                      <Text style={{ color: colors.emerald500, fontSize: fontSize.xs }}>CARDIO</Text>
                    )}
                  </View>
                  <Text style={styles.exercisePickerMuscles}>
                    {exercise.muscle_groups?.slice(0, 3).join(", ")}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
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
  },
  headerButton: {
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
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.zinc800,
  },
  progressDotActive: {
    backgroundColor: colors.emerald500,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  stepTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: fontSize.base,
    color: colors.zinc400,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.zinc300,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  rowInputs: {
    flexDirection: "row",
    gap: spacing.md,
  },
  optionsList: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  optionCardSelected: {
    borderColor: colors.emerald500,
    backgroundColor: colors.emeraldAlpha10,
  },
  optionLabel: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  optionLabelSelected: {
    color: colors.emerald500,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.emerald500,
    alignItems: "center",
    justifyContent: "center",
  },
  workoutsList: {
    gap: spacing.md,
  },
  dayContainer: {
    marginBottom: spacing.md,
  },
  dayLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.zinc400,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  workoutCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
    gap: spacing.md,
  },
  workoutNameInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.white,
    padding: 0,
  },
  exerciseCount: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  addWorkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
    borderStyle: "dashed",
    gap: spacing.sm,
  },
  addWorkoutText: {
    fontSize: fontSize.base,
    color: colors.emerald500,
    fontWeight: fontWeight.medium,
  },
  workoutSection: {
    marginBottom: spacing.xl,
  },
  workoutSectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  exerciseCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  exerciseName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  setsContainer: {
    gap: spacing.sm,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  setNumber: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    width: 50,
  },
  setInputs: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  setInput: {
    backgroundColor: colors.zinc800,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.white,
    width: 50,
    textAlign: "center",
  },
  setLabel: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  addSetText: {
    fontSize: fontSize.sm,
    color: colors.emerald500,
  },
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.emerald500,
    borderStyle: "dashed",
    gap: spacing.sm,
  },
  addExerciseText: {
    fontSize: fontSize.base,
    color: colors.emerald500,
    fontWeight: fontWeight.medium,
  },
  summaryCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  summaryValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  reviewWorkoutCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  reviewWorkoutName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  reviewExerciseCount: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    marginTop: spacing.xs,
  },
  errorsContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorsTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  navigation: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emerald500,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.xs,
  },
  nextButtonDisabled: {
    backgroundColor: colors.zinc800,
  },
  nextButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.zinc900,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  searchInput: {
    backgroundColor: colors.zinc800,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.white,
    marginBottom: spacing.md,
  },
  exerciseList: {
    flex: 1,
  },
  exercisePickerItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc800,
  },
  exercisePickerName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  exercisePickerMuscles: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    marginTop: spacing.xs,
  },
});
