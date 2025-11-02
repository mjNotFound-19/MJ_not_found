import { F1_RESULTS } from "../config/content";

export default function ProjectF1() {
  return (
    <div className="space-y-10">
      {/* === Flat Out F1 Project === */}
      <div className="glass rounded-2xl border border-gray-800 p-0 overflow-hidden">
        <div className="p-6 md:p-8">
          <h3 className="text-2xl font-bold text-[#00AEEF]">
            Flat Out F1 - Intelligent Race Analytics
          </h3>
          <p className="text-gray-300 mt-3">
            AI-powered Formula 1 race prediction system that combines telemetry, lap-time
            statistics, and machine-learning models to forecast finishing positions and pit
            strategies.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-100">Core Features</h4>
              <ul className="text-gray-300 mt-2 space-y-1 list-disc ml-5">
                <li>Real-time data collection pipeline</li>
                <li>Hybrid ML pipeline (XGBoost + Neural Network)</li>
                <li>Post-race evaluation metrics</li>
                <li>Incremental model retraining</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-100">
                Overall Accuracy (Australia 2025 - Mexico 2025)
              </h4>
              <div className="table-wrap mt-2">
                <table className="metrics-table text-sm">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {F1_RESULTS.map(([m, v]) => (
                      <tr key={m}>
                        <td>{m}</td>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-gray-400 mt-2 text-sm">
                These results highlight the model's consistent accuracy in predicting
                top-performing drivers across recent Grands Prix.
              </p>
            </div>
          </div>

          <a
            href="https://github.com/mjNotFound-19/Flat_Out_F1"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-[#00AEEF] text-black font-semibold shadow-glow hover:brightness-110 transition"
          >
            View on GitHub
          </a>
        </div>
      </div>

      {/* === Raspberry Pi Cryptomining Project === */}
      <div className="glass rounded-2xl border border-gray-800 p-0 overflow-hidden">
        <div className="p-6 md:p-8">
          <h3 className="text-2xl font-bold text-[#00AEEF]">
            Raspberry Pi Monero (XMR) Cryptomining Setup
          </h3>

          <ul className="text-gray-300 mt-4 space-y-2 list-disc ml-5">
            <li>
              Deployed a lightweight Monero (XMR) miner on Raspberry Pi as an experimental
              distributed-computing project.
            </li>
            <li>
              Configured xmrig for ARM architecture, automated mining sessions using Bash and
              Python scripts, and tuned CPU/thermal limits for optimal hash rates.
            </li>
            <li>
              Explored mining algorithms, resource allocation, and pool integration for other
              cryptocurrencies to understand cross-coin performance patterns.
            </li>
            <li>
              Documented performance metrics, system efficiency, and energy considerations for
              low-power mining setups.
            </li>
          </ul>

          <a
            href="/assets/docs/CryptoMining.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-[#00AEEF] text-black font-semibold shadow-glow hover:brightness-110 transition"
          >
            View Full Report
          </a>
        </div>
      </div>

      {/* === Raspberry Pi Security Project === */}
      <div className="glass rounded-2xl border border-gray-800 p-0 overflow-hidden">
        <div className="p-6 md:p-8">
          <h3 className="text-2xl font-bold text-[#00AEEF]">
            Raspberry Pi Security Hardening and Data Encryption
          </h3>

          <ul className="text-gray-300 mt-4 space-y-2 list-disc ml-5">
            <li>
              Developed security-hardening scripts to enhance data protection and system
              integrity on Raspberry Pi devices.
            </li>
            <li>
              Implemented AES-based file encryption, automated key rotation, and restricted user
              privileges to minimize exposure risks.
            </li>
            <li>
              Configured firewall (ufw), intrusion detection (Fail2Ban), and audit logs for
              real-time monitoring and active defense.
            </li>
            <li>
              Applied cybersecurity principles, including incident response, secure
              authentication, and vulnerability management.
            </li>
            <li>
              Ensured encryption and proactive protection for sensitive data on edge hardware.
            </li>
          </ul>

          <a
            href="/assets/docs/SecurityHardening.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-[#00AEEF] text-black font-semibold shadow-glow hover:brightness-110 transition"
          >
            View Full Report
          </a>
        </div>
      </div>
    </div>
  );
}

