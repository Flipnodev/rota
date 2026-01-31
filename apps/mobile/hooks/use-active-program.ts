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
    started_at: string | null; // null until first workout begins
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

// Helper to calculate which program day the user is on (1-based)
// Returns 1 if program hasn't started yet, otherwise days elapsed + 1
function getCurrentProgramDay(startedAt: Date | null): number {
  if (!startedAt) {
    return 1; // Show Day 1 workouts if not started
  }

  const now = new Date();
  const startDate = new Date(startedAt.getFullYear(), startedAt.getMonth(), startedAt.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / msPerDay);

  return daysElapsed + 1; // Day 1 on start day, Day 2 on next day, etc.
}

interface UseActiveProgramReturn {
  activeProgram: ActiveProgramData | null;
  workouts: WorkoutWithExercises[];
  todaysWorkouts: WorkoutWithExercises[];
  todaysWorkout: WorkoutWithExercises | null; // backwards compat, first of today's workouts
  completedWorkoutIds: string[];
  isTodaysWorkoutCompleted: boolean; // backwards compat, true if ALL today's workouts completed
  allTodaysWorkoutsCompleted: boolean;
  currentWeek: number;
  totalWeeks: number;
  currentProgramDay: number; // Sequential day in program (1, 2, 3, ...)
  programStartedAt: Date | null; // When user started first workout, null if not started
  progress: number;
  completedWorkouts: number;
  totalWorkouts: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  startProgram: (programId: string) => Promise<{ success: boolean; programId?: string; error?: string }>;
  stopProgram: () => Promise<{ success: boolean; error?: string }>;
}

export function useActiveProgram(): UseActiveProgramReturn {
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const [activeProgram, setActiveProgram] = useState<ActiveProgramData | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [completedWorkoutIds, setCompletedWorkoutIds] = useState<string[]>([]);
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

        // Fetch today's completed workout logs for this program
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

        const { data: logsData } = await supabase
          .from("workout_logs")
          .select("workout_id")
          .eq("user_id", user.id)
          .eq("program_id", data.program.id)
          .not("completed_at", "is", null)
          .gte("started_at", startOfDay)
          .lt("started_at", endOfDay);

        setCompletedWorkoutIds((logsData || []).map((log: { workout_id: string }) => log.workout_id));
      } else {
        setActiveProgram(null);
        setWorkouts([]);
        setCompletedWorkoutIds([]);
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

  // Stop the current active program
  const stopProgram = useCallback(
    async (): Promise<{ success: boolean; error?: string }> => {
      if (!user?.id || !activeProgram?.userProgram.id) {
        return { success: false, error: "No active program" };
      }

      try {
        // Delete the user_programs entry to stop the program
        const { error: deleteError } = await supabase
          .from("user_programs")
          .delete()
          .eq("id", activeProgram.userProgram.id)
          .eq("user_id", user.id);

        if (deleteError) {
          return { success: false, error: deleteError.message };
        }

        // Clear local state
        setActiveProgram(null);
        setWorkouts([]);
        setCompletedWorkoutIds([]);

        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [supabase, user?.id, activeProgram?.userProgram.id]
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

  // Find today's workouts using sequential day logic
  // Parse program start date (null until first workout begins)
  const programStartedAt = activeProgram?.userProgram.started_at
    ? new Date(activeProgram.userProgram.started_at)
    : null;

  // Calculate which program day the user is on
  const currentProgramDay = getCurrentProgramDay(programStartedAt);

  // Convert program day to day within week (1-7)
  // Day 1-7 = Week 1, Day 8-14 = Week 2, etc.
  const dayInWeek = ((currentProgramDay - 1) % daysPerWeek) + 1;

  // Filter workouts for the current day in the week
  // day_of_week in workouts represents Day 1, Day 2, etc. within the week
  const todaysWorkouts = workouts.filter((w) => w.day_of_week === dayInWeek);

  // For backwards compatibility, also provide single workout
  const todaysWorkout = todaysWorkouts.length > 0 ? todaysWorkouts[0] : null;
  // Check if ALL today's workouts are completed
  const allTodaysWorkoutsCompleted = todaysWorkouts.length > 0 &&
    todaysWorkouts.every((w) => completedWorkoutIds.includes(w.id));
  // For backwards compatibility
  const isTodaysWorkoutCompleted = allTodaysWorkoutsCompleted;

  return {
    activeProgram,
    workouts,
    todaysWorkouts,
    todaysWorkout, // backwards compat
    completedWorkoutIds,
    isTodaysWorkoutCompleted,
    allTodaysWorkoutsCompleted,
    currentWeek,
    totalWeeks,
    currentProgramDay,
    programStartedAt,
    progress,
    completedWorkouts,
    totalWorkouts,
    isLoading,
    error,
    refetch: fetchActiveProgram,
    startProgram,
    stopProgram,
  };
}
