-- Study materials table for WAEC/JAMB/NECO questions
CREATE TABLE public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type TEXT NOT NULL CHECK (exam_type IN ('WAEC', 'JAMB', 'NECO')),
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- {"A": "...", "B": "...", "C": "...", "D": "..."}
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User progress tracking
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exam_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  last_practice TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, exam_type, subject, topic)
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- User stats for gamification
CREATE TABLE public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  badges JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  summary TEXT,
  extracted_text TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read study materials"
  ON public.study_materials FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_study_materials_updated_at
  BEFORE UPDATE ON public.study_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Seed some sample WAEC/JAMB questions
INSERT INTO public.study_materials (exam_type, subject, topic, question, options, correct_answer, explanation, difficulty, year) VALUES
('JAMB', 'Mathematics', 'Algebra', 'Solve for x: 2x + 5 = 15', '{"A": "x = 3", "B": "x = 5", "C": "x = 10", "D": "x = 7.5"}', 'B', 'Subtract 5 from both sides: 2x = 10. Divide by 2: x = 5', 'easy', 2023),
('JAMB', 'Mathematics', 'Algebra', 'If 3x - 7 = 2x + 5, find x', '{"A": "x = 10", "B": "x = 11", "C": "x = 12", "D": "x = 13"}', 'C', 'Subtract 2x from both sides: x - 7 = 5. Add 7: x = 12', 'easy', 2023),
('JAMB', 'English', 'Comprehension', 'What is a synonym for "benevolent"?', '{"A": "Cruel", "B": "Kind", "C": "Angry", "D": "Sad"}', 'B', 'Benevolent means kind and generous', 'easy', 2023),
('WAEC', 'Chemistry', 'Atomic Structure', 'What is the atomic number of Oxygen?', '{"A": "6", "B": "7", "C": "8", "D": "9"}', 'C', 'Oxygen has 8 protons, so its atomic number is 8', 'easy', 2022),
('WAEC', 'Physics', 'Motion', 'What is the SI unit of force?', '{"A": "Joule", "B": "Newton", "C": "Watt", "D": "Pascal"}', 'B', 'The Newton (N) is the SI unit of force, named after Isaac Newton', 'easy', 2022),
('JAMB', 'Biology', 'Cell Biology', 'What is the powerhouse of the cell?', '{"A": "Nucleus", "B": "Ribosome", "C": "Mitochondria", "D": "Chloroplast"}', 'C', 'Mitochondria produce ATP energy for the cell', 'easy', 2023);