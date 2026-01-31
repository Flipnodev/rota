-- Migration: Add support for cardio/running exercises
-- Adds exercise_type to exercises and duration/distance fields to exercise_sets

-- Add exercise_type enum
create type public.exercise_type as enum ('strength', 'cardio', 'flexibility', 'other');

-- Add exercise_type column to exercises table
alter table public.exercises
  add column exercise_type public.exercise_type not null default 'strength';

-- Add cardio-specific fields to exercise_sets
alter table public.exercise_sets
  add column target_duration_seconds integer null,
  add column target_distance_meters integer null;

-- Update existing running/cardio exercises to have correct type
update public.exercises
set exercise_type = 'cardio'
where name ilike '%run%'
   or name ilike '%sprint%'
   or name ilike '%interval%'
   or name ilike '%rowing%'
   or name ilike '%ski erg%'
   or name ilike '%burpee%'
   or name ilike '%jump%'
   or name ilike '%cardio%';

-- Add index for exercise_type
create index idx_exercises_type on public.exercises(exercise_type);
