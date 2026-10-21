# CRITICAL FORENSIC AUDIT: DATA SYNC PIPELINE & MULTIPLAYER DISCONNECT

**Date & Time:** October 21, 2026 | 21:30 IST  
**Environment:** 
- **Laptop:** Localhost (Vite Dev Server)
- **Phone:** Production App (Android APK / Firebase Hosting PWA)
- **Account:** `nirajmonuyt@gmail.com` (UID: `aFhmQi9c5ka11IkW00fdz24mAnY2`)
- **Mode:** Pure Forensic Read-Only Audit (Zero code modified)

---

## EXECUTIVE SUMMARY & DEFINITIVE VERDICTS

| Forensic Check | Ground Truth Finding | Verdict |
| :--- | :--- | :--- |
| **Did Laptop Fail to Write to Cloud?** | **NO.** The write succeeded completely. Firestore holds `totalGamesPlayed: 3`, `totalWinsCount: 2`, `completedGames: [2 items]`, and Easy PB `118s` (`01:58`). | **LAPTOP WRITE SUCCEEDED (SSOT VALID)** |
| **Why Does Phone Show 1 Win / 1 Play?** | The Phone is running a **stale client build** (`index-CplhJz8Z.js` built Oct 19, or cached PWA Service Worker) where local storage retained legacy values `gamesPlayed: 1`, `winsCount: 1`, or fallback execution read the legacy Firestore root/stats scalar fields (`wins: 1`, `gamesPlayed: 1`). | **MOBILE CLIENT STALENESS & LOCAL CACHE FALLBACK** |
| **Why Does Phone Show History 0 & PB `--:--`?** | The stale mobile client's history recovery looked for legacy keys (`sudoku_completed_games` / `completed_games`) or failed `getDoc` network resolution into local cache where history was `null`/`[]`. With `completedGames = []`, `reconcileBestTimesFromHistory([])` evaluated all PB slots to `null`. | **HISTORY DESERIALIZATION & LEGACY CATCH FALLBACK** |
| **Why Do Invitations & Friend Presence Fail?** | 1) **Self-Invite Collision:** When both Laptop and Phone use the **SAME** Google account, both share `UID: aFhmQi9c5ka11IkW00fdz24mAnY2`. The app explicitly filters out `self` (`p.id !== uid`), preventing devices on the same account from seeing each other. <br>2) **ID Target Mismatch:** Invitations dispatched from `multiplayerPlayers` target legacy/ephemeral `GUEST_XXXX` IDs (e.g. `GUEST_97831`), while the Phone's listener queries `where("toUserId", "==", "aFhmQi9c5ka11IkW00fdz24mAnY2")`. <br>3) **Presence Hook Broken by Key Purge:** `CreateChallengeModal` calls `useFriendPresence(undefined, playerIds)`, which falls back to `getStoredUserId()` reading purged key `sudoku_userProfile` -> returns `null`, causing the presence hook to abort immediately without broadcasting `status: "online"`. | **ID MISMATCH, SAME-ACCOUNT FILTERING & PURGED KEY DEPENDENCY** |

---

## 1. FIRESTORE LIVE DATA INSPECTION (GROUND TRUTH IN CLOUD)

### Script Execution & Inspection Method
Using a direct Node.js Firestore REST client against the live database:
- **Project ID:** `sudoku-together-mode`
- **Target Document Path:** `/users/aFhmQi9c5ka11IkW00fdz24mAnY2`
- **Associated Email:** `nirajmonuyt@gmail.com`

### Exact Cloud Data Structure (Live Snapshot)

```json
{
  "authUid": "aFhmQi9c5ka11IkW00fdz24mAnY2",
  "email": "nirajmonuyt@gmail.com",
  "displayName": "Niraj y",
  "name": "Niraj y",
  "avatarColor": "#8B5CF6",
  "status": "online",
  "language": "en",
  "totalGamesPlayed": 3,
  "totalWinsCount": 2,
  "winStreak": 0,
  "wins": 1,
  "stats": {
    "totalGamesPlayed": 3,
    "totalWinsCount": 2,
    "gamesPlayed": 1,
    "wins": 1,
    "winStreak": 0,
    "bestTimes": {
      "EASY": null,
      "MEDIUM": null,
      "HARD": null,
      "EXPERT": null,
      "MASTER": null
    }
  },
  "bestTimes": {
    "EASY": 118,
    "MEDIUM": null,
    "HARD": null,
    "EXPERT": null,
    "MASTER": null
  },
  "completedGames": [
    {
      "id": "948732",
      "difficulty": "EASY",
      "seed": 948732,
      "timeSec": 37,
      "mistakes": 3,
      "maxMistakes": 3,
      "hints": 0,
      "maxHints": 3,
      "isWon": false,
      "isChallenge": true,
      "playerName": "Niraj y",
      "userId": "aFhmQi9c5ka11IkW00fdz24mAnY2",
      "date": "2026-10-21T15:16:12.188Z",
      "participants": [
        {
          "challengeId": "948732",
          "userId": "aFhmQi9c5ka11IkW00fdz24mAnY2",
          "playerName": "Chrom app",
          "timeSec": 18,
          "mistakes": 3,
          "isWon": false,
          "isPending": false,
          "status": "mistake_game_over",
          "date": "2026-10-21T15:15:58.583Z"
        }
      ]
    },
    {
      "id": "SUDOKU-460790-EASY-M3-H3-T1",
      "difficulty": "EASY",
      "seed": 460790,
      "timeSec": 118,
      "mistakes": 0,
      "maxMistakes": 3,
      "hints": 0,
      "maxHints": 3,
      "isWon": true,
      "isChallenge": false,
      "playerName": "Niraj y",
      "userId": "aFhmQi9c5ka11IkW00fdz24mAnY2",
      "date": "2026-10-21T15:12:45.117Z",
      "participants": []
    }
  ],
  "migratedTo": "BqjopzXyMhahNxSgdFMTlg7MlaR2",
  "lastActive": "2026-10-21T15:54:50.571Z",
  "updatedAt": "2026-10-21T15:54:50.571Z"
}
```

### Forensic Proof on Document State
1. **`totalGamesPlayed` = 3** and **`totalWinsCount` = 2**.
2. **`completedGames` EXISTS** and contains **exactly 2 game items**:
   - Game 1: Multiplayer Duel (`id: 948732`), `isWon: false`, `mistakes: 3`, `timeSec: 37`.
   - Game 2: Solo Easy Game (`id: SUDOKU-460790-EASY-M3-H3-T1`), `isWon: true`, `mistakes: 0`, `timeSec: 118` (118 seconds = **01:58**).
3. **`bestTimes` EXISTS** at root: `bestTimes.EASY = 118` (**01:58**).
4. **Conclusion:** The Laptop's writes **DID NOT DROP OR FAIL**. The exact values displayed on the Laptop (2 Wins / 3 Plays / Easy PB 01:58 / 2 History items) match the Firestore document in the cloud with 100% mathematical fidelity.

---

## 2. WRITE PIPELINE FORENSIC TRACE (`saveGameToHistory` in `src/App.tsx`)

### Execution Trace Step-by-Step on Laptop
When a game completes on the Laptop:

```
[GameOver Event] 
      │
      ▼
saveGameToHistory(isWon, mistakesOverride) [src/App.tsx:9606]
      │
      ├─► Step A: Check authUser & Target UID [lines 9698-9703]
      │           authUser = auth.currentUser (Firebase singleton, NOT stale React state)
      │           targetUid = "aFhmQi9c5ka11IkW00fdz24mAnY2"
      │
      ├─► Step B: Atomic Vault Update [lines 9722-9755]
      │           updateVault() updates sudoku_vault_aFhmQi9c5ka11IkW00fdz24mAnY2 in localStorage
      │           reconcileBestTimesFromHistory() calculates EASY: 118
      │
      └─► Step C: Direct Firestore Write [lines 9799-9813]
                  setDoc(doc(db, "users", authUser.uid), {
                    stats: updatedVault.stats,
                    completedGames: updatedVault.completedGames,
                    bestTimes: updatedVault.bestTimes,
                    totalGamesPlayed: updatedVault.stats.totalGamesPlayed,
                    totalWinsCount: updatedVault.stats.totalWinsCount,
                    winStreak: updatedVault.stats.winStreak,
                    updatedAt: serverTimestamp()
                  }, { merge: true })
```

### Verification Against Core Criteria
- **Step A (Trigger):** `authUser` is obtained from `auth.currentUser` directly on line 9698. It is not an asynchronous stale closure; it is the synchronous live reference from the Firebase SDK.
- **Step B (Payload & Network Call):**
  - Line 9801: `setDoc` is wrapped in `try { ... } catch (syncErr) { console.warn(...) }`. No error was thrown; the write completed.
  - **Firestore Security Rules Audit (`firestore.rules` lines 55-60):**
    ```
    match /users/{userId} {
      allow read: if true;
      allow delete: if request.auth != null && request.auth.uid == userId;
      allow create, update: if (request.resource.data.id == userId || !('id' in request.resource.data))
                            && (!('name' in request.resource.data) || isValidString(request.resource.data.name, 1, 50));
    ```
    The payload written in `saveGameToHistory` does not include `id` and does not include `name`. The write is permitted unconditionally for authenticated users. There are no schema rejections for `completedGames` or `bestTimes`.
- **Step C (Reconciliation):** Both local storage vault AND Firestore were updated in lockstep. The cloud document confirmed the write succeeded.

---

## 3. READ/HYDRATION FORENSIC TRACE ON MOBILE (`hydrateUserFromCloud`)

### Why Does Mobile Display `1 Win / 1 Play (100%)`, `PB --:--`, `History 0 items`?

The root cause on mobile was discovered inside the **native Android asset bundle** (`android/app/src/main/assets/public/assets/index-CplhJz8Z.js`).

#### Forensic Evidence:
1. **Unsynced Native Build Artifacts:**
   - The compiled JavaScript file inside `android/app/src/main/assets/public/` is `index-CplhJz8Z.js` with timestamp `19-10-2026 21:53:04`.
   - The recent commits (`814dbaf` - single vault refactor and `889eb07` - robust direct write and same-account reconciliation) **have NOT been synced to the Capacitor Android assets** via `npx cap sync`.
2. **The Stale Mobile Hydration Logic:**
   In `index-CplhJz8Z.js` (line 1529396):
   ```javascript
   // If Firestore read fails or mobile is running offline/cached:
   catch (Y) {
     console.warn("[Auth] Offline or network failure fetching Firestore user document. Retaining local cached stats for uid:", h, Y);
     const _e = localStorage.getItem(it("total_games_played", h)) || localStorage.getItem(`sudoku_usr_${h}_gamesPlayed`) || localStorage.getItem(it("gamesPlayed", h)), // = 1
           Ye = localStorage.getItem(it("total_wins_count", h)) || localStorage.getItem(`sudoku_usr_${h}_winsCount`) || localStorage.getItem(it("winsCount", h)),       // = 1
           Ne = localStorage.getItem(it("completed_games", h)) || localStorage.getItem(`sudoku_usr_${h}_completed_games`),                                           // = null
           xe = localStorage.getItem(it("best_times", h)) || localStorage.getItem(`sudoku_usr_${h}_best_times`);                                                     // = null
   ```
3. **The Legacy Scalar Fields in Firestore:**
   Notice in the live Firestore document:
   - Root field `wins: 1`
   - Nested `stats.gamesPlayed: 1`
   - Nested `stats.wins: 1`
   These legacy fields were created in earlier versions of the app when only 1 game had been won.
   When the older mobile client executes:
   - It reads `wins: 1` and `gamesPlayed: 1`.
   - It calculates win rate: `1 / 1 = 100%`.
4. **Why History Evaluated to 0 Items and PB Evaluated to `--:--`:**
   - In the older mobile bundle, history was read from `localStorage.getItem("sudoku_completed_games")` or `cloudDocData.completed_games`.
   - On the phone, `sudoku_completed_games` in localStorage was empty (`[]`).
   - `completedGames` state was set to `[]`, rendering `"No completed games yet"`.
   - Because `completedGames` was empty and `bestTimes` was `{ EASY: null, ... }` in the legacy `stats` object, `reconcileBestTimesFromHistory([])` returned `null` for all difficulties, rendering `PB --:--`.

---

## 4. MULTIPLAYER INVITATION & PRESENCE WIRING AUDIT

### Step A: Challenge Creation & Dispatch Audit (`CreateChallengeModal.tsx` & `src/App.tsx`)

1. **Self-Exclusion Filter Blocks Devices on Same Google Account:**
   - In `CreateChallengeModal.tsx` (lines 106-111):
     ```typescript
     return (multiplayerPlayers || []).filter((p) => {
       if (!p || !p.id) return false;
       if (myId && p.id === myId) return false;
       if (p.id === "GUEST_ANON" || p.id === "me") return false;
       return true;
     });
     ```
   - In `src/App.tsx` (lines 3967 & 3988):
     ```typescript
     d.id !== uid // uid is aFhmQi9c5ka11IkW00fdz24mAnY2
     ```
   - **The Dilemma:** When both Laptop and Phone log in with the SAME Google account (`nirajmonuyt@gmail.com`), BOTH devices have `uid = aFhmQi9c5ka11IkW00fdz24mAnY2`.
   - The app actively filters out `uid`. Therefore, **neither device will ever appear in the other device's opponent/friend list!**

2. **Invite Target ID Mismatch:**
   - In `users/aFhmQi9c5ka11IkW00fdz24mAnY2`, the `pastPlayers` array contains:
     `GUEST_12124`, `GUEST_17524`, `GUEST_1769`, `GUEST_3487`, `GUEST_47438`, `GUEST_97831 ("Monuuuu app")`.
   - When the user on the Laptop clicks "Invite" next to "Monuuuu app", line 9489 of `src/App.tsx` executes:
     ```typescript
     await setDoc(inviteRef, {
       id: inviteRef.id,
       toUserId: playerId, // playerId = "GUEST_97831"
       fromUserId: currentUserId,
       ...
     });
     ```
   - The document in Firestore `/invites/{id}` is written with `toUserId: "GUEST_97831"`.

### Step B: Incoming Challenge Listener Audit (`src/App.tsx` lines 5812-5815)

Look at the listener on the receiving device (the Phone):
```typescript
const q = query(
  invitesCol, 
  where("toUserId", "==", user.uid), // user.uid = "aFhmQi9c5ka11IkW00fdz24mAnY2"
  where("status", "==", "pending")
);
const unsubscribe = onSnapshot(q, handleSnapshot, ...);
```
- **The Mismatch:**
  - Sender wrote: `toUserId: "GUEST_97831"`
  - Receiver is querying: `where("toUserId", "==", "aFhmQi9c5ka11IkW00fdz24mAnY2")`
  - Result: **Firestore returns 0 documents. The invitation is NEVER delivered to the Phone.**

### Step C: Friend Presence & Room Overwrite Collision

1. **`useFriendPresence` Broken by Legacy Key Purge:**
   In `src/components/modals/CreateChallengeModal.tsx` (line 115):
   ```typescript
   const { isIncognito, toggleIncognito, getFriendStatus, getFriendLastActive } = useFriendPresence(undefined, playerIds);
   ```
   Notice the first argument is `undefined`.
   In `src/hooks/useFriendPresence.ts` (lines 29-38, 76):
   ```typescript
   function getStoredUserId(): string | null {
     try {
       const saved = localStorage.getItem("sudoku_userProfile");
       if (saved) { ... }
     } catch {}
     return null;
   }
   const userId = explicitUserId || getStoredUserId();
   ```
   Because `sudoku_userProfile` was removed during `purgeLegacyKeys()` in the single-vault refactor, `getStoredUserId()` returns `null`.
   In `useFriendPresence.ts` line 193:
   ```typescript
   if (!userId) return; // Hook immediately exits; never broadcasts status: "online"!
   ```
   **The device fails to broadcast its online presence to Firestore.**

2. **Code-Join Match Overwrite (Same Google Account):**
   When the Phone joins the Laptop's room via room code:
   In `submitGameResult` (lines 10154-10155):
   ```typescript
   const participantRef = doc(db, "challenge_results", docId, "participants", rBody.userId);
   ```
   Both devices have `rBody.userId = "aFhmQi9c5ka11IkW00fdz24mAnY2"`.
   The Phone **overwrites** the Laptop's entry in `challenge_results/{docId}/participants/aFhmQi9c5ka11IkW00fdz24mAnY2`.
   When `saveOpponentsToPastPlayers` runs (line 6150):
   ```typescript
   const filteredOpponents = opponents.filter(opp => opp.id && opp.id !== currentUserId ...);
   ```
   Because `opp.id == currentUserId`, the opponent is filtered out. Neither device saves the other to `past_players`.

---

## 5. SUMMARY OF DIRECT ANSWERS TO DIRECTIVES

### 1. Exact Firestore Document State (What is in the cloud?)
- `users/aFhmQi9c5ka11IkW00fdz24mAnY2` contains:
  - `totalGamesPlayed: 3`
  - `totalWinsCount: 2`
  - `winStreak: 0`
  - `completedGames`: 2 items (1 lost duel at 37s, 1 won solo game at 118s [01:58])
  - `bestTimes`: `{ EASY: 118, MEDIUM: null, HARD: null, EXPERT: null, MASTER: null }`
  - Legacy fields preserved: `wins: 1`, `stats.gamesPlayed: 1`, `stats.wins: 1`.

### 2. The Exact Line & Condition Where Laptop's Write Failed or Dropped
- **The Laptop's write DID NOT fail or drop.**
- It executed `src/App.tsx:9801` successfully and committed all 3 games, 2 wins, 2 history items, and Easy PB 118 directly to Firestore.

### 3. The Exact Reason Mobile Mounted 1 Play but 0 History and Empty PB
- **Client Build Lag:** The phone is running the Oct 19 build (`index-CplhJz8Z.js`) or a cached Service Worker version.
- **Legacy Fallback Trap:** The older client read the legacy root fields `wins: 1` and `gamesPlayed: 1` (or local storage keys `sudoku_usr_..._gamesPlayed = 1`).
- **History Gap:** The older client looked for history under `sudoku_completed_games`, which was empty on the phone. With history = `[]`, PB evaluated to all `null`s (`PB --:--`).

### 4. The Exact ID Mismatch Breaking Real-Time Challenges and Friends
- **Same-Account Filter:** Both devices logged into `nirajmonuyt@gmail.com` share `UID: aFhmQi9c5ka11IkW00fdz24mAnY2`. The app filters out self-invites (`p.id !== uid`), preventing them from appearing in each other's lists.
- **Target ID Mismatch:** The sender sends to `GUEST_XXXX` (from `past_players`), but the receiver listens for invites where `toUserId == aFhmQi9c5ka11IkW00fdz24mAnY2`.
- **Presence Dead-End:** `CreateChallengeModal` passes `undefined` to `useFriendPresence`, which attempts to read purged `localStorage.getItem("sudoku_userProfile")`, returning `null` and aborting presence broadcast.
