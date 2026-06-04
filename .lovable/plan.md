
# Presentation Mode Control Bar — Premium Polish

Scope: **only** `src/components/presentation/PresentationMode.tsx` footer. No functional changes, no button reordering, no header changes, no reader changes.

## 1. Glass surface
Replace footer container classes with Apple-style frosted glass:
- `backdrop-blur-2xl` + `bg-white/55` (light) / `bg-white/10` (dark)
- `border border-white/40` (light) / `border-white/15` (dark)
- `shadow-[0_20px_60px_-20px_rgba(60,40,15,0.45)]`
- Rounded `rounded-[28px]`, inner padding tightened
- Keep current max width and horizontal centering

## 2. Play button as primary
- Size up: `h-12 w-12` circular (vs 10x10 pill today)
- Alpha purple accent gradient: `bg-gradient-to-br from-[#7c5cff] to-[#b8893a]` with white icon
- Soft glow: `shadow-[0_0_24px_-4px_rgba(124,92,255,0.55)]`
- Pause state keeps same surface, swaps icon
- Stays in same left slot

## 3. Speed pills
- Compact pill row `h-8 px-3 rounded-full text-[11px]`
- Active: filled purple/gold accent with subtle inner shadow
- Inactive: `bg-white/40 dark:bg-white/5 border-white/30` glass
- Same 3 options, same order

## 4. Font size cluster
- Two circular glass buttons `h-9 w-9 rounded-full`
- Consistent `h-4 w-4` icons, equal gap
- Percentage label stays between them, tabular numbers

## 5. Auto-hide
Add inside `PresentationMode`:
- `const [chromeVisible, setChromeVisible] = useState(true)`
- `useRef<number>` timer; helper `bumpActivity()` sets visible=true and resets 5s timeout to set false
- On mount (when `open`): attach listeners on `scrollerRef.current` (`scroll`) and `window` (`mousemove`, `touchstart`, `click`, `keydown`) → `bumpActivity`
- Apply to footer AND header wrapper:
  - `className={cn("transition-opacity duration-500", chromeVisible ? "opacity-100" : "opacity-20")}`
  - Pointer events stay enabled so a tap reappears them
- Clear timer on close/unmount; pause auto-hide while `!playing`? Keep simple: always 5s regardless of state (spec says "after 5s of inactivity").

## 6. Readability guards
- No background change to main content area
- Footer keeps `relative z-10` and bottom safe-area padding
- Reduced visual weight at idle via opacity fade (not blur removal)

## Technical notes
- Single file edit: `src/components/presentation/PresentationMode.tsx`
- No new dependencies
- Keep existing keyboard shortcuts and rAF auto-scroll untouched
- Verify by opening any presentation (Agpeya/Feasts/Synaxarium), confirm: glass look, larger glowing play, pill speeds, circular font buttons, fade to 20% after 5s idle, reappear on activity.
