const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

const PUSH_TRANSLATIONS = {
  en: {
    duelInviteTitle: "Sudoku Duel Challenge!",
    duelInviteBody: (from) => `${from} challenged you to a Sudoku duel!`,
    duelCompleteTitle: "🏆 Duel Completed!",
    duelCompleteBody: (name) => `${name} finished your challenge! Tap to see who won.`,
    defaultPlayer: "A player"
  },
  hi: {
    duelInviteTitle: "सुडोकू मुकाबला!",
    duelInviteBody: (from) => `${from} ने आपको सुडोकू मुकाबले का चैलेंज भेजा है!`,
    duelCompleteTitle: "🏆 मुकाबला खत्म हुआ!",
    duelCompleteBody: (name) => `${name} ने चैलेंज पूरा कर लिया! देखें कौन जीता।`,
    defaultPlayer: "एक खिलाड़ी"
  },
  de: {
    duelInviteTitle: "Sudoku-Duell!",
    duelInviteBody: (from) => `${from} fordert dich zu einem Sudoku-Duell heraus!`,
    duelCompleteTitle: "🏆 Duell beendet!",
    duelCompleteBody: (name) => `${name} hat die Challenge beendet! Tippe, um das Ergebnis zu sehen.`,
    defaultPlayer: "Ein Spieler"
  },
  ja: {
    duelInviteTitle: "数独の対戦リクエスト！",
    duelInviteBody: (from) => `${from}さんから数独の対戦を挑まれました！`,
    duelCompleteTitle: "🏆 対戦完了！",
    duelCompleteBody: (name) => `${name}さんがパズルを解き終えました！結果を確認しましょう。`,
    defaultPlayer: "プレイヤー"
  },
  ko: {
    duelInviteTitle: "스도쿠 대결 신청!",
    duelInviteBody: (from) => `${from}님이 스도쿠 대결을 신청했습니다!`,
    duelCompleteTitle: "🏆 대결 완료!",
    duelCompleteBody: (name) => `${name}님이 퍼즐을 완료했습니다! 승자를 확인해 보세요.`,
    defaultPlayer: "플레이어"
  },
  es: {
    duelInviteTitle: "¡Duelo de Sudoku!",
    duelInviteBody: (from) => `¡${from} te ha desafiado a un duelo de Sudoku!`,
    duelCompleteTitle: "🏆 ¡Duelo finalizado!",
    duelCompleteBody: (name) => `¡${name} terminó el desafío! Toca para ver quién ganó.`,
    defaultPlayer: "Un jugador"
  },
  fr: {
    duelInviteTitle: "Duel de Sudoku !",
    duelInviteBody: (from) => `${from} vous a défié en duel de Sudoku !`,
    duelCompleteTitle: "🏆 Duel terminé !",
    duelCompleteBody: (name) => `${name} a terminé le défi ! Appuyez pour voir le vainqueur.`,
    defaultPlayer: "Un joueur"
  },
  it: {
    duelInviteTitle: "Sfida a Sudoku!",
    duelInviteBody: (from) => `${from} ti ha sfidato a un duello di Sudoku!`,
    duelCompleteTitle: "🏆 Duello terminato!",
    duelCompleteBody: (name) => `${name} ha completato la sfida! Tocca per scoprire chi ha vinto.`,
    defaultPlayer: "Un giocatore"
  },
  "pt-BR": {
    duelInviteTitle: "Duelo de Sudoku!",
    duelInviteBody: (from) => `${from} desafiou você para um duelo de Sudoku!`,
    duelCompleteTitle: "🏆 Duelo finalizado!",
    duelCompleteBody: (name) => `${name} concluiu o desafio! Toque para ver quem venceu.`,
    defaultPlayer: "Um jogador"
  }
};

/**
 * Resolve language code with graceful fallbacks
 */
function resolveLanguage(lang) {
  if (!lang || typeof lang !== "string") return "en";
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

/**
 * Extract valid FCM tokens from a user document
 */
function extractTokens(userData) {
  const tokens = new Set();
  if (userData) {
    if (Array.isArray(userData.fcmTokens)) {
      userData.fcmTokens.forEach((t) => {
        if (typeof t === "string" && t.trim()) tokens.add(t.trim());
      });
    }
    if (typeof userData.fcmToken === "string" && userData.fcmToken.trim()) {
      tokens.add(userData.fcmToken.trim());
    }
  }
  return Array.from(tokens);
}

/**
 * Clean up invalid / unregistered tokens from a user document
 */
async function pruneBadTokens(userId, tokenList, sendResponse) {
  if (!sendResponse || sendResponse.failureCount === 0) return;
  const badTokens = [];
  sendResponse.responses.forEach((resp, idx) => {
    if (!resp.success) {
      const errCode = resp.error?.code;
      if (
        errCode === "messaging/invalid-registration-token" ||
        errCode === "messaging/registration-token-not-registered"
      ) {
        badTokens.push(tokenList[idx]);
      }
    }
  });
  if (badTokens.length > 0) {
    try {
      await db.collection("users").doc(userId).update({
        fcmTokens: admin.firestore.FieldValue.arrayRemove(...badTokens)
      });
      console.log(`[Push] Pruned ${badTokens.length} stale FCM token(s) for user ${userId}`);
    } catch (e) {
      console.warn(`[Push] Failed to prune bad tokens for user ${userId}:`, e);
    }
  }
}

/**
 * Trigger A: onInviteCreated
 * Listens to /invites/{inviteId} on create.
 * Dispatches high-priority notification to recipient.
 */
exports.onInviteCreated = onDocumentCreated("invites/{inviteId}", async (event) => {
  const snap = event.data;
  if (!snap) return null;
  const invite = snap.data();
  if (!invite || invite.status !== "pending") return null;

  const toUserId = invite.toUserId;
  if (!toUserId) {
    console.log(`[onInviteCreated] No toUserId specified on invite ${event.params.inviteId}`);
    return null;
  }

  try {
    const userDoc = await db.collection("users").doc(toUserId).get();
    if (!userDoc.exists) {
      console.log(`[onInviteCreated] User ${toUserId} does not exist`);
      return null;
    }

    const tokens = extractTokens(userDoc.data());
    if (tokens.length === 0) {
      console.log(`[onInviteCreated] User ${toUserId} has no registered FCM tokens`);
      return null;
    }

    const roomCode = String(invite.roomCode || invite.gameId || "");
    const inviteId = String(event.params.inviteId);

    // Resolve recipient language preference
    const userData = userDoc.data() || {};
    const targetLang = resolveLanguage(userData.language || userData.lang || userData.locale || invite.language || invite.lang);
    const t = PUSH_TRANSLATIONS[targetLang] || PUSH_TRANSLATIONS.en;
    const fromName = String(invite.fromName || t.defaultPlayer);

    const notifTitle = t.duelInviteTitle;
    const notifBody = t.duelInviteBody(fromName);

    const message = {
      tokens: tokens,
      notification: {
        title: notifTitle,
        body: notifBody
      },
      data: {
        type: "new_invite",
        roomCode: roomCode,
        gameId: roomCode,
        inviteId: inviteId,
        fromName: fromName,
        title: notifTitle,
        body: notifBody,
        lang: targetLang
      },
      android: {
        priority: "high",
        ttl: 172800 * 1000, // 48 hours in milliseconds
        notification: {
          channelId: "sudoku_duels",
          sound: "default",
          defaultSound: true,
          defaultVibrateTimings: true,
          priority: "max",
          visibility: "public"
        }
      },
      webpush: {
        headers: {
          Urgency: "high"
        },
        notification: {
          icon: "/pwa-192x192.png",
          badge: "/favicon-48x48.png",
          vibrate: [300, 150, 300],
          renotify: true,
          requireInteraction: false,
          tag: "sudoku-duel-alert"
        },
        fcmOptions: {
          link: `/?room=${encodeURIComponent(roomCode)}&toUserId=${encodeURIComponent(toUserId)}&inviteId=${encodeURIComponent(inviteId)}`
        }
      }
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log(`[onInviteCreated] Dispatched to ${tokens.length} device(s) for user ${toUserId}. Success: ${response.successCount}, Failures: ${response.failureCount}`);

    await pruneBadTokens(toUserId, tokens, response);
    return response;
  } catch (err) {
    console.error(`[onInviteCreated] Failed to dispatch push for invite ${event.params.inviteId}:`, err);
    return null;
  }
});

/**
 * Helper to process challenge completion and notify opponents
 */
async function processChallengeCompleted(roomCode, finisherUid, finisherName) {
  try {
    const recipientUids = new Set();

    // 1. Check room document
    const roomDoc = await db.collection("rooms").doc(roomCode).get();
    if (roomDoc.exists) {
      const roomData = roomDoc.data() || {};
      const hostId = roomData.hostId || roomData.creatorId || roomData.createdBy || roomData.userId;
      if (hostId && hostId !== finisherUid) recipientUids.add(hostId);
    }

    // 2. Check players in /rooms/{roomCode}/players
    const playersSnap = await db.collection("rooms").doc(roomCode).collection("players").get();
    playersSnap.docs.forEach((docSnap) => {
      if (docSnap.id && docSnap.id !== finisherUid) recipientUids.add(docSnap.id);
      const data = docSnap.data();
      const pId = data.id || data.userId;
      if (pId && pId !== finisherUid) recipientUids.add(pId);
    });

    // 3. Query invites associated with this roomCode
    const invitesSnap = await db.collection("invites").where("roomCode", "==", roomCode).get();
    invitesSnap.docs.forEach((docSnap) => {
      const inv = docSnap.data();
      if (inv.fromUserId && inv.fromUserId !== finisherUid) recipientUids.add(inv.fromUserId);
      if (inv.toUserId && inv.toUserId !== finisherUid) recipientUids.add(inv.toUserId);
    });

    if (recipientUids.size === 0) {
      console.log(`[onChallengeCompleted] No opponents or initiators found for room ${roomCode}`);
      return null;
    }

    for (const recipientId of recipientUids) {
      const userDoc = await db.collection("users").doc(recipientId).get();
      if (!userDoc.exists) continue;

      const userData = userDoc.data() || {};
      const tokens = extractTokens(userData);
      if (tokens.length === 0) continue;

      // Resolve recipient language preference
      const targetLang = resolveLanguage(userData.language || userData.lang || userData.locale);
      const t = PUSH_TRANSLATIONS[targetLang] || PUSH_TRANSLATIONS.en;
      const cleanFinisher = String(finisherName || t.defaultPlayer);

      const notifTitle = t.duelCompleteTitle;
      const notifBody = t.duelCompleteBody(cleanFinisher);

      const message = {
        tokens: tokens,
        notification: {
          title: notifTitle,
          body: notifBody
        },
        data: {
          type: "challenge_completed",
          roomCode: String(roomCode),
          finisherName: cleanFinisher,
          title: notifTitle,
          body: notifBody,
          lang: targetLang
        },
        android: {
          priority: "high",
          ttl: 172800 * 1000, // 48 hours in milliseconds
          notification: {
            channelId: "sudoku_duels",
            sound: "default",
            defaultSound: true,
            defaultVibrateTimings: true,
            priority: "max",
            visibility: "public",
            tag: "sudoku_result_" + roomCode
          }
        },
        webpush: {
          headers: {
            Urgency: "high"
          },
          notification: {
            icon: "/pwa-192x192.png",
            badge: "/favicon-48x48.png",
            vibrate: [300, 150, 300],
            renotify: true,
            requireInteraction: false,
            tag: "sudoku-duel-alert"
          },
          fcmOptions: {
            link: `/?room=${encodeURIComponent(roomCode)}&view=results`
          }
        }
      };

      const response = await messaging.sendEachForMulticast(message);
      console.log(`[onChallengeCompleted] Sent results ping to user ${recipientId}. Success: ${response.successCount}, Failures: ${response.failureCount}`);
      await pruneBadTokens(recipientId, tokens, response);
    }
  } catch (err) {
    console.error(`[onChallengeCompleted] Error processing room ${roomCode}:`, err);
  }
}

/**
 * Trigger B: onChallengeCompleted (rooms/{roomCode}/players/{uid})
 */
exports.onChallengeCompleted = onDocumentWritten("rooms/{roomCode}/players/{uid}", async (event) => {
  const before = event.data?.before?.data() || {};
  const after = event.data?.after?.data() || {};

  const isTerminalStatus = (st) => st === "completed" || st === "won" || st === "victory" || st === "mistake_game_over" || st === "failed";
  const wasFinished = isTerminalStatus(before.status) || before.isWon === true || (before.timeTaken !== undefined && before.timeTaken > 0) || (before.timeSec !== undefined && before.timeSec > 0);
  const isFinished = isTerminalStatus(after.status) || after.isWon === true || (after.timeTaken !== undefined && after.timeTaken > 0) || (after.timeSec !== undefined && after.timeSec > 0);

  if (!isFinished || wasFinished) return null;

  const finisherUid = event.params.uid;
  const finisherName = after.playerName || after.name || "Opponent";
  const roomCode = String(event.params.roomCode);

  return processChallengeCompleted(roomCode, finisherUid, finisherName);
});

/**
 * Trigger B fallback: onParticipantCompleted (DEPRECATED - deduplicated to prevent dual chimes)
 * Retain strictly onChallengeCompleted listening on rooms/{roomCode}/players/{uid}.
 */
// exports.onParticipantCompleted = onDocumentWritten("challenge_results/{roomCode}/participants/{uid}", async (event) => {
//   const before = event.data?.before?.data() || {};
//   const after = event.data?.after?.data() || {};
//
//   const wasFinished = before.status === "completed" || before.status === "won" || before.status === "victory" || before.isWon === true || (before.timeTaken !== undefined && before.timeTaken > 0) || (before.timeSec !== undefined && before.timeSec > 0);
//   const isFinished = after.status === "completed" || after.status === "won" || after.status === "victory" || after.isWon === true || (after.timeTaken !== undefined && after.timeTaken > 0) || (after.timeSec !== undefined && after.timeSec > 0);
//
//   if (!isFinished || wasFinished) return null;
//
//   const finisherUid = event.params.uid;
//   const finisherName = after.playerName || after.name || "Opponent";
//   const roomCode = String(event.params.roomCode);
//
//   return processChallengeCompleted(roomCode, finisherUid, finisherName);
// });
