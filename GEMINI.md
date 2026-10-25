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

---

# CORE APP PHILOSOPHY (IMMUTABLE LAWS)

1. **Async Multiplayer Puzzle Paradigm:**
   Sudoku is an asynchronous mental puzzle, not a real-time twitch shooter. Challenges and rooms possess a universal 7-day lifespan (`7 * 24 * 60 * 60 * 1000`). Rooms NEVER close or switch to "completed" just because the host or one player finishes; each participant's timer, progress, and submission are fully decoupled.

2. **Cloud-First SSOT & Strict Vault Isolation:**
   Authenticated user accounts (`sudoku_vault_${uid}`) must remain 100% physically isolated from `sudoku_guest_vault`. Cloud Firestore (`/users/{uid}`) is the Single Source of Truth (SSOT). LocalStorage acts solely as a high-speed offline/instant-hydration cache. User settings, gameplay history, and personal best times must never bleed between guest and authenticated spaces.

3. **Safe In-Memory Auth Transitions (Zero-Reboot / Zero-Destructive Purge):**
   Logging in and logging out must ALWAYS execute as smooth in-memory transitions without full-page reboots (`window.location.reload()`), unhandled rejections, or `<StudioSplash>` re-mounting. `handleLogout` must NEVER purge vaults or indiscriminately clear storage; it only points the active namespace to the guest drawer and tears down listeners cleanly.

4. **Sync Loading Wall & Cold-Boot Protection:**
   The dashboard must gate rendering behind a Pastel Sync Loading Wall (`!isAppReady`) with an automated 3.5s safety timeout. On cold-boot or empty cache, memory stats are zeroed/skeletonized so guest records never leak into an authenticated profile before cloud hydration finishes.

---

# 4 DEEP-DIVE RULES (FORENSIC & ARCHITECTURAL RIGOR)

1. **Rule 1: End-to-End Pipeline Tracing:**
   Before modifying any state or listener, trace the full data lifecycle from storage/network trigger to React state to UI render. Verify both sides of every auth and sync transition (guest ➔ user and user ➔ guest).

2. **Rule 2: Decoupled Architecture & Guarded Writes:**
   Never allow unauthenticated or guest sessions to execute cloud writes (e.g. Firestore `/users/{uid}`). Ensure presence broadcasters and push-token managers silently exit on guest IDs, preventing permission-denied rejections and ErrorBoundary reloads.

3. **Rule 3: Defensive Re-Authentication Suppression:**
   Strictly distinguish between initial cold-boot authentication and explicit user logouts. Explicit logouts must set `isExplicitLogoutRef` to suppress background `signInAnonymously(auth)` loops, guaranteeing the user stays calmly in Guest mode without flip-flops.

4. **Rule 4: Resilient Fail-Safe Timeouts:**
   Every network gate, hydration lock, or cloud wait must feature a bounded fallback timer (e.g., 3.5s safety timeout) so no user is ever left trapped on a frozen loading screen under poor network conditions or offline boots.