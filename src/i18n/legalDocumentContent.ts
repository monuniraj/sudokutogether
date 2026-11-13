import { Language } from "./translations";

export type ContactTopicId = "bug" | "privacy" | "deletion";

export interface LabeledText {
  label: string;
  text: string;
}

export interface LegalDocumentLocaleContent {
  metaLine: string;
  privacy: {
    title: string;
    intro: string;
    s1Header: string;
    s1Intro: string;
    s1LocalStorage: LabeledText;
    s1Firestore: {
      label: string;
      intro: string;
      bullets: [string, string, string];
    };
    s1Fcm: LabeledText & {
      controlLabel: string;
      controlText: string;
    };
    s1Auth: LabeledText;
    s1ServerLogs: LabeledText;
    s2Header: string;
    s2P1: string;
    s2P2: string;
    s2BoxTitle: string;
    s2BoxIntro: string;
    s2AndroidAaid: LabeledText;
    s2Portals: Array<{ name: string; url: string }>;
    s2Quality: LabeledText;
    s3Header: string;
    s3Intro: string;
    s3BoxTitle: string;
    s3InApp: LabeledText;
    s3Email: LabeledText;
    s3RightsIntro: string;
    s3RightsBullets: [LabeledText, LabeledText, LabeledText];
    s4Header: string;
    s4Text: string;
    s5Header: string;
    s5Text: string;
    s6Header: string;
    s6Text: string;
    s7Header: string;
    s7Intro: string;
    s7TurnaroundLabel: string;
    s7TurnaroundValue: string;
  };
  terms: {
    title: string;
    intro: string;
    s1Header: string;
    s1Text: string;
    s2Header: string;
    s2Intro: string;
    s2BoxTitle: string;
    s2Bullets: [LabeledText, LabeledText, LabeledText, LabeledText, LabeledText];
    s2Penalty: LabeledText;
    s3Header: string;
    s3Intro: string;
    s3Bullets: [LabeledText, LabeledText, LabeledText, LabeledText, LabeledText];
    s4Header: string;
    s4Text: string;
    s5Header: string;
    s5Text: string;
    s6Header: string;
    s6Text: string;
    s7Header: string;
    s7Text: string;
    s8Header: string;
    s8Intro: string;
    s8TurnaroundLabel: string;
    s8TurnaroundValue: string;
  };
  contactComposer: {
    sectionLabel: string;
    helperText: string;
    subjectLabel: string;
    messageLabel: string;
    copyMessageBtn: string;
    messageCopiedBtn: string;
    copyEmailBtn: string;
    emailCopiedBtn: string;
    openPrivacyBtn: string;
    openDeleteSettingsBtn: string;
    topics: Record<ContactTopicId, { label: string; subject: string; body: string }>;
  };
  about: {
    publisherBadge: string;
    publisherHeader: string;
    publisherText: string;
    engineHeader: string;
    engineIntro: string;
    difficultySpecs: Array<{
      level: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
      label: string;
      cluesBadge: string;
      summary: string;
    }>;
    multiplayerHeader: string;
    multiplayerText: string;
    assistantsText: string;
    exploreHeader: string;
    exploreRulesLabel: string;
    exploreSolverLabel: string;
    exploreDailyLabel: string;
    exploreContactLabel: string;
  };
}

const OPT_OUT_PORTALS: Array<{ name: string; url: string }> = [
  { name: "Google Ads Settings", url: "https://adssettings.google.com" },
  { name: "Network Advertising Initiative (NAI)", url: "https://www.networkadvertising.org" },
  { name: "Digital Advertising Alliance (DAA / AboutAds)", url: "https://www.aboutads.info/choices" },
  { name: "European Interactive Digital Advertising Alliance (EDAA)", url: "https://www.youronlinechoices.eu/" },
];

export const LEGAL_DOCUMENT_CONTENT: Record<Language, LegalDocumentLocaleContent> = {
  en: {
    metaLine: "Effective Date: August 12, 2026 | Version: 1.0.3 | Platform: Web & Android App",
    privacy: {
      title: "Privacy Policy",
      intro:
        "At SudokuSync (accessible from https://sudokusync.com and the official Android mobile application), we consider the privacy of our visitors and players to be of extreme importance. This Privacy Policy document describes in comprehensive detail the types of information collected, stored, and processed, and how we uphold global privacy standards including the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA/CPRA), the Children's Online Privacy Protection Act (COPPA), Google Play Store Data Safety Policies, Google AdSense Program Policies, and Google AdMob Policies.",
      s1Header: "1. Information Collection & Storage Architecture",
      s1Intro:
        "We operate on strict data minimization principles, clearly distinguishing between client-only local data and cloud database records:",
      s1LocalStorage: {
        label: "Client-Side Local Storage (Browser & Device Only):",
        text: "Standard browser localStorage is used strictly on your device to persist UI preferences (Dark Mode, sound synthesis, haptics), mistake counter limits, timer visibility, active puzzle board state/notes, and saved single-player games. This data remains on your device and is never sold, shared, or transmitted to third-party marketing entities.",
      },
      s1Firestore: {
        label: "Google Cloud Firestore (Real-Time Multiplayer & Leaderboards):",
        intro:
          "When participating in multiplayer challenges or global matches, the following non-sensitive game parameters are stored on Google Cloud Firestore:",
        bullets: [
          "Anonymous Challenge ID, seed number, and difficulty level.",
          "Player display nickname (user-chosen alphanumeric string) and user ID.",
          "Match performance metrics: Completion time (seconds), mistake count, and win/loss completion status.",
        ],
      },
      s1Fcm: {
        label: "Firebase Cloud Messaging (FCM) & Device Identifiers:",
        text: "When notification permissions are granted, an anonymous Firebase Cloud Messaging (FCM) registration token and anonymous device identifier are generated strictly to deliver real-time challenge invites, opponent duel alerts, and match completion updates. Push tokens are never used for cross-app tracking, device fingerprinting, behavioral profiling, or unsolicited advertising.",
        controlLabel: "User Control & Revocation:",
        controlText:
          'Players maintain total control over notifications and may enable or disable notifications at any time via the in-game toggle under Settings -> "Push Notifications" or through the operating system / web browser application settings.',
      },
      s1Auth: {
        label: "Firebase Authentication & Cloud Synchronization (Optional):",
        text: "When players choose to sign in with Google via Firebase Authentication (Google OAuth), we receive basic profile identity credentials (Display Name, Email address, and unique authentication User ID) solely to authenticate user sessions, securely synchronize personal stats and puzzle records across devices, and manage player profile settings. Anonymous Guest sessions run in a physically isolated local vault and never write to private authenticated user profiles without explicit sign-in. We do NOT collect, access, or store passwords, contacts, personal device files, or financial details. Authentication credentials are used strictly for game functionality and cross-device continuity, and are never sold, rented, or shared with third-party advertisers.",
      },
      s1ServerLogs: {
        label: "Infrastructure & Diagnostic Server Logs:",
        text: "Standard web server request logs (including IP addresses, browser user-agent, timestamps, and rate limiting metrics) are processed automatically by Google Firebase Hosting and our Express server solely for operational security, DDoS prevention, and rate-limiting integrity.",
      },
      s2Header: "2. Advertising, Google AdSense, AdMob SDK, AAID & Google UMP Consent",
      s2P1: "We partner with Google LLC to keep SudokuSync free across platforms using Google AdSense on the web and the Google AdMob SDK in our official Android mobile application. On the web, Google and third-party ad networks use cookies (including the DoubleClick / DART cookie), web beacons, and device identifiers to measure ad performance and serve advertisements based on your prior visits to this website or other websites on the Internet. On Android, the AdMob SDK may process the Android Advertising ID (AAID), app interaction events, and diagnostic signals for ad delivery, frequency capping, and fraud prevention.",
      s2P2: "Before serving personalized ads to users in regulated jurisdictions (including the EEA and the UK), our mobile app uses the Google UMP (User Messaging Platform) Consent SDK to present a clear privacy choices dialog so you can grant, manage, or withdraw your consent at any time.",
      s2BoxTitle: "Advertising Transparency, AAID Controls & Opt-Out Portals:",
      s2BoxIntro:
        "Google's use of advertising cookies, including the DoubleClick cookie (DART cookie), enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet. Users may opt out of personalized advertising, reset/delete their mobile advertising ID, or manage cookie/consent preferences at any time:",
      s2AndroidAaid: {
        label: "Android Advertising ID (AAID) Opt-Out / Reset:",
        text: "Open Android Settings -> Google -> Ads (or Settings -> Privacy -> Ads) to reset your Advertising ID or opt out of Ads Personalization.",
      },
      s2Portals: OPT_OUT_PORTALS,
      s2Quality: {
        label: "Ad Traffic & Quality Protection:",
        text: "Automated bots, click-farms, repeated manual ad clicks, ad-block tampering, or proxy manipulations are strictly prohibited and actively filtered to preserve ecosystem integrity.",
      },
      s3Header: "3. Right to Erasure / Account & Data Deletion (Google Play & Global Privacy Standards)",
      s3Intro:
        "Under global privacy frameworks (GDPR, CCPA/CPRA, DPDP) and Google Play Store Data Safety Guidelines, every player maintains the absolute right to request the permanent deletion of their account, gameplay records, and associated personal or telemetry data.",
      s3BoxTitle: "Account & Data Deletion Methods:",
      s3InApp: {
        label: "Directly In-App (Instant Self-Service):",
        text: 'Open Settings -> Navigate to the SUPPORT & INFO section -> Click "Delete Account & Data". This immediately purges your Firestore cloud profile, real-time presence documents, active multiplayer room player documents, stored FCM push notification tokens, device localStorage and sessionStorage cache, and revokes your authentication session.',
      },
      s3Email: {
        label: "Web & Email Request (Alternative Channel):",
        text: "If you cannot access the application or have uninstalled it, you may submit a data deletion request by contacting sudokutogethermode@gmail.com (use Contact Support to copy the email or message template). Please provide your player display name or associated email address. Deletion requests are processed and confirmed within 24 to 48 business hours.",
      },
      s3RightsIntro: "Additional statutory rights for users in the EEA, UK, and worldwide include:",
      s3RightsBullets: [
        {
          label: "Right of Access:",
          text: "Request a copy of your stored player and leaderboard records.",
        },
        {
          label: "Right to Rectification:",
          text: "Update or modify your player display nickname at any time in-game.",
        },
        {
          label: "Right to Restriction & Data Portability:",
          text: "Request limitations on processing or export of your match telemetry.",
        },
      ],
      s4Header: "4. California Privacy Rights (CCPA / CPRA)",
      s4Text:
        "Under the California Consumer Privacy Act as amended by the CPRA, California residents are entitled to know what data categories are collected and to request data deletion. We do NOT sell or share your personal information with third parties for monetary or commercial consideration.",
      s5Header: "5. Children's Privacy Protection (COPPA)",
      s5Text:
        "Protecting the privacy of young children is especially important. SudokuSync does not knowingly collect or solicit personally identifiable information from children under the age of 13 (or under 16 in the EEA/UK). Our game does not require real names, physical addresses, or phone numbers to play. If a parent or guardian believes their child has submitted personal information to our servers, please contact us immediately at sudokutogethermode@gmail.com and we will expeditiously remove such records.",
      s6Header: "6. Data Retention & Security Controls",
      s6Text:
        "Multiplayer challenge match records older than 30 days are pruned automatically from our databases. All client-to-server traffic is encrypted in transit using industry-standard TLS/HTTPS protocols. Strict Firestore security rules enforce document-level ownership and prevent unauthorized data tampering.",
      s7Header: "7. Contact Us",
      s7Intro:
        "For any questions regarding this Privacy Policy or our data handling practices, please contact our Data Protection desk:",
      s7TurnaroundLabel: "Response Turnaround:",
      s7TurnaroundValue: "Within 24 to 48 business hours.",
    },
    terms: {
      title: "Terms of Service",
      intro:
        "By accessing, browsing, installing, or playing SudokuSync (accessible from https://sudokusync.com or our official Android application), you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this application.",
      s1Header: "1. Description of Service & Free Access",
      s1Text:
        'SudokuSync provides free-to-play digital Sudoku puzzles, deterministic seeded matchmaking rooms, real-time leaderboards, and logic training tools. The service is provided on an "AS IS" and "AS AVAILABLE" basis. We reserve the right to modify, update, or discontinue features of the game at any time without prior notice.',
      s2Header: "2. Fair Play, Anti-Cheat & Community Standards",
      s2Intro:
        "SudokuSync is committed to maintaining an honest, merit-based puzzle ecosystem. To ensure a fair and enjoyable environment for all players across single-player leaderboards and real-time multiplayer duels, you agree strictly to abide by our Fair Play standards:",
      s2BoxTitle: "Fair Play & Anti-Cheat Policy:",
      s2Bullets: [
        {
          label: "No Automated Bots or Solvers:",
          text: "You may not deploy automated bots, algorithmic solving scripts, auto-clickers, or headless browsers to solve puzzles or simulate gameplay.",
        },
        {
          label: "No Client Tampering or Memory Injection:",
          text: "You may not modify client-side application code, inject scripts or debugging tools, alter memory values, or tamper with runtime variables to artificially accelerate completion times or bypass puzzle rules.",
        },
        {
          label: "No Network or API Manipulation:",
          text: "You may not intercept, forge, replay, or flood sync packets, manipulate multiplayer matchmaking, or falsify match results.",
        },
        {
          label: "Appropriate Player Nicknames:",
          text: "Offensive, vulgar, defamatory, or abusive display names are strictly prohibited. Automated profanity filters and alphanumeric validation are enforced on all player profiles.",
        },
        {
          label: "Zero Ad-Fraud:",
          text: "Engaging in automated, fraudulent, or deceptive clicks on advertisements is strictly prohibited.",
        },
      ],
      s2Penalty: {
        label: "Penalties for Violation:",
        text: "Any detection of cheat scripts, memory manipulation, or unauthorized tampering results in immediate disqualification of solve times, removal from public leaderboards, and temporary or permanent suspension of player profiles and device access.",
      },
      s3Header: "3. Cloud Account & Synchronization Usage",
      s3Intro:
        "Players may choose to access SudokuSync as a guest or connect their personal Google Account for enhanced functionality:",
      s3Bullets: [
        {
          label: "Cross-Device Synchronization:",
          text: "Linking a Google Account enables secure cloud synchronization of your personal statistics, solve history, best completion times, custom preferences, and saved puzzle states across multiple web browsers and Android devices.",
        },
        {
          label: "Account Confidentiality & Responsibility:",
          text: "You are responsible for maintaining the confidentiality and security of your Google account credentials. All activities occurring under your authenticated session are your sole responsibility.",
        },
        {
          label: "Personal, Non-Commercial Use:",
          text: "Cloud synchronization is provided solely for personal, lawful entertainment and skill development. Commercial exploitation, automated account generation, or sharing credentials to manipulate multiplayer records is prohibited.",
        },
        {
          label: "Service Availability & Termination:",
          text: "Cloud synchronization is provided on a reliable best-effort basis. We reserve the right to suspend or terminate cloud synchronization features or revoke account access if malicious activity, data corruption attempts, or terms violations are detected.",
        },
        {
          label: "Self-Service Account & Data Deletion:",
          text: 'You retain complete control over your cloud data. You may disconnect synchronization or permanently purge your cloud profile, match records, stored push notification tokens, and local storage cache at any time directly in the app under Settings -> Support & Info -> "Delete Account & Data", or by submitting a written request to sudokutogethermode@gmail.com.',
        },
      ],
      s4Header: "4. Intellectual Property Rights",
      s4Text:
        "All game logic engines, procedural sound synthesis code, user interface designs, the Scrapbook Design System tokens, graphics, logos, and software code are the intellectual property of SudokuSync and protected by international copyright and trademark laws.",
      s5Header: "5. Third-Party Advertisements (AdSense & AdMob)",
      s5Text:
        "The service is kept free via Google AdSense on Web and the Google AdMob SDK (including optional interstitial or rewarded video ads, subject to Google UMP consent in applicable regions) on Android. We do not control or endorse the content of third-party advertisements or external links. Any interactions or transactions with advertised third parties are solely between you and the respective advertiser.",
      s6Header: "6. Disclaimer of Warranties & Limitation of Liability",
      s6Text:
        "The materials and software on SudokuSync are provided on an 'as is' basis. SudokuSync makes no warranties, expressed or implied, and hereby disclaims all other warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement. In no event shall SudokuSync or its developers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the game.",
      s7Header: "7. Account Deletion & Termination",
      s7Text:
        'You may stop using the application at any time. You can delete all your stored profile data instantly using the in-app "Delete Account & Data" button under Settings, which purges all cloud records, stored push notification tokens, and local storage. We reserve the right to ban or remove player nicknames or access for users who violate these Terms of Service.',
      s8Header: "8. Contact Us",
      s8Intro: "If you have questions or legal notices regarding these Terms of Service, please contact us:",
      s8TurnaroundLabel: "Response Turnaround:",
      s8TurnaroundValue: "Within 24 to 48 business hours.",
    },
    contactComposer: {
      sectionLabel: "Support Message Composer",
      helperText:
        "Pick a topic to generate a ready-to-send message, edit if needed, and copy the full message or support email cleanly without opening a blank browser window.",
      subjectLabel: "Subject",
      messageLabel: "Message Template",
      copyMessageBtn: "Copy Message",
      messageCopiedBtn: "Message Copied",
      copyEmailBtn: "Copy Email",
      emailCopiedBtn: "Email Copied",
      openPrivacyBtn: "Open Privacy & Ad/UMP Opt-Out",
      openDeleteSettingsBtn: "Go to Settings -> Delete Account & Data",
      topics: {
        bug: {
          label: "Bug Report",
          subject: "SudokuSync Bug Report (v1.0.3)",
          body: "App Version: v1.0.3\nPlatform (Web / Android): \nScreen or Feature: \nSteps to Reproduce: \nExpected vs Actual Result: ",
        },
        privacy: {
          label: "Privacy / UMP Consent",
          subject: "SudokuSync Privacy & UMP Consent Inquiry (v1.0.3)",
          body: "App Version: v1.0.3\nPlatform (Web / Android): \nTopic (GDPR / CCPA / AdSense / AdMob AAID / UMP Consent): \nDetails of Request: ",
        },
        deletion: {
          label: "Account & Data Deletion",
          subject: "SudokuSync Account & Data Deletion Request (v1.0.3)",
          body: "App Version: v1.0.3\nPlayer Display Name / Email: \nRequest: Please permanently delete my SudokuSync Firestore profile, leaderboard/match records, and push notification tokens.",
        },
      },
    },
    about: {
      publisherBadge: "Published by Mo Logic",
      publisherHeader: "Independent Puzzle Studio & Editorial Standards",
      publisherText:
        "SudokuSync is developed and published independently by Mo Logic across Web (https://sudokusync.com) and Google Play Android (com.mologic.sudokusync). Every puzzle, interactive diagram, and logic guide is crafted for distraction-free solving with a borderless pastel design system, Light/Dark themes, offline persistence, and transparent ad-supported free access.",
      engineHeader: "Deterministic 9x9 Puzzle Engine & Verified Clue Tiers",
      engineIntro:
        "Every classic 9x9 board is produced by our seeded Mulberry32 PRNG generator and checked by our human-logic difficulty engine plus bitmask MRV solver verification to guarantee a mathematically unique single solution before play begins:",
      difficultySpecs: [
        {
          level: "EASY",
          label: "Easy",
          cluesBadge: "51 Clues",
          summary: "Row, column, and 3x3 box Singles designed for relaxed warm-up solving.",
        },
        {
          level: "MEDIUM",
          label: "Medium",
          cluesBadge: "39 Clues",
          summary: "Balanced multi-step scanning across intersecting rows, columns, and boxes.",
        },
        {
          level: "HARD",
          label: "Hard",
          cluesBadge: "30 Clues",
          summary: "Pairs, pointing intersections, and candidate note workflows with Auto-Notes support.",
        },
        {
          level: "EXPERT",
          label: "Expert",
          cluesBadge: "25 Clues",
          summary: "Deep candidate deduction chains, X-Wing patterns, and minimal starting clues.",
        },
      ],
      multiplayerHeader: "Same-Board Live & Asynchronous Multiplayer",
      multiplayerText:
        "Play live or asynchronously on the exact same 9x9 seed using 6-digit numeric Room Codes, optional PIN protection, and direct ?room= browser share links. Signed-in Google players can sync stats, manage persistent Friends alongside Recent Players, challenge opponents asynchronously, and toggle Ghost Mode visibility at any time.",
      assistantsText:
        "Seven verified Smart Assistants tailor the board to your style: Highlight Identical Numbers, Show Remaining Numbers, Highlight Related Area, Auto-Switch Completed Numbers, Auto-Remove Notes, Auto-Notes (Hard and Expert modes), and Fast Fill (Number-First), paired with configurable mistake limits and timer toggles.",
      exploreHeader: "Explore Rules, Tools & Support",
      exploreRulesLabel: "Rules & Strategies Hub",
      exploreSolverLabel: "Interactive Sudoku Solver",
      exploreDailyLabel: "Daily Challenge",
      exploreContactLabel: "Contact & Data Support",
    },
  },

  hi: {
    metaLine: "Prabhavi Tithi: 12 August 2026 | Version: 1.0.3 | Platform: Web & Android App",
    privacy: {
      title: "Privacy Policy",
      intro:
        "SudokuSync (https://sudokusync.com aur official Android mobile app) par hum apne sabhi visitors aur players ki privacy ko sabse zyada ahmiyat dete hain. Yeh Privacy Policy detail mein batati hai ki kaunsa data collect, store aur process hota hai, aur hum GDPR, California Consumer Privacy Act (CCPA/CPRA), COPPA, Google Play Store Data Safety Policies, Google AdSense Program Policies, aur Google AdMob Policies ko kaise follow karte hain.",
      s1Header: "1. Information Collection aur Storage Architecture",
      s1Intro:
        "Hum strict data minimization follow karte hain aur device-local data aur cloud database records ke beech clear fark rakhte hain:",
      s1LocalStorage: {
        label: "Client-Side Local Storage (Sirf Browser & Device):",
        text: "Aapke device par browser localStorage sirf UI preferences (Dark Mode, sound synthesis, haptics), mistake limit, timer visibility, active puzzle notes, aur saved solo games ko yaad rakhne ke liye use hota hai. Yeh data aapke device par hi rehta hai aur kabhi kisi third-party marketing agency ko becha ya share nahi kiya jata.",
      },
      s1Firestore: {
        label: "Google Cloud Firestore (Real-Time Multiplayer & Leaderboards):",
        intro:
          "Multiplayer challenges ya global matches khelte waqt sirf non-sensitive game parameters Google Cloud Firestore par save hote hain:",
        bullets: [
          "Anonymous Challenge ID, puzzle seed number, aur difficulty level.",
          "Player display nickname (user ka chuna hua alphanumeric naam) aur user ID.",
          "Match performance metrics: Completion time (seconds), mistake count, aur win/loss status.",
        ],
      },
      s1Fcm: {
        label: "Firebase Cloud Messaging (FCM) & Device Identifiers:",
        text: "Jab aap notification permission dete hain, tab sirf real-time challenge invites, duel alerts, aur match updates bhejne ke liye ek anonymous FCM token aur anonymous device ID generate hota hai. Push tokens kabhi cross-app tracking, device fingerprinting, ya unsolicited ads ke liye use nahi hote.",
        controlLabel: "User Control & Revocation:",
        controlText:
          'Aap kabhi bhi Settings -> "Push Notifications" toggle ya apne Android / web browser settings se notifications ko band ya chalu kar sakte hain.',
      },
      s1Auth: {
        label: "Firebase Authentication & Cloud Sync (Optional):",
        text: "Agar aap Firebase Authentication (Google OAuth) se Google Sign-In karte hain, toh humein sirf basic profile identity (Display Name, Email, aur User ID) milti hai taaki aapka session authenticate ho aur stats/saved puzzles sabhi devices par sync ho sakein. Anonymous Guest sessions bilkul alag isolated local vault mein chalte hain aur bina sign-in kiye private user profiles mein kuch write nahi karte. Hum kabhi password, contacts, personal files, ya financial details collect nahi karte aur na hi kisi advertiser ke saath auth data share karte hain.",
      },
      s1ServerLogs: {
        label: "Infrastructure & Diagnostic Server Logs:",
        text: "Google Firebase Hosting aur humara Express server operational security, DDoS protection, aur rate-limiting ke liye standard web server request logs (IP address, browser user-agent, timestamp) automatically process karte hain.",
      },
      s2Header: "2. Advertising, Google AdSense, AdMob SDK, AAID & Google UMP Consent",
      s2P1: "SudokuSync ko free rakhne ke liye hum Google LLC ki services use karte hain — Web par Google AdSense aur official Android app mein Google AdMob SDK. Web par Google aur partner ad networks cookies (jaise DoubleClick / DART cookie), web beacons, aur identifiers use karte hain. Android par AdMob SDK ad delivery, frequency capping, aur fraud prevention ke liye Android Advertising ID (AAID), app interaction events, aur diagnostic signals process kar sakta hai.",
      s2P2: "Regulated regions (jaise EEA aur UK) mein personalized ads dikhane se pehle humara mobile app Google UMP (User Messaging Platform) Consent SDK ke zariye clear privacy choices dialog dikhata hai jahan aap apni consent kabhi bhi manage ya withdraw kar sakte hain.",
      s2BoxTitle: "Advertising Transparency, AAID Controls aur Opt-Out Portals:",
      s2BoxIntro:
        "Google ki advertising cookies (DART cookie samet) aapki visits ke base par ads dikhane mein madad karti hain. Aap kabhi bhi personalized ads band kar sakte hain, AAID reset kar sakte hain, ya cookie preferences manage kar sakte hain:",
      s2AndroidAaid: {
        label: "Android Advertising ID (AAID) Opt-Out / Reset:",
        text: "Apne Android phone mein Settings -> Google -> Ads (ya Settings -> Privacy -> Ads) kholkar Advertising ID reset karein ya Ads Personalization opt-out karein.",
      },
      s2Portals: OPT_OUT_PORTALS,
      s2Quality: {
        label: "Ad Traffic & Quality Protection:",
        text: "Automated bots, click-farms, baar-baar manual ad clicks, ad-block tampering, ya proxy manipulation sakhti se mana hai aur filter kiya jata hai.",
      },
      s3Header: "3. Right to Erasure / Account & Data Deletion (Google Play & Global Standards)",
      s3Intro:
        "GDPR, CCPA/CPRA, DPDP aur Google Play Store Data Safety Guidelines ke tahat har player ko apna account, game records, aur telemetry data hamesha ke liye delete karne ka poora haq hai.",
      s3BoxTitle: "Account & Data Deletion ke Tarike:",
      s3InApp: {
        label: "Seedha App ke Andar (Instant Self-Service):",
        text: 'Settings kholein -> SUPPORT & INFO section mein jaayein -> "Delete Account & Data" par click karein. Isse turant aapka Firestore cloud profile, presence documents, active multiplayer player documents, FCM tokens, aur device ka localStorage / sessionStorage cache hamesha ke liye erase ho jata hai aur auth session revoke ho jata hai.',
      },
      s3Email: {
        label: "Web & Email Request (Alternative Channel):",
        text: "Agar aap app access nahi kar paa rahe hain ya app uninstall kar diya hai, toh sudokutogethermode@gmail.com par deletion request bhejein (email ya template copy karne ke liye Contact Support page use karein). Apna player display name ya email batayein; 24 se 48 business hours mein deletion confirm kar diya jayega.",
      },
      s3RightsIntro: "EEA, UK aur global users ke liye additional statutory rights:",
      s3RightsBullets: [
        {
          label: "Right of Access:",
          text: "Apne stored player aur leaderboard records ki copy mangne ka haq.",
        },
        {
          label: "Right to Rectification:",
          text: "App ke andar kabhi bhi apna player display nickname update karne ka haq.",
        },
        {
          label: "Right to Restriction & Data Portability:",
          text: "Data processing par limit lagane ya match telemetry export mangne ka haq.",
        },
      ],
      s4Header: "4. California Privacy Rights (CCPA / CPRA)",
      s4Text:
        "CCPA/CPRA ke tahat California residents ko jaanne ka haq hai ki kaunsa data collect hota hai aur woh deletion request kar sakte hain. Hum aapki personal information kabhi kisi third party ko paise ya commercial faayde ke liye bechte (sell) ya share nahi karte.",
      s5Header: "5. Children's Privacy Protection (COPPA)",
      s5Text:
        "Bacchon ki privacy hamare liye bahut zaroori hai. SudokuSync 13 saal se kam (ya EEA/UK mein 16 saal se kam) bacchon se jaan-bujhkar koi personal information collect nahi karta. Khelne ke liye real name, ghar ka pata, ya phone number zaroori nahi hai. Agar kisi parent ko lage ki unke bacche ne koi personal info submit kar di hai, toh turant sudokutogethermode@gmail.com par sampark karein — hum turant woh records hata denge.",
      s6Header: "6. Data Retention & Security Controls",
      s6Text:
        "30 din se purane multiplayer challenge match records hamare databases se automatically delete ho jate hain. Sabhi client-to-server traffic TLS/HTTPS encryption se surakshit rehta hai aur strict Firestore security rules unauthorized tampering rokte hain.",
      s7Header: "7. Contact Us",
      s7Intro:
        "Is Privacy Policy ya data handling se jude kisi bhi sawal ke liye hamare Data Protection desk se sampark karein:",
      s7TurnaroundLabel: "Response Turnaround:",
      s7TurnaroundValue: "24 se 48 business hours ke andar.",
    },
    terms: {
      title: "Terms of Service",
      intro:
        "SudokuSync (https://sudokusync.com ya official Android application) ko access karne, install karne, ya khelne se aap in Terms of Service aur sabhi laagu kanoono ko maante hain. Agar aap in sharton se sahmat nahi hain, toh is application ka upyog na karein.",
      s1Header: "1. Description of Service & Free Access",
      s1Text:
        'SudokuSync free digital Sudoku puzzles, deterministic seeded multiplayer rooms, real-time leaderboards, aur logic training tools provide karta hai. Yeh service "AS IS" aur "AS AVAILABLE" basis par di jati hai. Hum bina poorv soochana ke features badalne ya update karne ka adhikar rakhte hain.',
      s2Header: "2. Fair Play, Anti-Cheat & Community Standards",
      s2Intro:
        "SudokuSync ek imaandar aur skill-based puzzle platform banaye rakhne ke liye pratibaddh hai. Single-player leaderboards aur multiplayer duels mein fair play banaye rakhne ke liye aap in niyamon ka palan karenge:",
      s2BoxTitle: "Fair Play & Anti-Cheat Policy:",
      s2Bullets: [
        {
          label: "No Automated Bots or Solvers:",
          text: "Puzzle solve karne ya gameplay simulate karne ke liye bots, solver scripts, auto-clickers, ya headless browsers use karna mana hai.",
        },
        {
          label: "No Client Tampering or Memory Injection:",
          text: "Client code modify karna, debugging scripts inject karna, ya runtime memory badalkar solve time fast dikhana mana hai.",
        },
        {
          label: "No Network or API Manipulation:",
          text: "Sync packets intercept/forge karna, matchmaking manipulate karna, ya fake match results bhejna sakht mana hai.",
        },
        {
          label: "Appropriate Player Nicknames:",
          text: "Ashleel, apmanjanak, ya galat display names allow nahi hain. Sabhi profiles par profanity filter aur alphanumeric checks lagte hain.",
        },
        {
          label: "Zero Ad-Fraud:",
          text: "Ads par automated, nakli, ya dhokhadhadi wale clicks karna poori tarah mana hai.",
        },
      ],
      s2Penalty: {
        label: "Penalties for Violation:",
        text: "Kisi bhi cheat script, tampering, ya rule todne par aapke solve times turant disqualify kar diye jayenge, leaderboards se naam hata diya jayega, aur profile/device access suspend ya ban ho sakta hai.",
      },
      s3Header: "3. Cloud Account & Synchronization Usage",
      s3Intro:
        "Players Guest mode mein khel sakte hain ya behtar continuity ke liye apna Google Account link kar sakte hain:",
      s3Bullets: [
        {
          label: "Cross-Device Synchronization:",
          text: "Google Account link karne se aapke stats, solve history, best times, preferences, aur saved games web aur Android devices ke beech safely sync hote hain.",
        },
        {
          label: "Account Confidentiality & Responsibility:",
          text: "Apne Google account credentials ki suraksha ki zimmedari aapki hai. Aapke session se hone wali sabhi activities ke liye aap khud zimmedar hain.",
        },
        {
          label: "Personal, Non-Commercial Use:",
          text: "Cloud sync sirf personal entertainment aur brain training ke liye hai. Commercial misuse ya fake accounts banana mana hai.",
        },
        {
          label: "Service Availability & Termination:",
          text: "Cloud sync best-effort basis par chalta hai. Abuse, tampering, ya rules todne par hum sync access suspend ya revoke kar sakte hain.",
        },
        {
          label: "Self-Service Account & Data Deletion:",
          text: 'Aap kabhi bhi Settings -> Support & Info -> "Delete Account & Data" dabakar apna cloud profile, match records, push tokens, aur local cache turant delete kar sakte hain, ya sudokutogethermode@gmail.com par likhit request bhej sakte hain.',
        },
      ],
      s4Header: "4. Intellectual Property Rights",
      s4Text:
        "Sabhi puzzle logic engines, procedural sound synthesis code, UI designs, Scrapbook Design System tokens, graphics, logos, aur software code SudokuSync ki intellectual property hain aur copyright kanoon se surakshit hain.",
      s5Header: "5. Third-Party Advertisements (AdSense & AdMob)",
      s5Text:
        "App ko free rakhne ke liye Web par Google AdSense aur Android par Google AdMob SDK (jismein applicable regions mein Google UMP consent ke saath interstitial ya rewarded ads shamil ho sakte hain) use hota hai. Third-party ads ya external links ke content ke liye hum zimmedar nahi hain.",
      s6Header: "6. Disclaimer of Warranties & Limitation of Liability",
      s6Text:
        "SudokuSync ka software aur material 'as is' basis par diya jata hai. Hum kisi prakar ki warranty nahi dete aur game use karne ya na kar paane se hone wale kisi bhi data/profit loss ke liye developer zimmedar nahi hoga.",
      s7Header: "7. Account Deletion & Termination",
      s7Text:
        'Aap kabhi bhi app use karna band kar sakte hain aur Settings mein "Delete Account & Data" se saara data turant mita sakte hain. Terms todne par nicknames ya access hatane ka adhikar humare paas surakshit hai.',
      s8Header: "8. Contact Us",
      s8Intro: "In Terms of Service se jude kisi bhi sawal ya legal notice ke liye humein sampark karein:",
      s8TurnaroundLabel: "Response Turnaround:",
      s8TurnaroundValue: "24 se 48 business hours ke andar.",
    },
    contactComposer: {
      sectionLabel: "Support Message Composer",
      helperText:
        "Topic chunein, apna message customize karein aur seedhe copy karein — koi blank mail popup window nahi khulegi.",
      subjectLabel: "Subject",
      messageLabel: "Message Template",
      copyMessageBtn: "Message Copy Karein",
      messageCopiedBtn: "Message Copy Ho Gaya",
      copyEmailBtn: "Email Copy Karein",
      emailCopiedBtn: "Email Copy Ho Gaya",
      openPrivacyBtn: "Privacy & Ad/UMP Opt-Out Kholen",
      openDeleteSettingsBtn: "Settings -> Delete Account & Data Par Jaayein",
      topics: {
        bug: {
          label: "Bug Report",
          subject: "SudokuSync Bug Report (v1.0.3)",
          body: "App Version: v1.0.3\nPlatform (Web / Android): \nScreen ya Feature: \nIssue Kaise Hua: \nKya Hona Chahiye Tha vs Kya Hua: ",
        },
        privacy: {
          label: "Privacy / UMP Consent",
          subject: "SudokuSync Privacy & UMP Consent Inquiry (v1.0.3)",
          body: "App Version: v1.0.3\nPlatform (Web / Android): \nTopic (GDPR / CCPA / AdSense / AdMob AAID / UMP Consent): \nApni Request Likhein: ",
        },
        deletion: {
          label: "Account & Data Deletion",
          subject: "SudokuSync Account & Data Deletion Request (v1.0.3)",
          body: "App Version: v1.0.3\nPlayer Display Name / Email: \nRequest: Kripya mera SudokuSync Firestore profile, leaderboard/match records, aur push notification tokens hamesha ke liye delete karein.",
        },
      },
    },
    about: {
      publisherBadge: "Mo Logic dwara prakashit",
      publisherHeader: "Independent Puzzle Studio aur Quality Standards",
      publisherText:
        "SudokuSync ko Mo Logic ne Web (https://sudokusync.com) aur Google Play Android (com.mologic.sudokusync) ke liye banaya aur publish kiya hai. Har puzzle, diagram aur guide ko saaf borderless pastel UI, Light/Dark modes, offline support aur transparent muft access ke saath tayyar kiya gaya hai.",
      engineHeader: "Deterministic 9x9 Puzzle Engine aur Verified Clues",
      engineIntro:
        "Har classic 9x9 board humare seeded Mulberry32 PRNG generator se banta hai aur human-logic difficulty engine tatha bitmask MRV solver se check hota hai taaki har puzzle ka sirf ek hi sahi solution ho:",
      difficultySpecs: [
        {
          level: "EASY",
          label: "Easy",
          cluesBadge: "51 Clues",
          summary: "Aasan row, column aur 3x3 box Singles ke saath smooth warm-up solving.",
        },
        {
          level: "MEDIUM",
          label: "Medium",
          cluesBadge: "39 Clues",
          summary: "Intersecting rows, columns aur boxes mein balanced logical deductions.",
        },
        {
          level: "HARD",
          label: "Hard",
          cluesBadge: "30 Clues",
          summary: "Pairs, pointing patterns aur candidate notes — Auto-Notes option ke saath.",
        },
        {
          level: "EXPERT",
          label: "Expert",
          cluesBadge: "25 Clues",
          summary: "Gehre candidate elimination chains, X-Wing patterns aur kam clues.",
        },
      ],
      multiplayerHeader: "Same-Board Live aur Asynchronous Multiplayer",
      multiplayerText:
        "6-digit Room Codes, optional PIN lock, aur direct ?room= share links ke zariye Web aur Android par doston ke saath bilkul ek hi 9x9 grid par live ya async duel khelein. Google Sign-In ke saath aapke stats, persistent Friends aur Recent Players cloud mein sync rehte hain, aur Ghost Mode kabhi bhi on/off ho sakta hai.",
      assistantsText:
        "Board par 7 Smart Assistants milte hain: Highlight Identical Numbers, Show Remaining Numbers, Highlight Related Area, Auto-Switch Completed Numbers, Auto-Remove Notes, Auto-Notes (sirf Hard/Expert), aur Fast Fill (Number-First).",
      exploreHeader: "Rules, Tools aur Support Dekhein",
      exploreRulesLabel: "Rules & Strategies Hub",
      exploreSolverLabel: "Interactive Sudoku Solver",
      exploreDailyLabel: "Daily Challenge",
      exploreContactLabel: "Contact & Privacy Support",
    },
  },

  de: {
    metaLine: "Gueltig ab: 12. August 2026 | Version: 1.0.3 | Plattform: Web & Android App",
    privacy: {
      title: "Datenschutzerklaerung",
      intro:
        "Bei SudokuSync (https://sudokusync.com und unsere offizielle Android-App) hat der Schutz deiner Daten hoechste Prioritaet. Diese Datenschutzerklaerung erlaeutert ausfuehrlich, welche Informationen erfasst, gespeichert und verarbeitet werden und wie wir globale Standards einhalten, darunter DSGVO (GDPR), CCPA/CPRA, COPPA, Google Play Data Safety, Google AdSense und Google AdMob.",
      s1Header: "1. Datenerhebung & Speicherarchitektur",
      s1Intro:
        "Wir arbeiten nach strenger Datensparsamkeit und trennen strikt zwischen rein lokalen Geraetedaten und Cloud-Datenbankeintraegen:",
      s1LocalStorage: {
        label: "Lokaler Speicher (nur Browser & Geraet):",
        text: "Standard-localStorage wird ausschliesslich lokal auf deinem Geraet genutzt, um Einstellungen (Dark Mode, Sounds, Haptik), Fehlerlimits, Timer-Anzeige, aktive Notizen und gespeicherte Einzelspieler-Partien zu sichern. Diese Daten verlassen dein Geraet nicht fuer Marketingzwecke.",
      },
      s1Firestore: {
        label: "Google Cloud Firestore (Multiplayer & Bestenlisten):",
        intro: "Bei Multiplayer-Duellen oder Bestenlisten werden nur folgende nicht-sensible Spielparameter gespeichert:",
        bullets: [
          "Anonyme Challenge-ID, Seed-Nummer und Schwierigkeitsgrad.",
          "Spieler-Spitzname (alphanumerisch gewaehlt) und Benutzer-ID.",
          "Match-Leistungswerte: Loesungszeit (Sekunden), Fehleranzahl und Sieg/Niederlage.",
        ],
      },
      s1Fcm: {
        label: "Firebase Cloud Messaging (FCM) & Geraetekennungen:",
        text: "Bei erteilter Benachrichtigungserlaubnis wird ein anonymer FCM-Token samt anonymer Geraete-ID erstellt, um Echtzeit-Einladungen, Duell-Alarme und Match-Updates zuzustellen. Push-Tokens werden niemals fuer Tracking ueber Apps hinweg, Fingerprinting oder Werbung genutzt.",
        controlLabel: "Kontrolle & Widerruf:",
        controlText:
          'Du kannst Benachrichtigungen jederzeit in den In-App-Einstellungen unter Einstellungen -> "Push-Benachrichtigungen" sowie in den System- oder Browsereinstellungen aktivieren oder deaktivieren.',
      },
      s1Auth: {
        label: "Firebase Authentication & Cloud-Sync (Optional):",
        text: "Bei Anmeldung mit Google ueber Firebase Authentication (Google OAuth) erhalten wir grundlegende Profildaten (Anzeigename, E-Mail-Adresse, eindeutige User-ID) ausschliesslich zur Sitzungsauthentifizierung und geraeteuebergreifenden Synchronisierung von Statistiken und Spielstaenden. Anonyme Gast-Sitzungen laufen in einem physisch isolierten lokalen Vault ohne Schreibzugriff auf private Nutzerprofile. Passwoerter, Kontakte, Dateien oder Finanzdaten werden niemals erhoben oder an Werbetreibende verkauft.",
      },
      s1ServerLogs: {
        label: "Infrastruktur- & Diagnose-Serverlogs:",
        text: "Standard-Webserverlogs (IP-Adresse, Browser User-Agent, Zeitstempel, Rate-Limiting) werden von Google Firebase Hosting und unserem Express-Server ausschliesslich zur Betriebssicherheit und DDoS-Abwehr verarbeitet.",
      },
      s2Header: "2. Werbung, Google AdSense, AdMob SDK, AAID & Google UMP-Einwilligung",
      s2P1: "Um SudokuSync kostenlos anzubieten, nutzen wir Google AdSense im Web und das Google AdMob SDK in der Android-App. Im Web verwenden Google und Werbepartner Cookies (inklusive DoubleClick-/DART-Cookie) und Web-Beacons. Auf Android kann das AdMob SDK die Android Advertising ID (AAID), App-Interaktionen und Diagnosesignale fuer Anzeigenauslieferung, Frequency Capping und Betrugsabwehr verarbeiten.",
      s2P2: "Vor personalisierter Werbung in regulierten Regionen (einschliesslich EWR und UK) zeigt unsere Android-App ueber das Google UMP (User Messaging Platform) Consent SDK einen Einwilligungsdialog an, ueber den du deine Zustimmung jederzeit gewaehren, anpassen oder widerrufen kannst.",
      s2BoxTitle: "Werbetransparenz, AAID-Kontrolle & Opt-Out-Portale:",
      s2BoxIntro:
        "Du kannst personalisierte Werbung jederzeit deaktivieren, deine mobile Werbe-ID zuruecksetzen oder Cookie-Praeferenzen verwalten:",
      s2AndroidAaid: {
        label: "Android Advertising ID (AAID) Opt-Out / Reset:",
        text: "Oeffne auf Android Einstellungen -> Google -> Anzeigen (oder Einstellungen -> Datenschutz -> Anzeigen), um deine Werbe-ID zurueckzusetzen oder personalisierte Werbung zu deaktivieren.",
      },
      s2Portals: OPT_OUT_PORTALS,
      s2Quality: {
        label: "Schutz der Anzeigenqualitaet:",
        text: "Automatisierte Bots, Klickfarmen, wiederholte manuelle Anzeigenklicks oder Proxy-Manipulationen sind streng untersagt.",
      },
      s3Header: "3. Recht auf Loeschung / Konto- & Datenloeschung (Google Play & Globale Standards)",
      s3Intro:
        "Nach DSGVO, CCPA/CPRA, DPDP sowie den Google Play Data Safety-Richtlinien hast du das uneingeschraenkte Recht auf dauerhafte Loeschung deines Kontos und aller zugehoerigen Spieldaten.",
      s3BoxTitle: "Methoden zur Konto- & Datenloeschung:",
      s3InApp: {
        label: "Direkt in der App (Sofort-Selbstbedienung):",
        text: 'Oeffne Einstellungen -> SUPPORT & INFO -> "Konto & Daten loeschen". Dadurch werden dein Firestore-Profil, Presence-Dokumente, aktive Raum-Eintraege, gespeicherte FCM-Tokens sowie lokaler localStorage/sessionStorage sofort geloescht und die Sitzung beendet.',
      },
      s3Email: {
        label: "Web- & E-Mail-Anfrage (Alternativer Weg):",
        text: "Falls du keinen App-Zugriff hast, sende eine Loeschanfrage an sudokutogethermode@gmail.com mit deinem Spielernamen oder deiner E-Mail-Adresse. Bearbeitung und Bestaetigung erfolgen innerhalb von 24 bis 48 Geschaeftsstunden.",
      },
      s3RightsIntro: "Weitere gesetzliche Rechte im EWR, Vereinigten Koenigreich und weltweit:",
      s3RightsBullets: [
        { label: "Auskunftsrecht:", text: "Kopie deiner gespeicherten Spieler- und Bestenlistendaten anfordern." },
        { label: "Recht auf Berichtigung:", text: "Deinen Spielernamen jederzeit in der App aendern." },
        { label: "Einschraenkung & Datenuebertragbarkeit:", text: "Einschraenkung der Verarbeitung oder Export deiner Match-Telemetrie verlangen." },
      ],
      s4Header: "4. Datenschutzrechte in Kalifornien (CCPA / CPRA)",
      s4Text:
        "Nach CCPA/CPRA haben Einwohner Kaliforniens Anspruch auf Auskunft und Loeschung. Wir verkaufen oder teilen deine personenbezogenen Daten NICHT gegen Geld oder kommerzielle Gegenleistung an Dritte.",
      s5Header: "5. Schutz von Kindern (COPPA)",
      s5Text:
        "SudokuSync erfasst wissentlich keine personenbezogenen Daten von Kindern unter 13 Jahren (bzw. unter 16 im EWR/UK). Fuer das Spiel sind weder Klarnamen noch Adressen oder Telefonnummern erforderlich. Eltern koennen uns bei Bedenken sofort unter sudokutogethermode@gmail.com kontaktieren, damit Eintraege umgehend geloescht werden.",
      s6Header: "6. Aufbewahrungsfristen & Sicherheitskontrollen",
      s6Text:
        "Multiplayer-Matchdatensaetze aelter als 30 Tage werden automatisch geloescht. Jeglicher Datenverkehr ist per TLS/HTTPS verschluesselt, und strenge Firestore-Sicherheitsregeln erzwingen Eigentumsrechte auf Dokumentebene.",
      s7Header: "7. Kontakt",
      s7Intro: "Bei Fragen zu dieser Datenschutzerklaerung wende dich bitte an unser Datenschutzteam:",
      s7TurnaroundLabel: "Antwortzeit:",
      s7TurnaroundValue: "Innerhalb von 24 bis 48 Geschaeftsstunden.",
    },
    terms: {
      title: "Nutzungsbedingungen",
      intro:
        "Durch den Zugriff, die Installation oder das Spielen von SudokuSync (https://sudokusync.com oder offizielle Android-App) erkennst du diese Nutzungsbedingungen sowie alle geltenden Gesetze verbindlich an.",
      s1Header: "1. Leistungsbeschreibung & Kostenloser Zugang",
      s1Text:
        'SudokuSync bietet kostenlose digitale Sudoku-Raetsel, deterministische Multiplayer-Raeume, Echtzeit-Bestenlisten und Logikwerkzeuge auf "AS IS"- und "AS AVAILABLE"-Basis. Wir behalten uns das Recht vor, Funktionen jederzeit anzupassen oder einzustellen.',
      s2Header: "2. Fair Play, Anti-Cheat & Community-Standards",
      s2Intro:
        "SudokuSync steht fuer ein faires, leistungsorientiertes Raetselumfeld. Alle Spieler verpflichten sich zu folgenden Fair-Play-Regeln:",
      s2BoxTitle: "Fair-Play- & Anti-Cheat-Richtlinie:",
      s2Bullets: [
        { label: "Keine Bots oder automatischen Solver:", text: "Bots, Solver-Skripte, Auto-Clicker oder Headless-Browser sind verboten." },
        { label: "Keine Client- oder Speichermanipulation:", text: "Code-Modifikationen, Script-Injektionen oder Speicherveraenderungen zur Zeitmanipulation sind untersagt." },
        { label: "Keine Netzwerk- oder API-Manipulation:", text: "Abfangen, Faelschungen oder Fluten von Sync-Paketen sowie Match-Manipulation sind verboten." },
        { label: "Angemessene Spielernamen:", text: "Beleidigende oder missbraeuchliche Namen sind untersagt; automatische Filter pruefen alle Profile." },
        { label: "Kein Anzeigenbetrug:", text: "Automatisierte oder taeuschende Klicks auf Werbung sind streng verboten." },
      ],
      s2Penalty: {
        label: "Sanktionen bei Verstoessen:",
        text: "Bei Erkennung von Cheats oder Manipulation werden Zeiten disqualifiziert, Bestenlisten-Eintraege geloescht und Konten/Geraete gesperrt.",
      },
      s3Header: "3. Cloud-Konto & Synchronisierung",
      s3Intro: "Du kannst als Gast spielen oder optional dein Google-Konto verknuepfen:",
      s3Bullets: [
        { label: "Geraeteuebergreifende Synchronisierung:", text: "Sichert Statistiken, Loesungsverlauf, Bestzeiten, Einstellungen und gespeicherte Partien ueber Web und Android." },
        { label: "Vertraulichkeit:", text: "Du bist fuer die Sicherheit deiner Google-Zugangsdaten und alle Aktivitaeten in deiner Sitzung selbst verantwortlich." },
        { label: "Persoenliche, nicht-kommerzielle Nutzung:", text: "Nur fuer private Unterhaltung und Logiktraining; kommerzieller Missbrauch ist untersagt." },
        { label: "Verfuegbarkeit & Beendigung:", text: "Bereitstellung nach Best-Effort-Prinzip; bei Missbrauch kann der Zugang gesperrt werden." },
        { label: "Selbststaendige Kontoloeschung:", text: 'Jederzeit direkt unter Einstellungen -> Support & Info -> "Konto & Daten loeschen" oder per Anfrage an sudokutogethermode@gmail.com.' },
      ],
      s4Header: "4. Geistiges Eigentum",
      s4Text:
        "Alle Spiel-Engines, prozedurale Audio-Synthese, UI-Designs, Scrapbook Design System-Tokens, Grafiken, Logos und Quellcodes sind geistiges Eigentum von SudokuSync.",
      s5Header: "5. Werbung Dritter (AdSense & AdMob)",
      s5Text:
        "Die Finanzierung erfolgt ueber Google AdSense (Web) und das Google AdMob SDK (Android, inklusive optionaler Interstitial-/Rewarded-Ads vorbehaltlich Google UMP-Einwilligung). Fuer Inhalte externer Werbetreibender uebernehmen wir keine Haftung.",
      s6Header: "6. Gewaehrleistungs- & Haftungsausschluss",
      s6Text:
        "Die Software wird ohne Mangelgewaehr ('as is') bereitgestellt. SudokuSync schliesst jede ausdrueckliche oder stillschweigende Haftung fuer Datenverluste, entgangenen Gewinn oder Nutzungsausfaelle aus, soweit gesetzlich zulaessig.",
      s7Header: "7. Kontoloeschung & Kuendigung",
      s7Text:
        'Du kannst die Nutzung jederzeit beenden und ueber "Konto & Daten loeschen" in den Einstellungen saemtliche Cloud- und Lokaldaten sofort entfernen. Bei Verstoessen behalten wir uns Profil- und Zugangsperrungen vor.',
      s8Header: "8. Kontakt",
      s8Intro: "Bei rechtlichen Fragen zu diesen Nutzungsbedingungen kontaktiere uns bitte:",
      s8TurnaroundLabel: "Antwortzeit:",
      s8TurnaroundValue: "Innerhalb von 24 bis 48 Geschaeftsstunden.",
    },
    contactComposer: {
      sectionLabel: "Support-Nachrichten-Vorlage",
      helperText:
        "Waehle ein Thema, passe die Nachricht bei Bedarf an und kopiere den gesamten Text oder die E-Mail-Adresse ohne leere Mail-Popups.",
      subjectLabel: "Betreff",
      messageLabel: "Nachrichtenvorlage",
      copyMessageBtn: "Nachricht kopieren",
      messageCopiedBtn: "Nachricht kopiert",
      copyEmailBtn: "E-Mail kopieren",
      emailCopiedBtn: "E-Mail kopiert",
      openPrivacyBtn: "Datenschutz & UMP-Opt-Out oeffnen",
      openDeleteSettingsBtn: "Zu Einstellungen -> Konto & Daten loeschen",
      topics: {
        bug: {
          label: "Fehlerbericht",
          subject: "SudokuSync Bug Report (v1.0.3)",
          body: "App-Version: v1.0.3\nPlattform (Web / Android): \nBereich / Bildschirm: \nSchritte zur Reproduktion: \nErwartet vs. Tatsaechlich: ",
        },
        privacy: {
          label: "Datenschutz / UMP",
          subject: "SudokuSync Privacy & UMP Consent Inquiry (v1.0.3)",
          body: "App-Version: v1.0.3\nPlattform (Web / Android): \nThema (DSGVO / CCPA / AdSense / AdMob AAID / UMP): \nAnliegen: ",
        },
        deletion: {
          label: "Konto & Daten loeschen",
          subject: "SudokuSync Account & Data Deletion Request (v1.0.3)",
          body: "App-Version: v1.0.3\nSpielername / E-Mail: \nAnfrage: Bitte loescht mein SudokuSync-Firestore-Profil, Bestenlisten- und Match-Daten sowie Push-Tokens dauerhaft.",
        },
      },
    },
    about: {
      publisherBadge: "Veroeffentlicht von Mo Logic",
      publisherHeader: "Unabhaengiges Puzzle-Studio & Qualitaetsstandards",
      publisherText:
        "SudokuSync wird unabhaengig von Mo Logic fuer das Web (https://sudokusync.com) und Google Play Android (com.mologic.sudokusync) entwickelt. Jedes Raetsel und jeder Leitfaden setzt auf eine ruhige, randlose Pastell-Oberflaeche mit Hell-/Dunkelmodus, Offline-Speicher und transparentem kostenlosem Zugang.",
      engineHeader: "Deterministische 9x9-Engine & Verifizierte Hinweise",
      engineIntro:
        "Jedes klassische 9x9-Brett wird per Mulberry32-PRNG erzeugt und durch unsere Human-Logic-Bewertung sowie Bitmask-MRV-Verifikation auf genau eine eindeutige Loesung geprueft:",
      difficultySpecs: [
        {
          level: "EASY",
          label: "Leicht",
          cluesBadge: "51 Hinweise",
          summary: "Klarer Einstieg ueber Zeilen-, Spalten- und 3x3-Block-Singles.",
        },
        {
          level: "MEDIUM",
          label: "Mittel",
          cluesBadge: "39 Hinweise",
          summary: "Ausgewogene logische Kombinationen ueber sich kreuzende Einheiten.",
        },
        {
          level: "HARD",
          label: "Schwer",
          cluesBadge: "30 Hinweise",
          summary: "Paare, Pointing-Muster und strukturierte Notizen mit Auto-Notizen.",
        },
        {
          level: "EXPERT",
          label: "Experte",
          cluesBadge: "25 Hinweise",
          summary: "Tiefe Kandidatenketten, X-Wing-Techniken und wenige Startziffern.",
        },
      ],
      multiplayerHeader: "Same-Board Live- & Async-Mehrspielermodus",
      multiplayerText:
        "Spiele live oder asynchron auf exakt demselben 9x9-Seed per 6-stelligem Raumcode, optionaler PIN-Sperre und direktem ?room=-Link. Mit Google-Anmeldung synchronisierst du Statistiken, gespeicherte Freunde neben den letzten Mitspielern und den Geistmodus plattformuebergreifend.",
      assistantsText:
        "Sieben verifizierte Smart-Assistenten unterstuetzen dein Spiel: Gleiche Zahlen markieren, Verbleibende Zahlen anzeigen, Zugehoerige Bereiche markieren, Vollstaendige Zahlen automatisch wechseln, Notizen automatisch entfernen, Auto-Notizen (nur Schwer/Experte) und Schnelleingabe.",
      exploreHeader: "Regeln, Werkzeuge & Kontakt entdecken",
      exploreRulesLabel: "Regeln & Strategien",
      exploreSolverLabel: "Interaktiver Sudoku-Loeser",
      exploreDailyLabel: "Tages-Challenge",
      exploreContactLabel: "Kontakt & Datenschutz",
    },
  },

  ja: {
    metaLine: "施行日: 2026年8月12日 | バージョン: 1.0.3 | 対象: Web・Androidアプリ",
    privacy: {
      title: "プライバシーポリシー",
      intro:
        "SudokuSync（https://sudokusync.com および公式Androidアプリ）では、プレイヤーのプライバシー保護を最重要事項としています。本ポリシーでは、収集・保存・処理される情報の種類、および GDPR、CCPA/CPRA、COPPA、Google Play データセーフティ、Google AdSense、Google AdMob ポリシーの遵守について詳しく説明します。",
      s1Header: "1. 情報収集とデータ保存アーキテクチャ",
      s1Intro: "当社は厳格なデータ最小化原則に基づき、端末内データとクラウド記録を明確に分離しています。",
      s1LocalStorage: {
        label: "クライアント側ローカル保存（ブラウザ・端末のみ）：",
        text: "標準的な localStorage は、UI設定（ダークモード、効果音、触覚）、ミス上限、タイマー表示、メモ、保存済みソロゲームの保持のみに使用され、外部マーケティング業者へ販売・送信されることはありません。",
      },
      s1Firestore: {
        label: "Google Cloud Firestore（リアルタイム対戦・ランキング）：",
        intro: "マルチプレイヤー対戦やグローバルマッチに参加した際、以下の非機密ゲームデータのみが保存されます：",
        bullets: [
          "匿名のチャレンジID、シード番号、難易度。",
          "プレイヤー表示名（ユーザー指定の英数字）およびユーザーID。",
          "成績指標：クリア時間（秒）、ミス回数、勝敗ステータス。",
        ],
      },
      s1Fcm: {
        label: "Firebase Cloud Messaging (FCM) および端末識別子：",
        text: "通知が許可された場合、招待や対戦通知を配信するためだけに匿名のFCMトークンおよび匿名デバイスIDが生成されます。クロスアプリ追跡や広告プロファイリングには一切使用されません。",
        controlLabel: "管理・解除方法：",
        controlText: "アプリ内の 設定 -> 「プッシュ通知」 またはOS・ブラウザのアプリ設定からいつでもオン/オフを切り替えられます。",
      },
      s1Auth: {
        label: "Firebase Authentication およびクラウド同期（任意）：",
        text: "Googleサインイン（Firebase Authentication / Google OAuth）を利用する場合、認証と成績同期のためだけに基本プロフィール（表示名、メールアドレス、ユーザーID）を受け取ります。匿名ゲストセッションは物理的に隔離されたローカル保管庫で動作し、ログインなしに個人アカウントへ書き込むことはありません。パスワード、連絡先、端末ファイル、決済情報は収集しません。",
      },
      s1ServerLogs: {
        label: "インフラ・診断用サーバーログ：",
        text: "Google Firebase Hosting および当社サーバーは、DDoS防御やレート制限・セキュリティ維持のみを目的として、標準的なアクセスログ（IPアドレス、User-Agent、タイムスタンプ）を自動処理します。",
      },
      s2Header: "2. 広告配信（Google AdSense / AdMob SDK / AAID / Google UMP同意管理）",
      s2P1: "SudokuSync を無料で提供するため、Webでは Google AdSense、Androidアプリでは Google AdMob SDK を使用しています。WebではCookie（DoubleClick / DART Cookie含む）や識別子が利用され、Androidでは広告配信・フリークエンシー制限・不正防止のために Android広告ID（AAID）、操作イベント、診断シグナルが処理される場合があります。",
      s2P2: "EEA・英国など規制地域でパーソナライズ広告を表示する前には、Google UMP (User Messaging Platform) Consent SDK により明確な同意ダイアログを表示し、いつでも同意の変更・撤回ができるようにしています。",
      s2BoxTitle: "広告の透明性、AAID管理およびオプトアウト窓口：",
      s2BoxIntro: "以下の手順・公式ポータルからパーソナライズ広告の停止や広告IDのリセットが可能です：",
      s2AndroidAaid: {
        label: "Android 広告ID (AAID) のオプトアウト / リセット：",
        text: "Androidの 設定 -> Google -> 広告（または 設定 -> プライバシー -> 広告）から、広告IDのリセットや広告のパーソナライズ解除が行えます。",
      },
      s2Portals: OPT_OUT_PORTALS,
      s2Quality: {
        label: "広告トラフィックと品質保護：",
        text: "自動ボット、クリックファーム、意図的な連続クリック、不正なプロキシ操作などは厳格に禁止・排除されます。",
      },
      s3Header: "3. 削除権・アカウントおよびデータ削除（Google Play・国際基準）",
      s3Intro:
        "GDPR、CCPA/CPRA、DPDP および Google Play データセーフティ指針に基づき、すべてのプレイヤーはアカウントおよび関連データの完全削除を請求できます。",
      s3BoxTitle: "アカウント・データ削除の方法：",
      s3InApp: {
        label: "アプリ内での即時削除：",
        text: "設定 -> サポートと情報 -> 「アカウントとデータを削除」から、Firestoreプロフィール、プレゼンス、対戦ルーム情報、FCMトークン、端末の localStorage/sessionStorage を即時に消去し認証を失効できます。",
      },
      s3Email: {
        label: "Web・メールでの申請（代替手段）：",
        text: "アプリを削除済みなどで操作できない場合は、sudokutogethermode@gmail.com 宛に表示名またはメールアドレスを添えてご連絡ください。24〜48営業時間以内に削除・確認いたします。",
      },
      s3RightsIntro: "EEA・英国および各地域における追加の法的権利：",
      s3RightsBullets: [
        { label: "アクセス権：", text: "保存されているプレイヤーおよびランキング記録の開示請求。" },
        { label: "訂正権：", text: "アプリ内でいつでもプレイヤー表示名を変更可能。" },
        { label: "制限権・データポータビリティ権：", text: "処理制限または対戦テレメトリのエクスポート請求。" },
      ],
      s4Header: "4. カリフォルニア州プライバシー権（CCPA / CPRA）",
      s4Text:
        "CCPA/CPRAに基づき、カリフォルニア州居住者は収集データの開示・削除を請求できます。当社が利用者の個人情報を金銭的対価や商業目的で第三者に販売・共有することは一切ありません。",
      s5Header: "5. 児童のプライバシー保護（COPPA）",
      s5Text:
        "SudokuSync は13歳未満（EEA/UKでは16歳未満）の児童から意図的に個人情報を収集しません。本名・住所・電話番号の登録は不要です。万が一お子様が情報を送信したと思われる場合は sudokutogethermode@gmail.com までご連絡ください。速やかに削除いたします。",
      s6Header: "6. データ保持期間とセキュリティ管理",
      s6Text:
        "30日を超えたマルチプレイヤー対戦記録はデータベースから自動削除されます。すべての通信は TLS/HTTPS で暗号化され、厳格な Firestore セキュリティルールによってデータ改ざんを防いでいます。",
      s7Header: "7. お問い合わせ",
      s7Intro: "本プライバシーポリシーやデータ取扱いに関するご質問はこちらまでご連絡ください：",
      s7TurnaroundLabel: "返信目安：",
      s7TurnaroundValue: "24〜48営業時間以内。",
    },
    terms: {
      title: "利用規約",
      intro:
        "SudokuSync（https://sudokusync.com および公式Androidアプリ）にアクセス、インストール、またはプレイすることで、本利用規約および適用法令に同意したものとみなされます。同意されない場合はご利用をお控えください。",
      s1Header: "1. サービス内容と無料提供",
      s1Text:
        "SudokuSync は無料の数独パズル、決定論的シード対戦ルーム、リアルタイムランキング、ロジック補助機能を提供します。本サービスは現状有姿（「AS IS」「AS AVAILABLE」）で提供され、予告なく機能を変更・終了する場合があります。",
      s2Header: "2. フェアプレイ・不正対策・コミュニティ基準",
      s2Intro: "公平で健全なランキング・対戦環境を守るため、すべてのユーザーは以下の基準に従うものとします：",
      s2BoxTitle: "フェアプレイ・不正防止ポリシー：",
      s2Bullets: [
        { label: "自動ボット・ソルバーの禁止：", text: "自動解答スクリプト、ボット、自動クリッカー、ヘッドレスブラウザの使用禁止。" },
        { label: "クライアント改ざん・メモリ注入の禁止：", text: "コード改変、スクリプト注入、メモリ値の改ざんによるタイム操作の禁止。" },
        { label: "通信・API操作の禁止：", text: "同期パケットの傍受・偽造・大量送信や対戦結果の改ざん禁止。" },
        { label: "適切なニックネーム：", text: "不適切・誹謗中傷を含む表示名は禁止され、自動フィルターが適用されます。" },
        { label: "広告不正の禁止：", text: "広告への自動・不正・虚偽クリックは厳禁です。" },
      ],
      s2Penalty: {
        label: "違反時の措置：",
        text: "不正行為が検出された場合、記録の失格、ランキングからの削除、プロフィールや端末アクセスの停止を行います。",
      },
      s3Header: "3. クラウドアカウントと同期の利用",
      s3Intro: "ゲストプレイのほか、任意でGoogleアカウントを連携してクラウド機能を利用できます：",
      s3Bullets: [
        { label: "端末間同期：", text: "統計、履歴、ベストタイム、設定、保存済みパズルをWeb・Android間で同期します。" },
        { label: "認証情報の管理責任：", text: "Googleアカウントの管理および認証下での操作はユーザー自身の責任となります。" },
        { label: "個人・非商用利用：", text: "個人の娯楽・脳トレ目的に限定され、商業利用や不正な複数アカウント作成は禁止です。" },
        { label: "提供と停止：", text: "同期はベストエフォートで提供され、不正行為時には停止される場合があります。" },
        { label: "セルフサービス削除：", text: "設定 -> サポートと情報 -> 「アカウントとデータを削除」または sudokutogethermode@gmail.com 宛の申請でいつでも全削除できます。" },
      ],
      s4Header: "4. 知的財産権",
      s4Text:
        "すべてのゲームロジック、音声合成コード、UIデザイン、Scrapbook Design System トークン、画像、ロゴ、ソースコードの知的財産権は SudokuSync に帰属します。",
      s5Header: "5. 第三者広告（AdSense & AdMob）",
      s5Text:
        "無料提供のため、Webでは Google AdSense、Androidでは Google AdMob SDK（対象地域での Google UMP 同意に基づくインタースティシャル／リワード広告を含む）を表示します。外部広告主の内容について当社は責任を負いません。",
      s6Header: "6. 保証の否認と責任制限",
      s6Text:
        "本ソフトウェアは現状のまま提供され、明示・黙示を問わず一切の保証を行いません。データ損失や逸失利益を含むいかなる損害についても、開発者は責任を負わないものとします。",
      s7Header: "7. アカウント削除および利用終了",
      s7Text:
        "利用はいつでも終了でき、設定の「アカウントとデータを削除」から全データを即座に削除できます。規約違反時にはアクセス停止を行う権利を有します。",
      s8Header: "8. お問い合わせ",
      s8Intro: "本利用規約に関するお問い合わせ・法的通知はこちらまでお送りください：",
      s8TurnaroundLabel: "返信目安：",
      s8TurnaroundValue: "24〜48営業時間以内。",
    },
    contactComposer: {
      sectionLabel: "サポートメッセージ作成",
      helperText:
        "トピックを選択して本文を編集・コピーできます。空のメールウィンドウが開く心配はありません。",
      subjectLabel: "件名",
      messageLabel: "メッセージテンプレート",
      copyMessageBtn: "メッセージをコピー",
      messageCopiedBtn: "コピーしました",
      copyEmailBtn: "メールアドレスをコピー",
      emailCopiedBtn: "メールをコピーしました",
      openPrivacyBtn: "プライバシー・UMPオプトアウトを開く",
      openDeleteSettingsBtn: "設定 -> アカウントとデータを削除へ",
      topics: {
        bug: {
          label: "不具合報告",
          subject: "SudokuSync Bug Report (v1.0.3)",
          body: "アプリバージョン: v1.0.3\n利用環境 (Web / Android): \n該当画面・機能: \n再現手順: \n期待する動作と実際の動作: ",
        },
        privacy: {
          label: "プライバシー / UMP同意",
          subject: "SudokuSync Privacy & UMP Consent Inquiry (v1.0.3)",
          body: "アプリバージョン: v1.0.3\n利用環境 (Web / Android): \n区分 (GDPR / CCPA / AdSense / AdMob AAID / UMP): \nお問い合わせ内容: ",
        },
        deletion: {
          label: "アカウント・データ削除",
          subject: "SudokuSync Account & Data Deletion Request (v1.0.3)",
          body: "アプリバージョン: v1.0.3\nプレイヤー表示名 / メールアドレス: \n依頼内容: SudokuSync の Firestore プロフィール、対戦・ランキング記録、FCM 通知トークンの完全削除を希望します。",
        },
      },
    },
    about: {
      publisherBadge: "開発・公開: Mo Logic",
      publisherHeader: "独立パズルスタジオと品質方針",
      publisherText:
        "SudokuSync は Mo Logic が Web（https://sudokusync.com）および Google Play Android（com.mologic.sudokusync）向けに独立開発・公開している論理パズルプラットフォームです。ボーダーレスなパステルUI、ライト/ダーク対応、オフライン保存、透明性の高い広告モデルで快適に遊べます。",
      engineHeader: "決定的9x9エンジンと難易度別ヒント数",
      engineIntro:
        "すべてのクラシック9x9盤面は Mulberry32 PRNG により生成され、人間向けロジック評価と MRV ビットマスク検証によって「唯一解」であることが数学的に確認されています。",
      difficultySpecs: [
        {
          level: "EASY",
          label: "初級 (Easy)",
          cluesBadge: "ヒント 51",
          summary: "行・列・3x3ブロックの基本スキャンで気持ちよく解ける入門レベル。",
        },
        {
          level: "MEDIUM",
          label: "中級 (Medium)",
          cluesBadge: "ヒント 39",
          summary: "交差する候補の絞り込みを練習できるバランスの良い難易度。",
        },
        {
          level: "HARD",
          label: "上級 (Hard)",
          cluesBadge: "ヒント 30",
          summary: "ペアやポインティング、上級/達人限定の自動メモを活用する論理勝負。",
        },
        {
          level: "EXPERT",
          label: "達人 (Expert)",
          cluesBadge: "ヒント 25",
          summary: "X-Wing などの連鎖消去が鍵になる最小限の初期配置。",
        },
      ],
      multiplayerHeader: "同盤面ライブ＆非同期マルチプレイ",
      multiplayerText:
        "6桁のルーム番号、任意のPIN保護、?room= 共有リンクを使って、Web と Android の垣根なくまったく同じ9x9盤面でライブまたは非同期対戦が楽しめます。Google ログインで戦績やフレンドリスト、最近のプレイヤー履歴を同期でき、ゴーストモードでオンライン表示も切り替え可能です。",
      assistantsText:
        "同一数字の強調、残り数字の表示、関連エリア強調、完了数字の自動切替、メモの自動削除、自動メモ（上級・達人限定）、ファストフィルの7つのスマートアシストを搭載しています。",
      exploreHeader: "ルール・ツール・サポートを見る",
      exploreRulesLabel: "ルール＆戦略ハブ",
      exploreSolverLabel: "インタラクティブ・ソルバー",
      exploreDailyLabel: "デイリーチャレンジ",
      exploreContactLabel: "お問い合わせ",
    },
  },

  ko: {
    metaLine: "시행일: 2026년 8월 12일 | 버전: 1.0.3 | 플랫폼: 웹 및 Android 앱",
    privacy: {
      title: "개인정보 처리방침",
      intro:
        "SudokuSync(https://sudokusync.com 및 공식 Android 모바일 앱)는 플레이어의 개인정보 보호를 최우선으로 생각합니다. 본 방침은 수집·저장·처리되는 정보 유형과 GDPR, CCPA/CPRA, COPPA, Google Play 데이터 보안 정책, Google AdSense 및 Google AdMob 정책 준수 방식을 상세히 안내합니다.",
      s1Header: "1. 정보 수집 및 데이터 저장 아키텍처",
      s1Intro: "당사는 엄격한 데이터 최소화 원칙을 따르며 기기 내 로컬 저장소와 클라우드 기록을 명확히 구분합니다:",
      s1LocalStorage: {
        label: "클라이언트 로컬 저장소(브라우저 및 기기 전용):",
        text: "표준 브라우저 localStorage는 다크 모드, 사운드, 햅틱, 실수 제한, 타이머 표시, 메모 및 저장된 1인용 게임 등 UI 환경설정 유지를 위해서만 기기 내부에 사용되며 외부 마케팅 업체에 판매되거나 전송되지 않습니다.",
      },
      s1Firestore: {
        label: "Google Cloud Firestore(실시간 멀티플레이어 및 순위표):",
        intro: "멀티플레이어 대전 또는 글로벌 매치 참여 시 다음의 비민감 게임 정보만 저장됩니다:",
        bullets: [
          "익명 챌린지 ID, 시드 번호 및 난이도.",
          "플레이어 닉네임(사용자 지정 영숫자) 및 사용자 ID.",
          "매치 성과 지표: 완료 시간(초), 실수 횟수 및 승패 결과.",
        ],
      },
      s1Fcm: {
        label: "Firebase Cloud Messaging(FCM) 및 기기 식별자:",
        text: "알림 권한을 허용하면 실시간 초대, 대결 알림 및 매치 결과 업데이트 전송을 위해서만 익명 FCM 토큰과 익명 기기 ID가 생성됩니다. 푸시 토큰은 앱 간 추적, 핑거프린팅 또는 광고 목적으로 절대 사용되지 않습니다.",
        controlLabel: "사용자 제어 및 철회:",
        controlText: '설정 -> "푸시 알림" 토글 또는 기기/브라우저 앱 설정에서 언제든 알림을 켜거나 끌 수 있습니다.',
      },
      s1Auth: {
        label: "Firebase Authentication 및 클라우드 동기화(선택 사항):",
        text: "Firebase Authentication(Google OAuth)으로 로그인 시 세션 인증과 통계/저장 상태 기기 간 동기화를 위해서만 기본 프로필 정보(표시 이름, 이메일, 고유 사용자 ID)를 수신합니다. 익명 게스트 세션은 물리적으로 격리된 로컬 보관함에서 실행되며 명시적 로그인 없이 개인 계정에 기록하지 않습니다. 비밀번호, 연락처, 기기 파일, 금융 정보는 일절 수집하지 않습니다.",
      },
      s1ServerLogs: {
        label: "인프라 및 진단 서버 로그:",
        text: "Google Firebase Hosting과 당사 서버는 운영 보안, DDoS 방어 및 요청 제한 무결성 유지를 위해서만 표준 웹 요청 로그(IP 주소, User-Agent, 타임스탬프)를 자동 처리합니다.",
      },
      s2Header: "2. 광고, Google AdSense, AdMob SDK, AAID 및 Google UMP 동의",
      s2P1: "SudokuSync를 무료로 제공하기 위해 웹에서는 Google AdSense, Android 앱에서는 Google AdMob SDK를 사용합니다. 웹에서는 쿠키(DoubleClick / DART 쿠키 포함)와 식별자가 사용되며, Android에서는 광고 게재, 빈도 제한 및 사기 방지를 위해 Android 광고 ID(AAID), 앱 상호작용 이벤트 및 진단 신호가 처리될 수 있습니다.",
      s2P2: "EEA 및 영국 등 규제 지역에서 맞춤형 광고를 게재하기 전에 모바일 앱은 Google UMP(User Messaging Platform) Consent SDK를 통해 명확한 개인정보 선택 창을 표시하여 언제든 동의를 관리하거나 철회할 수 있게 합니다.",
      s2BoxTitle: "광고 투명성, AAID 제어 및 수신 거부 포털:",
      s2BoxIntro: "언제든 맞춤형 광고를 거부하거나 모바일 광고 ID 재설정 및 쿠키 설정을 관리할 수 있습니다:",
      s2AndroidAaid: {
        label: "Android 광고 ID(AAID) 수신 거부 / 재설정:",
        text: "Android 기기에서 설정 -> Google -> 광고(또는 설정 -> 개인정보 보호 -> 광고)로 이동하여 광고 ID를 재설정하거나 광고 맞춤설정을 해제할 수 있습니다.",
      },
      s2Portals: OPT_OUT_PORTALS,
      s2Quality: {
        label: "광고 트래픽 및 품질 보호:",
        text: "자동화 봇, 클릭 팜, 반복적인 수동 광고 클릭, 프록시 조작 등은 엄격히 금지되며 자동 필터링됩니다.",
      },
      s3Header: "3. 삭제권 / 계정 및 데이터 삭제(Google Play 및 글로벌 기준)",
      s3Intro:
        "GDPR, CCPA/CPRA, DPDP 및 Google Play 데이터 보안 가이드라인에 따라 모든 플레이어는 계정 및 관련 데이터의 영구 삭제를 요청할 권리가 있습니다.",
      s3BoxTitle: "계정 및 데이터 삭제 방법:",
      s3InApp: {
        label: "앱 내 즉시 삭제(셀프 서비스):",
        text: '설정 -> 지원 및 정보 -> "계정 및 데이터 삭제"를 누르면 Firestore 클라우드 프로필, 접속 상태, 활성 멀티플레이어 방 문서, 저장된 FCM 토큰, 기기 localStorage/sessionStorage 캐시가 즉시 영구 삭제되고 인증 세션이 해지됩니다.',
      },
      s3Email: {
        label: "웹 및 이메일 요청(대체 경로):",
        text: "앱에 접근할 수 없거나 삭제한 경우 sudokutogethermode@gmail.com 으로 닉네임 또는 이메일과 함께 삭제를 요청해 주세요. 24~48영업시간 이내에 처리 및 안내드립니다.",
      },
      s3RightsIntro: "EEA, 영국 및 전 세계 이용자의 추가 법적 권리:",
      s3RightsBullets: [
        { label: "열람권:", text: "저장된 플레이어 및 순위표 기록 사본 요청." },
        { label: "정정권:", text: "앱 내에서 언제든 플레이어 닉네임 수정 가능." },
        { label: "처리 제한 및 이동권:", text: "처리 제한 또는 매치 텔레메트리 내보내기 요청." },
      ],
      s4Header: "4. 캘리포니아 개인정보 보호 권리(CCPA / CPRA)",
      s4Text:
        "캘리포니아 거주자는 수집 데이터 범주 확인 및 삭제를 요청할 수 있습니다. 당사는 금전적 또는 상업적 대가를 위해 귀하의 개인정보를 제3자에게 판매하거나 공유하지 않습니다.",
      s5Header: "5. 아동 개인정보 보호(COPPA)",
      s5Text:
        "SudokuSync는 만 13세 미만(EEA/UK에서는 만 16세 미만) 아동의 개인정보를 고의로 수집하지 않습니다. 플레이를 위해 실명, 주소, 전화번호를 요구하지 않으며, 아동 정보 제출이 확인될 경우 sudokutogethermode@gmail.com 으로 연락 주시면 즉시 삭제합니다.",
      s6Header: "6. 데이터 보유 기간 및 보안 제어",
      s6Text:
        "30일이 지난 멀티플레이어 매치 기록은 데이터베이스에서 자동 삭제됩니다. 모든 클라이언트-서버 통신은 TLS/HTTPS로 암호화되며 엄격한 Firestore 보안 규칙으로 무단 변조를 차단합니다.",
      s7Header: "7. 문의처",
      s7Intro: "개인정보 처리방침 및 데이터 관리에 대한 문의는 아래로 연락해 주세요:",
      s7TurnaroundLabel: "응답 시간:",
      s7TurnaroundValue: "24~48영업시간 이내.",
    },
    terms: {
      title: "서비스 이용약관",
      intro:
        "SudokuSync(https://sudokusync.com 및 공식 Android 앱)에 접속·설치하거나 플레이함으로써 귀하는 본 이용약관 및 관련 법령을 준수할 것에 동의합니다. 동의하지 않는 경우 앱을 이용할 수 없습니다.",
      s1Header: "1. 서비스 설명 및 무료 제공",
      s1Text:
        'SudokuSync는 무료 디지털 스도쿠 퍼즐, 결정적 시드 멀티플레이어 방, 실시간 순위표 및 논리 훈련 도구를 "있는 그대로(AS IS)" 및 "이용 가능한 범위(AS AVAILABLE)" 기준으로 제공합니다.',
      s2Header: "2. 페어플레이, 부정행위 방지 및 커뮤니티 기준",
      s2Intro: "공정한 경쟁 환경을 유지하기 위해 모든 플레이어는 다음 페어플레이 규칙을 준수해야 합니다:",
      s2BoxTitle: "페어플레이 및 부정행위 방지 정책:",
      s2Bullets: [
        { label: "자동 봇 및 솔버 금지:", text: "퍼즐을 풀거나 플레이를 모방하는 봇, 스크립트, 오토클리커, 헤드리스 브라우저 사용 금지." },
        { label: "클라이언트 변조 및 메모리 조작 금지:", text: "코드 수정, 디버깅 스크립트 삽입, 런타임 메모리 변조로 기록을 조작하는 행위 금지." },
        { label: "네트워크 및 API 조작 금지:", text: "동기화 패킷 가로채기·위조·과부하 전송 및 매치 결과 조작 금지." },
        { label: "건전한 닉네임 사용:", text: "모욕적이거나 부적절한 닉네임은 금지되며 자동 욕설 필터 및 영숫자 검증이 적용됩니다." },
        { label: "광고 부정행위 금지:", text: "자동화되거나 기만적인 광고 클릭 행위는 엄격히 금지됩니다." },
      ],
      s2Penalty: {
        label: "위반 시 제재:",
        text: "부정행위 탐지 시 기록 실격, 공개 순위표 제거 및 프로필·기기 이용 제한 조치가 취해집니다.",
      },
      s3Header: "3. 클라우드 계정 및 동기화 이용",
      s3Intro: "게스트로 플레이하거나 Google 계정을 연결해 확장 기능을 사용할 수 있습니다:",
      s3Bullets: [
        { label: "기기 간 동기화:", text: "통계, 해결 기록, 최고 기록, 설정 및 저장된 퍼즐 상태를 웹과 Android 간 안전하게 동기화합니다." },
        { label: "계정 보안 책임:", text: "Google 계정 보안 유지와 인증 세션에서 발생하는 모든 활동에 대한 책임은 본인에게 있습니다." },
        { label: "개인적·비상업적 이용:", text: "개인 오락 및 두뇌 훈련 목적에 한하며 상업적 악용이나 다중 부정 계정 생성을 금지합니다." },
        { label: "서비스 제공 및 중지:", text: "최선의 노력으로 제공되며 악의적 행위 발견 시 동기화 기능이 제한될 수 있습니다." },
        { label: "셀프 삭제:", text: '설정 -> 지원 및 정보 -> "계정 및 데이터 삭제" 또는 sudokutogethermode@gmail.com 요청을 통해 언제든 완전 삭제할 수 있습니다.' },
      ],
      s4Header: "4. 지식재산권",
      s4Text:
        "모든 게임 로직 엔진, 사운드 합성 코드, UI 디자인, Scrapbook Design System 토큰, 그래픽, 로고 및 소프트웨어 코드는 SudokuSync의 지식재산권으로 보호됩니다.",
      s5Header: "5. 제3자 광고(AdSense 및 AdMob)",
      s5Text:
        "서비스 무료 운영을 위해 웹에서는 Google AdSense, Android에서는 Google AdMob SDK(해당 지역 Google UMP 동의 하에 전면·보상형 광고 포함 가능)가 제공됩니다. 외부 광고주의 콘텐츠에 대해서는 책임지지 않습니다.",
      s6Header: "6. 보증의 부인 및 책임의 제한",
      s6Text:
        "SudokuSync의 자료와 소프트웨어는 '있는 그대로' 제공되며 명시적·묵시적 보증을 부인합니다. 이용 또는 이용 불능으로 인한 데이터 손실 등의 손해에 대해 개발자는 책임을 지지 않습니다.",
      s7Header: "7. 계정 삭제 및 이용 해지",
      s7Text:
        '언제든 앱 사용을 중단하고 설정의 "계정 및 데이터 삭제"로 모든 데이터를 즉시 삭제할 수 있습니다. 약관 위반 시 닉네임 삭제 및 접근 제한 권리를 보유합니다.',
      s8Header: "8. 문의처",
      s8Intro: "이용약관 관련 문의 및 법적 통지는 아래 이메일로 보내주세요:",
      s8TurnaroundLabel: "응답 시간:",
      s8TurnaroundValue: "24~48영업시간 이내.",
    },
    contactComposer: {
      sectionLabel: "지원 메시지 작성기",
      helperText:
        "주제를 선택하고 메시지를 수정·복사한 뒤 지원 이메일로 보내세요. 빈 메일 팝업 창이 열리지 않습니다.",
      subjectLabel: "제목",
      messageLabel: "메시지 템플릿",
      copyMessageBtn: "메시지 복사",
      messageCopiedBtn: "복사됨",
      copyEmailBtn: "이메일 복사",
      emailCopiedBtn: "이메일 복사됨",
      openPrivacyBtn: "개인정보 처리방침 및 UMP 설정 열기",
      openDeleteSettingsBtn: "설정 -> 계정 및 데이터 삭제로 이동",
      topics: {
        bug: {
          label: "버그 제보",
          subject: "SudokuSync Bug Report (v1.0.3)",
          body: "앱 버전: v1.0.3\n플랫폼 (Web / Android): \n화면 / 기능: \n재현 방법: \n예상 동작 vs 실제 동작: ",
        },
        privacy: {
          label: "개인정보 / UMP 동의",
          subject: "SudokuSync Privacy & UMP Consent Inquiry (v1.0.3)",
          body: "앱 버전: v1.0.3\n플랫폼 (Web / Android): \n항목 (GDPR / CCPA / AdSense / AdMob AAID / UMP): \n문의 내용: ",
        },
        deletion: {
          label: "계정 및 데이터 삭제",
          subject: "SudokuSync Account & Data Deletion Request (v1.0.3)",
          body: "앱 버전: v1.0.3\n플레이어 닉네임 / 이메일: \n요청 내용: SudokuSync Firestore 프로필, 순위/매치 기록 및 푸시 알림 토큰의 영구 삭제를 요청합니다.",
        },
      },
    },
    about: {
      publisherBadge: "Mo Logic 제작 · 퍼블리싱",
      publisherHeader: "독립 퍼즐 스튜디오 및 품질 기준",
      publisherText:
        "SudokuSync는 독립 퍼즐 스튜디오 Mo Logic이 웹(https://sudokusync.com)과 Google Play Android(com.mologic.sudokusync)용으로 제작·배포합니다. 테두리 없는 파스텔 인터페이스, 라이트/다크 테마, 오프라인 저장, 투명한 광고 기반 무료 플레이를 제공합니다.",
      engineHeader: "결정론적 9x9 퍼즐 엔진 및 단서 수 검증",
      engineIntro:
        "모든 클래식 9x9 퍼즐은 시드 기반 Mulberry32 PRNG 생성기와 휴먼 로직 난이도 엔진, MRV 비트마스크 솔버 검증을 거쳐 단 하나의 유일한 정답이 보장됩니다:",
      difficultySpecs: [
        {
          level: "EASY",
          label: "쉬움 (Easy)",
          cluesBadge: "단서 51개",
          summary: "가로줄, 세로줄, 3x3 박스 스캔 중심의 가벼운 워밍업 퍼즐.",
        },
        {
          level: "MEDIUM",
          label: "보통 (Medium)",
          cluesBadge: "단서 39개",
          summary: "교차 추론과 기본 후보 소거를 연습하는 균형 잡힌 난이도.",
        },
        {
          level: "HARD",
          label: "어려움 (Hard)",
          cluesBadge: "단서 30개",
          summary: "페어, 포인팅 기법과 어려움/전문가 전용 자동 메모 활용 모드.",
        },
        {
          level: "EXPERT",
          label: "전문가 (Expert)",
          cluesBadge: "단서 25개",
          summary: "고급 연쇄 소거와 X-Wing 패턴을 요구하는 최소 단서 보드.",
        },
      ],
      multiplayerHeader: "동일 보드 실시간 & 비동기 멀티플레이어",
      multiplayerText:
        "6자리 숫자 방 코드, 선택적 PIN 잠금, ?room= 직접 공유 링크를 통해 웹과 Android에서 완전히 동일한 9x9 시드로 실시간 또는 비동기 대결을 즐길 수 있습니다. Google 로그인 시 기록, 친구 목록, 최근 플레이어 동기화와 고스트 모드를 지원합니다.",
      assistantsText:
        "동일 숫자 강조, 남은 숫자 표시, 관련 영역 강조, 완료 숫자 자동 전환, 메모 자동 삭제, 자동 메모(어려움/전문가 전용), 빠른 채우기의 7가지 검증된 스마트 어시스턴트를 제공합니다.",
      exploreHeader: "규칙, 도구 및 지원 바로가기",
      exploreRulesLabel: "규칙 및 전략 허브",
      exploreSolverLabel: "스도쿠 솔버",
      exploreDailyLabel: "일일 챌린지",
      exploreContactLabel: "문의 및 데이터 지원",
    },
  },

  es: {
    metaLine: "Fecha de entrada en vigor: 12 de agosto de 2026 | Version: 1.0.3 | Plataforma: Web y App Android",
    privacy: {
      title: "Politica de Privacidad",
      intro:
        "En SudokuSync (https://sudokusync.com y la aplicacion oficial para Android), consideramos la privacidad de nuestros jugadores de suma importancia. Este documento detalla que informacion se recopila, almacena y procesa, cumpliendo con GDPR, CCPA/CPRA, COPPA, Google Play Data Safety, Google AdSense y Google AdMob.",
      s1Header: "1. Recopilacion de Informacion y Arquitectura de Almacenamiento",
      s1Intro:
        "Operamos bajo minimizacion estricta de datos, diferenciando claramente entre almacenamiento local y registros en la nube:",
      s1LocalStorage: {
        label: "Almacenamiento Local en el Dispositivo (Solo Navegador y Dispositivo):",
        text: "El localStorage del navegador se usa estrictamente en tu dispositivo para guardar preferencias (Modo oscuro, sonido, vibracion), limites de errores, temporizador, notas activas y partidas individuales guardadas. Nunca se vende ni comparte con terceros con fines comerciales.",
      },
      s1Firestore: {
        label: "Google Cloud Firestore (Multijugador en Tiempo Real y Clasificaciones):",
        intro: "Al participar en duelos multijugador o clasificaciones globales, solo se almacenan parametros no sensibles:",
        bullets: [
          "ID anonimo del desafio, semilla y nivel de dificultad.",
          "Apodo alfanumerico elegido por el jugador e ID de usuario.",
          "Metricas de rendimiento: tiempo de resolucion (segundos), errores y victoria/derrota.",
        ],
      },
      s1Fcm: {
        label: "Firebase Cloud Messaging (FCM) e Identificadores de Dispositivo:",
        text: "Si concedes permiso de notificaciones, se genera un token anonimo FCM y un identificador anonimo solo para enviar invitaciones, alertas de duelo y resultados. Nunca se usan para seguimiento entre apps ni publicidad.",
        controlLabel: "Control y Revocacion del Usuario:",
        controlText: 'Puedes activar o desactivar las notificaciones en Ajustes -> "Notificaciones Push" o desde los ajustes de tu navegador o sistema operativo.',
      },
      s1Auth: {
        label: "Firebase Authentication y Sincronizacion en la Nube (Opcional):",
        text: "Al iniciar sesion con Google mediante Firebase Authentication (Google OAuth), recibimos credenciales basicas (Nombre visible, correo e ID de usuario) unicamente para autenticar la sesion y sincronizar tus estadisticas y partidas entre dispositivos. Las sesiones de Invitado anonimas funcionan en un espacio local aislado sin escribir en perfiles privados. No recopilamos contrasenas, contactos ni datos financieros.",
      },
      s1ServerLogs: {
        label: "Registros de Infraestructura y Diagnostico:",
        text: "Google Firebase Hosting y nuestro servidor Express procesan registros estandar (IP, user-agent, marcas de tiempo y limitacion de tasa) exclusivamente para seguridad operativa y prevencion de DDoS.",
      },
      s2Header: "2. Publicidad, Google AdSense, AdMob SDK, AAID y Consentimiento Google UMP",
      s2P1: "Para mantener SudokuSync gratuito usamos Google AdSense en la web y Google AdMob SDK en nuestra app oficial de Android. En la web se emplean cookies (incluida DoubleClick / DART) y balizas web. En Android, el SDK de AdMob puede procesar el Android Advertising ID (AAID), eventos de interaccion y senales tecnicas para entrega de anuncios y prevencion de fraude.",
      s2P2: "Antes de mostrar anuncios personalizados en regiones reguladas (como EEE y Reino Unido), la app utiliza Google UMP (User Messaging Platform) Consent SDK para ofrecer opciones claras de consentimiento y revocacion en cualquier momento.",
      s2BoxTitle: "Transparencia Publicitaria, Controles AAID y Portales de Exclusion:",
      s2BoxIntro: "Puedes desactivar anuncios personalizados, restablecer tu ID de publicidad movil o gestionar cookies en cualquier momento:",
      s2AndroidAaid: {
        label: "Exclusion / Restablecimiento de AAID en Android:",
        text: "Abre Ajustes de Android -> Google -> Anuncios (o Ajustes -> Privacidad -> Anuncios) para restablecer tu ID de publicidad o desactivar la personalizacion.",
      },
      s2Portals: OPT_OUT_PORTALS,
      s2Quality: {
        label: "Proteccion contra Trafico Invalido:",
        text: "Los bots, granjas de clics, clics repetidos manuales o manipulaciones por proxy estan estrictamente prohibidos.",
      },
      s3Header: "3. Derecho de Supresion / Eliminacion de Cuenta y Datos (Google Play y Normas Globales)",
      s3Intro:
        "Bajo GDPR, CCPA/CPRA, DPDP y las normas Google Play Data Safety, todo jugador tiene derecho a eliminar permanentemente su cuenta y registros asociados.",
      s3BoxTitle: "Metodos de Eliminacion de Cuenta y Datos:",
      s3InApp: {
        label: "Directamente en la App (Autoservicio Instantaneo):",
        text: 'Abre Ajustes -> SOPORTE E INFO -> Pulsa "Eliminar Cuenta y Datos". Esto borra de inmediato tu perfil de Firestore, documentos de presencia, salas activas, tokens FCM, localStorage y sessionStorage del dispositivo y revoca la sesion.',
      },
      s3Email: {
        label: "Solicitud Web y por Correo (Canal Alternativo):",
        text: "Si ya no tienes acceso a la app, solicita la eliminacion escribiendo a sudokutogethermode@gmail.com indicando tu nombre de jugador o correo. Procesamos y confirmamos en un plazo de 24 a 48 horas habiles.",
      },
      s3RightsIntro: "Derechos legales adicionales en el EEE, Reino Unido y el resto del mundo:",
      s3RightsBullets: [
        { label: "Derecho de Acceso:", text: "Solicitar copia de tus registros de jugador y clasificaciones." },
        { label: "Derecho de Rectificacion:", text: "Modificar tu apodo de jugador en cualquier momento en la app." },
        { label: "Limitacion y Portabilidad:", text: "Solicitar limitacion del tratamiento o exportacion de tu telemetria." },
      ],
      s4Header: "4. Derechos de Privacidad en California (CCPA / CPRA)",
      s4Text:
        "Los residentes de California tienen derecho a conocer y solicitar la eliminacion de sus datos. NO vendemos ni compartimos tu informacion personal con terceros por consideracion monetaria o comercial.",
      s5Header: "5. Privacidad Infantil (COPPA)",
      s5Text:
        "SudokuSync no recopila intencionadamente datos personales de menores de 13 anos (o de 16 en EEE/Reino Unido). No exigimos nombres reales, direcciones ni telefonos. Si crees que un menor ha enviado informacion personal, escribenos a sudokutogethermode@gmail.com para borrarla de inmediato.",
      s6Header: "6. Conservacion de Datos y Controles de Seguridad",
      s6Text:
        "Los registros multijugador mayores de 30 dias se purgan automaticamente. Todo el trafico va cifrado mediante TLS/HTTPS y reglas estrictas de Firestore protegen cada documento.",
      s7Header: "7. Contacto",
      s7Intro: "Para consultas sobre esta Politica de Privacidad o gestion de datos, contacta con nuestro equipo:",
      s7TurnaroundLabel: "Tiempo de Respuesta:",
      s7TurnaroundValue: "En un plazo de 24 a 48 horas habiles.",
    },
    terms: {
      title: "Terminos de Servicio",
      intro:
        "Al acceder, instalar o jugar SudokuSync (https://sudokusync.com o app oficial Android), aceptas quedar vinculado por estos Terminos de Servicio y las leyes aplicables.",
      s1Header: "1. Descripcion del Servicio y Acceso Gratuito",
      s1Text:
        'SudokuSync ofrece puzzles Sudoku digitales gratuitos, salas deterministas con semilla, clasificaciones y herramientas logicas "TAL CUAL" y "SEGUN DISPONIBILIDAD", reservandonos el derecho a actualizar funciones.',
      s2Header: "2. Juego Limpio, Anti-Trampas y Normas de Comunidad",
      s2Intro: "Para preservar competiciones honestas, aceptas cumplir estrictamente nuestras normas de Juego Limpio:",
      s2BoxTitle: "Politica de Juego Limpio y Anti-Trampas:",
      s2Bullets: [
        { label: "Sin Bots ni Solvers Automaticos:", text: "Prohibido usar bots, scripts resolutores, autoclickers o navegadores headless." },
        { label: "Sin Alteracion de Cliente o Memoria:", text: "Prohibido modificar codigo, inyectar depuradores o alterar memoria para manipular tiempos." },
        { label: "Sin Manipulacion de Red o API:", text: "Prohibido interceptar, falsificar o inundar paquetes de sincronizacion." },
        { label: "Apodos Apropiados:", text: "Prohibidos nombres ofensivos o abusivos; se aplican filtros automaticos y validacion alfanumerica." },
        { label: "Cero Fraude Publicitario:", text: "Prohibidos los clics automatizados o enganosos en anuncios." },
      ],
      s2Penalty: {
        label: "Sanciones:",
        text: "Cualquier manipulacion detectada conlleva descalificacion inmediata, retirada de clasificaciones y suspension del perfil o dispositivo.",
      },
      s3Header: "3. Cuenta en la Nube y Sincronizacion",
      s3Intro: "Puedes jugar como invitado o vincular tu cuenta Google:",
      s3Bullets: [
        { label: "Sincronizacion Multidispositivo:", text: "Guarda estadisticas, historial, mejores tiempos, ajustes y tableros entre Web y Android." },
        { label: "Confidencialidad:", text: "Eres responsable de la seguridad de tus credenciales de Google y la actividad de tu sesion." },
        { label: "Uso Personal y No Comercial:", text: "Uso exclusivo para entretenimiento personal y entrenamiento mental." },
        { label: "Disponibilidad y Suspension:", text: "Se ofrece bajo mejor esfuerzo y puede suspenderse ante abuso o violacion de normas." },
        { label: "Eliminacion en Autoservicio:", text: 'En cualquier momento en Ajustes -> Soporte e Info -> "Eliminar Cuenta y Datos" o escribiendo a sudokutogethermode@gmail.com.' },
      ],
      s4Header: "4. Propiedad Intelectual",
      s4Text:
        "Todos los motores logicos, sintesis procedural de sonido, interfaces, tokens Scrapbook Design System, graficos, logotipos y codigo pertenecen a SudokuSync.",
      s5Header: "5. Publicidad de Terceros (AdSense y AdMob)",
      s5Text:
        "El juego se financia con Google AdSense en Web y Google AdMob SDK en Android (incluidos anuncios intersticiales o recompensados sujetos a consentimiento Google UMP). No respaldamos ni controlamos sitios anunciados.",
      s6Header: "6. Exencion de Garantias y Limitacion de Responsabilidad",
      s6Text:
        "El software se entrega 'tal cual', sin garantias expresas ni implicitas. En ningun caso SudokuSync sera responsable por perdida de datos o beneficios derivada del uso del juego.",
      s7Header: "7. Eliminacion de Cuenta y Terminacion",
      s7Text:
        'Puedes dejar de usar la app en cualquier momento y borrar todo con "Eliminar Cuenta y Datos" en Ajustes. Nos reservamos el derecho de restringir acceso ante incumplimientos.',
      s8Header: "8. Contacto",
      s8Intro: "Para consultas o avisos legales sobre estos Terminos de Servicio, contactanos en:",
      s8TurnaroundLabel: "Tiempo de Respuesta:",
      s8TurnaroundValue: "En un plazo de 24 a 48 horas habiles.",
    },
    contactComposer: {
      sectionLabel: "Redactor de Mensaje de Soporte",
      helperText:
        "Elige un tema, personaliza la plantilla y copia el mensaje o correo sin abrir ventanas emergentes en blanco.",
      subjectLabel: "Asunto",
      messageLabel: "Plantilla del Mensaje",
      copyMessageBtn: "Copiar Mensaje",
      messageCopiedBtn: "Mensaje Copiado",
      copyEmailBtn: "Copiar Correo",
      emailCopiedBtn: "Correo Copiado",
      openPrivacyBtn: "Abrir Privacidad y Opt-Out UMP",
      openDeleteSettingsBtn: "Ir a Ajustes -> Eliminar Cuenta y Datos",
      topics: {
        bug: {
          label: "Reportar Error",
          subject: "SudokuSync Bug Report (v1.0.3)",
          body: "Version: v1.0.3\nPlataforma (Web / Android): \nPantalla o funcion: \nPasos para reproducir: \nResultado esperado vs real: ",
        },
        privacy: {
          label: "Privacidad / Consentimiento UMP",
          subject: "SudokuSync Privacy & UMP Consent Inquiry (v1.0.3)",
          body: "Version: v1.0.3\nPlataforma (Web / Android): \nTema (GDPR / CCPA / AdSense / AdMob AAID / UMP): \nDetalles de la solicitud: ",
        },
        deletion: {
          label: "Eliminar Cuenta y Datos",
          subject: "SudokuSync Account & Data Deletion Request (v1.0.3)",
          body: "Version: v1.0.3\nNombre de jugador / Correo: \nSolicitud: Por favor eliminen permanentemente mi perfil de Firestore, registros de partidas y tokens de notificaciones de SudokuSync.",
        },
      },
    },
    about: {
      publisherBadge: "Publicado por Mo Logic",
      publisherHeader: "Estudio Independiente de Rompecabezas",
      publisherText:
        "SudokuSync es desarrollado y publicado de forma independiente por Mo Logic para Web (https://sudokusync.com) y Android en Google Play (com.mologic.sudokusync). Ofrece una interfaz pastel sin bordes, temas claro/oscuro, guardado sin conexion y acceso gratuito transparente.",
      engineHeader: "Motor Determinista 9x9 y Pistas Verificadas",
      engineIntro:
        "Cada tablero clasico de 9x9 se genera con Mulberry32 PRNG y pasa por nuestro evaluador de logica humana y verificacion MRV para garantizar matematicamente una solucion unica:",
      difficultySpecs: [
        {
          level: "EASY",
          label: "Facil",
          cluesBadge: "51 Pistas",
          summary: "Escaneo directo de filas, columnas y cajas 3x3 ideal para calentar.",
        },
        {
          level: "MEDIUM",
          label: "Medio",
          cluesBadge: "39 Pistas",
          summary: "Deducciones equilibradas de varios pasos entre intersecciones.",
        },
        {
          level: "HARD",
          label: "Dificil",
          cluesBadge: "30 Pistas",
          summary: "Pares, apuntadores y notas de candidatos con Notas Automaticas.",
        },
        {
          level: "EXPERT",
          label: "Experto",
          cluesBadge: "25 Pistas",
          summary: "Cadenas profundas de eliminacion, patrones X-Wing y pistas minimas.",
        },
      ],
      multiplayerHeader: "Multijugador en Vivo y Asincrono en el Mismo Tablero",
      multiplayerText:
        "Comparte codigos de sala de 6 digitos, PIN opcional o enlaces directos ?room= para competir en la misma semilla 9x9 entre Web y Android. Al iniciar sesion con Google sincronizas estadisticas, lista de Amigos persistente, Jugadores Recientes y Modo Fantasma.",
      assistantsText:
        "Incluye 7 Asistentes Inteligentes reales: Resaltar Numeros Identicos, Mostrar Numeros Restantes, Resaltar Area Relacionada, Cambio Automatico al Completar, Eliminar Notas Automaticamente, Notas Automaticas (Dificil/Experto) y Relleno Rapido.",
      exploreHeader: "Explorar Reglas, Herramientas y Soporte",
      exploreRulesLabel: "Guia de Reglas y Estrategias",
      exploreSolverLabel: "Solucionador de Sudoku",
      exploreDailyLabel: "Desafio Diario",
      exploreContactLabel: "Contacto y Privacidad",
    },
  },

  fr: {
    metaLine: "Date d'entree en vigueur : 12 aout 2026 | Version : 1.0.3 | Plateforme : Web et App Android",
    privacy: {
      title: "Politique de Confidentialite",
      intro:
        "Chez SudokuSync (https://sudokusync.com et l'application officielle Android), la confidentialite de nos joueurs est primordiale. Cette politique detaille les donnees collectees, stockees et traitees, conformement au RGPD (GDPR), CCPA/CPRA, COPPA, Google Play Data Safety, Google AdSense et Google AdMob.",
      s1Header: "1. Collecte des Donnees et Architecture de Stockage",
      s1Intro:
        "Nous appliquons une minimisation stricte des donnees, en distinguant stockage local sur l'appareil et enregistrements cloud :",
      s1LocalStorage: {
        label: "Stockage Local Client (Navigateur et Appareil Uniquement) :",
        text: "Le localStorage est utilise uniquement sur votre appareil pour conserver vos preferences (Mode sombre, sons, haptique), limites d'erreurs, chronometre, notes et parties solo sauvegardees. Ces donnees ne sont jamais vendues ni transmises a des tiers publicitaires.",
      },
      s1Firestore: {
        label: "Google Cloud Firestore (Multijoueur en Temps Reel et Classements) :",
        intro: "Lors des defis multijoueurs ou classements, seuls ces parametres non sensibles sont enregistres :",
        bullets: [
          "Identifiant anonyme de defi, graine (seed) et niveau de difficulte.",
          "Pseudonyme alphanumerique choisi par le joueur et identifiant utilisateur.",
          "Statistiques de partie : temps de resolution (secondes), erreurs et victoire/defaite.",
        ],
      },
      s1Fcm: {
        label: "Firebase Cloud Messaging (FCM) et Identifiants d'Appareil :",
        text: "Lorsque vous autorisez les notifications, un jeton anonyme FCM et un identifiant anonyme d'appareil sont generes uniquement pour envoyer invitations, alertes de duel et fins de partie. Les jetons ne servent jamais au pistage ni a la publicite.",
        controlLabel: "Controle et Revocation :",
        controlText: 'Activez ou desactivez les notifications a tout moment dans Parametres -> "Notifications Push" ou via les parametres systeme/navigateur.',
      },
      s1Auth: {
        label: "Firebase Authentication et Synchronisation Cloud (Optionnel) :",
        text: "En vous connectant avec Google via Firebase Authentication (Google OAuth), nous recevons uniquement vos informations de base (Nom affiche, e-mail, UID) pour authentifier la session et synchroniser vos statistiques et parties sur vos appareils. Les sessions Invite anonymes fonctionnent dans un coffre local isole sans ecrire dans des profils prives. Aucun mot de passe, contact ou donnee financiere n'est collecte.",
      },
      s1ServerLogs: {
        label: "Journaux Serveur d'Infrastructure et Diagnostic :",
        text: "Les journaux web standards (adresse IP, user-agent, horodatage, limitation de debit) sont traites automatiquement par Google Firebase Hosting et notre serveur Express uniquement pour la securite et la protection anti-DDoS.",
      },
      s2Header: "2. Publicite, Google AdSense, SDK AdMob, AAID et Consentement Google UMP",
      s2P1: "Pour garder SudokuSync gratuit, nous utilisons Google AdSense sur le web et le SDK Google AdMob sur Android. Sur le web, des cookies (dont DoubleClick / DART) et balises mesurent et diffusent les annonces. Sur Android, le SDK AdMob peut traiter l'Android Advertising ID (AAID), les interactions et signaux techniques pour la diffusion, le plafonnement et l'anti-fraude.",
      s2P2: "Avant toute publicite personnalisee dans les juridictions reglementees (EEE et Royaume-Uni), notre app utilise le SDK Google UMP (User Messaging Platform) pour recueillir, gerer ou retirer votre consentement a tout moment.",
      s2BoxTitle: "Transparence Publicitaire, Controles AAID et Portails d'Opt-Out :",
      s2BoxIntro: "Vous pouvez refuser la publicite personnalisee, reinitialiser votre identifiant publicitaire mobile ou gerer vos cookies a tout moment :",
      s2AndroidAaid: {
        label: "Reinitialisation / Desactivation de l'AAID Android :",
        text: "Ouvrez Parametres Android -> Google -> Annonces (ou Parametres -> Confidentialite -> Annonces) pour reinitialiser votre ID publicitaire ou desactiver la personnalisation.",
      },
      s2Portals: OPT_OUT_PORTALS,
      s2Quality: {
        label: "Protection du Trafic Publicitaire :",
        text: "Bots automatises, fermes a clics, clics repetes ou contournements par proxy sont strictement interdits et filtres.",
      },
      s3Header: "3. Droit a l'Effacement / Suppression de Compte et Donnees (Google Play et Normes Mondiales)",
      s3Intro:
        "Conformement au RGPD, CCPA/CPRA, DPDP et aux regles Google Play Data Safety, chaque joueur dispose du droit absolu de supprimer definitivement son compte et ses donnees.",
      s3BoxTitle: "Methodes de Suppression de Compte et Donnees :",
      s3InApp: {
        label: "Directement dans l'App (Libre-Service Instantane) :",
        text: 'Ouvrez Parametres -> SUPPORT & INFO -> Cliquez sur "Supprimer le Compte et les Donnees". Ceci supprime immediatement votre profil Firestore, presence, documents de salon actifs, jetons FCM, cache localStorage/sessionStorage et revoque votre session.',
      },
      s3Email: {
        label: "Demande Web et E-mail (Canal Alternatif) :",
        text: "Si vous n'avez plus acces a l'app, demandez la suppression a sudokutogethermode@gmail.com en precisant votre pseudo ou e-mail. Traitement confirme sous 24 a 48 heures ouvrables.",
      },
      s3RightsIntro: "Droits statutaires supplementaires dans l'EEE, au Royaume-Uni et dans le monde :",
      s3RightsBullets: [
        { label: "Droit d'Acces :", text: "Obtenir une copie de vos donnees de joueur et classements." },
        { label: "Droit de Rectification :", text: "Modifier votre pseudo directement dans le jeu a tout moment." },
        { label: "Limitation et Portabilite :", text: "Demander la limitation du traitement ou l'export de vos donnees de partie." },
      ],
      s4Header: "4. Droits de Confidentialite en Californie (CCPA / CPRA)",
      s4Text:
        "Les residents californiens peuvent connaitre les categories collectees et demander leur suppression. Nous ne vendons ni ne partageons vos donnees personnelles contre remuneration commerciale.",
      s5Header: "5. Protection des Enfants (COPPA)",
      s5Text:
        "SudokuSync ne collecte pas sciemment de donnees d'enfants de moins de 13 ans (ou 16 ans dans l'EEE/Royaume-Uni). Aucun nom reel, adresse ou telephone n'est requis. En cas de doute, contactez sudokutogethermode@gmail.com pour une suppression rapide.",
      s6Header: "6. Duree de Conservation et Securite",
      s6Text:
        "Les enregistrements de matchs multijoueurs de plus de 30 jours sont purges automatiquement. Tout trafic est chiffre par TLS/HTTPS et protege par des regles strictes Firestore.",
      s7Header: "7. Nous Contacter",
      s7Intro: "Pour toute question relative a cette Politique de Confidentialite, contactez notre support :",
      s7TurnaroundLabel: "Delai de Reponse :",
      s7TurnaroundValue: "Sous 24 a 48 heures ouvrables.",
    },
    terms: {
      title: "Conditions d'Utilisation",
      intro:
        "En accedant, installant ou jouant a SudokuSync (https://sudokusync.com ou app officielle Android), vous acceptez ces Conditions d'Utilisation et les lois applicables.",
      s1Header: "1. Description du Service et Acces Gratuit",
      s1Text:
        'SudokuSync propose des grilles de Sudoku gratuites, des salons multijoueurs deterministes, classements et outils logiques fournis "EN L\'ETAT" et "SELON DISPONIBILITE".',
      s2Header: "2. Fair-Play, Anti-Triche et Standards Communautaires",
      s2Intro: "Pour garantir une competition loyale, vous vous engagez a respecter nos regles de Fair-Play :",
      s2BoxTitle: "Politique Fair-Play et Anti-Triche :",
      s2Bullets: [
        { label: "Aucun Bot ni Solveur Automatique :", text: "Interdiction d'utiliser bots, scripts de resolution, auto-clickers ou navigateurs headless." },
        { label: "Aucune Alteration Client ou Memoire :", text: "Interdiction de modifier le code client, d'injecter des scripts ou de fausser la memoire d'execution." },
        { label: "Aucune Manipulation Reseau / API :", text: "Interdiction d'intercepter, falsifier ou saturer les paquets de synchronisation." },
        { label: "Pseudonymes Convenables :", text: "Pseudos offensants interdits ; filtrage automatique et validation alphanumerique appliques." },
        { label: "Zero Fraude Publicitaire :", text: "Les clics automatises ou trompeurs sur les publicites sont strictement interdits." },
      ],
      s2Penalty: {
        label: "Sanctions :",
        text: "Toute fraude entraine la disqualification immediate des temps, le retrait des classements et la suspension du profil ou de l'appareil.",
      },
      s3Header: "3. Compte Cloud et Synchronisation",
      s3Intro: "Jouez en mode Invite ou connectez votre compte Google :",
      s3Bullets: [
        { label: "Synchronisation Multi-Appareils :", text: "Synchronise statistiques, historique, meilleurs temps, preferences et grilles entre Web et Android." },
        { label: "Confidentialite :", text: "Vous etes responsable de la securite de vos identifiants Google et de l'activite sous votre session." },
        { label: "Usage Personnel Non Commercial :", text: "Strictement reserve au divertissement personnel ; toute exploitation commerciale est interdite." },
        { label: "Disponibilite et Resiliation :", text: "Fourni au mieux de nos capacites, suspendable en cas d'abus." },
        { label: "Suppression en Libre-Service :", text: 'A tout moment dans Parametres -> Support & Info -> "Supprimer le Compte et les Donnees" ou a sudokutogethermode@gmail.com.' },
      ],
      s4Header: "4. Propriete Intellectuelle",
      s4Text:
        "Tous les moteurs logiques, synthese sonore procedurale, interfaces, jetons Scrapbook Design System, graphismes, logos et codes appartiennent a SudokuSync.",
      s5Header: "5. Publicites Tierces (AdSense et AdMob)",
      s5Text:
        "Le service reste gratuit grace a Google AdSense (Web) et au SDK Google AdMob (Android, incluant annonces interstitielles/recompensees soumises au consentement Google UMP). Nous ne sommes pas responsables des sites tiers annonces.",
      s6Header: "6. Exclusion de Garanties et Limitation de Responsabilite",
      s6Text:
        "Le logiciel est fourni 'tel quel' sans garantie expresse ou implicite. SudokuSync decline toute responsabilite en cas de perte de donnees ou de profit liee a l'utilisation du jeu.",
      s7Header: "7. Suppression de Compte et Fin d'Utilisation",
      s7Text:
        'Vous pouvez cesser d\'utiliser l\'app et tout effacer instantanement via "Supprimer le Compte et les Donnees" dans Parametres. Nous nous reservons le droit de sanctionner toute violation.',
      s8Header: "8. Nous Contacter",
      s8Intro: "Pour toute question ou notification legale concernant ces Conditions :",
      s8TurnaroundLabel: "Delai de Reponse :",
      s8TurnaroundValue: "Sous 24 a 48 heures ouvrables.",
    },
    contactComposer: {
      sectionLabel: "Assistant de Message Support",
      helperText:
        "Selectionnez un sujet, personnalisez le modele et copiez le message ou l'adresse e-mail sans ouvrir de fenetre mail vide.",
      subjectLabel: "Objet",
      messageLabel: "Modele de Message",
      copyMessageBtn: "Copier le Message",
      messageCopiedBtn: "Message Copie",
      copyEmailBtn: "Copier l'E-mail",
      emailCopiedBtn: "E-mail Copie",
      openPrivacyBtn: "Ouvrir Confidentialite & Opt-Out UMP",
      openDeleteSettingsBtn: "Aller a Parametres -> Supprimer Compte & Donnees",
      topics: {
        bug: {
          label: "Signaler un Bug",
          subject: "SudokuSync Bug Report (v1.0.3)",
          body: "Version : v1.0.3\nPlateforme (Web / Android) : \nEcran ou fonctionnalite : \nEtapes pour reproduire : \nResultat attendu vs observe : ",
        },
        privacy: {
          label: "Confidentialite / UMP",
          subject: "SudokuSync Privacy & UMP Consent Inquiry (v1.0.3)",
          body: "Version : v1.0.3\nPlateforme (Web / Android) : \nSujet (RGPD / CCPA / AdSense / AdMob AAID / UMP) : \nDetails : ",
        },
        deletion: {
          label: "Suppression Compte & Donnees",
          subject: "SudokuSync Account & Data Deletion Request (v1.0.3)",
          body: "Version : v1.0.3\nPseudo joueur / E-mail : \nDemande : Merci de supprimer definitivement mon profil Firestore, mes classements/matchs et mes jetons de notification SudokuSync.",
        },
      },
    },
    about: {
      publisherBadge: "Publie par Mo Logic",
      publisherHeader: "Studio Independant & Exigence Editoriale",
      publisherText:
        "SudokuSync est concu et publie independamment par Mo Logic sur le Web (https://sudokusync.com) et Google Play Android (com.mologic.sudokusync). Chaque grille et guide s'appuie sur une interface pastel sans bordures, themes Clair/Sombre, jeu hors ligne et acces gratuit transparent.",
      engineHeader: "Moteur Deterministe 9x9 & Calibrage des Indices",
      engineIntro:
        "Chaque grille 9x9 est generee par Mulberry32 PRNG et controlee par notre moteur de difficulte humaine et notre solveur MRV pour garantir une solution unique mathematiquement verifiee :",
      difficultySpecs: [
        {
          level: "EASY",
          label: "Facile",
          cluesBadge: "51 Indices",
          summary: "Balayage fluide par lignes, colonnes et blocs 3x3 pour s'echauffer.",
        },
        {
          level: "MEDIUM",
          label: "Moyen",
          cluesBadge: "39 Indices",
          summary: "Deductions logiques equilibrees a travers plusieurs unites.",
        },
        {
          level: "HARD",
          label: "Difficile",
          cluesBadge: "30 Indices",
          summary: "Paires, alignements et prise de notes avec Notes Auto.",
        },
        {
          level: "EXPERT",
          label: "Expert",
          cluesBadge: "25 Indices",
          summary: "Chaines d'elimination avancees, X-Wing et tres peu d'indices initiaux.",
        },
      ],
      multiplayerHeader: "Multijoueur sur Meme Grille en Direct et Asynchrone",
      multiplayerText:
        "Partagez un code de salon a 6 chiffres, un code PIN optionnel ou un lien direct ?room= pour jouer exactement la meme grille 9x9 sur Web et Android. Avec Google, synchronisez vos statistiques, Amis persistants, Joueurs Recents et Mode Fantome.",
      assistantsText:
        "Sept Assistants Intelligents verifies sont disponibles : Surbrillance des chiffres identiques, Chiffres restants, Zone associee, Changement auto des chiffres termines, Suppression auto des notes, Notes Auto (Difficile/Expert) et Remplissage rapide.",
      exploreHeader: "Explorer Regles, Outils & Support",
      exploreRulesLabel: "Hub Regles & Strategies",
      exploreSolverLabel: "Solveur de Sudoku",
      exploreDailyLabel: "Defi Quotidien",
      exploreContactLabel: "Contact & Confidentialite",
    },
  },

  it: {
    metaLine: "Data di entrata in vigore: 12 agosto 2026 | Versione: 1.0.3 | Piattaforma: Web e App Android",
    privacy: {
      title: "Informativa sulla Privacy",
      intro:
        "Su SudokuSync (https://sudokusync.com e l'app ufficiale Android), la privacy dei nostri giocatori e fondamentale. Questo documento descrive in dettaglio i dati raccolti, archiviati e trattati nel rispetto di GDPR, CCPA/CPRA, COPPA, Google Play Data Safety, Google AdSense e Google AdMob.",
      s1Header: "1. Raccolta Dati e Architettura di Archiviazione",
      s1Intro:
        "Applichiamo una rigorosa minimizzazione dei dati, distinguendo chiaramente tra dati locali sul dispositivo e record nel cloud:",
      s1LocalStorage: {
        label: "Archiviazione Locale (Solo Browser e Dispositivo):",
        text: "Il localStorage viene usato esclusivamente sul dispositivo per salvare preferenze UI (Modalita scura, suoni, vibrazione), limiti errori, timer, note e partite solitario salvate. Non viene mai venduto o condiviso per scopi di marketing.",
      },
      s1Firestore: {
        label: "Google Cloud Firestore (Multigiocatore in Tempo Reale e Classifiche):",
        intro: "Nelle sfide multigiocatore o classifiche globali vengono salvati solo parametri di gioco non sensibili:",
        bullets: [
          "ID sfida anonimo, numero di seed e difficolta.",
          "Nickname alfanumerico scelto dal giocatore e ID utente.",
          "Metriche partita: tempo di completamento (secondi), errori ed esito.",
        ],
      },
      s1Fcm: {
        label: "Firebase Cloud Messaging (FCM) e Identificatori Dispositivo:",
        text: "Con il consenso alle notifiche vengono generati un token anonimo FCM e un ID dispositivo anonimo solo per inviare inviti e aggiornamenti di partita. I token push non vengono mai usati per tracciamento o pubblicita.",
        controlLabel: "Controllo e Revoca:",
        controlText: 'Puoi attivare o disattivare le notifiche in Impostazioni -> "Notifiche Push" oppure dalle impostazioni di sistema o del browser.',
      },
      s1Auth: {
        label: "Firebase Authentication e Sincronizzazione Cloud (Opzionale):",
        text: "Accedendo con Google tramite Firebase Authentication (Google OAuth), riceviamo solo le credenziali di base (Nome visualizzato, email e UID) per autenticare la sessione e sincronizzare statistiche e partite salvate tra dispositivi. Le sessioni Ospite anonime restano in un vault locale isolato. Non raccogliamo password, contatti, file personali o dati finanziari.",
      },
      s1ServerLogs: {
        label: "Log Server di Infrastruttura e Diagnostica:",
        text: "I log standard web (indirizzo IP, user-agent, timestamp, limiti di frequenza) vengono elaborati da Google Firebase Hosting e dal nostro server Express solo per sicurezza operativa e protezione DDoS.",
      },
      s2Header: "2. Pubblicita, Google AdSense, AdMob SDK, AAID e Consenso Google UMP",
      s2P1: "Per mantenere SudokuSync gratuito usiamo Google AdSense sul web e Google AdMob SDK su Android. Sul web vengono utilizzati cookie (incluso DoubleClick / DART) e web beacon; su Android l'SDK AdMob puo elaborare l'Android Advertising ID (AAID), interazioni con l'app e segnali diagnostici per erogazione annunci e prevenzione frodi.",
      s2P2: "Prima di mostrare annunci personalizzati in aree regolamentate (come SEE e Regno Unito), l'app usa Google UMP Consent SDK per consentire la gestione o revoca del consenso in qualsiasi momento.",
      s2BoxTitle: "Trasparenza Pubblicitaria, Controlli AAID e Portali Opt-Out:",
      s2BoxIntro: "Puoi disattivare gli annunci personalizzati, reimpostare l'ID pubblicitario mobile o gestire i cookie in qualsiasi momento:",
      s2AndroidAaid: {
        label: "Opt-Out / Reset AAID Android:",
        text: "Apri Impostazioni Android -> Google -> Annunci (o Impostazioni -> Privacy -> Annunci) per reimpostare l'ID pubblicitario o disattivare la personalizzazione.",
      },
      s2Portals: OPT_OUT_PORTALS,
      s2Quality: {
        label: "Protezione della Qualita del Traffico:",
        text: "Bot automatici, click-farm, clic ripetuti o manipolazioni via proxy sono severamente vietati.",
      },
      s3Header: "3. Diritto alla Cancellazione / Eliminazione Account e Dati (Google Play e Standard Globali)",
      s3Intro:
        "Ai sensi di GDPR, CCPA/CPRA, DPDP e delle norme Google Play Data Safety, ogni giocatore ha il diritto di richiedere l'eliminazione permanente del proprio account e dei dati associati.",
      s3BoxTitle: "Metodi di Eliminazione Account e Dati:",
      s3InApp: {
        label: "Direttamente nell'App (Self-Service Istantaneo):",
        text: 'Apri Impostazioni -> SUPPORTO E INFO -> Tocca "Elimina Account e Dati". Elimina subito profilo Firestore, documenti di presenza, stanze attive, token FCM, cache localStorage/sessionStorage e revoca la sessione.',
      },
      s3Email: {
        label: "Richiesta Web ed Email (Canale Alternativo):",
        text: "Se non puoi accedere all'app, scrivi a sudokutogethermode@gmail.com indicando nickname o email. Evasione e conferma entro 24-48 ore lavorative.",
      },
      s3RightsIntro: "Ulteriori diritti per gli utenti nello SEE, nel Regno Unito e nel mondo:",
      s3RightsBullets: [
        { label: "Diritto di Accesso:", text: "Richiedere copia dei dati giocatore e classifiche memorizzati." },
        { label: "Diritto di Rettifica:", text: "Aggiornare in qualsiasi momento il proprio nickname nell'app." },
        { label: "Limitazione e Portabilita:", text: "Richiedere limitazione del trattamento o esportazione della telemetria." },
      ],
      s4Header: "4. Diritti sulla Privacy in California (CCPA / CPRA)",
      s4Text:
        "I residenti in California hanno diritto a conoscere e richiedere la cancellazione dei dati raccolti. NON vendiamo ne condividiamo le tue informazioni personali con terzi a fini monetari o commerciali.",
      s5Header: "5. Tutela dei Minori (COPPA)",
      s5Text:
        "SudokuSync non raccoglie intenzionalmente dati di minori di 13 anni (o 16 anni nello SEE/Regno Unito). Non servono nomi reali, indirizzi o numeri di telefono per giocare. Per segnalazioni scrivi subito a sudokutogethermode@gmail.com.",
      s6Header: "6. Conservazione dei Dati e Sicurezza",
      s6Text:
        "I record delle partite multigiocatore piu vecchi di 30 giorni vengono eliminati automaticamente. Tutto il traffico e cifrato via TLS/HTTPS con rigide regole di sicurezza Firestore.",
      s7Header: "7. Contattaci",
      s7Intro: "Per domande su questa Informativa sulla Privacy contatta il nostro desk dedicato:",
      s7TurnaroundLabel: "Tempi di Risposta:",
      s7TurnaroundValue: "Entro 24-48 ore lavorative.",
    },
    terms: {
      title: "Termini di Servizio",
      intro:
        "Accedendo, installando o giocando a SudokuSync (https://sudokusync.com o app ufficiale Android), accetti di essere vincolato dai presenti Termini di Servizio e dalle leggi vigenti.",
      s1Header: "1. Descrizione del Servizio e Accesso Gratuito",
      s1Text:
        'SudokuSync offre puzzle Sudoku gratuiti, stanze multigiocatore deterministiche, classifiche in tempo reale e strumenti logici forniti "COSI COME SONO" e "SECONDO DISPONIBILITA".',
      s2Header: "2. Fair Play, Anti-Cheat e Norme della Community",
      s2Intro: "Per garantire partite leali, ti impegni a rispettare rigorosamente le regole di Fair Play:",
      s2BoxTitle: "Politica Fair Play e Anti-Cheat:",
      s2Bullets: [
        { label: "Vietati Bot e Risolutori Automatici:", text: "Vietato usare bot, script risolutori, autoclicker o browser headless." },
        { label: "Vietata Manomissione Client o Memoria:", text: "Vietato alterare codice, iniettare script o modificare valori in memoria." },
        { label: "Vietata Manipolazione Rete o API:", text: "Vietato intercettare, falsificare o inondare pacchetti di sincronizzazione." },
        { label: "Nickname Appropriati:", text: "Vietati nomi offensivi o volgari; attivi filtri automatici e controlli alfanumerici." },
        { label: "Zero Frodi Pubblicitarie:", text: "Severamente vietati clic automatici o ingannevoli sugli annunci." },
      ],
      s2Penalty: {
        label: "Sanzioni:",
        text: "Qualsiasi alterazione comporta squalifica immediata dei tempi, rimozione dalle classifiche e sospensione del profilo o dispositivo.",
      },
      s3Header: "3. Account Cloud e Sincronizzazione",
      s3Intro: "Puoi giocare come ospite o collegare il tuo account Google:",
      s3Bullets: [
        { label: "Sincronizzazione Multi-Dispositivo:", text: "Sincronizza statistiche, cronologia, tempi migliori, preferenze e partite salvate tra Web e Android." },
        { label: "Riservatezza dell'Account:", text: "Sei responsabile della sicurezza delle credenziali Google e di ogni attivita della sessione." },
        { label: "Uso Personale e Non Commerciale:", text: "Consentito solo per intrattenimento personale e allenamento logico." },
        { label: "Disponibilita e Sospensione:", text: "Fornita secondo best-effort e sospendibile in caso di abusi o violazioni." },
        { label: "Eliminazione Self-Service:", text: 'In qualsiasi momento in Impostazioni -> Supporto e Info -> "Elimina Account e Dati" o scrivendo a sudokutogethermode@gmail.com.' },
      ],
      s4Header: "4. Proprieta Intellettuale",
      s4Text:
        "Tutti i motori di gioco, sintesi sonora procedurale, design UI, token Scrapbook Design System, grafica, loghi e codice sono proprieta intellettuale di SudokuSync.",
      s5Header: "5. Pubblicita di Terze Parti (AdSense e AdMob)",
      s5Text:
        "Il servizio resta gratuito grazie a Google AdSense (Web) e Google AdMob SDK (Android, inclusi annunci interstitial o con premio soggetti al consenso Google UMP). Non rispondiamo di contenuti di inserzionisti esterni.",
      s6Header: "6. Esclusione di Garanzie e Limitazione di Responsabilita",
      s6Text:
        "Il software e fornito 'cosi com'e', senza garanzie esplicite o implicite. SudokuSync non risponde di eventuali danni o perdite di dati o profitti derivanti dall'uso del gioco.",
      s7Header: "7. Eliminazione Account e Cessazione",
      s7Text:
        'Puoi interrompere l\'uso in qualsiasi momento ed eliminare ogni dato con "Elimina Account e Dati" nelle Impostazioni. Ci riserviamo il diritto di rimuovere accessi in caso di violazioni.',
      s8Header: "8. Contattaci",
      s8Intro: "Per domande o comunicazioni legali sui presenti Termini di Servizio:",
      s8TurnaroundLabel: "Tempi di Risposta:",
      s8TurnaroundValue: "Entro 24-48 ore lavorative.",
    },
    contactComposer: {
      sectionLabel: "Compositore Messaggio Supporto",
      helperText:
        "Seleziona un argomento, personalizza il modello e copia il messaggio completo o l'email senza aprire finestre vuote.",
      subjectLabel: "Oggetto",
      messageLabel: "Modello Messaggio",
      copyMessageBtn: "Copia Messaggio",
      messageCopiedBtn: "Messaggio Copiato",
      copyEmailBtn: "Copia Email",
      emailCopiedBtn: "Email Copiata",
      openPrivacyBtn: "Apri Privacy e Opt-Out UMP",
      openDeleteSettingsBtn: "Vai a Impostazioni -> Elimina Account e Dati",
      topics: {
        bug: {
          label: "Segnala Bug",
          subject: "SudokuSync Bug Report (v1.0.3)",
          body: "Versione App: v1.0.3\nPiattaforma (Web / Android): \nSchermata / Funzione: \nPassaggi per riprodurre: \nComportamento atteso vs effettivo: ",
        },
        privacy: {
          label: "Privacy / Consenso UMP",
          subject: "SudokuSync Privacy & UMP Consent Inquiry (v1.0.3)",
          body: "Versione App: v1.0.3\nPiattaforma (Web / Android): \nTema (GDPR / CCPA / AdSense / AdMob AAID / UMP): \nDettagli richiesta: ",
        },
        deletion: {
          label: "Eliminazione Account e Dati",
          subject: "SudokuSync Account & Data Deletion Request (v1.0.3)",
          body: "Versione App: v1.0.3\nNickname / Email: \nRichiesta: Chiedo l'eliminazione permanente del mio profilo Firestore, record di gioco e token notifiche di SudokuSync.",
        },
      },
    },
    about: {
      publisherBadge: "Pubblicato da Mo Logic",
      publisherHeader: "Studio Indipendente & Standard Qualitativi",
      publisherText:
        "SudokuSync e sviluppato e pubblicato in modo indipendente da Mo Logic su Web (https://sudokusync.com) e Google Play Android (com.mologic.sudokusync). Offre un design pastello senza bordi con tema Chiaro/Scuro, supporto offline e accesso gratuito trasparente.",
      engineHeader: "Motore Deterministico 9x9 e Calibrazione Indizi",
      engineIntro:
        "Ogni griglia 9x9 nasce dal generatore Mulberry32 PRNG ed e verificata dal nostro motore logico umano e risolutore bitmask MRV per garantire matematicamente un'unica soluzione valida:",
      difficultySpecs: [
        {
          level: "EASY",
          label: "Facile",
          cluesBadge: "51 Indizi",
          summary: "Scansione rapida di righe, colonne e riquadri 3x3 ideale per iniziare.",
        },
        {
          level: "MEDIUM",
          label: "Medio",
          cluesBadge: "39 Indizi",
          summary: "Deduzioni bilanciate a piu passaggi tra settori intersecati.",
        },
        {
          level: "HARD",
          label: "Difficile",
          cluesBadge: "30 Indizi",
          summary: "Coppie, puntatori e gestione candidati con Note Automatiche.",
        },
        {
          level: "EXPERT",
          label: "Esperto",
          cluesBadge: "25 Indizi",
          summary: "Catene logiche profonde, schemi X-Wing e pochi indizi iniziali.",
        },
      ],
      multiplayerHeader: "Multigiocatore Live e Asincrono sulla Stessa Griglia",
      multiplayerText:
        "Condividi codici stanza a 6 cifre, PIN opzionale o link diretti ?room= per sfidarti sullo stesso schema 9x9 tra Web e Android. Con Google sincronizzi statistiche, lista Amici persistente, Giocatori Recenti e Modalita Fantasma.",
      assistantsText:
        "Sette Assistenti Intelligenti verificati personalizzano la partita: Evidenzia Numeri Identici, Mostra Numeri Rimanenti, Evidenzia Area Correlata, Cambio Automatico Numeri Completati, Rimozione Automatica Note, Note Automatiche (Difficile/Esperto) e Inserimento Rapido.",
      exploreHeader: "Esplora Regole, Strumenti & Supporto",
      exploreRulesLabel: "Hub Regole & Strategie",
      exploreSolverLabel: "Risolutore Sudoku",
      exploreDailyLabel: "Sfida Giornaliera",
      exploreContactLabel: "Contatti & Supporto",
    },
  },

  "pt-BR": {
    metaLine: "Data de Vigencia: 12 de agosto de 2026 | Versao: 1.0.3 | Plataforma: Web e App Android",
    privacy: {
      title: "Politica de Privacidade",
      intro:
        "No SudokuSync (https://sudokusync.com e nosso aplicativo oficial para Android), levamos a privacidade dos jogadores muito a serio. Esta Politica de Privacidade detalha os dados coletados, armazenados e processados em conformidade com GDPR, CCPA/CPRA, COPPA, Google Play Data Safety, Google AdSense e Google AdMob.",
      s1Header: "1. Coleta de Informacoes e Arquitetura de Armazenamento",
      s1Intro:
        "Operamos com minimizacao rigorosa de dados, diferenciando claramente armazenamento local no dispositivo e registros em nuvem:",
      s1LocalStorage: {
        label: "Armazenamento Local no Dispositivo (Apenas Navegador e Dispositivo):",
        text: "O localStorage e usado estritamente no seu dispositivo para salvar preferencias de interface (Modo Escuro, som, vibracao), limite de erros, temporizador, notas e partidas solo salvas. Esses dados nunca sao vendidos ou repassados a terceiros.",
      },
      s1Firestore: {
        label: "Google Cloud Firestore (Multiplayer em Tempo Real e Rankings):",
        intro: "Ao jogar desafios multiplayer ou partidas globais, apenas parametros nao sensiveis sao salvos:",
        bullets: [
          "ID anonimo do desafio, seed e nivel de dificuldade.",
          "Apelido de exibicao alfanumerico escolhido pelo jogador e ID de usuario.",
          "Metricas da partida: tempo de conclusao (segundos), erros e resultado de vitoria/derrota.",
        ],
      },
      s1Fcm: {
        label: "Firebase Cloud Messaging (FCM) e Identificadores:",
        text: "Quando voce permite notificacoes, um token anonimo FCM e um ID anonimo sao gerados apenas para enviar convites, alertas de duelo e conclusoes de partida. Tokens push nunca sao usados para rastreamento ou publicidade.",
        controlLabel: "Controle e Revogacao:",
        controlText: 'Ative ou desative notificacoes a qualquer momento em Configuracoes -> "Notificacoes Push" ou nas configuracoes do navegador/sistema.',
      },
      s1Auth: {
        label: "Firebase Authentication e Sincronizacao em Nuvem (Opcional):",
        text: "Ao entrar com Google via Firebase Authentication (Google OAuth), recebemos apenas credenciais basicas (Nome, e-mail e UID) exclusivamente para autenticar sua sessao e sincronizar estatisticas e partidas salvas entre dispositivos. Sessoes de Convidado rodam em cofre local fisicamente isolado, sem escrever em perfis privados. Nao coletamos senhas, contatos ou dados financeiros.",
      },
      s1ServerLogs: {
        label: "Logs de Infraestrutura e Diagnostico:",
        text: "Logs padrao de servidor (IP, user-agent, data/hora e controle de taxa) sao processados pelo Google Firebase Hosting e nosso servidor Express apenas para seguranca operacional e protecao contra DDoS.",
      },
      s2Header: "2. Publicidade, Google AdSense, AdMob SDK, AAID e Consentimento Google UMP",
      s2P1: "Para manter o SudokuSync gratuito usamos Google AdSense na Web e o Google AdMob SDK no Android. Na Web, cookies (incluindo DoubleClick / DART) e web beacons ajudam na exibicao de anuncios. No Android, o SDK AdMob pode processar o Android Advertising ID (AAID), interacoes e sinais tecnicos para entrega de anuncios e prevencao de fraudes.",
      s2P2: "Antes de exibir anuncios personalizados em regioes reguladas (incluindo EEE e Reino Unido), o app utiliza o Google UMP Consent SDK para que voce conceda, gerencie ou retire seu consentimento a qualquer momento.",
      s2BoxTitle: "Transparencia Publicitaria, Controles AAID e Portais de Opt-Out:",
      s2BoxIntro: "Voce pode desativar anuncios personalizados, redefinir seu ID de publicidade ou gerenciar cookies a qualquer momento:",
      s2AndroidAaid: {
        label: "Opt-Out / Redefinicao de AAID no Android:",
        text: "Abra Configuracoes do Android -> Google -> Anuncios (ou Configuracoes -> Privacidade -> Anuncios) para redefinir seu ID de publicidade ou desativar a personalizacao.",
      },
      s2Portals: OPT_OUT_PORTALS,
      s2Quality: {
        label: "Protecao contra Trafego Invalido:",
        text: "Bots automatizados, fazendas de cliques, cliques repetidos ou manipulacoes via proxy sao estritamente proibidos.",
      },
      s3Header: "3. Direito ao Esquecimento / Exclusao de Conta e Dados (Google Play e Padroes Globais)",
      s3Intro:
        "Sob GDPR, CCPA/CPRA, DPDP e as diretrizes Google Play Data Safety, todo jogador tem o direito absoluto de excluir permanentemente sua conta e registros associados.",
      s3BoxTitle: "Metodos de Exclusao de Conta e Dados:",
      s3InApp: {
        label: "Diretamente no App (Autoatendimento Instantaneo):",
        text: 'Abra Configuracoes -> SUPORTE E INFO -> Clique em "Excluir Conta e Dados". Isso apaga imediatamente seu perfil Firestore, documentos de presenca, salas ativas, tokens FCM, cache localStorage/sessionStorage e revoga sua sessao.',
      },
      s3Email: {
        label: "Solicitacao Web e E-mail (Canal Alternativo):",
        text: "Se nao tiver acesso ao app, envie uma solicitacao para sudokutogethermode@gmail.com informando seu apelido ou e-mail. Processamento confirmado em 24 a 48 horas uteis.",
      },
      s3RightsIntro: "Direitos legais adicionais no EEE, Reino Unido e no mundo:",
      s3RightsBullets: [
        { label: "Direito de Acesso:", text: "Solicitar copia dos seus registros de jogador e rankings." },
        { label: "Direito de Retificacao:", text: "Alterar seu apelido de exibicao no app a qualquer momento." },
        { label: "Limitacao e Portabilidade:", text: "Solicitar restricao de processamento ou exportacao de sua telemetria." },
      ],
      s4Header: "4. Direitos de Privacidade da California (CCPA / CPRA)",
      s4Text:
        "Residentes da California tem direito de conhecer e solicitar exclusao dos dados coletados. NAO vendemos nem compartilhamos seus dados pessoais com terceiros por compensacao financeira ou comercial.",
      s5Header: "5. Protecao a Privacidade Infantil (COPPA)",
      s5Text:
        "O SudokuSync nao coleta intencionalmente informacoes de menores de 13 anos (ou 16 no EEE/Reino Unido). Nao exigimos nome real, endereco ou telefone para jogar. Caso acredite que uma crianca enviou dados, contate sudokutogethermode@gmail.com para remocao imediata.",
      s6Header: "6. Retencao de Dados e Controles de Seguranca",
      s6Text:
        "Registros de partidas multiplayer com mais de 30 dias sao excluidos automaticamente. Todo trafego e criptografado com TLS/HTTPS e regras estritas do Firestore garantem propriedade dos documentos.",
      s7Header: "7. Fale Conosco",
      s7Intro: "Para duvidas sobre esta Politica de Privacidade, contate nossa equipe de protecao de dados:",
      s7TurnaroundLabel: "Prazo de Resposta:",
      s7TurnaroundValue: "Em ate 24 a 48 horas uteis.",
    },
    terms: {
      title: "Termos de Uso",
      intro:
        "Ao acessar, instalar ou jogar SudokuSync (https://sudokusync.com ou app oficial Android), voce concorda em cumprir estes Termos de Uso e todas as leis aplicaveis.",
      s1Header: "1. Descricao do Servico e Acesso Gratuito",
      s1Text:
        'O SudokuSync oferece puzzles de Sudoku gratuitos, salas multiplayer com semente deterministica, rankings em tempo real e ferramentas de logica "NO ESTADO EM QUE SE ENCONTRA" e "CONFORME DISPONIVEL".',
      s2Header: "2. Jogo Limpo, Anti-Trapaça e Padroes da Comunidade",
      s2Intro: "Para manter um ambiente justo baseado em merito, voce concorda estritamente com nossos padroes de Fair Play:",
      s2BoxTitle: "Politica de Fair Play e Anti-Cheat:",
      s2Bullets: [
        { label: "Sem Bots ou Solvers Automaticos:", text: "Proibido usar bots, scripts resolvedores, autoclickers ou navegadores headless." },
        { label: "Sem Adulteracao de Cliente ou Memoria:", text: "Proibido modificar codigo, injetar scripts de depuracao ou manipular valores em memoria." },
        { label: "Sem Manipulacao de Rede ou API:", text: "Proibido interceptar, falsificar ou sobrecarregar pacotes de sincronizacao." },
        { label: "Apelidos Apropriados:", text: "Nomes ofensivos ou abusivos sao proibidos; filtros automaticos e validacao alfanumerica sao aplicados." },
        { label: "Zero Fraude em Anuncios:", text: "Cliques automatizados ou enganosos em anuncios sao estritamente proibidos." },
      ],
      s2Penalty: {
        label: "Penalidades:",
        text: "Qualquer fraude resulta em desclassificacao imediata dos tempos, remocao dos rankings e suspensao de perfil ou dispositivo.",
      },
      s3Header: "3. Conta em Nuvem e Sincronizacao",
      s3Intro: "Jogue como convidado ou conecte sua conta Google:",
      s3Bullets: [
        { label: "Sincronizacao Entre Dispositivos:", text: "Sincroniza estatisticas, historico, melhores tempos, preferencias e jogos salvos entre Web e Android." },
        { label: "Confidencialidade:", text: "Voce e responsavel pela seguranca de sua conta Google e por todas as acoes em sua sessao." },
        { label: "Uso Pessoal e Nao Comercial:", text: "Apenas para entretenimento pessoal e desenvolvimento logico." },
        { label: "Disponibilidade e Encerramento:", text: "Oferecido em regime de melhor esforco e sujeito a suspensao em caso de abuso." },
        { label: "Exclusao Autonoma:", text: 'A qualquer momento em Configuracoes -> Suporte e Info -> "Excluir Conta e Dados" ou solicitando em sudokutogethermode@gmail.com.' },
      ],
      s4Header: "4. Propriedade Intelectual",
      s4Text:
        "Todos os motores de logica, sintese sonora procedural, interfaces, tokens Scrapbook Design System, graficos, logotipos e codigos sao propriedade intelectual do SudokuSync.",
      s5Header: "5. Anuncios de Terceiros (AdSense e AdMob)",
      s5Text:
        "O servico e mantido gratuito via Google AdSense (Web) e Google AdMob SDK (Android, incluindo anuncios intersticiais ou premiados sujeitos ao consentimento Google UMP). Nao nos responsabilizamos por sites anunciados.",
      s6Header: "6. Isencao de Garantias e Limitacao de Responsabilidade",
      s6Text:
        "O software e fornecido 'como esta', sem garantias expressas ou implicitas. Em nenhuma hipotese o SudokuSync sera responsavel por perda de dados ou lucros decorrentes do uso do jogo.",
      s7Header: "7. Exclusao de Conta e Rescisao",
      s7Text:
        'Voce pode parar de usar o app a qualquer momento e apagar todos os seus dados com "Excluir Conta e Dados" em Configuracoes. Reservamo-nos o direito de remover acessos em caso de violacoes.',
      s8Header: "8. Fale Conosco",
      s8Intro: "Para duvidas ou avisos legais sobre estes Termos de Uso, entre em contato:",
      s8TurnaroundLabel: "Prazo de Resposta:",
      s8TurnaroundValue: "Em ate 24 a 48 horas uteis.",
    },
    contactComposer: {
      sectionLabel: "Compositor de Mensagem de Suporte",
      helperText:
        "Escolha um tema, personalize a mensagem e copie o texto completo ou o e-mail sem abrir janelas em branco.",
      subjectLabel: "Assunto",
      messageLabel: "Modelo da Mensagem",
      copyMessageBtn: "Copiar Mensagem",
      messageCopiedBtn: "Mensagem Copiada",
      copyEmailBtn: "Copiar E-mail",
      emailCopiedBtn: "E-mail Copiado",
      openPrivacyBtn: "Abrir Privacidade e Opt-Out UMP",
      openDeleteSettingsBtn: "Ir para Configuracoes -> Excluir Conta e Dados",
      topics: {
        bug: {
          label: "Relatar Bug",
          subject: "SudokuSync Bug Report (v1.0.3)",
          body: "Versao do App: v1.0.3\nPlataforma (Web / Android): \nTela ou Recurso: \nPassos para reproduzir: \nEsperado vs Obtido: ",
        },
        privacy: {
          label: "Privacidade / Consentimento UMP",
          subject: "SudokuSync Privacy & UMP Consent Inquiry (v1.0.3)",
          body: "Versao do App: v1.0.3\nPlataforma (Web / Android): \nTema (GDPR / CCPA / AdSense / AdMob AAID / UMP): \nDetalhes: ",
        },
        deletion: {
          label: "Excluir Conta e Dados",
          subject: "SudokuSync Account & Data Deletion Request (v1.0.3)",
          body: "Versao do App: v1.0.3\nApelido / E-mail: \nSolicitacao: Por favor, excluam permanentemente meu perfil Firestore, registros de partidas/ranking e tokens de notificacao do SudokuSync.",
        },
      },
    },
    about: {
      publisherBadge: "Publicado por Mo Logic",
      publisherHeader: "Estudio Independente de Quebra-Cabecas",
      publisherText:
        "SudokuSync e desenvolvido e publicado de forma independente pela Mo Logic na Web (https://sudokusync.com) e no Google Play Android (com.mologic.sudokusync). Traz visual pastel sem bordas, temas Claro/Escuro, suporte offline e acesso gratuito transparente.",
      engineHeader: "Motor Deterministico 9x9 e Pistas Verificadas",
      engineIntro:
        "Todo tabuleiro 9x9 e criado com Mulberry32 PRNG e validado por nosso motor de logica humana e solver MRV para garantir matematicamente uma solucao unica antes da partida:",
      difficultySpecs: [
        {
          level: "EASY",
          label: "Facil",
          cluesBadge: "51 Pistas",
          summary: "Varredura direta em linhas, colunas e blocos 3x3 para aquecimento.",
        },
        {
          level: "MEDIUM",
          label: "Medio",
          cluesBadge: "39 Pistas",
          summary: "Deducoes logicas equilibradas em etapas por interseccoes.",
        },
        {
          level: "HARD",
          label: "Dificil",
          cluesBadge: "30 Pistas",
          summary: "Pares, ponteiros e anotacoes com Notas Automaticas integradas.",
        },
        {
          level: "EXPERT",
          label: "Especialista",
          cluesBadge: "25 Pistas",
          summary: "Cadeias profundas de eliminacao, X-Wing e poucas pistas iniciais.",
        },
      ],
      multiplayerHeader: "Multijogador Ao Vivo e Assincrono no Mesmo Tabuleiro",
      multiplayerText:
        "Jogue ao vivo ou de forma assincrona na mesma semente 9x9 usando codigos de sala de 6 digitos, PIN opcional e links ?room= entre Web e Android. Com Login Google, sincronize estatisticas, lista persistente de Amigos, Jogadores Recentes e Modo Fantasma.",
      assistantsText:
        "Sete Assistentes Inteligentes verificados auxiliam a resolucao: Destacar Numeros Identicos, Mostrar Numeros Restantes, Destacar Area Relacionada, Troca Automatica de Numeros Concluidos, Remover Notas Automaticamente, Notas Automaticas (Dificil/Especialista) e Preenchimento Rapido.",
      exploreHeader: "Explorar Regras, Ferramentas e Suporte",
      exploreRulesLabel: "Guia de Regras e Estrategias",
      exploreSolverLabel: "Solucionador de Sudoku",
      exploreDailyLabel: "Desafio Diario",
      exploreContactLabel: "Contato e Suporte",
    },
  },
};

