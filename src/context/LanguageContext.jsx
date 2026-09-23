import { createContext, useContext, useMemo, useState } from "react";

const EN_TRANSLATION = {
  nav: {
    about: "About",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    contact: "Contact",
    bucket: "Bucket list",
    connect: "Get in touch",
  },
  hero: {
    badge: "Software engineer - AI coding agents",
    line1: "Hi, I'm",
    prompt: "currently",
    body:
      "Software engineer with a B.A. in Artificial Intelligence from Purdue (2026) and 2+ years building cloud-based, data-intensive systems on Google Cloud. I write frontier-model coding benchmarks at Handshake and I'm founding a stealth startup building a local-first operating system for AI agents.",
    location: "Atlanta, GA - US citizen - open to hybrid on-site",
    nowTitle: "~/now",
    ctas: {
      projects: "View projects",
      contact: "Get in touch",
    },
  },
  sections: {
    about: {
      eyebrow: "Profile",
      title: "Engineer first, AI all the way down",
      subtitle:
        "I build the systems, then I build the tests that tell you whether they actually work.",
    },
    projects: {
      eyebrow: "Selected work",
      title: "Things I've built",
      subtitle: "An OS for AI agents, race simulation, production forecasting and network analytics.",
    },
    skills: {
      eyebrow: "Toolkit",
      title: "What I work with",
      subtitle: "Languages, cloud infrastructure, ML frameworks and evaluation methods I use day to day.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Let's talk",
      subtitle: "Based in Atlanta and open to hybrid on-site roles.",
    },
  },
  aboutContent: {
    highlightLines: ["Purdue AI graduate (2026)", "building and testing AI systems."],
    body:
      "Hands-on with AI agents from both sides: I write the benchmarks and judge test cases that measure frontier models, and I'm building a local-first operating system to run agents on. Before that: RAG and LLM orchestration research at Purdue, demand forecasting and network analytics for Caterpillar, and intrusion detection at Avolta. CS coursework covered OOP, computer architecture, C, and data engineering in Python.",
    metaTitle: "How I work",
    metaSubtitle: "Ambiguous problems, measurable answers.",
    metaBody:
      "I'm comfortable on fast-moving, loosely defined problems with interdisciplinary teams. I define how success gets measured early, whether that's WAPE on held-out data, grounding and unsupported-claim rates for RAG, or rubric scores for model output, and let those numbers drive the work.",
    experienceTitle: "Experience",
    credentials: "Certifications",
  },
  contact: {
    lines: ["Building something with AI agents?", "I'd like to hear about it."],
    body:
      "Reach out about software engineering roles, AI coding-agent tooling, model evaluation, or what I'm building in stealth.",
  },
  certifications: {
    cta: "View credential",
    entries: {},
  },
  footer: {
    credit: () => `© ${new Date().getFullYear()} Manas Jha`,
    stack: "Built with React, Vite and a lot of falling glyphs",
  },
  cards: {
    poster: "Case study",
    mediaPrivate: "Media available on request",
    mediaNote: "Detailed walkthroughs are shared privately with collaborators.",
    metricsTitle: "Key numbers",
    metricsSub: "From the project",
    metricsLive: "measured",
  },
  statement: {
    text: "I build AI systems, then I build the tests that prove whether they actually work. Right now that means an operating system for AI agents and benchmarks that push frontier models.",
    accents: ["build", "tests", "work", "operating", "benchmarks"],
  },
  marquee: ["AI coding agents", "LLM evaluation", "RAG pipelines", "Google Cloud", "Forecasting", "Security"],
  marqueeSkills: ["Python", "TypeScript", "PyTorch", "GCP", "Grafana", "scikit-learn", "Node.js", "SQL"],
  projectsScrollHint: "keep scrolling ->",
  manifesto: [
    { text: "BUILD IT.", caption: "design the system" },
    { text: "BREAK IT.", caption: "threat-model and attack it" },
    { text: "MEASURE IT.", caption: "benchmark it against reality" },
    { text: "SHIP IT.", caption: "put it in front of people" },
  ],
  closing: {
    first: "Shipping isn't the finish line.",
    second: "Measuring it is.",
  },
  projects: {},
  experience: {},
  translationNotice: "",
  languageLabel: "Language",
};

const TRANSLATIONS = {
  en: EN_TRANSLATION,
  zh: {
    nav: {
      about: "关于",
      projects: "项目",
      skills: "技能",
      contact: "联系",
      connect: "联系我",
    },
    hero: {
      badge: "应用机器学习 • 负责任AI • LLM评估",
      line1: "构建应用型机器学习系统",
      line2: "兼顾严谨评估与人类影响。",
      body:
        "我是一名应用机器学习工程师，具备AI伦理、对齐与技术哲学背景。2026年5月毕业于普渡大学AI专业，拥有TFT预测、异常检测、高吞吐数据管道、临床RAG研究与前沿LLM评估实践。",
      ctas: {
        projects: "查看项目",
        skills: "查看技能",
      },
    },
    sections: {
      about: {
        eyebrow: "个人概况",
        title: "应用ML + 负责任AI",
        subtitle: "在预测、LLM评估和数据系统方面具备实践能力，并有AI伦理课程基础。",
      },
      projects: {
        eyebrow: "项目经历",
        title: "精选项目",
        subtitle: "覆盖竞速预测、生产预测与安全分析。",
      },
      skills: {
        eyebrow: "技术技能",
        title: "ML、数据与基础设施",
        subtitle: "面向生产环境的建模、管道、评估与可视化工具栈。",
      },
      contact: {
        eyebrow: "联系",
        title: "合作",
        subtitle: "欢迎应用ML、负责任AI与模型评估方向机会。",
      },
    },
    aboutContent: {
      highlightLines: ["普渡AI毕业生（2026年5月）", "具备AI伦理与对齐基础。"],
      body:
        "课程包括AI哲学、科技/工程/设计伦理、技术哲学、伦理学导论与数理逻辑。技术训练包括Python数据工程、大数据研究I/II、线性代数，以及4个学期的Purdue Data Mine企业项目。",
      metaTitle: "我的ML工作方法",
      metaSubtitle: "关注质量、公平与真实价值。",
      metaBody:
        "我专注在真实约束下构建系统：防泄漏预测、可靠异常分诊、临床场景下可溯源检索，以及能清晰暴露能力边界的模型评估框架。",
      credentials: "认证证书",
    },
    contact: {
      lines: ["一起构建ML系统", "既能落地也负责任。"],
      body: "欢迎联系我讨论应用ML岗位、负责任AI、模型评估或研究合作。",
    },
    certifications: {
      cta: "查看证书",
      entries: {
        "Google Cybersecurity Professional Certificate": {
          title: "Google 网络安全职业证书",
          issuer: "Google Career Certificates / Coursera",
          date: "2023年6月",
          description: "验证了事件响应、网络防御和风险缓解方面的实操基础。",
        },
        "Google AI Professional Certificate": {
          title: "Google AI 职业证书",
          issuer: "Google Career Certificates / Coursera",
          date: "2026年5月",
          description: "验证了AI基础能力与构建、评估AI解决方案的实践流程。",
        },
      },
    },
    footer: {
      credit: () => `© ${new Date().getFullYear()} Manas Jha - 应用ML与负责任AI。`,
      stack: "React - Vite - Tailwind - Framer Motion",
    },
    cards: {
      poster: "案例材料",
      mediaPrivate: "素材可按需提供",
      mediaNote: "详细演示可与合作方私下分享。",
      metricsTitle: "评估指标",
      metricsSub: "模型表现快照",
      metricsLive: "已验证",
    },
    languageLabel: "语言",
    translationNotice: "",
  },
  de: {
    nav: {
      about: "Über mich",
      projects: "Projekte",
      skills: "Skills",
      contact: "Kontakt",
      connect: "Kontakt",
    },
    hero: {
      badge: "Applied ML • Responsible AI • LLM-Evaluierung",
      line1: "entwickelt praxisnahe ML-Systeme",
      line2: "mit klarer Bewertung und Blick auf menschliche Wirkung.",
      body:
        "Applied-ML-Ingenieur mit starkem Fundament in KI-Ethik, Alignment und Technikphilosophie. Purdue-AI-Abschluss (Mai 2026) mit Praxis in TFT-Forecasting, Anomalieerkennung, High-Throughput-Datenpipelines, klinischer RAG-Forschung und Frontier-LLM-Evaluierung.",
      ctas: {
        projects: "Projekte ansehen",
        skills: "Skills ansehen",
      },
    },
    sections: {
      about: {
        eyebrow: "Profil",
        title: "Applied ML + Responsible AI",
        subtitle: "Tiefe Praxis in Forecasting, LLM-Evaluierung und Datensystemen mit Ethik-Hintergrund.",
      },
      projects: {
        eyebrow: "Projektarbeit",
        title: "Ausgewählte Projekte",
        subtitle: "Praxis in Rennprognosen, Forecasting und Security-Analytics.",
      },
      skills: {
        eyebrow: "Technische Skills",
        title: "ML-, Daten- und Infrastruktur-Stack",
        subtitle: "Produktionsnahe Tools für Modellierung, Pipelines, Evaluierung und Visualisierung.",
      },
      contact: {
        eyebrow: "Kontakt",
        title: "Zusammenarbeit",
        subtitle: "Offen für Rollen in Applied ML, Responsible AI und Modellevaluierung.",
      },
    },
    aboutContent: {
      highlightLines: ["Purdue AI Abschluss (Mai 2026)", "mit starkem Ethik- und Alignment-Fokus."],
      body:
        "Kurse: Philosophy of AI, Ethics for Tech/Engineering/Design, Philosophy of Technology, Introduction to Ethics und Mathematical Logic. Technisch: Data Engineering in Python, Research with Big Data I & II, lineare Algebra und vier Semester Purdue Data Mine Corporate Partners.",
      metaTitle: "Mein ML-Ansatz",
      metaSubtitle: "Qualität, Fairness und praktische Wirkung.",
      metaBody:
        "Ich baue Systeme unter realen Randbedingungen: leakage-sicheres Forecasting, verlässliche Anomalie-Triage, fundierte Retrieval-Antworten im klinischen Kontext und Evaluierungsframeworks mit klaren Capability-Grenzen.",
      credentials: "Zertifikate",
    },
    contact: {
      lines: ["Lass uns ML-Systeme bauen", "die produktiv und verantwortungsvoll sind."],
      body: "Kontakt für Applied-ML-Rollen, Responsible-AI-Themen, Modellevaluierung oder Forschung.",
    },
    certifications: {
      cta: "Zertifikat ansehen",
    },
    footer: {
      credit: () => `© ${new Date().getFullYear()} Manas Jha - Applied ML und Responsible AI.`,
      stack: "React - Vite - Tailwind - Framer Motion",
    },
    cards: {
      poster: "Case Study",
      mediaPrivate: "Medien auf Anfrage",
      mediaNote: "Detaillierte Walkthroughs teile ich privat mit Partnern.",
      metricsTitle: "Evaluierungsmetriken",
      metricsSub: "Leistungsschnappschüsse",
      metricsLive: "validiert",
    },
    languageLabel: "Sprache",
    translationNotice: "",
  },
  es: {
    nav: {
      about: "Sobre mí",
      projects: "Proyectos",
      skills: "Habilidades",
      contact: "Contacto",
      connect: "Conectar",
    },
    hero: {
      badge: "ML aplicado • IA responsable • Evaluación LLM",
      line1: "construye sistemas de ML aplicado",
      line2: "con evaluación rigurosa e impacto humano.",
      body:
        "Ingeniero de ML aplicado con base sólida en ética de IA, alignment y filosofía de la tecnología. Graduado en IA por Purdue (mayo de 2026) con experiencia en forecasting TFT, detección de anomalías, pipelines de alto rendimiento, investigación clínica RAG y evaluación de LLMs de frontera.",
      ctas: {
        projects: "Ver proyectos",
        skills: "Ver habilidades",
      },
    },
    sections: {
      about: {
        eyebrow: "Perfil",
        title: "ML aplicado + IA responsable",
        subtitle: "Experiencia técnica en forecasting, evaluación LLM y sistemas de datos con formación en ética de IA.",
      },
      projects: {
        eyebrow: "Trabajo de proyectos",
        title: "Proyectos seleccionados",
        subtitle: "Construcciones prácticas en predicción de carreras, forecasting y analítica de seguridad.",
      },
      skills: {
        eyebrow: "Habilidades técnicas",
        title: "Stack de ML, datos e infraestructura",
        subtitle: "Herramientas enfocadas en producción para modelado, pipelines, evaluación y visualización.",
      },
      contact: {
        eyebrow: "Contacto",
        title: "Colaboración",
        subtitle: "Disponible para roles de ML aplicado, IA responsable y evaluación de modelos.",
      },
    },
    aboutContent: {
      highlightLines: ["Graduado de Purdue AI (mayo 2026)", "con base sólida en ética y alignment."],
      body:
        "Cursos: Filosofía de la IA, Ética para Tecnología/Ingeniería/Diseño, Filosofía de la Tecnología, Introducción a la Ética y Lógica Matemática. Formación técnica: Ingeniería de Datos en Python, Big Data I y II, álgebra lineal y cuatro semestres en Purdue Data Mine Corporate Partners.",
      metaTitle: "Cómo trabajo en ML",
      metaSubtitle: "calidad del modelo, equidad y utilidad real.",
      metaBody:
        "Construyo sistemas bajo restricciones reales: forecasting sin fuga de datos, triage de anomalías confiable, retrieval clínico con trazabilidad y marcos de evaluación que muestran límites de capacidad.",
      credentials: "Credenciales",
    },
    contact: {
      lines: ["Construyamos sistemas de ML", "que funcionen y sean responsables."],
      body: "Escríbeme para roles de ML aplicado, IA responsable, evaluación de modelos o investigación.",
    },
    certifications: {
      cta: "Ver credencial",
    },
    footer: {
      credit: () => `© ${new Date().getFullYear()} Manas Jha - ML aplicado e IA responsable.`,
      stack: "React - Vite - Tailwind - Framer Motion",
    },
    cards: {
      poster: "Caso",
      mediaPrivate: "Medios disponibles bajo solicitud",
      mediaNote: "Comparto walkthroughs detallados de forma privada.",
      metricsTitle: "Métricas de evaluación",
      metricsSub: "Resumen de rendimiento",
      metricsLive: "validado",
    },
    languageLabel: "Idioma",
    translationNotice: "",
  },
  nl: {
    nav: {
      about: "Over mij",
      projects: "Projecten",
      skills: "Vaardigheden",
      contact: "Contact",
      connect: "Contact opnemen",
    },
    hero: {
      badge: "Applied ML • Responsible AI • LLM-evaluatie",
      line1: "bouwt toegepaste ML-systemen",
      line2: "met strakke evaluatie en oog voor menselijke impact.",
      body:
        "Applied ML engineer met sterke basis in AI-ethiek, alignment en filosofie van technologie. Purdue AI-afgestudeerd (mei 2026) met praktijkervaring in TFT-forecasting, anomaliedetectie, high-throughput datapijplijnen, klinisch RAG-onderzoek en evaluatie van frontier LLM's.",
      ctas: {
        projects: "Bekijk projecten",
        skills: "Bekijk vaardigheden",
      },
    },
    sections: {
      about: {
        eyebrow: "Profiel",
        title: "Applied ML + Responsible AI",
        subtitle: "Technische diepgang in forecasting, LLM-evaluatie en datasystemen met achtergrond in AI-ethiek.",
      },
      projects: {
        eyebrow: "Projectwerk",
        title: "Geselecteerde projecten",
        subtitle: "Praktische builds in racevoorspelling, forecasting en security-analytics.",
      },
      skills: {
        eyebrow: "Technische skills",
        title: "ML-, data- en infrastructuurstack",
        subtitle: "Productiegerichte tools voor modellering, pijplijnen, evaluatie en visualisatie.",
      },
      contact: {
        eyebrow: "Contact",
        title: "Samenwerking",
        subtitle: "Open voor rollen in applied ML, responsible AI en modelevaluatie.",
      },
    },
    aboutContent: {
      highlightLines: ["Purdue AI-afgestudeerd (mei 2026)", "met sterke basis in ethiek en alignment."],
      body:
        "Cursussen: Philosophy of AI, Ethics for Tech/Engineering/Design, Philosophy of Technology, Introduction to Ethics en Mathematical Logic. Technisch: Data Engineering in Python, Research with Big Data I & II, lineaire algebra en vier semesters Purdue Data Mine Corporate Partners.",
      metaTitle: "Mijn ML-aanpak",
      metaSubtitle: "modelkwaliteit, fairness en echte toepasbaarheid.",
      metaBody:
        "Ik bouw systemen onder echte randvoorwaarden: lekvrije forecasting, betrouwbare anomalie-triage, traceerbare retrieval in klinische context en evaluatiekaders die capaciteitsgrenzen zichtbaar maken.",
      credentials: "Certificeringen",
    },
    contact: {
      lines: ["Laten we ML-systemen bouwen", "die leveren en verantwoord blijven."],
      body: "Neem contact op voor applied-ML-rollen, responsible-AI-werk, modelevaluatie of onderzoek.",
    },
    certifications: {
      cta: "Bekijk certificaat",
    },
    footer: {
      credit: () => `© ${new Date().getFullYear()} Manas Jha - Applied ML en Responsible AI.`,
      stack: "React - Vite - Tailwind - Framer Motion",
    },
    cards: {
      poster: "Case study",
      mediaPrivate: "Media op aanvraag",
      mediaNote: "Uitgebreide walkthroughs deel ik privé met samenwerkingspartners.",
      metricsTitle: "Evaluatiemetrieken",
      metricsSub: "Prestatie-overzicht",
      metricsLive: "gevalideerd",
    },
    languageLabel: "Taal",
    translationNotice: "",
  },
  hi: {
    nav: {
      about: "परिचय",
      projects: "प्रोजेक्ट्स",
      skills: "स्किल्स",
      contact: "संपर्क",
      connect: "कनेक्ट करें",
    },
    hero: {
      badge: "एप्लाइड ML • रिस्पॉन्सिबल AI • LLM मूल्यांकन",
      line1: "एप्लाइड ML सिस्टम बनाता है",
      line2: "जहां कठोर मूल्यांकन और मानव प्रभाव दोनों महत्वपूर्ण हों।",
      body:
        "मैं एक Applied ML इंजीनियर हूं, जिसकी नींव AI ethics, alignment और technology philosophy में मजबूत है। Purdue AI (May 2026) ग्रेजुएट के रूप में मैंने TFT forecasting, anomaly detection, high-throughput pipelines, clinical RAG research और frontier LLM evaluation पर काम किया है।",
      ctas: {
        projects: "प्रोजेक्ट्स देखें",
        skills: "स्किल्स देखें",
      },
    },
    sections: {
      about: {
        eyebrow: "प्रोफाइल",
        title: "Applied ML + Responsible AI",
        subtitle: "Forecasting, LLM evaluation और data systems में मजबूत तकनीकी अनुभव, AI ethics की अकादमिक पृष्ठभूमि के साथ।",
      },
      projects: {
        eyebrow: "प्रोजेक्ट कार्य",
        title: "चयनित प्रोजेक्ट्स",
        subtitle: "Race prediction, forecasting और security analytics में व्यावहारिक निर्माण।",
      },
      skills: {
        eyebrow: "तकनीकी स्किल्स",
        title: "ML, डेटा और इन्फ्रास्ट्रक्चर स्टैक",
        subtitle: "मॉडलिंग, पाइपलाइन, मूल्यांकन और विज़ुअलाइज़ेशन के लिए प्रोडक्शन-फोकस्ड टूल्स।",
      },
      contact: {
        eyebrow: "संपर्क",
        title: "सहयोग",
        subtitle: "Applied ML, Responsible AI और model evaluation अवसरों के लिए उपलब्ध।",
      },
    },
    aboutContent: {
      highlightLines: ["Purdue AI ग्रेजुएट (May 2026)", "AI ethics और alignment में मजबूत नींव के साथ।"],
      body:
        "कोर्सवर्क में Philosophy of AI, Ethics for Tech/Engineering/Design, Philosophy of Technology, Introduction to Ethics और Mathematical Logic शामिल हैं। तकनीकी प्रशिक्षण में Python Data Engineering, Research with Big Data I & II, Linear Algebra और Purdue Data Mine के 4 सेमेस्टर शामिल हैं।",
      metaTitle: "ML पर मेरा कार्य दृष्टिकोण",
      metaSubtitle: "मॉडल गुणवत्ता, fairness और वास्तविक उपयोगिता।",
      metaBody:
        "मैं वास्तविक सीमाओं के भीतर सिस्टम बनाता हूं: leakage-safe forecasting, reliable anomaly triage, clinical context में grounded retrieval, और ऐसे evaluation frameworks जो capability gaps स्पष्ट करें।",
      credentials: "प्रमाणपत्र",
    },
    contact: {
      lines: ["आइए ML सिस्टम बनाएं", "जो डिलीवर करें और जिम्मेदार भी रहें।"],
      body: "Applied ML roles, Responsible AI work, model evaluation या research collaboration के लिए संपर्क करें।",
    },
    certifications: {
      cta: "प्रमाणपत्र देखें",
    },
    footer: {
      credit: () => `© ${new Date().getFullYear()} Manas Jha - Applied ML और Responsible AI।`,
      stack: "React - Vite - Tailwind - Framer Motion",
    },
    cards: {
      poster: "केस स्टडी",
      mediaPrivate: "मीडिया अनुरोध पर उपलब्ध",
      mediaNote: "विस्तृत walkthroughs सहयोगियों के साथ निजी रूप से साझा किए जाते हैं।",
      metricsTitle: "मूल्यांकन मेट्रिक्स",
      metricsSub: "मॉडल प्रदर्शन स्नैपशॉट",
      metricsLive: "सत्यापित",
    },
    languageLabel: "भाषा",
    translationNotice: "",
  },
};

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "nl", label: "Nederlands" },
  { code: "hi", label: "हिन्दी" },
];

function mergeTranslations(base, override) {
  if (typeof base !== "object" || base === null) return override ?? base;
  const output = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(base)) {
    const oVal = override?.[key];
    const bVal = base[key];
    if (Array.isArray(bVal)) {
      output[key] = Array.isArray(oVal) && oVal.length ? oVal : bVal;
    } else if (typeof bVal === "object" && bVal !== null) {
      output[key] = mergeTranslations(bVal, oVal);
    } else {
      output[key] = oVal ?? bVal;
    }
  }
  if (override) {
    for (const key of Object.keys(override)) {
      if (!(key in output)) output[key] = override[key];
    }
  }
  return output;
}

const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  t: EN_TRANSLATION,
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");
  const t = mergeTranslations(EN_TRANSLATION, TRANSLATIONS[lang] || EN_TRANSLATION);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
