import { useState, useCallback, useEffect } from "react";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";
import type { Exercise } from "@rota/database";

interface HistoryEntry {
  date: Date;
  sets: number;
  totalReps: number;
  maxWeight: number;
  totalVolume: number;
}

interface PersonalRecord {
  weight: number;
  reps: number;
  date: Date;
}

interface UseExerciseReturn {
  exercise: Exercise | null;
  history: HistoryEntry[];
  personalRecord: PersonalRecord | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Type for the set_logs query result with workout_log join
interface SetLogWithWorkout {
  actual_reps: number;
  actual_weight: number;
  completed_at: string;
  workout_log: {
    user_id: string;
    started_at: string;
    completed_at: string | null;
  };
}

export function useExercise(exerciseId: string | undefined): UseExerciseReturn {
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [personalRecord, setPersonalRecord] = useState<PersonalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExercise = useCallback(async () => {
    if (!exerciseId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch exercise details
      const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", exerciseId)
        .single();

      if (exerciseError) {
        throw new Error(exerciseError.message);
      }

      setExercise(exerciseData as Exercise);

      // Fetch user's history for this exercise (if user is logged in)
      if (user?.id) {
        const { data: logsData, error: logsError } = await supabase
          .from("set_logs")
          .select(`
            actual_reps,
            actual_weight,
            completed_at,
            workout_log:workout_logs!inner(
              user_id,
              started_at,
              completed_at
            )
          `)
          .eq("exercise_id", exerciseId)
          .eq("workout_log.user_id", user.id)
          .not("workout_log.completed_at", "is", null)
          .order("completed_at", { ascending: false });

        if (logsError) {
          console.warn("[useExercise] Failed to fetch history:", logsError);
        } else if (logsData && logsData.length > 0) {
          // Cast to typed array
          const typedLogs = logsData as unknown as SetLogWithWorkout[];

          // Group sets by workout date
          const workoutMap = new Map<string, {
            date: Date;
            sets: number;
            totalReps: number;
            maxWeight: number;
            totalVolume: number;
          }>();

          let prWeight = 0;
          let prReps = 0;
          let prDate: Date | null = null;

          typedLogs.forEach((log) => {
            const workoutLog = log.workout_log;
            const dateKey = new Date(workoutLog.started_at).toDateString();
            const weight = log.actual_weight || 0;
            const reps = log.actual_reps || 0;

            // Track personal record (highest weight with at least 1 rep)
            if (weight > prWeight && reps >= 1) {
              prWeight = weight;
              prReps = reps;
              prDate = new Date(log.completed_at);
            }

            // Group by date
            const existing = workoutMap.get(dateKey);
            if (existing) {
              existing.sets += 1;
              existing.totalReps += reps;
              existing.maxWeight = Math.max(existing.maxWeight, weight);
              existing.totalVolume += weight * reps;
            } else {
              workoutMap.set(dateKey, {
                date: new Date(workoutLog.started_at),
                sets: 1,
                totalReps: reps,
                maxWeight: weight,
                totalVolume: weight * reps,
              });
            }
          });

          // Convert to array and sort by date (newest first)
          const historyArray = Array.from(workoutMap.values())
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 10); // Limit to 10 recent entries

          setHistory(historyArray);

          if (prDate && prWeight > 0) {
            setPersonalRecord({
              weight: prWeight,
              reps: prReps,
              date: prDate,
            });
          }
        }
      }
    } catch (err) {
      console.error("[useExercise] Error:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch exercise"));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, exerciseId, user?.id]);

  useEffect(() => {
    fetchExercise();
  }, [fetchExercise]);

  return {
    exercise,
    history,
    personalRecord,
    isLoading,
    error,
    refetch: fetchExercise,
  };
}
