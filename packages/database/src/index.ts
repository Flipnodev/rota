// Re-export generated Supabase types
export * from './types';

// Re-export client helpers
export * from './client';

// Database table names for type-safe queries
export const Tables = {
  profiles: 'profiles',
  exercises: 'exercises',
  programs: 'programs',
  workouts: 'workouts',
  workout_exercises: 'workout_exercises',
  exercise_sets: 'exercise_sets',
  workout_logs: 'workout_logs',
  set_logs: 'set_logs',
  subscriptions: 'subscriptions',
  coupons: 'coupons',
  coupon_redemptions: 'coupon_redemptions',
  audit_log: 'audit_log',
  user_programs: 'user_programs',
} as const;

export type TableName = (typeof Tables)[keyof typeof Tables];
