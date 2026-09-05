import React from "react";

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
            className={`p-5 flex flex-col items-center justify-center text-center relative rounded-2xl transition-all duration-300 ${
              darkMode
                ? "bg-[#0c4a6e]/20 border border-[#f5f3ff]/15 text-sky-200"
                : "bg-[#E0F2FE]/60 border-none shadow-[0_4px_20px_rgba(3,105,161,0.06)]"
            }`}
          >
            <span
              className={`text-xs md:text-sm font-semibold uppercase tracking-widest mb-3 ${
                darkMode ? "text-sky-300" : "text-[#0369A1]"
              }`}
            >
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
            className={`p-5 flex flex-col text-left font-sans rounded-2xl justify-between h-full transition-all duration-300 ${
              darkMode
                ? "bg-[#2e1065]/20 border border-[#f5f3ff]/15 text-purple-200"
                : "bg-[#F3E8FF]/60 border-none shadow-[0_4px_20px_rgba(107,33,168,0.06)]"
            }`}
          >
            <div>
              <span
                className={`text-xs md:text-sm font-semibold uppercase tracking-widest block mb-4 ${
                  darkMode ? "text-purple-300" : "text-[#6B21A8]"
                }`}
              >
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
                    const mins = Math.floor(tier.timeSec / 60);
                    const secs = tier.timeSec % 60;
                    displayStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
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
          className={`w-full rounded-2xl flex flex-col font-sans shrink-0 overflow-hidden transition-all duration-300 ${
            darkMode
              ? "bg-[#9d174d]/20 border border-[#f5f3ff]/15 text-[#fbcfe8]"
              : "bg-[#FDF2F8]/45 border-none shadow-[0_4px_20px_rgba(219,39,119,0.02)]"
          }`}
          id="game-history-tabs-container"
        >
          {/* Tab Selectors - Borderless, clean negative space inside */}
          <div
            className={`grid grid-cols-3 p-1.5 font-sans text-xs flex items-center justify-center font-semibold uppercase tracking-wider gap-0.5 ${
              darkMode ? "bg-[#9d174d]/5" : "bg-[#FDF2F8]/20"
            }`}
          >
            <button
              onClick={() => handleSelectHistoryTab("completed")}
              className={`py-2 px-1.5 rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 uppercase font-bold tracking-wider ${
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
                className={`text-[9.5px] px-1.5 py-0.25 rounded-md ${
                  darkMode ? "bg-[#9d174d]/45 text-[#fbcfe8]/80" : "bg-pink-100/50 text-[#9D174D]/80"
                }`}
              >
                {completedGames.length}
              </span>
            </button>

            <button
              onClick={() => handleSelectHistoryTab("saved")}
              className={`py-2 px-1.5 rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 uppercase font-bold tracking-wider ${
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
                className={`text-[9.5px] px-1.5 py-0.25 rounded-md ${
                  darkMode ? "bg-[#9d174d]/45 text-[#fbcfe8]/80" : "bg-pink-100/50 text-[#9D174D]/80"
                }`}
              >
                {savedGames.length}
              </span>
            </button>

            <button
              onClick={() => handleSelectHistoryTab("friends")}
              className={`py-2 px-1.5 rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 uppercase font-bold tracking-wider ${
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
                className={`text-[9.5px] px-1.5 py-0.25 rounded-md ${
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
                        className={`text-xs font-sans font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          game.isWon
                            ? darkMode
                              ? "bg-emerald-950/20 text-emerald-400"
                              : "bg-emerald-100 text-emerald-850"
                            : darkMode
                            ? "bg-rose-950/20 text-rose-450"
                            : "bg-rose-100 text-rose-850"
                        }`}
                      >
                        {game.isWon ? "✓ Won" : "✗ Failed"}
                      </span>

                      <span className="font-sans text-xs md:text-sm font-medium text-stone-500">
                        {game.date}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-1.5 mb-1 bg-transparent">
                          <span
                            className={`text-xs font-sans font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
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
                          className={`font-sans font-black text-sm uppercase leading-none ${
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
                        className={`py-1.5 px-2 font-sans text-[10px] sm:text-xs font-black uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                          darkMode
                            ? "bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60"
                            : "bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534]"
                        }`}
                      >
                        Replay
                      </button>
                      <button
                        onClick={() => handleSaveGame(game)}
                        className={`py-1.5 px-2 font-sans text-[10px] sm:text-xs font-black uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
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
                        className={`py-1.5 px-2 font-sans text-[10px] sm:text-xs font-black uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
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
                        className={`text-xs font-sans font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          game.isWon
                            ? darkMode
                              ? "bg-emerald-950/20 text-emerald-400"
                              : "bg-emerald-100 text-emerald-850"
                            : darkMode
                            ? "bg-rose-950/20 text-rose-450"
                            : "bg-rose-100 text-rose-850"
                        }`}
                      >
                        {game.isWon ? "✓ Won" : "✗ Failed"}
                      </span>

                      <span className="font-sans text-xs md:text-sm font-medium text-stone-500">
                        {game.date || "Saved Config"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-1.5 mb-1 bg-transparent">
                          <span
                            className={`text-xs font-sans font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
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
                          className={`font-sans font-black text-sm uppercase leading-none ${
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
                        className={`py-1.5 px-2 font-sans text-[10px] sm:text-xs font-black uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                          darkMode
                            ? "bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60"
                            : "bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534]"
                        }`}
                      >
                        Replay
                      </button>
                      <button
                        onClick={() => handleSaveGame(game)}
                        className={`py-1.5 px-2 font-sans text-[10px] sm:text-xs font-black uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                          darkMode
                            ? "bg-yellow-950/30 text-yellow-400 hover:bg-yellow-950/50"
                            : "bg-[#FEFCE8] hover:bg-[#FEF9C3] text-[#854D0E]"
                        }`}
                      >
                        Unsave
                      </button>
                      <button
                        onClick={() => handleOpenRankings(game)}
                        className={`py-1.5 px-2 font-sans text-[10px] sm:text-xs font-black uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
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
                {/* My Friends Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      My Friends ({multiplayerPlayers.filter((p) => p.isFriend).length})
                    </span>
                  </div>
                  {multiplayerPlayers.filter((p) => p.isFriend).length === 0 ? (
                    <div className="py-4 text-center text-stone-400 dark:text-stone-500 font-sans text-xs">
                      No friends added yet.
                    </div>
                  ) : (
                    multiplayerPlayers
                      .filter((p) => p.isFriend)
                      .map((friend) => (
                        <div
                          key={friend.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            darkMode
                              ? "bg-zinc-950/45 border-zinc-800 text-stone-200"
                              : "bg-stone-50/45 border-stone-200/50 text-stone-850"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                  darkMode
                                    ? "bg-purple-950/60 text-purple-300 border border-purple-800/40"
                                    : "bg-purple-100 text-purple-800 border border-purple-200"
                                }`}
                              >
                                {friend.name ? friend.name.slice(0, 2).toUpperCase() : "PL"}
                              </div>
                              <span
                                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
                                  darkMode ? "border-zinc-900" : "border-white"
                                } ${friend.status === "online" ? "bg-emerald-500" : "bg-stone-400"}`}
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-sans font-bold text-xs">{friend.name}</span>
                              <span className="text-[9.5px] text-stone-400 capitalize">
                                {friend.status || "online"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleFriend(friend.id, friend.name)}
                            className="text-[10.5px] font-sans font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 border-none bg-transparent cursor-pointer transition-all active:scale-95 px-2 py-1"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                  )}
                </div>

                {/* Recent Players Section */}
                <div className="flex flex-col gap-2 pt-2 border-t border-dashed border-stone-200/40 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Recent Players ({multiplayerPlayers.filter((p) => !p.isFriend).length})
                    </span>
                  </div>
                  {multiplayerPlayers.filter((p) => !p.isFriend).length === 0 ? (
                    <div className="py-4 text-center text-stone-400 dark:text-stone-500 font-sans text-xs">
                      No recent players.
                    </div>
                  ) : (
                    multiplayerPlayers
                      .filter((p) => !p.isFriend)
                      .map((player) => {
                        const isRequested = requestedFriendIds.includes(player.id);
                        return (
                          <div
                            key={player.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                              darkMode
                                ? "bg-zinc-950/45 border-zinc-800 text-stone-200"
                                : "bg-stone-50/45 border-stone-200/50 text-stone-850"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                  darkMode ? "bg-zinc-800 text-stone-300" : "bg-stone-150 text-stone-700"
                                }`}
                              >
                                {player.name ? player.name.slice(0, 2).toUpperCase() : "PL"}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-sans font-bold text-xs">{player.name}</span>
                                <span className="text-[9.5px] text-stone-400">Match Participant</span>
                              </div>
                            </div>
                            <button
                              disabled={isRequested}
                              onClick={() => handleAddRecentFriend(player)}
                              className={`py-1 px-2.5 rounded-lg border-none cursor-pointer transition-all active:scale-95 text-[10.5px] font-sans font-bold uppercase tracking-wider ${
                                isRequested
                                  ? "bg-stone-200/50 text-stone-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed"
                                  : darkMode
                                  ? "bg-purple-950/60 text-purple-300 hover:bg-purple-900/80"
                                  : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                              }`}
                            >
                              {isRequested ? "Requested" : "+ Add"}
                            </button>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
