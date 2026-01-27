-- ============================================================================
-- SEED DATA: Exercises, Programs, Workouts, and Sets
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Temporarily disable RLS for seeding
alter table public.exercises disable row level security;
alter table public.programs disable row level security;
alter table public.workouts disable row level security;
alter table public.workout_exercises disable row level security;
alter table public.exercise_sets disable row level security;

-- ============================================================================
-- EXERCISES (using 'a' prefix - valid hex)
-- ============================================================================

INSERT INTO public.exercises (id, name, description, muscle_groups, equipment, instructions, is_custom) VALUES
-- Chest exercises
('a0000001-0001-0001-0001-000000000001', 'Barbell Bench Press', 'The king of chest exercises. Lie on a flat bench and press the barbell up.', ARRAY['chest', 'triceps', 'shoulders']::muscle_group[], ARRAY['barbell', 'bench']::equipment_type[], ARRAY['Lie flat on bench with feet on floor', 'Grip bar slightly wider than shoulder width', 'Lower bar to mid-chest', 'Press up until arms are extended'], false),
('a0000001-0001-0001-0001-000000000002', 'Incline Dumbbell Press', 'Targets the upper chest. Perform on an incline bench set to 30-45 degrees.', ARRAY['chest', 'shoulders', 'triceps']::muscle_group[], ARRAY['dumbbell', 'bench']::equipment_type[], ARRAY['Set bench to 30-45 degree incline', 'Hold dumbbells at shoulder level', 'Press up and together', 'Lower with control'], false),
('a0000001-0001-0001-0001-000000000003', 'Cable Flyes', 'Isolation exercise for the chest using cables for constant tension.', ARRAY['chest']::muscle_group[], ARRAY['cable']::equipment_type[], ARRAY['Set cables to shoulder height', 'Step forward with slight lean', 'Bring handles together in arc motion', 'Squeeze chest at the top'], false),
('a0000001-0001-0001-0001-000000000004', 'Push-ups', 'Classic bodyweight chest exercise.', ARRAY['chest', 'triceps', 'shoulders']::muscle_group[], ARRAY['bodyweight']::equipment_type[], ARRAY['Start in plank position', 'Lower chest to floor', 'Push back up', 'Keep core tight throughout'], false),

-- Back exercises
('a0000001-0001-0001-0001-000000000005', 'Barbell Row', 'Compound back exercise for thickness.', ARRAY['back', 'lats', 'biceps']::muscle_group[], ARRAY['barbell']::equipment_type[], ARRAY['Bend at hips with flat back', 'Pull bar to lower chest', 'Squeeze shoulder blades', 'Lower with control'], false),
('a0000001-0001-0001-0001-000000000006', 'Pull-ups', 'The ultimate back builder using bodyweight.', ARRAY['lats', 'back', 'biceps']::muscle_group[], ARRAY['pull_up_bar', 'bodyweight']::equipment_type[], ARRAY['Hang with arms extended', 'Pull up until chin over bar', 'Lower with control', 'Avoid swinging'], false),
('a0000001-0001-0001-0001-000000000007', 'Lat Pulldown', 'Machine alternative to pull-ups.', ARRAY['lats', 'back', 'biceps']::muscle_group[], ARRAY['cable', 'machine']::equipment_type[], ARRAY['Grip bar wider than shoulders', 'Pull down to upper chest', 'Squeeze lats at bottom', 'Control the weight up'], false),
('a0000001-0001-0001-0001-000000000008', 'Seated Cable Row', 'Horizontal pulling for back thickness.', ARRAY['back', 'lats', 'biceps']::muscle_group[], ARRAY['cable', 'machine']::equipment_type[], ARRAY['Sit with feet on platform', 'Pull handle to stomach', 'Keep back straight', 'Squeeze shoulder blades'], false),
('a0000001-0001-0001-0001-000000000009', 'Face Pulls', 'Rear delt and upper back exercise for posture.', ARRAY['shoulders', 'back', 'traps']::muscle_group[], ARRAY['cable']::equipment_type[], ARRAY['Set cable to face height', 'Pull rope to face', 'Spread hands apart at end', 'Squeeze rear delts'], false),

-- Shoulder exercises
('a0000001-0001-0001-0001-000000000010', 'Overhead Press', 'Primary shoulder builder.', ARRAY['shoulders', 'triceps']::muscle_group[], ARRAY['barbell']::equipment_type[], ARRAY['Start bar at shoulders', 'Press overhead', 'Lock out at top', 'Lower with control'], false),
('a0000001-0001-0001-0001-000000000011', 'Lateral Raises', 'Isolation for side delts.', ARRAY['shoulders']::muscle_group[], ARRAY['dumbbell']::equipment_type[], ARRAY['Hold dumbbells at sides', 'Raise arms to shoulder height', 'Slight bend in elbows', 'Lower slowly'], false),
('a0000001-0001-0001-0001-000000000012', 'Front Raises', 'Targets the front deltoids.', ARRAY['shoulders']::muscle_group[], ARRAY['dumbbell']::equipment_type[], ARRAY['Hold dumbbells in front of thighs', 'Raise one arm to shoulder height', 'Lower and alternate', 'Keep core stable'], false),

-- Arm exercises
('a0000001-0001-0001-0001-000000000013', 'Barbell Curl', 'Classic bicep builder.', ARRAY['biceps']::muscle_group[], ARRAY['barbell']::equipment_type[], ARRAY['Stand with barbell at thighs', 'Curl up keeping elbows fixed', 'Squeeze at top', 'Lower with control'], false),
('a0000001-0001-0001-0001-000000000014', 'Hammer Curls', 'Neutral grip targets brachialis.', ARRAY['biceps', 'forearms']::muscle_group[], ARRAY['dumbbell']::equipment_type[], ARRAY['Hold dumbbells with neutral grip', 'Curl up together or alternating', 'Keep elbows at sides', 'Control the negative'], false),
('a0000001-0001-0001-0001-000000000015', 'Tricep Pushdown', 'Cable tricep isolation.', ARRAY['triceps']::muscle_group[], ARRAY['cable']::equipment_type[], ARRAY['Grip bar or rope attachment', 'Push down until arms straight', 'Keep elbows at sides', 'Squeeze triceps at bottom'], false),
('a0000001-0001-0001-0001-000000000016', 'Overhead Tricep Extension', 'Stretches and works the long head.', ARRAY['triceps']::muscle_group[], ARRAY['dumbbell', 'cable']::equipment_type[], ARRAY['Hold weight overhead', 'Lower behind head', 'Extend back up', 'Keep elbows pointing up'], false),
('a0000001-0001-0001-0001-000000000017', 'Skull Crushers', 'Lying tricep extension.', ARRAY['triceps']::muscle_group[], ARRAY['barbell', 'bench']::equipment_type[], ARRAY['Lie on bench with bar extended', 'Lower bar to forehead', 'Extend back up', 'Keep upper arms vertical'], false),

-- Leg exercises
('a0000001-0001-0001-0001-000000000018', 'Barbell Squat', 'The king of leg exercises.', ARRAY['quads', 'glutes', 'hamstrings']::muscle_group[], ARRAY['barbell']::equipment_type[], ARRAY['Bar on upper back', 'Squat down until thighs parallel', 'Drive through heels', 'Keep chest up'], false),
('a0000001-0001-0001-0001-000000000019', 'Romanian Deadlift', 'Hip hinge for hamstrings and glutes.', ARRAY['hamstrings', 'glutes', 'back']::muscle_group[], ARRAY['barbell', 'dumbbell']::equipment_type[], ARRAY['Hold bar at thighs', 'Hinge at hips pushing butt back', 'Lower until hamstring stretch', 'Drive hips forward to stand'], false),
('a0000001-0001-0001-0001-000000000020', 'Leg Press', 'Machine compound leg exercise.', ARRAY['quads', 'glutes', 'hamstrings']::muscle_group[], ARRAY['machine']::equipment_type[], ARRAY['Sit with back flat on pad', 'Place feet shoulder width', 'Lower weight with control', 'Press through full foot'], false),
('a0000001-0001-0001-0001-000000000021', 'Leg Curl', 'Isolation for hamstrings.', ARRAY['hamstrings']::muscle_group[], ARRAY['machine']::equipment_type[], ARRAY['Lie face down on machine', 'Curl heels toward glutes', 'Squeeze at top', 'Lower with control'], false),
('a0000001-0001-0001-0001-000000000022', 'Leg Extension', 'Quad isolation exercise.', ARRAY['quads']::muscle_group[], ARRAY['machine']::equipment_type[], ARRAY['Sit with back against pad', 'Extend legs until straight', 'Squeeze quads at top', 'Lower slowly'], false),
('a0000001-0001-0001-0001-000000000023', 'Calf Raises', 'Standing calf exercise.', ARRAY['calves']::muscle_group[], ARRAY['machine', 'bodyweight']::equipment_type[], ARRAY['Stand on edge of platform', 'Lower heels below platform', 'Rise up on toes', 'Squeeze at top'], false),
('a0000001-0001-0001-0001-000000000024', 'Walking Lunges', 'Dynamic leg exercise.', ARRAY['quads', 'glutes', 'hamstrings']::muscle_group[], ARRAY['dumbbell', 'bodyweight']::equipment_type[], ARRAY['Step forward into lunge', 'Lower back knee toward ground', 'Push off front foot', 'Alternate legs'], false),

-- Core exercises
('a0000001-0001-0001-0001-000000000025', 'Plank', 'Core stability exercise.', ARRAY['abs', 'obliques']::muscle_group[], ARRAY['bodyweight']::equipment_type[], ARRAY['Forearms and toes on ground', 'Keep body in straight line', 'Engage core', 'Hold position'], false),
('a0000001-0001-0001-0001-000000000026', 'Cable Crunch', 'Weighted ab exercise.', ARRAY['abs']::muscle_group[], ARRAY['cable']::equipment_type[], ARRAY['Kneel facing cable machine', 'Hold rope behind head', 'Crunch down bringing elbows to knees', 'Control the return'], false),
('a0000001-0001-0001-0001-000000000027', 'Hanging Leg Raises', 'Advanced lower ab exercise.', ARRAY['abs', 'obliques']::muscle_group[], ARRAY['pull_up_bar']::equipment_type[], ARRAY['Hang from bar', 'Raise legs to parallel', 'Lower with control', 'Avoid swinging'], false)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  muscle_groups = EXCLUDED.muscle_groups,
  equipment = EXCLUDED.equipment,
  instructions = EXCLUDED.instructions;

-- ============================================================================
-- PROGRAM: Push Pull Legs - Beginner (using 'b' prefix - valid hex)
-- ============================================================================

INSERT INTO public.programs (id, name, description, duration_weeks, days_per_week, difficulty, goal, equipment, is_template, is_public, is_premium, user_id)
VALUES (
  'b0000001-0001-0001-0001-000000000001',
  'Push Pull Legs - Beginner',
  'A classic 3-day split perfect for beginners. Train push muscles (chest, shoulders, triceps), pull muscles (back, biceps), and legs on separate days. This program builds a solid foundation of strength and muscle.',
  8,
  3,
  'beginner',
  'hypertrophy',
  ARRAY['barbell', 'dumbbell', 'cable', 'machine', 'bench', 'pull_up_bar']::equipment_type[],
  true,
  true,
  false,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_template = EXCLUDED.is_template,
  is_public = EXCLUDED.is_public;

-- ============================================================================
-- WORKOUTS (using 'c' prefix - valid hex)
-- ============================================================================

-- Push Day (Monday - day_of_week = 1)
INSERT INTO public.workouts (id, program_id, name, day_of_week, week_number)
VALUES ('c0000001-0001-0001-0001-000000000001', 'b0000001-0001-0001-0001-000000000001', 'Push Day', 1, 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Pull Day (Wednesday - day_of_week = 3)
INSERT INTO public.workouts (id, program_id, name, day_of_week, week_number)
VALUES ('c0000001-0001-0001-0001-000000000002', 'b0000001-0001-0001-0001-000000000001', 'Pull Day', 3, 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Legs Day (Friday - day_of_week = 5)
INSERT INTO public.workouts (id, program_id, name, day_of_week, week_number)
VALUES ('c0000001-0001-0001-0001-000000000003', 'b0000001-0001-0001-0001-000000000001', 'Legs Day', 5, 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ============================================================================
-- WORKOUT EXERCISES (using 'd' prefix - valid hex)
-- ============================================================================

-- === PUSH DAY EXERCISES ===
INSERT INTO public.workout_exercises (id, workout_id, exercise_id, sort_order, notes) VALUES
('d0000001-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000001', 1, 'Main chest compound. Focus on controlled reps.'),
('d0000001-0001-0001-0001-000000000002', 'c0000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000002', 2, 'Upper chest focus. Keep shoulders back.'),
('d0000001-0001-0001-0001-000000000003', 'c0000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000010', 3, 'Strict form, no leg drive for beginners.'),
('d0000001-0001-0001-0001-000000000004', 'c0000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000011', 4, 'Light weight, focus on the squeeze.'),
('d0000001-0001-0001-0001-000000000005', 'c0000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000015', 5, 'Keep elbows tucked at sides.'),
('d0000001-0001-0001-0001-000000000006', 'c0000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000017', 6, 'Control the weight, protect your elbows.')
ON CONFLICT (id) DO UPDATE SET sort_order = EXCLUDED.sort_order, notes = EXCLUDED.notes;

-- === PULL DAY EXERCISES ===
INSERT INTO public.workout_exercises (id, workout_id, exercise_id, sort_order, notes) VALUES
('d0000001-0001-0001-0001-000000000007', 'c0000001-0001-0001-0001-000000000002', 'a0000001-0001-0001-0001-000000000005', 1, 'Main back compound. Keep back flat.'),
('d0000001-0001-0001-0001-000000000008', 'c0000001-0001-0001-0001-000000000002', 'a0000001-0001-0001-0001-000000000007', 2, 'Pull to upper chest, squeeze lats.'),
('d0000001-0001-0001-0001-000000000009', 'c0000001-0001-0001-0001-000000000002', 'a0000001-0001-0001-0001-000000000008', 3, 'Focus on squeezing shoulder blades.'),
('d0000001-0001-0001-0001-000000000010', 'c0000001-0001-0001-0001-000000000002', 'a0000001-0001-0001-0001-000000000009', 4, 'Great for rear delts and posture.'),
('d0000001-0001-0001-0001-000000000011', 'c0000001-0001-0001-0001-000000000002', 'a0000001-0001-0001-0001-000000000013', 5, 'No swinging, strict curls.'),
('d0000001-0001-0001-0001-000000000012', 'c0000001-0001-0001-0001-000000000002', 'a0000001-0001-0001-0001-000000000014', 6, 'Neutral grip hits the brachialis.')
ON CONFLICT (id) DO UPDATE SET sort_order = EXCLUDED.sort_order, notes = EXCLUDED.notes;

-- === LEGS DAY EXERCISES ===
INSERT INTO public.workout_exercises (id, workout_id, exercise_id, sort_order, notes) VALUES
('d0000001-0001-0001-0001-000000000013', 'c0000001-0001-0001-0001-000000000003', 'a0000001-0001-0001-0001-000000000018', 1, 'King of exercises. Depth is key.'),
('d0000001-0001-0001-0001-000000000014', 'c0000001-0001-0001-0001-000000000003', 'a0000001-0001-0001-0001-000000000019', 2, 'Feel the hamstring stretch.'),
('d0000001-0001-0001-0001-000000000015', 'c0000001-0001-0001-0001-000000000003', 'a0000001-0001-0001-0001-000000000020', 3, 'Foot placement affects muscle emphasis.'),
('d0000001-0001-0001-0001-000000000016', 'c0000001-0001-0001-0001-000000000003', 'a0000001-0001-0001-0001-000000000022', 4, 'Squeeze quads at the top.'),
('d0000001-0001-0001-0001-000000000017', 'c0000001-0001-0001-0001-000000000003', 'a0000001-0001-0001-0001-000000000021', 5, 'Full range of motion.'),
('d0000001-0001-0001-0001-000000000018', 'c0000001-0001-0001-0001-000000000003', 'a0000001-0001-0001-0001-000000000023', 6, 'Pause at the top for a squeeze.')
ON CONFLICT (id) DO UPDATE SET sort_order = EXCLUDED.sort_order, notes = EXCLUDED.notes;

-- ============================================================================
-- EXERCISE SETS (using 'e' prefix - valid hex)
-- ============================================================================

-- === PUSH DAY SETS ===
-- Bench Press: 4 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000001', 'd0000001-0001-0001-0001-000000000001', 1, 8, 60, 120),
('e0000001-0001-0001-0001-000000000002', 'd0000001-0001-0001-0001-000000000001', 2, 8, 60, 120),
('e0000001-0001-0001-0001-000000000003', 'd0000001-0001-0001-0001-000000000001', 3, 8, 60, 120),
('e0000001-0001-0001-0001-000000000004', 'd0000001-0001-0001-0001-000000000001', 4, 8, 60, 120)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Incline Dumbbell Press: 3 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000005', 'd0000001-0001-0001-0001-000000000002', 1, 10, 20, 90),
('e0000001-0001-0001-0001-000000000006', 'd0000001-0001-0001-0001-000000000002', 2, 10, 20, 90),
('e0000001-0001-0001-0001-000000000007', 'd0000001-0001-0001-0001-000000000002', 3, 10, 20, 90)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Overhead Press: 3 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000008', 'd0000001-0001-0001-0001-000000000003', 1, 8, 40, 120),
('e0000001-0001-0001-0001-000000000009', 'd0000001-0001-0001-0001-000000000003', 2, 8, 40, 120),
('e0000001-0001-0001-0001-000000000010', 'd0000001-0001-0001-0001-000000000003', 3, 8, 40, 120)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Lateral Raises: 3 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000011', 'd0000001-0001-0001-0001-000000000004', 1, 12, 8, 60),
('e0000001-0001-0001-0001-000000000012', 'd0000001-0001-0001-0001-000000000004', 2, 12, 8, 60),
('e0000001-0001-0001-0001-000000000013', 'd0000001-0001-0001-0001-000000000004', 3, 12, 8, 60)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Tricep Pushdown: 3 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000014', 'd0000001-0001-0001-0001-000000000005', 1, 12, 25, 60),
('e0000001-0001-0001-0001-000000000015', 'd0000001-0001-0001-0001-000000000005', 2, 12, 25, 60),
('e0000001-0001-0001-0001-000000000016', 'd0000001-0001-0001-0001-000000000005', 3, 12, 25, 60)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Skull Crushers: 3 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000017', 'd0000001-0001-0001-0001-000000000006', 1, 10, 20, 90),
('e0000001-0001-0001-0001-000000000018', 'd0000001-0001-0001-0001-000000000006', 2, 10, 20, 90),
('e0000001-0001-0001-0001-000000000019', 'd0000001-0001-0001-0001-000000000006', 3, 10, 20, 90)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- === PULL DAY SETS ===
-- Barbell Row: 4 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000020', 'd0000001-0001-0001-0001-000000000007', 1, 8, 50, 120),
('e0000001-0001-0001-0001-000000000021', 'd0000001-0001-0001-0001-000000000007', 2, 8, 50, 120),
('e0000001-0001-0001-0001-000000000022', 'd0000001-0001-0001-0001-000000000007', 3, 8, 50, 120),
('e0000001-0001-0001-0001-000000000023', 'd0000001-0001-0001-0001-000000000007', 4, 8, 50, 120)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Lat Pulldown: 3 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000024', 'd0000001-0001-0001-0001-000000000008', 1, 10, 45, 90),
('e0000001-0001-0001-0001-000000000025', 'd0000001-0001-0001-0001-000000000008', 2, 10, 45, 90),
('e0000001-0001-0001-0001-000000000026', 'd0000001-0001-0001-0001-000000000008', 3, 10, 45, 90)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Seated Cable Row: 3 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000027', 'd0000001-0001-0001-0001-000000000009', 1, 10, 40, 90),
('e0000001-0001-0001-0001-000000000028', 'd0000001-0001-0001-0001-000000000009', 2, 10, 40, 90),
('e0000001-0001-0001-0001-000000000029', 'd0000001-0001-0001-0001-000000000009', 3, 10, 40, 90)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Face Pulls: 3 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000030', 'd0000001-0001-0001-0001-000000000010', 1, 15, 15, 60),
('e0000001-0001-0001-0001-000000000031', 'd0000001-0001-0001-0001-000000000010', 2, 15, 15, 60),
('e0000001-0001-0001-0001-000000000032', 'd0000001-0001-0001-0001-000000000010', 3, 15, 15, 60)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Barbell Curl: 3 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000033', 'd0000001-0001-0001-0001-000000000011', 1, 10, 25, 60),
('e0000001-0001-0001-0001-000000000034', 'd0000001-0001-0001-0001-000000000011', 2, 10, 25, 60),
('e0000001-0001-0001-0001-000000000035', 'd0000001-0001-0001-0001-000000000011', 3, 10, 25, 60)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Hammer Curls: 3 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000036', 'd0000001-0001-0001-0001-000000000012', 1, 12, 12, 60),
('e0000001-0001-0001-0001-000000000037', 'd0000001-0001-0001-0001-000000000012', 2, 12, 12, 60),
('e0000001-0001-0001-0001-000000000038', 'd0000001-0001-0001-0001-000000000012', 3, 12, 12, 60)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- === LEGS DAY SETS ===
-- Barbell Squat: 4 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000039', 'd0000001-0001-0001-0001-000000000013', 1, 8, 70, 180),
('e0000001-0001-0001-0001-000000000040', 'd0000001-0001-0001-0001-000000000013', 2, 8, 70, 180),
('e0000001-0001-0001-0001-000000000041', 'd0000001-0001-0001-0001-000000000013', 3, 8, 70, 180),
('e0000001-0001-0001-0001-000000000042', 'd0000001-0001-0001-0001-000000000013', 4, 8, 70, 180)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Romanian Deadlift: 3 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000043', 'd0000001-0001-0001-0001-000000000014', 1, 10, 50, 120),
('e0000001-0001-0001-0001-000000000044', 'd0000001-0001-0001-0001-000000000014', 2, 10, 50, 120),
('e0000001-0001-0001-0001-000000000045', 'd0000001-0001-0001-0001-000000000014', 3, 10, 50, 120)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Leg Press: 3 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000046', 'd0000001-0001-0001-0001-000000000015', 1, 12, 100, 90),
('e0000001-0001-0001-0001-000000000047', 'd0000001-0001-0001-0001-000000000015', 2, 12, 100, 90),
('e0000001-0001-0001-0001-000000000048', 'd0000001-0001-0001-0001-000000000015', 3, 12, 100, 90)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Leg Extension: 3 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000049', 'd0000001-0001-0001-0001-000000000016', 1, 12, 35, 60),
('e0000001-0001-0001-0001-000000000050', 'd0000001-0001-0001-0001-000000000016', 2, 12, 35, 60),
('e0000001-0001-0001-0001-000000000051', 'd0000001-0001-0001-0001-000000000016', 3, 12, 35, 60)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Leg Curl: 3 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000052', 'd0000001-0001-0001-0001-000000000017', 1, 12, 30, 60),
('e0000001-0001-0001-0001-000000000053', 'd0000001-0001-0001-0001-000000000017', 2, 12, 30, 60),
('e0000001-0001-0001-0001-000000000054', 'd0000001-0001-0001-0001-000000000017', 3, 12, 30, 60)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- Calf Raises: 4 sets
INSERT INTO public.exercise_sets (id, workout_exercise_id, set_number, target_reps, target_weight, rest_seconds) VALUES
('e0000001-0001-0001-0001-000000000055', 'd0000001-0001-0001-0001-000000000018', 1, 15, 40, 45),
('e0000001-0001-0001-0001-000000000056', 'd0000001-0001-0001-0001-000000000018', 2, 15, 40, 45),
('e0000001-0001-0001-0001-000000000057', 'd0000001-0001-0001-0001-000000000018', 3, 15, 40, 45),
('e0000001-0001-0001-0001-000000000058', 'd0000001-0001-0001-0001-000000000018', 4, 15, 40, 45)
ON CONFLICT (id) DO UPDATE SET target_reps = EXCLUDED.target_reps, target_weight = EXCLUDED.target_weight;

-- ============================================================================
-- RE-ENABLE RLS
-- ============================================================================

alter table public.exercises enable row level security;
alter table public.programs enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.exercise_sets enable row level security;

-- ============================================================================
-- DONE!
-- ============================================================================
