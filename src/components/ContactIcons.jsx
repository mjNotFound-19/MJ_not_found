import { motion } from "framer-motion";
import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { CONTACT } from "../config/content";
import useMagnetic from "../hooks/useMagnetic";
import RevealText from "./motion/RevealText";
import { fadeUp, staggerChildren } from "../lib/motion";
import { useLanguage } from "../context/LanguageContext";

const CONTACT_LINKS = [
  { icon: Mail, label: "Email", detail: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { icon: Linkedin, label: "LinkedIn", detail: "in/mjNotFound19", href: CONTACT.linkedin },
  { icon: Github, label: "GitHub", detail: "mjNotFound-19", href: CONTACT.github },
];

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
        <span className="block text-sm font-semibold text-white">{label}</span>
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
  return (
    <div className="glass-panel p-6 sm:p-10 rounded-[28px] grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
      <div className="space-y-4">
        <RevealText lines={t.contact.lines} as="h3" className="text-2xl sm:text-3xl font-semibold leading-snug" />
        <p className="text-white/70">{t.contact.body}</p>
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
    </div>
  );
}
