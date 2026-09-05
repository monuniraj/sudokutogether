# 🔒 Sudoku Together: Security Policy & Audit Report

## Overview
This document outlines the security architecture, threat model, hardened components, and deployment steps for the **Sudoku Together** application.

---

## 🛡️ Security Hardening Implemented

### 1. Firebase Firestore Security Rules (`firestore.rules`)
* **Elimination of Open Access:** Replaced unrestricted `allow read, write: if true;` with granular collection-level and document-level validation rules.
* **Schema & Type Enforcement:**
  * `challenge_results/{challengeId}/participants/{userId}`: Document writes are strictly bound to `request.resource.data.userId == userId`.
  * Enforced numeric bounds on `timeSec` (`0 <= timeSec <= 86400`) and `mistakes` (`0 <= mistakes <= 999`).
  * Enforced string length bounds on `playerName` (`<= 50 chars`) and `challengeId` (`<= 100 chars`).
* **Deletion Prevention:** All collections explicitly define `allow delete: if false;` to prevent griefing or malicious state erasure.
* **Invite Status Transition Validation:** In `invites/{inviteId}`, only authorized statuses (`pending`, `accepted`, `declined`) are permitted.

### 2. Client-Side Input & URL Sanitization (`src/App.tsx`)
* **Strict Parameter Validators:**
  * `sanitizeGameId()`: Enforces regex pattern `^SUDOKU-\d+-(EASY|MEDIUM|HARD|EXPERT)-M\d+(-H\d+)?-T[01](-P[a-zA-Z0-9+=]+)?$` or strict numeric seed.
  * `sanitizeSenderName()`: Strips HTML, script tags, quotes, and limits length to 30 characters.
  * `sanitizePassword()`: Strips illegal characters and bounds length to 32 characters.
* **Resilient Parsing:** Malformed, oversized, or malicious query strings (`?c=...`, `&pw=...`, `&sender=...`, hash fragments `#SUDOKU-...`, and Capacitor `appUrlOpen` deep link payloads) are safely rejected before reaching game state or `localStorage`.

### 3. Environment Variable & API Key Isolation
* **Vite Environment Integration:** Migrated client-side Firebase configuration in `src/firebase.ts` to `import.meta.env.VITE_FIREBASE_*`.
* **Templates & Tracking:** Provided `.env.example` with required configuration keys for secure CI/CD and deployment pipelines.

### 4. Server-Side Protection (`server.ts`)
* **CORS Whitelist:** Restricted cross-origin API requests to verified origins (`https://sudoku-together-mode.web.app`, `https://sudoku-together-mode.firebaseapp.com`, `http://localhost:*`, `capacitor://localhost`).
* **Security Headers:** Added defensive HTTP headers:
  * `X-Content-Type-Options: nosniff`
  * `X-Frame-Options: SAMEORIGIN`
  * `X-XSS-Protection: 1; mode=block`
  * `Referrer-Policy: strict-origin-when-cross-origin`
  * `Cross-Origin-Opener-Policy: same-origin`
* **In-Memory IP Rate Limiting:** Applied rate limiter to `/api/` endpoints (max 60 requests per minute per IP) to mitigate automated spam and brute-force attacks.
* **Payload Size Limiting:** Restricted JSON body parsing to `10kb` to prevent Denial of Service (DoS) attacks.
* **Endpoint Validation:** Added strict type, bounds, and string length sanitization to `/api/challenges/join`, `/api/challenges/submit`, and `/api/validate-name`.

### 5. Mobile & Android WebView Security (`capacitor.config.ts` & `AndroidManifest.xml`)
* **HTTPS Scheme Enforced:** Configured `server: { androidScheme: 'https', cleartext: false }` in `capacitor.config.ts`.
* **Deep Link Verification:** Android App Links configured with `autoVerify="true"` targeting verified web app domains.

---

## 🚀 How to Deploy Updated Security Rules to Firebase

Follow these steps using the Firebase CLI to deploy your hardened Firestore rules and web hosting:

### Step 1: Login to Firebase CLI
```bash
npx firebase-tools login
```

### Step 2: Test & Deploy Firestore Security Rules
To deploy only the Firestore security rules without deploying the frontend:
```bash
npx firebase-tools deploy --only firestore:rules
```

### Step 3: Build & Deploy Frontend Application
To compile the hardened frontend and deploy both hosting and rules together:
```bash
npm run build
npx firebase-tools deploy
```

---

## 🔍 Reporting Security Issues
If you identify any new security vulnerabilities or suspect suspicious activity, please do not create public issues. Open a private discussion or contact the maintainers directly.
