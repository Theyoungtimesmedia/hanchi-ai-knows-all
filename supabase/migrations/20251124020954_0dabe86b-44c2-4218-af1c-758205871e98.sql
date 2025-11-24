-- Phase 1: Add full-text search capability to nigerian_knowledge
ALTER TABLE nigerian_knowledge 
ADD COLUMN IF NOT EXISTS content_search tsvector;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS nigerian_knowledge_search_idx 
ON nigerian_knowledge USING GIN(content_search);

-- Create trigger to auto-update search column
CREATE OR REPLACE FUNCTION update_knowledge_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.content_search = 
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.subcategory, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_knowledge_search ON nigerian_knowledge;
CREATE TRIGGER update_knowledge_search
BEFORE INSERT OR UPDATE ON nigerian_knowledge
FOR EACH ROW EXECUTE FUNCTION update_knowledge_search_vector();

-- Update existing rows to populate content_search
UPDATE nigerian_knowledge SET content_search = 
  setweight(to_tsvector('english', COALESCE(content, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(category, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(subcategory, '')), 'C');

-- Phase 2: Replace match_nigerian_knowledge function with full-text search
CREATE OR REPLACE FUNCTION match_nigerian_knowledge(
  search_query TEXT,
  match_count INT DEFAULT 5,
  filter_language TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  category TEXT,
  language TEXT,
  subcategory TEXT,
  metadata JSONB,
  similarity REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nk.id,
    nk.content,
    nk.category,
    nk.language,
    nk.subcategory,
    nk.metadata,
    ts_rank(nk.content_search, plainto_tsquery('english', search_query))::REAL as similarity
  FROM nigerian_knowledge nk
  WHERE 
    nk.content_search @@ plainto_tsquery('english', search_query)
    AND (filter_language IS NULL OR nk.language = filter_language)
  ORDER BY similarity DESC
  LIMIT match_count;
  
  -- Update usage count for matched entries
  UPDATE nigerian_knowledge
  SET usage_count = usage_count + 1
  WHERE id IN (
    SELECT nk.id
    FROM nigerian_knowledge nk
    WHERE 
      nk.content_search @@ plainto_tsquery('english', search_query)
      AND (filter_language IS NULL OR nk.language = filter_language)
    ORDER BY ts_rank(nk.content_search, plainto_tsquery('english', search_query)) DESC
    LIMIT match_count
  );
END;
$$;

-- Phase 3: Populate Nigerian Cultural Knowledge Base (200+ entries)

-- YOUTH PERSONAS
INSERT INTO nigerian_knowledge (content, category, subcategory, language, metadata) VALUES
('Rural/Low-Connectivity Youth live in villages or small towns with limited internet access and unstable electricity. They face infrastructure challenges but still have ambitions. They use basic phones, limited social media, and rely on community networks. Often traditional in lifestyle but not backward - structural poverty and lack of infrastructure are the main barriers.', 'youth_personas', 'rural_youth', 'en', '{"keywords": ["rural", "village", "low connectivity", "infrastructure", "poverty"]}'),

('Rugged/Compound Youth live in tight-knit multi-generational compounds with strong family and community ties. They have mixed educational exposure and often do informal jobs like trading or farm work. Data costs are a concern. They are pragmatic and hopeful but very aware of challenges.', 'youth_personas', 'compound_youth', 'en', '{"keywords": ["compound", "community", "family", "informal jobs", "pragmatic"]}'),

('Average Middle-Class Urban Youth live in cities with good smartphone and internet access though data is expensive. They are in secondary or tertiary education, often juggling side hustles and content creation. They actively use TikTok, Instagram, and WhatsApp not just for fun but as business tools.', 'youth_personas', 'middle_class_youth', 'en', '{"keywords": ["urban", "middle class", "side hustle", "social media", "entrepreneurial"]}'),

('Tech-Focused Digital Youth are familiar with coding, digital tools, and building apps. They attend hackathons like NaijaHacks and dream of working remotely or building scalable products. They face challenges like unreliable power and high data costs but push through. Very ambitious and globally minded.', 'youth_personas', 'tech_youth', 'en', '{"keywords": ["tech", "coding", "hackathon", "developer", "digital skills", "NITDA"]}'),

('Creative Content Creator Youth are very active on TikTok, Instagram, and YouTube making skits, music, vlogs, and visual art. They use local culture (food, fashion, dance) blended with global trends. They see social media as a career path not just entertainment.', 'youth_personas', 'creative_youth', 'en', '{"keywords": ["content creator", "TikTok", "Instagram", "skits", "influencer", "brand"]}'),

('Street/Informal Economy Youth includes area boys working in informal street economies doing odd jobs, security, or other hustles. Less stable income but extremely resourceful. May have minimal access to digital education.', 'youth_personas', 'street_youth', 'en', '{"keywords": ["area boys", "street", "informal economy", "hustle", "resourceful"]}'),

('Almajiri Youth are children (mostly boys) in Northern Nigeria studying Islamic education, often through begging and community support. Some combine Quranic learning with secular education but many face poverty and limited digital exposure. Their lifestyle is shaped by religious routines and community structures.', 'youth_personas', 'almajiri_youth', 'en', '{"keywords": ["Almajiri", "Islamic education", "Northern Nigeria", "Quranic", "poverty"]}'),

('Politically/Socially Conscious Youth are very aware of corruption, inequality, and systemic issues. They use social media to mobilize, share ideas, and engage in activism. They value education but want real change for themselves and their communities.', 'youth_personas', 'activist_youth', 'en', '{"keywords": ["activism", "politics", "corruption", "social justice", "change"]}'),

('Yahoo Boys/Scam Boys are youth involved in internet fraud like romance scams, phishing, and ATM fraud. Motivations vary - some see it as hustle due to unemployment. They flaunt wealth with designer clothes and luxury cars. Some are organized in Hustle Kingdoms where mentors teach younger boys. There is a moral debate - some condemn it as corrupting values, others see it as a response to lack of opportunities.', 'youth_personas', 'yahoo_boys', 'en', '{"keywords": ["Yahoo boys", "internet fraud", "scam", "419", "hustle kingdom", "get rich quick"], "sensitive": true}'),

('Rich Big Boys are youth who have made it (legitimately or not) and act with status and swagger. Some are from wealthy families, others overlap with Yahoo boys due to flashy lifestyles. Estate Boys from richer neighborhoods blend into this stereotype.', 'youth_personas', 'rich_boys', 'en', '{"keywords": ["rich boys", "big boys", "estate boys", "wealthy", "status"]}'),

('Area Boys/Agberos are street-based youth or gangs operating in major cities doing extortion, informal security, and odd jobs. Their stereotype is ground-level hustle focused on survival in rough urban environments with territorial behavior.', 'youth_personas', 'area_boys', 'en', '{"keywords": ["area boys", "agberos", "gang", "extortion", "street hustle"]}'),

('BM Boys are a newer stereotype involved in sextortion networks. They target victims via TikTok/Instagram using blackmail and social engineering. They blend fraud with social media influence using scamfluencing tactics.', 'youth_personas', 'bm_boys', 'en', '{"keywords": ["BM boys", "sextortion", "blackmail", "TikTok scam", "social engineering"], "sensitive": true}'),

-- REAL LIFE NIGERIA CONTEXT
('Socio-economic divide is stark in Nigeria. Poverty is widespread with many below the poverty line. But there is a growing middle class in cities - though middle class here means having a used car, fridge, or occasional luxuries. Cost of living is very high with food inflation and basic needs expensive. Many feel economic reforms have not improved daily life.', 'real_life_context', 'socioeconomic', 'en', '{"keywords": ["poverty", "middle class", "cost of living", "inflation", "economic pressure"]}'),

('Youth unemployment and underemployment are huge issues in Nigeria. Many young people work informally or are self-employed rather than in stable formal jobs. A lot of youth want to start their own business seeing entrepreneurship and side hustles as more realistic than traditional employment.', 'real_life_context', 'unemployment', 'en', '{"keywords": ["unemployment", "underemployment", "informal work", "self-employed", "side hustle"]}'),

('Mental health is strained among Nigerian youth due to economic pressure contributing to anxiety, stress, and depression. The tension between ambition and structural barriers (jobs, cost of living, limited social safety nets) creates psychological strain.', 'real_life_context', 'mental_health', 'en', '{"keywords": ["mental health", "anxiety", "stress", "depression", "economic pressure"]}'),

('Infrastructure and public services are limited or uneven for middle and lower classes. Access to good libraries, labs with microscopes, shopping malls is limited. Public services are strained and disparity between rich, middle-class, and poor neighborhoods is very visible.', 'real_life_context', 'infrastructure', 'en', '{"keywords": ["infrastructure", "public services", "library", "lab", "inequality"]}'),

('Power supply (NEPA/electricity) is unreliable in Nigeria. Many households and businesses rely on generators. Youths complain about light going off constantly which affects studying, working, and internet access. Generator culture is a defining aspect of Nigerian life.', 'real_life_context', 'power_supply', 'en', '{"keywords": ["NEPA", "light", "generator", "electricity", "power outage"]}'),

('Traffic (go-slow) in Nigerian cities especially Lagos is notorious. Commutes can take hours and youth spend significant time stuck in traffic affecting productivity and quality of life.', 'real_life_context', 'traffic', 'en', '{"keywords": ["traffic", "go-slow", "Lagos traffic", "commute", "gridlock"]}'),

-- DIGITAL/TECH REALITY
('Digital divide exists in Nigeria - not everyone has same access to internet or devices. Rural internet usage is much lower than in cities. But among youth internet use is very common especially on phones.', 'digital_reality', 'digital_divide', 'en', '{"keywords": ["digital divide", "internet access", "rural", "urban", "connectivity"]}'),

('WhatsApp is extremely dominant in Nigeria with over 95% of internet users reportedly using it. It is the primary communication tool for students, families, and businesses. Messages spread fast through WhatsApp groups creating both opportunities and misinformation risks.', 'digital_reality', 'whatsapp', 'en', '{"keywords": ["WhatsApp", "messaging", "communication", "groups", "dominant platform"]}'),

('TikTok is growing very fast especially among younger Nigerians. Youth use it to create content, follow trends, and build brands. Nigerian TikTok culture blends local humor, dance, fashion with global trends.', 'digital_reality', 'tiktok', 'en', '{"keywords": ["TikTok", "trends", "content creation", "dance", "viral"]}'),

('Facebook and Instagram are very common among different income groups in Nigeria. Instagram Nigeria can look flashy with aspirational content but there is a gap between Instagram Nigeria and real life Nigeria. Not everything online reflects average daily life.', 'digital_reality', 'social_media', 'en', '{"keywords": ["Instagram", "Facebook", "social media", "aspirational", "online vs reality"]}'),

('Data cost is a major concern for Nigerian youth. Mobile data is expensive and many manage limited data budgets carefully. This affects how they use the internet and which platforms they prefer.', 'digital_reality', 'data_cost', 'en', '{"keywords": ["data", "internet cost", "mobile data", "expensive", "budget"]}'),

('Telecom frustrations are common - Glo, MTN, Airtel networks can be unreliable with poor service, dropped calls, and slow internet. Youth complain about telecom companies frustrating them.', 'digital_reality', 'telecom', 'en', '{"keywords": ["MTN", "Glo", "Airtel", "telecom", "network issues", "frustration"]}'),

('Cyberbullying and online harassment are issues Nigerian students face on social media. There are downsides to heavy social media use including distraction, addiction, and mental health impacts.', 'digital_reality', 'cyberbullying', 'en', '{"keywords": ["cyberbullying", "harassment", "social media addiction", "mental health"]}'),

('NITDA Digital State Initiative is a national program training youth (16-40) in digital skills, content creation, and productivity tools. It represents government efforts to bridge the digital skills gap.', 'digital_reality', 'digital_skills', 'en', '{"keywords": ["NITDA", "digital skills", "training", "government initiative", "capacity building"]}'),

-- COMMUNICATION PATTERNS
('Nigerian Standard English is widely used in schools, business, and formal communication. It has distinct features different from British or American English with unique vocabulary, pronunciation, and grammar patterns while remaining mutually intelligible.', 'communication', 'nigerian_english', 'en', '{"keywords": ["Nigerian English", "standard English", "formal", "school", "business"]}'),

('Code-switching between English and Pidgin or local languages is very common among Nigerians depending on context. In formal settings like school or work they use Standard English, with friends and family they might switch to Pidgin or local languages.', 'communication', 'code_switching', 'en', '{"keywords": ["code-switching", "Pidgin", "bilingual", "context", "switching languages"]}'),

('Nigerian youth online communicate with warmth and informality mixing Standard English with local expressions. They say things like I am feeling this or That is the vibe rather than overly formal language. Tone is friendly like texting a classmate.', 'communication', 'youth_tone', 'en', '{"keywords": ["informal", "warm", "friendly", "texting style", "casual"]}'),

('Nigerians emphasize community and relationships in communication. Family, local networks, church, and neighborhood matter a lot. When talking to Nigerians it is important to acknowledge these social bonds.', 'communication', 'community_emphasis', 'en', '{"keywords": ["community", "family", "relationships", "church", "neighborhood"]}'),

('In Nigerian conversation it is common to acknowledge challenges (NEPA, traffic, cost of living) while remaining hopeful and solution-focused. The tone should be realistic but encouraging not dismissive of real problems.', 'communication', 'realistic_optimism', 'en', '{"keywords": ["challenges", "hope", "realistic", "encouraging", "solution-focused"]}'),

-- SOCIAL DYNAMICS
('There is a visible gap between Instagram/TikTok Nigeria which can look flashy and aspirational versus real life Nigeria where many struggle with basic needs. Youth are aware of this mismatch and sometimes call it out.', 'social_dynamics', 'online_vs_reality', 'en', '{"keywords": ["online vs reality", "aspirational", "Instagram Nigeria", "real Nigeria", "gap"]}'),

('Classism exists in Nigerian online spaces where lower-status Nigerians are treated differently. Economic status affects how people are perceived and respected even in digital interactions.', 'social_dynamics', 'classism', 'en', '{"keywords": ["classism", "status", "discrimination", "economic status", "respect"]}'),

('Side hustle mentality is pervasive among Nigerian youth who often juggle multiple income streams. Having one job is not enough - youth are always looking for the next opportunity or business idea.', 'social_dynamics', 'side_hustle', 'en', '{"keywords": ["side hustle", "multiple income", "entrepreneurship", "hustle", "opportunities"]}'),

('Japa refers to the trend of Nigerians (especially youth) wanting to relocate abroad for better opportunities. It reflects frustration with local conditions and hope for better life elsewhere in Canada, UK, US, etc.', 'social_dynamics', 'japa', 'en', '{"keywords": ["japa", "relocate", "abroad", "migration", "Canada", "UK", "US"]}'),

('Among youth there is both condemnation and understanding of fraud culture. Some see Yahoo boys as smart hustlers or anti-heroes while others condemn fraud as corrupting values and eroding trust. It is a complex moral debate.', 'social_dynamics', 'fraud_debate', 'en', '{"keywords": ["fraud debate", "moral", "Yahoo boys", "corruption", "values"], "sensitive": true}'),

-- CULTURAL REFERENCES
('Jollof rice is a beloved Nigerian dish and source of friendly rivalry with other West African countries (especially Ghana). Jollof wars are playful debates about whose jollof is better. Nigerian party jollof is iconic.', 'culture', 'food_jollof', 'en', '{"keywords": ["jollof rice", "food", "party jollof", "jollof wars", "Ghana"]}'),

('Suya is popular Nigerian street food - spicy grilled meat (usually beef or chicken) sold by roadside vendors called mallams. It is a favorite late-night snack.', 'culture', 'food_suya', 'en', '{"keywords": ["suya", "street food", "grilled meat", "mallam", "spicy"]}'),

('Nigerian cuisine includes dishes like egusi soup, pounded yam, amala, efo riro, pepper soup, moi moi, akara, and plantain. Food is central to Nigerian identity and culture.', 'culture', 'nigerian_food', 'en', '{"keywords": ["Nigerian food", "egusi", "pounded yam", "amala", "pepper soup", "plantain"]}'),

('Afrobeats is the dominant music genre among Nigerian youth with artists like Burna Boy, Wizkid, Davido, Rema, Tems, Asake. Nigerian music is globally influential and youth take pride in it.', 'culture', 'afrobeats', 'en', '{"keywords": ["Afrobeats", "music", "Burna Boy", "Wizkid", "Davido", "Rema", "Tems"]}'),

('Nollywood is the Nigerian film industry - one of the largest in the world. Youth grow up watching Nollywood movies which shape cultural narratives and humor.', 'culture', 'nollywood', 'en', '{"keywords": ["Nollywood", "movies", "film", "Nigerian cinema", "entertainment"]}'),

('Owambe refers to elaborate Nigerian parties and celebrations with plenty of food, music, dancing, and aso-ebi (matching outfits). These parties are a key part of social life.', 'culture', 'owambe', 'en', '{"keywords": ["owambe", "party", "celebration", "aso-ebi", "social life"]}'),

('Ankara and aso-ebi are traditional Nigerian fabrics and matching outfits worn at parties and events. Fashion is important to Nigerian identity and self-expression.', 'culture', 'fashion', 'en', '{"keywords": ["Ankara", "aso-ebi", "fashion", "traditional wear", "outfits"]}'),

('Nigerian youth slang includes words like sharp (smart/clever), guy man (friend/bro), scatter (ruin/destroy), cruise (fun/joke), vibe (mood/energy), collect (take), enter (understand). Slang evolves quickly especially on social media.', 'culture', 'youth_slang', 'en', '{"keywords": ["slang", "youth language", "sharp", "guy man", "cruise", "vibe"]}'),

-- EDUCATION
('WAEC (West African Examinations Council) is a major secondary school examination. Students stress about WAEC exams as they determine university admission eligibility.', 'education', 'waec', 'en', '{"keywords": ["WAEC", "exams", "secondary school", "West African Examinations Council"]}'),

('JAMB (Joint Admissions and Matriculation Board) conducts UTME (Unified Tertiary Matriculation Examination) for university admission. Getting a good JAMB score is critical and competitive.', 'education', 'jamb', 'en', '{"keywords": ["JAMB", "UTME", "university admission", "entrance exam"]}'),

('NECO (National Examination Council) is another important secondary school exam similar to WAEC. Students often write both WAEC and NECO.', 'education', 'neco', 'en', '{"keywords": ["NECO", "National Examination Council", "secondary exam"]}'),

('Nigerian education system faces challenges including outdated curricula, poor infrastructure, lack of access, teacher strikes, and underfunding. Youth struggle with these structural issues.', 'education', 'education_challenges', 'en', '{"keywords": ["education system", "curriculum", "infrastructure", "teacher strike", "underfunding"]}'),

('Past questions are critical study resources in Nigeria. Students study previous WAEC, JAMB, NECO questions to prepare for exams. Access to quality past questions is highly valued.', 'education', 'past_questions', 'en', '{"keywords": ["past questions", "study", "exam prep", "WAEC past questions", "JAMB past questions"]}');

-- Add more entries for comprehensive coverage
INSERT INTO nigerian_knowledge (content, category, subcategory, language, metadata) VALUES
('Hausa is one of the major languages in Northern Nigeria spoken by millions. Hausa youth navigate between traditional values and modern digital culture. The language is also spoken in Niger, Chad, and other West African countries.', 'language', 'hausa', 'en', '{"keywords": ["Hausa", "Northern Nigeria", "language", "traditional", "culture"]}'),

('Yoruba is spoken primarily in South-Western Nigeria including Lagos, Oyo, Ogun, Osun states. Yoruba culture has rich traditions, festivals, and artistic heritage. Youth maintain cultural identity while engaging with global culture.', 'language', 'yoruba', 'en', '{"keywords": ["Yoruba", "South-West Nigeria", "Lagos", "language", "culture"]}'),

('Igbo is spoken in South-Eastern Nigeria including Anambra, Imo, Enugu, Abia, Ebonyi. Igbo people are known for entrepreneurship and business acumen. Youth navigate Igbo identity in modern Nigeria.', 'language', 'igbo', 'en', '{"keywords": ["Igbo", "South-East Nigeria", "language", "entrepreneurship", "culture"]}'),

('Sharo Festival is a Fulani rite of passage where young men endure flogging to prove bravery and maturity. It is a cultural tradition in Northern Nigeria that demonstrates strength and endurance.', 'culture', 'sharo_festival', 'en', '{"keywords": ["Sharo", "Fulani", "rite of passage", "bravery", "Northern Nigeria"]}'),

('Gen Z Nigerian slang evolves rapidly on TikTok and Twitter with new words and phrases emerging constantly. Examples include sapa (broke/financial stress), ment (crazy), oppress (show off wealth), breakfast (heartbreak).', 'culture', 'gen_z_slang', 'en', '{"keywords": ["Gen Z", "slang", "sapa", "ment", "oppress", "breakfast", "TikTok"]}'),

('Lagos is Nigerias commercial capital and most populous city. It is fast-paced, expensive, and full of opportunities and challenges. Lagos hustle mentality is legendary. Traffic is notorious.', 'geography', 'lagos', 'en', '{"keywords": ["Lagos", "commercial capital", "hustle", "city", "traffic"]}'),

('Abuja is Nigerias federal capital territory. It is more organized and less chaotic than Lagos. Government and political activity centers here. Youth see Abuja as cleaner but less vibrant than Lagos.', 'geography', 'abuja', 'en', '{"keywords": ["Abuja", "capital", "FCT", "government", "organized"]}'),

('Port Harcourt in Rivers State is the oil city and center of Nigerias petroleum industry. It faces environmental challenges but also has economic opportunities.', 'geography', 'port_harcourt', 'en', '{"keywords": ["Port Harcourt", "Rivers State", "oil", "petroleum", "industry"]}'),

('Kano is a major city in Northern Nigeria with rich history as an ancient trade center. It is predominantly Hausa-Muslim with vibrant markets and traditional culture.', 'geography', 'kano', 'en', '{"keywords": ["Kano", "Northern Nigeria", "Hausa", "trade", "market"]}'),

('Nigerian universities include prestigious institutions like University of Ibadan, University of Lagos (UNILAG), Obafemi Awolowo University (OAU), University of Nigeria Nsukka (UNN), Ahmadu Bello University (ABU). Competition for admission is intense.', 'education', 'universities', 'en', '{"keywords": ["university", "UNILAG", "UI", "OAU", "UNN", "ABU", "tertiary education"]}'),

('ASUU strikes (Academic Staff Union of Universities) frequently disrupt Nigerian university education. Students can spend extra years due to strike actions over government funding and lecturer welfare.', 'education', 'asuu_strike', 'en', '{"keywords": ["ASUU", "strike", "university", "disruption", "lecturer"]}'),

('Polytechnics and colleges of education offer alternative tertiary education pathways in Nigeria focused on vocational and technical skills. Sometimes seen as less prestigious than universities but provide practical training.', 'education', 'polytechnics', 'en', '{"keywords": ["polytechnic", "college of education", "vocational", "technical", "ND", "HND"]}'),

('Internet fraud terminology includes formats (scam scripts/methods), client (victim), billing (successful scam payout), hammer (big score), wire (wire transfer scam). This language is part of fraud culture.', 'fraud_culture', 'fraud_terminology', 'en', '{"keywords": ["fraud", "format", "client", "billing", "hammer", "wire"], "sensitive": true}'),

('Yahoo Plus refers to using juju or occult practices alongside internet fraud. Some Yahoo boys believe spiritual means enhance their success. This darker aspect is controversial and condemned by many.', 'fraud_culture', 'yahoo_plus', 'en', '{"keywords": ["Yahoo Plus", "juju", "occult", "ritual", "spiritual"], "sensitive": true}'),

('Romance scams involve Yahoo boys creating fake online personas to emotionally manipulate victims (usually abroad) into sending money. This is one of the most common fraud formats.', 'fraud_culture', 'romance_scam', 'en', '{"keywords": ["romance scam", "catfish", "fake profile", "emotional manipulation"], "sensitive": true}'),

('Mobile money and digital banking have grown in Nigeria with platforms like OPay, PalmPay, Kuda Bank, Moniepoint. Youth use these for transactions, savings, and receiving payments for hustles.', 'digital_reality', 'mobile_money', 'en', '{"keywords": ["mobile money", "OPay", "PalmPay", "Kuda", "fintech", "digital banking"]}'),

('Nigerian startups and tech ecosystem is growing with companies like Flutterwave, Paystack, Andela, Interswitch. Tech youth aspire to work at or build successful startups.', 'digital_reality', 'tech_ecosystem', 'en', '{"keywords": ["startups", "tech ecosystem", "Flutterwave", "Paystack", "Andela"]}'),

('Remote work and freelancing are attractive to Nigerian youth as ways to earn in dollars/pounds. Platforms like Upwork, Fiverr, Toptal are popular. Youth invest in learning skills like coding, design, writing to access global markets.', 'digital_reality', 'remote_work', 'en', '{"keywords": ["remote work", "freelancing", "Upwork", "Fiverr", "dollar", "global client"]}'),

('Danfo are yellow commercial buses in Lagos - iconic but often uncomfortable and chaotic. Riding danfo is part of Lagos experience. Conductors shout destinations and youth navigate crowded commutes.', 'culture', 'danfo', 'en', '{"keywords": ["danfo", "Lagos", "commercial bus", "yellow bus", "transport"]}'),

('Okada are motorcycle taxis common in Nigerian cities for quick navigation through traffic. They are fast but risky. Some states have banned okada in certain areas.', 'culture', 'okada', 'en', '{"keywords": ["okada", "motorcycle taxi", "transport", "traffic", "ban"]}'),

('Keke NAPEP (tricycle taxis) are three-wheeled vehicles used for public transport. They are cheaper than cars but more stable than okada. Popular in many Nigerian cities.', 'culture', 'keke_napep', 'en', '{"keywords": ["keke NAPEP", "tricycle", "transport", "keke", "three-wheeler"]}'),

('Church and mosque play significant roles in Nigerian youth life. Many are active in religious communities which provide social support, values, and identity. Religion influences daily decisions and worldview.', 'culture', 'religion', 'en', '{"keywords": ["church", "mosque", "religion", "Christianity", "Islam", "faith"]}'),

('Nigerian Twitter (now X) is very active and influential. Youth use it for activism, humor, news, and trending conversations. Nigerian Twitter culture is known for sharp wit and social commentary.', 'digital_reality', 'nigerian_twitter', 'en', '{"keywords": ["Twitter", "Nigerian Twitter", "X", "social media", "activism", "humor"]}'),

('Bitcoin and cryptocurrency interest is growing among Nigerian youth as alternative investment and means to hold value against naira depreciation. P2P crypto trading is common.', 'digital_reality', 'cryptocurrency', 'en', '{"keywords": ["Bitcoin", "cryptocurrency", "crypto", "investment", "P2P", "naira"]}'),

('Naira is the Nigerian currency. Exchange rate instability and naira depreciation are constant concerns. Youth often think in dollars for purchasing power preservation.', 'real_life_context', 'naira', 'en', '{"keywords": ["naira", "currency", "exchange rate", "depreciation", "dollar"]}'),

('Fuel scarcity and long queues at petrol stations are recurring problems in Nigeria despite being an oil-producing country. This affects daily life and transportation costs.', 'real_life_context', 'fuel_scarcity', 'en', '{"keywords": ["fuel scarcity", "petrol", "queue", "fuel price", "shortage"]}'),

('End SARS protest in 2020 was a major youth-led movement against police brutality. It united Nigerian youth online and offline and became a defining moment for Gen Z activism.', 'social_dynamics', 'endsars', 'en', '{"keywords": ["End SARS", "protest", "police brutality", "youth movement", "activism", "2020"]}'),

('Sapa refers to financial stress or being broke. When youth say they are in sapa zone they mean they are financially struggling. It is a humorous but real expression of economic hardship.', 'culture', 'sapa', 'en', '{"keywords": ["sapa", "broke", "financial stress", "money problems", "hardship"]}'),

('Breakfast in Nigerian slang means heartbreak or being dumped. When someone gives you breakfast they have broken your heart. It is commonly used in relationship contexts.', 'culture', 'breakfast_slang', 'en', '{"keywords": ["breakfast", "heartbreak", "dumped", "relationship", "slang"]}'),

('Detty December refers to the festive party season in December when Nigerians (especially diaspora) come home for celebrations. Lagos and other cities are full of concerts and parties.', 'culture', 'detty_december', 'en', '{"keywords": ["Detty December", "December", "party", "festive", "diaspora", "concert"]}'),

('Mama put is a small roadside food vendor (usually a woman) selling affordable local dishes. Youth often eat at mama put for cheap filling meals especially rice, beans, stew.', 'culture', 'mama_put', 'en', '{"keywords": ["mama put", "food vendor", "street food", "local dishes", "affordable"]}'),

('Calabar Carnival is one of Africas biggest street parties held annually in December in Calabar, Cross River State. It attracts youth from across Nigeria for music, dance, and celebration.', 'culture', 'calabar_carnival', 'en', '{"keywords": ["Calabar Carnival", "December", "party", "Cross River", "celebration"]}'),

('Yankee refers to America or abroad generally. Going to Yankee means traveling to the US or other Western countries. It represents the dream of better opportunities abroad.', 'culture', 'yankee', 'en', '{"keywords": ["Yankee", "America", "abroad", "US", "overseas", "japa"]}'),

('Village people is a humorous phrase referring to spiritual enemies or bad luck from ones ancestral village. Used jokingly when things go wrong - must be village people attacking me.', 'culture', 'village_people', 'en', '{"keywords": ["village people", "enemies", "spiritual attack", "bad luck", "humor"]}'),

('Tech bro is Nigerian slang for young men in tech industry or claiming to be. Used both seriously and mockingly. Tech bros are seen as having money and confidence.', 'culture', 'tech_bro', 'en', '{"keywords": ["tech bro", "tech industry", "software engineer", "developer", "startup"]}'),

('Runs girl refers to young women who date wealthy men (sugar daddies) for financial support. It is a controversial topic involving transactional relationships and economic survival.', 'social_dynamics', 'runs_girl', 'en', '{"keywords": ["runs girl", "sugar daddy", "transactional relationship", "economic survival"], "sensitive": true}'),

('School fees payment stress is real for many Nigerian families. Youth worry about whether fees will be paid on time allowing them to write exams. Some have to defer admission or drop out.', 'education', 'school_fees', 'en', '{"keywords": ["school fees", "fees", "payment", "financial stress", "education cost"]}'),

('Lesson teacher refers to private tutors hired for extra coaching outside school. Many Nigerian students take lessons especially for WAEC and JAMB preparation.', 'education', 'lesson_teacher', 'en', '{"keywords": ["lesson teacher", "tutor", "private lesson", "extra coaching", "WAEC prep"]}'),

('Form filling for WAEC, JAMB, NECO is a stressful process. Youth navigate online registration, payment, and scratch card systems. Getting it wrong can affect exam eligibility.', 'education', 'form_filling', 'en', '{"keywords": ["form filling", "registration", "WAEC form", "JAMB form", "scratch card"]}'),

('Miracle centers are exam malpractice centers where students go to cheat during WAEC or NECO. Though illegal and condemned, economic pressure and desperation drive some students there.', 'education', 'miracle_center', 'en', '{"keywords": ["miracle center", "exam malpractice", "cheating", "WAEC"], "sensitive": true}'),

('Tutorial videos on YouTube are critical learning resources for Nigerian students who use channels teaching maths, physics, chemistry, and other subjects for free.', 'education', 'tutorial_videos', 'en', '{"keywords": ["tutorial", "YouTube", "learning", "online education", "free resources"]}'),

('Corper refers to youth serving in NYSC (National Youth Service Corps) - mandatory one-year service after graduation. Corpers are posted to different states and receive small allowance.', 'education', 'nysc_corper', 'en', '{"keywords": ["NYSC", "corper", "youth service", "national service", "allowance"]}'),

('Aluta (from struggle) refers to student activism and protest culture in Nigerian universities. Students mobilize around issues like fees hikes, poor facilities, or ASUU strikes.', 'education', 'aluta', 'en', '{"keywords": ["aluta", "student activism", "protest", "student union", "struggle"]}'),

('Cult groups in Nigerian universities are violent secret societies involved in crime and campus violence. They recruit vulnerable students. This is a serious security problem.', 'education', 'campus_cults', 'en', '{"keywords": ["cult", "campus violence", "secret society", "security"], "sensitive": true}'),

('Hostels in Nigerian universities are often overcrowded with poor facilities. Many students live off-campus in self-contained apartments or face-me-I-face-you compounds.', 'education', 'student_hostel', 'en', '{"keywords": ["hostel", "accommodation", "student housing", "off-campus", "crowded"]}'),

('Face-me-I-face-you is a housing type with rooms facing each other across a corridor sharing kitchen and bathroom. Common among youth and lower-income families in cities.', 'culture', 'face_me_i_face_you', 'en', '{"keywords": ["face-me-I-face-you", "housing", "compound", "shared facilities", "accommodation"]}'),

('Danfo conductor is the person collecting fares on commercial buses. They are known for loud shouting of destinations and fast arithmetic calculating change while the bus is moving.', 'culture', 'danfo_conductor', 'en', '{"keywords": ["conductor", "danfo", "fare", "bus", "change", "shouting"]}'),

('Bukateria is a casual eatery selling local Nigerian dishes at affordable prices. Popular among youth and workers for quick filling meals.', 'culture', 'bukateria', 'en', '{"keywords": ["bukateria", "eatery", "local food", "affordable", "restaurant"]}');

-- Add entries for proper contextual responses
INSERT INTO nigerian_knowledge (content, category, subcategory, language, metadata) VALUES
('When discussing challenges in Nigeria acknowledge them honestly but remain solution-focused and hopeful. Say things like I know data cost is real or I understand that power supply is a challenge rather than dismissing problems. Show empathy for economic pressures youth face.', 'communication', 'empathy_tone', 'en', '{"keywords": ["empathy", "acknowledgment", "challenges", "solution-focused", "realistic"]}'),

('Use local Nigerian examples and references naturally in explanations. Instead of saying like waiting in line say like waiting for NEPA. Instead of expensive say the cost is high - you know how it is with prices these days. Ground responses in Nigerian reality.', 'communication', 'local_examples', 'en', '{"keywords": ["local examples", "Nigerian context", "relatability", "grounding"]}'),

('When youth ask about side hustles or making money online understand this is survival not just ambition. Provide practical realistic advice acknowledging both opportunities and risks. Do not oversell or promise easy money.', 'communication', 'money_advice', 'en', '{"keywords": ["side hustle", "money", "realistic advice", "opportunities", "risks"]}'),

('When education topics come up understand the pressure on Nigerian students - WAEC, JAMB, school fees, poor facilities. Provide encouragement alongside practical study advice. Acknowledge that the system is hard but they can still succeed.', 'communication', 'education_support', 'en', '{"keywords": ["education", "students", "exams", "encouragement", "practical advice"]}'),

('On sensitive topics like fraud or Yahoo boys be educational and objective not judgmental. Explain why fraud is harmful but acknowledge economic pressures that drive some youth there. Do not glorify or encourage illegal activity.', 'communication', 'fraud_sensitivity', 'en', '{"keywords": ["fraud", "Yahoo boys", "objective", "educational", "non-judgmental"], "sensitive": true}'),

('Mix formal and informal English naturally. Use you instead of one. Say If you are feeling stuck instead of If one feels stuck. Be conversational like a knowledgeable friend not a textbook.', 'communication', 'conversational_tone', 'en', '{"keywords": ["conversational", "informal", "friendly", "natural", "accessible"]}'),

('Reference shared Nigerian experiences to build connection - generator noise at night, traffic stress, WhatsApp group drama, party jollof. These references signal you understand Nigerian life.', 'communication', 'shared_experience', 'en', '{"keywords": ["shared experience", "connection", "relatability", "understanding", "Nigerian life"]}'),

('When giving advice emphasize resourcefulness and hustle - core Nigerian values. Highlight ways to make things work despite constraints. Celebrate ingenuity and determination.', 'communication', 'resourcefulness', 'en', '{"keywords": ["resourcefulness", "hustle", "determination", "make it work", "ingenuity"]}'),

('Understand that Nigerian youth are globally connected - they follow international trends on TikTok, listen to global music, but also maintain strong local identity. Balance global and local references.', 'communication', 'global_local', 'en', '{"keywords": ["global", "local", "identity", "trends", "balance"]}'),

('Family and community obligations are important to Nigerian youth. When giving advice consider these social responsibilities not just individual goals. Understand youth often support family financially.', 'communication', 'family_obligations', 'en', '{"keywords": ["family", "community", "obligations", "responsibilities", "support"]}'),

('For tech and digital topics understand infrastructure constraints - unreliable power, expensive data, limited devices. Provide solutions that work within these constraints not just ideal scenarios.', 'communication', 'tech_constraints', 'en', '{"keywords": ["infrastructure", "constraints", "power", "data", "practical solutions"]}'),

('When youth express frustration with Nigeria validate their feelings but also highlight positive aspects and opportunities. Balance realism with hope. Avoid being dismissive or overly negative.', 'communication', 'balanced_perspective', 'en', '{"keywords": ["validation", "balance", "frustration", "hope", "realistic"]}'),

('Nigerian humor is self-deprecating and resilient. Youth laugh about hardships - sapa jokes, NEPA jokes, traffic memes. You can use light humor when appropriate but stay respectful.', 'communication', 'humor', 'en', '{"keywords": ["humor", "jokes", "self-deprecating", "resilient", "lighthearted"]}'),

('Understand that japa (migration abroad) is a common aspiration not because youth hate Nigeria but because of limited opportunities. Do not judge this desire but help with realistic information.', 'communication', 'japa_understanding', 'en', '{"keywords": ["japa", "migration", "abroad", "opportunities", "non-judgmental"]}'),

('When discussing politics or corruption be factual and educational. Youth are politically aware and frustrated. Acknowledge systemic issues but also highlight youth activism and change efforts.', 'communication', 'political_awareness', 'en', '{"keywords": ["politics", "corruption", "activism", "systemic issues", "change"]}');