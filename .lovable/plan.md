

# Plan: Code Nosy as a Fully Animated SVG Character

## Overview

Replace all PNG assets with a **hand-coded SVG character** built entirely in React + framer-motion. Nosy will be a stylized nose-shaped mascot with individually animated body parts (eyes, arms, mouth, legs), mouse-tracking pupils, mood-based expressions, typo detection, and all existing behaviors preserved.

## Architecture

```text
src/components/nosy/
├── NosyCharacter.tsx      ← SVG body: nose-shaped torso, eyes, mouth, arms, legs
├── NosyExpressions.ts     ← Mood → body part config mappings
├── NosyTypoDetector.tsx   ← Monitors input, shows correction bubbles
├── NosyMascotV2.tsx       ← State machine wrapper (replaces NosyMascot.tsx)
└── index.ts               ← Barrel export
```

## Part 1: SVG Character (`NosyCharacter.tsx`)

A ~250-line component rendering Nosy as layered `motion.path` / `motion.ellipse` / `motion.circle` elements:

- **Body**: Rounded teardrop/bean shape with gradient fill (warm brown/amber tones matching theme)
- **Eyes**: Two oval whites with dark pupils that **track mouse position** via `useMousePosition` hook — pupils offset capped within eye bounds
- **Eyebrows**: Two arcs that raise (curious), furrow (worried), or relax (idle)
- **Mouth**: Bezier curve path that morphs between: smile, grin, "o" shape, frown, flat line
- **Arms**: Two stubby limb paths — can wave, rest at sides, hold chin (thinking), raise (happy), hold phone (bored)
- **Legs**: Two small stumps with idle bounce animation
- **Accessories**: Small beanie/cap on top, phone SVG in hand when bored
- **Blink system**: Random interval 3-5s eye close/open

Props: `mood`, `size`, `mousePosition`, `isBlinking`

## Part 2: Expression System (`NosyExpressions.ts`)

Config object mapping each `NosyMood` to specific SVG transform values:

| Mood | Eyes | Mouth | Arms | Body | Extra |
|------|------|-------|------|------|-------|
| idle | normal + blink | small smile | resting | gentle float | leg bounce |
| curious | wide | "o" | one raised | lean forward 5° | brows up |
| thinking | half-closed | flat | chin tap loop | slow rock | "..." thought dots |
| happy | crescents ^^ | big grin | both up | bounce | sparkle particles |
| worried | wide + tremble | frown | clutch body | shake | sweat drop |
| bored | droopy half-lid | flat | holding phone | slouch | phone scroll anim |
| waving | normal | smile | one waving loop | slight lean | — |
| typing-help | one brow up | smirk | pointing right | lean toward input | — |

## Part 3: Typo Detector (`NosyTypoDetector.tsx`)

- Monitors the `inputText` prop (passed from FloatingInputV2's textarea value)
- Dictionary of ~60 common misspellings: "teh"→"the", "definately"→"definitely", "recieve"→"receive", Nigerian-common ones too
- Detects double spaces, missing caps after periods
- When typo found: triggers `typing-help` mood, renders a small speech bubble near Nosy with correction
- Click bubble to apply fix (callback to parent), auto-dismiss after 5s
- Non-intrusive: only shows for clear typos, not style preferences

## Part 4: Wrapper (`NosyMascotV2.tsx`)

Preserves ALL existing NosyMascot.tsx logic:
- Same mood state machine (idle → bored after 30s, curious on keypress, thinking on load, happy on new message, worried on error, waving on landing)
- Same context-aware tips system (code detection, image detection, greetings, first message celebration)
- Same drag behavior, minimize button, speech bubbles
- Same style-cycling when bored (but now cycles SVG color schemes instead of PNG images — e.g., "Neon mode", "Earth mode", "Ocean mode")
- **New**: Accepts `inputText` prop, passes to `NosyTypoDetector`
- **New**: Mouse position tracking via window mousemove → passed to `NosyCharacter` for eye tracking

## Part 5: Integration Changes

**`src/pages/Index.tsx`**:
- Replace `import { NosyMascot }` with `import { NosyMascotV2 }`
- Add `inputText` state lifted from FloatingInputV2 (or pass via callback)
- Pass `inputText` to NosyMascotV2

**`src/components/FloatingInputV2.tsx`**:
- Add `onInputChange?: (text: string) => void` prop
- Call it on textarea change so parent can feed text to Nosy

**`src/pages/Landing.tsx`**:
- Swap to `NosyMascotV2 variant="landing"`

**Delete**: `src/components/NosyMascot.tsx` (old file)
**Keep**: PNG assets in `src/assets/` can remain for now (unused but harmless)

## Summary

| File | Action |
|------|--------|
| `src/components/nosy/NosyCharacter.tsx` | NEW — Full SVG character |
| `src/components/nosy/NosyExpressions.ts` | NEW — Mood configs |
| `src/components/nosy/NosyTypoDetector.tsx` | NEW — Typo detection + correction bubbles |
| `src/components/nosy/NosyMascotV2.tsx` | NEW — State machine wrapper |
| `src/components/nosy/index.ts` | NEW — Barrel export |
| `src/components/FloatingInputV2.tsx` | EDIT — Add onInputChange callback |
| `src/pages/Index.tsx` | EDIT — Swap mascot, pass inputText |
| `src/pages/Landing.tsx` | EDIT — Swap mascot |
| `src/components/NosyMascot.tsx` | DELETE — Replaced |

