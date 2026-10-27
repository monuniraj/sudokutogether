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
| `src/components/game/SudokuBoard.tsx` | Renders the 9x9 interactive Sudoku grid, cell highlights, notes, crosshairs, and Audio-Visual Juice (diagonal reveal cascade, line sweep, box bloom, combo ripple, victory shimmer and spring checkmark badge). | `⬅️ Receives props from:` `src/App.tsx` (`boardState`, theme tokens, cell tap handlers, `gameSessionKey`, `completionPulse`, `isVictory`). |
| `src/components/game/SudokuKeypad.tsx` | Renders 1-9 input buttons, Undo, Erase, Pencil Notes, Smart Hint, Fast-Fill toggles, and number exhaustion spring pop + color flare. | `⬅️ Receives props from:` `src/App.tsx` (`lockedNum`, `activeKeypadNum`, `pencilMode`, `hintInventory`, `exhaustedNum`). |
| `src/components/modals/CreateChallengeModal.tsx` | Multiplayer room setup, difficulty/mistake/hint/timer selectors, PIN lock, and friend invite list. | `⬅️ Receives:` `multiplayerPlayers`, room settings, `handleInviteFriend` from `src/App.tsx`.<br>`➡️ Calls:` `useFriendPresence(undefined, playerIds)` (line 115). |
| `src/components/modals/GameOverModal.tsx` | Solo & Multiplayer end-game results, 4-beat PB odometer celebration, live podium standings, and Step-2 Rematch Lobby. | `⬅️ Receives:` `syncedLeaderboard`, `pbStage`, `rollingBestTime`, `endGameStep` from `src/App.tsx`. |
| `src/components/modals/*` | `RulesModal`, `SettingsModal`, `StatsModal`, `JoinRoomModal`, `MultiplayerForkModal`, `IncomingInviteModal`. | Controlled by modal boolean states in `src/App.tsx`. |
| `src/utils/soundEffects.ts`, `haptics.ts`, `themeFeedback.ts`, `formatTimestamp.ts` | Zero-asset Web Audio API synthesizers (party popper, kalimba reveal, marimba line, Rhodes box, Major 7th combo, bubble pop, win fanfare), native/web haptics, theme feedback, and timestamp formatters. | `⬅️ Imported by:` `src/App.tsx` and modal components. |

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
| **6235 – 6340** | Incoming Invites Listener #1 | Firestore `onSnapshot` on `/invites` (`toUserId == activeId`). Resolves `activeId` to `authUser.uid` for authenticated Google users and `userProfile.id` (`"GUEST_XXXX"`) for guest/anonymous sessions to match presence & lobby invites. Automatically normalizes difficulty via `normalizeDifficulty`, upserts pending invites to Bell on app load, cleans up invites on accept/decline. |
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
6. **UI Polish (Offline Red Indicator, Localized Google Sync Tagline & Join Glow Removal):**
   * **Mode-Adaptive Offline Indicator:** Updated the offline warning icon in `SettingsModal.tsx` near the profile header to use mode-adaptive crimson/soft warning red (`text-red-600` in light mode, `text-red-400` in dark mode) with `animate-pulse`, matching system warning counters.
   * **Localized Sync Tagline:** Added `syncDevicesSaveProgress` to `translations.ts` across all 9 supported languages (`en`, `hi`, `de`, `ja`, `ko`, `es`, `fr`, `it`, `pt-BR`) and rendered the crisp dot-separated tagline (`Sync devices • Save progress`) in clean secondary typography directly below the "Connect Google" button in `SettingsModal.tsx`.
   * **Join Button Glow Removal:** In `JoinRoomModal.tsx`, cleanly removed the outer blue glow shadow (`shadow-[0_0_12px_rgba(14,165,233,0.35)]` and `shadow-md` on the Join button) while strictly preserving the double-line border/ring structure (`border-2 border-sky-500 ring-2 ring-sky-500/40`) and soft pastel styling.
7. **Audio-Visual Juice & Satisfaction Suite (Apple-Grade Feedback Engine):**
   * **Staggered Board Reveal Wave:** On new board mount / game start (`generateAndSetNewPuzzle`, `handleStartNewGame`), reveals all 81 cells in an arpeggiated diagonal cascade ($d = r + c$) with hardware-accelerated CSS GPU scale/opacity transform (`scale 0.85 -> 1.0` over 250ms). Paired with soft ascending kalimba/crystal pentatonic chime in `soundEffects.ts` (`playKalimbaRevealSound`).
   * **Row & Column Completion (Pastel Shimmer Sweep):** When placing a number completes the 9th cell of a row or column, triggers a directional pastel light beam sweep across the line (`sudokuLineSweep`) with subtle number bounce (`scale 1.0 -> 1.05 -> 1.0`). Paired with a crisp wooden acoustic marimba tone (`playMarimbaLineSound`).
   * **3x3 Box Completion (Pastel Bloom):** When a 3x3 block is finished, triggers a 300ms 20% opacity pastel bloom across the 9 cells (`sudokuBoxBloom`) and smooth box border pulse. Paired with a warm Rhodes electric piano chord (`playRhodesBoxSound`).
   * **Simultaneous Combo (Radial Ripple):** When placing a number completes multiple lines or a line and box simultaneously, radiates a circular ripple outward from the placed cell coordinate. Paired with a lush harmonic Major 7th chord (`playMajor7thComboSound`).
   * **Number Pad Exhaustion (Pop & Color Flare):** When all 9 instances of a digit are placed, the corresponding keypad button does a spring pop (`scale 1.0 -> 1.24 -> 1.0`), flashes an active-theme color bloom flare (`keypadFlare`), and smoothly settles into its dimmed state. Paired with a soft crystal bubble pop sound (`playBubblePopSound`).
   * **Final Game Victory (Theme Shimmer & Spring Badge):** Staggered victory wave across all 81 cells harmonized with active difficulty pastel theme tokens (`sudokuVictoryWave`), accompanied by a minimalist spring checkmark badge at the center of the board.
   * **Settings & Pipeline Isolation:** Strictly local presentation layer. Guarded by user `soundEffects` preferences. Zero mutations to `/rooms` Firestore payloads or multiplayer synchronization.
8. **Universal Offline Warning, Victory Grace Timing, Audio Priority Override & Keypad Polish:**
   * **Universal Offline Warning Icon:** In `SettingsModal.tsx`, decoupled the pulsing `WifiOff` warning icon from `userProfile?.isSynced`, ensuring it renders universally whenever `!isOnline` in both Guest mode and Google authenticated mode with mode-adaptive crimson/soft red tokens (`text-red-600` / `text-red-400`).
   * **0ms Timer Stoppage & 1000ms Victory Grace Window:** In `App.tsx`, verified that the session timer interval is cleared at $T=0\text{ms}$ upon terminal win state assignment (`boardState.isGameOver = true`), locking in the exact winning time. Wrapped `setShowGameOverModal(true)` in a 1000ms timeout on victory (`delayMs = isVictory ? 1000 : 0`) so the whole-grid victory shimmer wave, center spring checkmark badge, and acoustic resolve chord play out completely before the end-game modal opens.
   * **Audio Priority Override (Zero Audio Collision):** In `SudokuKeypad.tsx`, suppressed the unconditional `playClickSound()` when a cell is actively targeted for input (`hasSelectedEmptyCell`), delegating audio resolution entirely to `handleValueInput`. In `handleValueInput` (`App.tsx`), placed victory and line/box completion chimes in strict priority: when placing the final digit of a line, box, number, or the 81st victory cell, the standard tap click sound is strictly suppressed/muted, preventing audio collisions.
   * **Keypad Exhaustion Refinement:** Replaced aggressive neon flash and scale flares (`keypadFlare` and `sudokuKeypadPop`) with a soft, subtle micro-elevation (`sudokuKeypadMicroElevation`: `scale 1.06`, `translateY(-2px)`) rendered in the button's natural pastel palette, which smoothly settles into its dimmed state (`opacity-40`).
9. **Complete Zen Juice Suite & Fluid Modal Entrance:**
   * **Inward Starting Board Cascade (~700ms):** In `SudokuBoard.tsx`, replaced diagonal pops with a gentle inward cascade initiating from perimeter edges and resolving inward toward center (4, 4) (`Math.max(0, Math.round((5.65 - Math.hypot(r - 4, c - 4)) * 45ms))`) via `@keyframes sudokuCellRevealInward` (`scale 0.92 -> 1.0` over 420ms with `cubic-bezier(0.16, 1, 0.3, 1)`).
   * **Silenced Synthetic Chirps (Crisp Tap Click Maintained):** In `App.tsx`, removed harsh line/box synthetic chirps (`playMarimbaLineSound`, `playRhodesBoxSound`, `playMajor7thComboSound`), maintaining the player's crisp, solid tap click (`playClickSound()`) while retaining physical tile-lift ripples.
   * **Residual Cleanup & Snap-Back Elimination:** In `SudokuBoard.tsx`, gated tile-lift animations strictly on populated cells (`cell.value !== 0 && cell.value !== null`), and added `transition: transform 0.25s ease-out, background-color 0.25s ease-out` on all cell styles for smooth, flicker-free resting settling.
   * **Concentric Outward Victory Ripple & 1450ms Zen Dissolve:** In `SudokuBoard.tsx`, anchored the grand victory wave at board center (4, 4) radiating outward across all 81 tiles (`Math.round(Math.hypot(r - 4, c - 4) * 40ms)`), paired with a 3-phase auto-dissolving victory badge over 1450ms (0-450ms spring entrance $\rightarrow$ 450-1100ms serene hold $\rightarrow$ 1100-1450ms dissolve into clear air) inside a borderless frosted circle with `backdrop-blur-md` and soft shadow.
   * **1500ms Victory Grace Window & Fluid Modal Entrance:** In `App.tsx`, extended the victory grace delay before `setShowGameOverModal(true)` to a strict 1500ms. In `GameOverModal.tsx`, replaced the abrupt snap with a fluid `motion.div` backdrop fade-in (350ms) and card glide-up (`translateY(16px) scale(0.96) -> translateY(0) scale(1.0)` over 400ms with `cubic-bezier(0.16, 1, 0.3, 1)`), ensuring the solved board behind the frosted backdrop remains 100% clean, pristine, and unobstructed.
10. **Master Physical Tile Engine & Harmonic Acoustic Suite (60FPS Zen Master Timings, In-Game Triggers & 3D Confetti Cascade):**
    * **Zero-Flicker Keyframes & Dark Rim Sheen:** Stripped all `background-color` properties from `@keyframes sudokuTileLiftLight` and `@keyframes sudokuTileLiftDark`. Keyframes animate purely `transform` and `box-shadow`:
      * Light Mode: 40% peak at `translateY(-3.5px) scale(1.025)` with soft ambient drop-shadow (`box-shadow: 0 10px 20px -3px rgba(0,0,0,0.16), 0 4px 6px -2px rgba(0,0,0,0.06)`).
      * Dark Mode: 40% peak at `translateY(-3.5px) scale(1.025)` with deep ambient occlusion shadow (`0 10px 22px -4px rgba(0, 0, 0, 0.85)`), frosted rim highlight (`0 0 0 1px rgba(255, 255, 255, 0.07)`), and inner specular rim (`inset 0 1px 0 rgba(255, 255, 255, 0.12)`).
      * Active React highlights (selections, crosshairs, identical digits) remain 100% visible throughout tile elevation without color flashes.
    * **Reverse Victory Starting Reveal & Session-Stable Gate (`isRevealing`):** Completely removed `@keyframes sudokuCellRevealInward` and all opacity/scale fades. The starting reveal clones the exact victory ripple keyframes (`sudokuTileLiftDark` / `sudokuTileLiftLight` over 600ms) running in reverse from perimeter corners ($T=0\text{ms}$) inward to center (4, 4) (`delay = Math.max(0, Math.round((5.65 - Math.hypot(r - 4, c - 4)) * 95ms))`).
      * In `SudokuBoard.tsx`, guarded reveal under `isRevealing` state (1250ms session gate keyed to `gameSessionKey`). Once settled, cells revert cleanly to `animation: undefined` at rest, completely eliminating `SettingsModal` opening/closing from re-triggering the wave.
    * **Restored In-Game Completion Waves (Row, Col, Box, Combo & Grand Victory):**
      * Single Row/Col: Outward tactile ripple radiating from tapped epicenter `(r, c)` (`Math.abs(dist) * 45ms` with 500ms lift).
      * 3x3 Box: Radial bloom from tapped epicenter `(r, c)` (`Math.hypot(Δr, Δc) * 48ms` with 500ms lift).
      * Multi-Combo (Line + Box): Synchronous dual-component lift radiating from tapped epicenter `(r, c)` (`Math.hypot(Δr, Δc) * 45ms` with 500ms lift).
      * 81st digit completion: Concentric outward victory wave radiating from board center (4, 4) (`Math.round(Math.hypot(r - 4, c - 4) * 110ms)` with 600ms lift).
      * Single-Pass Guarantee: `transition: isPulseActive ? "none" : "background-color 0.2s ease-out"`, eliminating competing transitions and reverse snaps.
      * Extended `completionPulse` JS cleanup timeout in `App.tsx` and gate check in `SudokuBoard.tsx` to **1150ms**, ensuring peripheral tiles fully return to resting state before class unmounting.
    * **Concentric Outward Victory Wave (~1250ms) & 1900ms 3-Phase Checkmark:**
      * 3-Phase Frosted Checkmark: 0-500ms center spring pop $\rightarrow$ 500-1500ms serene hold $\rightarrow$ 1500-1900ms auto-dissolve into clear air (`opacity: 1 -> 0, scale: 1.0 -> 1.04`).
    * **Refined 3D Multi-Layer Confetti Rain Engine (`ConfettiBurst.tsx`):**
      * Delicate particle dimensions across 3 Spatial Depth Layers: Foreground (6-8px ribbons/squares, scale 1.15, alpha 0.95), Midground (4-6px, scale 0.90, alpha 0.88 hovering over board), and Background (2.5-3.5px micro-particles, scale 0.60, alpha 0.60).
      * Linear paper gravity ($v_y += 0.14$), gentle terminal speed (3.2 for streamers), air drag ($0.988$), and continuous sinusoidal lateral sway (`Math.sin(p.swayAngle) * p.swayMagnitude`), removing abrupt steps.
      * Sustained 2.5s "Rimjhim" Cascade: Steady continuous celebratory rain emitted over the first 2.5 seconds ($T=0$ to $T=2500\text{ms}$), drifting across the board and settling gracefully as the `GameOverModal` card glides up at 2200ms.
    * **2200ms Modal Grace Window & Fluid Entrance:**
      * Extended `delayMs` in `App.tsx` to strict **2200ms**, leaving a pristine 300ms pause after checkmark dissolution where the completed board sits unobstructed.
      * `GameOverModal.tsx` entrance transitions: 400ms backdrop blur fade-in and 450ms card slide-up (`translateY(20px) scale(0.96) -> translateY(0) scale(1.0)` with `cubic-bezier(0.16, 1, 0.3, 1)`).
    * **Harmonic Acoustic Resonance (Zero Synth Chirps):** In `soundEffects.ts`, implemented `playWoodenResonanceSound(audioCtx, isEnabled)` (349Hz $\rightarrow$ 293Hz low-pass filtered triangle wave with 600Hz cutoff). Updated `playKalimbaRevealSound` with ascending pentatonic kalimba tones in the warm 300-650Hz spectrum (`[329.63, 392.00, 440.00, 523.25, 659.25]`) filtered through a 750Hz low-pass filter. Capped all synthesized frequencies below 1000Hz (silenced mallet ping at 1320Hz). On single completions, wooden body resonance pairs with the player's solid tap click; combos and victory mute tap click in favor of rich acoustic chords.
11. **SUDOKU SYNC / BY MOLOGIC Master Architecture (Splash to End-Game Complete Suite):**
    * **Brand Identity & 2.0s Meditative Splash (`StudioSplash.tsx` & `App.tsx`):**
      * Official Brand Identity: App Name is strictly **"SUDOKU SYNC"**; byline is strictly **"BY MOLOGIC"** (NOT Together, NOT Mologique).
      * Completely suppressed raw technical sync text ("Syncing Profile", "Connecting to cloud vault...", "Data Syncing...").
      * 2.0s Zen Splash Sequence (Non-blocking background data hydration):
        * 0.0s - 0.6s: App Logo + "SUDOKU SYNC" fade in smoothly with subtle scale (`0.97 -> 1.0`).
        * 0.6s - 1.4s: "BY MOLOGIC" reveals smoothly beneath with tracked letter-spacing (`letter-spacing: 0.22em`, muted secondary tone).
        * 1.4s - 1.8s: Stillness state (brand presence remains serene while cloud sync resolves silently in background).
        * 1.8s - 2.1s: Smooth 0.3s cross-dissolve exit revealing the Sudoku grid cleanly.
    * **2-Ring Travelling Wave Packet & Pure GPU Sheen (`SudokuBoard.tsx`):**
      * Completely eradicated heavy `box-shadow` animations and `z-index` manipulation from keyframes.
      * Pure GPU acceleration: `@keyframes sudokuTileLiftLight` and `@keyframes sudokuTileLiftDark` animate strictly `transform: translateY(-3.5px) scale(1.025)` paired with a soft luminance sheen (`filter: brightness(1.12)`).
      * 2-Ring Moving Crest Packet (`chebyshevRing = Math.max(Math.abs(r - 4), Math.abs(c - 4))`): 140ms step ($T = 0, 140, 280, 420, 560\text{ms}$) with 350ms lift duration (`cubic-bezier(0.16, 1, 0.3, 1)`). At any given millisecond, at most 1–2 rings are airborne. Whole-grid cascade locks at ~1050ms.
      * Outside-In Starting Reveal (Ring 4 $\rightarrow$ 0) and Inside-Out Victory Ripple (Ring 0 $\rightarrow$ 4). `isRevealing` session gate locks to strict 1050ms timeout.
    * **1:1 Frame-Accurate Kalimba Audio Synthesis (`soundEffects.ts`):**
      * Discrete 5-note pentatonic synthesis scheduled at exact 140ms intervals in `playKalimbaRevealSound`: E4 (329.63Hz) $\rightarrow$ G4 (392.00Hz) $\rightarrow$ A4 (440.00Hz) $\rightarrow$ C5 (523.25Hz) $\rightarrow$ E5 (659.25Hz) with 570ms acoustic body decay, resolving to absolute silence at exactly 1050ms.
    * **In-Game Boundary Isolation & "Grand Tring" (Holy Grail Combo) (`SudokuBoard.tsx`, `App.tsx`, `soundEffects.ts`):**
      * Strict 9-cell boundary isolation: Single Row, Single Column, and 3x3 Box completions animate strictly their own 9 cells (35ms stagger, zero bleed into neighboring cells/boxes).
      * "Grand Tring" (Holy Grail Combo): Triggered exclusively when a single number placement simultaneously completes both cross-lines (Row + Col) AND the 3x3 Box (`isHolyGrailCombo = rowNowComplete && colNowComplete && boxNowComplete`). Plays `playMajor9thGrandTringSound` (lush Fmaj9 acoustic chord: 349.23Hz, 440.00Hz, 523.25Hz, 659.25Hz, 783.99Hz with 750ms decay).
    * **Dark Mode User-Filled Number Contrast (`SudokuBoard.tsx`):**
      * Initial clues strictly render in crisp off-white (`#F8FAFC`, `font-sans`).
      * User-placed numbers strictly retain vibrant sky blue (`#38BDF8`, handwriting font) across neutral, selected, focused, and identical match states. Player numbers never turn white under selection or match focus.
    * **Ultra-Lightweight Pseudo-3D Confetti & Decoupled 3-Act Victory Sequence (`ConfettiBurst.tsx` & `App.tsx`):**
      * Eradicated heavy 3D matrix math and `ctx.save()`/`ctx.restore()` loop thrashing.
      * Pure 2D canvas draw with Pseudo-3D vertical compression scaling (`drawHeight = p.height * Math.abs(Math.cos(p.tiltAngle))`), capped at a strict maximum of 36 active particles (4px–6px width, 8px–12px height).
      * Decoupled 3-Act Victory Sequence: Act 1 (0ms–1000ms) Inside-Out Chebyshev board wave executes alone at 60fps (0 confetti); Act 2 (1000ms–2400ms) 36-particle cascade drifts across settled board; Act 3 (2200ms+) `GameOverModal` glides upward cleanly.
12. **Audio Priority Mutex, 3-Way Holy Grail Gate, Dynamic Selection-Color Sheen & Background/Modal Auto-Pause Engine (Phase 1 Refinement):**
    * **3-Tier Audio Mutex Hierarchy (`App.tsx` & `soundEffects.ts`):**
      * Completely eliminated audio clashing on user placements:
        * **Priority 1 (Number Exhaustion):** When a move places the 9th instance of a digit (`isNumCompleted`), plays ONLY `playNumberCompletionSound()` + `playBubblePopSound()`. Standard tap click and line completion sounds are strictly suppressed.
        * **Priority 2 (Structure Completion):** When a move completes line(s) / box without exhausting the number (`completionCount > 0 && !isNumCompleted`), plays ONLY completion audio (`playMajor9thGrandTringSound` for Holy Grail, `playWoodenResonanceSound` for standard completions). Standard tap click is strictly suppressed.
        * **Priority 3 (Ordinary Placement):** When no completion occurs, plays ONLY the clean mechanical tap click (`playClickSound()`). Zero audio overlap.
    * **Strict 3-Way Holy Grail Gate & Structure-Isolated Pulse (`SudokuBoard.tsx` & `App.tsx`):**
      * `isHolyGrailCombo = rowNowComplete && colNowComplete && boxNowComplete`: Exclusively gates `playMajor9thGrandTringSound` and the 3-structure composite wave.
      * `CompletionPulse` carries explicit structure flags (`hasRow`, `hasCol`, `hasBox`, `structures`, `holy_grail`).
      * In `SudokuBoard.tsx`, cells only animate if they belong to an actually completed structure (`isRowMatch || isColMatch || isBoxMatch`). Incomplete rows/cols/boxes have 0% elevation, eliminating visual cross-bleed.
      * Single row, single col, single box, and 2-way completions play ONLY `playWoodenResonanceSound(getAudioCtx(), soundEffects)`.
    * **Dynamic Selection-Color Wave Sheen (`SudokuBoard.tsx`):**
      * Embedded `<style>` dynamically samples the active theme's selection color token (`diffTheme.activeCell.light` / `diffTheme.activeCell.dark`).
      * `@keyframes sudokuTileLiftLight` and `@keyframes sudokuTileLiftDark` animate:
        * 0%: Baseline resting state (`translateY(0) scale(1)`).
        * 35%: 2-ring traveling crest (`translateY(-3.0px) scale(1.02)`) at +12% luminance sheen.
        * 55%: Trailing highlight sheen applies `${diffTheme.activeCell}` as the wave passes through.
        * 100%: Clean settlement back to baseline. Settled tiles release the keyframe cleanly, leaving zero persistent box-shadows.
    * **Robust Background & Modal Auto-Pause Engine (`App.tsx`):**
      * **Comprehensive Modal Freezing:** Extended `isPauseModalOpen` to cover all dialogs (`SettingsModal`, `HowToPlayModal`, `MultiplayerForkModal`, `BellInvitesModal`, `MidGameInviteModal`, `CreateChallengeModal`, `GameOverModal`, `AuthModal`, `DisplayNameModal`, `JoinRoomModal`, `RematchInviteModal`, `ResetSettingsModal`, `DeleteAccountModal`, `LoginRequiredModal`, etc.). The session timer interval immediately halts (`!isPauseModalOpen`) and `setIsTimerPaused(true)` renders the pause screen.
      * **Web & Visibility:** Bound `visibilitychange` and window `blur` to `triggerAutoPause()`, pausing the timer and displaying pause state whenever minimized, tab-switched, or screen-locked.
      * **Capacitor Native State:** Bound `CapApp.addListener('appStateChange')` and `CapApp.addListener('pause')` to pause on native Android/iOS backgrounding.
      * **Multiplayer Paradigm Decoupling:** Removed `!challengeMode` restriction from `triggerAutoPause`, ensuring fair individual timer freezing during asynchronous challenges.
13. **Animated Luxury Splash & 3-Act Decoupled Victory Choreography (Phase 2 Refinement):**
    * **2.0s Choreographed Meditative Splash (`StudioSplash.tsx` & `App.tsx`):**
      * Brand identity strictly locked to **"SUDOKU SYNC"** and **"BY MOLOGIC"**. All raw "Data Syncing..." technical jargon eradicated.
      * Synchronized Motion Timeline across cold-boot `<StudioSplash>` and `<motion.div id="sync-loading-wall">`:
        * 0.0s - 0.6s: App Logo and primary title glide smoothly upward (`translateY: 8px -> 0px`) with silky opacity fade-in (`0 -> 1`) and gentle scale (`0.97 -> 1.0`) with `cubic-bezier(0.16, 1, 0.3, 1)`.
        * 0.6s - 1.4s: "BY MOLOGIC" reveals beneath with elegant tracking (`letter-spacing: 0.22em`, `text-slate-400`).
        * 1.4s - 1.8s: Meditative stillness state while background cloud hydration finishes silently.
        * 1.8s - 2.1s: Smooth 300ms cross-dissolve exit (`exit={{ opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } }}`).
    * **Ultra-Lightweight Pseudo-3D Confetti (`ConfettiBurst.tsx`):**
      * Eradicated all `ctx.save()` / `ctx.restore()` canvas context thrashing and heavy 3D matrix math.
      * Single-axis vertical compression scaling: $\text{drawHeight} = p.\text{height} \times |\cos(p.\text{tiltAngle})|$.
      * Backside shading modulation: $\text{globalAlpha} \times 0.80$ when $\cos(p.\text{tiltAngle}) < 0$, creating an authentic tumbling 3D ribbon flip with zero trigonometric matrix overhead.
      * Active particle pool capped at strict maximum of 36 delicate micro-ribbons (4px - 6px width).
    * **Decoupled 3-Act Victory Choreography (`App.tsx`):**
      * Act 1 (0ms - 1000ms): Inside-Out Chebyshev board wave executes alone at 60fps with zero confetti particles mounted.
      * Act 2 (1000ms - 2400ms): Confetti canvas mounts via 1000ms `setTimeout`, and 36 micro-ribbons drift gently across the settled board.
      * Act 3 (2200ms+): `GameOverModal` glides upward cleanly over the frosted backdrop, preventing GPU draw call spikes.

14. **Ink-Wash Number Reveal, Bidirectional Chebyshev Waves, Natural Popper Physics & Modal Reveal Lock:**
    * **Zero Tile Displacement & Ink-Wash Number Reveal (`SudokuBoard.tsx`):**
      * Completely eradicated 3D physical lifts (`translateY`, `scale` bouncing) and persistent box-shadow animations. 0px tile displacement.
      * Initial state: During `isRevealing`, all pre-filled numbers/clues render with `opacity: 0` (board appears completely blank).
      * Inside-Out Reveal Wave (Ring 0 $\rightarrow$ Ring 4): Ring delay = `chebyshevRing * 95ms` (Ring 0 at 0ms, Ring 4 at 380ms).
      * Trailing Color Sheen: Cells bloom into active difficulty highlight (`diffTheme.activeCell`) and dissolve back to resting state by strict 850ms.
      * Ink Number Reveal: Pre-filled numbers smoothly fade in (`opacity: 1`, duration 240ms ease-out via `@keyframes inkDigitFadeIn`), timed exactly to ring delay on the GPU compositor. Zero layout shift.
    * **Outside-In Victory Wave (`SudokuBoard.tsx`):**
      * Bidirectional wave counterpoint: Ring delay = `(4 - chebyshevRing) * 95ms`.
      * Perimeter Ring 4 blooms at $T=0\text{ms} \rightarrow$ cascades inward to Center Ring 0 at $T=380\text{ms}$. Sheen dissolves cleanly, concluding at 850ms without physical tile lifts.
    * **Eradicated Victory Checkmark Badge (`SudokuBoard.tsx`):**
      * Completely removed `@keyframes victoryBadgeZen` and the center floating checkmark badge (`<Check ... />`), leaving the completed board 100% clean and unobstructed.
    * **Settings / Modal Reveal Lock (`SudokuBoard.tsx` & `App.tsx`):**
      * Implemented module-level `revealedSessionKeys = new Set<string | number>()` registry in `SudokuBoard.tsx`.
      * Gated `isRevealing` strictly to fresh session keys generated by "Play New Game" or "Resume" from home screen in `App.tsx`.
      * Exiting Settings, Themes, or any modal dialog preserves `gameSessionKey`, permanently preventing the starting reveal wave from re-triggering.
    * **Natural Party-Popper Confetti Physics (`ConfettiBurst.tsx`):**
      * Particle Geometry: Refined micro-ribbons (7px - 9px width, 12px - 15px height).
      * Realistic Popper Explosion & Air-Drag Physics:
        * Initial blast velocity: $v_x \in [-4.5, 4.5]$, upward pop $v_y \in [-6.5, -3.0]$.
15. **Zero-Flicker Pure Jet Black (#000000) Unification, 3.0s Luxury Splash & Pre-Flight Offline Logout Guard:**
    * **Zero-Flicker Pure Jet Black (#000000) Unification:**
      * Android Native Themes (`android/app/src/main/res/values/styles.xml` and `values-night/styles.xml`): Unified `android:background`, `android:windowBackground`, and `windowSplashScreenBackground` strictly to `#000000`.
      * HTML Root: Unified `html, body { background-color: #000000; }` in `index.html`.
      * Container & Assets: Unified `<StudioSplash />` container and app icon backdrop to pure `#000000`, eliminating brightness stepping on cold boot.
    * **3.0-Second Strict Luxury Splash Sequence (`StudioSplash.tsx` & `App.tsx`):**
      * Strictly locks to 3000ms duration independent of early cloud hydration.
      * Phase 1 (0.0s – 0.8s): App Logo + "SUDOKU SYNC" glide upward (`translateY: 8px -> 0px`, `opacity: 0 -> 1`) with `cubic-bezier(0.16, 1, 0.3, 1)`.
      * Phase 2 (0.8s – 2.0s): "BY MOLOGIC" reveals smoothly with tracked letter-spacing (`letter-spacing: 0.24em`, `text-slate-400`, `duration: 0.6s`) and holds in calm meditative stillness for 1.2s.
      * Phase 3 (2.0s – 3.0s): Full 1.0s smooth cross-dissolve exit (`exit={{ opacity: 0, transition: { duration: 1.0, ease: "easeInOut" } }}`) directly into the home screen dashboard.
    * **Pre-Flight Offline Logout Guard & No-Internet Feedback (`App.tsx`):**
      * Guard in `handleLogout`: checks `if (!navigator.onLine || !isOnline)`.
      * Prevents unhandled promise hangs or UI unresponsiveness, keeping the logout button fully responsive while offline.

16. **Dynamic Theme Review Mode, Light-Mode Palette Reversal, Git-Reverted Confetti & Zero-Drop Audio Lifespan:**
    * **Restored Dynamic-Theme Review Mode & Light-Mode Theme Reversal (`SudokuBoard.tsx` & `App.tsx`):**
      * Solved flat-white post-victory defect: Replaced permanent keyframe animation fill-mode `forwards` with temporary `isVictoryWaveActive` state that unmounts after 850ms, restoring full visual authority to inline `cellBgStyle`.
      * Light Mode Reversal: Resting/neutral board cells strictly render the active difficulty theme tint (`diffTheme.crosshair.light`), while active selected cells and crosshairs render as clean, crisp pure white (`bg-white` / `#ffffff`) cutouts against the tinted board. Identical digits highlight in `diffTheme.identical.light`.
      * Dark Mode: Kept completely untouched (`bg-zinc-900` neutral resting, dynamic theme tints on crosshairs/selection).
      * Read-only review mode: Board mutations (`handleValueInput`, `handleClearCell`, `handleUndo`) remain strictly blocked. In `onCellClick`, tapping selected cell deselects, while clicking any other cell selects and updates crosshairs. In `onNumberSelect` (keypad), `if (boardState?.isGameOver)` is prioritized over `isNumberFirstInputMode`, highlighting matching digits across the board in `diffTheme.identical`.
    * **Git Revert of `ConfettiBurst.tsx`:**
      * Reverted cleanly to production `HEAD` (`5fb7bea`), restoring multi-shape celebratory physics (streamers, rectangles, circles, sparks), dual corner cannons (`spawnCornerCannons`), cascading top shower (`spawnTopCascade`), continuous pool lifecycle, and natural air drag.
    * **Synchronized Two-Stage Victory Timeline (`App.tsx` & `GameOverModal.tsx`):**
      * Stage 1 (0ms - 850ms): Solo Outside-In board victory wave sweeps unhindered to center. Zero crackers mounted; zero popups.
      * Stage 2 (850ms): Synchronized celebration: `ConfettiBurst` mounts and fires at exact $T=850\text{ms}$ (`setTimeout(..., 850)` in `App.tsx`). `GameOverModal` triggers at $T=850\text{ms}$ (`delayMs = isVictory ? 850 : 0`), gliding up smoothly (`initial={{ opacity: 0, y: 24 }}` to `animate={{ opacity: 1, y: 0 }}` over 450ms with `cubic-bezier(0.16, 1, 0.3, 1)` without scale snapping).
    * **Continuous Radial Micro-Staggering & Peak-Saturation Ink Reveal (`SudokuBoard.tsx`):**
      * Staggering math: `const dist = Math.hypot(r - 4, c - 4);` with `cellDelayMs = Math.round(dist * 22)` (Inside-Out) and `victoryDelayMs = Math.round((maxDist - dist) * 22)` (Outside-In).
      * Single-pulse keyframes: 0% transparent $\rightarrow$ 45% `diffTheme.activeCell` $\rightarrow$ 100% transparent over 300ms `cubic-bezier(0.4, 0, 0.2, 1) forwards`.
      * Peak saturation digit emergence: `digitRevealDelay = cellDelayMs + 130` hits exact crest of background saturation, blooming numbers smoothly over 200ms ease-out via `@keyframes inkDigitFadeIn`.
    * **Zero-Drop Audio Lifespan Guarantee & Buffer-Hardened ADSR Envelope (`soundEffects.ts`):**
      * Solved audio crackle and buffer underrun: Routed all notes through a single shared submaster GainNode with soft 12ms exponential ramp-up curves, avoiding linear transient clipping on mobile WebViews.
      * Zero-Drop Audio Lifespan: Extended oscillator stop time to $t + 1.300\text{s}$ with smooth exponential decay curves down to `0.00001`. The 5th note (E5 at 350ms) rings out across a full 950ms natural acoustic tail to complete silence. Submaster disconnect is buffered to 1450ms.
      * Independent native Web Audio lifecycle: Nodes scheduled on `audioCtx` clock cannot be interrupted or cancelled by component re-renders or early unmounts, guaranteeing zero hard cuts or dropped final bits on mobile WebView.

17. **Refined Confetti Physics, Zero-Flash Theme Base & 4-Stage Zen Victory Choreography:**
    * **Viewport-Relative Deceleration & 10% Layer Delta (`ConfettiBurst.tsx`):**
      * Deceleration Zone: Rapidly soaks initial downward drop momentum within the top quarter of the viewport (`y <= height * 0.25`).
      * Terminal Velocity Caps: Circles/sparks (heavy balls) locked to float speed `vy = 2.8px/frame`; paper ribbons/streamers locked to `vy = 2.1px/frame`.
      * Natural Vertical Staging: Heavy balls lead slightly at ~30-35% screen height while ribbons follow at ~20-25%, creating a natural ~10% screen-height delta without bottom plummeting.
      * Background Depth Veil: 32 micro-particles spawned off-screen (-20px to -40px) at constant gentle speed (`vy = 1.4px/frame`, `sway = Math.sin(swayAngle) * 0.8`, `alpha = 0.45 * pAlpha`).
    * **Permanent Theme Base & Expanded Zen Motion (`SudokuBoard.tsx`):**
      * Eradicated White Flash: `@keyframes inkWaveSheenLight` locked to 0% `${diffTheme.crosshair.light}`, 45% `${diffTheme.activeCell.light}`, 100% `${diffTheme.crosshair.light}`, preserving continuous theme tint canvas without raw-white flashing.
      * Expanded Zen Motion Stagger: Micro-stagger expanded to 38ms per radial unit (`Math.hypot(r - 4, c - 4) * 38ms`), sweeping gracefully across ~215ms from perimeter to center.
      * Animation Timing: Wave duration tuned to 480ms with `cubic-bezier(0.25, 1, 0.5, 1) forwards`.
      * Peak Ink Bloom: Clue digits fade in over 220ms ease-out at `digitRevealDelay = cellDelayMs + 210ms`, emerging at maximum background color saturation.
      * Victory Wave Lifetime: Unmount timer synchronized to 700ms.
    * **Acoustic Timbre Retune (`soundEffects.ts`):**
      * Tactile Click: 100% preserved and untouched.
      * Kalimba Reveal: Retuned `playKalimbaRevealSound` with 140ms note spacing across 700ms (0ms, 140ms, 280ms, 420ms, 560ms), warm 700Hz acoustic lowpass cutoff ($Q=1.0$), and unclipped exponential decay to silence at $T=1100\text{ms}$. Submaster cleanly disconnected at 1250ms.
    * **4-Stage Victory Staging Timeline (`App.tsx` & `GameOverModal.tsx`):**
      * Stage 1 (0ms - 700ms): Solo outside-in board victory wave sweeps to center. Zero confetti, zero popups.
      * Stage 2 (700ms - 1500ms): Zen Reverence (800ms quiet pause in full difficulty theme glory).
      * Stage 3 (1500ms): Top viewport confetti cascade bursts (`setTimeout(() => setShowCelebrationConfetti(true), 1500)` in `App.tsx`).
      * Stage 4 (1750ms): Silky modal rise (`delayMs = isVictory ? 1750 : 0` in `App.tsx`) with upward glide (`initial={{ opacity: 0, y: 32 }}` to `animate={{ opacity: 1, y: 0 }}` over 500ms with `cubic-bezier(0.16, 1, 0.3, 1)` in `GameOverModal.tsx`).

18. **Active Selection Contrast, Isolated Sheen Overlay & Unified Acoustic Timbre:**
    * **Active Selected Cell High-Contrast Fix (`SudokuBoard.tsx`):**
      * Light Mode: `isSelected` strictly takes `backgroundColor: diffTheme.activeCell.light` (bold difficulty theme tint anchor).
      * Sibling crosshairs sample `backgroundColor: diffTheme.crosshair.light` (`rgba(..., 0.12)` uniform soft pastel tint).
      * Identical numbers sample `backgroundColor: diffTheme.identical.light`.
      * Resting neutral cells sample `backgroundColor: diffTheme.crosshair.light`.
      * Active selected cell stands out prominently against both identical matches and resting cells.
    * **Independent Sheen Overlay Layer & 450ms Line Wave (`SudokuBoard.tsx`):**
      * Zero Base-Cell Animation: Base cell `<div>` retains only static/smooth `cellBgStyle` (`transition: "background-color 200ms ease-out"`), eradicating style collisions and color multiplication.
      * Isolated Overlay Layer: Rendered as `<div className="absolute inset-0 pointer-events-none rounded-[inherit] z-1" />` running `@keyframes inkWaveSheenLight` / `Dark` (0% transparent $\rightarrow$ 45% `diffTheme.activeCell` at 0.70 opacity $\rightarrow$ 100% transparent).
      * Motion Pacing: 450ms duration with `cubic-bezier(0.25, 1, 0.5, 1) forwards`.
      * Candidate notes and digits assigned `z-2` to sit cleanly above the sheen overlay.
    * **Complete Acoustic Timbre Harmonization (`soundEffects.ts` & `App.tsx`):**
      * `playClickSound`: 100% preserved and untouched (tactile frequency drop 850Hz $\rightarrow$ 120Hz).
      * `playKalimbaRevealSound`: 100% preserved (140ms spaced 700Hz lowpass envelope across 700ms).
      * `playMarimbaLineSound` / `playLineCompleteSound`: Synthesized warm 3-note ascending kalimba/marimba sequence (C4 261.63Hz $\rightarrow$ E4 329.63Hz $\rightarrow$ G4 392.00Hz) with 750Hz lowpass filter ($Q=1.0$) and 350ms soft exponential decay.
      * `playWoodenResonanceSound` / `playBoxCompleteSound` / `playRhodesBoxSound` / `playMajor7thComboSound`: Synthesized rich resonant wooden harmonic chord (F3 174.61Hz, C4 261.63Hz, F4 349.23Hz, A4 440.00Hz) with 700Hz lowpass filter ($Q=1.1$) and 600ms decay.
      * `playMistakeSound` / `playErrorSound`: Replaced 1600Hz sawtooth electronic buzzer with tactile, muted wood-block knock (220Hz $\rightarrow$ 110Hz rapid pitch drop in 45ms, 480Hz lowpass filter with $Q=1.8$, fast 2ms attack, 80ms decay).

19. **Unified Tactile Audio Family, Trophy Layout Stabilization & Backdrop Softening:**
    * **Tiered Acoustic Harmony & Tactile Wooden Family (`soundEffects.ts` & `App.tsx`):**
      * Tactile Click & Kalimba Reveal: Preserved 100% untouched (`playClickSound` & `playKalimbaRevealSound`).
      * Single Line Complete (`playMarimbaLineSound`): 2-note ascending kalimba interval (C4 261.63Hz $\rightarrow$ E4 329.63Hz) with 750Hz lowpass filter ($Q=1.0$) and 250ms soft exponential decay.
      * Double Complete (`playWoodenResonanceSound`): 3-note ascending triad (C4 261.63Hz $\rightarrow$ E4 329.63Hz $\rightarrow$ G4 392.00Hz) with 720Hz lowpass filter ($Q=1.1$) and 380ms warm wooden decay.
      * Triple Complete Grand Tring (`playMajor9thGrandTringSound`): 4-note resonant wooden chord (C4 261.63Hz $\rightarrow$ E4 329.63Hz $\rightarrow$ G4 392.00Hz $\rightarrow$ B4 493.88Hz) with 700Hz lowpass filter ($Q=1.2$) and 600ms warm sustained decay.
      * Number Exhaustion (`playBubblePopSound` / `playWoodenLatchSnapSound`): Replaced synthetic bubble pop with tactile wooden latch snap (Layer A: 180Hz $\rightarrow$ 75Hz thump in 30ms with 420Hz lowpass filter; Layer B: soft C5 523.25Hz microtine tine with 900Hz lowpass filter; 160ms decay). Keypad exhaustion cleaned up to let latch snap shine solo without metallic chime interference.
      * Pencil Notes Mark (`playGraphiteTickSound`): Lightweight 1200Hz sine micro-tap at half volume (0.05 peak gain, 35ms exponential decay), wired to `handleValueInput` in `App.tsx` during `pencilMode` to distinguish rough candidate marks from firm number entry.
      * Confetti Detonation (`playPartyPopperSound`): Muted organic party-popper puff (450Hz lowpass-filtered 120ms noise burst + 110Hz $\rightarrow$ 45Hz sub-puff body over 50ms) replacing high-register celebratory melody.
    * **Trophy Layout Stabilization & Modal Fanfare Refinement (`App.tsx`):**
      * Eradicated Layout Shift: Removed delayed conditional `!soloVictoryClappingComplete` swap from `ClappingHands` to the trophy. The gold trophy container mounts permanently from initial modal glide, scaling smoothly (`0.9` $\rightarrow$ `1.0` over 450ms) with a warm ambient golden pulse (`amber-400/25` blur veil).
      * Replaced Metallic Bell (`playTrophyShimmerSound`): Eradicated piercing 1318Hz–3520Hz sine dings; synchronized modal arrival with a warm 4-note wooden marimba/kalimba chord shimmer (C4 261.63Hz $\rightarrow$ A4 440Hz $\rightarrow$ C5 523.25Hz $\rightarrow$ E5 659.25Hz peak, 800Hz lowpass filter, 450ms smooth acoustic decay).
    * **Targeted GameOverModal Backdrop Softening (`GameOverModal.tsx`):**
      * Backdrop Class: Line 262 softened to `bg-black/40 backdrop-blur-sm`, allowing the completed board and confetti shower to remain visible behind the victory card.
      * Anti-Cheat Guard: Preserved 100% opaque backdrops on `PauseModal` and `SettingsModal` during active gameplay.

20. **Severity-0 TDZ Function Hoisting, 3.0s Jet-Black Splash System & Pre-Flight Offline Logout Guard:**
    * **Severity-0 Production TDZ Runtime Crash Hotfix (`boardState` in `App.tsx`):**
      * Solved production minified bundle crash `ReferenceError: Cannot access 'F' before initialization`.
      * Forensic Sourcemap Pinpointing: Mapped `F` at generated column `119799` directly to `boardState` in `src/App.tsx`.
      * Root Cause: At line 8887, `useEffect` was declared with `[showGameOverModal, mistakeLimitEnabled, boardState, playTrophyShimmerSound]` in its dependency array, referencing `boardState` 167 lines BEFORE its actual declaration `const [boardState, setBoardState] = useState(...)` at line 9054. Because `const` variables are TDZ-protected, evaluating the dependency array during initial component render threw the runtime `ReferenceError`.
      * Permanent Resolution: Relocated the `useEffect` to line 9057 immediately after `boardStateRef.current = boardState;`. Verified zero TDZ violations across all 532 statements in `App.tsx` via custom TypeScript AST analysis.
      * Function Hoisting in `soundEffects.ts`: Converted all synthetic audio implementations to hoisted `export function` declarations and moved aliases to the bottom of the file.
    * **3.0s Pure Jet-Black Splash System (`index.html`, `StudioSplash.tsx`, `App.tsx`):**
      * HTML Root: Enforced inline `style="background-color: #000000;"` on both `<html lang="en">` and `<body>` tags in `index.html` to eliminate native WebView bootstrap frame flicker.
      * Choreographed Timing (`StudioSplash.tsx`): Byline ("BY MOLOGIC") transition delay adjusted to 0.2s with 0.6s duration, completing the brand reveal at $T=0.8\text{s}$, holding for a full 1.2s Zen Reverence Hold ($0.8\text{s} \rightarrow 2.0\text{s}$), and executing a 1.0s silk cross-dissolve exit ($2.0\text{s} \rightarrow 3.0\text{s}$).
      * Sync Loading Wall Alignment (`App.tsx`): Locked `sync-loading-wall` backdrop to pure `#000000` and typography to white/slate, eliminating pastel flashing under the splash cross-dissolve during initial hydration.
    * **Offline Logout Network Guard (`App.tsx`):**
      * Guard in `handleLogout`: Pre-flight connectivity check `if (typeof navigator !== "undefined" && (!navigator.onLine || !isOnline))` strictly aborts before executing Firebase `setDoc` or `signOut(auth)`.
      * Tactile Feedback: Triggers `triggerHapticTap(vibrations)` and displays `showToast(t("noInternetConnection") || "No internet connection", "offline")` with the `WifiOff` badge, keeping the UI responsive while offline.

21. **Joyful Number Exhaustion Micro-Arpeggio, Grand Victory Audio Sync & Living Bouncy Trophy:**
    * **Joyful Number Exhaustion Micro-Arpeggio (`soundEffects.ts`):**
      * Replaced the low-register wooden thump in `playWoodenLatchSnapSound` / `playNumberExhaustionSound` with a crisp 3-note ascending celebratory micro-cascade:
        * Note 1 ($t = 0\text{ms}$): E5 ($659.25\text{Hz}$), peak gain $0.12$, $120\text{ms}$ decay.
        * Note 2 ($t = 40\text{ms}$): G#5 ($830.61\text{Hz}$), peak gain $0.13$, $120\text{ms}$ decay.
        * Note 3 ($t = 80\text{ms}$): B5 ($987.77\text{Hz}$), peak gain $0.15$, $200\text{ms}$ decay.
      * Acoustic Envelope: Pure triangle waves with $3\text{ms}$ mallet attack through a $1200\text{Hz}$ lowpass filter ($Q=1.0$), spanning $\sim 220\text{ms}$ total duration to deliver immediate, tactile feedback when exhausting all 9 digits of a number.
    * **Grand Victory Audio Convergence (`App.tsx`):**
      * Synchronized Timeline at $T=1200\text{ms}$: Aligned celebratory confetti shower, side cannons, and `GameOverModal` glide to execute simultaneously at exact $T=1200\text{ms}$.
      * Eradicated Redundant Sound Triggers: Removed the secondary delayed trigger on modal open (`showGameOverModal` hook), ensuring zero audio stutter or double-plays.
      * Un-muffled Sparkling Fanfare (`playTrophyShimmerSound`): Lifted lowpass filter cutoff to $2800\text{Hz}$ ($Q=0.9$) and transposed fanfare to a brilliant 4-note ascending major cascade: C5 ($523.25\text{Hz}$) $\rightarrow$ E5 ($659.25\text{Hz}$) $\rightarrow$ G5 ($783.99\text{Hz}$) $\rightarrow$ C6 ($1046.50\text{Hz}$) with peak gain $0.16$ and sustained $650\text{ms}$ decay.
      * Scoped `triggerVictoryCelebration` cleanly across all game completion paths (both Solo wins and Multiplayer challenge rankings).
    * **Living Bouncy Trophy Container (`App.tsx`):**
      * Muddy Glow Elimination: Stripped static, muddy `bg-amber-400/25 blur-md` background glow.
      * Spring-Bounce Overshoot Keyframes: Replaced static scaling with a high-energy 5-keyframe spring bounce:
        * `scale: [0, 1.25, 0.92, 1.06, 1.0]`
        * `rotate: [-12, 8, -4, 2, 0]`
        * Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` across $0.65\text{s}$.
      * High-Contrast Golden Capsule: Rendered with a vibrant golden gradient (`from-amber-300 via-amber-400 to-amber-500`), crisp `border-amber-200/90`, high-contrast trophy icon (`text-amber-950 fill-amber-900/10`), and soft ambient shadow `shadow-[0_4px_16px_rgba(245,158,11,0.4)]`.
      * Radiating Micro-Sparkle Stars: 3 celebratory micro-sparkle stars radiate outward at distinct angles on bounce landing ($T+450\text{ms}, T+500\text{ms}, T+550\text{ms}$).

22. **81-Cell GPU Hardware Compositor, Minimalist Trophy & Victory Audio Silence:**
    * **81-Cell GPU Hardware Acceleration (`SudokuBoard.tsx`):**
      * Promoted all 81 cell elements and isolated wave sheen overlays to dedicated GPU compositor layers using `transform: translateZ(0)` and `willChange: "transform, opacity"`.
      * Decoupled radial micro-staggering from JS thread via CSS custom properties (`--reveal-delay: ${overlayDelayMs}ms` and `--digit-delay: ${digitRevealDelay}ms`), ensuring zero main-thread frame drops or audio buffer underruns during initial board reveal and victory waves.
      * Hardware-accelerated CSS keyframes (`inkWaveSheenLight`, `inkWaveSheenDark`, and `inkDigitFadeIn`) now operate strictly on composited opacity and 3D transforms.
    * **Minimalist Trophy & Ambient Sparkle Stars (`App.tsx`):**
      * Clutter Eradication: Stripped heavy gradient background circle and double-bounce animations entirely from behind the trophy.
      * Static Thin-Stroke Trophy: Rendered statically upon modal mount using an elegant thin-stroke SVG icon (`strokeWidth={1.8}`) in crisp metallic amber (`text-amber-500 dark:text-amber-400`).
      * Persistent Subtle Ambient Twinkle: Replaced transient 1-shot burst sparks with 3 delicate ambient micro-stars looping a gentle low-opacity twinkle (`opacity: [0.3, 0.9, 0.3]` over 2.2s with staggered 0.75s delays) for the entire duration the modal remains open.
    * **Audio Deduplication & Clean Victory Silence (`App.tsx`):**
      * Completely silenced secondary delayed audio triggers in `pbCelebrationTimers` on modal open (eliminated delayed `playRecordBreakSound`, `playWhooshSound`, `playVictoryChimeSound`, `playDockingSnapSound`, and duplicate `playApplauseSound`).
      * The single victory fanfare plays once at completion/convergence ($T=1200\text{ms}$) without overlapping or late-arriving modal sound effects.
    * **Board Review State Preservation:**
      * Dismissing the game over modal via the 'X' button or backdrop click cleanly preserves `boardState` (`isGameOver: true`, cell values, and difficulty intact) with cell selection cleared, allowing full unobstructed board review.

23. **Cinematic Victory Wave (Pre-Wave Settling, Radial Wave Wash-Away & 1400ms Convergence):**
    * **Pre-Wave Settling Pause (180ms) (`App.tsx`):**
      * Decoupled immediate wave ignition from final digit placement in `handleValueInput`.
      * Gated `setIsVictoryActive(true)` behind an intentional 180ms timeout (`setTimeout(..., 180)`), allowing the player to cognitively register their 81st digit snapping into place in active focus before any animation commences.
    * **Radial Wave "Wash-Away" Deselection (`SudokuBoard.tsx`):**
      * Tied highlight clearance directly to the 670ms radial victory wave via `isClearingHighlights` state.
      * Mapped radial Chebyshev ring indices ($0 \rightarrow 4$) to a staggered dissolve delay: `--wash-delay: calc(var(--ring-index) * 45ms)`.
      * Cell containers smoothly transition to neutral background (`transition: background-color 280ms ease-out var(--wash-delay), opacity 280ms ease-out var(--wash-delay)`) underneath the advancing wave sheen crest, eliminating jarring highlight cutoffs or flashes.
      * When the 670ms wave exits the grid perimeter, the board is left 100% sharp, pristine, and clean.
    * **Post-Wave Zen Reverence Pause (550ms) & Convergence at T=1400ms (`App.tsx`):**
      * Held the completed board in pure stillness from $T=850\text{ms}$ to $T=1400\text{ms}$ (550ms unhurried pause) with zero modal intrusion or visual noise.
      * Re-synchronized celebration convergence at exact $T=1400\text{ms}$:
        * Modal Entrance: Shifted `gameOverTimeout` to $1400\text{ms}$ (`delayMs = isVictory ? 1400 : 0`).
        * Confetti Ignition: Triggered `setShowCelebrationConfetti(true)` at $T=1400\text{ms}$.
        * Audio Convergence: Fired `playPartyPopperSound()` synchronously at $T=1400\text{ms}$ with confetti burst alongside radiant fanfare (`playTrophyShimmerSound()`).
    * **Trophy & Ambient Sparkles Perimeter Polish (`App.tsx`):**
      * Positioned 3 delicate ambient sparkle stars around the outer perimeter of the minimalist trophy icon (`strokeWidth={1.8}`), looping an infinite smooth twinkle (`opacity: [0.35, 1, 0.35]`, `scale: [0.85, 1.2, 0.85]`, `duration: 1.8s` with staggered $0.6\text{s}$ offsets).

24. **Android Gradle Repair & Standard Capacitor DSL Hierarchy (`android/app/build.gradle`):**
    * **Lexical String Corruption Eradication:**
      * Purged ~31KB unclosed quotation string fragment injected at line 10 (`versionCode 17 ''["""""""""...`).
    * **Standard Capacitor DSL Restructuring:**
      * Cleanly placed `namespace "com.mologic.sudokusync"` strictly within the top level of the `android { ... }` block.
      * Restored clean SDK configurations: `compileSdkVersion rootProject.ext.compileSdkVersion`, `minSdkVersion rootProject.ext.minSdkVersion`, and `targetSdkVersion rootProject.ext.targetSdkVersion`.
      * Cleanly fixed `versionCode 17` and `versionName "1.0.1"`, with standard `aaptOptions` asset ignore patterns and NDK full symbol table generation.
    * **Verification:**
      * Executed clean native synchronization via `npx cap sync android` with Exit Code 0.

25. **Sensory Timeline Calibration (Startup 350ms Pause, Radial Wash-Away, Cracker Audio, Dual Modal Delay & 18px Stars):**
    * **Startup 350ms Pause & Kalimba Synchronization (`SudokuBoard.tsx`, `App.tsx`):**
      * Decoupled initial radial reveal wave from instantaneous mount by initializing `isRevealing` to `false` and delaying wave ignition by 350ms (`setTimeout(..., 350)`).
      * Synchronized `playKalimbaRevealSound` across all puzzle initialization and difficulty switch handlers with the exact same 350ms delay (`setTimeout(() => playKalimbaRevealSound(...), 350)`), ensuring the pristine starting grid is visually settled before wave and sound commence.
    * **Radial Wash-Away & Highlight Dissolve Refinement (`SudokuBoard.tsx`, `App.tsx`):**
      * At 180ms after placing the 81st digit, `isVictoryActive` fires and clears `selectedRow` and `selectedCol` to neutral.
      * Mapped each cell's background highlight clearance to a smooth 250ms CSS transition (`transition: background-color 250ms ease-out var(--wash-delay, 0ms), opacity 250ms ease-out var(--wash-delay, 0ms)`) staggered by Chebyshev ring index (`--wash-delay: calc(var(--ring-index) * 45ms)`).
      * Cell numbers remain 100% visible and intact; only in-game focus and crosshair tints dissolve beneath the advancing wave crest.
      * `isClearingHighlights` resets cleanly after 670ms, leaving the board pristine with full interactive post-game review clickability.
    * **Z-Index Layering Alignment (`ConfettiBurst.tsx`):**
      * Lowered canvas overlay layer from `z-[100050]` to `z-40`, guaranteeing celebration confetti cascades behind modal cards (`z-50`) without obstructing touch interactions or button hit targets.
    * **Master 1400ms Convergence for Solo & Multiplayer (`App.tsx`):**
      * Intercepted all completion paths to fire at a single master 1400ms delay:
        * Synchronously fires `playPartyPopperSound()` with confetti burst.
        * Plays sparkling fanfare `playTrophyShimmerSound()`.
        * Mounts the corresponding modal (`showGameOverModal(true)` for solo card or multiplayer room leaderboard).
    * **Trophy Ambient Stars Geometric Polish (`App.tsx`):**
      * Upgraded ambient stars to 18px clean 4-point SVG geometric stars (`w-[18px] h-[18px] text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]`).
      * Positioned outside the trophy silhouette (Top-Left, Top-Right, Bottom-Right) with continuous infinite twinkle loop: `animate={{ scale: [0.85, 1.25, 0.85], opacity: [0.4, 1, 0.4] }}`.

26. **Zero Initial Number Flash & Permanent Victory Deselection (`SudokuBoard.tsx`, `App.tsx`):**
    * **Zero Number Flash & 150ms Snappy Start (`SudokuBoard.tsx`, `App.tsx`):**
      * Eradicated mount clue flash by binding digit container opacity to `isUnrevealed = Boolean(gameSessionKey && !revealedSessionKeys.has(gameSessionKey))`.
      * Enforced strict `opacity: 0` during the initial 150ms settling window (`T=0ms -> T=150ms`), so the player sees ONLY clean wooden grid lines and empty boxes.
      * At exact $T=150\text{ms}$, `setIsRevealing(true)` triggers and `playKalimbaRevealSound()` fires across all startup and difficulty switch handlers. Digits animate opacity from $0 \rightarrow 1$ once with `inkDigitFadeIn 220ms ease-out var(--digit-delay, 0ms) forwards`.
      * Once the reveal wave finishes at $1000\text{ms}$, `revealedSessionKeys.add(gameSessionKey)` locks `opacity: 1` permanently.
    * **Victory Highlight Clearing & Permanent Deselection (`App.tsx`):**
      * The instant the 81st digit is placed in `handleValueInput`:
        * Immediately cleared active selection: `setActiveKeypadNum(null)`, `setLockedNum(null)`.
        * Set `selectedRow: null, selectedCol: null` directly within `terminalWinState` and persisted to LocalStorage.
        * With no cell selected, focus borders and matching digit highlights are permanently eradicated and cannot pop back.
      * At $T=180\text{ms}$, `setIsVictoryActive(true)` fires to launch the radial victory wave across the pristine, deselected grid.

27. **Inward Victory Wave, 2-Second Highlight Suppression Hold, Confetti Layering & Trophy Minimalist Polish (`SudokuBoard.tsx`, `App.tsx`, `ConfettiBurst.tsx`):**
    * **Inward Wave Mechanics & 150ms Delay (`SudokuBoard.tsx`, `App.tsx`):**
      * At $T=0\text{ms}$ upon placing the 81st digit, `selectedRow` and `selectedCol` are preserved in `terminalWinState` so cell highlights remain visible for the wave to wash them away.
      * Shifted wave launch delay to exact $150\text{ms}$ (`setTimeout(() => setIsVictoryActive(true), 150)`).
      * Reversed victory wave direction to strictly Outside-to-Inside (Inward): `delay = (4 - ringIndex) * 45ms`. Perimeter Ring 4 animates first ($0\text{ms}$), sweeping inward to Center Ring 0 ($180\text{ms}$).
    * **2-Second Highlight Suppression Hold (`SudokuBoard.tsx`, `App.tsx`):**
      * Extended `isClearingHighlights` hold duration to $2000\text{ms}$ (`setTimeout(() => setIsClearingHighlights(false), 2000)`), eliminating the previous $670\text{ms}$ premature timeout.
      * Guaranteed zero highlight snap-back throughout the post-wave pause and modal entrance.
      * At $T=1400\text{ms}$ when the modal mounts, `gameOverTimeout` clears `selectedRow: null, selectedCol: null`, `activeKeypadNum: null`, and `lockedNum: null`. When the 2000ms suppression expires, no active cell selection exists to snap back.
    * **Confetti on Top (`ConfettiBurst.tsx`):**
      * Elevated canvas container to `fixed inset-0 pointer-events-none z-[100]`, allowing celebration confetti to cascade gracefully over the `z-50` modal card while preserving full touch pass-through.
    * **Trophy Ambient Stars Permanently Purged (`App.tsx`):**
      * Completely deleted all 3 star SVG elements and `<motion.div>` twinkle wrappers around lines 14925–14990, leaving a clean, minimalist amber metallic trophy icon (`strokeWidth={1.8}`).

28. **Strict Offline Logout Abort & Idempotent Mutex Lock (`App.tsx`):**
    * **Pre-Flight Offline Execution Abort (`App.tsx:handleLogout`):**
      * Verified `!navigator.onLine || !isOnline` directly at the top of `handleLogout` before any state mutations or async locks.
      * If offline, aborts execution synchronously on line 1: triggers `triggerHapticTap(vibrations)` and displays `showToast(t("noInternetConnection"), "offline")`.
      * Prevents any pending offline Firestore mutations from queuing into IndexedDB and guarantees unauthenticated `permission-denied` replay errors cannot occur upon reconnect.
    * **Idempotent Single-Flight Mutex (`App.tsx:handleLogout`):**
      * Guarded by `if (isLoggingOutRef.current) return;` at entry.
      * Drops any duplicate taps or queued microtasks while logout is already executing.

29. **Multiplayer Mistake Limit Enforcement Decoupling (`App.tsx:handleValueInput`):**
    * Decoupled match termination (`isOver`) from the player's personal local `mistakeLimitEnabled` state during multiplayer.
    * Evaluates `isMistakeEnforced = challengeMode ? (boardState.maxMistakesLimit < 999) : mistakeLimitEnabled`.
    * If `challengeMode` is active and the room has a finite mistake limit (e.g., 3 mistakes), mistake game over triggers strictly according to the authoritative room rule, completely immunizing the match against the guest's local settings.
    * Solo play remains 100% governed by the player's personal `mistakeLimitEnabled` toggle.

### ⚠️ Remaining Active Bug Hotspots (For Forensic Review)
1. **Same-Account Multi-Device Collision:**
   * **Root Cause:** When testing on Laptop and Phone logged into the same Google account (`uid`), self-exclusion filters hide the other device.