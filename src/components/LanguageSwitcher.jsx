import { useState } from "react";
import { LANGUAGE_OPTIONS, useLanguage } from "../context/LanguageContext";

const findLabel = (code) => LANGUAGE_OPTIONS.find((opt) => opt.code === code)?.label || code.toUpperCase();

export default function LanguageSwitcher({ currentLang, onChange, ariaLabel = "Language selector" }) {
  const ctx = useLanguage?.();
  const lang = currentLang ?? ctx?.lang ?? "en";
  const setLang = onChange ?? ctx?.setLang ?? (() => {});
  const [open, setOpen] = useState(false);

  const handleEnter = () => setOpen(true);
  const handleLeave = () => setOpen(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      <div
        className={`flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur text-xs text-white shadow-[0_6px_24px_-10px_rgba(0,174,255,0.6)] transition-all duration-300 overflow-hidden ${
          open ? "px-3 py-1.5 max-w-[420px]" : "px-3 py-1 max-w-[110px]"
        }`}
        aria-label={ariaLabel}
      >
        <span className="font-semibold text-white">{findLabel(lang)}</span>
        <div className="flex items-center gap-1">
          {LANGUAGE_OPTIONS.map((option) => {
            const isActive = option.code === lang;
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => setLang(option.code)}
                className={`px-2 py-1 rounded-full transition border text-[11px] ${
                  open
                    ? isActive
                      ? "bg-primary text-black border-primary"
                      : "bg-white/5 text-white border-white/10 hover:border-primary/50"
                    : isActive
                    ? "bg-primary text-black border-primary"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
