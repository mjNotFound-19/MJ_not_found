import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { CERTIFICATIONS } from "../config/content";
import { fadeUp, staggerChildren } from "../lib/motion";
import { useLanguage } from "../context/LanguageContext";

export default function Certifications() {
  const { t } = useLanguage();
  const certT = t.certifications;

  return (
    <motion.ul
      variants={staggerChildren(0.06)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]"
    >
      {CERTIFICATIONS.map((cert, index) => {
        const entry = certT.entries?.[cert.title] ?? {};
        const title = entry.title ?? cert.title;
        const body = (
          <>
            {cert.logo ? (
              <img src={cert.logo} alt="" loading="lazy" className="w-7 h-7 object-contain shrink-0" />
            ) : (
              <BadgeCheck size={22} className="text-primary shrink-0" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white leading-snug">{title}</p>
              <p className="text-xs text-white/45">
                {entry.issuer ?? cert.issuer}
                {cert.date && ` - ${entry.date ?? cert.date}`}
              </p>
            </div>
            {cert.link && (
              <ArrowUpRight
                size={15}
                className="text-white/30 group-hover:text-primary transition-colors shrink-0"
                aria-hidden
              />
            )}
          </>
        );
        return (
          <motion.li key={cert.title} variants={fadeUp(index * 0.03, 10)}>
            {cert.link ? (
              <a
                href={cert.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-3 hover:bg-white/[0.04] transition-colors"
                aria-label={`${title}, ${certT.cta}`}
              >
                {body}
              </a>
            ) : (
              <div className="flex items-center gap-3 p-3">{body}</div>
            )}
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
