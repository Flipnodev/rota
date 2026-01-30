-- Migration: Add explicit user program tracking
-- Creates a user_programs table to track which programs users have started
-- and which one is currently active

-- ============================================================================
-- CREATE TABLE
-- ============================================================================

create type program_status as enum ('active', 'paused', 'completed');

create table public.user_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  status program_status not null default 'active',
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- Each user can only have one instance of each program
  unique(user_id, program_id)
);

-- Trigger for updated_at
create trigger user_programs_updated_at
  before update on public.user_programs
  for each row execute function update_updated_at();

-- ============================================================================
-- INDEXES
-- ============================================================================

create index idx_user_programs_user_id on public.user_programs(user_id);
create index idx_user_programs_status on public.user_programs(user_id, status) where status = 'active';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.user_programs enable row level security;

create policy "Users can view own user_programs"
  on public.user_programs for select
  using (user_id = auth.uid());

create policy "Users can insert own user_programs"
  on public.user_programs for insert
  with check (user_id = auth.uid());

create policy "Users can update own user_programs"
  on public.user_programs for update
  using (user_id = auth.uid());

create policy "Users can delete own user_programs"
  on public.user_programs for delete
  using (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to start a program (links user to existing program, no copying)
create or replace function public.start_program(p_program_id uuid)
returns jsonb as $$
declare
  v_user_id uuid;
  v_user_program_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Check if program exists
  if not exists (select 1 from public.programs where id = p_program_id) then
    return jsonb_build_object('success', false, 'error', 'Program not found');
  end if;

  -- Pause any currently active programs for this user
  update public.user_programs
  set status = 'paused', updated_at = now()
  where user_id = v_user_id and status = 'active';

  -- Check if user already has this program in user_programs
  select id into v_user_program_id
  from public.user_programs
  where user_id = v_user_id and program_id = p_program_id;

  if v_user_program_id is not null then
    -- Reactivate existing entry
    update public.user_programs
    set status = 'active', updated_at = now()
    where id = v_user_program_id;
  else
    -- Create new entry linking to the program
    insert into public.user_programs (user_id, program_id, status)
    values (v_user_id, p_program_id, 'active')
    returning id into v_user_program_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'user_program_id', v_user_program_id,
    'program_id', p_program_id
  );
end;
$$ language plpgsql security definer;

-- Function to get user's active program with full details
create or replace function public.get_active_program()
returns jsonb as $$
declare
  v_user_id uuid;
  v_result jsonb;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    return null;
  end if;

  select jsonb_build_object(
    'user_program', jsonb_build_object(
      'id', up.id,
      'status', up.status,
      'started_at', up.started_at
    ),
    'program', jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'description', p.description,
      'duration_weeks', p.duration_weeks,
      'days_per_week', p.days_per_week,
      'difficulty', p.difficulty,
      'goal', p.goal
    ),
    'progress', jsonb_build_object(
      'completed_workouts', (
        select count(*)::int
        from public.workout_logs wl
        join public.workouts w on w.id = wl.workout_id
        where wl.user_id = v_user_id
        and w.program_id = p.id
        and wl.completed_at is not null
      ),
      'total_workouts', p.duration_weeks * p.days_per_week
    )
  ) into v_result
  from public.user_programs up
  join public.programs p on p.id = up.program_id
  where up.user_id = v_user_id and up.status = 'active'
  limit 1;

  return v_result;
end;
$$ language plpgsql security definer;

-- Function to complete the active program
create or replace function public.complete_active_program()
returns jsonb as $$
declare
  v_user_id uuid;
  v_user_program_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  update public.user_programs
  set status = 'completed', completed_at = now(), updated_at = now()
  where user_id = v_user_id and status = 'active'
  returning id into v_user_program_id;

  if v_user_program_id is null then
    return jsonb_build_object('success', false, 'error', 'No active program');
  end if;

  return jsonb_build_object('success', true, 'user_program_id', v_user_program_id);
end;
$$ language plpgsql security definer;
