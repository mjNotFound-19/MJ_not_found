import googleLogo from "../assets/google-logo.svg";

export const CONTACT = {
  email: "manasjha.015@gmail.com",
  location: "Atlanta, GA",
  citizenship: "US Citizen",
  availability: "Open to hybrid on-site",
  github: "https://github.com/mjNotFound-19",
  linkedin: "https://linkedin.com/in/mjNotFound19",
  website: "https://manasjha.online",
};

export const HERO = {
  roles: [
    "securing autonomous AI coding agents",
    "writing frontier-model coding benchmarks",
    "shipping data-intensive systems on GCP",
    "forecasting demand across 1,500+ suppliers",
  ],
  badges: ["AI coding agents", "LLM evaluation", "RAG", "Google Cloud"],
  stats: [
    {
      label: "Building on GCP",
      value: "2+ yrs",
      meta: "Cloud, data-intensive systems",
    },
    {
      label: "Network flows monitored",
      value: "15M+/min",
      meta: "Grafana + Cloud Datastore",
      projectId: "cat-network-traffic",
    },
    {
      label: "Supplier forecast error",
      value: "13.4% WAPE",
      meta: "TFT + TimesFM, 1,500+ suppliers",
      projectId: "supply-chain-tft",
    },
    {
      label: "Race simulations",
      value: "10,000",
      meta: "Monte Carlo runs per race",
      projectId: "flat-out-f1",
    },
  ],
  spotlight: [
    {
      title: "Arachnid",
      org: "Founder, Stealth Startup",
      status: "Current",
      description:
        "An intent-aware security layer that monitors and constrains autonomous AI coding agents. I own the architecture, the threat modeling and the implementation.",
    },
    {
      title: "Handshake",
      org: "AI & ML Researcher (Contract)",
      status: "Current",
      description:
        "Writing advanced software-engineering benchmark problems, reference solutions and automated judge test cases that measure frontier models for leading AI labs.",
    },
  ],
};

export const MOMENTUM_TRACK = [
  {
    id: "clinical-rag",
    eyebrow: "Clinical AI research",
    title: "Cardiometabolic RAG evaluation",
    description:
      "Retrieval and response-quality refinement for a conversational mHealth assistant where clinical grounding and citation traceability are non-negotiable.",
    tag: "Responsible AI",
    metric: "100+ applicants cohort",
    accent: "#7dd3fc",
    poster: null,
  },
  {
    id: "llm-eval",
    eyebrow: "Frontier model testing",
    title: "Structured LLM benchmarking",
    description:
      "Concurrent contractor projects evaluating frontier LLM behavior with rubrics, authored prompts, reference solutions, and test cases.",
    tag: "Model evaluation",
    metric: "Multi-lab contracts",
    accent: "#c084fc",
    poster: null,
  },
  {
    id: "forecasting",
    eyebrow: "Caterpillar forecasting",
    title: "Temporal Fusion Transformer pipeline",
    description:
      "Supplier demand forecasting at 1,500+ supplier scale using multi-scale feature engineering, quantile loss, and strict no-future-leakage evaluation.",
    tag: "Applied ML",
    metric: "13.4% WAPE",
    accent: "#34d399",
    poster: null,
  },
  {
    id: "infrastructure",
    eyebrow: "Infrastructure analytics",
    title: "Network anomaly triage",
    description:
      "Real-time traffic classification and anomaly detection with Grafana dashboards ingesting 15M+ records per minute and LDAP access control.",
    tag: "Data systems",
    metric: "15M+ records/min",
    accent: "#f59e0b",
    poster: null,
  },
];

export const MOMENTUM_PILLS = [
  "AI coding agents",
  "Frontier LLM evaluation",
  "Temporal Fusion Transformer",
  "Anomaly detection",
  "15M+ records/min",
  "RAG",
];

export const ABOUT_FEATURES = [
  {
    title: "AI coding agents",
    detail: "Build + secure",
    description:
      "I write frontier-model coding benchmarks and judge test cases, and I'm building Arachnid to keep autonomous coding agents inside their intended scope.",
  },
  {
    title: "Cloud data systems",
    detail: "2+ yrs on GCP",
    description:
      "High-throughput pipelines on Google Cloud: ML flow classification over 15M+ records per minute, Grafana observability and LDAP-based access control.",
  },
  {
    title: "Applied ML + evaluation",
    detail: "Measured, not guessed",
    description:
      "TFT and TimesFM forecasting at 13.4% WAPE, RAG pipelines with grounding metrics, and rubric-based evaluation of LLM output.",
  },
];

export const EXPERIENCE = [
  {
    role: "Founder",
    org: "Stealth Startup - United States",
    period: "Aug 2026 - Present",
    bullets: [
      "Building Arachnid, an intent-aware security layer that monitors and constrains autonomous AI coding agents.",
      "Own the system architecture, threat modeling and implementation.",
    ],
  },
  {
    role: "AI & Machine Learning Researcher (Contract)",
    org: "Handshake - West Lafayette, IN",
    period: "May 2026 - Present",
    bullets: [
      "Author advanced software-engineering benchmark problems, reference solutions and automated judge test cases used to measure the coding capability of frontier models for leading AI labs.",
      "Evaluate frontier LLM and multimodal model outputs against structured rubrics covering correctness, instruction-following, factuality and safety, and write evaluations used in downstream model assessment.",
    ],
  },
  {
    role: "AI Researcher",
    org: "Purdue University CS Dept. - West Lafayette, IN",
    period: "May 2026 - Aug 2026",
    bullets: [
      "Selected as one of fewer than 10 students from 100+ applicants for an interdisciplinary research team advised by Dr. Qinglan Ding and Dr. Tianyi Zhang.",
      "Designed and implemented the LLM orchestration layer of a personalized health chatbot for adults managing cardiovascular and metabolic risk: component interfaces, control flow and multi-step conversational workflows.",
      "Architected a RAG pipeline with persona-aware context assembly that produces grounded, citation-traceable responses, and defined metrics for retrieval accuracy, grounding and unsupported-claim rate.",
    ],
  },
  {
    role: "Data Science Researcher - Supply Chain Forecasting",
    org: "Caterpillar Inc. (The Data Mine) - West Lafayette, IN",
    period: "Aug 2025 - May 2026",
    bullets: [
      "Developed and fine-tuned Temporal Fusion Transformer and TimesFM models forecasting demand across 1,500+ suppliers, reaching 13.4% WAPE on held-out data.",
      "Owned the end-to-end pipeline (ingestion, feature construction, training, held-out validation, error analysis), integrating procurement and shipment data under production schema and data-quality constraints.",
    ],
  },
  {
    role: "Data Science Researcher - Network Security Analytics",
    org: "Caterpillar Inc. (The Data Mine) - West Lafayette, IN",
    period: "Jan 2025 - May 2025",
    bullets: [
      "Engineered a high-throughput network traffic analysis platform on Google Cloud Datastore with ML-based flow classification, supporting WAN capacity planning and anomaly detection.",
      "Designed and deployed Grafana dashboards monitoring 15M+ network flow records per minute in real time, improving incident response.",
      "Implemented LDAP-based authentication for secure, role-aware access to internal network analytics and WAN planning tools.",
    ],
  },
  {
    role: "Data Science Researcher - Agricultural Forecasting",
    org: "BASF (The Data Mine) - West Lafayette, IN",
    period: "Aug 2024 - Dec 2024",
    bullets: [
      "Built geospatial ML models to predict corn and soybean production across Indiana, Iowa and Illinois.",
      "Built scalable ETL pipelines integrating multi-source agricultural and remote-sensing data.",
    ],
  },
  {
    role: "Machine Learning Intern",
    org: "Avolta, Inc. - Remote",
    period: "Dec 2023 - Jun 2024",
    bullets: [
      "Built Python software, ML models and intrusion detection systems (IDS) with SIEM tooling on Raspberry Pi / Raspbian hardware for automotive security.",
    ],
  },
];

export const PROJECTS = [
  {
    id: "arachnid",
    title: "Arachnid - Guardrails for AI Coding Agents",
    tag: "Founder / in stealth",
    description:
      "An intent-aware security layer that sits between an autonomous AI coding agent and the system it works on. It watches what the agent does, checks that against what it was asked to do, and constrains actions that drift out of scope.",
    highlights: [
      "Monitors and constrains agent actions based on intent, not just static allowlists.",
      "Threat model built around the ways autonomous coding agents go wrong.",
      "I own the architecture, threat modeling and implementation.",
    ],
    stack: ["AI coding agents", "Threat modeling", "Security", "LLM orchestration"],
    metrics: [],
    poster: null,
    mediaPanel: false,
    cta: {
      label: "Ask about Arachnid",
      href: "#contact",
    },
  },
  {
    id: "flat-out-f1",
    title: "Flat Out F1 v2 - Race Prediction Pipeline",
    tag: "Monte Carlo + ensembles",
    description:
      "An end-to-end F1 race prediction pipeline: FastF1/OpenF1 ingestion, per-driver features from practice, qualifying, testing and historical profiles, and a blended ensemble checked with leave-one-out validation.",
    highlights: [
      "Ensemble of gradient boosting, random forest, extra trees, ridge, Bayesian ridge and SVR.",
      "10,000-run Monte Carlo race simulator modeling DNF probability, grid effects, team/driver shocks and safety-car compression.",
      "Outputs win/podium probabilities and P10/P50/P90 finish ranges through a Node.js dashboard.",
    ],
    stack: ["Python", "scikit-learn", "PyTorch", "SciPy", "FastF1", "OpenF1", "Node.js"],
    metrics: [
      { label: "Race sims", value: "10k" },
      { label: "Ensemble models", value: "6" },
      { label: "Validation", value: "LOO" },
    ],
    poster: "/assets/flatout-grid.svg",
    cta: {
      label: "View repo",
      href: "https://github.com/mjNotFound-19/Flat_Out_F1_V2",
    },
  },
  {
    id: "supply-chain-tft",
    title: "Supply Chain Forecasting - Caterpillar",
    tag: "Production forecasting",
    description:
      "Temporal Fusion Transformer and TimesFM models forecasting supplier demand across 1,500+ suppliers, built under production schema and data-quality constraints.",
    highlights: [
      "Owned the pipeline end to end: ingestion, feature construction, training, held-out validation and error analysis.",
      "Integrated procurement and shipment data with strict no-future-leakage evaluation.",
      "Reached 13.4% WAPE on held-out data.",
    ],
    stack: ["PyTorch Forecasting", "Temporal Fusion Transformer", "TimesFM", "Python", "pandas"],
    metrics: [
      { label: "WAPE", value: "13.4%" },
      { label: "Suppliers", value: "1,500+" },
    ],
    poster: "/assets/docs/supply_chain_poster.jpeg",
    cta: {
      label: "View poster",
      href: "/assets/docs/supply_chain_poster.jpeg",
    },
  },
  {
    id: "cat-network-traffic",
    title: "Network Security Analytics - Caterpillar",
    tag: "Network analytics",
    description:
      "A high-throughput network traffic analysis platform with ML-based flow classification, supporting WAN capacity planning and anomaly detection for Caterpillar's IT org.",
    highlights: [
      "Built on Google Cloud Datastore with ML-based flow classification.",
      "Grafana dashboards monitoring 15M+ network flow records per minute in real time.",
      "LDAP-based authentication for role-aware access to analytics and WAN planning tools.",
    ],
    stack: ["Google Cloud Datastore", "Python", "Grafana", "LDAP"],
    poster: "/assets/docs/Caterpillar_poster1.pdf",
    mediaPanel: false,
    cta: {
      label: "View poster",
      href: "/assets/docs/Caterpillar_poster1.pdf",
    },
  },
  {
    id: "avolta-security",
    title: "Automotive Intrusion Detection - Avolta",
    tag: "Security + embedded ML",
    description:
      "Python software, ML models and intrusion detection systems running on Raspberry Pi hardware for automotive security.",
    highlights: [
      "IDS with SIEM tooling for security event triage.",
      "Lightweight models deployed on Raspbian for on-device inference.",
    ],
    stack: ["Python", "IDS", "SIEM", "Raspberry Pi", "Linux"],
    metrics: [],
    poster: null,
    mediaPanel: false,
    cta: {
      label: "Discuss security work",
      href: "#contact",
    },
  },
];

export const SKILLS = {
  "AI Coding & Evaluation": [
    "AI coding agents",
    "Frontier-model benchmarks",
    "Automated judge tests",
    "Adversarial test design",
    "Rubric-based evaluation",
    "LLM orchestration",
    "RAG",
  ],
  "Languages & Cloud": [
    "Python",
    "JavaScript / TypeScript",
    "SQL",
    "C",
    "Bash",
    "Node.js",
    "Google Cloud Platform",
    "Cloud Datastore",
    "LDAP",
    "Grafana",
    "Linux",
    "Git",
  ],
  "ML & Data": [
    "PyTorch",
    "TensorFlow / Keras",
    "scikit-learn",
    "XGBoost",
    "pandas",
    "ETL pipelines",
    "IDS",
    "SIEM",
    "Network traffic analysis",
  ],
};

export const CERTIFICATIONS = [
  {
    title: "Google AI Professional Certificate",
    issuer: "Google Career Certificates",
    date: "May 2026",
    logo: googleLogo,
    link: "https://www.credly.com/badges/0ddf776f-59be-443a-ba4d-828372c0386f/linked_in_profile",
  },
  {
    title: "Google Cybersecurity Professional Certificate",
    issuer: "Google Career Certificates",
    date: "June 2023",
    logo: googleLogo,
    link: "https://www.credly.com/badges/f4aed5da-536f-4f3d-9f4c-dd80c17dd9e6/linked_in_profile",
  },
  {
    title: "AI Agent Fundamentals",
    issuer: "Certificate",
  },
  {
    title: "AI Fundamentals",
    issuer: "Certificate",
  },
];
