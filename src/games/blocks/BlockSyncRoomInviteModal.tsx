import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock,
  Copy,
  Link2,
  Lock,
  Plus,
  Unlock,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { auth } from "../../firebase";
import { useFriendPresence } from "../../hooks/useFriendPresence";
import { useTranslation } from "../../i18n/useTranslation";
import { formatActiveStatus } from "../../utils/formatTimestamp";
import {
  getFocusableElements,
  handleRovingMenuArrowKey,
  useTopmostModalKeyboardLayer,
} from "../../utils/keyboardControls";
import { getActiveAuthUid, loadVault } from "../../utils/storageEngine";
import type { BlockSyncRoomMode } from "./blocksRoomEngine";

export interface BlockSyncRoomInvitePlayer {
  id: string;
  authUid?: string;
  name: string;
  status?: "online" | "offline" | "busy";
  lastPlayedAt?: number;
  lastActive?: number;
  isFriend?: boolean;
  inviteStatus?: "idle" | "sent" | "joined" | "declined";
}

export interface BlockSyncRoomInviteCooldownState {
  isJoined: boolean;
  isPendingSent: boolean;
  isDeclined: boolean;
  isLeft: boolean;
  remainingSeconds: number;
  joinedAt?: number;
}

export interface BlockSyncRoomInviteModalProps {
  isOpen: boolean;
  roomCode: string;
  roomMode: BlockSyncRoomMode;
  roomTimeLimitSec?: 120 | 180 | 300 | 600;
  isRoomLocked: boolean;
  isHost: boolean;
  roomPin?: string;
  isOnline: boolean;
  darkMode: boolean;
  currentUserId?: string;
  multiplayerPlayers: BlockSyncRoomInvitePlayer[];
  getFriendStatus?: (
    playerId: string,
    fallbackStatus?: "online" | "offline" | "busy"
  ) => "online" | "offline" | "busy";
  getFriendLastActive?: (
    playerId: string,
    fallbackTs?: number
  ) => number | undefined;
  getInviteCooldownState: (playerId: string) => BlockSyncRoomInviteCooldownState;
  handleToggleFriend: (playerId: string, playerName?: string) => void;
  handleInviteFriend: (playerId: string) => void;
  handleReinviteAll: (
    targetPlayers?: Array<{ id: string; name: string }>
  ) => void;
  isInvitingAll: boolean;
  onShareLink: () => void;
  copyToClipboard: (text: string) => void;
  showCopiedToast: (msg: string) => void;
  onClose: () => void;
  onSwitchRoomLobby: () => void;
  playClickSound: () => void;
}

export const BlockSyncRoomInviteModal: React.FC<BlockSyncRoomInviteModalProps> = ({
  isOpen,
  roomCode,
  roomMode,
  roomTimeLimitSec = 180,
  isRoomLocked,
  isHost,
  roomPin = "",
  isOnline,
  darkMode,
  currentUserId,
  multiplayerPlayers,
  getFriendStatus: getFriendStatusProp,
  getFriendLastActive: getFriendLastActiveProp,
  getInviteCooldownState,
  handleToggleFriend,
  handleInviteFriend,
  handleReinviteAll,
  isInvitingAll,
  onShareLink,
  copyToClipboard,
  showCopiedToast,
  onClose,
  onSwitchRoomLobby,
  playClickSound,
}) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [activeTab, setActiveTab] = useState<"recent" | "friends">("recent");
  const [copiedCode, setCopiedCode] = useState(false);

  const effectiveUserId =
    currentUserId ||
    auth.currentUser?.uid ||
    getActiveAuthUid() ||
    loadVault("guest").profile?.id;

  const sanitizedPlayers = useMemo(() => {
    return (multiplayerPlayers || []).filter((p) => {
      if (!p || !p.id) return false;
      if (effectiveUserId && p.id === effectiveUserId) return false;
      if (p.id === "GUEST_ANON" || p.id === "me") return false;
      return true;
    });
  }, [multiplayerPlayers, effectiveUserId]);

  const playerIds = useMemo(
    () => sanitizedPlayers.map((p) => p.id),
    [sanitizedPlayers]
  );

  // Only subscribe to hook presence if caller did not pass live friend-presence resolvers
  const presenceFallback = useFriendPresence(
    getFriendStatusProp ? null : effectiveUserId,
    getFriendStatusProp ? [] : playerIds
  );

  const resolveFriendStatus =
    getFriendStatusProp ?? presenceFallback.getFriendStatus;
  const resolveFriendLastActive =
    getFriendLastActiveProp ?? presenceFallback.getFriendLastActive;

  const { friends, recentPlayers } = useMemo(() => {
    const sortPlayers = (list: BlockSyncRoomInvitePlayer[]) => {
      return [...list].sort((a, b) => {
        const stateA = getInviteCooldownState(a.id);
        const stateB = getInviteCooldownState(b.id);
        const isRoomA = Boolean(stateA.isJoined || stateA.isLeft);
        const isRoomB = Boolean(stateB.isJoined || stateB.isLeft);
        if (isRoomA !== isRoomB) return isRoomA ? -1 : 1;

        if (isRoomA && isRoomB) {
          const timeA = stateA.joinedAt || a.lastPlayedAt || 0;
          const timeB = stateB.joinedAt || b.lastPlayedAt || 0;
          if (timeA !== timeB) return timeB - timeA;
        }

        const statusA = resolveFriendStatus(a.id, a.status);
        const statusB = resolveFriendStatus(b.id, b.status);
        const isOnlineA = statusA === "online";
        const isOnlineB = statusB === "online";
        if (isOnlineA !== isOnlineB) return isOnlineA ? -1 : 1;

        if (a.lastPlayedAt !== b.lastPlayedAt) {
          return (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0);
        }
        return (a.name || "").localeCompare(b.name || "");
      });
    };

    return {
      friends: sortPlayers(sanitizedPlayers.filter((p) => p.isFriend)),
      recentPlayers: sortPlayers(sanitizedPlayers),
    };
  }, [sanitizedPlayers, getInviteCooldownState, resolveFriendStatus]);

  const handleDismiss = useCallback(() => {
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setCopiedCode(false);
    const timer = window.setTimeout(() => {
      const active = document.activeElement as HTMLElement | null;
      if (active && dialogRef.current?.contains(active)) return;
      const resumeBtn = dialogRef.current?.querySelector<HTMLElement>(
        "#block-sync-room-invite-resume"
      );
      if (resumeBtn) {
        resumeBtn.focus({ preventScroll: true });
      } else {
        const focusables = getFocusableElements(dialogRef.current);
        focusables[0]?.focus({ preventScroll: true });
      }
    }, 30);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // Register on shared topmost modal keyboard stack (Escape/Backspace + Arrow navigation + Tab trap)
  useTopmostModalKeyboardLayer(isOpen, {
    id: "block-sync-room-invite-modal",
    priority: 30,
    containerRef: dialogRef,
    restoreFocus: true,
    trapFocus: true,
    onEscape: () => {
      playClickSound();
      handleDismiss();
      return true;
    },
    onBackspace: () => {
      playClickSound();
      handleDismiss();
      return true;
    },
    onKeyDown: (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return false;
      const root = dialogRef.current;
      if (!root) return false;

      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Home" ||
        e.key === "End"
      ) {
        const focusables = getFocusableElements(root);
        if (focusables.length === 0) return false;
        const handled = handleRovingMenuArrowKey(e, focusables, "both");
        if (handled) {
          const nextFocused = document.activeElement as HTMLElement | null;
          nextFocused?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
        return handled;
      }
      return false;
    },
  });

  if (!isOpen) return null;

  const displayedList = activeTab === "friends" ? friends : recentPlayers;
  const rushMinutes = Math.max(1, Math.round(roomTimeLimitSec / 60));

  const lockLabel = isRoomLocked
    ? isHost && roomPin
      ? `PIN: ${roomPin}`
      : "LOCKED"
    : "OPEN";

  const copyCodeHandler = () => {
    playClickSound();
    copyToClipboard(roomCode);
    showCopiedToast(t("roomCodeCopied"));
    setCopiedCode(true);
    window.setTimeout(() => setCopiedCode(false), 1400);
  };

  return (
    <div
      data-block-sync-dialog="true"
      className={`fixed inset-0 z-[60] flex items-center justify-center p-3 transition-opacity duration-150 ${
        darkMode
          ? "bg-black/60 backdrop-blur-[3px]"
          : "bg-slate-900/25 backdrop-blur-[2px]"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playClickSound();
          handleDismiss();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Block Sync Room ${roomCode}`}
        className={`w-[calc(100%-24px)] max-w-[400px] max-h-[calc(100dvh-28px-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] rounded-3xl p-5 flex flex-col gap-3.5 select-none overflow-hidden ${
          darkMode
            ? "bg-[#141A21] text-slate-100 border border-white/10 shadow-[0_18px_46px_rgba(0,0,0,0.58)]"
            : "bg-[#F4F8FB] text-[#2C3E50] border border-[#D4E4F0] shadow-[0_14px_40px_rgba(15,23,42,0.12)]"
        }`}
      >
        {/* HEADER: Eyebrow + CODE + Copy + Mode/Lock Badges + Circular Close */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span
                className={`text-[10px] font-sans font-black tracking-[0.18em] uppercase leading-none ${
                  darkMode ? "text-slate-200" : "text-[#2C3E50]"
                }`}
              >
                BLOCK{" "}
                <span className={darkMode ? "text-[#38BDF8]" : "text-[#2B8CEE]"}>
                  SYNC
                </span>
              </span>

              <div className="mt-1.5 flex items-center gap-2 min-w-0">
                <span className="text-lg font-mono font-black tracking-tight tabular-nums truncate">
                  CODE: {roomCode}
                </span>
                <button
                  type="button"
                  onClick={copyCodeHandler}
                  aria-label="Copy room code"
                  title="Copy room code"
                  className={`w-8 h-8 rounded-xl border-none cursor-pointer flex items-center justify-center transition-all active:scale-95 shrink-0 ${
                    darkMode
                      ? "bg-[#1B242E] hover:bg-[#24303D] text-[#38BDF8]"
                      : "bg-[#E6F1F8] hover:bg-[#D5E6F3] text-[#2B8CEE]"
                  }`}
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                handleDismiss();
              }}
              aria-label={t("closeTooltip")}
              title={t("closeTooltip")}
              className={`w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center transition-all active:scale-95 shrink-0 ${
                darkMode
                  ? "bg-[#1B242E] hover:bg-[#24303D] text-slate-200"
                  : "bg-[#E6F1F8] hover:bg-[#D5E6F3] text-[#49637A]"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Badge + Lock/Open Status Pill */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
                roomMode === "rush"
                  ? darkMode
                    ? "bg-[#0EA5E9]/20 text-[#38BDF8]"
                    : "bg-[#E0F2FE] text-[#0369A1]"
                  : darkMode
                    ? "bg-[#1B242E] text-slate-200"
                    : "bg-[#E6F1F8] text-[#2C3E50]"
              }`}
            >
              {roomMode === "rush" && <Clock className="w-3 h-3 shrink-0" />}
              {roomMode === "rush" ? `TIME RUSH · ${rushMinutes}M` : "CLASSIC"}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider tabular-nums ${
                isRoomLocked
                  ? darkMode
                    ? "bg-[#4c0519]/75 text-[#fecdd3]"
                    : "bg-[#FFE4E6] text-[#9D174D]"
                  : darkMode
                    ? "bg-[#10B981]/18 text-[#34D399]"
                    : "bg-[#D1FAE5] text-[#065F46]"
              }`}
            >
              {isRoomLocked ? (
                <Lock className="w-3 h-3 shrink-0" />
              ) : (
                <Unlock className="w-3 h-3 shrink-0" />
              )}
              {lockLabel}
            </span>
          </div>
        </div>

        {/* OFFLINE BANNER */}
        {!isOnline && (
          <div
            className={`w-full py-2 px-3 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0 ${
              darkMode
                ? "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                : "bg-amber-500/15 border border-amber-500/30 text-amber-700"
            }`}
          >
            <AlertTriangle className="w-4 h-4 stroke-[2.5] text-amber-500 shrink-0" />
            <span>{t("offlineWarning")}</span>
          </div>
        )}

        {/* MIDDLE ROSTER: RECENT / FRIENDS Tabs + Scrollable List */}
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          <div
            className={`flex w-full rounded-2xl p-1 shrink-0 ${
              darkMode ? "bg-[#1B242E]" : "bg-[#E6F1F8]/90"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveTab("recent");
              }}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer truncate ${
                activeTab === "recent"
                  ? darkMode
                    ? "bg-[#243242] text-slate-100 shadow-xs"
                    : "bg-white text-[#2C3E50] shadow-xs"
                  : darkMode
                    ? "bg-transparent text-slate-400 hover:text-slate-200"
                    : "bg-transparent text-[#5B748B] hover:text-[#2C3E50]"
              }`}
            >
              {t("recentTab", { count: recentPlayers.length })}
            </button>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveTab("friends");
              }}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer truncate ${
                activeTab === "friends"
                  ? darkMode
                    ? "bg-[#243242] text-slate-100 shadow-xs"
                    : "bg-white text-[#2C3E50] shadow-xs"
                  : darkMode
                    ? "bg-transparent text-slate-400 hover:text-slate-200"
                    : "bg-transparent text-[#5B748B] hover:text-[#2C3E50]"
              }`}
            >
              {t("friendsTab", { count: friends.length })}
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-2 p-1.5 -mx-1.5">
            {displayedList.length === 0 ? (
              <span
                className={`text-xs italic py-6 text-center block ${
                  darkMode ? "text-slate-400" : "text-[#5B748B]"
                }`}
              >
                {activeTab === "friends"
                  ? t("noFriendsAdded")
                  : sanitizedPlayers.length === 0
                    ? t("noPastPlayers")
                    : t("noRecentOpponents")}
              </span>
            ) : (
              displayedList.map((player) => {
                const {
                  isJoined,
                  isPendingSent,
                  isDeclined,
                  isLeft,
                  remainingSeconds,
                } = getInviteCooldownState(player.id);
                const effectiveStatus = resolveFriendStatus(
                  player.id,
                  player.status
                );

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-2.5 px-3 rounded-2xl transition-all duration-150 shrink-0 w-full ${
                      darkMode
                        ? "bg-[#1B242E] text-slate-100 border border-white/[0.05]"
                        : "bg-white/95 text-[#2C3E50] border border-[#DCEAF5] shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {effectiveStatus === "online" && (
                        <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-400 animate-pulse-gentle" />
                      )}

                      {player.isFriend ? (
                        <span
                          className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${
                            darkMode
                              ? "bg-[#022c22] text-[#d1fae5]"
                              : "bg-[#D1FAE5] text-[#065F46]"
                          }`}
                        >
                          {t("friendBadge")}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            handleToggleFriend(player.id, player.name);
                          }}
                          className={`w-7 h-7 rounded-lg border-none cursor-pointer shrink-0 transition-all active:scale-95 flex items-center justify-center ${
                            darkMode
                              ? "bg-[#243242] hover:bg-[#2C3D50] text-slate-200"
                              : "bg-[#E6F1F8] hover:bg-[#D5E6F3] text-[#49637A]"
                          }`}
                          title={t("addFriend")}
                          aria-label={t("addFriend")}
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      )}

                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs font-sans truncate">
                          {player.name}
                        </span>
                        <span
                          className={`text-[9.5px] capitalize ${
                            darkMode ? "text-slate-400" : "text-[#647D94]"
                          }`}
                        >
                          {formatActiveStatus(
                            effectiveStatus,
                            resolveFriendLastActive(
                              player.id,
                              player.lastActive || player.lastPlayedAt
                            )
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isJoined ? (
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl inline-flex items-center gap-1 ${
                            darkMode
                              ? "bg-[#022c22] text-[#d1fae5]"
                              : "bg-[#D1FAE5] text-[#065F46]"
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          {t("joinedStatus")}
                        </span>
                      ) : isLeft ? (
                        <button
                          type="button"
                          disabled
                          className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${
                            darkMode
                              ? "bg-[#243242] text-slate-300"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {t("leftStatus", { seconds: remainingSeconds })}
                        </button>
                      ) : isPendingSent ? (
                        <button
                          type="button"
                          disabled
                          className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${
                            darkMode
                              ? "bg-[#451a03] text-[#fef08a]"
                              : "bg-[#FFF99D] text-[#854D0E]"
                          }`}
                        >
                          {t("sentStatus", { seconds: remainingSeconds })}
                        </button>
                      ) : isDeclined ? (
                        <button
                          type="button"
                          disabled
                          className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${
                            darkMode
                              ? "bg-[#4c0519] text-[#fecdd3]"
                              : "bg-[#FFE4E6] text-[#9D174D]"
                          }`}
                        >
                          {t("declinedStatus", { seconds: remainingSeconds })}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!isOnline) return;
                            playClickSound();
                            handleInviteFriend(player.id);
                          }}
                          disabled={!isOnline}
                          className={`text-[9.5px] font-mono font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border-none transition-all active:scale-95 shadow-xs ${
                            !isOnline
                              ? "cursor-not-allowed opacity-40 pointer-events-none"
                              : "cursor-pointer"
                          } ${
                            darkMode
                              ? "bg-[#0EA5E9]/20 hover:bg-[#0EA5E9]/30 text-[#38BDF8]"
                              : "bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1]"
                          }`}
                        >
                          {t("inviteAction")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* FOOTER CTAs (Fairness Lock — NO REPLAY BOARD in active competitive rooms) */}
        <div className="flex flex-col gap-2 shrink-0 pt-1">
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              type="button"
              onClick={() => {
                if (!isOnline) return;
                playClickSound();
                handleReinviteAll(displayedList);
              }}
              disabled={!isOnline || (!isInvitingAll && displayedList.length === 0)}
              className={`w-full py-2.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-2xl border-none transition-all duration-150 text-center flex items-center justify-center gap-1.5 shadow-xs ${
                !isOnline || (!isInvitingAll && displayedList.length === 0)
                  ? "cursor-not-allowed opacity-40"
                  : "cursor-pointer active:scale-95"
              } ${
                isInvitingAll
                  ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                  : darkMode
                    ? "bg-[#1B242E] hover:bg-[#24303D] text-slate-200"
                    : "bg-[#E6F1F8] hover:bg-[#D5E6F3] text-[#2C3E50]"
              }`}
            >
              {isInvitingAll ? (
                <>
                  <XCircle className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                  <span className="truncate">{t("stopAction")}</span>
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                  <span className="truncate">{t("reinviteAllAction")}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isOnline) return;
                playClickSound();
                onShareLink();
              }}
              disabled={!isOnline}
              className={`w-full py-2.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-2xl border-none transition-all duration-150 text-center flex items-center justify-center gap-1.5 shadow-xs ${
                !isOnline
                  ? "cursor-not-allowed opacity-40 pointer-events-none"
                  : "cursor-pointer active:scale-95"
              } ${
                darkMode
                  ? "bg-[#0c4a6e]/55 hover:bg-[#0c4a6e]/85 text-[#bae6fd]"
                  : "bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1]"
              }`}
            >
              <Link2 className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              <span className="truncate">{t("shareLinkAction")}</span>
            </button>
          </div>

          <button
            id="block-sync-room-invite-resume"
            type="button"
            onClick={() => {
              playClickSound();
              handleDismiss();
            }}
            className={`w-full py-3.5 px-4 text-xs sm:text-sm font-sans font-black uppercase tracking-wider rounded-2xl border-none cursor-pointer transition-all duration-150 text-center active:scale-[0.985] ${
              darkMode
                ? "bg-[#0EA5E9] hover:bg-[#38BDF8] text-[#082032] shadow-[0_8px_20px_rgba(14,165,233,0.28)]"
                : "bg-[#2B8CEE] hover:bg-[#1D7AD9] text-white shadow-[0_8px_20px_rgba(43,140,238,0.24)]"
            }`}
          >
            {t("resumeAction")}
          </button>

          <button
            type="button"
            id="block-sync-room-invite-switch-lobby"
            onClick={() => {
              playClickSound();
              onSwitchRoomLobby();
            }}
            className={`self-center py-1 px-2.5 rounded-lg border-none bg-transparent cursor-pointer text-[11px] font-sans font-bold tracking-wide transition-colors ${
              darkMode
                ? "text-slate-400 hover:text-[#38BDF8]"
                : "text-[#5B748B] hover:text-[#2B8CEE]"
            }`}
          >
            Switch Room / Lobby
          </button>
        </div>
      </div>
    </div>
  );
};
