import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure middleware to parse JSON bodies
  app.use(express.json());

  // API router setup before Vite middleware mounts
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Synchronized Challenge Databases
  const DATA_FILE = path.join(process.cwd(), "challenges_db.json");

  // Helper to extract numeric seed from challengeId
  function getSeedFromId(id: string | number): string {
    if (typeof id === "number") return id.toString();
    const match = id.match(/SUDOKU-(\d+)/i);
    if (match) return match[1];
    return id.toString();
  }

  // Load results from JSON file and automatically migrate old flat array structure
  function readResults(): Record<string, Record<string, any>> {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Automatically migrate legacy array structure to new seed-based dictionary
          const migrated: Record<string, Record<string, any>> = {};
          for (const record of parsed) {
            const seed = getSeedFromId(record.challengeId);
            if (!migrated[seed]) {
              migrated[seed] = {};
            }
            migrated[seed][record.userId] = record;
          }
          return migrated;
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to read database file:", e);
    }
    return {};
  }

  // Write results to JSON file
  function writeResults(db: Record<string, Record<string, any>>): boolean {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
      return true;
    } catch (e) {
      console.error("Failed to write to database file:", e);
      return false;
    }
  }

  // Prune entries older than 30 days to maintain storage cost-efficiency
  function cleanupOldResults() {
    try {
      const db = readResults();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      let modified = false;

      for (const seed of Object.keys(db)) {
        const seedRecords = db[seed];
        for (const userId of Object.keys(seedRecords)) {
          const record = seedRecords[userId];
          const recordTimestamp = record.timestamp || Date.now();
          if (recordTimestamp < thirtyDaysAgo) {
            delete seedRecords[userId];
            modified = true;
          }
        }
        if (Object.keys(seedRecords).length === 0) {
          delete db[seed];
          modified = true;
        }
      }

      if (modified) {
        writeResults(db);
        console.log("🧹 database cleanup: pruned leaderboard records older than 30 days.");
      }
    } catch (e) {
      console.error("Failed during database cleanup execution:", e);
    }
  }

  // Run database pruning on boot
  cleanupOldResults();

  // Retrieve shared real leaderboard entries for a specific challenge ID / seed
  app.get("/api/challenges/:challengeId/leaderboard", (req, res) => {
    const { challengeId } = req.params;
    const seed = getSeedFromId(challengeId);
    const db = readResults();
    
    const seedRecords = db[seed] || {};
    const results = Object.values(seedRecords);
    
    // Sort logic: Completed (wins) first, then completed (failed), then pending
    results.sort((a, b) => {
      const aPending = !!a.isPending;
      const bPending = !!b.isPending;

      if (aPending !== bPending) {
        return aPending ? 1 : -1; // completed first, pending last
      }

      const aWon = !!a.isWon;
      const bWon = !!b.isWon;

      if (aWon !== bWon) {
        return aWon ? -1 : 1; // wins first
      }

      if (aWon) {
        if (a.timeSec !== b.timeSec) return a.timeSec - b.timeSec;
        return a.mistakes - b.mistakes;
      } else {
        if (a.mistakes !== b.mistakes) return a.mistakes - b.mistakes;
        return b.timeSec - a.timeSec;
      }
    });

    res.json({ results });
  });

  // Register that a player has opened and joined a challenge
  app.post("/api/challenges/join", (req, res) => {
    const { challengeId, userId, playerName } = req.body;

    if (!challengeId || !userId || !playerName) {
      return res.status(400).json({ error: "Missing required properties: challengeId, userId, playerName." });
    }

    const seed = getSeedFromId(challengeId);
    const db = readResults();

    if (!db[seed]) {
      db[seed] = {};
    }

    const existing = db[seed][userId];
    if (existing) {
      return res.json({ success: true, message: "Already registered", record: existing });
    }

    const newRecord = {
      challengeId,
      userId,
      playerName: playerName.trim(),
      timeSec: 0,
      mistakes: 0,
      isWon: false,
      isPending: true,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };

    db[seed][userId] = newRecord;
    writeResults(db);
    res.json({ success: true, record: newRecord });
  });

  // Submit / synchronize a completion result for a challenge / seed
  app.post("/api/challenges/submit", (req, res) => {
    const { challengeId, userId, playerName, timeSec, mistakes, isWon, date } = req.body;

    if (!challengeId || !userId || !playerName) {
      return res.status(400).json({ error: "Missing required properties: challengeId, userId, playerName." });
    }

    const seed = getSeedFromId(challengeId);
    const db = readResults();

    if (!db[seed]) {
      db[seed] = {};
    }

    const newRecord = {
      challengeId,
      userId,
      playerName: playerName.trim(),
      timeSec: Number(timeSec),
      mistakes: Number(mistakes),
      isWon: !!isWon,
      isPending: false,
      date: date || new Date().toLocaleDateString(),
      timestamp: Date.now()
    };

    const existing = db[seed][userId];
    if (existing) {
      const shouldUpdate = 
        existing.isPending ||
        (newRecord.isWon && !existing.isWon) ||
        (newRecord.isWon && existing.isWon && newRecord.timeSec < existing.timeSec) ||
        (!newRecord.isWon && !existing.isWon && newRecord.mistakes < existing.mistakes);

      if (shouldUpdate) {
        db[seed][userId] = newRecord;
      }
    } else {
      db[seed][userId] = newRecord;
    }

    writeResults(db);
    res.json({ success: true, record: db[seed][userId] });
  });

  // Server-side safety filter and name validator using precise string sanitization
  app.post("/api/validate-name", (req, res) => {
    const { name } = req.body;
    
    if (!name || typeof name !== "string") {
      return res.status(400).json({ 
        isValid: false, 
        error: "Name is required." 
      });
    }

    const trimmedName = name.trim();

    // Safety validation requirement: Alphanumeric characters and spaces only
    const alphanumericRegex = /^[a-zA-Z0-9\s]+$/;
    if (!alphanumericRegex.test(trimmedName)) {
      return res.json({ 
        isValid: false, 
        error: "Please choose a name that contains only alphanumeric characters." 
      });
    }

    const lowerName = trimmedName.toLowerCase();

    // Comprehensive list of restricted words (profanity, racial slurs, and explicit language)
    const restrictedList = [
      "fuck", "nigger", "faggot", "cunt", "bitch", "shit", "dick",
      "pussy", "bastard", "slut", "whore", "kike", "chink", "asshole",
      "motherfucker", "fuk", "shyt", "bich", "dyke", "masturbat",
      "penis", "vagina", "orgasm", "clitoris", "cock", "testicle",
      "semen", "sperm", "ejaculat", "porn", "xxx", "pedophil", "rape",
      "nigg", "fag", "retard", "scum", "bollocks", "wanker", "piss"
    ];

    // Check robust boundary checks and substring checks
    for (const badWord of restrictedList) {
      if (lowerName.includes(badWord)) {
        return res.json({ 
          isValid: false, 
          error: "Please choose a name that is respectful to other players." 
        });
      }
    }

    return res.json({ isValid: true });
  });

  // Vite development server routing middleware fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: Failed to boot secondary server:", err);
});
