import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function buildCostProjection(loadData) {
  const currentYear = new Date().getFullYear();
  const metadata = loadData?.data?.metadata || {};
  const climate  = loadData?.data?.climate  || {};
  const derived  = loadData?.data?.derived  || {};

  const sqft       = metadata.size_sqft  || 2000;
  const hdd        = climate.annual_hdd  || 4000;
  const cdd        = climate.annual_cdd  || 1000;
  const age        = metadata.age_years  || 20;
  const fuel       = derived.inferred_fuel || "gas";
  const insulation = derived.insulation ?? 0.7;
  const stories    = derived.stories || 1;

  // Mirror calculator.py multipliers
  const ageMult        = age > 45 ? 1.3 : 1.0;
  const storyMult      = stories === 1 ? 1.15 : 0.90;
  const insulCredit    = insulation > 0.6 ? 0.85 : 1.0;

  const heatBtu = sqft * hdd * 18 * ageMult * storyMult * insulCredit;
  const coolBtu = sqft * cdd * 12 * ageMult * storyMult;

  const elecPrice = 0.15; // $/kWh
  let heatCost = 0;
  if      (fuel === "oil")      heatCost = (heatBtu / 138500) * 3.50;
  else if (fuel === "propane")  heatCost = (heatBtu / 91500)  * 2.50;
  else if (fuel === "electric") heatCost = (heatBtu / (3412 * 2.5)) * elecPrice;
  else                          heatCost = (heatBtu / 100000) * 1.40; // gas

  const coolCost = (coolBtu / (3412 * 3.0)) * elecPrice;
  const baseload = 1500; // avg US household appliances/lights

  const baseCost = heatCost + coolCost + baseload;

  // Inflation: fossil fuels rise faster; electric grid gets cheaper
  const inflation = fuel === "oil" ? 0.055 : fuel === "gas" ? 0.045 : 0.03;
  const aging     = 0.012; // systems degrade ~1.2%/yr

  return Array.from({ length: 16 }, (_, i) => ({
    year: currentYear + i,
    cost: Math.round(baseCost * Math.pow(1 + inflation + aging, i)),
  }));
}

function buildProjection(baseScore, loadData) {
  const currentYear = new Date().getFullYear();
  const metadata = loadData?.data?.metadata || {};
  const derived = loadData?.data?.derived || {};

  // Base decay: well-maintained modern home loses ~0.4/yr
  let decayRate = 0.4;

  // Older homes deteriorate faster (materials, systems aging)
  const age = metadata.age_years || 0;
  decayRate += Math.min(age / 80, 0.5);

  // Fossil fuel homes get penalized more as the grid gets cleaner
  const fuel = derived.inferred_fuel;
  if (fuel === "oil")      decayRate += 0.4;
  else if (fuel === "gas") decayRate += 0.2;
  else if (fuel === "electric") decayRate -= 0.15; // grid greening helps electric homes

  // Poor insulation accelerates decay
  if ((derived.insulation ?? 1) < 0.4) decayRate += 0.2;

  decayRate = Math.max(0.1, decayRate); // floor at 0.1/yr

  return Array.from({ length: 16 }, (_, i) => ({
    year: currentYear + i,
    score: Math.max(0, Math.round(baseScore - i * decayRate)),
  }));
}

export default function GraphPage({ onBack, loadData }) {
  console.log("=== loadData on GraphPage ===", JSON.stringify(loadData, null, 2));
  const [activeTab, setActiveTab] = useState("footprint");
  const baseScore = loadData?.data?.past?.eco_score;
  const [backHover, setBackHover] = useState(false);

  const tabs = [
    { id: "footprint", label: "Expected Footprint" },
    { id: "graph", label: "Cost" },
  ];

  return (
    <div style={{
      width: "100vw", height: "100vh", position: "relative",
      backgroundImage: "url(/bg5.png)",
      backgroundSize: "cover", backgroundPosition: "center",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />

      {/* Back button */}
      <button
        onClick={onBack}
        onMouseEnter={() => setBackHover(true)}
        onMouseLeave={() => setBackHover(false)}
        style={{
          position: "absolute", top: 15, left: 15, zIndex: 10,
          background: "none", border: "none",
          color: backHover ? "#2d5a27" : "#4a7c59",
          fontWeight: 900, fontSize: 20, cursor: "pointer",
          fontFamily: "var(--font-ui)",
          transition: "color 0.15s",
        }}
      >← Back</button>

      {/* Row: panel + house */}
      <div style={{ position: "relative", display: "flex", flexDirection: "row", alignItems: "center", gap: 60 }}>

        {/* Column: tabs + content box */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", overflow: "hidden" }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 16,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  padding: "12px 36px",
                  border: "none",
                  borderRadius: "8px 8px 0 0",
                  cursor: "pointer",
                  background: activeTab === tab.id ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)",
                  color: activeTab === tab.id ? "#111" : "#fff",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Tab content */}
          <div style={{
            background: "rgba(255,255,255,0.55)",
            borderRadius: "0 24px 24px 0",
            width: 680,
            minHeight: 360,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {activeTab === "footprint" && (
              baseScore != null ? (
                <div style={{ width: "100%", padding: "24px 16px" }}>
                  <p style={{ fontFamily: "var(--font-ui)", color: "#333", fontWeight: 700, fontSize: 14, marginBottom: 12, textAlign: "center" }}>
                    Eco Score Projection (next 15 years)
                  </p>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={buildProjection(baseScore, loadData)} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <XAxis dataKey="year" tick={{ fontFamily: "var(--font-ui)", fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontFamily: "var(--font-ui)", fontSize: 12 }} />
                      <Tooltip formatter={(v) => [`${v} / 100`, "Eco Score"]} />
                      <Line type="monotone" dataKey="score" stroke="#4a7c59" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p style={{ fontFamily: "var(--font-ui)", color: "#888", fontSize: 14 }}>Loading score…</p>
              )
            )}
            {activeTab === "graph" && (
              <div style={{ width: "100%", padding: "24px 16px" }}>
                <p style={{ fontFamily: "var(--font-ui)", color: "#333", fontWeight: 700, fontSize: 14, marginBottom: 12, textAlign: "center" }}>
                  Projected Annual Energy Cost (next 15 years)
                </p>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={buildCostProjection(loadData)} margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="year" tick={{ fontFamily: "var(--font-ui)", fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} tick={{ fontFamily: "var(--font-ui)", fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, "Annual Cost"]} />
                    <Line type="monotone" dataKey="cost" stroke="#c0392b" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Polygon house — 3/4 perspective */}
        <svg viewBox="0 0 210 248" width={252} height={298} xmlns="http://www.w3.org/2000/svg">
          {/* Ground shadow */}
          <ellipse cx="100" cy="238" rx="85" ry="7" fill="#2a3a2a" />

          {/* Chimney right face */}
          <polygon points="118,18 118,54 128,48 128,12" fill="#7A6244" />
          {/* Chimney front face */}
          <polygon points="106,22 106,58 118,54 118,18" fill="#9A7A54" />
          {/* Chimney top */}
          <polygon points="106,22 118,18 128,12 116,16" fill="#C4A472" />

          {/* Right side wall (shadow face) */}
          <polygon points="130,222 178,194 178,88 130,116" fill="#A08860" />

          {/* Front wall (light face) */}
          <polygon points="15,222 130,222 130,116 15,116" fill="#C9AA7A" />

          {/* Right roof face (dark) */}
          <polygon points="72,58 118,30 178,88 130,116" fill="#3D607A" />
          {/* Front roof face (light) */}
          <polygon points="72,58 15,116 130,116" fill="#5C8FAA" />

          {/* Door */}
          <polygon points="65,222 65,162 104,162 104,222" fill="#7B4A2A" />
          {/* Door panel */}
          <polygon points="70,167 70,192 99,192 99,167" fill="#6A3C20" />
          {/* Door knob */}
          <circle cx="97" cy="196" r="2.5" fill="#D4A030" />

          {/* Left window */}
          <polygon points="22,130 22,160 56,160 56,130" fill="#A8CCE0" />
          <line x1="39" y1="130" x2="39" y2="160" stroke="#7AAAC4" strokeWidth="2" />
          <line x1="22" y1="145" x2="56" y2="145" stroke="#7AAAC4" strokeWidth="2" />
          <polygon points="22,130 22,160 56,160 56,130" fill="none" stroke="#6898B0" strokeWidth="1.5" />

          {/* Right window (front wall) */}
          <polygon points="78,130 78,160 114,160 114,130" fill="#A8CCE0" />
          <line x1="96" y1="130" x2="96" y2="160" stroke="#7AAAC4" strokeWidth="2" />
          <line x1="78" y1="145" x2="114" y2="145" stroke="#7AAAC4" strokeWidth="2" />
          <polygon points="78,130 78,160 114,160 114,130" fill="none" stroke="#6898B0" strokeWidth="1.5" />

          {/* Side window (parallelogram on right face) */}
          <polygon points="137,128 163,113 163,141 137,156" fill="#88B8CC" />
          <line x1="150" y1="120" x2="150" y2="149" stroke="#5A98B4" strokeWidth="1.5" />
          <line x1="137" y1="134" x2="163" y2="127" stroke="#5A98B4" strokeWidth="1.5" />
          <polygon points="137,128 163,113 163,141 137,156" fill="none" stroke="#5A98B4" strokeWidth="1.5" />
        </svg>

      </div>
    </div>
  );
}
