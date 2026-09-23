import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { ABOUT_FEATURES } from "../config/content";
import RevealText from "./motion/RevealText";
import { fadeUp, staggerChildren } from "../lib/motion";
import Experience from "./Experience";
import Certifications from "./Certifications";
import { useLanguage } from "../context/LanguageContext";

export default function About() {
  const { t } = useLanguage();
  const aboutText = t.aboutContent;

  return (
    <div className="space-y-20">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_0.85fr]">
        <motion.div
          className="glass-panel p-6 sm:p-8 space-y-8 rounded-[28px]"
          variants={fadeUp(0, 26)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <RevealText
            lines={aboutText.highlightLines}
            as="h3"
            className="text-2xl sm:text-3xl font-semibold leading-snug"
          />
          <p className="text-white/70 leading-relaxed">{aboutText.body}</p>
          <motion.div
            className="grid gap-3"
            variants={staggerChildren(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {ABOUT_FEATURES.map((feature, index) => (
              <motion.div key={feature.title} variants={fadeUp(0, 14)} className="feature-tile">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-base font-semibold">{feature.title}</p>
                  <p className="font-mono text-[11px] text-primary">
                    0{index + 1} / {feature.detail}
                  </p>
                </div>
                <p className="text-sm text-white/65 mt-2 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="glass-panel p-6 sm:p-8 rounded-[28px] space-y-8"
          variants={fadeUp(0.1, 26)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="space-y-3">
            <p className="text-xl font-semibold">{aboutText.metaTitle}</p>
            <p className="font-mono text-sm text-primary/80">{aboutText.metaSubtitle}</p>
            <p className="text-sm text-white/70 leading-relaxed">{aboutText.metaBody}</p>
          </div>

          <div className="flex gap-4 items-start rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 border border-primary/30 grid place-items-center text-primary">
              <GraduationCap size={18} aria-hidden />
            </span>
            <div>
              <p className="font-semibold">B.A. Artificial Intelligence</p>
              <p className="text-sm text-white/60">Purdue University - Conferred 2026</p>
              <p className="text-xs text-white/45 mt-1 leading-relaxed">
                26 CS credit hours: OOP, Computer Architecture, Foundations of CS, Programming in C,
                Data Engineering in Python, AI Basics
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/50">
              {aboutText.credentials}
            </p>
            <Certifications />
          </div>
        </motion.div>
      </div>

      <div id="experience" className="space-y-10">
        <p className="section-eyebrow">
          <span className="text-primary">02</span>
          <span className="section-eyebrow-rule" aria-hidden />
          {aboutText.experienceTitle}
        </p>
        <Experience />
      </div>
    </div>
  );
}
