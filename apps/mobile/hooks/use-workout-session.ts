import { useState, useCallback, useRef, useEffect } from "react";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";
import type {
  Workout,
  WorkoutExercise,
  Exercise,
  ExerciseSet,
  WorkoutLog,
  SetLog,
} from "@rota/database";

interface WorkoutExerciseWithDetails extends WorkoutExercise {
  exercise?: Exercise;
  sets?: ExerciseSet[];
}

export interface WorkoutWithExercises extends Workout {
  workout_exercises?: WorkoutExerciseWithDetails[];
}

export interface SetLogInput {
  exercise_set_id: string;
  exercise_id: string;
  actual_reps: number;
  actual_weight: number;
}

export interface WorkoutSessionData {
  workoutLogId: string;
  workout: WorkoutWithExercises;
  setLogs: SetLog[];
  startedAt: Date;
  completedAt: Date | null;
  durationSeconds: number;
}

interface UseWorkoutSessionReturn {
  // State
  workout: WorkoutWithExercises | null;
  workoutLogId: string | null;
  completedSets: Map<string, SetLog>;
  elapsedSeconds: number;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;

  // Actions
  startSession: (workoutId: string, programId?: string) => Promise<boolean>;
  completeSet: (setData: SetLogInput) => Promise<boolean>;
  uncompleteSet: (exerciseSetId: string) => Promise<boolean>;
  finishWorkout: () => Promise<WorkoutSessionData | null>;
  cancelWorkout: () => Promise<void>;
}

export function useWorkoutSession(): UseWorkoutSessionReturn {
  const { supabase } = useDatabase();
  const { user } = useAuth();

  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [completedSets, setCompletedSets] = useState<Map<string, SetLog>>(
    new Map()
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startTimeRef = useRef<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer effect
  useEffect(() => {
    if (workoutLogId && startTimeRef.current) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        const diff = Math.floor(
          (now.getTime() - startTimeRef.current!.getTime()) / 1000
        );
        setElapsedSeconds(diff);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [workoutLogId]);

  const startSession = useCallback(
    async (workoutId: string, programIdParam?: string): Promise<boolean> => {
      if (!user?.id) {
        setError(new Error("User not authenticated"));
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch workout with exercises
        const { data: workoutData, error: workoutError } = await supabase
          .from("workouts")
          .select(
            `
            *,
            workout_exercises(
              *,
              exercise:exercises(*),
              sets:exercise_sets(*)
            )
          `
          )
          .eq("id", workoutId)
          .single();

        if (workoutError) {
          throw new Error(workoutError.message);
        }

        // Sort exercises and sets
        if (workoutData?.workout_exercises) {
          workoutData.workout_exercises.sort(
            (a: WorkoutExerciseWithDetails, b: WorkoutExerciseWithDetails) =>
              a.sort_order - b.sort_order
          );

          workoutData.workout_exercises.forEach(
            (we: WorkoutExerciseWithDetails) => {
              if (we.sets) {
                we.sets.sort(
                  (a: ExerciseSet, b: ExerciseSet) =>
                    a.set_number - b.set_number
                );
              }
            }
          );
        }

        // Create workout log entry
        const startTime = new Date();
        const { data: logData, error: logError } = await supabase
          .from("workout_logs")
          .insert({
            user_id: user.id,
            workout_id: workoutId,
            program_id: programIdParam || null,
            started_at: startTime.toISOString(),
          })
          .select()
          .single();

        if (logError) {
          throw new Error(logError.message);
        }

        setWorkout(workoutData as WorkoutWithExercises);
        setWorkoutLogId(logData.id);
        setProgramId(programIdParam || null);
        startTimeRef.current = startTime;
        setCompletedSets(new Map());
        setElapsedSeconds(0);

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to start workout")
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, user?.id]
  );

  const completeSet = useCallback(
    async (setData: SetLogInput): Promise<boolean> => {
      if (!workoutLogId) {
        setError(new Error("No active workout session"));
        return false;
      }

      setIsSaving(true);
      setError(null);

      try {
        const { data, error: insertError } = await supabase
          .from("set_logs")
          .insert({
            workout_log_id: workoutLogId,
            exercise_set_id: setData.exercise_set_id,
            exercise_id: setData.exercise_id,
            actual_reps: setData.actual_reps,
            actual_weight: setData.actual_weight,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        setCompletedSets((prev) => {
          const next = new Map(prev);
          next.set(setData.exercise_set_id, data as SetLog);
          return next;
        });

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to log set")
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [supabase, workoutLogId]
  );

  const uncompleteSet = useCallback(
    async (exerciseSetId: string): Promise<boolean> => {
      const setLog = completedSets.get(exerciseSetId);
      if (!setLog) return true;

      setIsSaving(true);
      setError(null);

      try {
        const { error: deleteError } = await supabase
          .from("set_logs")
          .delete()
          .eq("id", setLog.id);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        setCompletedSets((prev) => {
          const next = new Map(prev);
          next.delete(exerciseSetId);
          return next;
        });

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to uncomplete set")
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [supabase, completedSets]
  );

  const finishWorkout = useCallback(async (): Promise<WorkoutSessionData | null> => {
    if (!workoutLogId || !workout || !startTimeRef.current) {
      setError(new Error("No active workout session"));
      return null;
    }

    setIsSaving(true);
    setError(null);

    try {
      const completedAt = new Date();
      const durationSeconds = Math.floor(
        (completedAt.getTime() - startTimeRef.current.getTime()) / 1000
      );

      // Update workout log with completion data
      const { error: updateError } = await supabase
        .from("workout_logs")
        .update({
          completed_at: completedAt.toISOString(),
          duration_seconds: durationSeconds,
        })
        .eq("id", workoutLogId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const sessionData: WorkoutSessionData = {
        workoutLogId,
        workout,
        setLogs: Array.from(completedSets.values()),
        startedAt: startTimeRef.current,
        completedAt,
        durationSeconds,
      };

      // Reset state
      setWorkout(null);
      setWorkoutLogId(null);
      setProgramId(null);
      setCompletedSets(new Map());
      setElapsedSeconds(0);
      startTimeRef.current = null;

      return sessionData;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to complete workout")
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [supabase, workoutLogId, workout, completedSets]);

  const cancelWorkout = useCallback(async (): Promise<void> => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // If there's a workout log, we could either delete it or leave it as incomplete
    // For now, we'll leave it as incomplete (no completed_at)

    // Reset state
    setWorkout(null);
    setWorkoutLogId(null);
    setProgramId(null);
    setCompletedSets(new Map());
    setElapsedSeconds(0);
    startTimeRef.current = null;
    setError(null);
  }, []);

  return {
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
  };
}

// Helper function to format elapsed time
export function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// Helper function to calculate total volume
export function calculateTotalVolume(setLogs: SetLog[]): number {
  return setLogs.reduce(
    (total, log) => total + log.actual_reps * log.actual_weight,
    0
  );
}
