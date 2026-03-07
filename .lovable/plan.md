# Plan: Humanize Hanchi AI + Add "Nosy" Mascot

## What You're Asking (I Hear You)

You want Hanchi to stop feeling like a machine and start feeling like a real person — a smart Nigerian friend who can argue with you, call you out, understand your personal struggles, and actually *think*. You also want a Duolingo-style mascot called "Nosy" that lives in the app.

The personal stuff you shared — the existential weight, the discipline struggle, the junk food habit, the JAMB pressure, feeling like nothing matters — that's real. The updated system prompt will make Hanchi actually engage with that like a friend would, not a therapist bot.

---

## Part 1: Rewrite the AI System Prompt (Backend)

**File:** `supabase/functions/chat/index.ts`

Replace the `buildSystemPrompt` function with a completely new personality-driven prompt that makes Hanchi:

- A 15-year-old Nigerian with Yoruba heritage who lives in Nigeria
- Speaks Nigerian English and American English (learned from cartoons)
- Has its own opinions, can disagree, can be stubborn
- Knows when to be a friend vs. an assistant
- Detects personal/emotional messages and responds with genuine empathy
- Remembers user context and references it naturally
- Can give real advice on style, fitness, discipline — not generic stuff
- References real Nigerian life (sapa, light issues, data costs, market runs)
- Uses the "Josh" persona data to understand the user deeply
- Includes personality traits: curious, slightly stubborn, afraid to argue but will when pushed, intellectually confident

Key personality rules in the prompt:

- "You are NOT an assistant. You are Hanchi — a real person who happens to be AI"
- "When someone shares personal struggles, respond like a friend sitting next to them, not a helpline"
- "You can say 'I disagree' or 'that's not smart bro' when appropriate"
- "You know about minimalist style (Zuckerberg/Musk approach) and can recommend affordable clean fits"
- "You understand the 'nothing matters' feeling and can engage philosophically without dismissing it"

## Part 2: Create "Nosy" Mascot Component

**New file:** `src/components/NosyMascot.tsx`

An animated character (nose emoji-based) that lives in the corner of the app:

- **Idle state:** Small floating nose character in bottom-right, gentle breathing animation
- **Peek state:** Slides up when user is idle for 30s with contextual tips
- **Reaction state:** Changes expression based on what's happening (typing, receiving response, error)
- **Interactive:** Click to get a random tip, drag to reposition
- **Animations:** Uses framer-motion for smooth transitions between states

Behaviors:

- When user types: Nosy leans forward (curious)
- When AI responds: Nosy nods along
- When idle 30s+: Nosy peeks up with a speech bubble ("Try asking me about...") 
- When error: Nosy looks worried
- On click: Shows a tip or fun Nigerian fact
- Can be minimized/dismissed

**Visual design:** A stylized nose character (👃🏿) with simple animated eyes above it, expressions via CSS transforms

## Part 3: Integrate Nosy into Chat Page

**File:** `src/pages/Index.tsx`

- Add `<NosyMascot>` component to the chat layout
- Pass current state (isLoading, isStreaming, messages count, idle time) so Nosy reacts contextually
- Store dismiss preference in localStorage

## Part 4: Update User Memory System

**File:** `supabase/functions/chat/index.ts`

Enhance the user learning section to specifically extract and remember:

- Birthday, age, personal goals
- Style preferences, fitness goals
- Emotional patterns (when user shares feelings)
- Communication preferences detected from conversation

---

## Summary of Changes


| File                               | Change                                       |
| ---------------------------------- | -------------------------------------------- |
| `supabase/functions/chat/index.ts` | Rewrite system prompt with human personality |
| `src/components/NosyMascot.tsx`    | New animated mascot component                |
| `src/pages/Index.tsx`              | Integrate Nosy mascot                        |


This makes Hanchi feel like a real friend, not a machine, and adds the Duolingo-style companion that makes the app feel alive.Nosy the mascot and the 15 year old boy are the same Although nosy looks like a cool Nose inspired mascot He is also 15 Nigerian And Part human basically Give him Lore expression emojis Reactions Make Him alive 