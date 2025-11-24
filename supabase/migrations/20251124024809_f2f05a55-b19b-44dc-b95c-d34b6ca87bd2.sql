-- Function to upsert user progress
CREATE OR REPLACE FUNCTION public.upsert_user_progress(
  p_user_id UUID,
  p_exam_type TEXT,
  p_subject TEXT,
  p_topic TEXT,
  p_is_correct BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_progress (
    user_id,
    exam_type,
    subject,
    topic,
    questions_attempted,
    questions_correct,
    last_practice
  )
  VALUES (
    p_user_id,
    p_exam_type,
    p_subject,
    p_topic,
    1,
    CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    NOW()
  )
  ON CONFLICT (user_id, exam_type, subject, topic)
  DO UPDATE SET
    questions_attempted = user_progress.questions_attempted + 1,
    questions_correct = user_progress.questions_correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    last_practice = NOW(),
    updated_at = NOW();
END;
$$;

-- Function to award XP to users
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id UUID,
  p_xp_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_current_date DATE;
  v_last_activity DATE;
  v_new_streak INTEGER;
BEGIN
  v_current_date := CURRENT_DATE;
  
  -- Get current stats or create new
  INSERT INTO public.user_stats (user_id, total_xp, level, last_activity_date, current_streak)
  VALUES (p_user_id, 0, 1, v_current_date, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get last activity date
  SELECT last_activity_date INTO v_last_activity
  FROM public.user_stats
  WHERE user_id = p_user_id;
  
  -- Calculate new streak
  IF v_last_activity IS NULL THEN
    v_new_streak := 1;
  ELSIF v_current_date = v_last_activity THEN
    -- Same day, keep current streak
    SELECT current_streak INTO v_new_streak
    FROM public.user_stats
    WHERE user_id = p_user_id;
  ELSIF v_current_date = v_last_activity + INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    SELECT current_streak + 1 INTO v_new_streak
    FROM public.user_stats
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken, reset to 1
    v_new_streak := 1;
  END IF;
  
  -- Update stats
  UPDATE public.user_stats
  SET 
    total_xp = total_xp + p_xp_amount,
    level = FLOOR((total_xp + p_xp_amount) / 100) + 1,
    current_streak = v_new_streak,
    longest_streak = GREATEST(longest_streak, v_new_streak),
    last_activity_date = v_current_date,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Check for new achievements
  SELECT total_xp, level INTO v_new_xp, v_new_level
  FROM public.user_stats
  WHERE user_id = p_user_id;
  
  -- Award level-up badge
  IF v_new_level % 5 = 0 THEN
    UPDATE public.user_stats
    SET badges = badges || jsonb_build_array('Level ' || v_new_level || ' Master')
    WHERE user_id = p_user_id
    AND NOT badges @> jsonb_build_array('Level ' || v_new_level || ' Master');
  END IF;
  
  -- Award streak badges
  IF v_new_streak >= 7 THEN
    UPDATE public.user_stats
    SET badges = badges || jsonb_build_array('Week Warrior')
    WHERE user_id = p_user_id
    AND NOT badges @> jsonb_build_array('Week Warrior');
  END IF;
  
  IF v_new_streak >= 30 THEN
    UPDATE public.user_stats
    SET badges = badges || jsonb_build_array('Month Champion')
    WHERE user_id = p_user_id
    AND NOT badges @> jsonb_build_array('Month Champion');
  END IF;
END;
$$;