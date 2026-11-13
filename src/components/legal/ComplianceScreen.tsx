import React, { useEffect, useState } from "react";
import {
  Mail,
  Copy,
  Check,
  Shield,
  FileText,
  Info,
  Trash2,
  ExternalLink,
  ArrowLeft,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import {
  ContactTopicId,
  LEGAL_DOCUMENT_CONTENT,
} from "../../i18n/legalDocumentContent";

export type CompliancePageType = "privacy" | "terms" | "contact" | "about";

export const COMPLIANCE_PATHS: Record<CompliancePageType, string> = {
  privacy: "/privacy",
  terms: "/terms",
  contact: "/contact",
  about: "/about",
};

export function parseComplianceRoute(pathname?: string | null): CompliancePageType | null {
  if (!pathname) return null;
  const normalized = pathname.trim().replace(/\/+$/, "").toLowerCase();
  if (normalized === "/privacy" || normalized === "/privacy.html") return "privacy";
  if (normalized === "/terms" || normalized === "/terms.html") return "terms";
  if (normalized === "/contact" || normalized === "/contact.html") return "contact";
  if (normalized === "/about" || normalized === "/about.html") return "about";
  return null;
}

const SUPPORT_EMAIL = "sudokutogethermode@gmail.com";

export interface ComplianceDocumentBodyProps {
  page: CompliancePageType;
  darkMode: boolean;
  compact?: boolean;
  onNavigatePage?: (page: CompliancePageType) => void;
  onOpenSettings?: () => void;
  onCopyEmail?: (email: string) => Promise<boolean> | boolean;
}

export const ComplianceDocumentBody: React.FC<ComplianceDocumentBodyProps> = ({
  page,
  darkMode,
  compact = false,
  onNavigatePage,
  onOpenSettings,
  onCopyEmail,
}) => {
  const { t, language } = useTranslation();
  const legal = LEGAL_DOCUMENT_CONTENT[language] || LEGAL_DOCUMENT_CONTENT.en;

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [activeTopic, setActiveTopic] = useState<ContactTopicId>("bug");
  const [composerSubject, setComposerSubject] = useState<string>(
    legal.contactComposer.topics.bug.subject
  );
  const [composerBody, setComposerBody] = useState<string>(
    legal.contactComposer.topics.bug.body
  );

  useEffect(() => {
    const template = legal.contactComposer.topics[activeTopic];
    setComposerSubject(template.subject);
    setComposerBody(template.body);
  }, [language, activeTopic, legal]);

  const copyTextValue = async (value: string): Promise<boolean> => {
    try {
      if (onCopyEmail) {
        return await onCopyEmail(value);
      }
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  const handleCopySupportEmail = async () => {
    const success = await copyTextValue(SUPPORT_EMAIL);
    if (success) {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyComposerMessage = async () => {
    const formatted = `To: ${SUPPORT_EMAIL}\nSubject: ${composerSubject}\n\n${composerBody}`;
    const success = await copyTextValue(formatted);
    if (success) {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  const softCardCls = darkMode
    ? "bg-zinc-800/75 text-zinc-200 shadow-[0_6px_22px_rgba(0,0,0,0.28)]"
    : "bg-sky-50/70 text-stone-700 shadow-[0_6px_22px_rgba(14,116,144,0.06)]";

  const highlightPastelCls = darkMode
    ? "bg-amber-500/10 text-amber-100 shadow-[0_6px_20px_rgba(0,0,0,0.22)]"
    : "bg-amber-50/90 text-amber-950 shadow-[0_6px_20px_rgba(217,119,6,0.07)]";

  const emeraldPastelCls = darkMode
    ? "bg-emerald-500/10 text-emerald-100 shadow-[0_6px_20px_rgba(0,0,0,0.22)]"
    : "bg-emerald-50/85 text-emerald-950 shadow-[0_6px_20px_rgba(5,150,105,0.06)]";

  const lavenderPastelCls = darkMode
    ? "bg-violet-500/10 text-violet-100 shadow-[0_6px_20px_rgba(0,0,0,0.22)]"
    : "bg-violet-50/85 text-violet-950 shadow-[0_6px_20px_rgba(124,58,237,0.06)]";

  const textSize = compact ? "text-xs" : "text-sm";
  const headingCls = compact
    ? "text-sm font-bold text-[#0369A1] dark:text-[#7dd3fc] leading-normal"
    : "text-lg sm:text-xl font-bold text-[#0369A1] dark:text-[#7dd3fc] leading-snug";
  const sectionHeadingCls =
    "font-bold uppercase tracking-wider text-[11px] sm:text-xs text-stone-800 dark:text-stone-200 leading-normal";

  const renderEmailCopyBadge = () => (
    <div className="flex items-center gap-2 flex-wrap pt-0.5">
      <button
        type="button"
        onClick={handleCopySupportEmail}
        className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-sky-600 dark:text-sky-400 hover:underline rounded-md border-0 bg-transparent p-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        <Mail className="w-3.5 h-3.5 shrink-0" />
        <span>{SUPPORT_EMAIL}</span>
      </button>
      <button
        type="button"
        onClick={handleCopySupportEmail}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border-0 text-[11px] font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
          copiedEmail
            ? "bg-emerald-500 text-white shadow-[0_3px_10px_rgba(16,185,129,0.22)]"
            : darkMode
              ? "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
              : "bg-white text-sky-800 hover:bg-sky-100 shadow-[0_2px_8px_rgba(15,23,42,0.05)]"
        }`}
      >
        {copiedEmail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        <span>{copiedEmail ? legal.contactComposer.emailCopiedBtn : legal.contactComposer.copyEmailBtn}</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-4 select-text">
      {page === "about" && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className={headingCls}>{t("aboutUsTitle")}</h2>
            <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
              {t("versionLabel")}: <span className="font-semibold text-sky-600 dark:text-sky-400">v1.0.3</span>
            </p>
          </div>

          <p className={`${textSize} leading-relaxed text-stone-700 dark:text-stone-300`}>
            <strong>SudokuSync</strong> — {t("aboutUsDesc")}
          </p>
          <p className={`${textSize} leading-relaxed text-stone-700 dark:text-stone-300`}>
            {t("aboutMission")}
          </p>
          <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
            {t("aboutTechArchDesc")}
          </p>

          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-1.5 ${softCardCls}`}>
            <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
              {t("versionLabel")}: <span className="font-mono text-sky-600 dark:text-sky-400">v1.0.3</span>
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              {t("creditsLabel")}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className={sectionHeadingCls}>{t("aboutFeaturesHeader")}</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {[
                { title: t("aboutFeat1Title"), desc: t("aboutFeat1Desc") },
                { title: t("aboutFeat2Title"), desc: t("aboutFeat2Desc") },
                { title: t("aboutFeat3Title"), desc: t("aboutFeat3Desc") },
                { title: t("aboutFeat4Title"), desc: t("aboutFeat4Desc") },
              ].map((item) => (
                <li
                  key={item.title}
                  className={`p-3 rounded-2xl border-0 list-none ${
                    darkMode ? "bg-zinc-800/60" : "bg-stone-50/90"
                  } shadow-[0_4px_14px_rgba(15,23,42,0.04)]`}
                >
                  <p className="font-bold text-stone-800 dark:text-stone-100 mb-0.5">{item.title}</p>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{item.desc}</p>
                </li>
              ))}
            </ul>
          </div>

          <p className="pt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
            {t("aboutAdNotice")}
          </p>
        </div>
      )}

      {page === "contact" && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className={headingCls}>{t("contactUsTitle")}</h2>
            <p className={`${textSize} leading-relaxed text-stone-700 dark:text-stone-300`}>
              {t("contactDesc")}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border-0 space-y-3.5 ${softCardCls}`}>
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="space-y-1 min-w-0">
                <p className="font-bold text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  {t("officialSupportContact")}
                </p>
                {renderEmailCopyBadge()}
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                  {t("contactTurnaround")}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200">
                  {legal.contactComposer.sectionLabel}
                </p>
                <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
                  {legal.contactComposer.helperText}
                </p>
              </div>

              <div className="flex flex-wrap gap-2" role="tablist" aria-label={legal.contactComposer.sectionLabel}>
                {(["bug", "privacy", "deletion"] as ContactTopicId[]).map((topicId) => {
                  const topic = legal.contactComposer.topics[topicId];
                  const selected = activeTopic === topicId;
                  return (
                    <button
                      key={topicId}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setActiveTopic(topicId)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-0 text-[11px] font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                        selected
                          ? "bg-sky-500 text-white shadow-[0_4px_12px_rgba(14,165,233,0.26)]"
                          : darkMode
                            ? "bg-zinc-900/75 text-sky-200 hover:bg-zinc-900"
                            : "bg-white/95 text-sky-900 hover:bg-white shadow-[0_2px_8px_rgba(15,23,42,0.05)]"
                      }`}
                    >
                      <span>{topic.label}</span>
                    </button>
                  );
                })}
              </div>

              <div
                className={`p-3 rounded-2xl border-0 space-y-2.5 ${
                  darkMode
                    ? "bg-zinc-900/70 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)]"
                    : "bg-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.05)]"
                }`}
              >
                <label className="block space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    {legal.contactComposer.subjectLabel}
                  </span>
                  <input
                    type="text"
                    value={composerSubject}
                    onChange={(e) => setComposerSubject(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border-0 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      darkMode
                        ? "bg-zinc-800/90 text-zinc-100"
                        : "bg-stone-100/90 text-stone-800"
                    }`}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    {legal.contactComposer.messageLabel}
                  </span>
                  <textarea
                    rows={4}
                    value={composerBody}
                    onChange={(e) => setComposerBody(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border-0 text-xs leading-relaxed resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      darkMode
                        ? "bg-zinc-800/90 text-zinc-100"
                        : "bg-stone-100/90 text-stone-800"
                    }`}
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={handleCopyComposerMessage}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-0 text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      copiedMessage
                        ? "bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
                        : darkMode
                          ? "bg-sky-500/25 text-sky-200 hover:bg-sky-500/35"
                          : "bg-sky-100 text-sky-900 hover:bg-sky-200/80 shadow-[0_2px_8px_rgba(14,116,144,0.08)]"
                    }`}
                  >
                    {copiedMessage ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>
                      {copiedMessage
                        ? legal.contactComposer.messageCopiedBtn
                        : legal.contactComposer.copyMessageBtn}
                    </span>
                  </button>

                  {activeTopic === "privacy" && onNavigatePage && (
                    <button
                      type="button"
                      onClick={() => onNavigatePage("privacy")}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-0 text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                        darkMode
                          ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                          : "bg-amber-50 text-amber-900 hover:bg-amber-100 shadow-[0_2px_8px_rgba(217,119,6,0.08)]"
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>{legal.contactComposer.openPrivacyBtn}</span>
                    </button>
                  )}

                  {activeTopic === "deletion" && onOpenSettings && (
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-0 text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        darkMode
                          ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                          : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100 shadow-[0_2px_8px_rgba(5,150,105,0.1)]"
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{legal.contactComposer.openDeleteSettingsBtn}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border-0 space-y-2 ${emeraldPastelCls}`}>
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h3 className={sectionHeadingCls}>{t("contactDeletionHeader")}</h3>
            </div>
            <p className="text-xs leading-relaxed opacity-90">{t("contactDeletionDesc")}</p>
            {onOpenSettings && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-0 text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    darkMode
                      ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                      : "bg-white text-emerald-800 hover:bg-emerald-100/70 shadow-[0_2px_8px_rgba(5,150,105,0.1)]"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{t("settings")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {page === "privacy" && (
        <div className="space-y-4">
          <div>
            <h2 className={headingCls}>{legal.privacy.title}</h2>
            <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-0.5">
              {legal.metaLine}
            </p>
          </div>

          <p className={`${textSize} leading-relaxed font-medium text-stone-700 dark:text-stone-300`}>
            {legal.privacy.intro}
          </p>

          {/* Section 1 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-2.5 ${softCardCls}`}>
            <h3 className={sectionHeadingCls}>{legal.privacy.s1Header}</h3>
            <p className="text-xs leading-relaxed">{legal.privacy.s1Intro}</p>
            <ul className="list-disc pl-5 space-y-2 text-xs leading-relaxed">
              <li>
                <strong>{legal.privacy.s1LocalStorage.label}</strong> {legal.privacy.s1LocalStorage.text}
              </li>
              <li>
                <strong>{legal.privacy.s1Firestore.label}</strong> {legal.privacy.s1Firestore.intro}
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {legal.privacy.s1Firestore.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </li>
              <li>
                <strong>{legal.privacy.s1Fcm.label}</strong> {legal.privacy.s1Fcm.text}
                <br />
                <strong>{legal.privacy.s1Fcm.controlLabel}</strong> {legal.privacy.s1Fcm.controlText}
              </li>
              <li>
                <strong>{legal.privacy.s1Auth.label}</strong> {legal.privacy.s1Auth.text}
              </li>
              <li>
                <strong>{legal.privacy.s1ServerLogs.label}</strong> {legal.privacy.s1ServerLogs.text}
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-2.5 ${highlightPastelCls}`}>
            <h3 className={sectionHeadingCls}>{legal.privacy.s2Header}</h3>
            <p className="text-xs leading-relaxed">{legal.privacy.s2P1}</p>
            <p className="text-xs leading-relaxed">{legal.privacy.s2P2}</p>

            <div
              className={`p-3 rounded-2xl border-0 space-y-1.5 ${
                darkMode
                  ? "bg-zinc-900/55 text-amber-100"
                  : "bg-white/85 text-amber-950 shadow-[0_3px_12px_rgba(217,119,6,0.06)]"
              }`}
            >
              <p className="text-xs font-bold">{legal.privacy.s2BoxTitle}</p>
              <p className="text-xs leading-relaxed opacity-90">{legal.privacy.s2BoxIntro}</p>
              <ul className="list-disc pl-5 space-y-1 text-xs leading-relaxed">
                <li>
                  <strong>{legal.privacy.s2AndroidAaid.label}</strong> {legal.privacy.s2AndroidAaid.text}
                </li>
                {legal.privacy.s2Portals.map((portal) => (
                  <li key={portal.url}>
                    <strong>{portal.name}:</strong>{" "}
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400 hover:underline break-all"
                    >
                      <span>{portal.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs leading-relaxed">
              <strong>{legal.privacy.s2Quality.label}</strong> {legal.privacy.s2Quality.text}
            </p>
          </div>

          {/* Section 3 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-2.5 ${emeraldPastelCls}`}>
            <h3 className={sectionHeadingCls}>{legal.privacy.s3Header}</h3>
            <p className="text-xs leading-relaxed">{legal.privacy.s3Intro}</p>
            <div
              className={`p-3 rounded-2xl border-0 space-y-1.5 ${
                darkMode
                  ? "bg-zinc-900/55 text-emerald-100"
                  : "bg-white/85 text-emerald-950 shadow-[0_3px_12px_rgba(5,150,105,0.06)]"
              }`}
            >
              <p className="text-xs font-bold">{legal.privacy.s3BoxTitle}</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs leading-relaxed">
                <li>
                  <strong>{legal.privacy.s3InApp.label}</strong> {legal.privacy.s3InApp.text}
                </li>
                <li>
                  <strong>{legal.privacy.s3Email.label}</strong> {legal.privacy.s3Email.text}
                </li>
              </ul>
              {onOpenSettings && (
                <div className="pt-1.5">
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-0 text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      darkMode
                        ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                        : "bg-emerald-100/80 text-emerald-900 hover:bg-emerald-200/70 shadow-[0_2px_8px_rgba(5,150,105,0.08)]"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{legal.contactComposer.openDeleteSettingsBtn}</span>
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs leading-relaxed">{legal.privacy.s3RightsIntro}</p>
            <ul className="list-disc pl-5 space-y-1 text-xs leading-relaxed">
              {legal.privacy.s3RightsBullets.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong> {item.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-1.5 ${lavenderPastelCls}`}>
            <h3 className={sectionHeadingCls}>{legal.privacy.s4Header}</h3>
            <p className="text-xs leading-relaxed">{legal.privacy.s4Text}</p>
          </div>

          {/* Section 5 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-2 ${softCardCls}`}>
            <h3 className={sectionHeadingCls}>{legal.privacy.s5Header}</h3>
            <p className="text-xs leading-relaxed">{legal.privacy.s5Text}</p>
          </div>

          {/* Section 6 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-1.5 ${emeraldPastelCls}`}>
            <h3 className={sectionHeadingCls}>{legal.privacy.s6Header}</h3>
            <p className="text-xs leading-relaxed">{legal.privacy.s6Text}</p>
          </div>

          {/* Section 7 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-2 ${softCardCls}`}>
            <h3 className={sectionHeadingCls}>{legal.privacy.s7Header}</h3>
            <p className="text-xs leading-relaxed">{legal.privacy.s7Intro}</p>
            {renderEmailCopyBadge()}
            <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
              <strong>{legal.privacy.s7TurnaroundLabel}</strong> {legal.privacy.s7TurnaroundValue}
            </p>
          </div>
        </div>
      )}

      {page === "terms" && (
        <div className="space-y-4">
          <div>
            <h2 className={headingCls}>{legal.terms.title}</h2>
            <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-0.5">
              {legal.metaLine}
            </p>
          </div>

          <p className={`${textSize} leading-relaxed font-medium text-stone-700 dark:text-stone-300`}>
            {legal.terms.intro}
          </p>

          {/* Section 1 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-1.5 ${softCardCls}`}>
            <h3 className={sectionHeadingCls}>{legal.terms.s1Header}</h3>
            <p className="text-xs leading-relaxed">{legal.terms.s1Text}</p>
          </div>

          {/* Section 2 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-2.5 ${highlightPastelCls}`}>
            <h3 className={sectionHeadingCls}>{legal.terms.s2Header}</h3>
            <p className="text-xs leading-relaxed">{legal.terms.s2Intro}</p>
            <div
              className={`p-3 rounded-2xl border-0 space-y-1.5 ${
                darkMode
                  ? "bg-zinc-900/55 text-amber-100"
                  : "bg-white/85 text-amber-950 shadow-[0_3px_12px_rgba(217,119,6,0.06)]"
              }`}
            >
              <p className="text-xs font-bold">{legal.terms.s2BoxTitle}</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs leading-relaxed">
                {legal.terms.s2Bullets.map((item) => (
                  <li key={item.label}>
                    <strong>{item.label}</strong> {item.text}
                  </li>
                ))}
              </ul>
              <p className="text-xs leading-relaxed pt-1">
                <strong>{legal.terms.s2Penalty.label}</strong> {legal.terms.s2Penalty.text}
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-2 ${emeraldPastelCls}`}>
            <h3 className={sectionHeadingCls}>{legal.terms.s3Header}</h3>
            <p className="text-xs leading-relaxed">{legal.terms.s3Intro}</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs leading-relaxed">
              {legal.terms.s3Bullets.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong> {item.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-1.5 ${softCardCls}`}>
            <h3 className={sectionHeadingCls}>{legal.terms.s4Header}</h3>
            <p className="text-xs leading-relaxed">{legal.terms.s4Text}</p>
          </div>

          {/* Section 5 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-1.5 ${lavenderPastelCls}`}>
            <h3 className={sectionHeadingCls}>{legal.terms.s5Header}</h3>
            <p className="text-xs leading-relaxed">{legal.terms.s5Text}</p>
          </div>

          {/* Section 6 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-1.5 ${softCardCls}`}>
            <h3 className={sectionHeadingCls}>{legal.terms.s6Header}</h3>
            <p className="text-xs leading-relaxed">{legal.terms.s6Text}</p>
          </div>

          {/* Section 7 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-2 ${emeraldPastelCls}`}>
            <h3 className={sectionHeadingCls}>{legal.terms.s7Header}</h3>
            <p className="text-xs leading-relaxed">{legal.terms.s7Text}</p>
            {onOpenSettings && (
              <div>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-0 text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    darkMode
                      ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                      : "bg-white text-emerald-800 hover:bg-emerald-100/80 shadow-[0_2px_8px_rgba(5,150,105,0.08)]"
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{legal.contactComposer.openDeleteSettingsBtn}</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 8 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-2 ${softCardCls}`}>
            <h3 className={sectionHeadingCls}>{legal.terms.s8Header}</h3>
            <p className="text-xs leading-relaxed">{legal.terms.s8Intro}</p>
            {renderEmailCopyBadge()}
            <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
              <strong>{legal.terms.s8TurnaroundLabel}</strong> {legal.terms.s8TurnaroundValue}
            </p>
          </div>
        </div>
      )}

      {onNavigatePage && (
        <div className="pt-3 flex flex-wrap items-center gap-2">
          {(
            [
              { id: "privacy" as const, label: t("privacyPolicy"), icon: Shield },
              { id: "terms" as const, label: t("termsOfService"), icon: FileText },
              { id: "contact" as const, label: t("contactSupport"), icon: Mail },
              { id: "about" as const, label: t("aboutUs"), icon: Info },
            ] as const
          ).map(({ id, label, icon: Icon }) => {
            const active = page === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigatePage(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-0 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  active
                    ? "bg-sky-500 text-white shadow-[0_4px_12px_rgba(14,165,233,0.28)]"
                    : darkMode
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      : "bg-stone-100 text-stone-700 hover:bg-sky-50 shadow-[0_2px_6px_rgba(15,23,42,0.04)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export interface ComplianceScreenProps {
  page: CompliancePageType;
  darkMode: boolean;
  onNavigatePage: (page: CompliancePageType) => void;
  onBackHome: () => void;
  onOpenSettings: () => void;
  onCopyEmail?: (email: string) => Promise<boolean> | boolean;
}

export const ComplianceScreen: React.FC<ComplianceScreenProps> = ({
  page,
  darkMode,
  onNavigatePage,
  onBackHome,
  onOpenSettings,
  onCopyEmail,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full h-full overflow-y-auto px-4 sm:px-6 pb-8 sm:pb-12 pt-[calc(84px+env(safe-area-inset-top,0px))] lg:pt-[92px]">
      <div className="max-w-3xl mx-auto space-y-4">
        <div
          className={`p-5 sm:p-7 rounded-3xl border-0 transition-colors ${
            darkMode
              ? "bg-zinc-900/90 text-zinc-100 shadow-[0_14px_38px_rgba(0,0,0,0.42)]"
              : "bg-white/95 text-stone-800 shadow-[0_14px_38px_rgba(15,23,42,0.06)]"
          }`}
        >
          <ComplianceDocumentBody
            page={page}
            darkMode={darkMode}
            onNavigatePage={onNavigatePage}
            onOpenSettings={onOpenSettings}
            onCopyEmail={onCopyEmail}
          />

          <div className="mt-6 pt-4 flex items-center justify-between flex-wrap gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-0 text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                darkMode
                  ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 shadow-[0_4px_12px_rgba(0,0,0,0.24)]"
                  : "bg-sky-50 text-sky-900 hover:bg-sky-100 shadow-[0_4px_12px_rgba(14,116,144,0.07)]"
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t("home") || "Home"}</span>
            </button>
            <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
              SudokuSync • v1.0.3
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
