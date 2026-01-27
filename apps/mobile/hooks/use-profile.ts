import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";
import type { Profile } from "@rota/database";

interface UseProfileReturn {
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (queryError) {
        throw new Error(queryError.message);
      }

      setProfile(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch profile")
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.id]);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user?.id) {
        throw new Error("No user logged in");
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Refetch to get updated data
      await fetchProfile();
    },
    [supabase, user?.id, fetchProfile]
  );

  // Refetch when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}
