

# Plan: Fix Critical Crash + Polish Hanchi AI

## Priority 1: Fix App-Breaking Crash

The app is currently **completely broken**. `NosyMascotV2` crashes with `TypeError: Cannot read properties of null (reading 'useState')` on the Landing page. This is likely caused by a React context/import issue in the component or its barrel export. The error occurs at line 73 of NosyMascotV2.tsx.

**Fix**: Investigate and fix the `useState` crash in `NosyMascotV2`. Likely causes: conditional hook call, corrupted import, or the `useAnimation` hook from framer-motion failing. Wrap the Landing page usage in an error boundary or lazy-load the mascot.

## Priority 2: Route Fix

The user is on `/index` which hits the 404 page. The chat route is `/chat` and landing is `/`. Add `/index` as an alias route to `/chat` in `App.tsx`.

## Priority 3: Plus Menu Popup Bug

When closing the plus menu, the file upload dialog still triggers. The `actionClickedRef` guard needs strengthening -- ensure the `onOpenChange(false)` path never calls upload handlers.

## Priority 4: UI/UX Polish

1. **Addon chips**: Make them larger with gradient backgrounds and emoji prefixes (already partially done, verify rendering)
2. **Sidebar**: Verify Tools/Explore collapsed by default
3. **Chat input**: Confirm sticky bottom layout works on 393px viewport
4. **Settings page**: Verify grouped navigation works

## Priority 5: Image Generation in Chat

The `handleSend` in Index.tsx already detects image commands and calls `generateImage`. Verify the `generate-image` edge function works end-to-end. If it fails, update it to use Lovable AI's image generation model (`google/gemini-2.5-flash-image`).

## Files to Modify

| File | Change |
|------|--------|
| `src/components/nosy/NosyMascotV2.tsx` | Fix useState crash - likely move hook calls or fix conditional rendering |
| `src/App.tsx` | Add `/index` route alias to `<Index />` |
| `src/components/EnhancedPlusMenu.tsx` | Strengthen upload popup guard |
| `supabase/functions/generate-image/index.ts` | Verify/fix to use Lovable AI image model |

## Implementation Order

1. Fix NosyMascotV2 crash (unblocks entire app)
2. Add /index route
3. Verify plus menu fix
4. Test image generation flow

