import React from "react";
import { Check, X, Plus } from "lucide-react";
import { formatMatchTimestamp } from "../../utils/formatTimestamp";

export interface CompletedGameRecord {
  id: string;
  date: string;
  difficulty: string;
  isWon: boolean;
  timeSec: number;
  mistakes: number;
  maxMistakes: number;
  isChallenge?: boolean;
}

export interface MultiplayerPlayerRecord {
  id: string;
  name: string;
  isFriend?: boolean;
  status?: string;
}

export interface StatsModalProps {
  darkMode: boolean;
  winsCount: number;
  gamesPlayed: number;
  bestTimes: Record<string, number | null>;
  activeHistoryTab: "completed" | "saved" | "friends";
  handleSelectHistoryTab: (tab: "completed" | "saved" | "friends") => void;
  completedGames: CompletedGameRecord[];
  savedGames: CompletedGameRecord[];
  multiplayerPlayers: MultiplayerPlayerRecord[];
  requestedFriendIds: string[];
  handleReplayGame: (game: any) => void;
  handleSaveGame: (game: any) => void;
  handleOpenRankings: (game: any) => void;
  handleToggleFriend: (friendId: string, name: string) => void;
  handleAddRecentFriend: (player: any) => void;
  formatTimer: (seconds: number) => string;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  darkMode,
  winsCount,
  gamesPlayed,
  bestTimes,
  activeHistoryTab,
  handleSelectHistoryTab,
  completedGames,
  savedGames,
  multiplayerPlayers,
  requestedFriendIds,
  handleReplayGame,
  handleSaveGame,
  handleOpenRankings,
  handleToggleFriend,
  handleAddRecentFriend,
  formatTimer
}) => {
  const [activePlayersTab, setActivePlayersTab] = React.useState<"recent" | "friends">("recent");
  return (
    <div
      className={`p-4 md:p-8 flex-1 w-full flex flex-col items-center justify-start overflow-y-auto pb-10 select-none pt-[calc(85px+env(safe-area-inset-top,0px))] lg:pt-[130px] transition-colors duration-300 ${
        darkMode ? "text-stone-200" : "bg-[#FDFBF7] text-stone-900"
      }`}
    >
      {/* Content list */}
      <div
        className="flex-1 w-full max-w-sm mx-auto flex flex-col gap-6 justify-center items-center pb-6"
        id="status-screen-inner-container"
      >
        {/* 📊 Player Statistics Bento-Grid (All visual, beautifully crafted!) */}
        <div className="w-full grid grid-cols-2 gap-4 shrink-0">
          {/* Gauge Card: Win Rate */}
          <div
            className={`p-5 flex flex-col items-center justify-center text-center relative rounded-2xl border-none transition-all duration-300 ${
              darkMode
                ? "bg-[#0c4a6e]/20 text-sky-200"
                : "bg-[#E0F2FE]/60 shadow-[0_4px_20px_rgba(3,105,161,0.06)]"
            }`}
          >
            <span className="text-xs font-semibold tracking-wider text-stone-600 dark:text-zinc-300 uppercase mb-3">
              Win Rate
            </span>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke={darkMode ? "rgba(56,189,248,0.1)" : "rgba(3,105,161,0.08)"}
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke={darkMode ? "#38BDF8" : "#0369A1"}
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 26}
                  strokeDashoffset={2 * Math.PI * 26 * (1 - winsCount / Math.max(1, gamesPlayed))}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`absolute text-lg md:text-xl font-semibold font-sans ${
                  darkMode ? "text-sky-100" : "text-sky-950"
                }`}
              >
                {Math.round((winsCount / Math.max(1, gamesPlayed)) * 100)}%
              </span>
            </div>
            <span
              className={`text-xs font-sans mt-3.5 font-bold uppercase tracking-wider leading-none ${
                darkMode ? "text-[#38BDF8]" : "text-[#0369A1]"
              }`}
            >
              {winsCount} Wins / {gamesPlayed} Plays
            </span>
          </div>

          {/* Personal Best Records Card */}
          <div
            className={`p-5 flex flex-col text-left font-sans rounded-2xl justify-between h-full border-none transition-all duration-300 ${
              darkMode
                ? "bg-[#2e1065]/20 text-purple-200"
                : "bg-[#F3E8FF]/60 shadow-[0_4px_20px_rgba(107,33,168,0.06)]"
            }`}
          >
            <div>
              <span className="text-xs font-semibold tracking-wider text-stone-600 dark:text-zinc-300 uppercase flex items-center justify-center text-center mb-4">
                Personal Bests
              </span>

              <div className="flex flex-col gap-2.5">
                {[
                  {
                    label: "Easy",
                    timeSec: bestTimes.EASY,
                    fallback: "--:--",
                    colorClass: "text-[#065F46] dark:text-emerald-400"
                  },
                  {
                    label: "Medium",
                    timeSec: bestTimes.MEDIUM,
                    fallback: "--:--",
                    colorClass: "text-[#854D0E] dark:text-amber-400"
                  },
                  {
                    label: "Hard",
                    timeSec: bestTimes.HARD,
                    fallback: "--:--",
                    colorClass: "text-[#6B21A8] dark:text-purple-400"
                  },
                  {
                    label: "Expert",
                    timeSec: bestTimes.EXPERT,
                    fallback: "--:--",
                    colorClass: "text-[#0369A1] dark:text-sky-400"
                  }
                ].map((tier) => {
                  let displayStr = tier.fallback;
                  if (tier.timeSec && tier.timeSec > 0) {
                    displayStr = formatTimer(tier.timeSec);
                  }

                  return (
                    <div
                      key={tier.label}
                      className="flex items-center justify-between text-[11px] font-sans"
                    >
                      <span
                        className={`font-semibold uppercase tracking-wider text-xs ${
                          darkMode ? "text-purple-300/80" : "text-purple-700/85"
                        }`}
                      >
                        {tier.label}
                      </span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          darkMode ? "text-purple-200" : "text-[#6B21A8]"
                        }`}
                      >
                        {displayStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ⚔️ DUAL-SECTION COMPETE HISTORY MODULE */}
        <div
          className={`w-full rounded-2xl flex flex-col font-sans shrink-0 overflow-hidden border-none transition-all duration-300 ${
            darkMode
              ? "bg-[#9d174d]/20 text-[#fbcfe8]"
              : "bg-[#FDF2F8]/45 shadow-[0_4px_20px_rgba(219,39,119,0.02)]"
          }`}
          id="game-history-tabs-container"
        >
          {/* Tab Selectors - Borderless, clean negative space inside */}
          <div
            className={`grid grid-cols-3 p-1.5 font-sans text-xs items-center justify-center font-semibold uppercase tracking-wider gap-1 ${
              darkMode ? "bg-[#9d174d]/5" : "bg-[#FDF2F8]/20"
            }`}
          >
            <button
              onClick={() => handleSelectHistoryTab("completed")}
              className={`py-2 px-2.5 rounded-xl border-none cursor-pointer transition-all flex items-center justify-center text-center gap-1.5 uppercase font-bold tracking-wider ${
                activeHistoryTab === "completed"
                  ? darkMode
                    ? "bg-[#9d174d]/55 text-[#fbcfe8]"
                    : "bg-[#FCE7F3] text-[#9D174D] shadow-xs"
                  : darkMode
                  ? "text-pink-400/70 hover:text-[#fbcfe8] bg-transparent"
                  : "text-pink-600/75 hover:text-[#9D174D] bg-transparent"
              }`}
            >
              <span>History</span>
              <span
                className={`text-[9.5px] px-1.5 py-0.5 rounded-md leading-none flex items-center justify-center ${
                  darkMode ? "bg-[#9d174d]/45 text-[#fbcfe8]/80" : "bg-pink-100/50 text-[#9D174D]/80"
                }`}
              >
                {completedGames.length}
              </span>
            </button>

            <button
              onClick={() => handleSelectHistoryTab("saved")}
              className={`py-2 px-2.5 rounded-xl border-none cursor-pointer transition-all flex items-center justify-center text-center gap-1.5 uppercase font-bold tracking-wider ${
                activeHistoryTab === "saved"
                  ? darkMode
                    ? "bg-[#9d174d]/55 text-[#fbcfe8]"
                    : "bg-[#FCE7F3] text-[#9D174D] shadow-xs"
                  : darkMode
                  ? "text-pink-400/70 hover:text-[#fbcfe8] bg-transparent"
                  : "text-pink-600/75 hover:text-[#9D174D] bg-transparent"
              }`}
            >
              <span>Saved</span>
              <span
                className={`text-[9.5px] px-1.5 py-0.5 rounded-md leading-none flex items-center justify-center ${
                  darkMode ? "bg-[#9d174d]/45 text-[#fbcfe8]/80" : "bg-pink-100/50 text-[#9D174D]/80"
                }`}
              >
                {savedGames.length}
              </span>
            </button>

            <button
              onClick={() => handleSelectHistoryTab("friends")}
              className={`py-2 px-2.5 rounded-xl border-none cursor-pointer transition-all flex items-center justify-center text-center gap-1.5 uppercase font-bold tracking-wider ${
                activeHistoryTab === "friends"
                  ? darkMode
                    ? "bg-[#9d174d]/55 text-[#fbcfe8]"
                    : "bg-[#FCE7F3] text-[#9D174D] shadow-xs"
                  : darkMode
                  ? "text-pink-400/70 hover:text-[#fbcfe8] bg-transparent"
                  : "text-pink-600/75 hover:text-[#9D174D] bg-transparent"
              }`}
            >
              <span>Friends</span>
              <span
                className={`text-[9.5px] px-1.5 py-0.5 rounded-md leading-none flex items-center justify-center ${
                  darkMode ? "bg-[#9d174d]/45 text-[#fbcfe8]/80" : "bg-pink-100/50 text-[#9D174D]/80"
                }`}
              >
                {multiplayerPlayers.filter((p) => p.isFriend).length}
              </span>
            </button>
          </div>

          {/* Tab Panels */}
          <div className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar text-left font-sans">
            {activeHistoryTab === "completed" ? (
              completedGames.length === 0 ? (
                <div className="py-8 text-center text-stone-500 font-sans text-xs">
                  No completed games yet.
                </div>
              ) : (
                completedGames.map((game) => (
                  <div
                    key={game.id}
                    className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all text-xs ${
                      darkMode
                        ? "bg-zinc-950/45 border-zinc-800 text-stone-300"
                        : "bg-stone-50/40 border-stone-200/50 text-stone-850"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-xs font-sans font-black uppercase tracking-wider px-2.5 py-0.5 rounded flex items-center gap-1 ${
                          game.isWon
                            ? darkMode
                              ? "bg-emerald-950/20 text-emerald-400"
                              : "bg-emerald-100 text-emerald-850"
                            : darkMode
                            ? "bg-rose-950/20 text-rose-450"
                            : "bg-rose-100 text-rose-850"
                        }`}
                      >
                        {game.isWon ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Won</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 stroke-[3]" />
                            <span>Failed</span>
                          </>
                        )}
                      </span>

                      <span className="font-sans text-xs md:text-sm font-medium text-stone-500">
                        {formatMatchTimestamp(game.date)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-1.5 mb-1 bg-transparent">
                          <span
                            className={`text-[10px] font-sans font-medium tracking-wider uppercase px-2 py-0.5 rounded-md ${
                              game.isChallenge
                                ? darkMode
                                  ? "bg-[#2e1065] text-[#e9d5ff] border border-[#3b0764] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                                  : "bg-[#F3E8FF] text-[#6B21A8] border border-[#D8B4FE] shadow-[0_2px_8px_rgba(107,33,168,0.06)]"
                                : darkMode
                                ? "bg-[#172554] text-[#dbeafe]"
                                : "bg-[#eff6ff] text-[#172554]"
                            }`}
                          >
                            {game.isChallenge ? "Multi" : "Solo"}
                          </span>
                        </div>
                        <span
                          className={`font-sans font-semibold text-sm uppercase leading-none ${
                            darkMode ? "text-stone-200" : "text-stone-850"
                          }`}
                        >
                          {game.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5 font-sans text-xs font-black">
                        <div className="flex flex-col items-end leading-tight">
                          <span className="text-[10px] lg:text-xs text-stone-500 uppercase font-sans mb-1">
                            Time
                          </span>
                          <span>{formatTimer(game.timeSec)}</span>
                        </div>
                        <div className="flex flex-col items-end leading-tight">
                          <span className="text-[10px] lg:text-xs text-stone-500 uppercase font-sans mb-1">
                            Errs
                          </span>
                          <span className="text-rose-500">
                            {game.mistakes}/{game.maxMistakes}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3 Equal-Width Action Buttons: Replay, Save, Rankings */}
                    <div className="grid grid-cols-3 gap-1.5 mt-1.5 pt-2 border-t border-dashed border-stone-250 dark:border-zinc-800">
                      <button
                        onClick={() => handleReplayGame(game)}
                        className={`py-1.5 px-2 font-sans text-[10px] font-semibold tracking-wider uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                          darkMode
                            ? "bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60"
                            : "bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534]"
                        }`}
                      >
                        Replay
                      </button>
                      <button
                        onClick={() => handleSaveGame(game)}
                        className={`py-1.5 px-2 font-sans text-[10px] font-semibold tracking-wider uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                          savedGames.some((r) => r.id === game.id)
                            ? darkMode
                              ? "bg-yellow-950/50 text-yellow-300 font-black border border-yellow-800/40"
                              : "bg-[#FEFCE8] text-[#854D0E] font-black border border-yellow-200"
                            : darkMode
                            ? "bg-yellow-950/30 text-yellow-400 hover:bg-yellow-950/50"
                            : "bg-[#FEFCE8] hover:bg-[#FEF9C3] text-[#854D0E]"
                        }`}
                      >
                        {savedGames.some((r) => r.id === game.id) ? "Saved" : "Save"}
                      </button>
                      <button
                        onClick={() => handleOpenRankings(game)}
                        className={`py-1.5 px-2 font-sans text-[10px] font-semibold tracking-wider uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                          darkMode
                            ? "bg-rose-950/40 hover:bg-rose-950/60 text-rose-300"
                            : "bg-[#FFE4E6] hover:bg-[#FECDD3] text-[#9F1239]"
                        }`}
                      >
                        Rankings
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : activeHistoryTab === "saved" ? (
              savedGames.length === 0 ? (
                <div className="py-8 text-center text-stone-500 font-sans text-xs">
                  No saved games yet. Click Save on a completed game item to save it!
                </div>
              ) : (
                savedGames.map((game) => (
                  <div
                    key={game.id}
                    className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all text-xs ${
                      darkMode
                        ? "bg-zinc-950/45 border-zinc-800 text-stone-300"
                        : "bg-stone-50/40 border-stone-200/50 text-stone-850"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-xs font-sans font-black uppercase tracking-wider px-2.5 py-0.5 rounded flex items-center gap-1 ${
                          game.isWon
                            ? darkMode
                              ? "bg-emerald-950/20 text-emerald-400"
                              : "bg-emerald-100 text-emerald-850"
                            : darkMode
                            ? "bg-rose-950/20 text-rose-450"
                            : "bg-rose-100 text-rose-850"
                        }`}
                      >
                        {game.isWon ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Won</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 stroke-[3]" />
                            <span>Failed</span>
                          </>
                        )}
                      </span>

                      <span className="font-sans text-xs md:text-sm font-medium text-stone-500">
                        {formatMatchTimestamp(game.date, "Saved Config")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-1.5 mb-1 bg-transparent">
                          <span
                            className={`text-[10px] font-sans font-medium tracking-wider uppercase px-2 py-0.5 rounded-md ${
                              game.isChallenge
                                ? darkMode
                                  ? "bg-[#2e1065] text-[#e9d5ff] border border-[#3b0764] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                                  : "bg-[#F3E8FF] text-[#6B21A8] border border-[#D8B4FE] shadow-[0_2px_8px_rgba(107,33,168,0.06)]"
                                : darkMode
                                ? "bg-[#172554] text-[#dbeafe]"
                                : "bg-[#eff6ff] text-[#172554]"
                            }`}
                          >
                            {game.isChallenge ? "Multi" : "Solo"}
                          </span>
                        </div>
                        <span
                          className={`font-sans font-semibold text-sm uppercase leading-none ${
                            darkMode ? "text-stone-200" : "text-stone-850"
                          }`}
                        >
                          {game.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5 font-sans text-xs font-black">
                        <div className="flex flex-col items-end leading-tight">
                          <span className="text-[10px] lg:text-xs text-stone-500 uppercase font-sans mb-1">
                            Time
                          </span>
                          <span>{formatTimer(game.timeSec)}</span>
                        </div>
                        <div className="flex flex-col items-end leading-tight">
                          <span className="text-[10px] lg:text-xs text-stone-500 uppercase font-sans mb-1">
                            Errs
                          </span>
                          <span className="text-rose-500">
                            {game.mistakes}/{game.maxMistakes}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3 Equal-Width Action Buttons: Replay, Unsave, Rankings */}
                    <div className="grid grid-cols-3 gap-1.5 mt-1.5 pt-2 border-t border-dashed border-stone-250 dark:border-zinc-800">
                      <button
                        onClick={() => handleReplayGame(game)}
                        className={`py-1.5 px-2 font-sans text-[10px] font-semibold tracking-wider uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                          darkMode
                            ? "bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60"
                            : "bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534]"
                        }`}
                      >
                        Replay
                      </button>
                      <button
                        onClick={() => handleSaveGame(game)}
                        className={`py-1.5 px-2 font-sans text-[10px] font-semibold tracking-wider uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                          darkMode
                            ? "bg-yellow-950/30 text-yellow-400 hover:bg-yellow-950/50"
                            : "bg-[#FEFCE8] hover:bg-[#FEF9C3] text-[#854D0E]"
                        }`}
                      >
                        Unsave
                      </button>
                      <button
                        onClick={() => handleOpenRankings(game)}
                        className={`py-1.5 px-2 font-sans text-[10px] font-semibold tracking-wider uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                          darkMode
                            ? "bg-rose-950/40 hover:bg-rose-950/60 text-rose-300"
                            : "bg-[#FFE4E6] hover:bg-[#FECDD3] text-[#9F1239]"
                        }`}
                      >
                        Rankings
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : (
              /* FRIENDS TAB PANEL */
              <div className="flex flex-col gap-4">
                {(() => {
                  const friends = multiplayerPlayers.filter(p => p.isFriend).sort((a, b) => {
                    if (a.lastPlayedAt !== b.lastPlayedAt) return (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0);
                    return a.name.localeCompare(b.name);
                  });
                  
                  const recentPlayers = [...multiplayerPlayers].sort((a, b) => {
                    if (a.lastPlayedAt !== b.lastPlayedAt) return (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0);
                    return a.name.localeCompare(b.name);
                  });

                  return (
                    <div className="flex flex-col h-full">
                      {/* Segmented Control Header */}
                      <div className="flex items-center justify-center px-1 shrink-0 mb-3 mt-1">
                        <div className={`flex w-full rounded-lg p-1 ${darkMode ? "bg-black/35" : "bg-stone-200/50"}`}>
                          <button
                            onClick={() => setActivePlayersTab('recent')}
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all border-none cursor-pointer ${
                              activePlayersTab === 'recent'
                                ? (darkMode ? "bg-[#2A0818] text-[#fbcfe8] shadow-sm" : "bg-white text-[#9D174D] shadow-sm")
                                : (darkMode ? "bg-transparent text-pink-300/60 hover:text-[#fbcfe8]" : "bg-transparent text-stone-500 hover:text-stone-700")
                            }`}
                          >
                            Recent ({recentPlayers.length})
                          </button>
                          <button
                            onClick={() => setActivePlayersTab('friends')}
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all border-none cursor-pointer ${
                              activePlayersTab === 'friends'
                                ? (darkMode ? "bg-[#2A0818] text-[#fbcfe8] shadow-sm" : "bg-white text-[#9D174D] shadow-sm")
                                : (darkMode ? "bg-transparent text-pink-300/60 hover:text-[#fbcfe8]" : "bg-transparent text-stone-500 hover:text-stone-700")
                            }`}
                          >
                            Friends ({friends.length})
                          </button>
                        </div>
                      </div>

                      {/* Tab Content */}
                      <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto no-scrollbar pb-2">
                        {activePlayersTab === 'friends' && (
                          friends.length === 0 ? (
                            <div className="py-6 text-center text-stone-500 font-sans text-xs italic">
                              No friends added yet. Tap [+] next to recent players to add them!
                            </div>
                          ) : (
                            friends.map((friend) => (
                              <div
                                key={friend.id}
                                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all shrink-0 ${
                                  darkMode
                                    ? "bg-zinc-950/45 border-zinc-800 text-stone-200"
                                    : "bg-stone-50/45 border-stone-200/50 text-stone-850"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${
                                    darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]"
                                  }`}>
                                    ✓
                                  </span>
                                  <div className="flex flex-col truncate">
                                    <span className="font-sans font-bold text-xs truncate">{friend.name}</span>
                                    <span className="text-[9.5px] text-stone-400 capitalize">
                                      {friend.status || "online"}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleToggleFriend(friend.id, friend.name)}
                                  className="shrink-0 text-[10.5px] font-sans font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 border-none bg-transparent cursor-pointer transition-all active:scale-95 px-2 py-1"
                                >
                                  Remove
                                </button>
                              </div>
                            ))
                          )
                        )}

                        {activePlayersTab === 'recent' && (
                          recentPlayers.length === 0 ? (
                            <div className="py-6 text-center text-stone-500 font-sans text-xs italic">
                              No recent opponents yet. Start a match to find players!
                            </div>
                          ) : (
                            recentPlayers.map((player) => {
                              const isRequested = requestedFriendIds.includes(player.id);
                              return (
                                <div
                                  key={player.id}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all shrink-0 ${
                                    darkMode
                                      ? "bg-zinc-950/45 border-zinc-800 text-stone-200"
                                      : "bg-stone-50/45 border-stone-200/50 text-stone-850"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {player.isFriend ? (
                                      <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${
                                        darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]"
                                      }`}>
                                        ✓ Friend
                                      </span>
                                    ) : (
                                      <button
                                        disabled={isRequested}
                                        onClick={() => handleAddRecentFriend(player)}
                                        className={`w-7 h-7 rounded-lg border-none cursor-pointer shrink-0 transition-all active:scale-95 flex items-center justify-center ${
                                          isRequested
                                            ? "bg-stone-200/50 text-stone-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed"
                                            : darkMode
                                            ? "bg-zinc-800 hover:bg-zinc-750 text-stone-300 hover:text-white"
                                            : "bg-stone-150 hover:bg-stone-200 text-stone-700 hover:text-stone-900"
                                        }`}
                                        title={isRequested ? "Requested" : "Add Friend"}
                                      >
                                        {isRequested ? (
                                          <Check className="w-4 h-4 stroke-[2.5]" />
                                        ) : (
                                          <Plus className="w-5 h-5 stroke-[2.5]" />
                                        )}
                                      </button>
                                    )}
                                    <div className="flex flex-col truncate min-w-0">
                                      <span className="font-sans font-bold text-xs truncate">{player.name}</span>
                                      {player.lastPlayedAt ? (
                                        <span className="text-[9.5px] text-stone-400">
                                          {formatMatchTimestamp(player.lastPlayedAt)}
                                        </span>
                                      ) : (
                                        <span className="text-[9.5px] text-stone-400">Match Participant</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
