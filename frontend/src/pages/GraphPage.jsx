import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BG_URL5 } from "../constants";

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

function buildImprovedCostProjection(loadData, future) {
  const currentYear = new Date().getFullYear();
  const percentReduction = future?.carbon_score_update?.percent_reduction;
  const horizonYears = future?.time_horizon_years ?? 10;
  if (percentReduction == null) return null;

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

  const ageMult     = age > 45 ? 1.3 : 1.0;
  const storyMult   = stories === 1 ? 1.15 : 0.90;
  const insulCredit = insulation > 0.6 ? 0.85 : 1.0;

  const heatBtu = sqft * hdd * 18 * ageMult * storyMult * insulCredit;
  const coolBtu = sqft * cdd * 12 * ageMult * storyMult;

  const elecPrice = 0.15;
  let heatCost = 0;
  if      (fuel === "oil")      heatCost = (heatBtu / 138500) * 3.50;
  else if (fuel === "propane")  heatCost = (heatBtu / 91500)  * 2.50;
  else if (fuel === "electric") heatCost = (heatBtu / (3412 * 2.5)) * elecPrice;
  else                          heatCost = (heatBtu / 100000) * 1.40;

  const coolCost = (coolBtu / (3412 * 3.0)) * elecPrice;
  const baseload  = 1500;
  const baseCost  = heatCost + coolCost + baseload;

  // Only HVAC/heating shrinks; baseload stays
  const reducedEnergyCost = (heatCost + coolCost) * (1 - percentReduction / 100);
  const improvedBaseCost  = reducedEnergyCost + baseload;

  // Post-renovation: lower inflation (cleaner systems, grid greening)
  const improvedInflation = 0.025;
  const aging = 0.012;

  return Array.from({ length: 16 }, (_, i) => {
    let cost;
    if (i <= horizonYears) {
      const t = i / horizonYears;
      cost = Math.round(baseCost + (improvedBaseCost - baseCost) * t);
    } else {
      cost = Math.round(improvedBaseCost * Math.pow(1 + improvedInflation + aging, i - horizonYears));
    }
    return { year: currentYear + i, cost };
  });
}

function buildImprovedProjection(baseScore, future, loadData) {
  const currentYear = new Date().getFullYear();
  const updatedScore = future?.carbon_score_update?.updated_eco_score;
  const horizonYears = future?.time_horizon_years ?? 10;
  if (updatedScore == null) return null;

  const metadata = loadData?.data?.metadata || {};
  const age = metadata.age_years || 0;
  // Reduced decay after renovations — half the base, age effect halved, no fuel penalty
  let decayRate = Math.max(0.05, 0.2 + Math.min(age / 160, 0.25));

  return Array.from({ length: 16 }, (_, i) => {
    let score;
    if (i <= horizonYears) {
      score = Math.round(baseScore + (updatedScore - baseScore) * (i / horizonYears));
    } else {
      score = Math.max(0, Math.round(updatedScore - (i - horizonYears) * decayRate));
    }
    return { year: currentYear + i, score };
  });
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
  const [showPopup, setShowPopup] = useState(false);
  const baseScore = loadData?.data?.past?.eco_score;
  const future = loadData?.data?.future;
  const [backHover, setBackHover] = useState(false);

  // Popup data
  const updatedScore = future?.carbon_score_update?.updated_eco_score;
  const scoreDelta = updatedScore != null && baseScore != null ? Math.round(updatedScore - baseScore) : null;
  const percentReduction = future?.carbon_score_update?.percent_reduction;
  const annualCO2 = future?.total_estimated_annual_co2_reduction;
  const horizonYears = future?.time_horizon_years ?? 10;
  const baselineProj = buildCostProjection(loadData);
  const improvedProj = buildImprovedCostProjection(loadData, future);
  const horizonIdx = Math.min(horizonYears, 15);
  const annualSavings = improvedProj
    ? (baselineProj[horizonIdx]?.cost ?? 0) - (improvedProj[horizonIdx]?.cost ?? 0)
    : null;

  const tabs = [
    { id: "footprint", label: "Expected Footprint" },
    { id: "graph", label: "Cost" },
  ];

  return (
    <div style={{
          width: "100vw", height: "100vh", position: "relative",
          backgroundImage: `url(${BG_URL5})`,
          backgroundSize: "cover", backgroundPosition: "center 80%",
          overflow: "hidden",
          fontFamily: "var(--font-ui)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.15)" }} />
          <div style={{
            position: "absolute", inset: 0,
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(1px)",
            maskImage: "radial-gradient(ellipse 65% 55% at 50% 52%, black 20%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 52%, black 20%, transparent 75%)",
            pointerEvents: "none",
          }} />

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

      {/* Row: graph left, house+trees right */}
      <div style={{ position: "relative", display: "flex", flexDirection: "row", alignItems: "center", gap: 48 }}>

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
                  background: activeTab === tab.id ? "rgba(255,255,255,0.88)" : "#8B5E3C",
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
            background: "rgba(255,255,255,0.88)",
            borderRadius: "0px 24px 24px 24px",
            width: 780,
            minHeight: 360,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {activeTab === "footprint" && (
              baseScore != null ? (() => {
                const baseline = buildProjection(baseScore, loadData);
                const improved = buildImprovedProjection(baseScore, future, loadData);
                const chartData = baseline.map((pt, i) => ({
                  ...pt,
                  ...(improved ? { improvedScore: improved[i].score } : {}),
                }));
                const allScores = chartData.flatMap(pt => [pt.score, pt.improvedScore].filter(v => v != null));
                const scoreMin = Math.max(0, Math.min(...allScores) - 5);
                const scoreMax = Math.min(100, Math.max(...allScores) + 5);
                return (
                  <div style={{ width: "100%", padding: "24px 16px" }}>
                    <p style={{ fontFamily: "var(--font-ui)", color: "#333", fontWeight: 700, fontSize: 14, marginBottom: 12, textAlign: "center" }}>
                      Eco Score Projection (next 15 years)
                    </p>
                    <ResponsiveContainer width="100%" height={290}>
                      <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                        <XAxis dataKey="year" tick={{ fontFamily: "var(--font-ui)", fontSize: 12 }} />
                        <YAxis domain={[scoreMin, scoreMax]} tick={{ fontFamily: "var(--font-ui)", fontSize: 12 }} />
                        <Tooltip formatter={(v, name) => [`${v} / 100`, name === "score" ? "Without plan" : "With plan"]} />
                        <Legend formatter={(name) => name === "score" ? "Without plan" : "With plan"} wrapperStyle={{ fontFamily: "var(--font-ui)", fontSize: 12 }} />
                        <Line type="monotone" dataKey="score" stroke="#4a7c59" strokeWidth={2.5} dot={false} />
                        {improved && <Line type="monotone" dataKey="improvedScore" stroke="#8B5E3C" strokeWidth={2.5} dot={false} strokeDasharray="6 3" />}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                );
              })() : (
                <p style={{ fontFamily: "var(--font-ui)", color: "#888", fontSize: 14 }}>Loading score…</p>
              )
            )}
            {activeTab === "graph" && (() => {
              const baseline = buildCostProjection(loadData);
              const improved = buildImprovedCostProjection(loadData, future);
              const chartData = baseline.map((pt, i) => ({
                ...pt,
                ...(improved ? { improvedCost: improved[i].cost } : {}),
              }));
              const allCosts = chartData.flatMap(pt => [pt.cost, pt.improvedCost].filter(v => v != null));
              const costMin = Math.floor(Math.min(...allCosts) * 0.95);
              const costMax = Math.ceil(Math.max(...allCosts) * 1.05);
              return (
                <div style={{ width: "100%", padding: "24px 16px" }}>
                  <p style={{ fontFamily: "var(--font-ui)", color: "#333", fontWeight: 700, fontSize: 14, marginBottom: 12, textAlign: "center" }}>
                    Projected Annual Energy Cost (next 15 years)
                  </p>
                  <ResponsiveContainer width="100%" height={290}>
                    <LineChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <XAxis dataKey="year" tick={{ fontFamily: "var(--font-ui)", fontSize: 12 }} />
                      <YAxis domain={[costMin, costMax]} tickFormatter={(v) => `$${v.toLocaleString()}`} tick={{ fontFamily: "var(--font-ui)", fontSize: 12 }} />
                      <Tooltip formatter={(v, name) => [`$${v.toLocaleString()}`, name === "cost" ? "Without plan" : "With plan"]} />
                      <Legend formatter={(name) => name === "cost" ? "Without plan" : "With plan"} wrapperStyle={{ fontFamily: "var(--font-ui)", fontSize: 12 }} />
                      <Line type="monotone" dataKey="cost" stroke="#4a7c59" strokeWidth={2.5} dot={false} />
                      {improved && <Line type="monotone" dataKey="improvedCost" stroke="#8B5E3C" strokeWidth={2.5} dot={false} strokeDasharray="6 3" />}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right: house */}
        <div
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => setShowPopup(true)}
        >
          <style>{`
            @keyframes houseBounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
          <img
            src="/house.png"
            alt="house"
            style={{
              width: 320, objectFit: "contain", userSelect: "none",
              animation: "houseBounce 1.8s ease-in-out infinite",
            }}
          />
          <div style={{
            marginTop: 8,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(4px)",
            borderRadius: 99,
            padding: "6px 18px",
            fontSize: 13, fontWeight: 600,
            color: "#2E7D32",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}>
            Click for more info
          </div>
        </div>

      </div>

      {/* House popup */}
      {showPopup && (
        <div
          onClick={() => setShowPopup(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.38)",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "rgba(255,255,255,0.97)",
              borderRadius: 20,
              padding: "32px 36px",
              width: 420,
              boxShadow: "0 12px 48px rgba(0,0,0,0.28)",
              position: "relative",
              fontFamily: "var(--font-ui)",
            }}
          >
            <button
              onClick={() => setShowPopup(false)}
              style={{ position: "absolute", top: 14, right: 18, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#aaa", lineHeight: 1 }}
            >×</button>

            <h3 style={{ margin: "0 0 20px", fontSize: 19, fontWeight: 800, color: "#1B5E20" }}>
              Your Plan's Impact
            </h3>

            {future == null ? (
              <p style={{ color: "#888", fontSize: 14, margin: 0 }}>
                Generate a plan on the Score page to see your impact here.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

                {/* Eco Score */}
                <div style={popupRow}>
                  <span style={popupLabel}>Eco Score</span>
                  <span style={popupValue}>
                    {baseScore} <span style={{ color: "#aaa" }}>→</span>{" "}
                    <strong style={{ color: "#2E7D32" }}>{updatedScore ?? "—"}</strong>
                    {scoreDelta != null && (
                      <span style={{ color: scoreDelta >= 0 ? "#2E7D32" : "#c0392b", fontSize: 12, marginLeft: 6 }}>
                        ({scoreDelta >= 0 ? "+" : ""}{scoreDelta} pts)
                      </span>
                    )}
                  </span>
                </div>

                {/* CO2 */}
                {annualCO2 != null && (
                  <div style={popupRow}>
                    <span style={popupLabel}>CO₂ Reduction</span>
                    <span style={popupValue}>
                      <strong style={{ color: "#2E7D32" }}>{annualCO2.toLocaleString()} kg</strong>
                      <span style={{ color: "#888", fontSize: 12 }}> / yr</span>
                      {percentReduction != null && (
                        <span style={{ color: "#888", fontSize: 12 }}> · {percentReduction}% less</span>
                      )}
                    </span>
                  </div>
                )}

                {/* Cost savings */}
                {annualSavings != null && annualSavings > 0 && (
                  <div style={{ ...popupRow, borderBottom: "none" }}>
                    <span style={popupLabel}>Energy Savings (yr {horizonYears})</span>
                    <span style={popupValue}>
                      <strong style={{ color: "#2E7D32" }}>${annualSavings.toLocaleString()}</strong>
                      <span style={{ color: "#888", fontSize: 12 }}> / yr</span>
                    </span>
                  </div>
                )}


              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const popupRow = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "13px 0", borderBottom: "1px solid #f0f0f0",
};
const popupLabel = { fontSize: 13, color: "#555", fontWeight: 600 };
const popupValue = { fontSize: 14, color: "#222", textAlign: "right" };
