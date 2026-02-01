import { useState, useCallback } from "react";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";

// Types for draft state
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type ProgramGoal = "strength" | "hypertrophy" | "endurance" | "general";
export type EquipmentType =
  | "barbell"
  | "dumbbell"
  | "kettlebell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "resistance_band"
  | "bench"
  | "pull_up_bar"
  | "none";

export type ExerciseType = "strength" | "cardio" | "flexibility" | "other";

export interface SetDraft {
  id?: string;
  setNumber: number;
  targetReps: number;
  targetWeight: number | null;
  targetDurationSeconds: number | null;
  targetDistanceMeters: number | null;
  restSeconds: number;
}

export interface ExerciseDraft {
  id?: string;
  exerciseId: string;
  exerciseName: string;
  exerciseType: ExerciseType;
  sortOrder: number;
  notes: string | null;
  sets: SetDraft[];
}

export interface WorkoutDraft {
  id?: string;
  name: string;
  dayOfWeek: number;
  weekNumber: number;
  exercises: ExerciseDraft[];
}

export interface ProgramDraft {
  id?: string;
  name: string;
  description: string;
  durationWeeks: number;
  daysPerWeek: number;
  difficulty: DifficultyLevel;
  goal: ProgramGoal;
  equipment: EquipmentType[];
  workouts: WorkoutDraft[];
}

interface SaveResult {
  success: boolean;
  programId?: string;
  error?: string;
}

interface UseProgramEditorReturn {
  // State
  programDraft: ProgramDraft | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;

  // Program actions
  initNewProgram: () => void;
  loadProgram: (programId: string) => Promise<void>;
  updateProgramInfo: (updates: Partial<Omit<ProgramDraft, "workouts">>) => void;

  // Workout actions
  addWorkout: (dayOfWeek: number, name?: string) => void;
  updateWorkout: (index: number, updates: Partial<WorkoutDraft>) => void;
  deleteWorkout: (index: number) => void;
  reorderWorkouts: (workouts: WorkoutDraft[]) => void;

  // Exercise actions (within a workout)
  addExercise: (
    workoutIndex: number,
    exercise: { id: string; name: string }
  ) => void;
  updateExercise: (
    workoutIndex: number,
    exerciseIndex: number,
    updates: Partial<ExerciseDraft>
  ) => void;
  deleteExercise: (workoutIndex: number, exerciseIndex: number) => void;
  reorderExercises: (workoutIndex: number, exercises: ExerciseDraft[]) => void;

  // Set actions (within an exercise)
  addSet: (workoutIndex: number, exerciseIndex: number) => void;
  updateSet: (
    workoutIndex: number,
    exerciseIndex: number,
    setIndex: number,
    updates: Partial<SetDraft>
  ) => void;
  deleteSet: (
    workoutIndex: number,
    exerciseIndex: number,
    setIndex: number
  ) => void;

  // Save/Delete
  saveProgram: () => Promise<SaveResult>;
  deleteProgram: () => Promise<SaveResult>;

  // Validation
  canSave: () => boolean;
  getValidationErrors: () => string[];
}

const DEFAULT_PROGRAM: ProgramDraft = {
  name: "",
  description: "",
  durationWeeks: 4,
  daysPerWeek: 3,
  difficulty: "intermediate",
  goal: "general",
  equipment: [],
  workouts: [],
};

const DEFAULT_SET: Omit<SetDraft, "setNumber"> = {
  targetReps: 10,
  targetWeight: null,
  targetDurationSeconds: null,
  targetDistanceMeters: null,
  restSeconds: 60,
};

export function useProgramEditor(): UseProgramEditorReturn {
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const [programDraft, setProgramDraft] = useState<ProgramDraft | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize a new empty program
  const initNewProgram = useCallback(() => {
    setProgramDraft({ ...DEFAULT_PROGRAM });
    setError(null);
  }, []);

  // Load an existing program for editing
  const loadProgram = useCallback(
    async (programId: string) => {
      if (!user?.id) {
        setError(new Error("Not authenticated"));
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch program with workouts, exercises, and sets
        const { data: program, error: programError } = await supabase
          .from("programs")
          .select(
            `
            *,
            workouts(
              *,
              workout_exercises(
                *,
                exercise:exercises(*),
                exercise_sets(*)
              )
            )
          `
          )
          .eq("id", programId)
          .eq("user_id", user.id)
          .single();

        if (programError) throw new Error(programError.message);
        if (!program) throw new Error("Program not found");

        // Transform to draft format
        const draft: ProgramDraft = {
          id: program.id,
          name: program.name,
          description: program.description || "",
          durationWeeks: program.duration_weeks,
          daysPerWeek: program.days_per_week,
          difficulty: program.difficulty as DifficultyLevel,
          goal: program.goal as ProgramGoal,
          equipment: (program.equipment || []) as EquipmentType[],
          workouts: (program.workouts || [])
            .sort(
              (a: any, b: any) =>
                a.week_number - b.week_number || a.day_of_week - b.day_of_week
            )
            .map((w: any) => ({
              id: w.id,
              name: w.name,
              dayOfWeek: w.day_of_week,
              weekNumber: w.week_number,
              exercises: (w.workout_exercises || [])
                .sort((a: any, b: any) => a.sort_order - b.sort_order)
                .map((we: any) => ({
                  id: we.id,
                  exerciseId: we.exercise_id,
                  exerciseName: we.exercise?.name || "Unknown Exercise",
                  exerciseType: (we.exercise?.exercise_type || "strength") as ExerciseType,
                  sortOrder: we.sort_order,
                  notes: we.notes,
                  sets: (we.exercise_sets || [])
                    .sort((a: any, b: any) => a.set_number - b.set_number)
                    .map((s: any) => ({
                      id: s.id,
                      setNumber: s.set_number,
                      targetReps: s.target_reps,
                      targetWeight: s.target_weight,
                      targetDurationSeconds: s.target_duration_seconds,
                      targetDistanceMeters: s.target_distance_meters,
                      restSeconds: s.rest_seconds,
                    })),
                })),
            })),
        };

        setProgramDraft(draft);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load program")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, user?.id]
  );

  // Update program info (name, description, etc.)
  const updateProgramInfo = useCallback(
    (updates: Partial<Omit<ProgramDraft, "workouts">>) => {
      setProgramDraft((prev) => (prev ? { ...prev, ...updates } : null));
    },
    []
  );

  // Add a workout
  const addWorkout = useCallback((dayOfWeek: number, name?: string) => {
    setProgramDraft((prev) => {
      if (!prev) return null;
      const dayNames = [
        "",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const newWorkout: WorkoutDraft = {
        name: name || dayNames[dayOfWeek] || `Day ${dayOfWeek}`,
        dayOfWeek,
        weekNumber: 1,
        exercises: [],
      };
      return { ...prev, workouts: [...prev.workouts, newWorkout] };
    });
  }, []);

  // Update a workout
  const updateWorkout = useCallback(
    (index: number, updates: Partial<WorkoutDraft>) => {
      setProgramDraft((prev) => {
        if (!prev) return null;
        const workouts = [...prev.workouts];
        workouts[index] = { ...workouts[index], ...updates };
        return { ...prev, workouts };
      });
    },
    []
  );

  // Delete a workout
  const deleteWorkout = useCallback((index: number) => {
    setProgramDraft((prev) => {
      if (!prev) return null;
      const workouts = prev.workouts.filter((_, i) => i !== index);
      return { ...prev, workouts };
    });
  }, []);

  // Reorder workouts
  const reorderWorkouts = useCallback((workouts: WorkoutDraft[]) => {
    setProgramDraft((prev) => (prev ? { ...prev, workouts } : null));
  }, []);

  // Add an exercise to a workout
  const addExercise = useCallback(
    (workoutIndex: number, exercise: { id: string; name: string; type?: ExerciseType }) => {
      setProgramDraft((prev) => {
        if (!prev) return null;
        const workouts = [...prev.workouts];
        const workout = { ...workouts[workoutIndex] };
        const exerciseType = exercise.type || "strength";
        const isCardio = exerciseType === "cardio";
        const newExercise: ExerciseDraft = {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          exerciseType: exerciseType,
          sortOrder: workout.exercises.length,
          notes: null,
          sets: [{
            ...DEFAULT_SET,
            setNumber: 1,
            // For cardio: default to 1 round, no reps/weight
            targetReps: isCardio ? 1 : DEFAULT_SET.targetReps,
            targetWeight: isCardio ? null : DEFAULT_SET.targetWeight,
            targetDurationSeconds: isCardio ? 300 : null, // 5 min default for cardio
            targetDistanceMeters: isCardio ? 1000 : null, // 1km default for cardio
          }],
        };
        workout.exercises = [...workout.exercises, newExercise];
        workouts[workoutIndex] = workout;
        return { ...prev, workouts };
      });
    },
    []
  );

  // Update an exercise
  const updateExercise = useCallback(
    (
      workoutIndex: number,
      exerciseIndex: number,
      updates: Partial<ExerciseDraft>
    ) => {
      setProgramDraft((prev) => {
        if (!prev) return null;
        const workouts = [...prev.workouts];
        const workout = { ...workouts[workoutIndex] };
        const exercises = [...workout.exercises];
        exercises[exerciseIndex] = { ...exercises[exerciseIndex], ...updates };
        workout.exercises = exercises;
        workouts[workoutIndex] = workout;
        return { ...prev, workouts };
      });
    },
    []
  );

  // Delete an exercise
  const deleteExercise = useCallback(
    (workoutIndex: number, exerciseIndex: number) => {
      setProgramDraft((prev) => {
        if (!prev) return null;
        const workouts = [...prev.workouts];
        const workout = { ...workouts[workoutIndex] };
        workout.exercises = workout.exercises
          .filter((_, i) => i !== exerciseIndex)
          .map((e, i) => ({ ...e, sortOrder: i }));
        workouts[workoutIndex] = workout;
        return { ...prev, workouts };
      });
    },
    []
  );

  // Reorder exercises
  const reorderExercises = useCallback(
    (workoutIndex: number, exercises: ExerciseDraft[]) => {
      setProgramDraft((prev) => {
        if (!prev) return null;
        const workouts = [...prev.workouts];
        workouts[workoutIndex] = {
          ...workouts[workoutIndex],
          exercises: exercises.map((e, i) => ({ ...e, sortOrder: i })),
        };
        return { ...prev, workouts };
      });
    },
    []
  );

  // Add a set to an exercise
  const addSet = useCallback((workoutIndex: number, exerciseIndex: number) => {
    setProgramDraft((prev) => {
      if (!prev) return null;
      const workouts = [...prev.workouts];
      const workout = { ...workouts[workoutIndex] };
      const exercises = [...workout.exercises];
      const exercise = { ...exercises[exerciseIndex] };
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const newSet: SetDraft = {
        setNumber: exercise.sets.length + 1,
        targetReps: lastSet?.targetReps || DEFAULT_SET.targetReps,
        targetWeight: lastSet?.targetWeight ?? DEFAULT_SET.targetWeight,
        targetDurationSeconds: lastSet?.targetDurationSeconds ?? DEFAULT_SET.targetDurationSeconds,
        targetDistanceMeters: lastSet?.targetDistanceMeters ?? DEFAULT_SET.targetDistanceMeters,
        restSeconds: lastSet?.restSeconds || DEFAULT_SET.restSeconds,
      };
      exercise.sets = [...exercise.sets, newSet];
      exercises[exerciseIndex] = exercise;
      workout.exercises = exercises;
      workouts[workoutIndex] = workout;
      return { ...prev, workouts };
    });
  }, []);

  // Update a set
  const updateSet = useCallback(
    (
      workoutIndex: number,
      exerciseIndex: number,
      setIndex: number,
      updates: Partial<SetDraft>
    ) => {
      setProgramDraft((prev) => {
        if (!prev) return null;
        const workouts = [...prev.workouts];
        const workout = { ...workouts[workoutIndex] };
        const exercises = [...workout.exercises];
        const exercise = { ...exercises[exerciseIndex] };
        const sets = [...exercise.sets];
        sets[setIndex] = { ...sets[setIndex], ...updates };
        exercise.sets = sets;
        exercises[exerciseIndex] = exercise;
        workout.exercises = exercises;
        workouts[workoutIndex] = workout;
        return { ...prev, workouts };
      });
    },
    []
  );

  // Delete a set
  const deleteSet = useCallback(
    (workoutIndex: number, exerciseIndex: number, setIndex: number) => {
      setProgramDraft((prev) => {
        if (!prev) return null;
        const workouts = [...prev.workouts];
        const workout = { ...workouts[workoutIndex] };
        const exercises = [...workout.exercises];
        const exercise = { ...exercises[exerciseIndex] };
        exercise.sets = exercise.sets
          .filter((_, i) => i !== setIndex)
          .map((s, i) => ({ ...s, setNumber: i + 1 }));
        exercises[exerciseIndex] = exercise;
        workout.exercises = exercises;
        workouts[workoutIndex] = workout;
        return { ...prev, workouts };
      });
    },
    []
  );

  // Validation
  const getValidationErrors = useCallback((): string[] => {
    const errors: string[] = [];
    if (!programDraft) return ["No program data"];

    if (!programDraft.name.trim()) {
      errors.push("Program name is required");
    }
    if (programDraft.name.length > 50) {
      errors.push("Program name must be 50 characters or less");
    }
    if (programDraft.workouts.length === 0) {
      errors.push("At least one workout is required");
    }

    programDraft.workouts.forEach((workout, wIndex) => {
      if (!workout.name.trim()) {
        errors.push(`Workout ${wIndex + 1} needs a name`);
      }
      if (workout.exercises.length === 0) {
        errors.push(`"${workout.name}" needs at least one exercise`);
      }
      workout.exercises.forEach((exercise, eIndex) => {
        if (exercise.sets.length === 0) {
          errors.push(
            `"${exercise.exerciseName}" in "${workout.name}" needs at least one set`
          );
        }
        exercise.sets.forEach((set) => {
          if (set.targetReps < 1 || set.targetReps > 100) {
            errors.push(`Invalid reps in "${exercise.exerciseName}"`);
          }
        });
      });
    });

    return errors;
  }, [programDraft]);

  const canSave = useCallback((): boolean => {
    return getValidationErrors().length === 0;
  }, [getValidationErrors]);

  // Save program to database
  const saveProgram = useCallback(async (): Promise<SaveResult> => {
    if (!user?.id) {
      return { success: false, error: "Not authenticated" };
    }
    if (!programDraft) {
      return { success: false, error: "No program data" };
    }
    if (!canSave()) {
      return { success: false, error: getValidationErrors().join(", ") };
    }

    setIsSaving(true);
    setError(null);

    try {
      const isNewProgram = !programDraft.id;

      // Collect all equipment used in exercises
      const usedEquipment = new Set<EquipmentType>();
      programDraft.workouts.forEach((w) =>
        w.exercises.forEach(() => {
          // Could fetch exercise equipment here if needed
        })
      );

      if (isNewProgram) {
        // Create new program
        const { data: program, error: programError } = await supabase
          .from("programs")
          .insert({
            name: programDraft.name,
            description: programDraft.description || null,
            duration_weeks: programDraft.durationWeeks,
            days_per_week: programDraft.daysPerWeek,
            difficulty: programDraft.difficulty,
            goal: programDraft.goal,
            equipment: programDraft.equipment,
            is_template: false,
            is_public: false,
            is_premium: false,
            user_id: user.id,
          })
          .select()
          .single();

        if (programError) throw new Error(programError.message);

        // Create workouts
        for (const workout of programDraft.workouts) {
          const { data: createdWorkout, error: workoutError } = await supabase
            .from("workouts")
            .insert({
              program_id: program.id,
              name: workout.name,
              day_of_week: workout.dayOfWeek,
              week_number: workout.weekNumber,
            })
            .select()
            .single();

          if (workoutError) throw new Error(workoutError.message);

          // Create workout exercises
          for (const exercise of workout.exercises) {
            const { data: createdExercise, error: exerciseError } =
              await supabase
                .from("workout_exercises")
                .insert({
                  workout_id: createdWorkout.id,
                  exercise_id: exercise.exerciseId,
                  sort_order: exercise.sortOrder,
                  notes: exercise.notes,
                })
                .select()
                .single();

            if (exerciseError) throw new Error(exerciseError.message);

            // Create sets
            if (exercise.sets.length > 0) {
              const { error: setsError } = await supabase
                .from("exercise_sets")
                .insert(
                  exercise.sets.map((set) => ({
                    workout_exercise_id: createdExercise.id,
                    set_number: set.setNumber,
                    target_reps: set.targetReps,
                    target_weight: set.targetWeight,
                    target_duration_seconds: set.targetDurationSeconds,
                    target_distance_meters: set.targetDistanceMeters,
                    rest_seconds: set.restSeconds,
                  }))
                );

              if (setsError) throw new Error(setsError.message);
            }
          }
        }

        return { success: true, programId: program.id };
      } else {
        // Update existing program
        const programId = programDraft.id!; // Must exist for updates
        const { error: updateError } = await supabase
          .from("programs")
          .update({
            name: programDraft.name,
            description: programDraft.description || null,
            duration_weeks: programDraft.durationWeeks,
            days_per_week: programDraft.daysPerWeek,
            difficulty: programDraft.difficulty,
            goal: programDraft.goal,
            equipment: programDraft.equipment,
          })
          .eq("id", programId)
          .eq("user_id", user.id);

        if (updateError) throw new Error(updateError.message);

        // Delete existing workouts (cascade will delete exercises and sets)
        const { error: deleteError } = await supabase
          .from("workouts")
          .delete()
          .eq("program_id", programId);

        if (deleteError) throw new Error(deleteError.message);

        // Recreate workouts with new data
        for (const workout of programDraft.workouts) {
          const { data: createdWorkout, error: workoutError } = await supabase
            .from("workouts")
            .insert({
              program_id: programId,
              name: workout.name,
              day_of_week: workout.dayOfWeek,
              week_number: workout.weekNumber,
            })
            .select()
            .single();

          if (workoutError) throw new Error(workoutError.message);

          for (const exercise of workout.exercises) {
            const { data: createdExercise, error: exerciseError } =
              await supabase
                .from("workout_exercises")
                .insert({
                  workout_id: createdWorkout.id,
                  exercise_id: exercise.exerciseId,
                  sort_order: exercise.sortOrder,
                  notes: exercise.notes,
                })
                .select()
                .single();

            if (exerciseError) throw new Error(exerciseError.message);

            if (exercise.sets.length > 0) {
              const { error: setsError } = await supabase
                .from("exercise_sets")
                .insert(
                  exercise.sets.map((set) => ({
                    workout_exercise_id: createdExercise.id,
                    set_number: set.setNumber,
                    target_reps: set.targetReps,
                    target_weight: set.targetWeight,
                    target_duration_seconds: set.targetDurationSeconds,
                    target_distance_meters: set.targetDistanceMeters,
                    rest_seconds: set.restSeconds,
                  }))
                );

              if (setsError) throw new Error(setsError.message);
            }
          }
        }

        return { success: true, programId };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save program";
      setError(new Error(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [supabase, user?.id, programDraft, canSave, getValidationErrors]);

  // Delete program
  const deleteProgram = useCallback(async (): Promise<SaveResult> => {
    if (!user?.id) {
      return { success: false, error: "Not authenticated" };
    }
    if (!programDraft?.id) {
      return { success: false, error: "No program to delete" };
    }

    setIsSaving(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("programs")
        .delete()
        .eq("id", programDraft.id)
        .eq("user_id", user.id);

      if (deleteError) throw new Error(deleteError.message);

      setProgramDraft(null);
      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete program";
      setError(new Error(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [supabase, user?.id, programDraft?.id]);

  return {
    programDraft,
    isLoading,
    isSaving,
    error,
    initNewProgram,
    loadProgram,
    updateProgramInfo,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    reorderWorkouts,
    addExercise,
    updateExercise,
    deleteExercise,
    reorderExercises,
    addSet,
    updateSet,
    deleteSet,
    saveProgram,
    deleteProgram,
    canSave,
    getValidationErrors,
  };
}
