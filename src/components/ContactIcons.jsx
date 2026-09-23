import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Copy, Github, Linkedin, Mail } from "lucide-react";
import { CONTACT } from "../config/content";
import useMagnetic from "../hooks/useMagnetic";
import RevealText from "./motion/RevealText";
import RollText from "./motion/RollText";
import { fadeUp, sharedEasing, staggerChildren } from "../lib/motion";
import { useLanguage } from "../context/LanguageContext";

const CONTACT_LINKS = [
  { icon: Linkedin, label: "LinkedIn", detail: "in/mjNotFound19", href: CONTACT.linkedin },
  { icon: Github, label: "GitHub", detail: "mjNotFound-19", href: CONTACT.github },
  { icon: Mail, label: "Mail app", detail: "open a new email", href: `mailto:${CONTACT.email}` },
];

// Copies the email; if the clipboard isn't available, falls back to the mail app.
function useCopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${CONTACT.email}`;
    }
  }, []);

  return { copied, copy };
}

function ContactLink({ icon: Icon, href, label, detail }) {
  const { ref, magneticStyle } = useMagnetic(0.15);
  const external = href.startsWith("http");

  return (
    <motion.a
      ref={ref}
      style={magneticStyle}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="contact-link group magnetic-target"
      whileTap={{ scale: 0.98 }}
    >
      <span className="w-11 h-11 shrink-0 rounded-xl bg-primary/10 border border-primary/30 grid place-items-center text-primary">
        <Icon size={18} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-white">
          <RollText>{label}</RollText>
        </span>
        <span className="block font-mono text-xs text-white/55 truncate">{detail}</span>
      </span>
      <ArrowUpRight
        size={16}
        className="text-white/30 group-hover:text-primary transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        aria-hidden
      />
    </motion.a>
  );
}

export default function ContactIcons() {
  const { t } = useLanguage();
  const { copied, copy } = useCopyEmail();

  return (
    <div className="glass-panel p-6 sm:p-10 rounded-[28px] grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
      <div className="space-y-5 min-w-0">
        <RevealText lines={t.contact.lines} as="h3" className="text-2xl sm:text-3xl font-semibold leading-snug" />
        <p className="text-white/70">{t.contact.body}</p>

        <button
          type="button"
          onClick={copy}
          className="big-email group"
          aria-label={`Copy email address ${CONTACT.email}`}
        >
          <span className="big-email-text">{CONTACT.email}</span>
          <span className="big-email-icon" aria-hidden>
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </span>
        </button>

        <p className="font-mono text-xs text-white/45">
          {CONTACT.location} - {CONTACT.citizenship} - {CONTACT.availability}
        </p>
      </div>
      <motion.div
        className="grid gap-3"
        variants={staggerChildren(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        {CONTACT_LINKS.map((link, index) => (
          <motion.div key={link.label} variants={fadeUp(index * 0.05, 12)}>
            <ContactLink {...link} />
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {copied && (
          <motion.div
            className="copy-toast"
            role="status"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: sharedEasing }}
          >
            <Check size={14} aria-hidden /> Email copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
