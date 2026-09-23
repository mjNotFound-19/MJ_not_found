import { useEffect, useState } from "react";
import { LANGUAGE_OPTIONS, useLanguage } from "../context/LanguageContext";

const labelFor = (code) => LANGUAGE_OPTIONS.find((opt) => opt.code === code)?.label || code.toUpperCase();

export default function FloatingLanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const notice = t.translationNotice;
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (notice) {
      setShowNotice(true);
      const id = setTimeout(() => setShowNotice(false), 6000);
      return () => clearTimeout(id);
    }
    setShowNotice(false);
  }, [notice, lang]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <div
          className={`flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur text-xs text-white shadow-[0_6px_24px_-10px_rgba(0,174,255,0.6)] transition-all duration-300 overflow-hidden ${
            open ? "pl-3 pr-2 py-2 max-w-[520px]" : "pl-3 pr-2 py-2 max-w-[130px]"
          }`}
        >
          <button
            type="button"
            className="px-3 py-1 rounded-full bg-primary text-black font-semibold border border-primary shadow-[0_6px_24px_-10px_rgba(0,174,255,0.7)]"
            onClick={() => setOpen((prev) => !prev)}
          >
            {labelFor(lang)}
          </button>
          <div
            className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
              open ? "max-w-[420px] opacity-100" : "max-w-0 opacity-0 pointer-events-none"
            }`}
          >
            {LANGUAGE_OPTIONS.filter((opt) => opt.code !== lang).map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => {
                  setLang(option.code);
                  setOpen(false);
                }}
                className="px-3 py-1 rounded-full text-[11px] bg-white/5 text-white border border-white/15 hover:border-primary/60 hover:text-white transition"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {notice && showNotice && (
        <div className="fixed bottom-20 right-6 z-50 text-[11px] text-white/80 bg-black/65 border border-white/15 rounded-2xl px-4 py-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)] backdrop-blur-sm">
          {notice}
        </div>
      )}
    </>
  );
}
