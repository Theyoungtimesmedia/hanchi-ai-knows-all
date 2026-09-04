// Skill engine: deterministic, capability-aware instruction packs that are
// selected from the user's message before the model call. Skills never return
// placeholder text — they shape the system prompt and can attach grounded
// context (e.g. Nigerian knowledge rows) so answers are real.

export type SkillId =
  | 'nigerian_context'
  | 'study_help'
  | 'coding'
  | 'writing'
  | 'translation'
  | 'money'
  | 'general';

export type Skill = {
  id: SkillId;
  label: string;
  /** Higher wins when several skills match. */
  weight: number;
  match: (text: string) => boolean;
  instructions: string;
  /** Whether the skill wants Nigerian knowledge rows injected. */
  needsKnowledge: boolean;
};

const has = (text: string, words: string[]) => words.some((w) => text.includes(w));

export const SKILLS: Skill[] = [
  {
    id: 'nigerian_context',
    label: 'Nigerian context',
    weight: 5,
    needsKnowledge: true,
    match: (t) =>
      has(t, [
        'nigeria', 'naija', 'lagos', 'abuja', 'kano', 'ibadan', 'jamb', 'waec', 'neco',
        'nysc', 'naira', 'nepa', 'inec', 'yoruba', 'hausa', 'igbo', 'pidgin', 'japa',
        'danfo', 'jollof', 'nollywood', 'buhari', 'tinubu', 'cbn', 'efcc',
      ]),
    instructions: `NIGERIAN CONTEXT SKILL ACTIVE.
Answer with concrete, verifiable Nigerian detail: real institutions, real prices in naira where relevant, real processes and timelines.
If a fact could be outdated (prices, exchange rates, policies, officials), say plainly when it was last true and suggest how to confirm.
Never invent statistics, laws, or dates. Never answer with generic placeholder text.`,
  },
  {
    id: 'study_help',
    label: 'Study help',
    weight: 4,
    needsKnowledge: true,
    match: (t) => has(t, ['jamb', 'waec', 'neco', 'exam', 'past question', 'syllabus', 'homework', 'assignment', 'revision', 'ss1', 'ss2', 'ss3', 'university', 'cut off']),
    instructions: `STUDY SKILL ACTIVE.
Teach, do not dump. Give the working, then the answer, then one short check-yourself question.
For exam questions, state the topic and the exact method being tested.`,
    
  },
  {
    id: 'coding',
    label: 'Coding',
    weight: 4,
    needsKnowledge: false,
    match: (t) => has(t, ['code', 'function', 'bug', 'error', 'typescript', 'javascript', 'python', 'react', 'sql', 'api', 'deploy', 'compile', 'stack trace']),
    instructions: `CODING SKILL ACTIVE.
Give runnable code in fenced blocks with the language tag. Explain only what is non-obvious.
State assumptions about versions/runtime. Never invent library APIs — if unsure, say so and give the safe approach.`,
  },
  {
    id: 'translation',
    label: 'Translation',
    weight: 4,
    needsKnowledge: false,
    match: (t) => has(t, ['translate', 'in hausa', 'in yoruba', 'in igbo', 'in pidgin', 'meaning of', 'wetin be']),
    instructions: `TRANSLATION SKILL ACTIVE.
Return the translation first, then a short literal gloss, then a note on register (formal / street / respectful).`,
  },
  {
    id: 'money',
    label: 'Money and hustle',
    weight: 3,
    needsKnowledge: true,
    match: (t) => has(t, ['business', 'salary', 'invest', 'save money', 'budget', 'price', 'cost', 'profit', 'side hustle', 'capital']),
    instructions: `MONEY SKILL ACTIVE.
Be pragmatic and specific: real numbers, realistic Nigerian constraints, and the failure modes.
No hype, no get-rich framing. Say when an amount is an estimate.`,
  },
  {
    id: 'writing',
    label: 'Writing',
    weight: 2,
    needsKnowledge: false,
    match: (t) => has(t, ['write', 'draft', 'essay', 'letter', 'caption', 'script', 'cv', 'resume', 'proposal']),
    instructions: `WRITING SKILL ACTIVE.
Deliver the finished piece first, no preamble. Match the requested length and register.
Avoid "In conclusion", "delve", "tapestry", and other stock AI phrasing.`,
  },
  {
    id: 'general',
    label: 'General',
    weight: 0,
    needsKnowledge: false,
    match: () => true,
    instructions: `GENERAL SKILL ACTIVE.
Answer directly and concretely. If you do not know, say so and say what would settle it.`,
  },
];

export type SkillSelection = {
  skills: Skill[];
  instructions: string;
  needsKnowledge: boolean;
  ids: SkillId[];
};

/** Select up to two matching skills, always including a fallback. */
export function selectSkills(userText: string): SkillSelection {
  const text = (userText || '').toLowerCase();
  const matched = SKILLS.filter((s) => s.id !== 'general' && s.match(text)).sort((a, b) => b.weight - a.weight).slice(0, 2);

  const skills = matched.length > 0 ? matched : [SKILLS[SKILLS.length - 1]];

  return {
    skills,
    ids: skills.map((s) => s.id),
    needsKnowledge: skills.some((s) => s.needsKnowledge),
    instructions: skills.map((s) => s.instructions).join('\n\n'),
  };
}
