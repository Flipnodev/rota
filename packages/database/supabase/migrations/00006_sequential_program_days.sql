-- Migration: Change to sequential day-based program scheduling
-- Programs now use Day 1, Day 2, etc. instead of days of the week
-- started_at is set when the user begins their first workout, not when they select the program

-- ============================================================================
-- ALTER TABLE
-- ============================================================================

-- Make started_at nullable (will be set on first workout)
ALTER TABLE public.user_programs ALTER COLUMN started_at DROP NOT NULL;
ALTER TABLE public.user_programs ALTER COLUMN started_at DROP DEFAULT;

-- ============================================================================
-- UPDATE FUNCTIONS
-- ============================================================================

-- Update start_program to not set started_at (program is "selected" but not "started")
CREATE OR REPLACE FUNCTION public.start_program(p_program_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_user_program_id uuid;
  v_existing_started_at timestamptz;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check if program exists
  IF NOT EXISTS (SELECT 1 FROM public.programs WHERE id = p_program_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Program not found');
  END IF;

  -- Pause any currently active programs for this user
  UPDATE public.user_programs
  SET status = 'paused', updated_at = now()
  WHERE user_id = v_user_id AND status = 'active';

  -- Check if user already has this program in user_programs
  SELECT id, started_at INTO v_user_program_id, v_existing_started_at
  FROM public.user_programs
  WHERE user_id = v_user_id AND program_id = p_program_id;

  IF v_user_program_id IS NOT NULL THEN
    -- Reactivate existing entry (keep started_at if already set)
    UPDATE public.user_programs
    SET status = 'active', updated_at = now()
    WHERE id = v_user_program_id;
  ELSE
    -- Create new entry with started_at = NULL (will be set on first workout)
    INSERT INTO public.user_programs (user_id, program_id, status, started_at)
    VALUES (v_user_id, p_program_id, 'active', NULL)
    RETURNING id INTO v_user_program_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_program_id', v_user_program_id,
    'program_id', p_program_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark program as started (called when first workout begins)
CREATE OR REPLACE FUNCTION public.start_program_workout(p_program_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_user_program_id uuid;
  v_started_at timestamptz;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get the active user_program entry
  SELECT id, started_at INTO v_user_program_id, v_started_at
  FROM public.user_programs
  WHERE user_id = v_user_id AND program_id = p_program_id AND status = 'active';

  IF v_user_program_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active program found');
  END IF;

  -- Only set started_at if not already set (first workout)
  IF v_started_at IS NULL THEN
    UPDATE public.user_programs
    SET started_at = now(), updated_at = now()
    WHERE id = v_user_program_id
    RETURNING started_at INTO v_started_at;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_program_id', v_user_program_id,
    'started_at', v_started_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
