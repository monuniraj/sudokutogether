// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker.
firebase.initializeApp({
  apiKey: "AIzaSyB0Jdg1RBxsEUTyoWFnEdRm-XcjoA6gFDc",
  authDomain: "sudoku-together-mode.firebaseapp.com",
  projectId: "sudoku-together-mode",
  storageBucket: "sudoku-together-mode.firebasestorage.app",
  messagingSenderId: "116330285995",
  appId: "1:116330285995:web:3640f3df0d5dc1f73ce0ee",
  measurementId: "G-NKRBL6CL4M"
});

const messaging = firebase.messaging();

const PUSH_TRANSLATIONS = {
  en: {
    duelInviteTitle: "Sudoku Duel Challenge!",
    duelInviteBody: (from) => `${from} challenged you to a Sudoku duel!`,
    duelCompleteTitle: "Puzzle Race Finished",
    duelCompleteBody: (name) => `${name} finished your challenge! Tap to see who won.`,
    defaultPlayer: "A player",
    genericInviteBody: "You have a new game invitation!"
  },
  hi: {
    duelInviteTitle: "सुडोकू मुकाबला!",
    duelInviteBody: (from) => `${from} ने आपको सुडोकू मुकाबले का चैलेंज भेजा है!`,
    duelCompleteTitle: "Puzzle Race Finished",
    duelCompleteBody: (name) => `${name} ने चैलेंज पूरा कर लिया! देखें कौन जीता।`,
    defaultPlayer: "एक खिलाड़ी",
    genericInviteBody: "आपके पास एक नया खेल निमंत्रण है!"
  },
  de: {
    duelInviteTitle: "Sudoku-Duell!",
    duelInviteBody: (from) => `${from} fordert dich zu einem Sudoku-Duell heraus!`,
    duelCompleteTitle: "Puzzle Race Finished",
    duelCompleteBody: (name) => `${name} hat die Challenge beendet! Tippe, um das Ergebnis zu sehen.`,
    defaultPlayer: "Ein Spieler",
    genericInviteBody: "Du hast eine neue Spieleinladung!"
  },
  ja: {
    duelInviteTitle: "数独の対戦リクエスト！",
    duelInviteBody: (from) => `${from}さんから数独の対戦を挑まれました！`,
    duelCompleteTitle: "Puzzle Race Finished",
    duelCompleteBody: (name) => `${name}さんがパズルを解き終えました！結果を確認しましょう。`,
    defaultPlayer: "プレイヤー",
    genericInviteBody: "新しい対戦リクエストが届きました！"
  },
  ko: {
    duelInviteTitle: "스도쿠 대결 신청!",
    duelInviteBody: (from) => `${from}님이 스도쿠 대결을 신청했습니다!`,
    duelCompleteTitle: "Puzzle Race Finished",
    duelCompleteBody: (name) => `${name}님이 퍼즐을 완료했습니다! 승자를 확인해 보세요.`,
    defaultPlayer: "플레이어",
    genericInviteBody: "새로운 게임 초대가 도착했습니다!"
  },
  es: {
    duelInviteTitle: "¡Duelo de Sudoku!",
    duelInviteBody: (from) => `¡${from} te ha desafiado a un duelo de Sudoku!`,
    duelCompleteTitle: "Puzzle Race Finished",
    duelCompleteBody: (name) => `¡${name} terminó el desafío! Toca para ver quién ganó.`,
    defaultPlayer: "Un jugador",
    genericInviteBody: "¡Tienes una nueva invitación de juego!"
  },
  fr: {
    duelInviteTitle: "Duel de Sudoku !",
    duelInviteBody: (from) => `${from} vous a défié en duel de Sudoku !`,
    duelCompleteTitle: "Puzzle Race Finished",
    duelCompleteBody: (name) => `${name} a terminé le défi ! Appuyez pour voir le vainqueur.`,
    defaultPlayer: "Un joueur",
    genericInviteBody: "Vous avez une nouvelle invitation à jouer !"
  },
  it: {
    duelInviteTitle: "Sfida a Sudoku!",
    duelInviteBody: (from) => `${from} ti ha sfidato a un duello di Sudoku!`,
    duelCompleteTitle: "Puzzle Race Finished",
    duelCompleteBody: (name) => `${name} ha completato la sfida! Tocca per scoprire chi ha vinto.`,
    defaultPlayer: "Un giocatore",
    genericInviteBody: "Hai un nuovo invito di gioco!"
  },
  "pt-BR": {
    duelInviteTitle: "Duelo de Sudoku!",
    duelInviteBody: (from) => `${from} desafiou você para um duelo de Sudoku!`,
    duelCompleteTitle: "Puzzle Race Finished",
    duelCompleteBody: (name) => `${name} concluiu o desafio! Toque para ver quem venceu.`,
    defaultPlayer: "Um jogador",
    genericInviteBody: "Você tem um novo convite de jogo!"
  }
};

function resolveLanguage(lang) {
  if (!lang || typeof lang !== "string") {
    const raw = (typeof navigator !== "undefined" && ((navigator.languages && navigator.languages[0]) || navigator.language)) || "en";
    return resolveLanguage(raw);
  }
  const normalized = lang.toLowerCase().trim();
  if (normalized.startsWith("hi")) return "hi";
  if (normalized.startsWith("de")) return "de";
  if (normalized.startsWith("ja")) return "ja";
  if (normalized.startsWith("ko")) return "ko";
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("fr")) return "fr";
  if (normalized.startsWith("it")) return "it";
  if (normalized === "pt-br" || normalized.startsWith("pt")) return "pt-BR";
  if (PUSH_TRANSLATIONS[lang]) return lang;
  return "en";
}

// Background message handler
messaging.onBackgroundMessage(async (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const data = payload.data || {};

  // 1. SELF-NOTIFICATION SUPPRESSION: Player who solved/completed must NEVER receive external notification
  if (data.type === 'challenge_completed') {
    const completedByUid = data.completedByUid || data.finisherUid || data.senderId || data.fromUserId;
    const recipientUid = data.recipientUid || data.toUserId || data.targetUid;
    if (completedByUid && recipientUid && completedByUid === recipientUid) {
      console.log('[firebase-messaging-sw.js] Suppressed self-notification in background SW');
      return;
    }
  }

  // 2. FOREGROUND PUSH SUPPRESSION: Suppress OS push banners when app is actively open and in view
  try {
    const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const isAppInForeground = windowClients.some(client => client.visibilityState === 'visible');
    if (isAppInForeground) {
      console.log('[firebase-messaging-sw.js] App is actively in foreground (visible). Suppressing OS-level push banner.');
      return;
    }
  } catch (err) {
    console.warn('[firebase-messaging-sw.js] Error checking window visibility:', err);
  }

  const lang = resolveLanguage(data.lang);
  const t = PUSH_TRANSLATIONS[lang] || PUSH_TRANSLATIONS.en;

  let notificationTitle = payload.notification?.title || data.title;
  let notificationBody = payload.notification?.body || data.body;

  // 3. UNIFIED TAXONOMY: Strictly "Puzzle Race Finished" for all challenge completions
  if (data.type === 'challenge_completed') {
    notificationTitle = "Puzzle Race Finished";
    const finisher = data.finisherName || t.defaultPlayer;
    if (!notificationBody) notificationBody = t.duelCompleteBody(finisher);
  } else if (!notificationTitle || !notificationBody) {
    const fromName = data.fromName || data.senderName;
    if (!notificationTitle) notificationTitle = t.duelInviteTitle;
    if (!notificationBody) notificationBody = fromName ? t.duelInviteBody(fromName) : t.genericInviteBody;
  }

  const notificationOptions = {
    body: notificationBody,
    icon: payload.notification?.icon || '/pwa-192x192.png',
    badge: payload.notification?.badge || '/favicon-48x48.png',
    vibrate: [300, 150, 300],
    renotify: true,
    tag: 'sudoku-duel-alert',
    requireInteraction: false,
    silent: false,
    data: data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle tap on notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data || {};
  const gameId = data.gameId || data.challengeId;
  const password = data.password || '';
  const lang = resolveLanguage(data.lang);
  const t = PUSH_TRANSLATIONS[lang] || PUSH_TRANSLATIONS.en;
  const senderName = data.senderName || data.fromName || t.defaultPlayer;
  
  let targetUrl = '/';
  if (data.type === 'challenge_completed') {
    const roomCode = data.roomCode || gameId || '';
    targetUrl = `/?room=${encodeURIComponent(roomCode)}&view=results`;
  } else if (gameId) {
    targetUrl = `/?challenge=${encodeURIComponent(gameId)}&pw=${encodeURIComponent(password)}&sender=${encodeURIComponent(senderName)}`;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it and redirect
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(location.origin) && 'focus' in client) {
          if (data.type === 'challenge_completed') {
            const roomCode = data.roomCode || gameId || '';
            client.postMessage({ 
              type: 'challenge_completed', 
              roomCode, 
              fromName: senderName,
              completedByUid: data.completedByUid || data.finisherUid
            });
          } else {
            client.postMessage({ type: 'navigate_invite', gameId, password, senderName });
          }
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
