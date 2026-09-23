import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="relative py-14 mt-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="section-shell text-sm text-white/60 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <p>{t.footer.credit()}</p>
        <p>{t.footer.stack}</p>
      </div>
    </footer>
  );
}
