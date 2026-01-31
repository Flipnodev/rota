-- Migration: Add cardio fields to set_logs for tracking actual duration and distance

-- Add cardio-specific fields to set_logs
ALTER TABLE public.set_logs
  ADD COLUMN actual_duration_seconds integer NULL,
  ADD COLUMN actual_distance_meters integer NULL;
