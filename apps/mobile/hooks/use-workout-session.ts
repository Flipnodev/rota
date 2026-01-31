import { useState, useCallback, useRef, useEffect } from "react";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";
import { useActiveProgram } from "@/hooks/use-active-program";
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
  isPaused: boolean;
  restSeconds: number;
  isResting: boolean;
  isTimerRunning: boolean;
  isWorkoutStarted: boolean;

  // Actions
  loadWorkout: (workoutId: string, programId?: string, templateProgramId?: string) => Promise<boolean>;
  beginWorkout: () => Promise<boolean>;
  completeSet: (setData: SetLogInput) => Promise<boolean>;
  uncompleteSet: (exerciseSetId: string) => Promise<boolean>;
  finishWorkout: () => Promise<WorkoutSessionData | null>;
  cancelWorkout: () => Promise<void>;
  togglePause: () => void;
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
}

export function useWorkoutSession(): UseWorkoutSessionReturn {
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const { startProgram } = useActiveProgram();

  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [templateProgramId, setTemplateProgramId] = useState<string | null>(null);
  const [completedSets, setCompletedSets] = useState<Map<string, SetLog>>(
    new Map()
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [pendingWorkoutId, setPendingWorkoutId] = useState<string | null>(null);

  const startTimeRef = useRef<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedAtRef = useRef<number>(0);
  const totalPausedTimeRef = useRef<number>(0);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer effect - respects pause state and isTimerRunning
  useEffect(() => {
    if (isWorkoutStarted && startTimeRef.current && !isPaused && isTimerRunning) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        const diff = Math.floor(
          (now.getTime() - startTimeRef.current!.getTime() - totalPausedTimeRef.current) / 1000
        );
        setElapsedSeconds(diff);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isWorkoutStarted, isPaused, isTimerRunning]);

  // Toggle pause/resume
  const togglePause = useCallback(() => {
    if (isPaused) {
      // Resume - add paused duration to total
      const pausedDuration = Date.now() - pausedAtRef.current;
      totalPausedTimeRef.current += pausedDuration;
      setIsPaused(false);
    } else {
      // Pause - record when we paused
      pausedAtRef.current = Date.now();
      setIsPaused(true);
    }
  }, [isPaused]);

  // Rest timer functions
  const startRestTimer = useCallback((seconds: number) => {
    // Clear any existing rest timer
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
    }

    setRestSeconds(seconds);
    setIsResting(true);

    restTimerRef.current = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          // Timer complete
          if (restTimerRef.current) {
            clearInterval(restTimerRef.current);
            restTimerRef.current = null;
          }
          setIsResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopRestTimer = useCallback(() => {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    setRestSeconds(0);
    setIsResting(false);
  }, []);

  // Load workout data for preview (does NOT create a workout log)
  const loadWorkout = useCallback(
    async (workoutId: string, programIdParam?: string, templateProgramIdParam?: string): Promise<boolean> => {
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

        // Just store workout data - don't create log yet
        setWorkout(workoutData as WorkoutWithExercises);
        setPendingWorkoutId(workoutId);
        setProgramId(programIdParam || null);
        setTemplateProgramId(templateProgramIdParam || null);
        setWorkoutLogId(null);
        setIsWorkoutStarted(false);
        setCompletedSets(new Map());
        setElapsedSeconds(0);
        setIsPaused(false);
        setIsTimerRunning(false);
        pausedAtRef.current = 0;
        totalPausedTimeRef.current = 0;
        setRestSeconds(0);
        setIsResting(false);
        startTimeRef.current = null;

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load workout")
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, user?.id]
  );

  // Begin workout - starts the program if needed, creates the workout log, and starts the timer
  const beginWorkout = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      setError(new Error("User not authenticated"));
      return false;
    }

    if (!workout || !pendingWorkoutId) {
      setError(new Error("No workout loaded"));
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      let finalProgramId = programId;

      // If this is a template program, start it first (links user to program)
      if (templateProgramId) {
        const result = await startProgram(templateProgramId);
        if (!result.success) {
          throw new Error(result.error || "Failed to start program");
        }
        // Use the program ID from the result (same as template since we don't copy)
        finalProgramId = result.programId || templateProgramId;
      }

      // Create workout log entry
      const startTime = new Date();
      const { data: logData, error: logError } = await supabase
        .from("workout_logs")
        .insert({
          user_id: user.id,
          workout_id: pendingWorkoutId,
          program_id: finalProgramId || null,
          started_at: startTime.toISOString(),
        })
        .select()
        .single();

      if (logError) {
        throw new Error(logError.message);
      }

      // Now the workout has officially started
      setWorkoutLogId(logData.id);
      setProgramId(finalProgramId);
      setTemplateProgramId(null); // Clear template flag
      setIsWorkoutStarted(true);
      setIsTimerRunning(true);
      startTimeRef.current = startTime;
      totalPausedTimeRef.current = 0;

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to start workout")
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [supabase, user?.id, workout, pendingWorkoutId, programId, templateProgramId, startProgram]);

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
    if (!workoutLogId || !workout || !startTimeRef.current || !isWorkoutStarted) {
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

      // Clear timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
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
      setTemplateProgramId(null);
      setPendingWorkoutId(null);
      setIsWorkoutStarted(false);
      setCompletedSets(new Map());
      setElapsedSeconds(0);
      setIsPaused(false);
      setIsTimerRunning(false);
      setRestSeconds(0);
      setIsResting(false);
      startTimeRef.current = null;
      pausedAtRef.current = 0;
      totalPausedTimeRef.current = 0;

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
    // Stop timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }

    // If workout was actually started (log exists), delete it
    if (workoutLogId && isWorkoutStarted) {
      try {
        // Delete set logs first (foreign key constraint)
        await supabase
          .from("set_logs")
          .delete()
          .eq("workout_log_id", workoutLogId);

        // Delete the workout log
        await supabase
          .from("workout_logs")
          .delete()
          .eq("id", workoutLogId);
      } catch (err) {
        // Log error but continue with reset
        console.warn("Failed to delete cancelled workout log:", err);
      }
    }

    // Reset state
    setWorkout(null);
    setWorkoutLogId(null);
    setProgramId(null);
    setTemplateProgramId(null);
    setPendingWorkoutId(null);
    setIsWorkoutStarted(false);
    setCompletedSets(new Map());
    setElapsedSeconds(0);
    setIsPaused(false);
    setIsTimerRunning(false);
    setRestSeconds(0);
    setIsResting(false);
    startTimeRef.current = null;
    pausedAtRef.current = 0;
    totalPausedTimeRef.current = 0;
    setError(null);
  }, [supabase, workoutLogId, isWorkoutStarted]);

  return {
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
