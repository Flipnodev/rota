import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";
import type {
  Program,
  Workout,
  WorkoutExercise,
  Exercise,
  ExerciseSet,
  WorkoutLog,
} from "@rota/database";

interface WorkoutExerciseWithDetails extends WorkoutExercise {
  exercise?: Exercise;
  sets?: ExerciseSet[];
}

interface WorkoutWithExercises extends Workout {
  workout_exercises?: WorkoutExerciseWithDetails[];
}

export interface ProgramWithWorkouts extends Program {
  workouts?: WorkoutWithExercises[];
}

interface UseProgramReturn {
  program: ProgramWithWorkouts | null;
  completedWorkoutIds: string[];
  todayCompletedWorkoutIds: string[];
  completedWorkouts: number;
  totalWorkouts: number;
  progress: number;
  currentWeek: number;
  hasStartedProgram: boolean;
  programStartedAt: Date | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useProgram(programId: string | null): UseProgramReturn {
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const [program, setProgram] = useState<ProgramWithWorkouts | null>(null);
  const [completedWorkoutLogs, setCompletedWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [mappedCompletedWorkoutIds, setMappedCompletedWorkoutIds] = useState<string[]>([]);
  const [todayCompletedWorkoutIds, setTodayCompletedWorkoutIds] = useState<string[]>([]);
  const [hasStartedProgram, setHasStartedProgram] = useState(false);
  const [programStartedAt, setProgramStartedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProgram = useCallback(async () => {
    if (!programId) {
      setProgram(null);
      setCompletedWorkoutLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("programs")
        .select(
          `
          *,
          workouts(
            *,
            workout_exercises(
              *,
              exercise:exercises(*),
              sets:exercise_sets(*)
            )
          )
        `
        )
        .eq("id", programId)
        .single();

      if (queryError) {
        throw new Error(queryError.message);
      }

      // Sort workouts by week and day
      if (data?.workouts) {
        data.workouts.sort((a: WorkoutWithExercises, b: WorkoutWithExercises) => {
          if (a.week_number !== b.week_number) {
            return a.week_number - b.week_number;
          }
          return a.day_of_week - b.day_of_week;
        });

        // Sort exercises within each workout
        data.workouts.forEach((workout: WorkoutWithExercises) => {
          if (workout.workout_exercises) {
            workout.workout_exercises.sort(
              (a: WorkoutExerciseWithDetails, b: WorkoutExerciseWithDetails) =>
                a.sort_order - b.sort_order
            );

            // Sort sets within each exercise
            workout.workout_exercises.forEach(
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
        });
      }

      setProgram(data as ProgramWithWorkouts);

      // Fetch completed workout logs
      if (user?.id && data) {
        const programWorkouts = data.workouts || [];
        const workoutIds = programWorkouts.map((w: Workout) => w.id);

        // Check if user has started this program (either template or their own)
        const { data: userProgramEntry } = await supabase
          .from("user_programs")
          .select("id, started_at")
          .eq("user_id", user.id)
          .eq("program_id", programId)
          .maybeSingle();

        const userHasStarted = !!userProgramEntry || !data.is_template;
        setHasStartedProgram(userHasStarted);
        setProgramStartedAt(userProgramEntry?.started_at ? new Date(userProgramEntry.started_at) : null);

        if (userHasStarted && workoutIds.length > 0) {
          const { data: logs, error: logsError } = await supabase
            .from("workout_logs")
            .select("*")
            .eq("user_id", user.id)
            .eq("program_id", programId)
            .not("completed_at", "is", null)
            .in("workout_id", workoutIds)
            .order("completed_at", { ascending: true });

          if (!logsError && logs) {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            const completedIds = logs.map((log: WorkoutLog) => log.workout_id);
            const todayCompletedIds = logs
              .filter((log: WorkoutLog) => new Date(log.started_at) >= startOfDay)
              .map((log: WorkoutLog) => log.workout_id);
            setCompletedWorkoutLogs(logs);
            setMappedCompletedWorkoutIds(completedIds);
            setTodayCompletedWorkoutIds(todayCompletedIds);
          } else {
            setCompletedWorkoutLogs([]);
            setMappedCompletedWorkoutIds([]);
            setTodayCompletedWorkoutIds([]);
          }
        } else {
          setCompletedWorkoutLogs([]);
          setMappedCompletedWorkoutIds([]);
          setTodayCompletedWorkoutIds([]);
          setHasStartedProgram(false);
        }
      } else {
        setCompletedWorkoutLogs([]);
        setMappedCompletedWorkoutIds([]);
        setTodayCompletedWorkoutIds([]);
        setHasStartedProgram(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch program")
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase, programId, user?.id]);

  // Refetch when the screen comes into focus (e.g., after completing a workout)
  useFocusEffect(
    useCallback(() => {
      fetchProgram();
    }, [fetchProgram])
  );

  // Calculate total workouts in the program
  const totalWorkouts = program
    ? program.duration_weeks * program.days_per_week
    : 0;

  // Count completed workouts
  const completedWorkouts = completedWorkoutLogs.length;

  // Get IDs of completed workouts (for showing checkmarks)
  // Use mapped IDs which map user's copy workout IDs back to template workout IDs
  const completedWorkoutIds = mappedCompletedWorkoutIds;

  // Calculate progress: completed / total * 100
  const progress = totalWorkouts > 0
    ? Math.round((completedWorkouts / totalWorkouts) * 100)
    : 0;

  // Calculate current week based on completed workouts
  const daysPerWeek = program?.days_per_week || 1;
  const currentWeek = program
    ? Math.min(
        Math.floor(completedWorkouts / daysPerWeek) + 1,
        program.duration_weeks
      )
    : 1;

  return {
    program,
    completedWorkoutIds,
    todayCompletedWorkoutIds,
    completedWorkouts,
    totalWorkouts,
    progress,
    currentWeek,
    hasStartedProgram,
    programStartedAt,
    isLoading,
    error,
    refetch: fetchProgram,
  };
}
