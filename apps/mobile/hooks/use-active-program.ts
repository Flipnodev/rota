import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";
import type { Program, Workout, WorkoutExercise, Exercise, ExerciseSet } from "@rota/database";

interface WorkoutExerciseWithDetails extends WorkoutExercise {
  exercise?: Exercise;
  sets?: ExerciseSet[];
}

interface WorkoutWithExercises extends Workout {
  workout_exercises?: WorkoutExerciseWithDetails[];
}

interface ActiveProgramData {
  userProgram: {
    id: string;
    status: string;
    started_at: string;
  };
  program: {
    id: string;
    name: string;
    description: string | null;
    duration_weeks: number;
    days_per_week: number;
    difficulty: string;
    goal: string;
  };
  progress: {
    completed_workouts: number;
    total_workouts: number;
  };
}

interface UseActiveProgramReturn {
  activeProgram: ActiveProgramData | null;
  workouts: WorkoutWithExercises[];
  todaysWorkout: WorkoutWithExercises | null;
  currentWeek: number;
  totalWeeks: number;
  progress: number;
  completedWorkouts: number;
  totalWorkouts: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  startProgram: (programId: string) => Promise<{ success: boolean; programId?: string; error?: string }>;
}

export function useActiveProgram(): UseActiveProgramReturn {
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const [activeProgram, setActiveProgram] = useState<ActiveProgramData | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActiveProgram = useCallback(async () => {
    if (!user?.id) {
      setActiveProgram(null);
      setWorkouts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the database function to get active program with progress
      const { data, error: rpcError } = await supabase.rpc("get_active_program");

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      if (data) {
        setActiveProgram(data as ActiveProgramData);

        // Fetch workouts for this program
        const { data: workoutsData, error: workoutsError } = await supabase
          .from("workouts")
          .select(`
            *,
            workout_exercises(
              *,
              exercise:exercises(*),
              sets:exercise_sets(*)
            )
          `)
          .eq("program_id", data.program.id)
          .eq("week_number", 1)
          .order("day_of_week", { ascending: true });

        if (workoutsError) {
          throw new Error(workoutsError.message);
        }

        // Sort exercises and sets within each workout
        const sortedWorkouts = (workoutsData || []).map((workout: WorkoutWithExercises) => {
          if (workout.workout_exercises) {
            workout.workout_exercises.sort((a, b) => a.sort_order - b.sort_order);
            workout.workout_exercises.forEach((we) => {
              if (we.sets) {
                we.sets.sort((a, b) => a.set_number - b.set_number);
              }
            });
          }
          return workout;
        });

        setWorkouts(sortedWorkouts);
      } else {
        setActiveProgram(null);
        setWorkouts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch active program"));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.id]);

  // Start a program (copies template if needed, sets as active)
  const startProgram = useCallback(
    async (programId: string): Promise<{ success: boolean; programId?: string; error?: string }> => {
      if (!user?.id) {
        return { success: false, error: "Not authenticated" };
      }

      try {
        const { data, error: rpcError } = await supabase.rpc("start_program", {
          p_program_id: programId,
        });

        if (rpcError) {
          return { success: false, error: rpcError.message };
        }

        if (data?.success) {
          // Refetch to update state
          await fetchActiveProgram();
          return { success: true, programId: data.program_id };
        }

        return { success: false, error: data?.error || "Unknown error" };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [supabase, user?.id, fetchActiveProgram]
  );

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchActiveProgram();
    }, [fetchActiveProgram])
  );

  // Calculate derived values
  const totalWorkouts = activeProgram?.progress.total_workouts || 0;
  const completedWorkouts = activeProgram?.progress.completed_workouts || 0;
  const progress = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;
  const daysPerWeek = activeProgram?.program.days_per_week || 1;
  const currentWeek = activeProgram
    ? Math.min(Math.floor(completedWorkouts / daysPerWeek) + 1, activeProgram.program.duration_weeks)
    : 1;
  const totalWeeks = activeProgram?.program.duration_weeks || 0;

  // Find today's workout
  const today = new Date();
  const dayOfWeek = today.getDay() || 7; // Convert Sunday from 0 to 7
  const todaysWorkout = workouts.find((w) => w.day_of_week === dayOfWeek) || null;

  return {
    activeProgram,
    workouts,
    todaysWorkout,
    currentWeek,
    totalWeeks,
    progress,
    completedWorkouts,
    totalWorkouts,
    isLoading,
    error,
    refetch: fetchActiveProgram,
    startProgram,
  };
}
