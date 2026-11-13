import React, { useState } from "react";
import { Mail, Copy, Check, Shield, FileText, Info, Trash2, ExternalLink, ArrowLeft } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";

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
  const { t } = useTranslation();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopySupportEmail = async () => {
    let success = false;
    try {
      if (onCopyEmail) {
        success = await onCopyEmail(SUPPORT_EMAIL);
      } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(SUPPORT_EMAIL);
        success = true;
      }
    } catch {
      success = false;
    }
    if (success) {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
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

  const textSize = compact ? "text-xs" : "text-sm";
  const headingCls = compact
    ? "text-sm font-bold text-[#0369A1] dark:text-[#7dd3fc] leading-normal"
    : "text-lg sm:text-xl font-bold text-[#0369A1] dark:text-[#7dd3fc] leading-snug";
  const sectionHeadingCls =
    "font-bold uppercase tracking-wider text-[11px] sm:text-xs text-stone-800 dark:text-stone-200 leading-normal";

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

          <div className={`p-4 rounded-2xl border-0 space-y-3 ${softCardCls}`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="space-y-1 min-w-0">
                <p className="font-bold text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  {t("officialSupportContact")}
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=SudokuSync%20Support%20Inquiry`}
                  className="inline-flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold hover:underline text-sm sm:text-base break-all rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>{SUPPORT_EMAIL}</span>
                </a>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                  {t("contactTurnaround")}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySupportEmail}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-0 text-xs font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  copiedEmail
                    ? "bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
                    : darkMode
                      ? "bg-zinc-700/80 text-zinc-100 hover:bg-zinc-700 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                      : "bg-white text-sky-800 hover:bg-sky-100/80 shadow-[0_4px_12px_rgba(14,116,144,0.08)]"
                }`}
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? t("copied") || "Copied" : t("copy") || "Copy Email"}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: "Bug Report", subject: "SudokuSync%20Bug%20Report" },
                { label: "Privacy / UMP Consent", subject: "SudokuSync%20Privacy%20Inquiry" },
                { label: "Account & Data Deletion", subject: "SudokuSync%20Account%20Deletion%20Request" },
              ].map((topic) => (
                <a
                  key={topic.label}
                  href={`mailto:${SUPPORT_EMAIL}?subject=${topic.subject}`}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border-0 text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                    darkMode
                      ? "bg-zinc-900/70 text-sky-300 hover:bg-zinc-900"
                      : "bg-white/90 text-sky-800 hover:bg-white shadow-[0_2px_8px_rgba(15,23,42,0.05)]"
                  }`}
                >
                  <span>{topic.label}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              ))}
            </div>
          </div>

          <div className={`p-4 rounded-2xl border-0 space-y-1.5 ${emeraldPastelCls}`}>
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h3 className={sectionHeadingCls}>{t("contactDeletionHeader")}</h3>
            </div>
            <p className="text-xs leading-relaxed opacity-90">{t("contactDeletionDesc")}</p>
            {onOpenSettings && (
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className={`px-3 py-1.5 rounded-xl border-0 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    darkMode
                      ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                      : "bg-white text-emerald-800 hover:bg-emerald-100/70 shadow-[0_2px_8px_rgba(5,150,105,0.1)]"
                  }`}
                >
                  {t("settings")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {page === "privacy" && (
        <div className="space-y-4">
          <div>
            <h2 className={headingCls}>{t("privacyPolicyTitle")}</h2>
            <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-0.5">
              {t("privacyEffectiveDate")}
            </p>
          </div>

          <p className={`${textSize} leading-relaxed font-medium text-stone-700 dark:text-stone-300`}>
            {t("privacyScopeDesc")}
          </p>

          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-2.5 ${softCardCls}`}>
            <h3 className={sectionHeadingCls}>{t("privacySection1Header")}</h3>
            <p className="text-xs leading-relaxed">{t("privacySection1Desc")}</p>
            <ul className="list-disc pl-5 space-y-2 text-xs leading-relaxed">
              <li>{t("privacyLocalStorageItem")}</li>
              <li>{t("privacyCloudStorageItem")}</li>
              <li>{t("privacyGoogleSyncItem")}</li>
              <li>{t("privacyPushNotificationItem")}</li>
            </ul>
          </div>

          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-2 ${highlightPastelCls}`}>
            <h3 className={sectionHeadingCls}>{t("privacyAdSenseHeader")}</h3>
            <p className="text-xs leading-relaxed">{t("privacyAdSenseDesc")}</p>
          </div>

          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-2 ${softCardCls}`}>
            <h3 className={sectionHeadingCls}>{t("privacySection2Header")}</h3>
            <p className="text-xs leading-relaxed">{t("privacySection2Desc")}</p>
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=SudokuSync%20Privacy%20Inquiry`}
                className="font-bold text-xs sm:text-sm text-sky-600 dark:text-sky-400 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                {SUPPORT_EMAIL}
              </a>
              <button
                type="button"
                onClick={handleCopySupportEmail}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border-0 text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  copiedEmail
                    ? "bg-emerald-500 text-white"
                    : darkMode
                      ? "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                      : "bg-white text-sky-800 hover:bg-sky-100 shadow-[0_2px_8px_rgba(15,23,42,0.05)]"
                }`}
              >
                {copiedEmail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEmail ? t("copied") || "Copied" : t("copy") || "Copy"}</span>
              </button>
            </div>
          </div>

          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-1.5 ${emeraldPastelCls}`}>
            <h3 className={sectionHeadingCls}>{t("privacySection3Header")}</h3>
            <p className="text-xs leading-relaxed">{t("privacySection3Desc")}</p>
          </div>
        </div>
      )}

      {page === "terms" && (
        <div className="space-y-4">
          <div>
            <h2 className={headingCls}>{t("termsOfServiceTitle")}</h2>
            <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-0.5">
              {t("termsEffectiveDate")}
            </p>
          </div>

          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-2 ${softCardCls}`}>
            <h3 className={sectionHeadingCls}>{t("termsSection1Header")}</h3>
            <p className="text-xs leading-relaxed">{t("termsSection1Desc")}</p>
          </div>

          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-2 ${softCardCls}`}>
            <h3 className={sectionHeadingCls}>{t("termsSection2Header")}</h3>
            <p className="text-xs leading-relaxed">{t("termsSection2Desc")}</p>
          </div>

          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-1.5 ${highlightPastelCls}`}>
            <h3 className={sectionHeadingCls}>{t("termsFairPlayHeader")}</h3>
            <p className="text-xs leading-relaxed">{t("termsFairPlayDesc")}</p>
          </div>

          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-1.5 ${emeraldPastelCls}`}>
            <h3 className={sectionHeadingCls}>{t("termsCloudAccountHeader")}</h3>
            <p className="text-xs leading-relaxed">{t("termsCloudAccountDesc")}</p>
          </div>

          <div className={`p-3.5 sm:p-4 rounded-2xl border-0 space-y-1.5 ${softCardCls}`}>
            <h3 className={sectionHeadingCls}>{t("termsSection3Header")}</h3>
            <p className="text-xs leading-relaxed">{t("termsSection3Desc")}</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=SudokuSync%20Terms%20Inquiry`}
              className="inline-block font-bold text-xs sm:text-sm text-sky-600 dark:text-sky-400 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              {SUPPORT_EMAIL}
            </a>
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-0 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
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
    <div className="w-full h-full overflow-y-auto px-4 sm:px-6 py-5 sm:py-8">
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
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-0 text-xs font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
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

