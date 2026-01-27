-- Migration: Add premium programs support
-- Adds is_premium flag to programs and updates RLS policies

-- ============================================================================
-- ADD COLUMN
-- ============================================================================

alter table public.programs
  add column is_premium boolean default false not null;

-- Add index for premium program queries
create index idx_programs_is_premium on public.programs(is_premium) where is_premium = true;

-- ============================================================================
-- UPDATE RLS POLICIES
-- ============================================================================

-- Drop the existing policy
drop policy if exists "Users can view template programs" on public.programs;

-- Create new policy that checks premium access
-- Users can view programs if:
-- 1. It's their own program (user_id matches)
-- 2. OR it's a public template that is NOT premium
-- 3. OR it's a public template that IS premium AND user has premium access
create policy "Users can view accessible programs"
  on public.programs for select
  using (
    user_id = auth.uid()
    or (
      is_template = true
      and is_public = true
      and (
        is_premium = false
        or public.has_premium_access(auth.uid())
      )
    )
  );

-- ============================================================================
-- UPDATE SEED DATA
-- ============================================================================

-- Mark the existing "Push Pull Legs - Beginner" as public (it's already a template)
update public.programs
set is_public = true
where is_template = true;
