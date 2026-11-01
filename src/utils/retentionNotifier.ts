import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

// LocalStorage Keys for Pure Decoupled Tracking
export const STORAGE_LAST_PLAYED_DATE = "sudoku_last_played_date";
export const STORAGE_DAYS_INACTIVE = "sudoku_days_inactive";

const NOTIFICATION_ID = 83020;
const CHANNEL_ID = "daily-zen-reminder";

export interface NotificationCopy {
  title: string;
  body: string;
}

export type SupportedLang = "hi" | "en" | "ja" | "es" | "de" | "fr" | "ko" | "pt" | "ru";

export const NOTIFICATION_DICTIONARY: Record<"default" | "nightcap" | "inactive", Record<SupportedLang, NotificationCopy>> = {
  // A. DEFAULT (HAS NOT PLAYED TODAY)
  default: {
    hi: { title: "रात का ब्रेक 🌙", body: "रील्स छोड़ो, दिमाग शांत करो। 5 मिनट का एक शांत बोर्ड।" },
    en: { title: "Evening Reset 🌙", body: "Done scrolling? A quiet 5-min board is ready." },
    ja: { title: "夜のリセット 🌙", body: "スクロールを止めて、5分の静かなパズルを。" },
    es: { title: "Desconecta hoy 🌙", body: "¿Mucho scroll? Despeja tu mente en 5 minutos." },
    de: { title: "Feierabend 🌙", body: "Genug gescrollt? Zeit für 5 Minuten Sudoku." },
    fr: { title: "Pause du soir 🌙", body: "Assez scrollé ? 5 minutes de calme avec une grille." },
    ko: { title: "밤의 리셋 🌙", body: "숏폼 대신 5분, 머리를 식히는 시간." },
    pt: { title: "Pausa da noite 🌙", body: "Chega de feed. 5 minutos de foco zen." },
    ru: { title: "Вечерний отдых 🌙", body: "Хватит листать ленту. 5 минут спокойствия." }
  },
  // B. NIGHTCAP (HAS ALREADY PLAYED TODAY)
  nightcap: {
    hi: { title: "दिन का अंत ✨", body: "सोने से पहले एक आखिरी शांत राउंड?" },
    en: { title: "Nightcap ✨", body: "One last calm round before calling it a day?" },
    ja: { title: "おやすみ前に ✨", body: "眠る前に、もう1ゲームだけ静かに。" },
    es: { title: "Último round ✨", body: "¿Una última partida tranquila antes de dormir?" },
    de: { title: "Vor dem Schlafen ✨", body: "Noch eine ruhige Runde zum Abschluss?" },
    fr: { title: "Fin de journée ✨", body: "Une dernière grille calme avant de dormir ?" },
    ko: { title: "잠들기 전 ✨", body: "오늘을 마무리하는 조용한 한 판?" },
    pt: { title: "Antes de dormir ✨", body: "Uma última rodada tranquila para fechar o dia?" },
    ru: { title: "Перед сном ✨", body: "Еще один спокойный раунд перед сном?" }
  },
  // C. 3-DAY INACTIVITY
  inactive: {
    hi: { title: "2 मिनट का पॉज़ 🍃", body: "जब भी दिन में थोड़ा सुकून चाहिए हो, बोर्ड तैयार है।" },
    en: { title: "A 2-min pause 🍃", body: "Whenever you need a quiet breather, the grid is ready." },
    ja: { title: "2分の一服 🍃", body: "ひと息つきたいとき、パズルはいつでもここに。" },
    es: { title: "Pausa de 2 min 🍃", body: "Cuando necesites un respiro, el tablero te espera." },
    de: { title: "2-Minuten-Pause 🍃", body: "Wenn du eine kurze Pause brauchst: Dein Sudoku wartet." },
    fr: { title: "Pause de 2 min 🍃", body: "Besoin de souffler un instant ? Votre grille est prête." },
    ko: { title: "2분의 휴식 🍃", body: "조용한 휴식이 필요할 때, 언제든 열려 있어요." },
    pt: { title: "Pausa de 2 min 🍃", body: "Quando precisar de um respiro, o jogo estará aqui." },
    ru: { title: "2 минуты покоя 🍃", body: "Когда захочется выдохнуть — игра всегда готова." }
  }
};

function normalizeLang(lang: string): SupportedLang {
  if (!lang) return "en";
  const clean = lang.toLowerCase().trim();
  if (clean.startsWith("hi")) return "hi";
  if (clean.startsWith("ja")) return "ja";
  if (clean.startsWith("es")) return "es";
  if (clean.startsWith("de")) return "de";
  if (clean.startsWith("fr")) return "fr";
  if (clean.startsWith("ko")) return "ko";
  if (clean.startsWith("pt")) return "pt";
  if (clean.startsWith("ru")) return "ru";
  return "en";
}

function getTodayLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function computeNextZenTargetDate(): Date {
  const now = new Date();
  const target = new Date();
  target.setHours(20, 30, 0, 0);

  // If local time is already past 8:30 PM, schedule for tomorrow 8:30 PM
  if (now.getTime() >= target.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

export async function scheduleDailyZenNotification(lang: string, hasPlayedTodayOverride?: boolean): Promise<void> {
  // Web Graceful Degradation: If not native platform, silently exit
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const todayStr = getTodayLocalDateString();
    const lastPlayed = localStorage.getItem(STORAGE_LAST_PLAYED_DATE);
    const hasPlayedToday = hasPlayedTodayOverride ?? (lastPlayed === todayStr);

    let daysInactive = 0;
    if (lastPlayed) {
      const lastPlayedTime = new Date(`${lastPlayed}T00:00:00`).getTime();
      const todayTime = new Date(`${todayStr}T00:00:00`).getTime();
      if (!isNaN(lastPlayedTime) && !isNaN(todayTime)) {
        daysInactive = Math.max(0, Math.floor((todayTime - lastPlayedTime) / (1000 * 60 * 60 * 24)));
        localStorage.setItem(STORAGE_DAYS_INACTIVE, String(daysInactive));
      }
    }

    // Determine category tier
    let tier: "default" | "nightcap" | "inactive" = "default";
    if (daysInactive >= 3) {
      tier = "inactive";
    } else if (hasPlayedToday) {
      tier = "nightcap";
    } else {
      tier = "default";
    }

    const normLang = normalizeLang(lang);
    const copy = NOTIFICATION_DICTIONARY[tier][normLang] || NOTIFICATION_DICTIONARY[tier].en;

    // Check permissions
    const permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== "granted") {
      const reqStatus = await LocalNotifications.requestPermissions();
      if (reqStatus.display !== "granted") {
        return;
      }
    }

    // Create / ensure channel exists on Android
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "Daily Zen Reminder",
      importance: 3, // Default/Low - gentle banner, no loud alarms
      visibility: 1, // Public lock-screen banner
      vibration: true
    }).catch(() => {
      // Channel creation error safeguard for non-Android platforms
    });

    // Cancel existing reminder with same ID before rescheduling
    await LocalNotifications.cancel({
      notifications: [{ id: NOTIFICATION_ID }]
    }).catch(() => { });

    const targetDate = computeNextZenTargetDate();

    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_ID,
          channelId: CHANNEL_ID,
          title: copy.title,
          body: copy.body,
          schedule: {
            at: targetDate,
            allowWhileIdle: true
          }
        }
      ]
    });
  } catch (err) {
    console.warn("[RetentionNotifier] Failed to schedule daily zen notification:", err);
  }
}

export function recordGamePlayedAndReschedule(lang: string): void {
  try {
    const todayStr = getTodayLocalDateString();
    localStorage.setItem(STORAGE_LAST_PLAYED_DATE, todayStr);
    localStorage.setItem(STORAGE_DAYS_INACTIVE, "0");
    scheduleDailyZenNotification(lang, true).catch(() => { });
  } catch (err) {
    console.warn("[RetentionNotifier] Failed to record game played date:", err);
  }
}

