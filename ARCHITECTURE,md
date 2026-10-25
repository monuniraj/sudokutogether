# LIVING ARCHITECTURE BLUEPRINT (`ARCHITECTURE.md`)

> **RULE FOR AI AGENTS:** Read this file FIRST before scanning the repository. NEVER read all 12,000+ lines of `src/App.tsx` at once. Use the exact line ranges below (or `grep` if lines have shifted) and read only the 100-200 line window needed for the current task. Update this file whenever line numbers, functions, or data connections change.

---

## 1. Project Files & Modular Responsibility Map

| File Path | Role & Responsibility | Connected To |
| :--- | :--- | :--- |
| `src/App.tsx` (~12,043 lines) | Monolithic shell currently holding Core Auth, Vault Sync, Multiplayer Rooms/Invites, Audio Synth, Sudoku Engine, and Screen Routing. | Imports all modals, board components, hooks, and utils below. |
| `src/firebase.ts` | Initializes Firebase App, `db` (Firestore), `auth` (Firebase Auth), `GoogleAuthProvider`, and `messaging` (FCM). | `⬅️ Imported by:` `src/App.tsx`, `useFriendPresence.ts` |
| `src/utils/storageEngine.ts` | Canonical 4-key LocalStorage Vault Engine (`loadVault`, `hasVault`, `saveVault`, `updateVault`, `purgeLegacyKeys`, `getActiveAuthUid`, `setActiveAuthUid`, `reconcileBestTimesFromHistory`, `saveSettings`, `getSettings`). | `⬅️ Inputs:` UID / Vault state updates from `src/App.tsx`.<br>`➡️ Outputs:` `sudoku_vault_${uid}`, `sudoku_guest_vault`, `sudoku_settings`, `sudoku_active_auth_uid`. |
| `src/hooks/useFriendPresence.ts` | Real-time online/offline friend status & incognito hook. Queries/writes Firestore `/presence/{uid}`. Gated against guest IDs for `/users/{id}` writes. | `⬅️ Inputs:` `(explicitUserId, playerIds)` from `src/App.tsx` and `CreateChallengeModal.tsx`. |
| `src/components/game/SudokuBoard.tsx` | Renders the 9x9 interactive Sudoku grid, cell highlights, notes, and crosshairs. | `⬅️ Receives props from:` `src/App.tsx` (`boardState`, theme tokens, cell tap handlers). |
| `src/components/game/SudokuKeypad.tsx` | Renders 1-9 input buttons, Undo, Erase, Pencil Notes, Smart Hint, and Fast-Fill toggles. | `⬅️ Receives props from:` `src/App.tsx` (`lockedNum`, `activeKeypadNum`, `pencilMode`, `hintInventory`). |
| `src/components/modals/CreateChallengeModal.tsx` | Multiplayer room setup, difficulty/mistake/hint/timer selectors, PIN lock, and friend invite list. | `⬅️ Receives:` `multiplayerPlayers`, room settings, `handleInviteFriend` from `src/App.tsx`.<br>`➡️ Calls:` `useFriendPresence(undefined, playerIds)` (line 115). |
| `src/components/modals/GameOverModal.tsx` | Solo & Multiplayer end-game results, 4-beat PB odometer celebration, live podium standings, and Step-2 Rematch Lobby. | `⬅️ Receives:` `syncedLeaderboard`, `pbStage`, `rollingBestTime`, `endGameStep` from `src/App.tsx`. |
| `src/components/modals/*` | `RulesModal`, `SettingsModal`, `StatsModal`, `JoinRoomModal`, `MultiplayerForkModal`, `IncomingInviteModal`. | Controlled by modal boolean states in `src/App.tsx`. |
| `src/utils/soundEffects.ts`, `haptics.ts`, `themeFeedback.ts`, `formatTimestamp.ts` | Party popper synth, native/web haptic feedback, theme toggle feedback, and timestamp formatters. | `⬅️ Imported by:` `src/App.tsx` and modal components. |

---

## 2. Exact Line-Number Index Inside `src/App.tsx`

| Line Range | Section / Function Name | Purpose |
| :--- | :--- | :--- |
| **1 – 149** | Imports & `getAudioCtx()` | Module imports, global Web Audio Context singleton, and gesture auto-unlock listeners. |
| **151 – 365** | Core Types & Theme Constants | `SudokuCell`, `BoardState`, `Difficulty`, `normalizeDifficulty`, `getDifficultyColorTheme` (pastel color tokens), `DEFAULT_SETTINGS`, `DIFFICULTY_GRID_THEMES`, `CompletedGame`, `PendingChallenge`, `INITIAL_GUEST_STATE`. |
| **367 – 475** | Pure Sudoku Generator Engine | `createPRNG`, `isValidPlacementPure`, `solveSudokuRecursivePure`, `countSolutionsPure`, `generateFlatBoardForSeed`. |
| **477 – 730** | URL, Sanitizer & Share Helpers | `getSharedOrigin`, `encodePass`, `decodePass`, `sanitizeText`, `sanitizeGameId`, `sanitizePassword`, `copyToClipboard`, `shareOrCopyContent`. |
| **732 – 762** | Storage Namespace Resolver | `setGuestNamespaceLock`, `getScopedKey(baseKey, uid)`, `persistGuestThemeToVault`. |
| **768 – 885** | `App()` Entry, Theme & Navigation | `activeTheme` state, `navigateToScreen`, `navigatorPop` (stack-based screen navigation). |
| **893 – 955** | 0ms Synchronous Bootstrap | Reads `getActiveAuthUid()`, `loadVault()`, initializes `authUser` and `userProfile` without flicker. |
| **963 – 1088** | Display Name Guards | `checkIsDisplayNameConfigured`, `getActiveDisplayName`, `handleAcceptInvitationWithProfileCheck`, `saveAndExecuteName`. |
| **1112 – 1255** | Multiplayer & Friends State | `multiplayerPlayers`, `friends`, `recentPlayers`, scoped localStorage sync effect, `useFriendPresence` hook call. |
| **1685 – 1710** | `isAppReady` & Cancellable 3.5s Safety Timeout | Gates initial rendering with `isAppReady`, manages `safetyTimeoutRef` & `clearSafetyTimeout` to ensure UI is never stuck while cancelling safely when cloud data resolves. |
| **2435 – 2470** | Leaderboard Cache, Vault Sync & `pendingChallenges` | `challengeLeaderboardCache`, `savedGames`, `completedGames`, `pendingChallenges` (initialized via `getScopedKey("pending_challenges")` with legacy fallback). |
| **2672 – 2776** | Bell Notification Grouping | `extractRoomCodeFromChallenge`, `getInviteTimestampMs`, `sortedBellInvites` (groups `challenge_completed` by room), `unreadNotificationCount`. |
| **2778 – 2940** | User Settings States | `darkMode`, `soundEffects`, `vibrations`, `timerEnabled`, `mistakeLimitEnabled`, `isNumberFirstInputMode`, `autoSwitchCompletedNumber`, `isAutoRemoveNotesEnabled`. |
| **3220 – 3390** | Unified Invite & Bell Router | **SSOT BELL FUNNEL:** `upsertBellChallenge` (canonical ID + real-name protection + `normalizeDifficulty` + dual-write scoped storage), `routeInviteNotification`, `dockInviteToBell`, `activeInviteNotificationRef`. |
| **3980 – 4770** | `hydrateUserFromCloud` | Resolves profile name and cloud stats from Firestore, writes local vault, triggers Fast-Path Early Unlock (`clearSafetyTimeout`, `setIsAuthHydrating(false)`, `setIsAppReady(true)`), and syncs players/FCM in background. |
| **4785 – 5015** | `onAuthStateChanged` | Contains `currentHydratedUidRef` re-entrance guard, suppresses `signInAnonymously` on explicit logout (`isExplicitLogoutRef`), zeroes cold-boot stats when `userHasVault` is false, and triggers cloud hydration. |
| **5250 – 5445** | `handleConnectGoogle` | Interactive Google sign-in & anonymous account linking flow with Global Execution Tracer (`[+XXms]`). Sequences guest snapshot, popup, in-memory flush, and cloud hydration. |
| **5446 – 5565** | `handleLogout` | Safe Logout SSOT: sets `isExplicitLogoutRef`, wipes session tokens, sets guest drawer, unlocks `isAppReady`, and releases logout locks after 150ms. |
| **6190 – 6270** | Incoming Invites Listener #1 | Firestore `onSnapshot` on `/invites` (`toUserId == activeId`), automatically normalizes difficulty via `normalizeDifficulty`, upserts pending invites to Bell on app load, cleans up invites on accept/decline. |
| **6580 – 6605** | `saveFcmToken` | Saves `fcmToken`, `fcmTokens` array, and platform-specific `fcmToken_native` / `fcmToken_web` so Android and Web APKs do not overwrite each other. |
| **6930 – 6965** | Bell Invite Actions | `handleAcceptAndPlayBellInvite` (resolves canonical room code via `extractRoomCodeFromChallenge`) and `handleDeclineBellInvite` (dual-write scoped storage). |
| **6970 – 7230** | `handleViewChallengeResults` | Zero-latency modal open + 7-day partial standings sync (Host completed, Guest pending). Result dismissal filter ONLY removes `type === "challenge_completed"`, preserving active game invites. |
| **7330 – 7890** | Push Notifications & FCM Listeners | Native FCM (`PushNotifications`), Local Notifications, Service Worker `message` listener, and Web FCM (`onMessage`), all unified through `upsertBellChallenge` and normalized with `normalizeDifficulty`. |
| **9920 – 10015** | Direct Invite Dispatch (`handleInviteFriend`) | Resolves `fromName` via `getActiveDisplayName()`, passes dynamic `difficulty`, `seed`, `maxMistakes`, `hintLimit`, `timerEnabled` to `/invites` with canonical 7-day `expiresAt`. |
| **10016 – 10245** | `saveGameToHistory` | Updates local vault, direct Firestore cloud sync on `/users/{uid}`, and cleans up receiver's `invite_${cleanRoomCode}` while preserving `challenge_completed` cards. |
| **10580 – 10650** | `submitGameResult` | Writes player match result to `/rooms/{roomCode}/players/{userId}` and `/challenge_results/{docId}/participants/{userId}` while strictly keeping `/rooms/{roomCode}` `status: "active"`. |
| **13300 – 13335** | Root Layout & Pastel Sync Loading Wall | Renders borderless Pastel Sync Loading Wall (`!isAppReady`) with rounded corners, soft shadow, and animated sparkles indicator. |
| **18610 – 18810** | Bell Modal Invite Card Rendering | Renders dynamic difficulty badges, difficulty-matched pastel cards (`diffTheme.cardBg`), and buttons (`diffTheme.primaryBtn`). |
| **18820 – 19040** | Toast Banner (`activeInviteNotification`) | Renders 5s countdown banner with difficulty-matched icon (`notifTheme.iconBg`), badge, button (`notifTheme.primaryBtn`), and countdown gradient (`notifTheme.progressBarGradient`). |

---

## 3. Core Data Pipelines & Connection Wires (`⬅️ Inputs` / `➡️ Outputs`)

### A. Auth & Cloud Hydration Pipeline
* **`onAuthStateChanged` (`src/App.tsx:4715`)**
  * `⬅️ Receives From:` Firebase Auth SDK state change.
  * `➡️ Sends To:`
    * If `!user`:
      * If `isExplicitLogoutRef.current`: suppresses background anonymous sign-in, resets flag, and calls `setIsAppReady(true)`.
      * Else: invokes `signInAnonymously(auth)` and resolves `setIsAppReady(true)` in `finally`.
      * Immediately loads `loadVault("guest")` into memory.
    * If `user && !user.isAnonymous`:
      * **Re-Entrance Protection Guard:** If `currentHydratedUidRef.current === user.uid && userProfileRef.current?.id === user.uid && userProfileRef.current?.isSynced`, cancels safety timeout, unlocks UI, and returns immediately without resetting state.
      * Else: sets active auth UID.
      * **Write-Lock Guard:** Engages `isHydrationCompleteRef.current = false` and `setHydrationWriteLock(user.uid, true)`.
      * **Ghost Memory Sanitization:** Wipes guest in-progress games and timers (`setSavedSessionInfo(null)`, `setBoardState(null)`, `setSessionSeconds(0)`).
      * If `userHasVault(uid)`: loads cached vault and authenticates user's own scoped in-progress game.
      * If `!userHasVault(uid)` (cold boot): zero/skeletonizes memory stats and retains skeleton display name (`""`) so Gmail account name cannot overwrite custom Firestore names.
      * Sequences cloud hydration via `hydrateUserFromCloud(user.uid, user, true)`.
* **`hydrateUserFromCloud(uid, authUser, force)` (`src/App.tsx:3915`)**
  * `⬅️ Receives From:` `onAuthStateChanged` OR `handleConnectGoogle`, plus Firestore `/users/{uid}` and `/users/{uid}/past_players`, plus local `loadVault(uid)`.
  * `➡️ Sends To:`
    * **Direct Cloud-First Server Fetch (`getDocFromServer`):** Forces Firebase SDK to query Cloud Firestore SSOT directly (`getDocFromServer`), bypassing any empty/stale local persistence cache on fresh manual logins, with defensive fallback to `getDoc` on offline/network errors.
    * **Cloud-First SSOT Name Resolution:** Prioritizes Firestore custom name (`cloudDocData.name` / `displayName`) -> local vault custom name -> Google `authUser.displayName` -> email prefix -> `"Player"`. Strictly prevents Gmail account names from bypassing Firestore names.
    * Disengages `setHydrationWriteLock(uid, false)` and `isHydrationCompleteRef.current = true` right before writing reconciled data.
    * `saveVault(updatedVault, uid)` in `src/utils/storageEngine.ts`.
    * **Atomic Fast-Path Early Unlock:** Immediately after profile & stats commit to React state (`setUserProfile`, `setTotalGamesPlayed`, etc.):
      - Cancels safety timeout via `clearSafetyTimeoutRef.current()`.
      - Unlocks UI via `setIsAppReady(true)` and `setIsAuthHydrating(false)`.
      - Records `currentHydratedUidRef.current = uid`.
      - Secondary network operations (`users/{uid}/past_players` and FCM token updates) proceed asynchronously in the background without blocking the UI or risking the 3.5s timeout.
    * When Firestore doc does not exist (`!userSnap.exists()`): Initializes `/users/{uid}` document via `setDoc(..., { merge: true })` with the resolved display name and stats, applying Fast-Path Early Unlock immediately.
    * React states: `userProfile`, `totalGamesPlayed`, `totalWinsCount`, `winStreak`, `personalBestTimes`, `completedGames`, `savedGames`, `friends`, `recentPlayers`, `multiplayerPlayers`, and all settings states.
    * Conditional Cloud Sync-Up: If local vault has unsynced games for the same `uid`, writes merged stats/history back to `/users/{uid}`.
    * `finally`: releases `setHydrationWriteLock(uid, false)`, `isHydrationCompleteRef.current = true`, and sets `setIsAuthHydrating(false)` and `setIsAppReady(true)`.
* **`Strict Hydration Write-Lock Guards (5-Point Anti-Race Shield)`**
  * **Zero-Premature-Writes Guarantee:** When Google Auth resolves, `auth.currentUser` becomes active immediately, but `setHydrationWriteLock(uid, true)`, `isHydrationCompleteRef.current = false`, and `setIsAuthHydrating(true)` are engaged *before* `setAuthUser(finalUser)` to prevent reactive hooks from executing partial writes.
  * **Point 1 (`useFriendPresence.ts: broadcastStatus` & transition):** Guarded by `isHydrationWriteLocked(currentId)`. Never writes `{ status: "online" }` while user hydration is active.
  * **Point 2 (`App.tsx: useFriendPresence` caller):** Passes `null` effective presence UID while `isSyncingCloudData || !isHydrationCompleteRef.current || isHydrationWriteLocked(...)`.
  * **Point 3 (`App.tsx: syncSettingsToCloud`):** Silently aborts if `isHydrationWriteLocked(currentUid) || !isHydrationCompleteRef.current || isConnectingRef.current`.
  * **Point 4 (`App.tsx: syncPushPreference`):** Guarded by `isHydrationWriteLocked(uid) || !isHydrationCompleteRef.current || isConnectingRef.current || isSyncingCloudData`.
  * **Point 5 (`App.tsx: FCM Token & Language Sync Effects`):** Guarded by `isHydrationWriteLocked(userProfile?.id) || !isHydrationCompleteRef.current || isConnectingRef.current || isSyncingCloudData`.
* **`storageEngine.ts: loadVault & saveVault`**
  * `loadVault(uid)`: Read-only on cold boot for authenticated users. `migrateLegacyToVault` does NOT persist blank default 0-stats vaults to disk.
  * `saveVault(vault, uid)`: Guarded by `isHydrationWriteLocked(uid)`. Automatically blocks premature writes while cloud hydration is in flight.
* **`handleLogout()` (`src/App.tsx:5270`) (Safe Logout SSOT)**
  * `⬅️ Receives From:` User clicking Logout in SettingsModal.
  * `➡️ Sends To:`
    * Sets `isLoggingOutRef.current = true` and `isExplicitLogoutRef.current = true`.
    * Updates Firestore user presence and prunes FCM device token (non-blocking).
    * Locks active namespace to guest (`setGuestNamespaceLock(true)`).
    * Flushes ephemeral session markers ONLY (`savedSession`, `lastCompletedSession`, `active_invite`). **NEVER deletes user vault `sudoku_vault_${uid}` or scoped keys `sudoku_user_${uid}_*`.**
    * Switches `setActiveAuthUid("guest")`, loads canonical `loadVault("guest")` into memory, and signs out of Firebase Auth cleanly without full page reload.
    * Unlocks `setIsAppReady(true)` and releases `isLoggingOutRef` and `isExplicitLogoutRef` safely after a 150ms macrotask tick via `setTimeout`.

### B. Game Completion & Stats Write Pipeline
* **`saveGameToHistory(isWon, mistakesOverride)` (`src/App.tsx:9807`)**
  * `⬅️ Receives From:` Game-over trigger when a Solo or Multiplayer board finishes.
  * `➡️ Sends To:`
    1. `updateVault()` (`lines 9933-9972`) -> updates `sudoku_vault_${targetUid}` in LocalStorage and runs `reconcileBestTimesFromHistory()`.
    2. Cloud-First SSOT Write (`lines 10070-10086`): If user is authenticated (`effectiveCloudUid`), writes directly to Firestore `/users/{effectiveCloudUid}` with `{ merge: true }`: `stats`, `completedGames`, `bestTimes`, `totalGamesPlayed`, `totalWinsCount`, `winStreak`, `wins`, `updatedAt: serverTimestamp()`.

### C. Multiplayer Room, Invite & Result Pipeline
* **Room Creation (`openCreateRoomModal` & `updateRoomSettingsInFirestore`)**
  * `⬅️ Receives From:` Host UI actions in `CreateChallengeModal`.
  * `➡️ Sends To:` `generateFlatBoardForSeed()` -> writes `/rooms/{roomCode}` with `puzzleFlat` (81 numbers), `solutionFlat` (81 numbers), `difficulty`, `mistakesLimit`, `hintsLimit`, `timerEnabled`, `status: "active"`, and canonical 7-day `expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)`.
* **Invite Dispatch (`handleInviteFriend` at `src/App.tsx:9920`)**
  * `⬅️ Receives From:` Host clicking "Invite" in `CreateChallengeModal` or Rematch Lobby.
  * `➡️ Sends To:` Firestore `/invites/{id}` (`toUserId`, `fromUserId`, `fromName`, `roomCode`, `gameId`, `difficulty: challengeDifficulty`, `seed`, `maxMistakes: challengeMistakeLimit`, `hintLimit: challengeHintLimit`, `timerEnabled: challengeTimerEnabled`, `status: "pending"`, and canonical 7-day `expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)`).
* **Cloud Function Notification (`onInviteCreated` in `functions/index.js:180`)**
  * `⬅️ Receives From:` Firestore `/invites/{inviteId}` onCreate trigger.
  * `➡️ Sends To:` FCM multicast payload containing `difficulty: String(invite.difficulty || "MEDIUM")`, `seed: String(invite.seed || "")`, `maxMistakes`, `hintLimit`, `timerEnabled`, localized notification titles, and click action links.
* **Invite Reception & SSOT Bell Pipeline (`upsertBellChallenge` at `src/App.tsx:3220`, `routeInviteNotification` at `src/App.tsx:3340`)**
  * `⬅️ Receives From:` Firestore `/invites` query `where("toUserId", "==", activeId), where("status", "==", "pending")`, Capacitor Native Push (`pushNotificationReceived`), Service Worker `message` event, Web FCM `onMessage`, or local game completion.
  * `➡️ Sends To:`
    * **`normalizeDifficulty(raw)`:** Canonical sanitizer normalizing any input (`"easy"`, `"EASY"`, `"Medium"`, etc.) strictly to `"EASY" | "MEDIUM" | "HARD" | "EXPERT"`.
    * **`upsertBellChallenge(payload)` (SSOT):** Immediately upserts invite or race result into `pendingChallenges` state and persists to both `getScopedKey("pending_challenges")` and `sudoku_pending_challenges` (deduplicated by `invite_${roomCode}` or `puzzle_race_${roomCode}`, protecting real sender names from generic downgrades, with 7-day `expiresAt`).
    * **`sortedBellInvites`:** 7-Day Universal Lifespan filter (`now > expiresAt`) and Receiver Completion Filter (`completedRoomCodes.has(room)`). Bell drawer keeps invites accessible for 7 days even after the host/sender completes their game.
    * If actively in-game (`isActivelyInGame()` or `currentScreen === "game"`): suppresses banner/audio and routes quietly to Bell drawer (`triggerBellWiggle(true)`).
    * If not in-game & foreground: sets `activeInviteNotification` (5s countdown toast) with protected sender name.
* **Invite UI Presentation & Pastel Theming**
  * **Bell Invites Modal Card:** Renders dynamic difficulty badge (`{difficulty} DUEL`), soft difficulty-matched card background (`diffTheme.cardBg`), and theme-matched primary accept button (`diffTheme.primaryBtn`).
  * **In-App Toast Banner (`activeInviteNotification`):** Renders dynamic difficulty pill badge, matching pastel icon background (`notifTheme.iconBg`), theme-matched primary accept button (`notifTheme.primaryBtn`), and difficulty gradient progress countdown bar (`notifTheme.progressBarGradient`).
  * **Incoming Invite Modal (`IncomingInviteModal.tsx`):** Renders dynamic difficulty pastel badge and theme-matched accept button for direct PIN / join prompt.
* **Room Join (`executeJoinRoom` at `line 6701`)**
  * `⬅️ Receives From:` Join Room modal, Bell Invite accept (`handleAcceptAndPlayBellInvite`), Deep-link URL, or Push notification tap.
  * `➡️ Sends To:` Validates 7-day lifespan (`rData.expiresAt`), reads `/rooms/{roomCode}` -> populates `boardState` & `solutionGrid` -> calls `registerChallengeJoin(roomCode)` -> navigates to `"game"`.
* **Match Result Submission (`submitGameResult` at `line 10580` & `handleViewChallengeResults`)**
  * `⬅️ Receives From:` Match completion or "View Results" button.
  * `➡️ Sends To:`
    * Writes player match result to `/rooms/{roomCode}/players/{userId}` and `/challenge_results/{docId}/participants/{userId}`.
    * **Decoupled Room State:** Explicitly keeps `/rooms/{roomCode}` `status: "active"` (updating `lastCompletedUid`, `lastCompletedBy`, `lastCompletedTime`, `lastCompletedAt`). Room is NEVER marked completed/closed on single-player finish.
    * **Receiver Bell Cleanup:** In `saveGameToHistory`, removes receiver's `invite_${cleanRoomCode}` from `pendingChallenges` upon completion while preserving `challenge_completed` race standings.
    * **Graceful Asynchronous Standings:** `handleViewChallengeResults` queries `/rooms/{roomCode}/players`, `/challenge_results/{docId}/participants`, and `/invites` to display partial standings (Host completed, Guest pending) with animated pulsing status dots in `GameOverModal`.

---

## 4. Active Listeners Registry (Firestore, Auth, Capacitor & Window)

| Listener Type | Target / Collection | Location | Unsubscribe / Cleanup |
| :--- | :--- | :--- | :--- |
| `onAuthStateChanged` | Firebase `auth` | `src/App.tsx:2966` | Unsubscribed on `App` unmount. |
| `onSnapshot` (Invites) | `collection(db, "invites")` where `toUserId == activeId` & `status == "pending"` | `src/App.tsx:5920` | Unsubscribed when `authUser?.uid` or `userProfile?.id` changes. |
| `onSnapshot` (Presence) | `collection(db, "presence")` / `doc(db, "presence", id)` | `src/hooks/useFriendPresence.ts` | Unsubscribed on hook unmount or `playerIds` change. |
| `PushNotifications` & `LocalNotifications` | Native FCM registration, foreground receive, and tap actions | `src/App.tsx:7260-7455` | Removed in `useEffect` cleanup. |
| `onMessage` & SW `message` | Web FCM foreground messages & Service Worker clicks | `src/App.tsx:7457-7700` | Removed in `useEffect` cleanup. |
| `CapApp.addListener('backButton')` & `window.onpopstate` | Android hardware back button & browser swipe-back | `src/App.tsx:4390-4450` | Removed on unmount. |

---

## 5. Firestore Collections & LocalStorage Canonical Schema

### Firestore Collections
* **`/users/{uid}`**: `authUid`, `email`, `displayName`, `name`, `avatarColor`, `status`, `language`, `totalGamesPlayed`, `totalWinsCount`, `winStreak`, `wins`, `stats` (`{ totalGamesPlayed, totalWinsCount, winStreak }`), `bestTimes` (`{ EASY, MEDIUM, HARD, EXPERT, MASTER }`), `completedGames` (Array of up to 50 objects), `savedGames`, `settings`, `theme`, `fcmToken`, `fcmTokens`, `fcmToken_native`, `fcmToken_web`.
* **`/users/{uid}/past_players/{opponentId}`**: `id`, `name`, `isFriend`, `timestamp`.
* **`/rooms/{roomCode}`**: `roomCode` (6 digits), `seed`, `difficulty`, `puzzleFlat` (81 ints), `solutionFlat` (81 ints), `mistakesLimit`, `hintsLimit`, `timerEnabled`, `isLocked`, `pin`, `status` (`"active"`), `expiresAt` (7 days), `lastCompletedUid`, `lastCompletedBy`, `lastCompletedTime`, `lastCompletedAt`.
* **`/rooms/{roomCode}/players/{userId}`**: `id`, `name`, `status` (`"active"` | `"completed"` | `"mistake_game_over"` | `"left"`), `isWon`, `timeSec`, `elapsedTime`, `mistakes`, `updatedAt`.
* **`/challenge_results/{docId}/participants/{userId}`**: `challengeId`, `userId`, `playerName`, `timeSec`, `mistakes`, `hints`, `isWon`, `isPending`, `status`, `date`.
* **`/invites/{inviteId}`**: `id`, `toUserId`, `fromUserId`, `fromName`, `roomCode`, `gameId`, `seed`, `difficulty`, `maxMistakes`, `hintLimit`, `timerEnabled`, `password`, `status` (`"pending"` | `"accepted"` | `"declined"`), `timestamp`, `expiresAt` (7 days).
* **`/presence/{userId}`**: `status` (`"online"` | `"offline"`), `lastActive`.

### LocalStorage Canonical Keys (`src/utils/storageEngine.ts`)
1. **`sudoku_vault_${uid}`**: Isolated JSON vault for each authenticated Google user (`profile`, `stats`, `bestTimes`, `completedGames`, `savedGames`).
2. **`sudoku_guest_vault`**: Isolated JSON vault for offline/anonymous guest play.
3. **`sudoku_settings`**: Canonical device/user settings JSON.
4. **`sudoku_active_auth_uid`**: Pointer to active UID or `"guest"`.
5. **Scoped Keys (`getScopedKey`)**: `sudoku_user_${uid}_${baseKey}` or `sudoku_guest_${baseKey}` for `savedSession`, `lastCompletedSession`, `pending_challenges`, `friends`, `recent_players`, `past_players`, `activeTheme`, `darkMode`.

---

## 6. Resolved & Active Bug Registry

### ✅ Group 1: Unified Notification, Bell Drawer & Name Protection (RESOLVED in Phase 1)
1. **Empty Bell Drawer Mid-Game / Cold-Boot:** Resolved by routing all incoming invites and race completions through `upsertBellChallenge` FIRST before checking in-game state, and upserting existing pending invites on Firestore snapshot attach.
2. **Sender Name Downgrades ("Bhavna" ➔ "Player"):** Resolved by Real-Name Protection rule in `upsertBellChallenge` and `routeInviteNotification`, preventing generic fallbacks from overwriting verified names.
3. **Active Invite Erasure on Result View:** Resolved by making `handleViewChallengeResults` cleanup filter check `c.type === "challenge_completed"`. Active game invites are never purged when viewing duel standings.
4. **Multi-Platform FCM Token Collisions:** Resolved in `saveFcmToken` by recording `fcmToken_native` and `fcmToken_web` alongside `fcmTokens` arrayUnion, preventing Android APK and Web Chrome sessions from invalidating each other.

### ✅ Group 2: Auth Isolation, Safe Logout & Cloud SSOT (RESOLVED in Phase 3)
1. **Destructive Logout Data Loss:** Resolved in `handleLogout`. Removed destructive `key.startsWith("sudoku_user_")` wipe loop and `window.location.reload()`. Google user vaults (`sudoku_vault_${uid}`) and scoped keys remain 100% physically intact on device across logouts.
2. **"Pro_XXXX" Overwrite Bug:** Resolved across `storageEngine.ts` and `App.tsx`. `isGenericDisplayName` and `isGenericPlaceholder` flag `/^(Player|Pro|Guest|Anonymous)[_\s-]?\d*$/i` as generic placeholders. Google `authUser.displayName` is strictly prioritized over interim generic fallbacks during cold-boot and cloud hydration.
3. **Cloud-First SSOT Persistence:** Resolved in `saveGameToHistory` (`line 10070`), `saveAndExecuteName` (`line 1888`), and `SettingsModal` (`line 17680`). Game completions, career stats, and custom display names immediately write to `/users/{uid}` in Firestore with `{ merge: true }`.
4. **Legacy Scalar Fields Synchronization:** Resolved in `saveGameToHistory` by synchronizing `wins: updatedVault.stats.totalWinsCount` alongside nested `stats` object on `/users/{uid}`.
5. **Guest Vault Protection:** Removed `"sudoku_guest_vault"` from `purgeLegacyKeys()`, ensuring guest play history and settings are never purged.

### ✅ Group 3: 7-Day Async Invite Persistence (RESOLVED)
1. **7-Day Universal Lifespan Alignment:** Resolved TTL mismatch across client and backend. `handleInviteFriend` (`line 9777`), room creation, and Cloud Functions FCM dispatch (`functions/index.js:199, 315`) are unified to 7 days (`604800 * 1000` / `7 * 24 * 60 * 60 * 1000`). Rooms enforce 7-day expiration checks upon join (`executeJoinRoom:6718`).
2. **Decoupled Player States:** In `submitGameResult` (`line 10452`), when a player finishes a game, they only write their personal score to `/rooms/{roomCode}/players/{userId}` and `/challenge_results/{docId}/participants/{userId}`. The `/rooms/{roomCode}` document strictly maintains `status: "active"`.
3. **Persistent Bell Drawer Invites:** In `sortedBellInvites` (`line 2663`), invites are kept visible and playable for 7 days regardless of host match completion. An invite is only hidden if `now > expiresAt` or the current player already completed the room (`completedRoomCodes.has(room)`).
4. **Receiver Completion Cleanup:** In `saveGameToHistory` (`line 10074`), when the receiver finishes a game, `invite_${cleanRoomCode}` is cleanly removed from `pendingChallenges` and dual-written to scoped storage while preserving `challenge_completed` race standings.
5. **Graceful Partial Standings Display:** In `handleViewChallengeResults` (`line 7095`) and `GameOverModal.tsx`, partial standings (e.g., Host completed, Invited Friend pending) render smoothly with animated pulsing status indicators without crashes or blank states.
6. **Android Assets Synchronization:** Production bundle built and synchronized to `android/app/src/main/assets/public/` via `npx cap sync android`.

### ✅ Group 4: Sync Loading Wall & Zero-Reboot Safe Logout (RESOLVED)
1. **Sync Loading Wall with 3.5s Safety Timeout:** Gated initial dashboard rendering behind an `isAppReady` / `isAuthResolved` check backed by an automated 3.5s safety timer (`App.tsx:1608-1622`). Renders a borderless Pastel Sync Loading Wall (`App.tsx:13175-13205`) with soft shadows, smooth rounded corners, and animated sparkles indicator.
2. **Cold-Boot Guest Leak Prevention:** Zeroes/skeletonizes memory stats (`totalGamesPlayed`, `personalBestTimes`, `completedGames`, `savedGames`) in `onAuthStateChanged` (`App.tsx:4810-4825`) when `userHasVault` is false, preventing guest statistics from leaking into an authenticated session before cloud hydration finishes.
3. **Logout Crash & App Reboot Elimination:** Eliminated rapid auth-flip loops (`signInAnonymously`) following user logouts by using `isExplicitLogoutRef` in `onAuthStateChanged` (`App.tsx:4715-4725`) and safely releasing `isLoggingOutRef` after a 150ms macrotask tick (`App.tsx:5415-5425`).
4. **Guest Firestore Permission Guard:** Gated `useFriendPresence.ts:133-172` (`broadcastStatus` and `prevId` offline transition) to skip writes to `/users/{currentId}` when ID is a guest, preventing permission-denied exceptions that previously triggered `ErrorBoundary` reloads.

### ✅ Group 5: Cross-Device Push Notifications Overwrite Fix (RESOLVED)
1. **Hybrid Architecture (SSOT Array + Platform Slots):** Implemented Option C across `src/App.tsx` and `functions/index.js`. `fcmTokens: string[]` serves as the Single Source of Truth managed with `arrayUnion` and `arrayRemove`, while `fcmToken_native` and `fcmToken_web` track per-device platform slots.
2. **Eliminated Destructive Scalar Wipes:** Removed all instances of `updateData.fcmToken = ""` across `handleLogout` (`App.tsx:5290`), `syncPushPreference` (`App.tsx:5965`), `saveFcmToken` (`App.tsx:6630`), and `handleFactoryReset` (`App.tsx:12165`). A user logging out or toggling notifications on their Laptop browser no longer wipes their Android device's push notifications.
3. **Multi-Source Token Harvesting in Cloud Functions:** Updated `extractTokens` (`functions/index.js:95-115`) to aggregate tokens from `fcmTokens` array, `fcmToken_native`, `fcmToken_web`, and legacy scalar `fcmToken` using `Set` deduplication.
4. **Dead-Token Purge Protection:** Enhanced `pruneBadTokens` (`functions/index.js:120-145`) so that when unregistered/invalid tokens are removed from `fcmTokens`, any matching platform slots (`fcmToken`, `fcmToken_native`, `fcmToken_web`) are also cleared, preventing dead-token resurrection.

### ✅ Group 6: Guest Identity, Presence, Room Metadata & Full Timestamps (RESOLVED)
1. **Deterministic Permanent Guest Handle:** Implemented `getOrCreateGuestIdentity()` in `src/utils/storageEngine.ts`. Deterministically generates and caches `Guest_XXXX` / `GUEST_XXXX` under `sudoku_user_profile` and `sudoku_vault_guest` so guest handles survive page refreshes. Removed `Guest_XXXX` from `isGenericDisplayName` placeholder list and completely eliminated generic `"Player"` / `"Anonymous"` fallbacks in `createDefaultVault`, `loadVault`, `INITIAL_GUEST_STATE`, `getActiveDisplayName`, and room/invite payloads.
2. **Scoped Hydration Write-Lock & Restored Guest Presence:** `isHydrationWriteLocked(uid)` strictly returns `false` for guest/anonymous sessions (`!uid`, `"guest"`, `"GUEST"`, `"GUEST_ANON"`, `uid.startsWith("GUEST_")`). In `useFriendPresence.ts`, enabled `GUEST_XXXX` IDs to write `{ id: currentId, status: "online", lastActive: serverTimestamp() }` to `/users/{currentId}` and mark previous guest IDs offline upon Google login migration. In `src/App.tsx`, `effectivePresenceId` passes guest IDs to `useFriendPresence` directly without waiting for Google hydration lock, restoring green presence dots on guest avatars.
3. **Full ISO Timestamps for Match History:** Replaced `new Date().toLocaleDateString()` with `new Date().toISOString()` in `submitGameResult` (`App.tsx`), `registerChallengeJoin` (`App.tsx`), and offline queue synchronization. Fixed the "8 hours ago" bug where date-only strings defaulted to local midnight (00:00:00).
4. **Embedded Host & Sender Identity:** Directly embedded `hostId`, `hostName`, `createdById`, and `createdByName` in room payloads (`openCreateRoomModal`, `handleSoloChallengeFriends`, `openMidGameInviteModal`, `onSameGameReplay`), and `fromName`, `senderName`, `hostName`, `hostId` in `/invites` payloads (`handleInviteFriend`), eliminating reliance on external `/users/{guestId}` profile lookups for guest invitations.
5. **Dynamic Difficulty Mapping & RACE Title Sync:** In `handleInviteFriend` (`src/App.tsx`), dynamically resolved `currentDifficulty` via `overrideDifficulty || (showCreateChallengeModal ? challengeDifficulty : ((boardState as any)?.difficulty || challengeDifficulty || difficulty || "EASY"))` and explicitly wrote `difficulty: currentDifficulty` to `/rooms` and `/invites`. In `CreateChallengeModal.tsx`, passed `challengeDifficulty` directly to `handleInviteFriend(player.id, challengeDifficulty)`. Updated `IncomingInviteModal.tsx`, Bell drawer cards, and Toast banner to dynamically render the active difficulty title (`${diff} RACE`) matched to pastel theme tokens.

### ⚠️ Remaining Active Bug Hotspots (For Forensic Review)
1. **Same-Account Multi-Device Collision:**
   * **Root Cause:** When testing on Laptop and Phone logged into the same Google account (`uid`), self-exclusion filters hide the other device.