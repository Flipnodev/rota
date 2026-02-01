import { useEffect, useState, useCallback } from "react";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";
import { useSubscription } from "@/hooks/use-subscription";

// Extended Program type with is_premium field
interface Program {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number;
  days_per_week: number;
  difficulty: string;
  goal: string;
  equipment: string[];
  is_template: boolean;
  is_public: boolean;
  is_premium: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface PausedProgram extends Program {
  pausedAt: string | null;
}

interface UseProgramsReturn {
  programs: Program[];
  activeProgram: Program | null;
  pausedPrograms: PausedProgram[];
  templatePrograms: Program[];
  userPrograms: Program[];
  isPremium: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePrograms(): UseProgramsReturn {
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const { isPremium, isLoading: subscriptionLoading } = useSubscription();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [pausedPrograms, setPausedPrograms] = useState<PausedProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch user's own programs
      const userProgramsPromise = user?.id
        ? supabase
            .from("programs")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null });

      // Fetch template programs
      const templateProgramsPromise = supabase
        .from("programs")
        .select("*")
        .eq("is_template", true)
        .order("created_at", { ascending: false });

      // Fetch user's active program from user_programs table
      const activeProgramPromise = user?.id
        ? supabase
            .from("user_programs")
            .select("program:programs(*)")
            .eq("user_id", user.id)
            .eq("status", "active")
            .maybeSingle()
        : Promise.resolve({ data: null, error: null });

      // Fetch user's paused programs
      const pausedProgramsPromise = user?.id
        ? supabase
            .from("user_programs")
            .select("program:programs(*), updated_at")
            .eq("user_id", user.id)
            .eq("status", "paused")
            .order("updated_at", { ascending: false })
        : Promise.resolve({ data: [], error: null });

      const [userResult, templateResult, activeResult, pausedResult] = await Promise.all([
        userProgramsPromise,
        templateProgramsPromise,
        activeProgramPromise,
        pausedProgramsPromise,
      ]);

      if (userResult.error) {
        throw new Error(userResult.error.message);
      }
      if (templateResult.error) {
        throw new Error(templateResult.error.message);
      }
      if (activeResult.error) {
        throw new Error(activeResult.error.message);
      }
      if (pausedResult.error) {
        throw new Error(pausedResult.error.message);
      }

      // Combine and deduplicate programs
      const userProgramsList = (userResult.data || []) as Program[];
      const templateProgramsList = (templateResult.data || []) as Program[];

      const allPrograms = [...userProgramsList];
      const userProgramIds = new Set(allPrograms.map((p) => p.id));

      for (const template of templateProgramsList) {
        if (!userProgramIds.has(template.id)) {
          allPrograms.push(template);
        }
      }

      setPrograms(allPrograms);

      // Set active program from user_programs join
      const activeData = activeResult.data as { program: Program } | null;
      if (activeData?.program) {
        setActiveProgram(activeData.program);
      } else {
        setActiveProgram(null);
      }

      // Set paused programs
      const pausedData = (pausedResult.data || []) as Array<{ program: Program | null; updated_at: string }>;
      if (pausedData.length > 0) {
        const paused = pausedData
          .filter((item) => item.program !== null)
          .map((item) => ({
            ...(item.program as Program),
            pausedAt: item.updated_at,
          }));
        setPausedPrograms(paused);
      } else {
        setPausedPrograms([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch programs")
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.id]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Template programs for the library
  const templatePrograms = programs.filter((p) => p.is_template);

  // User's own programs (non-template)
  const userPrograms = programs.filter((p) => !p.is_template && p.user_id === user?.id);

  return {
    programs,
    activeProgram,
    pausedPrograms,
    templatePrograms,
    userPrograms,
    isPremium,
    isLoading: isLoading || subscriptionLoading,
    error,
    refetch: fetchPrograms,
  };
}
