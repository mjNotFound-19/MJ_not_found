// src/components/SkillList.jsx
export default function SkillList() {
  const skills = [
    {
      title: "AI & Machine Learning",
      items: [
        "Transformers (TimesFM, TimeGPT, LLM Fine-Tuning)",
        "PyTorch",
        "TensorFlow",
        "Keras",
        "CNNs",
        "RNNs",
        "Attention Mechanisms",
        "Autoencoders",
        "Reinforcement Learning",
        "Time-Series Forecasting",
        "Anomaly Detection",
        "XGBoost",
        "LightGBM",
        "CatBoost",
        "scikit-learn",
        "Feature Engineering",
        "Model Optimization",
        "Hyperparameter Tuning",
        "Cross-Validation",
      ],
    },
    {
      title: "Data Science & Analytics",
      items: [
        "Data Cleaning",
        "Exploratory Data Analysis (Pandas, NumPy)",
        "Data Wrangling",
        "Statistical Modeling",
        "Hypothesis Testing",
        "Regression & Correlation Analysis",
        "Visualization (Matplotlib, Seaborn, Plotly)",
        "SQL",
        "Query Optimization",
        "BigQuery",
        "Snowflake",
        "Grafana Dashboards",
        "Power BI",
        "Tableau",
        "A/B Testing",
        "KPI Tracking",
      ],
    },
    {
      title: "Software Engineering",
      items: [
        "Python (OOP, AsyncIO, REST APIs)",
        "JavaScript / TypeScript (React, Node.js, Express)",
        "Vite",
        "TailwindCSS",
        "FastAPI",
        "Flask",
        "Git",
        "GitHub Actions",
        "CI/CD Pipelines",
        "Docker",
        "Bash",
        "Linux Environments",
        "API Integration",
        "Unit Testing (pytest, Jest)",
      ],
    },
    {
      title: "F1 & Motorsport Analytics",
      items: [
        "FastF1 API Integration",
        "Telemetry Parsing",
        "Lap-Time Prediction (XGBoost, Neural Nets)",
        "Race Strategy Forecasting",
        "Tyre Degradation Modeling",
        "Weather & Circuit Analysis",
        "Dashboard Visualization",
        "Race Simulations",
        "Real-Time Data Processing",
      ],
    },
    {
      title: "MLOps & DevOps",
      items: [
        "MLflow",
        "DVC",
        "Hugging Face Transformers",
        "ONNX",
        "Model Deployment & Tracking",
        "Containerization (Docker)",
        "Kubernetes (Basic)",
        "AWS (S3, EC2, Lambda, SageMaker)",
        "GCP Vertex AI",
        "Monitoring (Grafana, Prometheus)",
        "Model Versioning",
        "Experiment Tracking",
      ],
    },
    {
      title: "IoT & Edge AI (Raspberry Pi)",
      items: [
        "Raspberry Pi (Setup & Configuration)",
        "Edge AI Deployment (TensorFlow Lite, PyTorch Mobile)",
        "Sensor Data Collection",
        "Computer Vision (OpenCV)",
        "GPIO Control & Automation",
        "MQTT / HTTP Communication",
        "Cryptomining Configuration & Optimization (Experimental)",
        "Security Hardening Scripts",
        "Data Encryption & Secure Storage",
        "Real-Time Monitoring",
      ],
    },
    {
      title: "UI/UX & Design",
      items: [
        "Figma",
        "Framer Motion",
        "Glassmorphism",
        "Responsive Design",
        "Lenis Smooth Scrolling",
        "Interactive Animations",
        "Motion Effects",
        "Accessibility Design",
        "Wireframing",
        "Prototyping",
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
      {skills.map((category, index) => (
        <div
          key={index}
          className="p-4 rounded-2xl glass border border-[#00AEEF]/30 shadow-lg hover:shadow-[0_0_20px_#00AEEF60] transition"
        >
          <h3 className="text-xl font-semibold text-[#00AEEF] mb-3">
            {category.title}
          </h3>
          <ul className="text-sm leading-relaxed text-gray-300 list-disc list-inside">
            {category.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

