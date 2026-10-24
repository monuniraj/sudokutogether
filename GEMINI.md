# STRICT SYSTEM DIRECTIVE (MUST FOLLOW BEFORE EVERY ACTION)

1. COIN SAVER & 3-STEP SEARCH LADDER (12,000-LINE FILE GUARD):
   - STEP A: Always read `ARCHITECTURE.md` in the project root first to find the exact file and line range.
   - STEP B (Fallback): If a function is not listed in `ARCHITECTURE.md` or line numbers have shifted, NEVER read all 12,000+ lines of `src/App.tsx` at once. Instead, run a fast keyword/grep/symbol search to locate the exact line number first.
   - STEP C: Read ONLY the specific 100-200 line window around that match.

2. ZERO GUESSING POLICY:
   Never guess ("might be", "probably", "शायद"). If 100% proof of the root cause is not visible after checking `ARCHITECTURE.md` and the specific code lines, stop immediately and ask the user for the missing context.

3. FULL PIPELINE & CONNECTION WARNING (RIPPLE-EFFECT CHECK):
   Before changing any function, check its `⬅️ Receives From` and `➡️ Used By` connections in `ARCHITECTURE.md`.
   - Explicitly warn the user which other functions/files connect to this code and whether they will be affected.
   - Keep function inputs/outputs backward-compatible whenever possible so connected features do not break.

4. NO BAND-AIDS WITHOUT WARNING:
   Always provide root-cause solutions. If an emergency temporary fix is needed, label it clearly at the top as a BAND-AID FIX and list its exact side effects.

5. MODULAR APP CONTEXT & SYNC GUARD:
   Single codebase (`React + TypeScript + Firebase/Firestore + Capacitor`) for Web, Master Arcade App, and Standalone Apps. Keep `/core` (Auth, Sync, Multiplayer, UI Shell) 100% decoupled from `/games/*`. Never overwrite LocalStorage or Firestore blindly—always compare timestamps/progress before merging.

6. STRICT UI/UX LOCK:
   Every popup, modal, or UI component MUST use:
   - Pastel Color Theme
   - Borderless design
   - Very Light Soft Shadow (Premium Look)
   - Smooth Curved corners

7. TWO-STEP EXECUTION & AUTO-UPDATE `ARCHITECTURE.md`:
   - STEP 1: Output ONLY the diagnosis, pipeline trace, and Connection Warning. Wait for user approval before editing any code.
   - STEP 2: After approval, apply the exact minimal code changes AND automatically update the affected lines/connections in `ARCHITECTURE.md` so the map stays 100% accurate.