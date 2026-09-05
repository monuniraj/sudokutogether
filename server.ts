import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Security Headers Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    next();
  });

  // CORS Middleware
  const ALLOWED_ORIGIN_PATTERNS = [
    /^https:\/\/sudoku-together-mode\.web\.app$/,
    /^https:\/\/sudoku-together-mode\.firebaseapp\.com$/,
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/,
    /^capacitor:\/\/localhost$/
  ];

  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin) {
      const isAllowed = ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
      if (isAllowed) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      }
    }
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    next();
  });

  // Simple in-memory rate limiter (60 requests per minute per IP for API routes)
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
  const RATE_LIMIT_WINDOW_MS = 60 * 1000;
  const RATE_LIMIT_MAX_REQUESTS = 60;

  const apiRateLimiter = (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const clientData = rateLimitMap.get(ip);

    if (!clientData || now > clientData.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return next();
    }

    if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
      return res.status(429).json({ error: "Too many requests. Please slow down." });
    }

    clientData.count++;
    next();
  };

  // Periodic cleanup of rate limiter entries
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetAt) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  // Configure middleware to parse JSON bodies with 10kb limit to prevent payload DoS
  app.use(express.json({ limit: "10kb" }));

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
  app.get("/api/challenges/:challengeId/leaderboard", apiRateLimiter, (req, res) => {
    const { challengeId } = req.params;
    if (!challengeId || typeof challengeId !== "string" || challengeId.length > 100) {
      return res.status(400).json({ error: "Invalid challenge ID parameter." });
    }

    const seed = getSeedFromId(challengeId);
    const db = readResults();
    
    const seedRecords = db[seed] || {};
    const results = Object.values(seedRecords);
    
    // Sort logic: Completed (wins) first, then completed (failed), then pending
    results.sort((a, b) => {
      const aPending = !!a.isPending;
      const bPending = !!b.isPending;

      if (aPending !== bPending) {
        return aPending ? 1 : -1;
      }

      const aWon = !!a.isWon;
      const bWon = !!b.isWon;

      if (aWon !== bWon) {
        return aWon ? -1 : 1;
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
  app.post("/api/challenges/join", apiRateLimiter, (req, res) => {
    const { challengeId, userId, playerName } = req.body;

    if (!challengeId || typeof challengeId !== "string" || challengeId.length > 100) {
      return res.status(400).json({ error: "Invalid or missing challengeId." });
    }
    if (!userId || typeof userId !== "string" || userId.length > 100) {
      return res.status(400).json({ error: "Invalid or missing userId." });
    }
    if (!playerName || typeof playerName !== "string" || playerName.trim().length === 0 || playerName.length > 50) {
      return res.status(400).json({ error: "Invalid or missing playerName." });
    }

    const sanitizedName = playerName.trim().slice(0, 50);
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
      playerName: sanitizedName,
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
  app.post("/api/challenges/submit", apiRateLimiter, (req, res) => {
    const { challengeId, userId, playerName, timeSec, mistakes, isWon, date } = req.body;

    if (!challengeId || typeof challengeId !== "string" || challengeId.length > 100) {
      return res.status(400).json({ error: "Invalid or missing challengeId." });
    }
    if (!userId || typeof userId !== "string" || userId.length > 100) {
      return res.status(400).json({ error: "Invalid or missing userId." });
    }
    if (!playerName || typeof playerName !== "string" || playerName.trim().length === 0 || playerName.length > 50) {
      return res.status(400).json({ error: "Invalid or missing playerName." });
    }

    const sanitizedName = playerName.trim().slice(0, 50);
    const parsedTime = Number(timeSec);
    const parsedMistakes = Number(mistakes);

    if (isNaN(parsedTime) || parsedTime < 0 || parsedTime > 86400) {
      return res.status(400).json({ error: "timeSec must be a valid number between 0 and 86400." });
    }
    if (isNaN(parsedMistakes) || parsedMistakes < 0 || parsedMistakes > 999) {
      return res.status(400).json({ error: "mistakes must be a valid number between 0 and 999." });
    }

    const seed = getSeedFromId(challengeId);
    const db = readResults();

    if (!db[seed]) {
      db[seed] = {};
    }

    const newRecord = {
      challengeId,
      userId,
      playerName: sanitizedName,
      timeSec: parsedTime,
      mistakes: parsedMistakes,
      isWon: Boolean(isWon),
      isPending: false,
      date: typeof date === "string" ? date.slice(0, 30) : new Date().toLocaleDateString(),
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
  app.post("/api/validate-name", apiRateLimiter, (req, res) => {
    const { name } = req.body;
    
    if (!name || typeof name !== "string") {
      return res.status(400).json({ 
        isValid: false, 
        error: "Name is required." 
      });
    }

    const trimmedName = name.trim();

    if (trimmedName.length === 0 || trimmedName.length > 30) {
      return res.json({
        isValid: false,
        error: "Name must be between 1 and 30 characters."
      });
    }

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
