-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Nigerian knowledge base table for cultural context
CREATE TABLE nigerian_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(768),
  category TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  subcategory TEXT,
  metadata JSONB,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE nigerian_knowledge ENABLE ROW LEVEL SECURITY;

-- Public read access for all users
CREATE POLICY "Anyone can read nigerian knowledge"
  ON nigerian_knowledge
  FOR SELECT
  USING (true);

-- Indexes for performance
CREATE INDEX idx_nigerian_knowledge_category ON nigerian_knowledge(category);
CREATE INDEX idx_nigerian_knowledge_language ON nigerian_knowledge(language);
CREATE INDEX ON nigerian_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Update trigger
CREATE TRIGGER update_nigerian_knowledge_updated_at
  BEFORE UPDATE ON nigerian_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert initial Nigerian knowledge base entries
INSERT INTO nigerian_knowledge (content, category, language, subcategory, metadata) VALUES
-- Nigerian Proverbs
('No be by force - You don''t have to do everything. This expression emphasizes that not everything requires force or compulsion.', 'proverbs', 'pidgin', 'common_sayings', '{"english_equivalent": "It''s not mandatory"}'),
('Wahala be like bicycle - Problems keep coming in cycles. Used to describe how troubles keep recurring.', 'proverbs', 'pidgin', 'common_sayings', '{"english_equivalent": "Problems never end"}'),
('Who no go, no go know - Experience is the best teacher. You have to experience something to truly understand it.', 'proverbs', 'pidgin', 'common_sayings', '{"english_equivalent": "Experience teaches"}'),
('Monkey no fine but him mama like am - Beauty is in the eye of the beholder. A mother always loves her child regardless of appearance.', 'proverbs', 'pidgin', 'common_sayings', '{"english_equivalent": "Beauty is subjective"}'),
('When person waka, e go know - You learn by doing and experiencing things firsthand.', 'proverbs', 'pidgin', 'common_sayings', '{"english_equivalent": "Experience teaches"}'),

-- Nigerian Culture & Food
('Jollof rice is a beloved West African dish, with Nigeria and Ghana famously debating who makes it best. Nigerian jollof is typically cooked with tomatoes, peppers, and spices.', 'culture', 'en', 'food', '{"popularity": "very_high", "occasions": ["parties", "weddings", "celebrations"]}'),
('Suya is Nigerian street food - spicy grilled meat (usually beef or chicken) coated in ground peanuts and spices. It''s especially popular in Northern Nigeria.', 'culture', 'en', 'food', '{"origin": "Hausa", "popularity": "very_high"}'),
('Pounded yam with Egusi soup is a traditional Nigerian meal. The yam is boiled and pounded until smooth, served with a rich melon seed soup.', 'culture', 'en', 'food', '{"ethnic_groups": ["Yoruba", "Igbo"], "meal_type": "main_course"}'),
('Owambe refers to lavish Nigerian parties, especially Yoruba celebrations with excessive food, music, dancing, and colorful aso-ebi (matching outfits).', 'culture', 'en', 'celebrations', '{"ethnic_group": "Yoruba", "characteristics": ["live_band", "spraying_money", "aso_ebi"]}'),

-- Nigerian Pidgin Dictionary
('I dey kampe - I''m doing well, I''m fine. A common response to greetings.', 'language', 'pidgin', 'greetings', '{"formality": "casual"}'),
('Wetin dey? - What''s happening? What''s up? A casual greeting.', 'language', 'pidgin', 'greetings', '{"formality": "very_casual"}'),
('E choke - It''s overwhelming, it''s too much. Used to express amazement or being overwhelmed.', 'language', 'pidgin', 'slang', '{"usage": "Gen_Z", "context": "excitement"}'),
('Sapa - Broke, poverty, financial hardship. Popular among Nigerian youth.', 'language', 'pidgin', 'slang', '{"usage": "Gen_Z", "context": "finances"}'),
('Oya na - Come on, let''s go, hurry up. Used to urge someone to action.', 'language', 'pidgin', 'common_phrases', '{"formality": "casual"}'),
('Abeg - Please, I beg you. A polite request or plea.', 'language', 'pidgin', 'common_phrases', '{"formality": "neutral"}'),

-- Nigerian Music & Entertainment
('Afrobeats is a contemporary music genre from Nigeria, featuring artists like Wizkid, Burna Boy, Davido, and Rema. It has global influence.', 'culture', 'en', 'music', '{"artists": ["Wizkid", "Burna Boy", "Davido", "Rema"], "global_reach": true}'),
('Nollywood is the Nigerian film industry, one of the largest in the world by volume. Known for dramatic storylines and rapid production.', 'culture', 'en', 'entertainment', '{"industry_size": "second_largest_globally"}'),
('Detty December refers to the festive season in Lagos and Nigeria where people party extensively throughout December.', 'culture', 'en', 'celebrations', '{"month": "December", "location": "Lagos"}'),

-- Nigerian Education
('WAEC (West African Examinations Council) conducts exams for secondary school students across West Africa. Critical for university admission.', 'education', 'en', 'exams', '{"full_name": "West African Examinations Council", "level": "secondary"}'),
('JAMB (Joint Admissions and Matriculation Board) conducts UTME (Unified Tertiary Matriculation Examination) for Nigerian university admission.', 'education', 'en', 'exams', '{"full_name": "Joint Admissions and Matriculation Board", "level": "tertiary_entrance"}'),
('NECO (National Examinations Council) is an alternative to WAEC for secondary school certification in Nigeria.', 'education', 'en', 'exams', '{"full_name": "National Examinations Council", "level": "secondary"}'),

-- Nigerian Social Context
('NEPA - Nigerian Electric Power Authority (now PHCN). Used colloquially to refer to power outages: "NEPA don take light".', 'culture', 'en', 'social_context', '{"issue": "electricity", "frustration_level": "high"}'),
('Lagos traffic (go-slow) is notoriously congested. Commuting can take hours, especially on Third Mainland Bridge and major expressways.', 'culture', 'en', 'social_context', '{"issue": "transportation", "locations": ["Third_Mainland_Bridge", "Lekki-Epe_Expressway"]}'),
('Danfo are yellow commercial buses in Lagos, known for chaotic driving and loud conductors shouting destinations.', 'culture', 'en', 'transportation', '{"location": "Lagos", "type": "public_transport"}'),

-- Hausa Language
('Sannu - Hello, greetings in Hausa. A polite way to greet someone.', 'language', 'ha', 'greetings', '{"formality": "neutral"}'),
('Yaya dai? - How are you? in Hausa. Common greeting.', 'language', 'ha', 'greetings', '{"formality": "neutral"}'),
('Na gode - Thank you in Hausa. Expression of gratitude.', 'language', 'ha', 'common_phrases', '{"formality": "neutral"}'),

-- Nigerian History
('Nigeria gained independence from British colonial rule on October 1, 1960. Independence Day is a national holiday.', 'history', 'en', 'independence', '{"date": "1960-10-01", "colonial_power": "Britain"}'),
('The Nigerian Civil War (1967-1970), also known as the Biafran War, was a significant conflict following attempts at secession.', 'history', 'en', 'conflicts', '{"years": "1967-1970", "also_known_as": "Biafran War"}'),
('Lagos was Nigeria''s capital until 1991, when it moved to Abuja. Lagos remains the commercial capital and largest city.', 'history', 'en', 'geography', '{"former_capital": "Lagos", "current_capital": "Abuja", "change_year": 1991}'),

-- Nigerian Geography
('Nigeria has 36 states plus the Federal Capital Territory (Abuja). Major cities include Lagos, Kano, Ibadan, and Port Harcourt.', 'geography', 'en', 'states', '{"total_states": 36, "major_cities": ["Lagos", "Kano", "Ibadan", "Port Harcourt", "Abuja"]}'),
('Nigeria has three major ethnic groups: Hausa-Fulani (North), Yoruba (Southwest), and Igbo (Southeast), plus over 250 other ethnic groups.', 'geography', 'en', 'ethnic_groups', '{"major_groups": ["Hausa-Fulani", "Yoruba", "Igbo"], "total_groups": "250+"}')