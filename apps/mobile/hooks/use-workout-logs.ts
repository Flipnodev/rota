import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";
import type { WorkoutLog, Workout } from "@rota/database";

interface WorkoutLogWithWorkout extends WorkoutLog {
  workout?: Workout;
}

interface UseWorkoutLogsOptions {
  limit?: number;
}

interface WorkoutStats {
  totalWorkouts: number;
  thisWeek: number;
  thisMonth: number;
  streak: number;
}

interface UseWorkoutLogsReturn {
  workoutLogs: WorkoutLogWithWorkout[];
  stats: WorkoutStats;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useWorkoutLogs(
  options: UseWorkoutLogsOptions = {}
): UseWorkoutLogsReturn {
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogWithWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { limit } = options;

  const fetchWorkoutLogs = useCallback(async () => {
    if (!user?.id) {
      setWorkoutLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("workout_logs")
        .select(
          `
          *,
          workout:workouts(*)
        `
        )
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw new Error(queryError.message);
      }

      setWorkoutLogs(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch workout logs")
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.id, limit]);

  // Refetch when the screen comes into focus (e.g., after completing a workout)
  useFocusEffect(
    useCallback(() => {
      fetchWorkoutLogs();
    }, [fetchWorkoutLogs])
  );

  // Calculate stats from workout logs
  const stats = calculateStats(workoutLogs);

  return {
    workoutLogs,
    stats,
    isLoading,
    error,
    refetch: fetchWorkoutLogs,
  };
}

function calculateStats(logs: WorkoutLogWithWorkout[]): WorkoutStats {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Filter completed workouts only
  const completedLogs = logs.filter((log) => log.completed_at !== null);

  const thisWeek = completedLogs.filter(
    (log) => new Date(log.started_at) >= startOfWeek
  ).length;

  const thisMonth = completedLogs.filter(
    (log) => new Date(log.started_at) >= startOfMonth
  ).length;

  // Calculate streak (consecutive days with workouts)
  const streak = calculateStreak(completedLogs);

  return {
    totalWorkouts: completedLogs.length,
    thisWeek,
    thisMonth,
    streak,
  };
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateStreak(logs: WorkoutLogWithWorkout[]): number {
  if (logs.length === 0) return 0;

  // Get unique workout dates sorted descending
  const dates = [
    ...new Set(
      logs.map((log) => new Date(log.started_at).toDateString())
    ),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (dates.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if most recent workout was today or yesterday
  const lastWorkoutDate = new Date(dates[0]);
  lastWorkoutDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If last workout was more than 1 day ago, streak is 0
  if (daysDiff > 1) return 0;

  // Count consecutive days
  let currentDate = lastWorkoutDate;
  for (const dateStr of dates) {
    const workoutDate = new Date(dateStr);
    workoutDate.setHours(0, 0, 0, 0);

    const diff = Math.floor(
      (currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff <= 1) {
      streak++;
      currentDate = workoutDate;
    } else {
      break;
    }
  }

  return streak;
}
