import { useEffect, useState, useCallback } from "react";
import { useDatabase } from "@/providers/database-provider";
import type { Exercise, MuscleGroup } from "@rota/database";

interface UseExercisesOptions {
  muscleGroup?: MuscleGroup;
  limit?: number;
}

interface UseExercisesReturn {
  exercises: Exercise[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useExercises(options: UseExercisesOptions = {}): UseExercisesReturn {
  const { supabase } = useDatabase();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { muscleGroup, limit } = options;

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("exercises")
        .select("*")
        .order("name", { ascending: true });

      // Filter by muscle group if specified
      if (muscleGroup) {
        query = query.contains("muscle_groups", [muscleGroup]);
      }

      // Limit results if specified
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw new Error(queryError.message);
      }

      setExercises(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch exercises"));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, muscleGroup, limit]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return {
    exercises,
    isLoading,
    error,
    refetch: fetchExercises,
  };
}
