import { useEffect, useState, useCallback } from "react";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";
import type {
  WorkoutLog,
  Workout,
  Exercise,
  SetLog,
  ExerciseSet,
} from "@rota/database";

interface SetLogWithDetails extends SetLog {
  exercise_set?: ExerciseSet;
}

interface ExerciseWithSets {
  exercise: Exercise;
  sets: SetLogWithDetails[];
  totalVolume: number;
  totalReps: number;
  maxWeight: number;
}

export interface WorkoutLogDetail extends WorkoutLog {
  workout?: Workout;
  exercisesWithSets: ExerciseWithSets[];
  summary: {
    totalVolume: number;
    totalSets: number;
    totalReps: number;
    exerciseCount: number;
    averageRpe: number | null;
    maxWeight: number;
  };
}

interface UseWorkoutLogDetailReturn {
  workoutLog: WorkoutLogDetail | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useWorkoutLogDetail(
  workoutLogId: string | null
): UseWorkoutLogDetailReturn {
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const [workoutLog, setWorkoutLog] = useState<WorkoutLogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorkoutLogDetail = useCallback(async () => {
    if (!workoutLogId || !user?.id) {
      setWorkoutLog(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch workout log with workout info
      const { data: logData, error: logError } = await supabase
        .from("workout_logs")
        .select(
          `
          *,
          workout:workouts(*)
        `
        )
        .eq("id", workoutLogId)
        .eq("user_id", user.id)
        .single();

      if (logError) {
        throw new Error(logError.message);
      }

      // Fetch all set logs for this workout log
      const { data: setLogs, error: setLogsError } = await supabase
        .from("set_logs")
        .select(
          `
          *,
          exercise_set:exercise_sets(*)
        `
        )
        .eq("workout_log_id", workoutLogId)
        .order("completed_at", { ascending: true });

      if (setLogsError) {
        throw new Error(setLogsError.message);
      }

      // Cast to proper types (Supabase types aren't fully inferred)
      const typedSetLogs = (setLogs || []) as (SetLog & { exercise_set?: ExerciseSet })[];

      // Get unique exercise IDs from set logs
      const exerciseIds = [...new Set(typedSetLogs.map((s) => s.exercise_id))];

      // Fetch exercise details
      const { data: exercises, error: exercisesError } = await supabase
        .from("exercises")
        .select("*")
        .in("id", exerciseIds.length > 0 ? exerciseIds : ["none"]);

      if (exercisesError) {
        throw new Error(exercisesError.message);
      }

      const typedExercises = (exercises || []) as Exercise[];

      // Group sets by exercise
      const exerciseMap = new Map<string, Exercise>();
      typedExercises.forEach((ex) => exerciseMap.set(ex.id, ex));

      const setsByExercise = new Map<string, SetLogWithDetails[]>();
      typedSetLogs.forEach((setLog) => {
        const existing = setsByExercise.get(setLog.exercise_id) || [];
        existing.push(setLog as SetLogWithDetails);
        setsByExercise.set(setLog.exercise_id, existing);
      });

      // Build exercises with sets array, maintaining order of first appearance
      const exerciseOrder: string[] = [];
      typedSetLogs.forEach((setLog) => {
        if (!exerciseOrder.includes(setLog.exercise_id)) {
          exerciseOrder.push(setLog.exercise_id);
        }
      });

      const exercisesWithSets: ExerciseWithSets[] = exerciseOrder.map(
        (exerciseId) => {
          const exercise = exerciseMap.get(exerciseId)!;
          const sets = setsByExercise.get(exerciseId) || [];

          const totalVolume = sets.reduce(
            (sum, s) => sum + s.actual_weight * s.actual_reps,
            0
          );
          const totalReps = sets.reduce((sum, s) => sum + s.actual_reps, 0);
          const maxWeight = Math.max(...sets.map((s) => s.actual_weight), 0);

          return {
            exercise,
            sets,
            totalVolume,
            totalReps,
            maxWeight,
          };
        }
      );

      // Calculate summary stats
      const totalVolume = typedSetLogs.reduce(
        (sum, s) => sum + s.actual_weight * s.actual_reps,
        0
      );
      const totalReps = typedSetLogs.reduce((sum, s) => sum + s.actual_reps, 0);
      const totalSets = typedSetLogs.length;
      const maxWeight = Math.max(...typedSetLogs.map((s) => s.actual_weight), 0);

      // Calculate average RPE (only from sets that have it)
      const setsWithRpe = typedSetLogs.filter((s) => s.rpe !== null);
      const averageRpe =
        setsWithRpe.length > 0
          ? setsWithRpe.reduce((sum, s) => sum + (s.rpe || 0), 0) /
            setsWithRpe.length
          : null;

      // Cast logData to proper type
      const typedLogData = logData as WorkoutLog & { workout?: Workout };

      const workoutLogDetail: WorkoutLogDetail = {
        ...typedLogData,
        workout: typedLogData.workout,
        exercisesWithSets,
        summary: {
          totalVolume,
          totalSets,
          totalReps,
          exerciseCount: exercisesWithSets.length,
          averageRpe,
          maxWeight,
        },
      };

      setWorkoutLog(workoutLogDetail);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch workout log detail")
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase, workoutLogId, user?.id]);

  useEffect(() => {
    fetchWorkoutLogDetail();
  }, [fetchWorkoutLogDetail]);

  return {
    workoutLog,
    isLoading,
    error,
    refetch: fetchWorkoutLogDetail,
  };
}
