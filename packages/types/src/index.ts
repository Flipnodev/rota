// User types
export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Program types
export interface Program {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  daysPerWeek: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  goal: "strength" | "hypertrophy" | "endurance" | "general";
  equipment: Equipment[];
  workouts: Workout[];
  isTemplate: boolean;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Workout types
export interface Workout {
  id: string;
  programId: string;
  name: string;
  dayOfWeek: number;
  weekNumber: number;
  exercises: WorkoutExercise[];
  createdAt: Date;
  updatedAt: Date;
}

// Exercise types
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  instructions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  exercise?: Exercise;
  order: number;
  sets: ExerciseSet[];
}

export interface ExerciseSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  targetReps: number;
  targetWeight?: number;
  restSeconds: number;
}

// Log types
export interface WorkoutLog {
  id: string;
  userId: string;
  workoutId: string;
  startedAt: Date;
  completedAt?: Date;
  setLogs: SetLog[];
}

export interface SetLog {
  id: string;
  workoutLogId: string;
  exerciseSetId: string;
  actualReps: number;
  actualWeight: number;
  rpe?: number;
  completedAt: Date;
}

// Subscription types
export interface Subscription {
  id: string;
  userId: string;
  status: "active" | "cancelled" | "expired" | "trial";
  plan: "free" | "premium" | "lifetime";
  provider: "apple" | "google" | "stripe" | "manual";
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "traps"
  | "lats";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "kettlebell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "resistance_band"
  | "bench"
  | "pull_up_bar"
  | "none";

// Onboarding types
export interface OnboardingData {
  goal: "strength" | "hypertrophy" | "endurance" | "general";
  experience: "beginner" | "intermediate" | "advanced";
  daysPerWeek: number;
  equipment: Equipment[];
}
