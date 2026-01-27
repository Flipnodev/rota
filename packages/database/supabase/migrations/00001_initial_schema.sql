-- ROTA Database Schema
-- Initial migration: Core tables, enums, RLS policies, and indexes

-- ============================================================================
-- ENUMS
-- ============================================================================

create type difficulty_level as enum ('beginner', 'intermediate', 'advanced');
create type program_goal as enum ('strength', 'hypertrophy', 'endurance', 'general');
create type muscle_group as enum (
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'obliques', 'quads', 'hamstrings', 'glutes', 'calves', 'traps', 'lats'
);
create type equipment_type as enum (
  'barbell', 'dumbbell', 'kettlebell', 'cable', 'machine',
  'bodyweight', 'resistance_band', 'bench', 'pull_up_bar', 'none'
);
create type subscription_status as enum ('active', 'cancelled', 'expired', 'trial');
create type subscription_plan as enum ('free', 'premium', 'lifetime');
create type subscription_provider as enum ('apple', 'google', 'stripe', 'manual');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- TABLES
-- ============================================================================

-- --------------------------------------------------------------------------
-- Users (extends Supabase auth.users)
-- --------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  onboarding_completed boolean default false,
  onboarding_data jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

-- --------------------------------------------------------------------------
-- Exercises (Master exercise library)
-- --------------------------------------------------------------------------
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  muscle_groups muscle_group[] not null default '{}',
  equipment equipment_type[] not null default '{}',
  instructions text[],
  is_custom boolean default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger exercises_updated_at
  before update on public.exercises
  for each row execute function update_updated_at();

-- --------------------------------------------------------------------------
-- Programs (Workout program templates)
-- --------------------------------------------------------------------------
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_weeks integer not null check (duration_weeks > 0),
  days_per_week integer not null check (days_per_week between 1 and 7),
  difficulty difficulty_level not null,
  goal program_goal not null,
  equipment equipment_type[] not null default '{}',
  is_template boolean default false,
  is_public boolean default false,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger programs_updated_at
  before update on public.programs
  for each row execute function update_updated_at();

-- --------------------------------------------------------------------------
-- Workouts (Individual sessions within a program)
-- --------------------------------------------------------------------------
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  name text not null,
  day_of_week integer not null check (day_of_week between 1 and 7),
  week_number integer not null check (week_number > 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger workouts_updated_at
  before update on public.workouts
  for each row execute function update_updated_at();

-- --------------------------------------------------------------------------
-- Workout Exercises (Junction: workouts <-> exercises)
-- --------------------------------------------------------------------------
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  sort_order integer not null default 0,
  notes text,
  created_at timestamptz default now() not null
);

-- --------------------------------------------------------------------------
-- Exercise Sets (Target specifications per exercise)
-- --------------------------------------------------------------------------
create table public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  set_number integer not null check (set_number > 0),
  target_reps integer not null check (target_reps > 0),
  target_weight decimal(6,2),
  rest_seconds integer default 60 check (rest_seconds >= 0),
  created_at timestamptz default now() not null
);

-- --------------------------------------------------------------------------
-- Workout Logs (Completed workout sessions)
-- --------------------------------------------------------------------------
create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  program_id uuid references public.programs(id) on delete set null,
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  duration_seconds integer,
  notes text,
  created_at timestamptz default now() not null
);

-- --------------------------------------------------------------------------
-- Set Logs (Actual performance data per set)
-- --------------------------------------------------------------------------
create table public.set_logs (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid not null references public.workout_logs(id) on delete cascade,
  exercise_set_id uuid not null references public.exercise_sets(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  actual_reps integer not null check (actual_reps >= 0),
  actual_weight decimal(6,2) not null default 0,
  rpe decimal(3,1) check (rpe between 1 and 10),
  completed_at timestamptz default now() not null
);

-- --------------------------------------------------------------------------
-- Subscriptions (Premium entitlements)
-- --------------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status subscription_status not null default 'trial',
  plan subscription_plan not null default 'free',
  provider subscription_provider not null,
  provider_subscription_id text,
  provider_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  unique(user_id)
);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function update_updated_at();

-- --------------------------------------------------------------------------
-- Coupons (Discount codes)
-- --------------------------------------------------------------------------
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_percent integer check (discount_percent between 1 and 100),
  discount_months integer,
  grants_lifetime boolean default false,
  max_uses integer,
  times_used integer default 0,
  valid_from timestamptz default now(),
  valid_until timestamptz,
  is_active boolean default true,
  created_at timestamptz default now() not null
);

-- --------------------------------------------------------------------------
-- Coupon Redemptions (Track who used what)
-- --------------------------------------------------------------------------
create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  redeemed_at timestamptz default now() not null,

  unique(coupon_id, user_id)
);

-- --------------------------------------------------------------------------
-- Admin Audit Log
-- --------------------------------------------------------------------------
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now() not null
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles
create index idx_profiles_email on public.profiles(email);

-- Exercises
create index idx_exercises_name on public.exercises(name);
create index idx_exercises_muscle_groups on public.exercises using gin(muscle_groups);
create index idx_exercises_equipment on public.exercises using gin(equipment);
create index idx_exercises_created_by on public.exercises(created_by) where created_by is not null;

-- Programs
create index idx_programs_user_id on public.programs(user_id);
create index idx_programs_is_template on public.programs(is_template) where is_template = true;
create index idx_programs_goal on public.programs(goal);
create index idx_programs_difficulty on public.programs(difficulty);

-- Workouts
create index idx_workouts_program_id on public.workouts(program_id);
create index idx_workouts_week_day on public.workouts(week_number, day_of_week);

-- Workout Exercises
create index idx_workout_exercises_workout_id on public.workout_exercises(workout_id);
create index idx_workout_exercises_exercise_id on public.workout_exercises(exercise_id);

-- Exercise Sets
create index idx_exercise_sets_workout_exercise_id on public.exercise_sets(workout_exercise_id);

-- Workout Logs
create index idx_workout_logs_user_id on public.workout_logs(user_id);
create index idx_workout_logs_workout_id on public.workout_logs(workout_id);
create index idx_workout_logs_started_at on public.workout_logs(started_at desc);
create index idx_workout_logs_user_date on public.workout_logs(user_id, started_at desc);

-- Set Logs
create index idx_set_logs_workout_log_id on public.set_logs(workout_log_id);
create index idx_set_logs_exercise_id on public.set_logs(exercise_id);

-- Subscriptions
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_subscriptions_provider_id on public.subscriptions(provider_subscription_id)
  where provider_subscription_id is not null;

-- Coupons
create index idx_coupons_code on public.coupons(code);
create index idx_coupons_active on public.coupons(is_active) where is_active = true;

-- Audit Log
create index idx_audit_log_admin_id on public.audit_log(admin_id);
create index idx_audit_log_entity on public.audit_log(entity_type, entity_id);
create index idx_audit_log_created_at on public.audit_log(created_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.programs enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.exercise_sets enable row level security;
alter table public.workout_logs enable row level security;
alter table public.set_logs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.audit_log enable row level security;

-- --------------------------------------------------------------------------
-- Profiles Policies
-- --------------------------------------------------------------------------
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- --------------------------------------------------------------------------
-- Exercises Policies
-- --------------------------------------------------------------------------
create policy "Anyone can view non-custom exercises"
  on public.exercises for select
  using (is_custom = false or created_by = auth.uid());

create policy "Users can create custom exercises"
  on public.exercises for insert
  with check (auth.uid() = created_by and is_custom = true);

create policy "Users can update own custom exercises"
  on public.exercises for update
  using (created_by = auth.uid() and is_custom = true);

create policy "Users can delete own custom exercises"
  on public.exercises for delete
  using (created_by = auth.uid() and is_custom = true);

-- --------------------------------------------------------------------------
-- Programs Policies
-- --------------------------------------------------------------------------
create policy "Users can view template programs"
  on public.programs for select
  using (is_template = true or user_id = auth.uid());

create policy "Users can create own programs"
  on public.programs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own programs"
  on public.programs for update
  using (user_id = auth.uid());

create policy "Users can delete own programs"
  on public.programs for delete
  using (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- Workouts Policies
-- --------------------------------------------------------------------------
create policy "Users can view workouts of accessible programs"
  on public.workouts for select
  using (
    exists (
      select 1 from public.programs p
      where p.id = program_id
      and (p.is_template = true or p.user_id = auth.uid())
    )
  );

create policy "Users can create workouts in own programs"
  on public.workouts for insert
  with check (
    exists (
      select 1 from public.programs p
      where p.id = program_id and p.user_id = auth.uid()
    )
  );

create policy "Users can update workouts in own programs"
  on public.workouts for update
  using (
    exists (
      select 1 from public.programs p
      where p.id = program_id and p.user_id = auth.uid()
    )
  );

create policy "Users can delete workouts in own programs"
  on public.workouts for delete
  using (
    exists (
      select 1 from public.programs p
      where p.id = program_id and p.user_id = auth.uid()
    )
  );

-- --------------------------------------------------------------------------
-- Workout Exercises Policies
-- --------------------------------------------------------------------------
create policy "Users can view workout exercises of accessible workouts"
  on public.workout_exercises for select
  using (
    exists (
      select 1 from public.workouts w
      join public.programs p on p.id = w.program_id
      where w.id = workout_id
      and (p.is_template = true or p.user_id = auth.uid())
    )
  );

create policy "Users can manage workout exercises in own programs"
  on public.workout_exercises for all
  using (
    exists (
      select 1 from public.workouts w
      join public.programs p on p.id = w.program_id
      where w.id = workout_id and p.user_id = auth.uid()
    )
  );

-- --------------------------------------------------------------------------
-- Exercise Sets Policies
-- --------------------------------------------------------------------------
create policy "Users can view sets of accessible workout exercises"
  on public.exercise_sets for select
  using (
    exists (
      select 1 from public.workout_exercises we
      join public.workouts w on w.id = we.workout_id
      join public.programs p on p.id = w.program_id
      where we.id = workout_exercise_id
      and (p.is_template = true or p.user_id = auth.uid())
    )
  );

create policy "Users can manage sets in own programs"
  on public.exercise_sets for all
  using (
    exists (
      select 1 from public.workout_exercises we
      join public.workouts w on w.id = we.workout_id
      join public.programs p on p.id = w.program_id
      where we.id = workout_exercise_id and p.user_id = auth.uid()
    )
  );

-- --------------------------------------------------------------------------
-- Workout Logs Policies
-- --------------------------------------------------------------------------
create policy "Users can view own workout logs"
  on public.workout_logs for select
  using (user_id = auth.uid());

create policy "Users can create own workout logs"
  on public.workout_logs for insert
  with check (user_id = auth.uid());

create policy "Users can update own workout logs"
  on public.workout_logs for update
  using (user_id = auth.uid());

create policy "Users can delete own workout logs"
  on public.workout_logs for delete
  using (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- Set Logs Policies
-- --------------------------------------------------------------------------
create policy "Users can view own set logs"
  on public.set_logs for select
  using (
    exists (
      select 1 from public.workout_logs wl
      where wl.id = workout_log_id and wl.user_id = auth.uid()
    )
  );

create policy "Users can manage own set logs"
  on public.set_logs for all
  using (
    exists (
      select 1 from public.workout_logs wl
      where wl.id = workout_log_id and wl.user_id = auth.uid()
    )
  );

-- --------------------------------------------------------------------------
-- Subscriptions Policies
-- --------------------------------------------------------------------------
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (user_id = auth.uid());

-- Note: Insert/Update handled by server-side functions only

-- --------------------------------------------------------------------------
-- Coupons Policies
-- --------------------------------------------------------------------------
create policy "Users can view active coupons by code"
  on public.coupons for select
  using (is_active = true);

-- Note: Insert/Update/Delete handled by admin functions only

-- --------------------------------------------------------------------------
-- Coupon Redemptions Policies
-- --------------------------------------------------------------------------
create policy "Users can view own redemptions"
  on public.coupon_redemptions for select
  using (user_id = auth.uid());

create policy "Users can redeem coupons"
  on public.coupon_redemptions for insert
  with check (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- Audit Log Policies
-- --------------------------------------------------------------------------
-- Audit log is admin-only, no public access
-- Access controlled via service role key

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  -- Create free subscription
  insert into public.subscriptions (user_id, status, plan, provider)
  values (new.id, 'trial', 'free', 'manual');

  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to check if user has premium access
create or replace function public.has_premium_access(check_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.subscriptions
    where user_id = check_user_id
    and status = 'active'
    and plan in ('premium', 'lifetime')
    and (current_period_end is null or current_period_end > now())
  );
end;
$$ language plpgsql security definer;

-- Function to redeem a coupon
create or replace function public.redeem_coupon(coupon_code text)
returns jsonb as $$
declare
  v_coupon record;
  v_user_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Get and lock the coupon
  select * into v_coupon
  from public.coupons
  where code = upper(coupon_code)
  and is_active = true
  and (valid_from is null or valid_from <= now())
  and (valid_until is null or valid_until > now())
  and (max_uses is null or times_used < max_uses)
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Invalid or expired coupon');
  end if;

  -- Check if already redeemed
  if exists (
    select 1 from public.coupon_redemptions
    where coupon_id = v_coupon.id and user_id = v_user_id
  ) then
    return jsonb_build_object('success', false, 'error', 'Coupon already redeemed');
  end if;

  -- Record redemption
  insert into public.coupon_redemptions (coupon_id, user_id)
  values (v_coupon.id, v_user_id);

  -- Update coupon usage count
  update public.coupons
  set times_used = times_used + 1
  where id = v_coupon.id;

  -- Apply coupon effect
  if v_coupon.grants_lifetime then
    update public.subscriptions
    set status = 'active',
        plan = 'lifetime',
        provider = 'manual',
        updated_at = now()
    where user_id = v_user_id;
  elsif v_coupon.discount_months is not null then
    update public.subscriptions
    set status = 'active',
        plan = 'premium',
        provider = 'manual',
        current_period_end = coalesce(current_period_end, now()) + (v_coupon.discount_months || ' months')::interval,
        updated_at = now()
    where user_id = v_user_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'grants_lifetime', v_coupon.grants_lifetime,
    'discount_months', v_coupon.discount_months
  );
end;
$$ language plpgsql security definer;

-- Function to copy a template program to user's account
create or replace function public.copy_program_to_user(template_program_id uuid)
returns uuid as $$
declare
  v_user_id uuid;
  v_new_program_id uuid;
  v_workout record;
  v_new_workout_id uuid;
  v_we record;
  v_new_we_id uuid;
  v_set record;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Copy the program
  insert into public.programs (name, description, duration_weeks, days_per_week, difficulty, goal, equipment, is_template, user_id)
  select name, description, duration_weeks, days_per_week, difficulty, goal, equipment, false, v_user_id
  from public.programs
  where id = template_program_id and is_template = true
  returning id into v_new_program_id;

  if v_new_program_id is null then
    raise exception 'Template program not found';
  end if;

  -- Copy workouts
  for v_workout in
    select * from public.workouts where program_id = template_program_id
  loop
    insert into public.workouts (program_id, name, day_of_week, week_number)
    values (v_new_program_id, v_workout.name, v_workout.day_of_week, v_workout.week_number)
    returning id into v_new_workout_id;

    -- Copy workout exercises
    for v_we in
      select * from public.workout_exercises where workout_id = v_workout.id
    loop
      insert into public.workout_exercises (workout_id, exercise_id, sort_order, notes)
      values (v_new_workout_id, v_we.exercise_id, v_we.sort_order, v_we.notes)
      returning id into v_new_we_id;

      -- Copy exercise sets
      for v_set in
        select * from public.exercise_sets where workout_exercise_id = v_we.id
      loop
        insert into public.exercise_sets (workout_exercise_id, set_number, target_reps, target_weight, rest_seconds)
        values (v_new_we_id, v_set.set_number, v_set.target_reps, v_set.target_weight, v_set.rest_seconds);
      end loop;
    end loop;
  end loop;

  return v_new_program_id;
end;
$$ language plpgsql security definer;
